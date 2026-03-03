import { LegModule } from "./leg/leg.module.js";
import { RoutePlanModule } from "./route-plan/route-plan.module.js";
import { RouteTrackModule } from "./route-track/route-track.module.js";
import { StopModule } from "./stop/stop.module.js";
import { TripModule } from "./trip/trip.module.js";

export function createDomainModules() {
  const stop = new StopModule();
  const leg = new LegModule();
  const routePlan = new RoutePlanModule();
  const routeTrack = new RouteTrackModule();
  const trip = new TripModule(stop, routePlan, routeTrack);

  return {
    trip,
    stop,
    leg,
    routePlan,
    routeTrack,
  };
}

export type DomainModules = ReturnType<typeof createDomainModules>;

export { LegModule } from "./leg/leg.module.js";
export { RoutePlanModule } from "./route-plan/route-plan.module.js";
export { RouteTrackModule } from "./route-track/route-track.module.js";
export { StopModule } from "./stop/stop.module.js";
export { TripModule } from "./trip/trip.module.js";
export * from "./domain.types.js";
