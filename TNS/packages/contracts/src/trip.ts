import { z } from "zod";
import { latLngSchema } from "./common.js";

export const tripStatusSchema = z.enum(["draft", "planned", "active", "completed", "canceled"]);

export const stopSchema = z
  .object({
    id: z.string().min(1),
    order: z.number().int().min(0),
    name: z.string().min(1),
    address: z.string().min(1),
    location: latLngSchema,
  })
  .strict();

export const legSchema = z
  .object({
    id: z.string().min(1),
    from_stop_id: z.string().min(1),
    to_stop_id: z.string().min(1),
    polyline: z.string().min(1),
    distance_m: z.number().min(0),
    duration_s: z.number().min(0),
  })
  .strict();

export const routePlanSchema = z
  .object({
    legs: z.array(legSchema),
    total_distance_m: z.number().min(0),
    total_duration_s: z.number().min(0),
  })
  .strict();

export const routeTrackSchema = z
  .object({
    progress_pct: z.number().min(0).max(100),
    distance_done_m: z.number().min(0),
    distance_remaining_m: z.number().min(0),
    eta_s: z.number().min(0).nullable(),
  })
  .strict();

export const tripSchema = z
  .object({
    id: z.string().min(1),
    tenant_id: z.string().min(1),
    vehicle_id: z.string().min(1),
    driver_id: z.string().min(1),
    status: tripStatusSchema,
    stops: z.array(stopSchema).min(2),
    route_plan: routePlanSchema.optional(),
    route_track: routeTrackSchema.optional(),
  })
  .strict();

export type TripDTO = z.infer<typeof tripSchema>;
export type StopDTO = z.infer<typeof stopSchema>;
export type LegDTO = z.infer<typeof legSchema>;
export type RoutePlanDTO = z.infer<typeof routePlanSchema>;
export type RouteTrackDTO = z.infer<typeof routeTrackSchema>;
