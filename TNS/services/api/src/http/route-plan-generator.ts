import type { LegDTO, RoutePlanDTO, StopDTO } from "../modules/domain.types.js";

const EARTH_RADIUS_M = 6371000;
const AVG_SPEED_MPS = 11;
const MIN_DURATION_SECONDS = 60;

const toRad = (value: number): number => (value * Math.PI) / 180;

const haversineDistanceM = (from: StopDTO, to: StopDTO): number => {
  const dLat = toRad(to.location.lat - from.location.lat);
  const dLng = toRad(to.location.lng - from.location.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.location.lat)) *
      Math.cos(toRad(to.location.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
};

const encodeMockPolyline = (from: StopDTO, to: StopDTO): string =>
  `${from.location.lat.toFixed(5)},${from.location.lng.toFixed(5)};${to.location.lat.toFixed(5)},${to.location.lng.toFixed(5)}`;

export const generateRoutePlanFromStops = (
  tripId: string,
  stops: readonly StopDTO[],
): RoutePlanDTO => {
  if (stops.length < 2) {
    throw new TypeError("Geracao de route plan invalida: minimo de 2 stops.");
  }

  const legs: LegDTO[] = [];
  for (let index = 0; index < stops.length - 1; index += 1) {
    const from = stops[index];
    const to = stops[index + 1];
    const distanceM = Math.max(1, Math.round(haversineDistanceM(from, to)));
    const durationS = Math.max(MIN_DURATION_SECONDS, Math.round(distanceM / AVG_SPEED_MPS));

    legs.push({
      id: `${tripId}_leg_${index + 1}`,
      from_stop_id: from.id,
      to_stop_id: to.id,
      polyline: encodeMockPolyline(from, to),
      distance_m: distanceM,
      duration_s: durationS,
    });
  }

  return {
    legs,
    total_distance_m: legs.reduce((acc, leg) => acc + leg.distance_m, 0),
    total_duration_s: legs.reduce((acc, leg) => acc + leg.duration_s, 0),
  };
};
