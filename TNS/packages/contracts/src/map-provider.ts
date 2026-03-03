import { z } from "zod";
import { latLngSchema } from "./common.js";

export const mapProviderModeSchema = z.enum(["mock", "mapbox"]);
export type MapProviderMode = z.infer<typeof mapProviderModeSchema>;

export const routeRequestSchema = z
  .object({
    waypoints: z.array(latLngSchema).min(2),
    optimize_stops: z.boolean().default(false),
  })
  .strict();

export const routeLegSchema = z
  .object({
    polyline: z.string().min(1),
    distance_m: z.number().min(0),
    duration_s: z.number().min(0),
  })
  .strict();

export const routeResponseSchema = z
  .object({
    polyline: z.string().min(1),
    distance_m: z.number().min(0),
    duration_s: z.number().min(0),
    legs: z.array(routeLegSchema),
  })
  .strict();

export const geocodeResultSchema = z
  .object({
    location: latLngSchema,
    formatted_address: z.string().min(1),
  })
  .strict();

export type RouteRequest = z.infer<typeof routeRequestSchema>;
export type RouteResponse = z.infer<typeof routeResponseSchema>;
export type GeocodeResult = z.infer<typeof geocodeResultSchema>;

export interface MapProvider {
  getRoute(request: RouteRequest): Promise<RouteResponse>;
  geocode(query: string): Promise<GeocodeResult[]>;
}
