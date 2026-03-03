import type { GeocodeResult, MapProvider, RouteLeg, RouteRequest, RouteResponse } from "./types.js";

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

interface MapboxRoute {
  geometry: string;
  distance: number;
  duration: number;
  legs: Array<{
    distance: number;
    duration: number;
    geometry?: string;
  }>;
}

interface MapboxDirectionsResponse {
  routes?: MapboxRoute[];
}

interface MapboxGeocodingResponse {
  features?: Array<{
    place_name?: string;
    center?: [number, number];
  }>;
}

export class MapboxMapProvider implements MapProvider {
  private readonly fetchImpl: FetchLike;

  constructor(
    private readonly accessToken: string,
    fetchImpl: FetchLike = fetch as FetchLike,
  ) {
    if (!accessToken.trim()) {
      throw new TypeError("MapboxMapProvider exige MAPBOX_ACCESS_TOKEN.");
    }

    this.fetchImpl = fetchImpl;
  }

  async getRoute(request: RouteRequest): Promise<RouteResponse> {
    if (!request.waypoints || request.waypoints.length < 2) {
      throw new TypeError("MapboxMapProvider exige ao menos 2 waypoints.");
    }

    const coordinates = request.waypoints.map((point) => `${point.lng},${point.lat}`).join(";");
    const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`);
    url.searchParams.set("geometries", "polyline6");
    url.searchParams.set("overview", "full");
    url.searchParams.set("steps", "false");
    url.searchParams.set("access_token", this.accessToken);

    const response = await this.fetchImpl(url);
    if (!response.ok) {
      throw new Error(`Mapbox directions falhou com status ${response.status}.`);
    }

    const payload = (await response.json()) as MapboxDirectionsResponse;
    const route = payload.routes?.[0];
    if (!route) {
      throw new Error("Mapbox directions sem rota retornada.");
    }

    const legs: RouteLeg[] = (route.legs ?? []).map((leg, index) => ({
      polyline: leg.geometry ?? `mapbox_leg_${index + 1}`,
      distanceM: Math.round(leg.distance),
      durationS: Math.round(leg.duration),
    }));

    return {
      polyline: route.geometry,
      distanceM: Math.round(route.distance),
      durationS: Math.round(route.duration),
      legs,
    };
  }

  async geocode(query: string): Promise<GeocodeResult[]> {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      return [];
    }

    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(normalizedQuery)}.json`,
    );
    url.searchParams.set("limit", "5");
    url.searchParams.set("access_token", this.accessToken);

    const response = await this.fetchImpl(url);
    if (!response.ok) {
      throw new Error(`Mapbox geocoding falhou com status ${response.status}.`);
    }

    const payload = (await response.json()) as MapboxGeocodingResponse;
    return (payload.features ?? [])
      .filter((feature) => Array.isArray(feature.center) && feature.place_name)
      .map((feature) => ({
        location: {
          lng: feature.center?.[0] ?? 0,
          lat: feature.center?.[1] ?? 0,
        },
        formattedAddress: feature.place_name ?? "",
      }));
  }
}
