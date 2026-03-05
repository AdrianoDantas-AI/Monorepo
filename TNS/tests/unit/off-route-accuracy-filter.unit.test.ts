import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyAccuracyForDetection,
  isAccuracyDegraded,
} from "../../packages/shared/src/off-route-accuracy-filter.js";

test("isAccuracyDegraded retorna true apenas acima do threshold", () => {
  assert.equal(isAccuracyDegraded(10, 30), false);
  assert.equal(isAccuracyDegraded(30, 30), false);
  assert.equal(isAccuracyDegraded(31, 30), true);
});

test("classifyAccuracyForDetection mapeia quality e should_ignore_transition", () => {
  const reliable = classifyAccuracyForDetection(12, 30);
  assert.equal(reliable.quality, "reliable");
  assert.equal(reliable.should_ignore_transition, false);

  const degraded = classifyAccuracyForDetection(45, 30);
  assert.equal(degraded.quality, "degraded");
  assert.equal(degraded.should_ignore_transition, true);
});
