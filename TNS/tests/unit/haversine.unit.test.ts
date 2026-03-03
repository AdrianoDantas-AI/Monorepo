import assert from "node:assert/strict";
import test from "node:test";
import { haversineDistanceM } from "../../packages/shared/src/index.js";

test("haversineDistanceM retorna distancia aproximada correta", () => {
  // Distancia aproximada entre dois pontos de Sao Paulo (em metros).
  const distance = haversineDistanceM(-23.55052, -46.633308, -23.561414, -46.655881);

  assert.ok(distance > 2500);
  assert.ok(distance < 3200);
});
