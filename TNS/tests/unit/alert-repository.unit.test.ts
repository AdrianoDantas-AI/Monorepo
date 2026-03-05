import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryAlertRepository } from "../../services/api/src/http/alert.repository.js";

test("InMemoryAlertRepository lista apenas tenant e aplica filtros", async () => {
  const repository = new InMemoryAlertRepository([
    {
      id: "alert_1",
      tenant_id: "tenant_1",
      trip_id: "trip_1",
      vehicle_id: "veh_1",
      event: "off_route.suspected.v1",
      severity: "high",
      status: "open",
      created_at: "2026-03-03T12:00:00.000Z",
      updated_at: "2026-03-03T12:00:00.000Z",
      data: {},
    },
    {
      id: "alert_2",
      tenant_id: "tenant_1",
      trip_id: "trip_2",
      vehicle_id: "veh_2",
      event: "off_route.confirmed.v1",
      severity: "critical",
      status: "acknowledged",
      created_at: "2026-03-03T12:05:00.000Z",
      updated_at: "2026-03-03T12:05:00.000Z",
      data: {},
    },
    {
      id: "alert_3",
      tenant_id: "tenant_2",
      trip_id: "trip_1",
      vehicle_id: "veh_3",
      event: "back_on_route.v1",
      severity: "low",
      status: "resolved",
      created_at: "2026-03-03T12:10:00.000Z",
      updated_at: "2026-03-03T12:10:00.000Z",
      data: {},
    },
  ]);

  const allTenantAlerts = await repository.listByTenant("tenant_1");
  assert.equal(allTenantAlerts.length, 2);
  assert.equal(allTenantAlerts[0]?.id, "alert_2");
  assert.equal(allTenantAlerts[1]?.id, "alert_1");

  const filtered = await repository.listByTenant("tenant_1", {
    trip_id: "trip_2",
    severity: "critical",
    status: "acknowledged",
  });
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0]?.id, "alert_2");
});
