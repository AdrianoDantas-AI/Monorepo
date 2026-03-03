import assert from "node:assert/strict";
import test from "node:test";
import { createDomainModules } from "../../services/api/src/modules/index.js";

test("fluxo de dominio: create trip -> plan legs -> update route_track", () => {
  const modules = createDomainModules();

  const baseTrip = modules.trip.create({
    id: "trip_flow_1",
    tenant_id: "tenant_1",
    vehicle_id: "vehicle_1",
    driver_id: "driver_1",
    status: "planned",
    stops: [
      {
        id: "stop_1",
        order: 0,
        name: "Ponto A",
        address: "A",
        location: { lat: -23.55, lng: -46.63 },
      },
      {
        id: "stop_2",
        order: 1,
        name: "Ponto B",
        address: "B",
        location: { lat: -23.56, lng: -46.64 },
      },
      {
        id: "stop_3",
        order: 2,
        name: "Ponto C",
        address: "C",
        location: { lat: -23.57, lng: -46.65 },
      },
    ],
  });

  const legA = modules.leg.fromStops({
    id: "leg_a",
    from: baseTrip.stops[0],
    to: baseTrip.stops[1],
    polyline: "polyline_a",
    distance_m: 1500,
    duration_s: 420,
  });

  const legB = modules.leg.fromStops({
    id: "leg_b",
    from: baseTrip.stops[1],
    to: baseTrip.stops[2],
    polyline: "polyline_b",
    distance_m: 2300,
    duration_s: 540,
  });

  const plannedTrip = modules.trip.attachRoutePlan(baseTrip, [legA, legB]);
  const trackedTrip = modules.trip.updateRouteTrack(plannedTrip, 1900, 700);

  assert.equal(plannedTrip.route_plan?.legs.length, 2);
  assert.equal(plannedTrip.route_plan?.total_distance_m, 3800);
  assert.equal(plannedTrip.route_plan?.total_duration_s, 960);
  assert.equal(plannedTrip.route_plan?.legs[0]?.baseline_distance_m, 1500);
  assert.equal(plannedTrip.route_plan?.legs[0]?.baseline_eta_s, 420);
  assert.equal(trackedTrip.route_track?.distance_done_m, 1900);
  assert.equal(trackedTrip.route_track?.distance_remaining_m, 1900);
  assert.equal(trackedTrip.route_track?.eta_s, 700);
  assert.equal(trackedTrip.route_track?.progress_pct, 50);
});
