import type { GeocodeResult, MapProvider, RouteLeg, RouteRequest, RouteResponse } from "./types.js";

const EARTH_RADIUS_M = 6371000;
const AVG_SPEED_MPS = 11;
const MIN_DURATION_SECONDS = 60;

const toRad = (value: number): number => (value * Math.PI) / 180;

const haversineDistanceM = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
};

const encodeMockPolyline = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): string => `${fromLat.toFixed(5)},${fromLng.toFixed(5)};${toLat.toFixed(5)},${toLng.toFixed(5)}`;

const hashToCoordinate = (input: string): number => {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return (hash % 180_000) / 1000;
};

export class MockMapProvider implements MapProvider {
  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    if (!request.waypoints || request.waypoints.length < 2) {
      throw new TypeError("MockMapProvider exige ao menos 2 waypoints.");
    }

    const legs: RouteLeg[] = [];
    for (let index = 0; index < request.waypoints.length - 1; index += 1) {
      const from = request.waypoints[index];
      const to = request.waypoints[index + 1];
      const distanceM = Math.max(
        1,
        Math.round(haversineDistanceM(from.lat, from.lng, to.lat, to.lng)),
      );
      const durationS = Math.max(MIN_DURATION_SECONDS, Math.round(distanceM / AVG_SPEED_MPS));
      legs.push({
        polyline: encodeMockPolyline(from.lat, from.lng, to.lat, to.lng),
        distanceM,
        durationS,
      });
    }

    return {
      polyline: legs.map((leg) => leg.polyline).join("|"),
      distanceM: legs.reduce((sum, leg) => sum + leg.distanceM, 0),
      durationS: legs.reduce((sum, leg) => sum + leg.durationS, 0),
      legs,
    };
  }

  async geocode(query: string): Promise<GeocodeResult[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    const lat = -Math.abs(hashToCoordinate(`lat:${normalizedQuery}`) % 90);
    const lng = -Math.abs(hashToCoordinate(`lng:${normalizedQuery}`) % 180);
    return [
      {
        location: { lat, lng },
        formattedAddress: `Mock result for ${normalizedQuery}`,
      },
    ];
  }
}
