export type DashboardPeriod = "7d" | "30d" | "90d" | "ytd";
export type DashboardUiState = "ready" | "loading" | "error";
export type DashboardModalState = "authenticating" | "success" | "error";

export interface DashboardMetrics {
  spending_rhythm_brl: number;
  patrimony_brl: number;
  partial_result_brl: number;
}

export interface CashflowMetrics {
  period: string;
  expenses_brl: number;
  incomes_brl: number;
  variation_pct: number;
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount_brl: number;
  type: "income" | "expense";
  category: string;
  date: string;
}

export interface RecurringExpense {
  id: string;
  description: string;
  amount_brl: number;
  type: "income" | "expense";
  progress_label: string;
  due_date: string;
  confirmed: boolean;
}

export interface OpenFinanceConnectionView {
  id: string;
  institution: string;
  status: "processing" | "active" | "error";
  progress_pct: number;
  updated_at: string;
}

export interface DashboardViewData {
  metrics: DashboardMetrics;
  cashflow: CashflowMetrics;
  recentTransactions: RecentTransaction[];
  upcomingExpenses: RecurringExpense[];
  connections: OpenFinanceConnectionView[];
}

export type TransactionSort = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";
export type TransactionPeriod = "7d" | "30d" | "90d" | "all";

export interface TransactionFilters {
  q: string;
  type: "all" | "income" | "expense";
  category: string;
  accountId: string;
  period: TransactionPeriod;
  sort: TransactionSort;
  page: number;
  pageSize: number;
}

export interface TransactionViewRow {
  id: string;
  description: string;
  amount_brl: number;
  type: "income" | "expense";
  category: string;
  account_id: string;
  date: string;
}

export interface CategoryViewRow {
  id: string;
  name: string;
  monthly_limit_brl: number;
  spent_brl: number;
}

export interface AccountViewRow {
  id: string;
  name: string;
  institution: string;
  kind: "bank" | "credit_card" | "investment";
  balance_brl: number;
  limit_brl: number;
  masked_number: string;
}

export interface TransactionsViewData {
  filters: TransactionFilters;
  rows: TransactionViewRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  categories: CategoryViewRow[];
  accounts: AccountViewRow[];
  totals: {
    count: number;
    incomes_brl: number;
    expenses_brl: number;
    balance_brl: number;
  };
}

export type RecurrentsType = "expense" | "income";

export interface RecurrentsFilters {
  type: RecurrentsType;
  month: string;
}

export interface RecurrentsViewRow extends RecurringExpense {
  paid_brl: number;
  expected_total_brl: number;
  remaining_brl: number;
}

export interface RecurrentsSummary {
  paid_brl: number;
  expected_brl: number;
  remaining_brl: number;
  paid_pct: number;
  installments_paid_brl: number;
  installments_expected_brl: number;
  recurrents_paid_brl: number;
  recurrents_expected_brl: number;
}

export interface RecurrentsViewData {
  filters: RecurrentsFilters;
  summary: RecurrentsSummary;
  groups: Array<{
    due_date: string;
    label: string;
    rows: RecurrentsViewRow[];
  }>;
}

export type CashflowPeriod = "last_30_days" | "last_3_months" | "ytd";

export interface CashflowTimelinePoint {
  key: string;
  label: string;
  expenses_brl: number;
  incomes_brl: number;
  balance_brl: number;
}

export interface CashflowCategoryBreakdown {
  category: string;
  amount_brl: number;
  participation_pct: number;
}

export interface CashflowViewData {
  period: CashflowPeriod;
  metrics: CashflowMetrics;
  trend_direction: "up" | "down" | "flat";
  timeline: CashflowTimelinePoint[];
  expenses_breakdown: CashflowCategoryBreakdown[];
  incomes_breakdown: CashflowCategoryBreakdown[];
}

export interface InvoiceViewRow {
  id: string;
  card_name: string;
  month_ref: string;
  total_brl: number;
  installments_brl: number;
  recurring_brl: number;
  one_off_brl: number;
}

export interface InvoicesViewData {
  month_ref: string;
  totals: {
    total_brl: number;
    installments_brl: number;
    recurring_brl: number;
    one_off_brl: number;
  };
  invoices: InvoiceViewRow[];
  selected_invoice_id: string | null;
  selected_invoice_transactions: TransactionViewRow[];
}

interface JsonEnvelope<T> {
  data: T;
}

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

const parsePeriodToCashflow = (period: DashboardPeriod): string => {
  if (period === "7d") {
    return "last_7_days";
  }
  if (period === "30d") {
    return "last_30_days";
  }
  if (period === "90d") {
    return "last_90_days";
  }
  return "ytd";
};

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`http_${response.status}`);
  }
  return (await response.json()) as T;
};

export const loadDashboardViewData = async (
  apiBaseUrl: string,
  period: DashboardPeriod,
): Promise<DashboardViewData> => {
  const [dashboardEnvelope, cashflowEnvelope, transactionsEnvelope, recurrentsEnvelope, connectionsEnvelope] =
    await Promise.all([
      fetchJson<JsonEnvelope<DashboardMetrics>>(`${apiBaseUrl}/api/v1/dashboard`),
      fetchJson<JsonEnvelope<CashflowMetrics>>(
        `${apiBaseUrl}/api/v1/cashflow?period=${encodeURIComponent(parsePeriodToCashflow(period))}`,
      ),
      fetchJson<{ data: RecentTransaction[] }>(
        `${apiBaseUrl}/api/v1/transactions?sort=date_desc&page=1&page_size=6`,
      ),
      fetchJson<{ data: RecurringExpense[] }>(`${apiBaseUrl}/api/v1/recurrents?type=expense`),
      fetchJson<{ data: OpenFinanceConnectionView[] }>(`${apiBaseUrl}/api/v1/openfinance/connections`),
    ]);

  return {
    metrics: dashboardEnvelope.data,
    cashflow: cashflowEnvelope.data,
    recentTransactions: transactionsEnvelope.data,
    upcomingExpenses: recurrentsEnvelope.data,
    connections: connectionsEnvelope.data,
  };
};

export const startOpenFinanceConnection = async (
  apiBaseUrl: string,
  institution = "Nubank",
): Promise<OpenFinanceConnectionView> => {
  await fetchJson<JsonEnvelope<{ connect_token: string; expires_in_s: number }>>(
    `${apiBaseUrl}/api/v1/openfinance/connect-token`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ source: "web_dashboard" }),
    },
  );

  const created = await fetchJson<JsonEnvelope<OpenFinanceConnectionView>>(
    `${apiBaseUrl}/api/v1/openfinance/connect/callback`,
    {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ institution }),
    },
  );

  return created.data;
};

export const syncOpenFinanceConnection = async (
  apiBaseUrl: string,
  connectionId: string,
): Promise<OpenFinanceConnectionView> => {
  const payload = await fetchJson<JsonEnvelope<OpenFinanceConnectionView>>(
    `${apiBaseUrl}/api/v1/openfinance/connections/${encodeURIComponent(connectionId)}/sync`,
    { method: "POST", headers: jsonHeaders, body: JSON.stringify({ source: "web_dashboard" }) },
  );

  return payload.data;
};

export const getOpenFinanceConnectionStatus = async (
  apiBaseUrl: string,
  connectionId: string,
): Promise<OpenFinanceConnectionView | null> => {
  try {
    const payload = await fetchJson<JsonEnvelope<OpenFinanceConnectionView>>(
      `${apiBaseUrl}/api/v1/openfinance/connections/${encodeURIComponent(connectionId)}/status`,
    );
    return payload.data;
  } catch {
    return null;
  }
};

const parsePositiveNumber = (value: string | null, fallback: number, max?: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  if (typeof max === "number") {
    return Math.min(parsed, max);
  }

  return parsed;
};

const computePeriodStartDate = (period: TransactionPeriod): string | null => {
  if (period === "all") {
    return null;
  }

  const now = new Date();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - days);
  return start.toISOString();
};

const buildTransactionsQuery = (filters: TransactionFilters, override: Partial<TransactionFilters> = {}): string => {
  const finalFilters: TransactionFilters = {
    ...filters,
    ...override,
  };

  const search = new URLSearchParams();
  if (finalFilters.q.trim().length > 0) {
    search.set("q", finalFilters.q.trim());
  }
  if (finalFilters.type !== "all") {
    search.set("type", finalFilters.type);
  }
  if (finalFilters.category.length > 0) {
    search.set("category", finalFilters.category);
  }
  if (finalFilters.accountId.length > 0) {
    search.set("account_id", finalFilters.accountId);
  }

  const periodStart = computePeriodStartDate(finalFilters.period);
  if (periodStart) {
    search.set("from", periodStart);
  }

  search.set("sort", finalFilters.sort);
  search.set("page", String(finalFilters.page));
  search.set("page_size", String(finalFilters.pageSize));
  return search.toString();
};

export const parseTransactionFiltersFromQuery = (url: URL): TransactionFilters => {
  const typeRaw = url.searchParams.get("type");
  const periodRaw = url.searchParams.get("period");
  const sortRaw = url.searchParams.get("sort");

  const type = typeRaw === "income" || typeRaw === "expense" ? typeRaw : "all";
  const period: TransactionPeriod =
    periodRaw === "7d" || periodRaw === "30d" || periodRaw === "90d" ? periodRaw : "all";
  const sort: TransactionSort =
    sortRaw === "amount_asc" || sortRaw === "amount_desc" || sortRaw === "date_asc" ? sortRaw : "date_desc";

  return {
    q: (url.searchParams.get("q") ?? "").trim(),
    type,
    category: (url.searchParams.get("category") ?? "").trim(),
    accountId: (url.searchParams.get("account_id") ?? "").trim(),
    period,
    sort,
    page: parsePositiveNumber(url.searchParams.get("page"), 1),
    pageSize: parsePositiveNumber(url.searchParams.get("page_size"), 15, 100),
  };
};

const currentMonthRef = (): string => {
  const now = new Date();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${now.getUTCFullYear()}-${month}`;
};

const normalizeMonthRef = (value: string | null): string => {
  if (!value) {
    return currentMonthRef();
  }

  return /^\d{4}-\d{2}$/.test(value) ? value : currentMonthRef();
};

export const parseRecurrentsFiltersFromQuery = (url: URL): RecurrentsFilters => {
  const typeRaw = url.searchParams.get("type");
  const type: RecurrentsType = typeRaw === "income" ? "income" : "expense";

  return {
    type,
    month: normalizeMonthRef(url.searchParams.get("month")),
  };
};

export const parseCashflowPeriodFromQuery = (url: URL): CashflowPeriod => {
  const raw = url.searchParams.get("period");
  if (raw === "last_30_days" || raw === "ytd") {
    return raw;
  }
  return "last_3_months";
};

export const parseInvoicesMonthFromQuery = (url: URL): string => normalizeMonthRef(url.searchParams.get("month"));

const parseInstallmentProgress = (value: string): { current: number; total: number } => {
  const match = value.match(/^(\d{1,3})\/(\d{1,3})$/);
  if (!match) {
    return { current: 1, total: 1 };
  }

  const current = Number.parseInt(match[1], 10);
  const total = Number.parseInt(match[2], 10);

  if (!Number.isFinite(current) || !Number.isFinite(total) || current < 1 || total < 1) {
    return { current: 1, total: 1 };
  }

  return {
    current: Math.min(current, total),
    total,
  };
};

const monthFromDate = (isoDate: string): string => isoDate.slice(0, 7);

const formatDateGroupLabel = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate.slice(0, 10);
  }

  return parsed.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
  });
};

const formatPeriodLabel = (periodKey: string): string => {
  const parsed = new Date(`${periodKey}-01T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return periodKey;
  }

  return parsed.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
};

const parseRowsEnvelope = async (
  apiBaseUrl: string,
  filters: TransactionFilters,
): Promise<{
  rows: TransactionViewRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  const search = buildTransactionsQuery(filters);
  const envelope = await fetchJson<{
    data: TransactionViewRow[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }>(`${apiBaseUrl}/api/v1/transactions?${search}`);

  return {
    rows: envelope.data,
    total: envelope.total,
    page: envelope.page,
    pageSize: envelope.page_size,
    totalPages: envelope.total_pages,
  };
};

const parseTotals = async (
  apiBaseUrl: string,
  filters: TransactionFilters,
): Promise<{
  count: number;
  incomes_brl: number;
  expenses_brl: number;
  balance_brl: number;
}> => {
  const search = buildTransactionsQuery(filters, { page: 1, pageSize: 500 });
  const envelope = await fetchJson<{
    data: TransactionViewRow[];
    total: number;
  }>(`${apiBaseUrl}/api/v1/transactions?${search}`);

  const incomes = envelope.data
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount_brl, 0);
  const expenses = envelope.data
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount_brl, 0);

  return {
    count: envelope.total,
    incomes_brl: Number(incomes.toFixed(2)),
    expenses_brl: Number(expenses.toFixed(2)),
    balance_brl: Number((incomes - expenses).toFixed(2)),
  };
};

export const loadTransactionsViewData = async (
  apiBaseUrl: string,
  filters: TransactionFilters,
): Promise<TransactionsViewData> => {
  const [rowsEnvelope, totals, categoriesEnvelope, accountsEnvelope] = await Promise.all([
    parseRowsEnvelope(apiBaseUrl, filters),
    parseTotals(apiBaseUrl, filters),
    fetchJson<{ data: CategoryViewRow[] }>(`${apiBaseUrl}/api/v1/categories`),
    fetchJson<{ data: AccountViewRow[] }>(`${apiBaseUrl}/api/v1/accounts`),
  ]);

  return {
    filters,
    rows: rowsEnvelope.rows,
    total: rowsEnvelope.total,
    page: rowsEnvelope.page,
    pageSize: rowsEnvelope.pageSize,
    totalPages: rowsEnvelope.totalPages,
    categories: categoriesEnvelope.data,
    accounts: accountsEnvelope.data,
    totals,
  };
};

const roundMoney = (value: number): number => Number(value.toFixed(2));

const buildRecurrentsViewRow = (item: RecurringExpense): RecurrentsViewRow => {
  const installment = parseInstallmentProgress(item.progress_label);
  const paidInstallments = item.confirmed ? installment.current : Math.max(0, installment.current - 1);
  const expected = roundMoney(item.amount_brl * installment.total);
  const paid = roundMoney(item.amount_brl * paidInstallments);
  const remaining = roundMoney(Math.max(0, expected - paid));

  return {
    ...item,
    paid_brl: paid,
    expected_total_brl: expected,
    remaining_brl: remaining,
  };
};

const createEmptyRecurrentsSummary = (): RecurrentsSummary => ({
  paid_brl: 0,
  expected_brl: 0,
  remaining_brl: 0,
  paid_pct: 0,
  installments_paid_brl: 0,
  installments_expected_brl: 0,
  recurrents_paid_brl: 0,
  recurrents_expected_brl: 0,
});

export const loadRecurrentsViewData = async (
  apiBaseUrl: string,
  filters: RecurrentsFilters,
): Promise<RecurrentsViewData> => {
  const envelope = await fetchJson<{ data: RecurringExpense[] }>(
    `${apiBaseUrl}/api/v1/recurrents?type=${encodeURIComponent(filters.type)}`,
  );

  const monthlyRows = envelope.data
    .filter((item) => monthFromDate(item.due_date) === filters.month)
    .map((item) => buildRecurrentsViewRow(item));

  const summary = monthlyRows.reduce<RecurrentsSummary>((acc, row) => {
    const installment = parseInstallmentProgress(row.progress_label);
    const isInstallment = installment.total > 1;

    acc.paid_brl = roundMoney(acc.paid_brl + row.paid_brl);
    acc.expected_brl = roundMoney(acc.expected_brl + row.expected_total_brl);
    acc.remaining_brl = roundMoney(acc.remaining_brl + row.remaining_brl);

    if (isInstallment) {
      acc.installments_paid_brl = roundMoney(acc.installments_paid_brl + row.paid_brl);
      acc.installments_expected_brl = roundMoney(acc.installments_expected_brl + row.expected_total_brl);
    } else {
      acc.recurrents_paid_brl = roundMoney(acc.recurrents_paid_brl + row.paid_brl);
      acc.recurrents_expected_brl = roundMoney(acc.recurrents_expected_brl + row.expected_total_brl);
    }

    return acc;
  }, createEmptyRecurrentsSummary());

  summary.paid_pct = summary.expected_brl === 0 ? 0 : Number(((summary.paid_brl / summary.expected_brl) * 100).toFixed(1));

  const groupsMap = new Map<string, RecurrentsViewRow[]>();
  for (const row of monthlyRows) {
    const key = row.due_date.slice(0, 10);
    const bucket = groupsMap.get(key) ?? [];
    bucket.push(row);
    groupsMap.set(key, bucket);
  }

  const groups = Array.from(groupsMap.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([dueDate, rows]) => ({
      due_date: dueDate,
      label: formatDateGroupLabel(dueDate),
      rows: rows.sort((left, right) => left.description.localeCompare(right.description)),
    }));

  return {
    filters,
    summary,
    groups,
  };
};

const buildCashflowTimeline = (rows: TransactionViewRow[]): CashflowTimelinePoint[] => {
  const grouped = new Map<string, { expenses: number; incomes: number }>();

  for (const row of rows) {
    const key = monthFromDate(row.date);
    const bucket = grouped.get(key) ?? { expenses: 0, incomes: 0 };
    if (row.type === "expense") {
      bucket.expenses += row.amount_brl;
    } else {
      bucket.incomes += row.amount_brl;
    }
    grouped.set(key, bucket);
  }

  if (grouped.size === 0) {
    const key = currentMonthRef();
    return [
      {
        key,
        label: formatPeriodLabel(key),
        expenses_brl: 0,
        incomes_brl: 0,
        balance_brl: 0,
      },
    ];
  }

  return Array.from(grouped.entries())
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([key, values]) => ({
      key,
      label: formatPeriodLabel(key),
      expenses_brl: roundMoney(values.expenses),
      incomes_brl: roundMoney(values.incomes),
      balance_brl: roundMoney(values.incomes - values.expenses),
    }));
};

const buildCategoryBreakdown = (
  rows: TransactionViewRow[],
  type: "expense" | "income",
): CashflowCategoryBreakdown[] => {
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.type !== type) {
      continue;
    }
    totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount_brl);
  }

  const gross = Array.from(totals.values()).reduce((sum, value) => sum + value, 0);
  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([category, amount]) => ({
      category,
      amount_brl: roundMoney(amount),
      participation_pct: gross === 0 ? 0 : Number(((amount / gross) * 100).toFixed(1)),
    }));
};

export const loadCashflowViewData = async (
  apiBaseUrl: string,
  period: CashflowPeriod,
): Promise<CashflowViewData> => {
  const [cashflowEnvelope, transactionsEnvelope] = await Promise.all([
    fetchJson<JsonEnvelope<CashflowMetrics>>(
      `${apiBaseUrl}/api/v1/cashflow?period=${encodeURIComponent(period)}`,
    ),
    fetchJson<{ data: TransactionViewRow[] }>(`${apiBaseUrl}/api/v1/transactions?page=1&page_size=500&sort=date_desc`),
  ]);

  const timeline = buildCashflowTimeline(transactionsEnvelope.data);
  const trendBase = timeline.length > 1 ? timeline[timeline.length - 2].balance_brl : 0;
  const trendCurrent = timeline[timeline.length - 1]?.balance_brl ?? 0;
  const trendDirection: CashflowViewData["trend_direction"] =
    trendCurrent > trendBase ? "up" : trendCurrent < trendBase ? "down" : "flat";

  return {
    period,
    metrics: cashflowEnvelope.data,
    trend_direction: trendDirection,
    timeline,
    expenses_breakdown: buildCategoryBreakdown(transactionsEnvelope.data, "expense"),
    incomes_breakdown: buildCategoryBreakdown(transactionsEnvelope.data, "income"),
  };
};

export const loadInvoicesViewData = async (
  apiBaseUrl: string,
  monthRef: string,
  selectedInvoiceId: string | null,
): Promise<InvoicesViewData> => {
  const envelope = await fetchJson<{ data: InvoiceViewRow[] }>(`${apiBaseUrl}/api/v1/invoices`);
  const invoices = envelope.data.filter((invoice) => invoice.month_ref === monthRef);

  const totals = invoices.reduce(
    (acc, invoice) => ({
      total_brl: roundMoney(acc.total_brl + invoice.total_brl),
      installments_brl: roundMoney(acc.installments_brl + invoice.installments_brl),
      recurring_brl: roundMoney(acc.recurring_brl + invoice.recurring_brl),
      one_off_brl: roundMoney(acc.one_off_brl + invoice.one_off_brl),
    }),
    {
      total_brl: 0,
      installments_brl: 0,
      recurring_brl: 0,
      one_off_brl: 0,
    },
  );

  const effectiveInvoiceId = selectedInvoiceId && invoices.some((item) => item.id === selectedInvoiceId)
    ? selectedInvoiceId
    : (invoices[0]?.id ?? null);

  const selectedInvoiceTransactions =
    effectiveInvoiceId === null
      ? []
      : (
          await fetchJson<{ data: TransactionViewRow[] }>(
            `${apiBaseUrl}/api/v1/invoices/${encodeURIComponent(effectiveInvoiceId)}/transactions`,
          )
        ).data;

  return {
    month_ref: monthRef,
    totals,
    invoices,
    selected_invoice_id: effectiveInvoiceId,
    selected_invoice_transactions: selectedInvoiceTransactions,
  };
};

export const createManualTransaction = async (
  apiBaseUrl: string,
  input: {
    description: string;
    amount_brl: number;
    type: "income" | "expense";
    category: string;
    account_id: string;
    date: string;
  },
): Promise<void> => {
  await fetchJson<{ data: TransactionViewRow }>(`${apiBaseUrl}/api/v1/transactions/manual`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(input),
  });
};

export const recategorizeTransaction = async (
  apiBaseUrl: string,
  transactionId: string,
  category: string,
): Promise<void> => {
  await fetchJson<{ data: TransactionViewRow }>(
    `${apiBaseUrl}/api/v1/transactions/${encodeURIComponent(transactionId)}/category`,
    {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ category }),
    },
  );
};

const escapeCsvCell = (value: string | number): string => {
  const raw = String(value);
  const escaped = raw.replaceAll('"', '""');
  return `"${escaped}"`;
};

export const buildTransactionsCsv = async (
  apiBaseUrl: string,
  filters: TransactionFilters,
): Promise<string> => {
  const search = buildTransactionsQuery(filters, { page: 1, pageSize: 500 });
  const envelope = await fetchJson<{ data: TransactionViewRow[] }>(`${apiBaseUrl}/api/v1/transactions?${search}`);

  const header = ["id", "description", "type", "category", "account_id", "amount_brl", "date"];
  const rows = envelope.data.map((item) =>
    [
      escapeCsvCell(item.id),
      escapeCsvCell(item.description),
      escapeCsvCell(item.type),
      escapeCsvCell(item.category),
      escapeCsvCell(item.account_id),
      escapeCsvCell(item.amount_brl.toFixed(2)),
      escapeCsvCell(item.date),
    ].join(","),
  );

  return [header.join(","), ...rows].join("\n");
};
