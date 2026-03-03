import { z } from "zod";
import { pingTierSchema } from "./ping.js";

export const alertEventNameSchema = z.enum([
  "off_route.suspected.v1",
  "off_route.confirmed.v1",
  "back_on_route.v1",
  "detour.time.v1",
  "detour.distance.v1",
]);

export const alertEventSchema = z
  .object({
    event: alertEventNameSchema,
    tenant_id: z.string().min(1),
    trip_id: z.string().min(1),
    vehicle_id: z.string().min(1),
    ts: z.string().datetime(),
    data: z
      .object({
        tier: pingTierSchema.optional(),
        distance_to_route_m: z.number().min(0).optional(),
        confidence: z.number().min(0).max(1).optional(),
        rule: z.string().min(1).optional(),
      })
      .passthrough(),
  })
  .strict();

export type AlertEventV1 = z.infer<typeof alertEventSchema>;
