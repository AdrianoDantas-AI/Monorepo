import { startApiServer } from "./app.js";

const portRaw = Number.parseInt(process.env.PORT ?? "4010", 10);
const port = Number.isNaN(portRaw) ? 4010 : portRaw;

const runtime = await startApiServer(port);
console.log(`[consoledegastos-api] listening at ${runtime.baseUrl}`);
