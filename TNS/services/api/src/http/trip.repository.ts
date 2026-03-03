import type { TripDTO } from "../modules/domain.types.js";

export class TripConflictError extends Error {
  constructor(
    public readonly tenantId: string,
    public readonly tripId: string,
  ) {
    super(`Trip ${tripId} ja existe para tenant ${tenantId}.`);
    this.name = "TripConflictError";
  }
}

export interface TripRepository {
  create(trip: TripDTO): Promise<TripDTO>;
  getById(tenantId: string, tripId: string): Promise<TripDTO | null>;
}

const cloneTrip = (trip: TripDTO): TripDTO => structuredClone(trip);

export class InMemoryTripRepository implements TripRepository {
  private readonly tripsByTenantAndId = new Map<string, TripDTO>();

  async create(trip: TripDTO): Promise<TripDTO> {
    const key = this.toScopedKey(trip.tenant_id, trip.id);
    if (this.tripsByTenantAndId.has(key)) {
      throw new TripConflictError(trip.tenant_id, trip.id);
    }

    const persisted = cloneTrip(trip);
    this.tripsByTenantAndId.set(key, persisted);
    return cloneTrip(persisted);
  }

  async getById(tenantId: string, tripId: string): Promise<TripDTO | null> {
    const key = this.toScopedKey(tenantId, tripId);
    const trip = this.tripsByTenantAndId.get(key);
    return trip ? cloneTrip(trip) : null;
  }

  private toScopedKey(tenantId: string, tripId: string): string {
    return `${tenantId}::${tripId}`;
  }
}
