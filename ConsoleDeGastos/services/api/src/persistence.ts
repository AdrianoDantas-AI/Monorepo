import { Pool } from "pg";
import { createRuntimeStore, type RuntimeStore } from "./store.js";

export type PersistenceMode = "memory" | "postgres";

export interface PersistenceAdapter {
  mode: PersistenceMode;
  load: () => Promise<RuntimeStore>;
  save: (store: RuntimeStore) => Promise<void>;
  close: () => Promise<void>;
}

const STATE_TABLE = "consoledegastos_runtime_state";
const STATE_KEY = "default";

const ensureArrayField = <T>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) ? (value as T[]) : fallback;

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
      CREATE TABLE IF NOT EXISTS ${STATE_TABLE} (
        store_key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    initialized = true;
  };

  const upsertState = async (store: RuntimeStore): Promise<void> => {
    await pool.query(
      `
        INSERT INTO ${STATE_TABLE} (store_key, data, updated_at)
        VALUES ($1, $2::jsonb, NOW())
        ON CONFLICT (store_key)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `,
      [STATE_KEY, JSON.stringify(store)],
    );
  };

  return {
    mode: "postgres",
    load: async () => {
      await ensureInitialized();
      const result = await pool.query<{ data: unknown }>(
        `SELECT data FROM ${STATE_TABLE} WHERE store_key = $1`,
        [STATE_KEY],
      );

      if (result.rowCount && result.rows.length > 0) {
        return hydrateStore(result.rows[0].data);
      }

      const defaults = createRuntimeStore();
      await upsertState(defaults);
      return defaults;
    },
    save: async (store) => {
      await ensureInitialized();
      await upsertState(store);
    },
    close: async () => {
      await pool.end();
    },
  };
};
