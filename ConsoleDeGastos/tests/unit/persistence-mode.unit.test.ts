import test from "node:test";
import assert from "node:assert/strict";
import { resolvePersistenceMode } from "../../services/api/src/persistence.js";

test("resolvePersistenceMode defaults to memory without DATABASE_URL", () => {
  assert.equal(resolvePersistenceMode(undefined, undefined), "memory");
  assert.equal(resolvePersistenceMode("memory", undefined), "memory");
});

test("resolvePersistenceMode promotes to postgres when DATABASE_URL exists", () => {
  assert.equal(resolvePersistenceMode(undefined, "postgres://localhost/db"), "postgres");
});

test("resolvePersistenceMode rejects postgres mode without DATABASE_URL", () => {
  assert.throws(
    () => resolvePersistenceMode("postgres", undefined),
    /database_url_required_for_postgres_persistence/,
  );
});
