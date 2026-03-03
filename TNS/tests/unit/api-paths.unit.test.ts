import assert from "node:assert/strict";
import test from "node:test";
import {
  extractTripIdForProgressPath,
  extractTripIdForNextStopDeepLinksPath,
  extractTripIdForStartPath,
  extractTripIdForStopOptimizationPath,
  extractTripIdFromPathname,
} from "../../services/api/src/http/app.js";

test("extractTripIdFromPathname extrai tripId de rota valida", () => {
  assert.equal(extractTripIdFromPathname("/api/v1/trips/trip_123"), "trip_123");
  assert.equal(extractTripIdFromPathname("/api/v1/trips/trip%20abc"), "trip abc");
});

test("extractTripIdFromPathname retorna null para rotas invalidas", () => {
  assert.equal(extractTripIdFromPathname("/api/v1/trips"), null);
  assert.equal(extractTripIdFromPathname("/api/v1/trips/"), null);
  assert.equal(extractTripIdFromPathname("/api/v1/trips/trip_1/legs"), null);
});

test("extractTripIdForStopOptimizationPath reconhece rota de otimizacao", () => {
  assert.equal(
    extractTripIdForStopOptimizationPath("/api/v1/trips/trip_123/stops/optimize"),
    "trip_123",
  );
  assert.equal(extractTripIdForStopOptimizationPath("/api/v1/trips/trip_123"), null);
});

test("extractTripIdForStartPath reconhece rota de inicio da trip", () => {
  assert.equal(extractTripIdForStartPath("/api/v1/trips/trip_123/start"), "trip_123");
  assert.equal(extractTripIdForStartPath("/api/v1/trips/trip_123/stops/optimize"), null);
});

test("extractTripIdForNextStopDeepLinksPath reconhece rota de deep links", () => {
  assert.equal(
    extractTripIdForNextStopDeepLinksPath("/api/v1/trips/trip_123/deep-links/next-stop"),
    "trip_123",
  );
  assert.equal(extractTripIdForNextStopDeepLinksPath("/api/v1/trips/trip_123/start"), null);
});

test("extractTripIdForProgressPath reconhece rota de progresso", () => {
  assert.equal(extractTripIdForProgressPath("/api/v1/trips/trip_123/progress"), "trip_123");
  assert.equal(extractTripIdForProgressPath("/api/v1/trips/trip_123/deep-links/next-stop"), null);
});
