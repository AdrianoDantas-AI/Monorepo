import assert from "node:assert/strict";
import test from "node:test";
import { getDetectionTierThreshold } from "../../packages/contracts/src/detection-tier-config.js";
import {
  initialOffRouteMachineSnapshot,
  stepOffRouteStateMachine,
} from "../../packages/shared/src/off-route-state-machine.js";

test("maquina inicia em normal e transita para suspected quando sai do corredor", () => {
  const bronze = getDetectionTierThreshold("bronze");
  const step = stepOffRouteStateMachine(
    initialOffRouteMachineSnapshot(),
    {
      timestamp_ms: 1_000,
      distance_to_route_m: bronze.corridor_m + 10,
      accuracy_m: bronze.degraded_accuracy_m - 5,
    },
    bronze,
  );

  assert.equal(step.next.state, "suspected");
  assert.equal(step.next.consecutive_outside_pings, 1);
  assert.equal(step.reason, "outside_corridor_detected");
});

test("maquina confirma por quantidade de pings fora do corredor", () => {
  const silver = getDetectionTierThreshold("silver");
  let snapshot = initialOffRouteMachineSnapshot();

  const first = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 1_000,
      distance_to_route_m: silver.corridor_m + 20,
      accuracy_m: silver.degraded_accuracy_m - 3,
    },
    silver,
  );
  snapshot = first.next;

  const second = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 2_000,
      distance_to_route_m: silver.corridor_m + 30,
      accuracy_m: silver.degraded_accuracy_m - 2,
    },
    silver,
  );

  assert.equal(second.next.state, "confirmed");
  assert.equal(second.reason, "confirmation_by_pings");
});

test("maquina confirma por janela de tempo quando pings minimos nao foram atingidos", () => {
  const gold = getDetectionTierThreshold("gold");
  let snapshot = initialOffRouteMachineSnapshot();

  snapshot = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 10_000,
      distance_to_route_m: gold.corridor_m + 5,
      accuracy_m: gold.degraded_accuracy_m - 1,
    },
    gold,
  ).next;

  const result = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 20_000,
      distance_to_route_m: gold.corridor_m + 5,
      accuracy_m: gold.degraded_accuracy_m - 1,
    },
    {
      ...gold,
      confirm_min_pings: 99,
    },
  );

  assert.equal(result.next.state, "confirmed");
  assert.equal(result.reason, "confirmation_by_duration");
});

test("maquina retorna para normal quando volta ao corredor", () => {
  const bronze = getDetectionTierThreshold("bronze");
  let snapshot = initialOffRouteMachineSnapshot();
  snapshot = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 1_000,
      distance_to_route_m: bronze.corridor_m + 1,
      accuracy_m: bronze.degraded_accuracy_m - 1,
    },
    bronze,
  ).next;

  const result = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 2_000,
      distance_to_route_m: bronze.corridor_m - 1,
      accuracy_m: bronze.degraded_accuracy_m - 1,
    },
    bronze,
  );

  assert.equal(result.next.state, "normal");
  assert.equal(result.reason, "back_on_route");
});

test("maquina ignora amostra com accuracy degradado sem transicionar estado", () => {
  const bronze = getDetectionTierThreshold("bronze");
  const snapshot = initialOffRouteMachineSnapshot();

  const result = stepOffRouteStateMachine(
    snapshot,
    {
      timestamp_ms: 2_000,
      distance_to_route_m: bronze.corridor_m + 200,
      accuracy_m: bronze.degraded_accuracy_m + 10,
    },
    bronze,
  );

  assert.deepEqual(result.next, snapshot);
  assert.equal(result.reason, "degraded_accuracy_ignored");
});
