import { z } from "zod";

export const detectionTierNameSchema = z.enum(["gold", "silver", "bronze"]);
export type DetectionTierName = z.infer<typeof detectionTierNameSchema>;

export const detectionTierThresholdSchemaV1 = z
  .object({
    ping_interval_s: z.number().int().positive(),
    corridor_m: z.number().positive(),
    confirm_min_pings: z.number().int().min(1),
    confirm_min_duration_s: z.number().int().positive(),
    degraded_accuracy_m: z.number().positive(),
    detour_time_increase_pct: z.number().min(0),
    detour_time_increase_min_s: z.number().int().min(0),
    detour_distance_increase_pct: z.number().min(0),
    detour_distance_increase_min_m: z.number().min(0),
  })
  .strict();

export const detectionTiersSchemaV1 = z
  .object({
    gold: detectionTierThresholdSchemaV1,
    silver: detectionTierThresholdSchemaV1,
    bronze: detectionTierThresholdSchemaV1,
  })
  .strict();

export const detectionTierConfigSchemaV1 = z
  .object({
    version: z.literal("v1"),
    tiers: detectionTiersSchemaV1,
  })
  .strict();

export type DetectionTierThresholdV1 = z.infer<typeof detectionTierThresholdSchemaV1>;
export type DetectionTierConfigV1 = z.infer<typeof detectionTierConfigSchemaV1>;

export const detectionTierConfigV1: DetectionTierConfigV1 = detectionTierConfigSchemaV1.parse({
  version: "v1",
  tiers: {
    gold: {
      ping_interval_s: 1,
      corridor_m: 10,
      confirm_min_pings: 5,
      confirm_min_duration_s: 8,
      degraded_accuracy_m: 30,
      detour_time_increase_pct: 20,
      detour_time_increase_min_s: 8 * 60,
      detour_distance_increase_pct: 15,
      detour_distance_increase_min_m: 2_000,
    },
    silver: {
      ping_interval_s: 15,
      corridor_m: 30,
      confirm_min_pings: 2,
      confirm_min_duration_s: 45,
      degraded_accuracy_m: 40,
      detour_time_increase_pct: 20,
      detour_time_increase_min_s: 8 * 60,
      detour_distance_increase_pct: 15,
      detour_distance_increase_min_m: 2_000,
    },
    bronze: {
      ping_interval_s: 30,
      corridor_m: 100,
      confirm_min_pings: 3,
      confirm_min_duration_s: 120,
      degraded_accuracy_m: 50,
      detour_time_increase_pct: 30,
      detour_time_increase_min_s: 12 * 60,
      detour_distance_increase_pct: 30,
      detour_distance_increase_min_m: 2_000,
    },
  },
});

export const getDetectionTierThreshold = (
  tier: DetectionTierName,
  config: DetectionTierConfigV1 = detectionTierConfigV1,
): DetectionTierThresholdV1 => config.tiers[tier];
