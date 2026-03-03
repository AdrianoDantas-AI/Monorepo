import assert from "node:assert/strict";
import test from "node:test";
import {
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
