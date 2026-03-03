import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  legDTOSchemaV1,
  stopDTOSchemaV1,
  tripDTOSchemaV1,
} from "../../packages/contracts/src/trip.js";

const snapshotsDir = path.resolve(process.cwd(), "tests/snapshots/contracts");

const readSnapshot = (fileName: string): string =>
  fs.readFileSync(path.resolve(snapshotsDir, fileName), "utf8");

const toSnapshotText = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

test("StopDTO v1 snapshot permanece estavel", () => {
  const stopPayload = stopDTOSchemaV1.parse({
    id: "stop_snapshot_001",
    order: 0,
    name: "Origem",
    address: "Rua A, 100 - Sao Paulo",
    location: {
      lat: -23.55,
      lng: -46.63,
    },
  });

  assert.equal(toSnapshotText(stopPayload), readSnapshot("stop-dto.v1.snapshot.json"));
});

test("LegDTO v1 snapshot permanece estavel", () => {
  const legPayload = legDTOSchemaV1.parse({
    id: "leg_snapshot_001",
    from_stop_id: "stop_snapshot_001",
    to_stop_id: "stop_snapshot_002",
    polyline: "snapshot_polyline_001",
    distance_m: 12500,
    duration_s: 2100,
    baseline_distance_m: 12500,
    baseline_eta_s: 2100,
  });

  assert.equal(toSnapshotText(legPayload), readSnapshot("leg-dto.v1.snapshot.json"));
});

test("TripDTO v1 snapshot permanece estavel", () => {
  const tripPayload = tripDTOSchemaV1.parse({
    id: "trip_snapshot_001",
    tenant_id: "tenant_snapshot_001",
    vehicle_id: "vehicle_snapshot_001",
    driver_id: "driver_snapshot_001",
    status: "planned",
    stops: [
      {
        id: "stop_snapshot_001",
        order: 0,
        name: "Origem",
        address: "Rua A, 100 - Sao Paulo",
        location: {
          lat: -23.55,
          lng: -46.63,
        },
      },
      {
        id: "stop_snapshot_002",
        order: 1,
        name: "Destino",
        address: "Rua B, 200 - Sao Paulo",
        location: {
          lat: -23.57,
          lng: -46.64,
        },
      },
    ],
    route_plan: {
      legs: [
        {
          id: "leg_snapshot_001",
          from_stop_id: "stop_snapshot_001",
          to_stop_id: "stop_snapshot_002",
          polyline: "snapshot_polyline_001",
          distance_m: 12500,
          duration_s: 2100,
          baseline_distance_m: 12500,
          baseline_eta_s: 2100,
        },
      ],
      total_distance_m: 12500,
      total_duration_s: 2100,
    },
    route_track: {
      progress_pct: 42,
      distance_done_m: 5250,
      distance_remaining_m: 7250,
      eta_s: 1300,
    },
  });

  assert.equal(toSnapshotText(tripPayload), readSnapshot("trip-dto.v1.snapshot.json"));
});
