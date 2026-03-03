export const tripStatuses = ["draft", "planned", "active", "completed", "canceled"] as const;

export type TripStatus = (typeof tripStatuses)[number];

export type LatLngDTO = {
  lat: number;
  lng: number;
};

export type StopDTO = {
  id: string;
  order: number;
  name: string;
  address: string;
  location: LatLngDTO;
};

export type LegDTO = {
  id: string;
  from_stop_id: string;
  to_stop_id: string;
  polyline: string;
  distance_m: number;
  duration_s: number;
  baseline_distance_m: number;
  baseline_eta_s: number;
};

export type RoutePlanDTO = {
  legs: LegDTO[];
  total_distance_m: number;
  total_duration_s: number;
};

export type RouteTrackDTO = {
  progress_pct: number;
  distance_done_m: number;
  distance_remaining_m: number;
  eta_s: number | null;
};

export type TripDTO = {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  driver_id: string;
  status: TripStatus;
  stops: StopDTO[];
  route_plan?: RoutePlanDTO;
  route_track?: RouteTrackDTO;
};
