import type { StopDTO } from "../domain.types.js";

export class StopModule {
  create(input: StopDTO): StopDTO {
    if (!input.id || !input.name || !input.address) {
      throw new TypeError("Stop invalido: campos de texto obrigatorios ausentes.");
    }

    if (!Number.isInteger(input.order) || input.order < 0) {
      throw new TypeError("Stop invalido: order deve ser inteiro >= 0.");
    }

    if (!input.location || typeof input.location !== "object") {
      throw new TypeError("Stop invalido: location obrigatoria.");
    }

    if (!Number.isFinite(input.location.lat) || !Number.isFinite(input.location.lng)) {
      throw new TypeError("Stop invalido: location.lat/lng devem ser numericos.");
    }

    return { ...input };
  }

  normalize(stops: StopDTO[]): StopDTO[] {
    return [...stops]
      .sort((a, b) => a.order - b.order)
      .map((stop, index) => ({
        ...stop,
        order: index,
      }));
  }
}
