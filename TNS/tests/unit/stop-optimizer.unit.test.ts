import assert from "node:assert/strict";
import test from "node:test";
import { optimizeStopsNearestNeighbor } from "../../services/api/src/http/stop-optimizer.js";

test("optimizador nearest-neighbor reordena stops mantendo origem na posicao 0", () => {
  const result = optimizeStopsNearestNeighbor([
    {
      id: "stop_origin",
      order: 0,
      name: "Origem",
      address: "A",
      location: { lat: 0, lng: 0 },
    },
    {
      id: "stop_far",
      order: 1,
      name: "Longe",
      address: "B",
      location: { lat: 0, lng: 1 },
    },
    {
      id: "stop_near",
      order: 2,
      name: "Perto",
      address: "C",
      location: { lat: 0, lng: 0.1 },
    },
  ]);

  assert.equal(result.strategy, "nearest-neighbor-v1");
  assert.deepEqual(
    result.stops.map((stop) => stop.id),
    ["stop_origin", "stop_near", "stop_far"],
  );
  assert.deepEqual(
    result.stops.map((stop) => stop.order),
    [0, 1, 2],
  );
});

test("optimizador exige no minimo dois stops", () => {
  assert.throws(() =>
    optimizeStopsNearestNeighbor([
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
