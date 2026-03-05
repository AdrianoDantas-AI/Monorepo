import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const migrationPath = path.resolve(
  process.cwd(),
  "services/api/prisma/migrations/2026030302_s2_geo_indexes/migration.sql",
);
const sql = fs.readFileSync(migrationPath, "utf8");

test("migration de geo-indexes habilita postgis e GIST para stops", () => {
  assert.match(sql, /CREATE EXTENSION IF NOT EXISTS postgis;/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS stops_location_gix/i);
  assert.match(sql, /USING GIST/i);
  assert.match(sql, /ST_SetSRID\(ST_MakePoint\("lng", "lat"\), 4326\)/);
});
