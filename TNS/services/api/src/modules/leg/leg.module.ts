import type { LegDTO, StopDTO } from "../domain.types.js";

type CreateLegInput = {
  id: string;
  from: StopDTO;
  to: StopDTO;
  polyline: string;
  distance_m: number;
  duration_s: number;
  baseline_distance_m?: number;
  baseline_eta_s?: number;
};

export class LegModule {
  create(input: LegDTO): LegDTO {
    if (!input.id || !input.from_stop_id || !input.to_stop_id || !input.polyline) {
      throw new TypeError("Leg invalido: campos obrigatorios ausentes.");
    }

    if (!Number.isFinite(input.distance_m) || input.distance_m < 0) {
      throw new TypeError("Leg invalido: distance_m deve ser numero >= 0.");
    }

    if (!Number.isFinite(input.duration_s) || input.duration_s < 0) {
      throw new TypeError("Leg invalido: duration_s deve ser numero >= 0.");
    }

    if (!Number.isFinite(input.baseline_distance_m) || input.baseline_distance_m < 0) {
      throw new TypeError("Leg invalido: baseline_distance_m deve ser numero >= 0.");
    }

    if (!Number.isFinite(input.baseline_eta_s) || input.baseline_eta_s < 0) {
      throw new TypeError("Leg invalido: baseline_eta_s deve ser numero >= 0.");
    }

    return { ...input };
  }

  fromStops(input: CreateLegInput): LegDTO {
    const baselineDistanceM = input.baseline_distance_m ?? input.distance_m;
    const baselineEtaS = input.baseline_eta_s ?? input.duration_s;

    return this.create({
      id: input.id,
      from_stop_id: input.from.id,
      to_stop_id: input.to.id,
      polyline: input.polyline,
      distance_m: input.distance_m,
      duration_s: input.duration_s,
      baseline_distance_m: baselineDistanceM,
      baseline_eta_s: baselineEtaS,
    });
  }
}
