import assert from "node:assert/strict";
import test from "node:test";
import {
  getDemoTripSeedData,
  summarizeDemoTripSeed,
  validateDemoTripSeedConsistency,
} from "../../services/api/prisma/seed-demo.ts";

test("seed demo de trips e deterministico e tem contagens esperadas", () => {
  const trips = getDemoTripSeedData();
  const summary = summarizeDemoTripSeed(trips);

  assert.deepEqual(summary, {
    trips: 2,
    stops: 7,
    legs: 5,
    routePlans: 2,
    routeTracks: 2,
    tenants: ["tenant_demo_alpha", "tenant_demo_beta"],
    tripIds: ["trip_demo_rj_001", "trip_demo_sp_001"],
  });
});

test("seed demo de trips e consistente com regras do dominio", () => {
  assert.doesNotThrow(() => validateDemoTripSeedConsistency(getDemoTripSeedData()));
});

test("seed demo retorna copia isolada para evitar mutacao acidental", () => {
  const mutated = getDemoTripSeedData();
  mutated[0].id = "trip_mutated";

  const fresh = getDemoTripSeedData();
  assert.equal(fresh[0].id, "trip_demo_sp_001");
});
