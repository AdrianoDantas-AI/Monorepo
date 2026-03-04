import { Pool, type PoolClient } from "pg";
import type {
  AccountDetailDTOv1,
  CategoryDTOv1,
  InvoiceSummaryDTOv1,
  OpenFinanceConnectionDTOv1,
  RecurringDTOv1,
  TransactionDTOv1,
  UserSessionDTOv1,
} from "@consoledegastos/contracts";
import { createRuntimeStore, type RuntimeStore } from "./store.js";

export type PersistenceMode = "memory" | "postgres";

export interface PersistenceAdapter {
  mode: PersistenceMode;
  load: () => Promise<RuntimeStore>;
  save: (store: RuntimeStore) => Promise<void>;
  close: () => Promise<void>;
}

const AUX_STATE_TABLE = "consoledegastos_runtime_aux_state";
const LEGACY_STATE_TABLE = "consoledegastos_runtime_state";
const SESSIONS_TABLE = "consoledegastos_sessions";
const CONNECTIONS_TABLE = "consoledegastos_open_finance_connections";
const TRANSACTIONS_TABLE = "consoledegastos_transactions";
const ACCOUNTS_TABLE = "consoledegastos_accounts";
const CATEGORIES_TABLE = "consoledegastos_categories";
const INVOICES_TABLE = "consoledegastos_invoices";
const RECURRENTS_TABLE = "consoledegastos_recurrents";
const STATE_KEY = "default";

const ensureArrayField = <T>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) ? (value as T[]) : fallback;

const toIsoString = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const toNumber = (value: string | number): number =>
  typeof value === "number" ? value : Number.parseFloat(value);

const createAuxiliarySnapshot = (store: RuntimeStore): RuntimeStore => ({
  ...store,
  sessions: [],
  open_finance_connections: [],
  accounts: [],
  transactions: [],
  recurrents: [],
  categories: [],
  invoices: [],
});

export const hydrateStore = (value: unknown): RuntimeStore => {
  const defaults = createRuntimeStore();
  if (!value || typeof value !== "object") {
    return defaults;
  }

  const input = value as Record<string, unknown>;
  return {
    sessions: ensureArrayField(input.sessions, defaults.sessions),
    open_finance_connections: ensureArrayField(input.open_finance_connections, defaults.open_finance_connections),
    accounts: ensureArrayField(input.accounts, defaults.accounts),
    transactions: ensureArrayField(input.transactions, defaults.transactions),
    recurrents: ensureArrayField(input.recurrents, defaults.recurrents),
    categories: ensureArrayField(input.categories, defaults.categories),
    invoices: ensureArrayField(input.invoices, defaults.invoices),
    report_jobs: ensureArrayField(input.report_jobs, defaults.report_jobs),
    ai_sessions: ensureArrayField(input.ai_sessions, defaults.ai_sessions),
    ai_action_proposals: ensureArrayField(input.ai_action_proposals, defaults.ai_action_proposals),
    ai_action_executions: ensureArrayField(input.ai_action_executions, defaults.ai_action_executions),
    feedbacks: ensureArrayField(input.feedbacks, defaults.feedbacks),
    alerts: ensureArrayField(input.alerts, defaults.alerts),
    processed_openfinance_webhook_event_ids: ensureArrayField(
      input.processed_openfinance_webhook_event_ids,
      defaults.processed_openfinance_webhook_event_ids,
    ),
  };
};

export const resolvePersistenceMode = (
  modeFromEnv: string | undefined,
  databaseUrl: string | undefined,
): PersistenceMode => {
  const mode = (modeFromEnv ?? "").trim().toLowerCase();

  if (mode === "memory") {
    return "memory";
  }

  if (mode === "postgres") {
    if (!databaseUrl || databaseUrl.trim().length === 0) {
      throw new Error("database_url_required_for_postgres_persistence");
    }
    return "postgres";
  }

  if (databaseUrl && databaseUrl.trim().length > 0) {
    return "postgres";
  }

  return "memory";
};

export const createMemoryPersistenceAdapter = (seed?: RuntimeStore): PersistenceAdapter => {
  let state = seed ? hydrateStore(seed) : createRuntimeStore();

  return {
    mode: "memory",
    load: async () => hydrateStore(state),
    save: async (store) => {
      state = hydrateStore(store);
    },
    close: async () => {},
  };
};

type SessionRow = {
  id: string;
  user_id: string;
  provider: UserSessionDTOv1["provider"];
  created_at: string | Date;
};

type ConnectionRow = {
  id: string;
  institution: string;
  status: OpenFinanceConnectionDTOv1["status"];
  progress_pct: number;
  updated_at: string | Date;
};

type TransactionRow = {
  id: string;
  description: string;
  amount_brl: string | number;
  type: TransactionDTOv1["type"];
  category: string;
  account_id: string;
  date: string | Date;
};

type AccountRow = {
  id: string;
  name: string;
  institution: string;
  kind: AccountDetailDTOv1["kind"];
  balance_brl: string | number;
  limit_brl: string | number;
  masked_number: string;
};

type CategoryRow = {
  id: string;
  name: string;
  monthly_limit_brl: string | number;
  spent_brl: string | number;
};

type InvoiceRow = {
  id: string;
  card_name: string;
  month_ref: string;
  total_brl: string | number;
  installments_brl: string | number;
  recurring_brl: string | number;
  one_off_brl: string | number;
};

type RecurringRow = {
  id: string;
  description: string;
  amount_brl: string | number;
  type: RecurringDTOv1["type"];
  progress_label: string;
  due_date: string;
  confirmed: boolean;
};

const isMissingRelationError = (error: unknown): boolean => {
  const code = (error as { code?: string }).code;
  return code === "42P01";
};

export const createPostgresPersistenceAdapter = ({
  databaseUrl,
}: {
  databaseUrl: string;
}): PersistenceAdapter => {
  const pool = new Pool({ connectionString: databaseUrl });
  let initialized = false;

  const ensureInitialized = async (): Promise<void> => {
    if (initialized) {
      return;
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${AUX_STATE_TABLE} (
        store_key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${SESSIONS_TABLE} (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${CONNECTIONS_TABLE} (
        id TEXT PRIMARY KEY,
        institution TEXT NOT NULL,
        status TEXT NOT NULL,
        progress_pct INTEGER NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TRANSACTIONS_TABLE} (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount_brl NUMERIC(14,2) NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        account_id TEXT NOT NULL,
        date TIMESTAMPTZ NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${ACCOUNTS_TABLE} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        institution TEXT NOT NULL,
        kind TEXT NOT NULL,
        balance_brl NUMERIC(14,2) NOT NULL,
        limit_brl NUMERIC(14,2) NOT NULL,
        masked_number TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${CATEGORIES_TABLE} (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        monthly_limit_brl NUMERIC(14,2) NOT NULL,
        spent_brl NUMERIC(14,2) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${INVOICES_TABLE} (
        id TEXT PRIMARY KEY,
        card_name TEXT NOT NULL,
        month_ref TEXT NOT NULL,
        total_brl NUMERIC(14,2) NOT NULL,
        installments_brl NUMERIC(14,2) NOT NULL,
        recurring_brl NUMERIC(14,2) NOT NULL,
        one_off_brl NUMERIC(14,2) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${RECURRENTS_TABLE} (
        id TEXT PRIMARY KEY,
        description TEXT NOT NULL,
        amount_brl NUMERIC(14,2) NOT NULL,
        type TEXT NOT NULL,
        progress_label TEXT NOT NULL,
        due_date TEXT NOT NULL,
        confirmed BOOLEAN NOT NULL
      )
    `);

    initialized = true;
  };

  const replaceSessions = async (client: PoolClient, sessions: UserSessionDTOv1[]): Promise<void> => {
    await client.query(`DELETE FROM ${SESSIONS_TABLE}`);
    for (const session of sessions) {
      await client.query(
        `
          INSERT INTO ${SESSIONS_TABLE} (id, user_id, provider, created_at)
          VALUES ($1, $2, $3, $4)
        `,
        [session.id, session.user_id, session.provider, session.created_at],
      );
    }
  };

  const replaceConnections = async (
    client: PoolClient,
    connections: OpenFinanceConnectionDTOv1[],
  ): Promise<void> => {
    await client.query(`DELETE FROM ${CONNECTIONS_TABLE}`);
    for (const connection of connections) {
      await client.query(
        `
          INSERT INTO ${CONNECTIONS_TABLE} (id, institution, status, progress_pct, updated_at)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [
          connection.id,
          connection.institution,
          connection.status,
          connection.progress_pct,
          connection.updated_at,
        ],
      );
    }
  };

  const replaceTransactions = async (
    client: PoolClient,
    transactions: TransactionDTOv1[],
  ): Promise<void> => {
    await client.query(`DELETE FROM ${TRANSACTIONS_TABLE}`);
    for (const transaction of transactions) {
      await client.query(
        `
          INSERT INTO ${TRANSACTIONS_TABLE} (id, description, amount_brl, type, category, account_id, date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          transaction.id,
          transaction.description,
          transaction.amount_brl,
          transaction.type,
          transaction.category,
          transaction.account_id,
          transaction.date,
        ],
      );
    }
  };

  const replaceAccounts = async (
    client: PoolClient,
    accounts: AccountDetailDTOv1[],
  ): Promise<void> => {
    await client.query(`DELETE FROM ${ACCOUNTS_TABLE}`);
    for (const account of accounts) {
      await client.query(
        `
          INSERT INTO ${ACCOUNTS_TABLE} (id, name, institution, kind, balance_brl, limit_brl, masked_number)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          account.id,
          account.name,
          account.institution,
          account.kind,
          account.balance_brl,
          account.limit_brl,
          account.masked_number,
        ],
      );
    }
  };

  const replaceCategories = async (
    client: PoolClient,
    categories: CategoryDTOv1[],
  ): Promise<void> => {
    await client.query(`DELETE FROM ${CATEGORIES_TABLE}`);
    for (const category of categories) {
      await client.query(
        `
          INSERT INTO ${CATEGORIES_TABLE} (id, name, monthly_limit_brl, spent_brl)
          VALUES ($1, $2, $3, $4)
        `,
        [category.id, category.name, category.monthly_limit_brl, category.spent_brl],
      );
    }
  };

  const replaceInvoices = async (
    client: PoolClient,
    invoices: InvoiceSummaryDTOv1[],
  ): Promise<void> => {
    await client.query(`DELETE FROM ${INVOICES_TABLE}`);
    for (const invoice of invoices) {
      await client.query(
        `
          INSERT INTO ${INVOICES_TABLE} (
            id,
            card_name,
            month_ref,
            total_brl,
            installments_brl,
            recurring_brl,
            one_off_brl
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          invoice.id,
          invoice.card_name,
          invoice.month_ref,
          invoice.total_brl,
          invoice.installments_brl,
          invoice.recurring_brl,
          invoice.one_off_brl,
        ],
      );
    }
  };

  const replaceRecurrents = async (
    client: PoolClient,
    recurrents: RecurringDTOv1[],
  ): Promise<void> => {
    await client.query(`DELETE FROM ${RECURRENTS_TABLE}`);
    for (const recurring of recurrents) {
      await client.query(
        `
          INSERT INTO ${RECURRENTS_TABLE} (
            id,
            description,
            amount_brl,
            type,
            progress_label,
            due_date,
            confirmed
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          recurring.id,
          recurring.description,
          recurring.amount_brl,
          recurring.type,
          recurring.progress_label,
          recurring.due_date,
          recurring.confirmed,
        ],
      );
    }
  };

  const upsertAuxSnapshot = async (client: PoolClient, store: RuntimeStore): Promise<void> => {
    const auxiliarySnapshot = createAuxiliarySnapshot(store);
    await client.query(
      `
        INSERT INTO ${AUX_STATE_TABLE} (store_key, data, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (store_key)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `,
      [STATE_KEY, JSON.stringify(auxiliarySnapshot)],
    );
  };

  const saveStoreInTransaction = async (store: RuntimeStore): Promise<void> => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await replaceSessions(client, store.sessions);
      await replaceConnections(client, store.open_finance_connections);
      await replaceTransactions(client, store.transactions);
      await replaceAccounts(client, store.accounts);
      await replaceCategories(client, store.categories);
      await replaceInvoices(client, store.invoices);
      await replaceRecurrents(client, store.recurrents);
      await upsertAuxSnapshot(client, store);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  };

  const readAuxSnapshot = async (): Promise<RuntimeStore | null> => {
    const result = await pool.query<{ data: unknown }>(
      `SELECT data FROM ${AUX_STATE_TABLE} WHERE store_key = $1`,
      [STATE_KEY],
    );

    if (!result.rowCount || result.rows.length === 0) {
      return null;
    }

    return hydrateStore(result.rows[0].data);
  };

  const readLegacySnapshot = async (): Promise<RuntimeStore | null> => {
    try {
      const result = await pool.query<{ data: unknown }>(
        `SELECT data FROM ${LEGACY_STATE_TABLE} WHERE store_key = $1`,
        [STATE_KEY],
      );

      if (!result.rowCount || result.rows.length === 0) {
        return null;
      }

      return hydrateStore(result.rows[0].data);
    } catch (error) {
      if (isMissingRelationError(error)) {
        return null;
      }

      throw error;
    }
  };

  const readSessions = async (): Promise<UserSessionDTOv1[]> => {
    const result = await pool.query<SessionRow>(
      `SELECT id, user_id, provider, created_at FROM ${SESSIONS_TABLE} ORDER BY created_at ASC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      provider: row.provider,
      created_at: toIsoString(row.created_at),
    }));
  };

  const readConnections = async (): Promise<OpenFinanceConnectionDTOv1[]> => {
    const result = await pool.query<ConnectionRow>(
      `SELECT id, institution, status, progress_pct, updated_at FROM ${CONNECTIONS_TABLE} ORDER BY updated_at DESC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      institution: row.institution,
      status: row.status,
      progress_pct: row.progress_pct,
      updated_at: toIsoString(row.updated_at),
    }));
  };

  const readTransactions = async (): Promise<TransactionDTOv1[]> => {
    const result = await pool.query<TransactionRow>(
      `SELECT id, description, amount_brl, type, category, account_id, date FROM ${TRANSACTIONS_TABLE} ORDER BY date DESC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      description: row.description,
      amount_brl: Number(toNumber(row.amount_brl).toFixed(2)),
      type: row.type,
      category: row.category,
      account_id: row.account_id,
      date: toIsoString(row.date),
    }));
  };

  const readAccounts = async (): Promise<AccountDetailDTOv1[]> => {
    const result = await pool.query<AccountRow>(
      `
        SELECT id, name, institution, kind, balance_brl, limit_brl, masked_number
        FROM ${ACCOUNTS_TABLE}
        ORDER BY name ASC
      `,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      institution: row.institution,
      kind: row.kind,
      balance_brl: Number(toNumber(row.balance_brl).toFixed(2)),
      limit_brl: Number(toNumber(row.limit_brl).toFixed(2)),
      masked_number: row.masked_number,
    }));
  };

  const readCategories = async (): Promise<CategoryDTOv1[]> => {
    const result = await pool.query<CategoryRow>(
      `SELECT id, name, monthly_limit_brl, spent_brl FROM ${CATEGORIES_TABLE} ORDER BY name ASC`,
    );

    return result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      monthly_limit_brl: Number(toNumber(row.monthly_limit_brl).toFixed(2)),
      spent_brl: Number(toNumber(row.spent_brl).toFixed(2)),
    }));
  };

  const readInvoices = async (): Promise<InvoiceSummaryDTOv1[]> => {
    const result = await pool.query<InvoiceRow>(
      `
        SELECT
          id,
          card_name,
          month_ref,
          total_brl,
          installments_brl,
          recurring_brl,
          one_off_brl
        FROM ${INVOICES_TABLE}
        ORDER BY month_ref DESC
      `,
    );

    return result.rows.map((row) => ({
      id: row.id,
      card_name: row.card_name,
      month_ref: row.month_ref,
      total_brl: Number(toNumber(row.total_brl).toFixed(2)),
      installments_brl: Number(toNumber(row.installments_brl).toFixed(2)),
      recurring_brl: Number(toNumber(row.recurring_brl).toFixed(2)),
      one_off_brl: Number(toNumber(row.one_off_brl).toFixed(2)),
    }));
  };

  const readRecurrents = async (): Promise<RecurringDTOv1[]> => {
    const result = await pool.query<RecurringRow>(
      `
        SELECT
          id,
          description,
          amount_brl,
          type,
          progress_label,
          due_date,
          confirmed
        FROM ${RECURRENTS_TABLE}
        ORDER BY due_date ASC
      `,
    );

    return result.rows.map((row) => ({
      id: row.id,
      description: row.description,
      amount_brl: Number(toNumber(row.amount_brl).toFixed(2)),
      type: row.type,
      progress_label: row.progress_label,
      due_date: row.due_date,
      confirmed: row.confirmed,
    }));
  };

  const readTableCounts = async (): Promise<{
    sessions_count: number;
    connections_count: number;
    transactions_count: number;
    accounts_count: number;
    categories_count: number;
    invoices_count: number;
    recurrents_count: number;
  }> => {
    const result = await pool.query<{
      sessions_count: string | number;
      connections_count: string | number;
      transactions_count: string | number;
      accounts_count: string | number;
      categories_count: string | number;
      invoices_count: string | number;
      recurrents_count: string | number;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM ${SESSIONS_TABLE}) AS sessions_count,
        (SELECT COUNT(*) FROM ${CONNECTIONS_TABLE}) AS connections_count,
        (SELECT COUNT(*) FROM ${TRANSACTIONS_TABLE}) AS transactions_count,
        (SELECT COUNT(*) FROM ${ACCOUNTS_TABLE}) AS accounts_count,
        (SELECT COUNT(*) FROM ${CATEGORIES_TABLE}) AS categories_count,
        (SELECT COUNT(*) FROM ${INVOICES_TABLE}) AS invoices_count,
        (SELECT COUNT(*) FROM ${RECURRENTS_TABLE}) AS recurrents_count
    `);

    const row = result.rows[0];
    return {
      sessions_count: Number.parseInt(String(row.sessions_count), 10),
      connections_count: Number.parseInt(String(row.connections_count), 10),
      transactions_count: Number.parseInt(String(row.transactions_count), 10),
      accounts_count: Number.parseInt(String(row.accounts_count), 10),
      categories_count: Number.parseInt(String(row.categories_count), 10),
      invoices_count: Number.parseInt(String(row.invoices_count), 10),
      recurrents_count: Number.parseInt(String(row.recurrents_count), 10),
    };
  };

  return {
    mode: "postgres",
    load: async () => {
      await ensureInitialized();

      const counts = await readTableCounts();
      const hasModeledData =
        counts.sessions_count > 0 ||
        counts.connections_count > 0 ||
        counts.transactions_count > 0 ||
        counts.accounts_count > 0 ||
        counts.categories_count > 0 ||
        counts.invoices_count > 0 ||
        counts.recurrents_count > 0;

      const auxiliary = await readAuxSnapshot();

      if (!hasModeledData && !auxiliary) {
        const legacyStore = await readLegacySnapshot();
        if (legacyStore) {
          await saveStoreInTransaction(legacyStore);
          return legacyStore;
        }

        const defaults = createRuntimeStore();
        await saveStoreInTransaction(defaults);
        return defaults;
      }

      const baseStore = auxiliary ?? createRuntimeStore();
      const hydrated = hydrateStore(baseStore);

      hydrated.sessions = await readSessions();
      hydrated.open_finance_connections = await readConnections();
      hydrated.transactions = await readTransactions();
      hydrated.accounts = await readAccounts();
      hydrated.categories = await readCategories();
      hydrated.invoices = await readInvoices();
      hydrated.recurrents = await readRecurrents();

      return hydrated;
    },
    save: async (store) => {
      await ensureInitialized();
      await saveStoreInTransaction(store);
    },
    close: async () => {
      await pool.end();
    },
  };
};
