import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const schemaPath = path.resolve(process.cwd(), "services/api/prisma/schema.prisma");
const schema = fs.readFileSync(schemaPath, "utf8");

test("schema Prisma define modelos centrais de viagens", () => {
  const requiredModels = [
    "model Trip",
    "model Stop",
    "model Leg",
    "model RoutePlan",
    "model RouteTrack",
  ];

  for (const model of requiredModels) {
    assert.match(schema, new RegExp(`\\b${model}\\b`), `Modelo ausente no schema: ${model}`);
  }
});

test("schema Prisma define enum TripStatus com estados esperados", () => {
  assert.match(schema, /\benum TripStatus\b/);
  assert.match(schema, /\bdraft\b/);
  assert.match(schema, /\bplanned\b/);
  assert.match(schema, /\bactive\b/);
  assert.match(schema, /\bcompleted\b/);
  assert.match(schema, /\bcanceled\b/);
});
