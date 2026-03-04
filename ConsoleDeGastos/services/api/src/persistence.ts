import { Pool, type PoolClient } from "pg";
import type {
  OpenFinanceConnectionDTOv1,
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
  transactions: [],
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

  const readTableCounts = async (): Promise<{
    sessions_count: number;
    connections_count: number;
    transactions_count: number;
  }> => {
    const result = await pool.query<{
      sessions_count: string | number;
      connections_count: string | number;
      transactions_count: string | number;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM ${SESSIONS_TABLE}) AS sessions_count,
        (SELECT COUNT(*) FROM ${CONNECTIONS_TABLE}) AS connections_count,
        (SELECT COUNT(*) FROM ${TRANSACTIONS_TABLE}) AS transactions_count
    `);

    const row = result.rows[0];
    return {
      sessions_count: Number.parseInt(String(row.sessions_count), 10),
      connections_count: Number.parseInt(String(row.connections_count), 10),
      transactions_count: Number.parseInt(String(row.transactions_count), 10),
    };
  };

  return {
    mode: "postgres",
    load: async () => {
      await ensureInitialized();

      const counts = await readTableCounts();
      const hasModeledData =
        counts.sessions_count > 0 || counts.connections_count > 0 || counts.transactions_count > 0;

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
