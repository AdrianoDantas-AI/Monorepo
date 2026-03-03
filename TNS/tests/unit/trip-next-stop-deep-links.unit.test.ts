import assert from "node:assert/strict";
import test from "node:test";
import type { TripDTO } from "../../services/api/src/modules/domain.types.js";
import {
  NextStopUnavailableError,
  buildGoogleMapsDeepLink,
  buildNextStopDeepLinksForTrip,
  buildWazeDeepLink,
  resolveNextStopForTrip,
} from "../../services/api/src/http/trip-next-stop-deep-links.js";

const createTripFixture = (): TripDTO => ({
  id: "trip_deep_links_001",
  tenant_id: "tenant_deep_links_001",
  vehicle_id: "vehicle_deep_links_001",
  driver_id: "driver_deep_links_001",
  status: "planned",
  stops: [
    {
      id: "stop_origin",
      order: 0,
      name: "Origem",
      address: "Rua A, 10",
      location: { lat: -23.55, lng: -46.63 },
    },
    {
      id: "stop_mid",
      order: 1,
      name: "Parada Intermediaria",
      address: "Rua B, 20",
      location: { lat: -23.56, lng: -46.62 },
    },
    {
      id: "stop_dest",
      order: 2,
      name: "Destino Final",
      address: "Rua C, 30",
      location: { lat: -23.57, lng: -46.61 },
    },
  ],
});

test("gerador de deep links cria URLs validas para Google Maps e Waze", () => {
  const trip = createTripFixture();
  const targetStop = trip.stops[1];

  const googleMaps = buildGoogleMapsDeepLink(targetStop);
  const waze = buildWazeDeepLink(targetStop);

  assert.match(googleMaps, /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
  assert.match(googleMaps, /destination=-23\.56%2C-46\.62/);
  assert.match(googleMaps, /travelmode=driving/);
  assert.match(waze, /^https:\/\/www\.waze\.com\/ul\?ll=/);
  assert.match(waze, /ll=-23\.56%2C-46\.62/);
  assert.match(waze, /navigate=yes/);
});

test("resolveNextStopForTrip retorna primeira parada para trip planned", () => {
  const trip = createTripFixture();
  const resolved = resolveNextStopForTrip(trip);

  assert.equal(resolved?.id, "stop_origin");
});

test("resolveNextStopForTrip em trip active usa destino da perna corrente por distancia", () => {
  const trip = createTripFixture();
  const activeTrip: TripDTO = {
    ...trip,
    status: "active",
    route_plan: {
      legs: [
        {
          id: "trip_deep_links_001_leg_1",
          from_stop_id: "stop_origin",
          to_stop_id: "stop_mid",
          polyline: "abc123",
          distance_m: 1_000,
          duration_s: 180,
        },
        {
          id: "trip_deep_links_001_leg_2",
          from_stop_id: "stop_mid",
          to_stop_id: "stop_dest",
          polyline: "def456",
          distance_m: 1_500,
          duration_s: 240,
        },
      ],
      total_distance_m: 2_500,
      total_duration_s: 420,
    },
    route_track: {
      progress_pct: 0,
      distance_done_m: 0,
      distance_remaining_m: 2_500,
      eta_s: 420,
    },
  };

  const resolved = resolveNextStopForTrip(activeTrip);

  assert.equal(resolved?.id, "stop_mid");
});

test("buildNextStopDeepLinksForTrip retorna erro quando trip nao possui proxima parada", () => {
  const trip = createTripFixture();
  const completedTrip: TripDTO = {
    ...trip,
    status: "completed",
  };

  assert.throws(
    () => buildNextStopDeepLinksForTrip(completedTrip),
    (error: unknown) =>
      error instanceof NextStopUnavailableError && error.tripId === completedTrip.id,
  );
});
