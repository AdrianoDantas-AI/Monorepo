import assert from "node:assert/strict";
import test from "node:test";
import { parseAlertFiltersFromQuery } from "../../services/api/src/http/alerts.js";

test("parseAlertFiltersFromQuery retorna filtros validos", () => {
  const filters = parseAlertFiltersFromQuery(
    new URLSearchParams({
      trip_id: "trip_123",
      severity: "high",
      status: "open",
    }),
  );

  assert.deepEqual(filters, {
    trip_id: "trip_123",
    severity: "high",
    status: "open",
  });
});

test("parseAlertFiltersFromQuery valida severity e status", () => {
  assert.throws(
    () => parseAlertFiltersFromQuery(new URLSearchParams({ severity: "urgent" })),
    /severity deve ser um de/i,
  );

  assert.throws(
    () => parseAlertFiltersFromQuery(new URLSearchParams({ status: "pending" })),
    /status deve ser um de/i,
  );
});
