import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createWebDashboardServer } from "../../apps/web-dashboard/src/server.js";

test("web-dashboard expõe /health, /ops/config e tela com realtime WS", async () => {
  const server = createWebDashboardServer({
    port: 0,
    tenantId: "tenant_web_001",
    realtimeWsUrl: "ws://127.0.0.1:3002/ws",
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/health`);
    assert.equal(healthResponse.status, 200);
    const healthJson = (await healthResponse.json()) as {
      status: string;
      service: string;
      tenant_id: string;
    };
    assert.equal(healthJson.status, "ok");
    assert.equal(healthJson.service, "web-dashboard");
    assert.equal(healthJson.tenant_id, "tenant_web_001");

    const opsResponse = await fetch(`${baseUrl}/ops/config`);
    assert.equal(opsResponse.status, 200);
    const opsJson = (await opsResponse.json()) as {
      channels: string[];
      realtime_subscription_url: string;
    };
    assert.deepEqual(opsJson.channels, ["trip.progress.v1", "alert.event.v1"]);
    assert.match(
      opsJson.realtime_subscription_url,
      /channels=trip\.progress\.v1%2Calert\.event\.v1/,
    );
    assert.match(opsJson.realtime_subscription_url, /tenant_id=tenant_web_001/);

    const htmlResponse = await fetch(`${baseUrl}/`);
    assert.equal(htmlResponse.status, 200);
    assert.match(htmlResponse.headers.get("content-type") ?? "", /text\/html/i);

    const html = await htmlResponse.text();
    assert.match(html, /TNS Dashboard - Trips em Tempo Real/);
    assert.match(html, /trip\.progress\.v1/);
    assert.match(html, /alert\.event\.v1/);
    assert.match(html, /tenant_web_001/);
    assert.match(html, /new WebSocket\(config\.realtimeSubscriptionUrl\)/);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
