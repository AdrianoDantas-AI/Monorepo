import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const migrationPath = path.resolve(
  process.cwd(),
  "services/api/prisma/migrations/2026030301_s2_trip_domain_init/migration.sql",
);
const geoMigrationPath = path.resolve(
  process.cwd(),
  "services/api/prisma/migrations/2026030302_s2_geo_indexes/migration.sql",
);

test("migration SQL inicial de viagens foi gerada e contem DDL esperado", () => {
  assert.ok(fs.existsSync(migrationPath), "Arquivo de migration nao encontrado.");
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.match(sql, /CREATE TYPE "TripStatus"/);
  assert.match(sql, /CREATE TABLE "trips"/);
  assert.match(sql, /CREATE TABLE "stops"/);
  assert.match(sql, /CREATE TABLE "legs"/);
  assert.match(sql, /CREATE TABLE "route_plans"/);
  assert.match(sql, /CREATE TABLE "route_tracks"/);
  assert.match(sql, /ALTER TABLE "stops" ADD CONSTRAINT "stops_trip_id_fkey"/);
  assert.match(sql, /ALTER TABLE "legs" ADD CONSTRAINT "legs_trip_id_fkey"/);
});

test("migration de geo-indexes contem indices essenciais da sprint 2", () => {
  assert.ok(fs.existsSync(geoMigrationPath), "Arquivo de migration de geo-indexes nao encontrado.");
  const sql = fs.readFileSync(geoMigrationPath, "utf8");

  assert.match(sql, /CREATE EXTENSION IF NOT EXISTS postgis;/);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS stops_location_gix/i);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS legs_trip_stop_pair_idx/i);
  assert.match(sql, /CREATE INDEX IF NOT EXISTS route_tracks_trip_progress_idx/i);
});
