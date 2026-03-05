import assert from "node:assert/strict";
import test from "node:test";
import {
  detectionTierConfigSchemaV1,
  detectionTierConfigV1,
  getDetectionTierThreshold,
} from "../../packages/contracts/src/detection-tier-config.js";

test("detectionTierConfigV1 expõe versão v1 e tiers obrigatórios", () => {
  const parsed = detectionTierConfigSchemaV1.parse(detectionTierConfigV1);

  assert.equal(parsed.version, "v1");
  assert.ok(parsed.tiers.gold);
  assert.ok(parsed.tiers.silver);
  assert.ok(parsed.tiers.bronze);
});

test("tiers mantêm progressão esperada de sensibilidade", () => {
  const gold = getDetectionTierThreshold("gold");
  const silver = getDetectionTierThreshold("silver");
  const bronze = getDetectionTierThreshold("bronze");

  assert.ok(gold.ping_interval_s < silver.ping_interval_s);
  assert.ok(silver.ping_interval_s < bronze.ping_interval_s);

  assert.ok(gold.corridor_m < silver.corridor_m);
  assert.ok(silver.corridor_m < bronze.corridor_m);

  assert.ok(gold.confirm_min_duration_s < silver.confirm_min_duration_s);
  assert.ok(silver.confirm_min_duration_s < bronze.confirm_min_duration_s);

  assert.ok(gold.degraded_accuracy_m <= silver.degraded_accuracy_m);
  assert.ok(silver.degraded_accuracy_m <= bronze.degraded_accuracy_m);
});
