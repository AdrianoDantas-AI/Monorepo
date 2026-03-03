import { classifyAccuracyForDetection } from "./off-route-accuracy-filter.js";

export type OffRouteState = "normal" | "suspected" | "confirmed";

export type OffRouteTransitionReason =
  | "outside_corridor_detected"
  | "confirmation_by_pings"
  | "confirmation_by_duration"
  | "back_on_route"
  | "degraded_accuracy_ignored";

export type OffRouteMachineSnapshot = {
  state: OffRouteState;
  consecutive_outside_pings: number;
  suspected_since_ms: number | null;
  confirmed_since_ms: number | null;
};

export type OffRouteTierThresholds = {
  corridor_m: number;
  confirm_min_pings: number;
  confirm_min_duration_s: number;
  degraded_accuracy_m: number;
};

export type OffRouteSample = {
  timestamp_ms: number;
  distance_to_route_m: number;
  accuracy_m: number;
};

export type OffRouteStepResult = {
  next: OffRouteMachineSnapshot;
  changed: boolean;
  reason: OffRouteTransitionReason | null;
};

export const initialOffRouteMachineSnapshot = (): OffRouteMachineSnapshot => ({
  state: "normal",
  consecutive_outside_pings: 0,
  suspected_since_ms: null,
  confirmed_since_ms: null,
});

const isPositiveFinite = (value: number): boolean => Number.isFinite(value) && value >= 0;

export const isOutsideCorridor = (
  sample: OffRouteSample,
  thresholds: OffRouteTierThresholds,
): boolean => sample.distance_to_route_m > thresholds.corridor_m;

export const stepOffRouteStateMachine = (
  current: OffRouteMachineSnapshot,
  sample: OffRouteSample,
  thresholds: OffRouteTierThresholds,
): OffRouteStepResult => {
  if (
    !isPositiveFinite(sample.timestamp_ms) ||
    !isPositiveFinite(sample.distance_to_route_m) ||
    !isPositiveFinite(sample.accuracy_m)
  ) {
    throw new TypeError("Off-route sample invalido: valores numericos devem ser >= 0.");
  }

  if (
    !isPositiveFinite(thresholds.corridor_m) ||
    !isPositiveFinite(thresholds.confirm_min_pings) ||
    !isPositiveFinite(thresholds.confirm_min_duration_s) ||
    !isPositiveFinite(thresholds.degraded_accuracy_m)
  ) {
    throw new TypeError("Thresholds invalidos para maquina de estado off-route.");
  }

  const accuracyFilter = classifyAccuracyForDetection(
    sample.accuracy_m,
    thresholds.degraded_accuracy_m,
  );
  if (accuracyFilter.should_ignore_transition) {
    return {
      next: { ...current },
      changed: false,
      reason: "degraded_accuracy_ignored",
    };
  }

  const outside = isOutsideCorridor(sample, thresholds);
  if (!outside) {
    const changed = current.state !== "normal";
    return {
      next: {
        state: "normal",
        consecutive_outside_pings: 0,
        suspected_since_ms: null,
        confirmed_since_ms: null,
      },
      changed,
      reason: changed ? "back_on_route" : null,
    };
  }

  if (current.state === "normal") {
    return {
      next: {
        state: "suspected",
        consecutive_outside_pings: 1,
        suspected_since_ms: sample.timestamp_ms,
        confirmed_since_ms: null,
      },
      changed: true,
      reason: "outside_corridor_detected",
    };
  }

  if (current.state === "suspected") {
    const nextConsecutive = current.consecutive_outside_pings + 1;
    const suspectedSinceMs = current.suspected_since_ms ?? sample.timestamp_ms;
    const elapsedMs = Math.max(0, sample.timestamp_ms - suspectedSinceMs);
    const reachedByPings = nextConsecutive >= thresholds.confirm_min_pings;
    const reachedByDuration = elapsedMs >= thresholds.confirm_min_duration_s * 1000;

    if (reachedByPings || reachedByDuration) {
      return {
        next: {
          state: "confirmed",
          consecutive_outside_pings: nextConsecutive,
          suspected_since_ms: suspectedSinceMs,
          confirmed_since_ms: sample.timestamp_ms,
        },
        changed: true,
        reason: reachedByPings ? "confirmation_by_pings" : "confirmation_by_duration",
      };
    }

    return {
      next: {
        state: "suspected",
        consecutive_outside_pings: nextConsecutive,
        suspected_since_ms: suspectedSinceMs,
        confirmed_since_ms: null,
      },
      changed: false,
      reason: null,
    };
  }

  return {
    next: {
      ...current,
      consecutive_outside_pings: current.consecutive_outside_pings + 1,
    },
    changed: false,
    reason: null,
  };
};
