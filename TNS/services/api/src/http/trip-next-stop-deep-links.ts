import type { StopDTO, TripDTO } from "../modules/domain.types.js";

export type TripNextStopDeepLinksDTO = {
  trip_id: string;
  stop_id: string;
  stop_name: string;
  stop_location: StopDTO["location"];
  google_maps: string;
  waze: string;
};

export class NextStopUnavailableError extends Error {
  constructor(public readonly tripId: string) {
    super(`Trip ${tripId} nao possui proxima parada elegivel.`);
    this.name = "NextStopUnavailableError";
  }
}

const clampDistance = (distance: number): number =>
  Number.isFinite(distance) ? Math.max(0, distance) : 0;

const validateStopCoordinates = (stop: StopDTO): string => {
  const { lat, lng } = stop.location;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new TypeError(`Parada ${stop.id} possui coordenadas invalidas para gerar deep link.`);
  }

  return `${lat},${lng}`;
};

const getStopsOrderedBySequence = (stops: StopDTO[]): StopDTO[] =>
  [...stops].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    return left.id.localeCompare(right.id);
  });

const resolveNextStopForActiveTrip = (trip: TripDTO, orderedStops: StopDTO[]): StopDTO | null => {
  const routePlan = trip.route_plan;
  const routeTrack = trip.route_track;
  const legs = routePlan?.legs ?? [];
  if (legs.length === 0) {
    return orderedStops[0] ?? null;
  }

  const plannedDistance =
    routePlan?.total_distance_m ??
    legs.reduce((sum, leg) => sum + clampDistance(leg.distance_m), 0);
  const distanceDone = clampDistance(routeTrack?.distance_done_m ?? 0);

  if (plannedDistance > 0 && distanceDone >= plannedDistance) {
    return null;
  }

  const stopsById = new Map(orderedStops.map((stop) => [stop.id, stop]));
  let coveredDistance = 0;
  for (const leg of legs) {
    coveredDistance += clampDistance(leg.distance_m);
    if (distanceDone < coveredDistance) {
      return stopsById.get(leg.to_stop_id) ?? null;
    }
  }

  const lastLeg = legs[legs.length - 1];
  return stopsById.get(lastLeg?.to_stop_id ?? "") ?? null;
};

export const resolveNextStopForTrip = (trip: TripDTO): StopDTO | null => {
  const orderedStops = getStopsOrderedBySequence(trip.stops);
  if (orderedStops.length === 0) {
    return null;
  }

  switch (trip.status) {
    case "planned":
    case "draft":
      return orderedStops[0];
    case "active":
      return resolveNextStopForActiveTrip(trip, orderedStops);
    case "completed":
    case "canceled":
      return null;
    default:
      return orderedStops[0];
  }
};

export const buildGoogleMapsDeepLink = (stop: StopDTO): string => {
  const destination = validateStopCoordinates(stop);
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("destination", destination);
  url.searchParams.set("travelmode", "driving");
  return url.toString();
};

export const buildWazeDeepLink = (stop: StopDTO): string => {
  const destination = validateStopCoordinates(stop);
  const url = new URL("https://www.waze.com/ul");
  url.searchParams.set("ll", destination);
  url.searchParams.set("navigate", "yes");
  return url.toString();
};

export const buildNextStopDeepLinksForTrip = (trip: TripDTO): TripNextStopDeepLinksDTO => {
  const nextStop = resolveNextStopForTrip(trip);
  if (!nextStop) {
    throw new NextStopUnavailableError(trip.id);
  }

  return {
    trip_id: trip.id,
    stop_id: nextStop.id,
    stop_name: nextStop.name,
    stop_location: nextStop.location,
    google_maps: buildGoogleMapsDeepLink(nextStop),
    waze: buildWazeDeepLink(nextStop),
  };
};
