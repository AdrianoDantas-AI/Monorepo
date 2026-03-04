import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import type {
  AiActionProposalDTOv1,
  CashflowDTOv1,
  ForecastDTOv1,
  PatrimonyDTOv1,
  ScreenName,
  UserSessionDTOv1,
} from "@consoledegastos/contracts";
import { buildScreenInsights, createActionExecution, createActionProposal } from "@consoledegastos/domain";
import { createRuntimeStore, type RuntimeStore } from "./store.js";
import {
  createMemoryPersistenceAdapter,
  type PersistenceAdapter,
  type PersistenceMode,
} from "./persistence.js";

export interface ApiServerRuntime {
  baseUrl: string;
  store: RuntimeStore;
  persistence_mode: PersistenceMode;
  close: () => Promise<void>;
}

export interface StartApiServerOptions {
  persistence?: PersistenceAdapter;
  host?: string;
}

const screenSet: Set<ScreenName> = new Set([
  "dashboard",
  "transactions",
  "recurrents",
  "cashflow",
  "accounts",
  "invoices",
  "categories",
  "forecast",
  "patrimony",
  "reports",
]);

const actionSet: Set<AiActionProposalDTOv1["action_type"]> = new Set([
  "recategorize_transaction",
  "update_category_limit",
  "mark_recurring_confirmed",
  "generate_report",
  "create_cashflow_alert",
]);

const nowIso = () => new Date().toISOString();

const sendJson = (res: ServerResponse, status: number, payload: unknown): void => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const readBody = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return {};
  }

  return {};
};

const parseString = (value: unknown): string | null => (typeof value === "string" && value.length > 0 ? value : null);
const parseNumber = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null);
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};
const parsePositiveInt = (value: string | null, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
};

const buildDashboard = (store: RuntimeStore) => {
  const expenses = store.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount_brl, 0);
  const incomes = store.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount_brl, 0);
  const patrimony = store.accounts.reduce((sum, item) => sum + item.balance_brl, 0);

  return {
    spending_rhythm_brl: Number(expenses.toFixed(2)),
    patrimony_brl: Number(patrimony.toFixed(2)),
    partial_result_brl: Number((incomes - expenses).toFixed(2)),
  };
};

const buildCashflow = (store: RuntimeStore, period: string): CashflowDTOv1 => {
  const expenses = store.transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount_brl, 0);
  const incomes = store.transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount_brl, 0);
  const variation = expenses === 0 ? 0 : Number((((incomes - expenses) / expenses) * 100).toFixed(2));

  return {
    period,
    expenses_brl: Number(expenses.toFixed(2)),
    incomes_brl: Number(incomes.toFixed(2)),
    variation_pct: variation,
  };
};

const buildPatrimony = (store: RuntimeStore): PatrimonyDTOv1 => {
  const assets = store.accounts.filter((item) => item.balance_brl >= 0).reduce((sum, item) => sum + item.balance_brl, 0);
  const debts = Math.abs(store.accounts.filter((item) => item.balance_brl < 0).reduce((sum, item) => sum + item.balance_brl, 0));

  return {
    net_worth_brl: Number((assets - debts).toFixed(2)),
    assets_brl: Number(assets.toFixed(2)),
    debts_brl: Number(debts.toFixed(2)),
  };
};

const buildForecast = (store: RuntimeStore, scenario: ForecastDTOv1["scenario"]): ForecastDTOv1 => {
  const patrimony = buildPatrimony(store);
  const modifier = scenario === "optimistic" ? 1.15 : scenario === "conservative" ? 0.9 : 1;
  const projected = Number((patrimony.net_worth_brl * modifier).toFixed(2));

  return {
    scenario,
    horizon_months: 12,
    month_end_balance_brl: projected,
    confidence_range_brl: [Number((projected * 0.9).toFixed(2)), Number((projected * 1.1).toFixed(2))],
  };
};

const applyAiAction = (store: RuntimeStore, proposal: AiActionProposalDTOv1): Record<string, unknown> => {
  if (proposal.action_type === "recategorize_transaction") {
    const txId = parseString(proposal.payload.transaction_id);
    const targetCategory = parseString(proposal.payload.target_category);
    if (!txId || !targetCategory) {
      return { applied: false, reason: "missing transaction_id or target_category" };
    }

    const tx = store.transactions.find((item) => item.id === txId);
    if (!tx) {
      return { applied: false, reason: "transaction not found" };
    }

    tx.category = targetCategory;
    return { applied: true, transaction_id: tx.id, category: tx.category };
  }

  if (proposal.action_type === "update_category_limit") {
    const categoryId = parseString(proposal.payload.category_id);
    const newLimit = parseNumber(proposal.payload.new_limit_brl);
    if (!categoryId || newLimit === null) {
      return { applied: false, reason: "missing category_id or new_limit_brl" };
    }

    const category = store.categories.find((item) => item.id === categoryId);
    if (!category) {
      return { applied: false, reason: "category not found" };
    }

    category.monthly_limit_brl = newLimit;
    return { applied: true, category_id: category.id, monthly_limit_brl: category.monthly_limit_brl };
  }

  if (proposal.action_type === "mark_recurring_confirmed") {
    const recurringId = parseString(proposal.payload.recurring_id);
    if (!recurringId) {
      return { applied: false, reason: "missing recurring_id" };
    }

    const recurring = store.recurrents.find((item) => item.id === recurringId);
    if (!recurring) {
      return { applied: false, reason: "recurring not found" };
    }

    recurring.confirmed = true;
    return { applied: true, recurring_id: recurring.id, confirmed: recurring.confirmed };
  }

  if (proposal.action_type === "generate_report") {
    const format: "csv" | "pdf" = parseString(proposal.payload.format) === "pdf" ? "pdf" : "csv";
    const job = { id: `rep_${randomUUID()}`, status: "done" as const, format, created_at: nowIso() };
    store.report_jobs.push(job);
    return { applied: true, report_job_id: job.id, format: job.format };
  }

  const alert = {
    id: `alert_${randomUUID()}`,
    kind: "cashflow",
    message: "Alerta criado pela IA para monitoramento de fluxo de caixa.",
    created_at: nowIso(),
  };
  store.alerts.push(alert);
  return { applied: true, alert_id: alert.id };
};

const createRequestHandler =
  (store: RuntimeStore, persist: () => Promise<void>, persistenceMode: PersistenceMode) =>
  async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const pathname = url.pathname;

  if (pathname === "/health" && method === "GET") {
    sendJson(res, 200, { status: "ok", service: "consoledegastos-api" });
    return;
  }

  if (pathname === "/ops/persistence" && method === "GET") {
    sendJson(res, 200, { data: { mode: persistenceMode } });
    return;
  }

  if (pathname === "/api/v1/auth/google/start" && method === "POST") {
    sendJson(res, 200, {
      data: {
        state: randomUUID(),
        auth_url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=consoledegastos",
      },
    });
    return;
  }

  if (pathname === "/api/v1/auth/google/callback" && method === "GET") {
    const session: UserSessionDTOv1 = {
      id: `sess_${randomUUID()}`,
      user_id: "user_1",
      provider: "google",
      created_at: nowIso(),
    };
    store.sessions.push(session);
    await persist();
    sendJson(res, 200, { data: session, code: url.searchParams.get("code") ?? null });
    return;
  }

  if (pathname === "/api/v1/auth/magic-link/request" && method === "POST") {
    const body = await readBody(req);
    sendJson(res, 200, {
      data: {
        request_id: `mlr_${randomUUID()}`,
        email: parseString(body.email) ?? "unknown@example.com",
        preview_token: `mlt_${randomUUID()}`,
      },
    });
    return;
  }

  if (pathname === "/api/v1/auth/magic-link/verify" && method === "POST") {
    const session: UserSessionDTOv1 = {
      id: `sess_${randomUUID()}`,
      user_id: "user_1",
      provider: "magic_link",
      created_at: nowIso(),
    };
    store.sessions.push(session);
    await persist();
    sendJson(res, 200, { data: session });
    return;
  }

  if (pathname === "/api/v1/auth/logout" && method === "POST") {
    store.sessions.length = 0;
    await persist();
    sendJson(res, 200, { data: { logged_out: true } });
    return;
  }

  if (pathname === "/api/v1/auth/session" && method === "GET") {
    const sessionId = req.headers["x-session-id"];
    const target = typeof sessionId === "string" ? store.sessions.find((item) => item.id === sessionId) : store.sessions.at(-1);
    sendJson(res, 200, { data: target ?? null });
    return;
  }

  if (pathname === "/api/v1/openfinance/connect-token" && method === "POST") {
    sendJson(res, 200, {
      data: {
        connect_token: `pluggy_${randomUUID()}`,
        expires_in_s: 300,
      },
    });
    return;
  }

  if (pathname === "/api/v1/openfinance/connect/callback" && method === "POST") {
    const body = await readBody(req);
    const institution = parseString(body.institution) ?? "Nubank";
    const connection = {
      id: `conn_${randomUUID()}`,
      institution,
      status: "processing" as const,
      progress_pct: 56,
      updated_at: nowIso(),
    };
    store.open_finance_connections.push(connection);
    await persist();
    sendJson(res, 201, { data: connection });
    return;
  }

  if (pathname === "/api/v1/openfinance/connections" && method === "GET") {
    sendJson(res, 200, { data: store.open_finance_connections });
    return;
  }

  const openFinanceSyncMatch = pathname.match(/^\/api\/v1\/openfinance\/connections\/([^/]+)\/sync$/);
  if (openFinanceSyncMatch && method === "POST") {
    const targetId = openFinanceSyncMatch[1];
    const target = store.open_finance_connections.find((item) => item.id === targetId);
    if (!target) {
      sendJson(res, 404, { error: "connection_not_found" });
      return;
    }

    target.progress_pct = 100;
    target.status = "active";
    target.updated_at = nowIso();
    await persist();

    sendJson(res, 200, {
      data: target,
      events: ["openfinance.sync.started.v1", "openfinance.sync.completed.v1"],
    });
    return;
  }

  const openFinanceStatusMatch = pathname.match(/^\/api\/v1\/openfinance\/connections\/([^/]+)\/status$/);
  if (openFinanceStatusMatch && method === "GET") {
    const target = store.open_finance_connections.find((item) => item.id === openFinanceStatusMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "connection_not_found" });
      return;
    }

    sendJson(res, 200, { data: target });
    return;
  }

  const openFinanceDeleteMatch = pathname.match(/^\/api\/v1\/openfinance\/connections\/([^/]+)$/);
  if (openFinanceDeleteMatch && method === "DELETE") {
    const before = store.open_finance_connections.length;
    store.open_finance_connections = store.open_finance_connections.filter((item) => item.id !== openFinanceDeleteMatch[1]);
    await persist();
    sendJson(res, 200, { data: { removed: before !== store.open_finance_connections.length } });
    return;
  }

  if (pathname === "/api/v1/openfinance/webhooks" && method === "POST") {
    const body = await readBody(req);
    const eventId = parseString(body.event_id);
    if (!eventId) {
      sendJson(res, 400, { error: "missing_event_id" });
      return;
    }

    if (store.processed_openfinance_webhook_event_ids.includes(eventId)) {
      sendJson(res, 200, {
        data: { received: true, duplicate: true, event: "openfinance.sync.progress.v1", event_id: eventId },
      });
      return;
    }

    const connectionId = parseString(body.connection_id);
    const status = parseString(body.status);

    if (connectionId && status) {
      const target = store.open_finance_connections.find((item) => item.id === connectionId);
      if (target) {
        target.status = status === "error" ? "error" : "active";
        target.progress_pct = target.status === "active" ? 100 : target.progress_pct;
        target.updated_at = nowIso();
      }
    }

    store.processed_openfinance_webhook_event_ids.push(eventId);
    await persist();

    sendJson(res, 200, {
      data: { received: true, duplicate: false, event: "openfinance.sync.progress.v1", event_id: eventId },
    });
    return;
  }

  if (pathname === "/api/v1/dashboard" && method === "GET") {
    sendJson(res, 200, { data: buildDashboard(store) });
    return;
  }

  if (pathname === "/api/v1/transactions" && method === "GET") {
    const categoryFilter = url.searchParams.get("category");
    const typeFilter = url.searchParams.get("type");
    const searchQuery = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const sort = url.searchParams.get("sort") ?? "date_desc";
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("page_size"), 15), 100);

    let rows = [...store.transactions];
    if (categoryFilter) {
      rows = rows.filter((item) => item.category === categoryFilter);
    }
    if (typeFilter === "income" || typeFilter === "expense") {
      rows = rows.filter((item) => item.type === typeFilter);
    }
    if (searchQuery) {
      rows = rows.filter((item) => item.description.toLowerCase().includes(searchQuery));
    }

    rows.sort((left, right) => {
      if (sort === "amount_asc") {
        return left.amount_brl - right.amount_brl;
      }
      if (sort === "amount_desc") {
        return right.amount_brl - left.amount_brl;
      }
      if (sort === "date_asc") {
        return left.date.localeCompare(right.date);
      }
      return right.date.localeCompare(left.date);
    });

    const total = rows.length;
    const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
    const normalizedPage = Math.min(page, totalPages);
    const start = (normalizedPage - 1) * pageSize;
    const end = start + pageSize;
    const pagedRows = rows.slice(start, end);

    sendJson(res, 200, {
      data: pagedRows,
      total,
      page: normalizedPage,
      page_size: pageSize,
      total_pages: totalPages,
      sort,
      q: searchQuery,
    });
    return;
  }

  if (pathname === "/api/v1/transactions/manual" && method === "POST") {
    const body = await readBody(req);
    const transactionType: "income" | "expense" = parseString(body.type) === "income" ? "income" : "expense";
    const transaction = {
      id: `tx_${randomUUID()}`,
      description: parseString(body.description) ?? "Manual transaction",
      amount_brl: parseNumber(body.amount_brl) ?? 0,
      type: transactionType,
      category: parseString(body.category) ?? "uncategorized",
      account_id: parseString(body.account_id) ?? "acc_bank_1",
      date: parseString(body.date) ?? nowIso(),
    };
    store.transactions.push(transaction);
    await persist();
    sendJson(res, 201, { data: transaction });
    return;
  }

  const txCategoryMatch = pathname.match(/^\/api\/v1\/transactions\/([^/]+)\/category$/);
  if (txCategoryMatch && method === "PATCH") {
    const body = await readBody(req);
    const target = store.transactions.find((item) => item.id === txCategoryMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "transaction_not_found" });
      return;
    }

    const category = parseString(body.category);
    if (!category) {
      sendJson(res, 400, { error: "invalid_category" });
      return;
    }

    target.category = category;
    await persist();
    sendJson(res, 200, { data: target });
    return;
  }

  if (pathname === "/api/v1/recurrents" && method === "GET") {
    const type = url.searchParams.get("type");
    const rows = type === "income" || type === "expense" ? store.recurrents.filter((item) => item.type === type) : store.recurrents;
    sendJson(res, 200, { data: rows, total: rows.length });
    return;
  }

  const recurringPatchMatch = pathname.match(/^\/api\/v1\/recurrents\/([^/]+)$/);
  if (recurringPatchMatch && method === "PATCH") {
    const target = store.recurrents.find((item) => item.id === recurringPatchMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "recurring_not_found" });
      return;
    }

    const body = await readBody(req);
    const confirmedValue = body.confirmed;
    if (typeof confirmedValue === "boolean") {
      target.confirmed = confirmedValue;
    }

    await persist();
    sendJson(res, 200, { data: target });
    return;
  }

  if (pathname === "/api/v1/cashflow" && method === "GET") {
    const period = url.searchParams.get("period") ?? "last_3_months";
    sendJson(res, 200, { data: buildCashflow(store, period) });
    return;
  }

  if (pathname === "/api/v1/accounts" && method === "GET") {
    sendJson(res, 200, { data: store.accounts, total: store.accounts.length });
    return;
  }

  const accountMatch = pathname.match(/^\/api\/v1\/accounts\/([^/]+)$/);
  if (accountMatch && method === "GET") {
    const target = store.accounts.find((item) => item.id === accountMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "account_not_found" });
      return;
    }

    sendJson(res, 200, { data: target });
    return;
  }

  if (accountMatch && method === "PATCH") {
    const target = store.accounts.find((item) => item.id === accountMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "account_not_found" });
      return;
    }

    const body = await readBody(req);
    const name = parseString(body.name);
    if (name) {
      target.name = name;
    }

    await persist();
    sendJson(res, 200, { data: target });
    return;
  }

  if (pathname === "/api/v1/invoices" && method === "GET") {
    sendJson(res, 200, { data: store.invoices, total: store.invoices.length });
    return;
  }

  const invoiceTxMatch = pathname.match(/^\/api\/v1\/invoices\/([^/]+)\/transactions$/);
  if (invoiceTxMatch && method === "GET") {
    sendJson(res, 200, {
      data: store.transactions.filter((item) => item.type === "expense"),
      invoice_id: invoiceTxMatch[1],
    });
    return;
  }

  if (pathname === "/api/v1/categories" && method === "GET") {
    sendJson(res, 200, { data: store.categories, total: store.categories.length });
    return;
  }

  if (pathname === "/api/v1/categories" && method === "POST") {
    const body = await readBody(req);
    const category = {
      id: `cat_${randomUUID()}`,
      name: parseString(body.name) ?? "new_category",
      monthly_limit_brl: parseNumber(body.monthly_limit_brl) ?? 0,
      spent_brl: 0,
    };

    store.categories.push(category);
    await persist();
    sendJson(res, 201, { data: category });
    return;
  }

  const categoryPatchMatch = pathname.match(/^\/api\/v1\/categories\/([^/]+)$/);
  if (categoryPatchMatch && method === "PATCH") {
    const target = store.categories.find((item) => item.id === categoryPatchMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "category_not_found" });
      return;
    }

    const body = await readBody(req);
    const name = parseString(body.name);
    const limit = parseNumber(body.monthly_limit_brl);
    if (name) {
      target.name = name;
    }
    if (limit !== null) {
      target.monthly_limit_brl = limit;
    }

    await persist();
    sendJson(res, 200, { data: target });
    return;
  }

  if (pathname === "/api/v1/forecast" && method === "GET") {
    const scenarioQuery = url.searchParams.get("scenario");
    const scenario = scenarioQuery === "optimistic" || scenarioQuery === "conservative" ? scenarioQuery : "base";
    sendJson(res, 200, { data: buildForecast(store, scenario) });
    return;
  }

  if (pathname === "/api/v1/patrimony" && method === "GET") {
    sendJson(res, 200, { data: buildPatrimony(store) });
    return;
  }

  if (pathname === "/api/v1/reports/export" && method === "POST") {
    const body = await readBody(req);
    const format: "csv" | "pdf" = parseString(body.format) === "pdf" ? "pdf" : "csv";
    const job = {
      id: `rep_${randomUUID()}`,
      status: "done" as const,
      format,
      created_at: nowIso(),
    };

    store.report_jobs.push(job);
    await persist();
    sendJson(res, 202, { data: job });
    return;
  }

  if (pathname === "/api/v1/reports" && method === "GET") {
    sendJson(res, 200, { data: store.report_jobs, total: store.report_jobs.length });
    return;
  }

  const reportMatch = pathname.match(/^\/api\/v1\/reports\/([^/]+)$/);
  if (reportMatch && method === "GET") {
    const target = store.report_jobs.find((item) => item.id === reportMatch[1]);
    if (!target) {
      sendJson(res, 404, { error: "report_not_found" });
      return;
    }

    sendJson(res, 200, { data: target });
    return;
  }

  if (pathname === "/api/v1/ai/sessions" && method === "POST") {
    const body = await readBody(req);
    const screen = parseString(body.screen) ?? "dashboard";
    const aiSession = {
      id: `ais_${randomUUID()}`,
      screen,
      messages: [] as Array<{ role: "user" | "assistant"; text: string; created_at: string }>,
    };

    store.ai_sessions.push(aiSession);
    await persist();
    sendJson(res, 201, { data: aiSession });
    return;
  }

  const aiMessagesMatch = pathname.match(/^\/api\/v1\/ai\/sessions\/([^/]+)\/messages$/);
  if (aiMessagesMatch && method === "POST") {
    const aiSession = store.ai_sessions.find((item) => item.id === aiMessagesMatch[1]);
    if (!aiSession) {
      sendJson(res, 404, { error: "ai_session_not_found" });
      return;
    }

    const body = await readBody(req);
    const userMessage = parseString(body.message) ?? "Analise minha tela atual.";

    aiSession.messages.push({ role: "user", text: userMessage, created_at: nowIso() });

    const screen = screenSet.has(aiSession.screen as ScreenName) ? (aiSession.screen as ScreenName) : "dashboard";
    const insights = buildScreenInsights(screen);
    const answer = insights.at(0)?.message ?? "Nenhum insight encontrado.";

    aiSession.messages.push({ role: "assistant", text: answer, created_at: nowIso() });
    await persist();

    sendJson(res, 200, {
      data: {
        response: answer,
        mode: parseString(body.mode) ?? "quick-insight",
        insights,
      },
    });
    return;
  }

  if (pathname === "/api/v1/ai/insights" && method === "GET") {
    const screenRaw = url.searchParams.get("screen");
    if (!screenRaw || !screenSet.has(screenRaw as ScreenName)) {
      sendJson(res, 400, { error: "invalid_screen" });
      return;
    }

    sendJson(res, 200, {
      data: buildScreenInsights(screenRaw as ScreenName),
      event: "ai.insight.generated.v1",
    });
    return;
  }

  if (pathname === "/api/v1/ai/actions/preview" && method === "POST") {
    const body = await readBody(req);
    const actionTypeRaw = parseString(body.action_type);

    if (!actionTypeRaw || !actionSet.has(actionTypeRaw as AiActionProposalDTOv1["action_type"])) {
      sendJson(res, 400, { error: "invalid_action_type" });
      return;
    }

    const proposal = createActionProposal(
      `aip_${randomUUID()}`,
      actionTypeRaw as AiActionProposalDTOv1["action_type"],
      asRecord(body.payload),
    );
    store.ai_action_proposals.push(proposal);
    await persist();

    sendJson(res, 201, {
      data: proposal,
      event: "ai.action.proposed.v1",
    });
    return;
  }

  const aiConfirmMatch = pathname.match(/^\/api\/v1\/ai\/actions\/([^/]+)\/confirm$/);
  if (aiConfirmMatch && method === "POST") {
    const proposal = store.ai_action_proposals.find((item) => item.id === aiConfirmMatch[1]);
    if (!proposal) {
      sendJson(res, 404, { error: "action_proposal_not_found" });
      return;
    }

    if (proposal.status === "executed") {
      sendJson(res, 409, { error: "action_already_executed" });
      return;
    }

    const result = applyAiAction(store, proposal);
    proposal.status = "executed";

    const execution = createActionExecution(`aie_${randomUUID()}`, proposal.id, result);
    store.ai_action_executions.push(execution);
    await persist();

    sendJson(res, 200, {
      data: execution,
      event: "ai.action.executed.v1",
    });
    return;
  }

  const aiActionGetMatch = pathname.match(/^\/api\/v1\/ai\/actions\/([^/]+)$/);
  if (aiActionGetMatch && method === "GET") {
    const proposal = store.ai_action_proposals.find((item) => item.id === aiActionGetMatch[1]);
    if (!proposal) {
      sendJson(res, 404, { error: "action_proposal_not_found" });
      return;
    }

    const execution = store.ai_action_executions.find((item) => item.proposal_id === proposal.id) ?? null;
    sendJson(res, 200, { data: { proposal, execution } });
    return;
  }

  if (pathname === "/api/v1/ai/feedback" && method === "POST") {
    const body = await readBody(req);
    const score = parseNumber(body.score) ?? 0;
    const comment = parseString(body.comment) ?? "";

    store.feedbacks.push({ id: `fb_${randomUUID()}`, score, comment, created_at: nowIso() });
    await persist();

    sendJson(res, 202, { data: { accepted: true } });
    return;
  }

  sendJson(res, 404, { error: "not_found", path: pathname, method });
};

export const startApiServer = async (port = 0, options: StartApiServerOptions = {}): Promise<ApiServerRuntime> => {
  const persistence = options.persistence ?? createMemoryPersistenceAdapter(createRuntimeStore());
  const host = options.host ?? "127.0.0.1";
  const store = await persistence.load();
  const server = createServer(createRequestHandler(store, () => persistence.save(store), persistence.mode));

  server.listen(port, host);
  await once(server, "listening");

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("unable_to_resolve_server_address");
  }

  return {
    baseUrl: `http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${address.port}`,
    store,
    persistence_mode: persistence.mode,
    close: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      await persistence.close();
    },
  };
};
