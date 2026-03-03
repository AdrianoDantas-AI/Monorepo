import assert from "node:assert/strict";
import test from "node:test";
import { createDomainModules } from "../../services/api/src/modules/index.js";

test("TripModule normaliza ordem de stops e anexa route_plan", () => {
  const modules = createDomainModules();

  const trip = modules.trip.create({
    id: "trip_1",
    tenant_id: "tenant_1",
    vehicle_id: "vehicle_1",
    driver_id: "driver_1",
    status: "planned",
    stops: [
      {
        id: "stop_b",
        order: 2,
        name: "Destino",
        address: "Rua B",
        location: { lat: -23.56, lng: -46.64 },
      },
      {
        id: "stop_a",
        order: 1,
        name: "Origem",
        address: "Rua A",
        location: { lat: -23.55, lng: -46.63 },
      },
    ],
  });

  const leg = modules.leg.fromStops({
    id: "leg_1",
    from: trip.stops[0],
    to: trip.stops[1],
    polyline: "abc",
    distance_m: 2500,
    duration_s: 600,
  });

  const withPlan = modules.trip.attachRoutePlan(trip, [leg]);

  assert.equal(withPlan.stops[0]?.order, 0);
  assert.equal(withPlan.stops[1]?.order, 1);
  assert.equal(withPlan.route_plan?.total_distance_m, 2500);
  assert.equal(withPlan.route_plan?.total_duration_s, 600);
});
