import { z } from "zod";
import { pingTierSchema } from "./ping.js";

export const alertEventNameSchema = z.enum([
  "off_route.suspected.v1",
  "off_route.confirmed.v1",
  "back_on_route.v1",
  "detour.time.v1",
  "detour.distance.v1",
]);

export const alertSeveritySchema = z.enum(["critical", "high", "medium", "low"]);
export const alertStatusSchema = z.enum(["open", "acknowledged", "resolved"]);

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

export const alertDTOSchemaV1 = z
  .object({
    id: z.string().min(1),
    tenant_id: z.string().min(1),
    trip_id: z.string().min(1),
    vehicle_id: z.string().min(1),
    event: alertEventNameSchema,
    severity: alertSeveritySchema,
    status: alertStatusSchema,
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
    data: z.object({}).passthrough(),
  })
  .strict();

export const alertsListResponseDTOSchemaV1 = z
  .object({
    items: z.array(alertDTOSchemaV1),
    total: z.number().int().min(0),
  })
  .strict();

export type AlertEventV1 = z.infer<typeof alertEventSchema>;
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;
export type AlertStatus = z.infer<typeof alertStatusSchema>;
export type AlertDTO = z.infer<typeof alertDTOSchemaV1>;
export type AlertsListResponseDTO = z.infer<typeof alertsListResponseDTOSchemaV1>;
