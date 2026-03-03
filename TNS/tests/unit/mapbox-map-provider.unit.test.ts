import assert from "node:assert/strict";
import test from "node:test";
import {
  MapboxMapProvider,
  type FetchLike,
} from "../../services/api/src/maps/mapbox-map.provider.js";

test("mapbox provider parseia directions e geocoding via fetch injetado", async () => {
  const calls: string[] = [];
  const fakeFetch: FetchLike = async (input) => {
    const url = input.toString();
    calls.push(url);

    if (url.includes("/directions/v5/mapbox/driving/")) {
      return new Response(
        JSON.stringify({
          routes: [
            {
              geometry: "polyline_route",
              distance: 2500.4,
              duration: 420.1,
              legs: [
                {
                  geometry: "polyline_leg_1",
                  distance: 2500.4,
                  duration: 420.1,
                },
              ],
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (url.includes("/geocoding/v5/mapbox.places/")) {
      return new Response(
        JSON.stringify({
          features: [
            {
              place_name: "Av Paulista, Sao Paulo - SP",
              center: [-46.65, -23.56],
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    return new Response("{}", { status: 404 });
  };

  const provider = new MapboxMapProvider("mapbox_token", fakeFetch);
  const route = await provider.getRoute({
    waypoints: [
      { lat: -23.55, lng: -46.63 },
      { lat: -23.56, lng: -46.62 },
    ],
  });
  const geocode = await provider.geocode("Av Paulista");

  assert.equal(route.polyline, "polyline_route");
  assert.equal(route.legs.length, 1);
  assert.equal(route.distanceM, 2500);
  assert.equal(geocode[0].formattedAddress, "Av Paulista, Sao Paulo - SP");
  assert.ok(calls.some((url) => url.includes("/directions/v5/mapbox/driving/")));
  assert.ok(calls.some((url) => url.includes("/geocoding/v5/mapbox.places/")));
});

test("mapbox provider exige token", () => {
  assert.throws(() => new MapboxMapProvider(""));
});
