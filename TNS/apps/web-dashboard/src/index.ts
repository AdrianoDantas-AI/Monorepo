import { createWebDashboardServer, resolveWebDashboardRuntimeConfig } from "./server.js";

const config = resolveWebDashboardRuntimeConfig();
const server = createWebDashboardServer(config);

server.listen(config.port, () => {
  console.log(
    `[web-dashboard] listening on ${config.port} (tenant=${config.tenantId}, realtime=${config.realtimeWsUrl})`,
  );
});
