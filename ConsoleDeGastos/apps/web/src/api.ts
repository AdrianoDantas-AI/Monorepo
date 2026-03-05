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
