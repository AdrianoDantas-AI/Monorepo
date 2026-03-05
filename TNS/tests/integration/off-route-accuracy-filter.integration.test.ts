import assert from "node:assert/strict";
import test from "node:test";
import { getDetectionTierThreshold } from "../../packages/contracts/src/detection-tier-config.js";
import { classifyAccuracyForDetection } from "../../packages/shared/src/off-route-accuracy-filter.js";

test("filtro respeita thresholds por tier (gold mais sensível que bronze)", () => {
  const gold = getDetectionTierThreshold("gold");
  const bronze = getDetectionTierThreshold("bronze");

  const sampleAccuracy = 35;
  const goldDecision = classifyAccuracyForDetection(sampleAccuracy, gold.degraded_accuracy_m);
  const bronzeDecision = classifyAccuracyForDetection(sampleAccuracy, bronze.degraded_accuracy_m);

  assert.equal(goldDecision.should_ignore_transition, true);
  assert.equal(bronzeDecision.should_ignore_transition, false);
});
