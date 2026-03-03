export const realtimeDashboardChannels = ["trip.progress.v1", "alert.event.v1"] as const;
export type RealtimeDashboardChannel = (typeof realtimeDashboardChannels)[number];

export type TripLiveStatus = {
  trip_id: string;
  progress_pct: number | null;
  distance_remaining_m: number | null;
  eta_s: number | null;
  alert_event: string | null;
  last_update_ts: string;
};

export type TripProgressRealtimeUpdate = {
  channel: "trip.progress.v1";
  trip_id: string;
  progress_pct: number;
  distance_remaining_m: number;
  eta_s: number;
  ts: string;
};

export type AlertRealtimeUpdate = {
  channel: "alert.event.v1";
  trip_id: string;
  event: string;
  ts: string;
};

export type DashboardRealtimeUpdate = TripProgressRealtimeUpdate | AlertRealtimeUpdate;

export type TripsLiveState = Record<string, TripLiveStatus>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asNonEmptyString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const asFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
};

const asTimestamp = (value: unknown): string => asNonEmptyString(value) ?? new Date().toISOString();

const isRealtimeDashboardChannel = (value: string): value is RealtimeDashboardChannel =>
  realtimeDashboardChannels.includes(value as RealtimeDashboardChannel);

export const parseDashboardRealtimeUpdate = (
  rawMessage: string,
): DashboardRealtimeUpdate | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawMessage);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) {
    return null;
  }

  const channel = asNonEmptyString(parsed.channel);
  if (!channel || !isRealtimeDashboardChannel(channel)) {
    return null;
  }

  const payload = parsed.payload;
  if (!isRecord(payload)) {
    return null;
  }

  const ts = asTimestamp(parsed.ts);
  const tripId = asNonEmptyString(payload.trip_id);
  if (!tripId) {
    return null;
  }

  if (channel === "trip.progress.v1") {
    const progressPct = asFiniteNumber(payload.progress_pct);
    const distanceRemainingM = asFiniteNumber(payload.distance_remaining_m);
    const etaS = asFiniteNumber(payload.eta_s);

    if (progressPct === null || distanceRemainingM === null || etaS === null) {
      return null;
    }

    return {
      channel,
      trip_id: tripId,
      progress_pct: progressPct,
      distance_remaining_m: distanceRemainingM,
      eta_s: etaS,
      ts,
    };
  }

  const eventName = asNonEmptyString(payload.event);
  if (!eventName) {
    return null;
  }

  return {
    channel,
    trip_id: tripId,
    event: eventName,
    ts,
  };
};

const createEmptyTripLiveStatus = (tripId: string, ts: string): TripLiveStatus => ({
  trip_id: tripId,
  progress_pct: null,
  distance_remaining_m: null,
  eta_s: null,
  alert_event: null,
  last_update_ts: ts,
});

export const applyRealtimeUpdateToTrips = (
  state: TripsLiveState,
  update: DashboardRealtimeUpdate,
): TripsLiveState => {
  const current = state[update.trip_id] ?? createEmptyTripLiveStatus(update.trip_id, update.ts);

  if (update.channel === "trip.progress.v1") {
    return {
      ...state,
      [update.trip_id]: {
        ...current,
        progress_pct: update.progress_pct,
        distance_remaining_m: update.distance_remaining_m,
        eta_s: update.eta_s,
        last_update_ts: update.ts,
      },
    };
  }

  return {
    ...state,
    [update.trip_id]: {
      ...current,
      alert_event: update.event,
      last_update_ts: update.ts,
    },
  };
};

export const sortTripsByLastUpdate = (state: TripsLiveState): TripLiveStatus[] =>
  Object.values(state).sort((left, right) => {
    const byLastUpdate = right.last_update_ts.localeCompare(left.last_update_ts);
    if (byLastUpdate !== 0) {
      return byLastUpdate;
    }

    return left.trip_id.localeCompare(right.trip_id);
  });
