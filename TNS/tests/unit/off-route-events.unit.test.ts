import assert from "node:assert/strict";
import test from "node:test";
import { buildOffRouteTransitionEvent } from "../../packages/shared/src/off-route-events.js";

const baseContext = {
  tenant_id: "tenant_evt_001",
  trip_id: "trip_evt_001",
  vehicle_id: "vehicle_evt_001",
  tier: "bronze" as const,
};

test("emite off_route.suspected.v1 ao detectar saida do corredor", () => {
  const event = buildOffRouteTransitionEvent(
    baseContext,
    {
      timestamp_ms: 1_000,
      distance_to_route_m: 120,
      accuracy_m: 10,
    },
    {
      changed: true,
      reason: "outside_corridor_detected",
      next: {
        state: "suspected",
        consecutive_outside_pings: 1,
        suspected_since_ms: 1_000,
        confirmed_since_ms: null,
      },
    },
  );

  assert.equal(event?.event, "off_route.suspected.v1");
  assert.equal(event?.data.rule, "outside_corridor_detected");
});

test("emite off_route.confirmed.v1 para confirmacao por pings ou duracao", () => {
  const byPings = buildOffRouteTransitionEvent(
    baseContext,
    {
      timestamp_ms: 2_000,
      distance_to_route_m: 150,
      accuracy_m: 12,
    },
    {
      changed: true,
      reason: "confirmation_by_pings",
      next: {
        state: "confirmed",
        consecutive_outside_pings: 2,
        suspected_since_ms: 1_000,
        confirmed_since_ms: 2_000,
      },
    },
  );
  assert.equal(byPings?.event, "off_route.confirmed.v1");

  const byDuration = buildOffRouteTransitionEvent(
    baseContext,
    {
      timestamp_ms: 10_000,
      distance_to_route_m: 140,
      accuracy_m: 12,
    },
    {
      changed: true,
      reason: "confirmation_by_duration",
      next: {
        state: "confirmed",
        consecutive_outside_pings: 2,
        suspected_since_ms: 1_000,
        confirmed_since_ms: 10_000,
      },
    },
  );
  assert.equal(byDuration?.event, "off_route.confirmed.v1");
});

test("emite back_on_route.v1 ao retornar para normal", () => {
  const event = buildOffRouteTransitionEvent(
    baseContext,
    {
      timestamp_ms: 3_000,
      distance_to_route_m: 10,
      accuracy_m: 8,
    },
    {
      changed: true,
      reason: "back_on_route",
      next: {
        state: "normal",
        consecutive_outside_pings: 0,
        suspected_since_ms: null,
        confirmed_since_ms: null,
      },
    },
  );

  assert.equal(event?.event, "back_on_route.v1");
  assert.equal(event?.data.rule, "back_on_route");
});

test("nao emite evento quando nao houve transicao", () => {
  const event = buildOffRouteTransitionEvent(
    baseContext,
    {
      timestamp_ms: 3_000,
      distance_to_route_m: 10,
      accuracy_m: 8,
    },
    {
      changed: false,
      reason: null,
      next: {
        state: "normal",
        consecutive_outside_pings: 0,
        suspected_since_ms: null,
        confirmed_since_ms: null,
      },
    },
  );

  assert.equal(event, null);
});
