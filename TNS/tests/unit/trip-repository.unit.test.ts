import assert from "node:assert/strict";
import test from "node:test";
import {
  InMemoryTripRepository,
  TripConflictError,
} from "../../services/api/src/http/trip.repository.js";

const sampleTrip = {
  id: "trip_repo_001",
  tenant_id: "tenant_repo_a",
  vehicle_id: "vehicle_repo_001",
  driver_id: "driver_repo_001",
  status: "planned" as const,
  stops: [
    {
      id: "stop_repo_001",
      order: 0,
      name: "Origem",
      address: "A",
      location: { lat: -23.55, lng: -46.63 },
    },
    {
      id: "stop_repo_002",
      order: 1,
      name: "Destino",
      address: "B",
      location: { lat: -23.56, lng: -46.64 },
    },
  ],
};

test("repositorio em memoria aplica escopo por tenant e bloqueia duplicidade", async () => {
  const repository = new InMemoryTripRepository();

  const created = await repository.create(sampleTrip);
  assert.equal(created.tenant_id, "tenant_repo_a");

  await assert.rejects(() => repository.create(sampleTrip), TripConflictError);
  assert.deepEqual(await repository.getById("tenant_repo_a", "trip_repo_001"), created);
  assert.equal(await repository.getById("tenant_repo_b", "trip_repo_001"), null);
});
