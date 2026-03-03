import assert from "node:assert/strict";
import test from "node:test";
import { MockMapProvider } from "../../services/api/src/maps/mock-map.provider.js";

test("mock provider gera rota com legs e metricas", async () => {
  const provider = new MockMapProvider();
  const route = await provider.getRoute({
    waypoints: [
      { lat: -23.55, lng: -46.63 },
      { lat: -23.56, lng: -46.62 },
      { lat: -23.57, lng: -46.61 },
    ],
  });

  assert.equal(route.legs.length, 2);
  assert.ok(route.distanceM > 0);
  assert.ok(route.durationS >= 120);
  assert.match(route.polyline, /\|/);
});

test("mock provider geocode retorna resultado deterministico", async () => {
  const provider = new MockMapProvider();
  const results = await provider.geocode("Av Paulista 1000");

  assert.equal(results.length, 1);
  assert.match(results[0].formattedAddress, /Mock result/);
});
