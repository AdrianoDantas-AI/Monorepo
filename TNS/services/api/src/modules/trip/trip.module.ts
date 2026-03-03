import { type LegDTO, type TripStatus, type TripDTO, tripStatuses } from "../domain.types.js";
import { RoutePlanModule } from "../route-plan/route-plan.module.js";
import { RouteTrackModule } from "../route-track/route-track.module.js";
import { StopModule } from "../stop/stop.module.js";

export class TripModule {
  constructor(
    private readonly stopModule = new StopModule(),
    private readonly routePlanModule = new RoutePlanModule(),
    private readonly routeTrackModule = new RouteTrackModule(),
  ) {}

  create(input: TripDTO): TripDTO {
    if (!input.id || !input.tenant_id || !input.vehicle_id || !input.driver_id) {
      throw new TypeError("Trip invalida: campos de identificacao obrigatorios ausentes.");
    }

    if (!this.isTripStatus(input.status)) {
      throw new TypeError("Trip invalida: status fora do dominio esperado.");
    }

    if (input.stops.length < 2) {
      throw new TypeError("Trip invalida: minimo de 2 stops.");
    }

    const normalizedStops = this.stopModule.normalize(
      input.stops.map((stop) => this.stopModule.create(stop)),
    );

    return {
      ...input,
      stops: normalizedStops,
    };
  }

  attachRoutePlan(trip: TripDTO, legs: LegDTO[]): TripDTO {
    const route_plan = this.routePlanModule.build(legs);
    return this.create({
      ...trip,
      route_plan,
    });
  }

  updateRouteTrack(trip: TripDTO, distance_done_m: number, eta_s: number | null): TripDTO {
    const plannedDistance = trip.route_plan?.total_distance_m ?? 0;
    const route_track = this.routeTrackModule.fromDistance(distance_done_m, plannedDistance, eta_s);

    return this.create({
      ...trip,
      route_track,
    });
  }

  private isTripStatus(status: string): status is TripStatus {
    return tripStatuses.includes(status as TripStatus);
  }
}
