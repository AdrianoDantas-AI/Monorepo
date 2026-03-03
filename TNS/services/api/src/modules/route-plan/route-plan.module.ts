import type { LegDTO, RoutePlanDTO } from "../domain.types.js";

export class RoutePlanModule {
  create(input: RoutePlanDTO): RoutePlanDTO {
    if (!Array.isArray(input.legs)) {
      throw new TypeError("RoutePlan invalido: legs deve ser array.");
    }

    if (!Number.isFinite(input.total_distance_m) || input.total_distance_m < 0) {
      throw new TypeError("RoutePlan invalido: total_distance_m deve ser numero >= 0.");
    }

    if (!Number.isFinite(input.total_duration_s) || input.total_duration_s < 0) {
      throw new TypeError("RoutePlan invalido: total_duration_s deve ser numero >= 0.");
    }

    return {
      ...input,
      legs: input.legs.map((leg) => ({ ...leg })),
    };
  }

  build(legs: LegDTO[]): RoutePlanDTO {
    const total_distance_m = legs.reduce((sum, leg) => sum + leg.distance_m, 0);
    const total_duration_s = legs.reduce((sum, leg) => sum + leg.duration_s, 0);

    return this.create({
      legs,
      total_distance_m,
      total_duration_s,
    });
  }
}
