import assert from "node:assert/strict";
import test from "node:test";
import {
  alertEventSchema,
  detectionTierConfigSchemaV1,
  detectionTierConfigV1,
  pingIngestSchema,
  tripProgressSchema,
  tripSchema,
} from "../../packages/contracts/src/index.js";

test("pingIngestSchema + tripSchema + alertEventSchema validam payloads esperados", () => {
  const ping = pingIngestSchema.parse({
    timestamp: "2026-03-03T00:00:00.000Z",
    lat: -23.55052,
    lng: -46.633308,
    accuracy_m: 12,
    speed_mps: 8.5,
    heading_deg: 100,
    device_id: "dev_1",
    driver_id: "drv_1",
    vehicle_id: "veh_1",
    trip_id: "trip_1",
  });

  const trip = tripSchema.parse({
    id: "trip_1",
    tenant_id: "tenant_1",
    vehicle_id: "veh_1",
    driver_id: "drv_1",
    status: "planned",
    stops: [
      {
        id: "stop_a",
        order: 0,
        name: "Origem",
        address: "A",
        location: { lat: -23.55, lng: -46.63 },
      },
      {
        id: "stop_b",
        order: 1,
        name: "Destino",
        address: "B",
        location: { lat: -23.56, lng: -46.64 },
      },
    ],
  });

  const event = alertEventSchema.parse({
    event: "off_route.suspected.v1",
    tenant_id: trip.tenant_id,
    trip_id: trip.id,
    vehicle_id: trip.vehicle_id,
    ts: "2026-03-03T00:01:00.000Z",
    data: {
      tier: "bronze",
      distance_to_route_m: 120,
      confidence: 0.8,
      rule: "2_pings_outside_100m",
    },
  });

  assert.equal(ping.trip_id, trip.id);
  assert.equal(event.tenant_id, trip.tenant_id);

  const tierConfig = detectionTierConfigSchemaV1.parse(detectionTierConfigV1);
  assert.equal(tierConfig.version, "v1");
  assert.equal(tierConfig.tiers.gold.ping_interval_s, 1);
  assert.equal(tierConfig.tiers.silver.corridor_m, 30);
  assert.equal(tierConfig.tiers.bronze.confirm_min_duration_s, 120);

  const progress = tripProgressSchema.parse({
    trip_id: trip.id,
    status: "active",
    route_track: {
      progress_pct: 55,
      distance_done_m: 5500,
      distance_remaining_m: 4500,
      eta_s: 410,
    },
    matched_leg_id: "trip_1_leg_2",
    matched_leg_index: 1,
    distance_to_route_m: 12.3,
  });
  assert.equal(progress.trip_id, trip.id);
});
