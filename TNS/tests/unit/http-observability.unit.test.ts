import assert from "node:assert/strict";
import test from "node:test";
import {
  HttpMetricsRegistry,
  logStructuredTripRequest,
} from "../../services/api/src/http/observability.js";

test("HttpMetricsRegistry agrega contagem, erro e latencia por rota", () => {
  const registry = new HttpMetricsRegistry();

  registry.record("post", "/api/v1/trips", 201, 12);
  registry.record("POST", "/api/v1/trips", 409, 18);
  registry.record("GET", "/health", 200, 5);

  const snapshot = registry.snapshot();
  const postTripsMetric = snapshot.routes.find(
    (route) => route.method === "POST" && route.route === "/api/v1/trips",
  );

  assert.ok(postTripsMetric);
  assert.equal(postTripsMetric.request_count, 2);
  assert.equal(postTripsMetric.error_count, 1);
  assert.equal(postTripsMetric.max_latency_ms, 18);
  assert.equal(postTripsMetric.avg_latency_ms, 15);
});

test("logStructuredTripRequest gera JSON com tenant_id e trip_id", () => {
  const captured: string[] = [];
  const originalConsoleInfo = console.info;
  console.info = (message?: unknown, ...optionalParams: unknown[]) => {
    captured.push([message, ...optionalParams].join(" "));
  };

  try {
    logStructuredTripRequest({
      event: "trip_request",
      method: "GET",
      route: "/api/v1/trips/{tripId}",
      status_code: 200,
      latency_ms: 9,
      tenant_id: "tenant_log_001",
      trip_id: "trip_log_001",
    });
  } finally {
    console.info = originalConsoleInfo;
  }

  assert.equal(captured.length, 1);
  const payload = JSON.parse(captured[0]) as {
    tenant_id: string;
    trip_id: string;
    event: string;
  };
  assert.equal(payload.event, "trip_request");
  assert.equal(payload.tenant_id, "tenant_log_001");
  assert.equal(payload.trip_id, "trip_log_001");
});
