import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  buildTransactionsCsv,
  createManualTransaction,
  getOpenFinanceConnectionStatus,
  loadDashboardViewData,
  loadTransactionsViewData,
  parseTransactionFiltersFromQuery,
  recategorizeTransaction,
  startOpenFinanceConnection,
  syncOpenFinanceConnection,
  type DashboardModalState,
  type DashboardPeriod,
  type DashboardUiState,
} from "./api.js";
import { defaultProtectedPath, findWebRoute, isProtectedPath } from "./routes.js";
import {
  renderComponentSandboxPage,
  renderDashboardPage,
  renderLoginPage,
  renderModulePage,
  renderNotFoundPage,
  renderTransactionsPage,
} from "./pages.js";
import { resolveSessionFromRequest, runLoginProvider, runLogout } from "./session.js";

export interface StartWebServerOptions {
  port?: number;
  host?: string;
  apiBaseUrl?: string;
}

export interface WebServerRuntime {
  baseUrl: string;
  close: () => Promise<void>;
}

const sendHtml = (res: ServerResponse, status: number, html: string): void => {
  res.statusCode = status;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.end(html);
};

const sendJson = (res: ServerResponse, status: number, payload: unknown): void => {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const redirect = (res: ServerResponse, location: string, cookieHeader?: string): void => {
  res.statusCode = 302;
  res.setHeader("location", location);
  if (cookieHeader) {
    res.setHeader("set-cookie", cookieHeader);
  }
  res.end();
};

const sessionCookie = (sessionId: string): string =>
  `cdg_session_id=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000`;
const clearSessionCookie = "cdg_session_id=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0";

const readFormBody = async (req: IncomingMessage): Promise<URLSearchParams> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return new URLSearchParams(raw);
};

const parseFormString = (body: URLSearchParams, key: string): string => (body.get(key) ?? "").trim();

const normalizeReturnTo = (raw: string | null): string => {
  if (!raw || !raw.startsWith("/app/transactions")) {
    return "/app/transactions";
  }

  const url = new URL(raw, "http://127.0.0.1");
  url.searchParams.delete("notice");
  url.searchParams.delete("create");
  url.searchParams.delete("exporting");
  const query = url.searchParams.toString();
  return query.length > 0 ? `${url.pathname}?${query}` : url.pathname;
};

const withNotice = (returnTo: string, notice: string): string => {
  const url = new URL(returnTo, "http://127.0.0.1");
  url.searchParams.set("notice", notice);
  const query = url.searchParams.toString();
  return query.length > 0 ? `${url.pathname}?${query}` : url.pathname;
};

const parseDashboardPeriod = (raw: string | null): DashboardPeriod => {
  if (raw === "7d" || raw === "90d" || raw === "ytd") {
    return raw;
  }
  return "30d";
};

const parseDashboardUiState = (raw: string | null): DashboardUiState => {
  if (raw === "loading" || raw === "error") {
    return raw;
  }
  return "ready";
};

const parseDashboardModalState = (raw: string | null): DashboardModalState | null => {
  if (raw === "authenticating" || raw === "success" || raw === "error") {
    return raw;
  }
  return null;
};

const buildDashboardLocation = (params: {
  period: DashboardPeriod;
  modal?: DashboardModalState;
  connectionId?: string;
  state?: DashboardUiState;
}): string => {
  const search = new URLSearchParams();
  search.set("period", params.period);
  if (params.modal) {
    search.set("modal", params.modal);
  }
  if (params.connectionId) {
    search.set("connection_id", params.connectionId);
  }
  if (params.state) {
    search.set("state", params.state);
  }
  return `/app/dashboard?${search.toString()}`;
};

const renderDashboard = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const period = parseDashboardPeriod(url.searchParams.get("period"));
  let state = parseDashboardUiState(url.searchParams.get("state"));
  const modalState = parseDashboardModalState(url.searchParams.get("modal"));
  const connectionId = url.searchParams.get("connection_id");

  let data = null;
  let errorMessage: string | null = null;

  if (state !== "loading") {
    try {
      data = await loadDashboardViewData(apiBaseUrl, period);
    } catch {
      state = "error";
      errorMessage = "Erro ao buscar dados da dashboard e das conexoes Open Finance.";
    }
  }

  const modalConnection =
    connectionId && data
      ? (data.connections.find((connection) => connection.id === connectionId) ?? null)
      : connectionId
        ? await getOpenFinanceConnectionStatus(apiBaseUrl, connectionId)
        : null;

  sendHtml(
    res,
    200,
    renderDashboardPage(session, {
      period,
      state,
      data,
      modalState,
      modalConnection,
      errorMessage,
    }),
  );
};

const renderTransactions = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const state = parseDashboardUiState(url.searchParams.get("state"));
  const showCreateForm = url.searchParams.get("create") === "1";
  const exporting = url.searchParams.get("exporting") === "1";
  const notice = url.searchParams.get("notice");
  const filters = parseTransactionFiltersFromQuery(url);

  const cleanCurrent = new URL(url.pathname + url.search, "http://127.0.0.1");
  cleanCurrent.searchParams.delete("notice");
  cleanCurrent.searchParams.delete("create");
  cleanCurrent.searchParams.delete("exporting");
  const cleanQuery = cleanCurrent.searchParams.toString();
  const returnTo = cleanQuery.length > 0 ? `${cleanCurrent.pathname}?${cleanQuery}` : cleanCurrent.pathname;

  try {
    const data = state === "loading" ? null : await loadTransactionsViewData(apiBaseUrl, filters);
    sendHtml(
      res,
      200,
      renderTransactionsPage(session, {
        state,
        data,
        errorMessage: null,
        notice,
        showCreateForm,
        exporting,
        returnTo,
      }),
    );
    return;
  } catch {
    sendHtml(
      res,
      200,
      renderTransactionsPage(session, {
        state: "error",
        data: null,
        errorMessage: "Nao foi possivel carregar as transacoes com os filtros atuais.",
        notice,
        showCreateForm,
        exporting,
        returnTo,
      }),
    );
    return;
  }
};

const handleTransactionCreate = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const body = await readFormBody(req);
  const description = parseFormString(body, "description");
  const amountRaw = parseFormString(body, "amount_brl");
  const typeRaw = parseFormString(body, "type");
  const category = parseFormString(body, "category");
  const accountId = parseFormString(body, "account_id");
  const dateRaw = parseFormString(body, "date");
  const returnTo = normalizeReturnTo(body.get("return_to"));

  const amount = Number.parseFloat(amountRaw.replace(",", "."));
  const type = typeRaw === "income" ? "income" : "expense";
  const parsedDate = new Date(dateRaw);
  const date = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();

  if (!description || !Number.isFinite(amount) || !category || !accountId) {
    redirect(res, withNotice(returnTo, "Dados invalidos para criar transacao."));
    return;
  }

  try {
    await createManualTransaction(apiBaseUrl, {
      description,
      amount_brl: Number(amount.toFixed(2)),
      type,
      category,
      account_id: accountId,
      date,
    });
    redirect(res, withNotice(returnTo, "Transacao criada com sucesso."));
    return;
  } catch {
    redirect(res, withNotice(returnTo, "Falha ao criar transacao manual."));
    return;
  }
};

const handleTransactionRecategorize = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const body = await readFormBody(req);
  const txId = parseFormString(body, "tx_id");
  const category = parseFormString(body, "category");
  const returnTo = normalizeReturnTo(body.get("return_to"));

  if (!txId || !category) {
    redirect(res, withNotice(returnTo, "Dados invalidos para recategorizacao."));
    return;
  }

  try {
    await recategorizeTransaction(apiBaseUrl, txId, category);
    redirect(res, withNotice(returnTo, "Transacao recategorizada."));
    return;
  } catch {
    redirect(res, withNotice(returnTo, "Falha na recategorizacao."));
    return;
  }
};

const handleTransactionsExportCsv = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const filters = parseTransactionFiltersFromQuery(url);

  try {
    const csv = await buildTransactionsCsv(apiBaseUrl, filters);
    const filename = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    res.statusCode = 200;
    res.setHeader("content-type", "text/csv; charset=utf-8");
    res.setHeader("content-disposition", `attachment; filename="${filename}"`);
    res.end(csv);
    return;
  } catch {
    redirect(res, withNotice("/app/transactions", "Falha ao exportar CSV."));
    return;
  }
};

const handleOpenFinanceStart = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const period = parseDashboardPeriod(url.searchParams.get("period"));
  const institution = url.searchParams.get("institution") ?? "Nubank";

  try {
    const connection = await startOpenFinanceConnection(apiBaseUrl, institution);
    redirect(
      res,
      buildDashboardLocation({
        period,
        modal: "authenticating",
        connectionId: connection.id,
      }),
    );
    return;
  } catch {
    redirect(
      res,
      buildDashboardLocation({
        period,
        modal: "error",
      }),
    );
    return;
  }
};

const handleOpenFinanceSync = async (
  req: IncomingMessage,
  res: ServerResponse,
  apiBaseUrl: string,
): Promise<void> => {
  const session = await resolveSessionFromRequest(req, apiBaseUrl);
  if (!session) {
    redirect(res, "/login");
    return;
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const period = parseDashboardPeriod(url.searchParams.get("period"));
  const connectionId = url.searchParams.get("connection_id");

  if (!connectionId) {
    redirect(
      res,
      buildDashboardLocation({
        period,
        modal: "error",
      }),
    );
    return;
  }

  try {
    const connection = await syncOpenFinanceConnection(apiBaseUrl, connectionId);
    redirect(
      res,
      buildDashboardLocation({
        period,
        modal: "success",
        connectionId: connection.id,
      }),
    );
    return;
  } catch {
    redirect(
      res,
      buildDashboardLocation({
        period,
        modal: "error",
        connectionId,
      }),
    );
    return;
  }
};

const createRequestHandler =
  (apiBaseUrl: string) =>
  async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const method = req.method ?? "GET";
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    if (pathname === "/health" && method === "GET") {
      sendJson(res, 200, { status: "ok", app: "consoledegastos-web" });
      return;
    }

    if (pathname === "/login" && method === "GET") {
      const provider = url.searchParams.get("provider");
      if (provider) {
        const session = await runLoginProvider(provider, apiBaseUrl);
        if (!session) {
          sendHtml(res, 200, renderLoginPage("Nao foi possivel iniciar o login. Tente novamente."));
          return;
        }

        redirect(res, defaultProtectedPath, sessionCookie(session.id));
        return;
      }

      sendHtml(res, 200, renderLoginPage());
      return;
    }

    if (pathname === "/logout" && method === "GET") {
      await runLogout(apiBaseUrl);
      redirect(res, "/login", clearSessionCookie);
      return;
    }

    if (pathname === "/") {
      const session = await resolveSessionFromRequest(req, apiBaseUrl);
      redirect(res, session ? defaultProtectedPath : "/login");
      return;
    }

    const session = await resolveSessionFromRequest(req, apiBaseUrl);
    if (isProtectedPath(pathname) && !session) {
      redirect(res, "/login");
      return;
    }

    if (pathname === "/app/dashboard/connect/start" && method === "GET") {
      await handleOpenFinanceStart(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/app/dashboard/connect/sync" && method === "GET") {
      await handleOpenFinanceSync(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/app/dashboard" && method === "GET") {
      await renderDashboard(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/app/transactions/create" && method === "POST") {
      await handleTransactionCreate(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/app/transactions/recategorize" && method === "POST") {
      await handleTransactionRecategorize(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/app/transactions/export.csv" && method === "GET") {
      await handleTransactionsExportCsv(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/app/transactions" && method === "GET") {
      await renderTransactions(req, res, apiBaseUrl);
      return;
    }

    if (pathname === "/sandbox/components" && method === "GET") {
      if (!session) {
        redirect(res, "/login");
        return;
      }
      sendHtml(res, 200, renderComponentSandboxPage(session));
      return;
    }

    if (pathname === "/app" && method === "GET") {
      redirect(res, defaultProtectedPath);
      return;
    }

    const route = findWebRoute(pathname);
    if (route && method === "GET") {
      if (!session) {
        redirect(res, "/login");
        return;
      }
      sendHtml(res, 200, renderModulePage(route, session));
      return;
    }

    sendHtml(res, 404, renderNotFoundPage(session));
  };

export const startWebServer = async (options: StartWebServerOptions = {}): Promise<WebServerRuntime> => {
  const rawPort = options.port ?? Number.parseInt(process.env.PORT ?? "4020", 10);
  const port = Number.isNaN(rawPort) ? 4020 : rawPort;
  const host = options.host ?? process.env.HOST ?? "0.0.0.0";
  const apiBaseUrl = options.apiBaseUrl ?? process.env.API_BASE_URL ?? "http://api:4010";

  const server = createServer(createRequestHandler(apiBaseUrl));
  server.listen(port, host);
  await once(server, "listening");

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("web_server_address_unavailable");
  }

  const urlHost = address.address === "::" ? "127.0.0.1" : address.address;

  return {
    baseUrl: `http://${urlHost}:${address.port}`,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
};

const maybeStartStandalone = async (): Promise<void> => {
  const entryArg = process.argv[1];
  if (!entryArg) {
    return;
  }

  if (fileURLToPath(import.meta.url) !== resolve(entryArg)) {
    return;
  }

  const runtime = await startWebServer();
  process.stdout.write(`[consoledegastos-web] listening on ${runtime.baseUrl}\n`);
};

void maybeStartStandalone();
