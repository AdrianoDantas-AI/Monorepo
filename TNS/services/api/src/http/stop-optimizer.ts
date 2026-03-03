import type { StopDTO } from "../modules/domain.types.js";

const EARTH_RADIUS_M = 6371000;

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

export interface StopOptimizationResult {
  strategy: "nearest-neighbor-v1";
  stops: StopDTO[];
}

export const optimizeStopsNearestNeighbor = (stops: readonly StopDTO[]): StopOptimizationResult => {
  if (stops.length < 2) {
    throw new TypeError("Otimizacao invalida: a trip precisa de ao menos 2 stops.");
  }

  const sorted = [...stops].sort((a, b) => a.order - b.order);
  const [origin, ...remaining] = sorted;
  const optimized = [origin];
  let currentStop = origin;

  while (remaining.length > 0) {
    let bestIndex = 0;
    let bestDistance = haversineDistanceM(currentStop, remaining[0]);

    for (let index = 1; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const candidateDistance = haversineDistanceM(currentStop, candidate);
      if (candidateDistance < bestDistance) {
        bestDistance = candidateDistance;
        bestIndex = index;
      }
    }

    const [nextStop] = remaining.splice(bestIndex, 1);
    optimized.push(nextStop);
    currentStop = nextStop;
  }

  return {
    strategy: "nearest-neighbor-v1",
    stops: optimized.map((stop, index) => ({
      ...stop,
      order: index,
    })),
  };
};
