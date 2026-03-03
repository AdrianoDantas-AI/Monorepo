import assert from "node:assert/strict";
import test from "node:test";
import { getDetectionTierThreshold } from "../../packages/contracts/src/detection-tier-config.js";
import {
  initialOffRouteMachineSnapshot,
  stepOffRouteStateMachine,
} from "../../packages/shared/src/off-route-state-machine.js";

test("fluxo bronze: normal -> suspected -> confirmed -> normal", () => {
  const bronze = getDetectionTierThreshold("bronze");
  let snapshot = initialOffRouteMachineSnapshot();

  const samples = [
    {
      timestamp_ms: 1_000,
      distance_to_route_m: bronze.corridor_m + 10,
      accuracy_m: 15,
    },
    {
      timestamp_ms: 31_000,
      distance_to_route_m: bronze.corridor_m + 12,
      accuracy_m: 20,
    },
    {
      timestamp_ms: 61_000,
      distance_to_route_m: bronze.corridor_m + 14,
      accuracy_m: 21,
    },
    {
      timestamp_ms: 91_000,
      distance_to_route_m: bronze.corridor_m - 2,
      accuracy_m: 18,
    },
  ];

  const first = stepOffRouteStateMachine(snapshot, samples[0], bronze);
  snapshot = first.next;
  assert.equal(snapshot.state, "suspected");

  const second = stepOffRouteStateMachine(snapshot, samples[1], bronze);
  snapshot = second.next;
  assert.equal(snapshot.state, "suspected");

  const third = stepOffRouteStateMachine(snapshot, samples[2], bronze);
  snapshot = third.next;
  assert.equal(snapshot.state, "confirmed");
  assert.equal(third.reason, "confirmation_by_pings");

  const fourth = stepOffRouteStateMachine(snapshot, samples[3], bronze);
  assert.equal(fourth.next.state, "normal");
  assert.equal(fourth.reason, "back_on_route");
});
