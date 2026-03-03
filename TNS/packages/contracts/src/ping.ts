import { z } from "zod";
import { latLngSchema } from "./common.js";

export const pingTierSchema = z.enum(["gold", "silver", "bronze"]);
export type PingTier = z.infer<typeof pingTierSchema>;

export const pingIngestSchema = latLngSchema
  .extend({
    timestamp: z.string().datetime(),
    accuracy_m: z.number().min(0),
    speed_mps: z.number().min(0).optional(),
    heading_deg: z.number().min(0).max(360).optional(),
    device_id: z.string().min(1),
    driver_id: z.string().min(1),
    vehicle_id: z.string().min(1),
    trip_id: z.string().min(1),
  })
  .strict();

export type PingIngestDTO = z.infer<typeof pingIngestSchema>;
export type PositionPingV1 = PingIngestDTO;
