import assert from "node:assert/strict";
import test from "node:test";
import {
  TripProgressUnavailableError,
  buildTripProgressSnapshot,
  parseTripProgressPositionFromQuery,
} from "../../services/api/src/http/trip-progress.js";

test("parseTripProgressPositionFromQuery converte lat/lng validos", () => {
  const searchParams = new URLSearchParams({ lat: "-23.56", lng: "-46.62" });
  const position = parseTripProgressPositionFromQuery(searchParams);

  assert.deepEqual(position, { lat: -23.56, lng: -46.62 });
});

test("parseTripProgressPositionFromQuery valida ausencia e faixa de coordenadas", () => {
  assert.throws(
    () => parseTripProgressPositionFromQuery(new URLSearchParams({ lat: "-23.56" })),
    /Parametro de query ausente: lng/i,
  );

  assert.throws(
    () => parseTripProgressPositionFromQuery(new URLSearchParams({ lat: "200", lng: "0" })),
    /lat fora do intervalo permitido/i,
  );
});

test("buildTripProgressSnapshot calcula distancias para trip ativa", () => {
  const trip = {
    id: "trip_progress_unit_001",
    tenant_id: "tenant_progress_unit_001",
    vehicle_id: "vehicle_progress_unit_001",
    driver_id: "driver_progress_unit_001",
    status: "active" as const,
    stops: [
      {
        id: "stop_1",
        order: 0,
        name: "Origem",
        address: "Rua A",
        location: { lat: 0, lng: 0 },
      },
      {
        id: "stop_2",
        order: 1,
        name: "Destino",
        address: "Rua B",
        location: { lat: 0, lng: 0.01 },
      },
    ],
    route_plan: {
      legs: [
        {
          id: "leg_1",
          from_stop_id: "stop_1",
          to_stop_id: "stop_2",
          polyline: "0,0;0,0.01",
          distance_m: 1_000,
          duration_s: 120,
          baseline_distance_m: 1_000,
          baseline_eta_s: 120,
        },
      ],
      total_distance_m: 1_000,
      total_duration_s: 120,
    },
    route_track: {
      progress_pct: 0,
      distance_done_m: 0,
      distance_remaining_m: 1_000,
      eta_s: 120,
    },
  };

  const snapshot = buildTripProgressSnapshot(trip, { lat: 0, lng: 0.005 });

  assert.equal(snapshot.matched_leg_id, "leg_1");
  assert.ok(snapshot.progress_pct > 40 && snapshot.progress_pct < 60);
  assert.ok(snapshot.distance_done_m > 400 && snapshot.distance_done_m < 600);
  assert.ok(snapshot.distance_remaining_m > 400 && snapshot.distance_remaining_m < 600);
  assert.equal(snapshot.eta_s, 120);
});

test("buildTripProgressSnapshot exige trip ativa", () => {
  const plannedTrip = {
    id: "trip_progress_unit_002",
    tenant_id: "tenant_progress_unit_001",
    vehicle_id: "vehicle_progress_unit_002",
    driver_id: "driver_progress_unit_002",
    status: "planned" as const,
    stops: [
      {
        id: "stop_1",
        order: 0,
        name: "Origem",
        address: "Rua A",
        location: { lat: 0, lng: 0 },
      },
      {
        id: "stop_2",
        order: 1,
        name: "Destino",
        address: "Rua B",
        location: { lat: 0, lng: 0.01 },
      },
    ],
    route_plan: {
      legs: [
        {
          id: "leg_1",
          from_stop_id: "stop_1",
          to_stop_id: "stop_2",
          polyline: "0,0;0,0.01",
          distance_m: 1_000,
          duration_s: 120,
          baseline_distance_m: 1_000,
          baseline_eta_s: 120,
        },
      ],
      total_distance_m: 1_000,
      total_duration_s: 120,
    },
  };

  assert.throws(
    () => buildTripProgressSnapshot(plannedTrip, { lat: 0, lng: 0.005 }),
    TripProgressUnavailableError,
  );
});
