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
    apiBaseUrl: "http://127.0.0.1:3000",
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
      api_base_url: string;
    };
    assert.deepEqual(opsJson.channels, ["trip.progress.v1", "alert.event.v1"]);
    assert.match(
      opsJson.realtime_subscription_url,
      /channels=trip\.progress\.v1%2Calert\.event\.v1/,
    );
    assert.match(opsJson.realtime_subscription_url, /tenant_id=tenant_web_001/);
    assert.equal(opsJson.api_base_url, "http://127.0.0.1:3000");

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

test("web-dashboard expõe detalhe /trips/:tripId e snapshot proxy", async () => {
  const mockedFetch = async (input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
    const urlText =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    assert.equal(urlText, "http://127.0.0.1:3000/api/v1/trips/trip_detail_001");
    assert.equal(init?.method, "GET");

    const headers = new Headers(init?.headers);
    assert.equal(headers.get("x-tenant-id"), "tenant_web_001");

    return new Response(
      JSON.stringify({
        data: {
          id: "trip_detail_001",
          status: "active",
          route_track: {
            progress_pct: 44.5,
            distance_remaining_m: 12500,
            eta_s: 980,
          },
        },
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  };

  const server = createWebDashboardServer(
    {
      port: 0,
      tenantId: "tenant_web_001",
      realtimeWsUrl: "ws://127.0.0.1:3002/ws",
      apiBaseUrl: "http://127.0.0.1:3000",
    },
    {
      fetchImpl: mockedFetch,
    },
  );

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const detailResponse = await fetch(`${baseUrl}/trips/trip_detail_001`);
    assert.equal(detailResponse.status, 200);
    const detailHtml = await detailResponse.text();
    assert.match(detailHtml, /Trip <span id="trip-id">trip_detail_001<\/span>/);
    assert.ok(detailHtml.includes('"snapshotEndpointPath":"/api/trips/trip_detail_001/snapshot"'));

    const snapshotResponse = await fetch(`${baseUrl}/api/trips/trip_detail_001/snapshot`);
    assert.equal(snapshotResponse.status, 200);
    const snapshotJson = (await snapshotResponse.json()) as {
      data: {
        trip_id: string;
        status: string;
        progress_pct: number;
        distance_remaining_m: number;
        eta_s: number;
      };
    };

    assert.equal(snapshotJson.data.trip_id, "trip_detail_001");
    assert.equal(snapshotJson.data.status, "active");
    assert.equal(snapshotJson.data.progress_pct, 44.5);
    assert.equal(snapshotJson.data.distance_remaining_m, 12500);
    assert.equal(snapshotJson.data.eta_s, 980);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
