import { startApiServer } from "./app.js";
import {
  createMemoryPersistenceAdapter,
  createPostgresPersistenceAdapter,
  resolvePersistenceMode,
} from "./persistence.js";

const portRaw = Number.parseInt(process.env.PORT ?? "4010", 10);
const port = Number.isNaN(portRaw) ? 4010 : portRaw;
const host = process.env.HOST ?? "127.0.0.1";
const databaseUrl = process.env.DATABASE_URL;
const persistenceMode = resolvePersistenceMode(process.env.PERSISTENCE_MODE, databaseUrl);

const persistence =
  persistenceMode === "postgres"
    ? createPostgresPersistenceAdapter({ databaseUrl: databaseUrl ?? "" })
    : createMemoryPersistenceAdapter();

const runtime = await startApiServer(port, { persistence, host });
console.log(`[consoledegastos-api] listening at ${runtime.baseUrl} (persistence=${runtime.persistence_mode})`);
