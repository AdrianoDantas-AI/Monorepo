import assert from "node:assert/strict";
import test from "node:test";
import { getDetectionTierThreshold } from "../../packages/contracts/src/detection-tier-config.js";
import { alertEventSchema } from "../../packages/contracts/src/events.js";
import { buildOffRouteTransitionEvent } from "../../packages/shared/src/off-route-events.js";
import {
  initialOffRouteMachineSnapshot,
  stepOffRouteStateMachine,
} from "../../packages/shared/src/off-route-state-machine.js";

test("fluxo normal -> suspected -> confirmed -> normal emite eventos v1 esperados", () => {
  const bronze = getDetectionTierThreshold("bronze");
  let snapshot = initialOffRouteMachineSnapshot();

  const context = {
    tenant_id: "tenant_evt_int_001",
    trip_id: "trip_evt_int_001",
    vehicle_id: "vehicle_evt_int_001",
    tier: "bronze" as const,
  };

  const samples = [
    {
      timestamp_ms: 1_000,
      distance_to_route_m: bronze.corridor_m + 12,
      accuracy_m: bronze.degraded_accuracy_m - 4,
    },
    {
      timestamp_ms: 31_000,
      distance_to_route_m: bronze.corridor_m + 16,
      accuracy_m: bronze.degraded_accuracy_m - 4,
    },
    {
      timestamp_ms: 61_000,
      distance_to_route_m: bronze.corridor_m + 20,
      accuracy_m: bronze.degraded_accuracy_m - 4,
    },
    {
      timestamp_ms: 91_000,
      distance_to_route_m: bronze.corridor_m - 1,
      accuracy_m: bronze.degraded_accuracy_m - 4,
    },
  ];

  const emittedEvents: Array<string> = [];

  for (const sample of samples) {
    const step = stepOffRouteStateMachine(snapshot, sample, bronze);
    snapshot = step.next;

    const event = buildOffRouteTransitionEvent(context, sample, step);
    if (event) {
      const parsed = alertEventSchema.parse(event);
      emittedEvents.push(parsed.event);
    }
  }

  assert.deepEqual(emittedEvents, [
    "off_route.suspected.v1",
    "off_route.confirmed.v1",
    "back_on_route.v1",
  ]);
});
