import type { RouteTrackDTO } from "../domain.types.js";

export class RouteTrackModule {
  create(input: RouteTrackDTO): RouteTrackDTO {
    if (
      !Number.isFinite(input.progress_pct) ||
      input.progress_pct < 0 ||
      input.progress_pct > 100
    ) {
      throw new TypeError("RouteTrack invalido: progress_pct deve estar entre 0 e 100.");
    }

    if (!Number.isFinite(input.distance_done_m) || input.distance_done_m < 0) {
      throw new TypeError("RouteTrack invalido: distance_done_m deve ser numero >= 0.");
    }

    if (!Number.isFinite(input.distance_remaining_m) || input.distance_remaining_m < 0) {
      throw new TypeError("RouteTrack invalido: distance_remaining_m deve ser numero >= 0.");
    }

    if (input.eta_s !== null && (!Number.isFinite(input.eta_s) || input.eta_s < 0)) {
      throw new TypeError("RouteTrack invalido: eta_s deve ser null ou numero >= 0.");
    }

    return { ...input };
  }

  fromDistance(
    distance_done_m: number,
    total_distance_m: number,
    eta_s: number | null,
  ): RouteTrackDTO {
    const safeTotal = total_distance_m <= 0 ? 0 : total_distance_m;
    const boundedDone = Math.max(0, Math.min(distance_done_m, safeTotal || distance_done_m));
    const distance_remaining_m = Math.max(0, safeTotal - boundedDone);
    const progress_pct = safeTotal === 0 ? 0 : (boundedDone / safeTotal) * 100;

    return this.create({
      progress_pct,
      distance_done_m: boundedDone,
      distance_remaining_m,
      eta_s,
    });
  }
}
