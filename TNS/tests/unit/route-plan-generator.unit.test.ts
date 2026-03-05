import assert from "node:assert/strict";
import test from "node:test";
import { generateRoutePlanFromStops } from "../../services/api/src/http/route-plan-generator.js";

test("gerador de route plan cria legs com metrica e polyline", () => {
  const routePlan = generateRoutePlanFromStops("trip_plan_001", [
    {
      id: "stop_1",
      order: 0,
      name: "Origem",
      address: "A",
      location: { lat: -23.55, lng: -46.63 },
    },
    {
      id: "stop_2",
      order: 1,
      name: "Ponto 2",
      address: "B",
      location: { lat: -23.56, lng: -46.62 },
    },
    {
      id: "stop_3",
      order: 2,
      name: "Destino",
      address: "C",
      location: { lat: -23.57, lng: -46.61 },
    },
  ]);

  assert.equal(routePlan.legs.length, 2);
  assert.match(routePlan.legs[0].polyline, /-23\./);
  assert.ok(routePlan.legs[0].distance_m > 0);
  assert.ok(routePlan.legs[0].duration_s >= 60);
  assert.equal(routePlan.legs[0].baseline_distance_m, routePlan.legs[0].distance_m);
  assert.equal(routePlan.legs[0].baseline_eta_s, routePlan.legs[0].duration_s);
  assert.equal(
    routePlan.total_distance_m,
    routePlan.legs[0].distance_m + routePlan.legs[1].distance_m,
  );
  assert.equal(
    routePlan.total_duration_s,
    routePlan.legs[0].duration_s + routePlan.legs[1].duration_s,
  );
});

test("gerador de route plan exige no minimo dois stops", () => {
  assert.throws(() =>
    generateRoutePlanFromStops("trip_plan_002", [
      {
        id: "stop_only",
        order: 0,
        name: "Only",
        address: "A",
        location: { lat: 0, lng: 0 },
      },
    ]),
  );
});
