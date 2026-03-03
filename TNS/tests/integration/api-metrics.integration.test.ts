import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createApiHandler } from "../../services/api/src/http/app.js";

const startServer = async (): Promise<{ baseUrl: string; close: () => Promise<void> }> => {
  const handler = createApiHandler();
  const server = createServer((req, res) => {
    void handler(req, res);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        (server as Server).close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
};

test("GET /ops/metrics exporta latencia agregada dos endpoints de trips", async () => {
  const app = await startServer();

  const tripPayload = {
    id: "trip_metrics_001",
    tenant_id: "tenant_metrics_001",
    vehicle_id: "vehicle_metrics_001",
    driver_id: "driver_metrics_001",
    status: "planned",
    stops: [
      {
        id: "stop_metrics_001",
        order: 0,
        name: "Origem",
        address: "Rua A",
        location: { lat: -23.55, lng: -46.63 },
      },
      {
        id: "stop_metrics_002",
        order: 1,
        name: "Destino",
        address: "Rua B",
        location: { lat: -23.56, lng: -46.64 },
      },
    ],
  };

  try {
    const createResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_metrics_001",
      },
      body: JSON.stringify(tripPayload),
    });
    assert.equal(createResponse.status, 201);

    const getResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_metrics_001`, {
      headers: {
        "x-tenant-id": "tenant_metrics_001",
      },
    });
    assert.equal(getResponse.status, 200);

    const missingTenantResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_metrics_001`);
    assert.equal(missingTenantResponse.status, 400);

    const metricsResponse = await fetch(`${app.baseUrl}/ops/metrics`);
    assert.equal(metricsResponse.status, 200);

    const metricsPayload = (await metricsResponse.json()) as {
      status: string;
      metrics: {
        routes: Array<{
          method: string;
          route: string;
          request_count: number;
          error_count: number;
          avg_latency_ms: number;
          max_latency_ms: number;
        }>;
      };
    };

    assert.equal(metricsPayload.status, "ok");

    const postTripsMetric = metricsPayload.metrics.routes.find(
      (metric) => metric.method === "POST" && metric.route === "/api/v1/trips",
    );
    const getTripMetric = metricsPayload.metrics.routes.find(
      (metric) => metric.method === "GET" && metric.route === "/api/v1/trips/{tripId}",
    );

    assert.ok(postTripsMetric);
    assert.equal(postTripsMetric.request_count, 1);
    assert.equal(postTripsMetric.error_count, 0);
    assert.ok(postTripsMetric.avg_latency_ms >= 0);

    assert.ok(getTripMetric);
    assert.equal(getTripMetric.request_count, 2);
    assert.equal(getTripMetric.error_count, 1);
    assert.ok(getTripMetric.max_latency_ms >= getTripMetric.avg_latency_ms);
  } finally {
    await app.close();
  }
});
