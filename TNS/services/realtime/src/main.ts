import { createRealtimeRuntime } from "./realtime-server.js";

const port = Number(process.env.REALTIME_PORT ?? 3002);

const runtime = createRealtimeRuntime();

runtime.httpServer.listen(port, () => {
  console.log(`[realtime] listening on ${port}`);
});
