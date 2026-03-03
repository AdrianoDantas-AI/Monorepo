import { calculateRouteProgressFromPosition } from "@tns/shared/src/polyline-progress.js";
import type { RouteTrackDTO, TripDTO } from "../modules/domain.types.js";

export type TripProgressPosition = {
  lat: number;
  lng: number;
};

export type TripProgressSnapshotDTO = RouteTrackDTO & {
  matched_leg_id: string;
  matched_leg_index: number;
  distance_to_route_m: number;
};

export class TripProgressUnavailableError extends Error {
  constructor(
    public readonly tripId: string,
    message = `Trip ${tripId} nao esta elegivel para calculo de progresso.`,
  ) {
    super(message);
    this.name = "TripProgressUnavailableError";
  }
}

const parseCoordinate = (
  value: string | null,
  label: "lat" | "lng",
  min: number,
  max: number,
): number => {
  if (value === null || value.trim() === "") {
    throw new TypeError(`Parametro de query ausente: ${label}.`);
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new TypeError(`Parametro de query invalido: ${label} deve ser numero.`);
  }

  if (parsed < min || parsed > max) {
    throw new TypeError(`Parametro de query invalido: ${label} fora do intervalo permitido.`);
  }

  return parsed;
};

export const parseTripProgressPositionFromQuery = (
  searchParams: URLSearchParams,
): TripProgressPosition => {
  const lat = parseCoordinate(searchParams.get("lat"), "lat", -90, 90);
  const lng = parseCoordinate(searchParams.get("lng"), "lng", -180, 180);
  return { lat, lng };
};

export const buildTripProgressSnapshot = (
  trip: TripDTO,
  position: TripProgressPosition,
): TripProgressSnapshotDTO => {
  if (trip.status !== "active") {
    throw new TripProgressUnavailableError(
      trip.id,
      "Trip deve estar ativa para calcular progresso.",
    );
  }

  if (!trip.route_plan || trip.route_plan.legs.length === 0) {
    throw new TripProgressUnavailableError(
      trip.id,
      "Trip deve possuir route_plan com legs para calcular progresso.",
    );
  }

  const progress = calculateRouteProgressFromPosition(trip.route_plan, position);
  const etaS = trip.route_track?.eta_s ?? trip.route_plan.total_duration_s;

  return {
    matched_leg_id: progress.matched_leg_id,
    matched_leg_index: progress.matched_leg_index,
    distance_to_route_m: progress.distance_to_route_m,
    progress_pct: progress.progress_pct,
    distance_done_m: progress.distance_done_m,
    distance_remaining_m: progress.distance_remaining_m,
    eta_s: etaS,
  };
};
