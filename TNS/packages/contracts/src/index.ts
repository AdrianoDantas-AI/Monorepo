export type PingTier = "gold" | "silver" | "bronze";

export interface PositionPingV1 {
  timestamp: string;
  lat: number;
  lng: number;
  accuracy_m: number;
  speed_mps?: number;
  heading_deg?: number;
  device_id: string;
  driver_id: string;
  vehicle_id: string;
  trip_id: string;
}
