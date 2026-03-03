import { z } from "zod";
import { latLngSchema } from "./common.js";

export const contractVersionTripV1 = "v1" as const;

export const tripStatusSchemaV1 = z.enum(["draft", "planned", "active", "completed", "canceled"]);

export const stopDTOSchemaV1 = z
  .object({
    id: z.string().min(1),
    order: z.number().int().min(0),
    name: z.string().min(1),
    address: z.string().min(1),
    location: latLngSchema,
  })
  .strict();

export const legDTOSchemaV1 = z
  .object({
    id: z.string().min(1),
    from_stop_id: z.string().min(1),
    to_stop_id: z.string().min(1),
    polyline: z.string().min(1),
    distance_m: z.number().min(0),
    duration_s: z.number().min(0),
    baseline_distance_m: z.number().min(0),
    baseline_eta_s: z.number().min(0),
  })
  .strict();

export const routePlanDTOSchemaV1 = z
  .object({
    legs: z.array(legDTOSchemaV1),
    total_distance_m: z.number().min(0),
    total_duration_s: z.number().min(0),
  })
  .strict();

export const routeTrackDTOSchemaV1 = z
  .object({
    progress_pct: z.number().min(0).max(100),
    distance_done_m: z.number().min(0),
    distance_remaining_m: z.number().min(0),
    eta_s: z.number().min(0).nullable(),
  })
  .strict();

export const nextStopDeepLinksDTOSchemaV1 = z
  .object({
    trip_id: z.string().min(1),
    stop_id: z.string().min(1),
    stop_name: z.string().min(1),
    stop_location: latLngSchema,
    google_maps: z.string().url(),
    waze: z.string().url(),
  })
  .strict();

export const tripDTOSchemaV1 = z
  .object({
    id: z.string().min(1),
    tenant_id: z.string().min(1),
    vehicle_id: z.string().min(1),
    driver_id: z.string().min(1),
    status: tripStatusSchemaV1,
    stops: z.array(stopDTOSchemaV1).min(2),
    route_plan: routePlanDTOSchemaV1.optional(),
    route_track: routeTrackDTOSchemaV1.optional(),
  })
  .strict();

export const tripStatusSchema = tripStatusSchemaV1;
export const stopSchema = stopDTOSchemaV1;
export const legSchema = legDTOSchemaV1;
export const routePlanSchema = routePlanDTOSchemaV1;
export const routeTrackSchema = routeTrackDTOSchemaV1;
export const nextStopDeepLinksSchema = nextStopDeepLinksDTOSchemaV1;
export const tripSchema = tripDTOSchemaV1;

export type TripStatusV1 = z.infer<typeof tripStatusSchemaV1>;
export type StopDTOV1 = z.infer<typeof stopDTOSchemaV1>;
export type LegDTOV1 = z.infer<typeof legDTOSchemaV1>;
export type RoutePlanDTOV1 = z.infer<typeof routePlanDTOSchemaV1>;
export type RouteTrackDTOV1 = z.infer<typeof routeTrackDTOSchemaV1>;
export type NextStopDeepLinksDTOV1 = z.infer<typeof nextStopDeepLinksDTOSchemaV1>;
export type TripDTOV1 = z.infer<typeof tripDTOSchemaV1>;

export type TripDTO = TripDTOV1;
export type StopDTO = StopDTOV1;
export type LegDTO = LegDTOV1;
export type RoutePlanDTO = RoutePlanDTOV1;
export type RouteTrackDTO = RouteTrackDTOV1;
export type NextStopDeepLinksDTO = NextStopDeepLinksDTOV1;
