import assert from "node:assert/strict";
import test from "node:test";
import { generateRoutePlanFromStops } from "../../services/api/src/http/route-plan-generator.js";
import { calculateRouteProgressFromPosition } from "../../packages/shared/src/polyline-progress.js";

test("progresso real sobre polyline evolui ao avançar entre stops", () => {
  const routePlan = generateRoutePlanFromStops("trip_progress_001", [
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
      name: "Meio",
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

  const nearStart = calculateRouteProgressFromPosition(routePlan, { lat: -23.55, lng: -46.63 });
  const nearMiddle = calculateRouteProgressFromPosition(routePlan, { lat: -23.56, lng: -46.62 });
  const nearEnd = calculateRouteProgressFromPosition(routePlan, { lat: -23.57, lng: -46.61 });

  assert.ok(nearStart.progress_pct <= nearMiddle.progress_pct);
  assert.ok(nearMiddle.progress_pct <= nearEnd.progress_pct);
  assert.ok(nearEnd.progress_pct > 90);
  assert.ok(nearEnd.distance_remaining_m < nearMiddle.distance_remaining_m);
});
