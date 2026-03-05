import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateRouteProgressFromPosition,
  decodeMockPolyline,
} from "../../packages/shared/src/polyline-progress.js";

test("decodeMockPolyline converte formato mock para lista de pontos", () => {
  const points = decodeMockPolyline("-23.55,-46.63;-23.56,-46.62");

  assert.equal(points.length, 2);
  assert.deepEqual(points[0], { lat: -23.55, lng: -46.63 });
  assert.deepEqual(points[1], { lat: -23.56, lng: -46.62 });
});

test("calculateRouteProgressFromPosition calcula progresso aproximado por leg", () => {
  const routePlan = {
    legs: [
      {
        id: "leg_1",
        polyline: "0,0;0,0.01",
        distance_m: 1000,
      },
      {
        id: "leg_2",
        polyline: "0,0.01;0,0.02",
        distance_m: 1000,
      },
    ],
    total_distance_m: 2000,
  };

  const firstHalf = calculateRouteProgressFromPosition(routePlan, { lat: 0, lng: 0.005 });
  assert.equal(firstHalf.matched_leg_id, "leg_1");
  assert.ok(firstHalf.progress_pct > 20 && firstHalf.progress_pct < 30);
  assert.ok(firstHalf.distance_done_m > 400 && firstHalf.distance_done_m < 600);

  const secondHalf = calculateRouteProgressFromPosition(routePlan, { lat: 0, lng: 0.015 });
  assert.equal(secondHalf.matched_leg_id, "leg_2");
  assert.ok(secondHalf.progress_pct > 70 && secondHalf.progress_pct < 80);
  assert.ok(secondHalf.distance_done_m > 1400 && secondHalf.distance_done_m < 1600);
});
