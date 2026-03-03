export type MapProviderMode = "mock" | "mapbox";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteRequest {
  waypoints: LatLng[];
  optimizeStops?: boolean;
}

export interface RouteLeg {
  polyline: string;
  distanceM: number;
  durationS: number;
}

export interface RouteResponse {
  polyline: string;
  distanceM: number;
  durationS: number;
  legs: RouteLeg[];
}

export interface GeocodeResult {
  location: LatLng;
  formattedAddress: string;
}

export interface MapProvider {
  getRoute(request: RouteRequest): Promise<RouteResponse>;
  geocode(query: string): Promise<GeocodeResult[]>;
}
