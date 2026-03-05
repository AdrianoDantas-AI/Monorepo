import assert from "node:assert/strict";
import test from "node:test";
import {
  contractVersionTripV1,
  legDTOSchemaV1,
  legSchema,
  nextStopDeepLinksDTOSchemaV1,
  nextStopDeepLinksSchema,
  routePlanDTOSchemaV1,
  routePlanSchema,
  tripProgressDTOSchemaV1,
  tripProgressSchema,
  routeTrackDTOSchemaV1,
  routeTrackSchema,
  stopDTOSchemaV1,
  stopSchema,
  tripDTOSchemaV1,
  tripSchema,
  tripStatusSchema,
  tripStatusSchemaV1,
} from "../../packages/contracts/src/trip.js";

test("contratos de trip expostos com versao v1", () => {
  assert.equal(contractVersionTripV1, "v1");
  assert.equal(tripSchema, tripDTOSchemaV1);
  assert.equal(stopSchema, stopDTOSchemaV1);
  assert.equal(legSchema, legDTOSchemaV1);
  assert.equal(routePlanSchema, routePlanDTOSchemaV1);
  assert.equal(routeTrackSchema, routeTrackDTOSchemaV1);
  assert.equal(nextStopDeepLinksSchema, nextStopDeepLinksDTOSchemaV1);
  assert.equal(tripProgressSchema, tripProgressDTOSchemaV1);
  assert.equal(tripStatusSchema, tripStatusSchemaV1);
});

test("tripStatusSchemaV1 aceita somente status validos", () => {
  assert.equal(tripStatusSchemaV1.parse("planned"), "planned");
  assert.throws(() => tripStatusSchemaV1.parse("paused"));
});
