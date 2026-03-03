import type { OffRouteSample, OffRouteStepResult } from "./off-route-state-machine.js";

export type OffRouteEventNameV1 =
  | "off_route.suspected.v1"
  | "off_route.confirmed.v1"
  | "back_on_route.v1";

export type OffRouteEventTier = "bronze" | "silver" | "gold";

export type OffRouteEventV1 = {
  event: OffRouteEventNameV1;
  tenant_id: string;
  trip_id: string;
  vehicle_id: string;
  ts: string;
  data: {
    tier?: OffRouteEventTier;
    distance_to_route_m?: number;
    confidence?: number;
    rule?: string;
  };
};

export type OffRouteEventContext = {
  tenant_id: string;
  trip_id: string;
  vehicle_id: string;
  tier?: OffRouteEventTier;
};

const CONFIDENCE_BY_EVENT: Record<OffRouteEventNameV1, number> = {
  "off_route.suspected.v1": 0.7,
  "off_route.confirmed.v1": 0.95,
  "back_on_route.v1": 1,
};

const mapTransitionReasonToEvent = (
  reason: OffRouteStepResult["reason"],
): OffRouteEventNameV1 | null => {
  switch (reason) {
    case "outside_corridor_detected":
      return "off_route.suspected.v1";
    case "confirmation_by_pings":
    case "confirmation_by_duration":
      return "off_route.confirmed.v1";
    case "back_on_route":
      return "back_on_route.v1";
    default:
      return null;
  }
};

const assertContextIsValid = (context: OffRouteEventContext): void => {
  if (!context.tenant_id.trim() || !context.trip_id.trim() || !context.vehicle_id.trim()) {
    throw new TypeError(
      "Contexto de evento off-route invalido: tenant_id, trip_id e vehicle_id sao obrigatorios.",
    );
  }
};

export const buildOffRouteTransitionEvent = (
  context: OffRouteEventContext,
  sample: OffRouteSample,
  stepResult: OffRouteStepResult,
): OffRouteEventV1 | null => {
  assertContextIsValid(context);

  if (!stepResult.changed || !stepResult.reason) {
    return null;
  }

  const eventName = mapTransitionReasonToEvent(stepResult.reason);
  if (!eventName) {
    return null;
  }

  return {
    event: eventName,
    tenant_id: context.tenant_id,
    trip_id: context.trip_id,
    vehicle_id: context.vehicle_id,
    ts: new Date(sample.timestamp_ms).toISOString(),
    data: {
      tier: context.tier,
      distance_to_route_m: sample.distance_to_route_m,
      confidence: CONFIDENCE_BY_EVENT[eventName],
      rule: stepResult.reason,
    },
  };
};
