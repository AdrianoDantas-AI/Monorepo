export type LatLngPoint = {
  lat: number;
  lng: number;
};

export type RouteLegForProgress = {
  id: string;
  polyline: string;
  distance_m: number;
};

export type RoutePlanForProgress = {
  legs: RouteLegForProgress[];
  total_distance_m: number;
};

export type RouteProgressResult = {
  matched_leg_index: number;
  matched_leg_id: string;
  distance_to_route_m: number;
  distance_done_m: number;
  distance_remaining_m: number;
  progress_pct: number;
};

const EARTH_RADIUS_M = 6371000;
const DEG_TO_RAD = Math.PI / 180;

const toRad = (value: number): number => value * DEG_TO_RAD;

const haversineDistanceM = (from: LatLngPoint, to: LatLngPoint): number => {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
};

type XYPoint = {
  x: number;
  y: number;
};

const toXY = (point: LatLngPoint, refLat: number): XYPoint => ({
  x: point.lng * 111_320 * Math.cos(toRad(refLat)),
  y: point.lat * 110_540,
});

type SegmentProjection = {
  projected: LatLngPoint;
  distance_to_segment_m: number;
  segment_progress_m: number;
  segment_total_m: number;
};

const projectPointOnSegment = (
  point: LatLngPoint,
  start: LatLngPoint,
  end: LatLngPoint,
): SegmentProjection => {
  const refLat = (start.lat + end.lat + point.lat) / 3;
  const p = toXY(point, refLat);
  const a = toXY(start, refLat);
  const b = toXY(end, refLat);

  const abX = b.x - a.x;
  const abY = b.y - a.y;
  const abNorm = abX * abX + abY * abY;

  const tRaw = abNorm > 0 ? ((p.x - a.x) * abX + (p.y - a.y) * abY) / abNorm : 0;
  const t = Math.max(0, Math.min(1, tRaw));

  const projectedXY: XYPoint = {
    x: a.x + abX * t,
    y: a.y + abY * t,
  };

  const projected: LatLngPoint = {
    lat: projectedXY.y / 110_540,
    lng: projectedXY.x / (111_320 * Math.cos(toRad(refLat))),
  };

  const segmentTotalM = haversineDistanceM(start, end);
  return {
    projected,
    distance_to_segment_m: haversineDistanceM(point, projected),
    segment_progress_m: segmentTotalM * t,
    segment_total_m: segmentTotalM,
  };
};

export const decodeMockPolyline = (polyline: string): LatLngPoint[] => {
  const normalized = polyline.trim();
  if (!normalized) {
    throw new TypeError("Polyline invalida: valor vazio.");
  }

  const points = normalized.split(";").map((segment) => {
    const [latRaw, lngRaw] = segment.split(",");
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new TypeError(`Polyline invalida: ponto mal formatado "${segment}".`);
    }
    return { lat, lng };
  });

  if (points.length < 2) {
    throw new TypeError("Polyline invalida: minimo de 2 pontos.");
  }

  return points;
};

const calculatePolylineLengthM = (points: readonly LatLngPoint[]): number => {
  let total = 0;
  for (let index = 0; index < points.length - 1; index += 1) {
    total += haversineDistanceM(points[index], points[index + 1]);
  }
  return total;
};

export const calculateRouteProgressFromPosition = (
  routePlan: RoutePlanForProgress,
  position: LatLngPoint,
): RouteProgressResult => {
  if (!routePlan.legs.length) {
    throw new TypeError("RoutePlan invalido: legs obrigatorias para calcular progresso.");
  }

  if (!Number.isFinite(routePlan.total_distance_m) || routePlan.total_distance_m < 0) {
    throw new TypeError("RoutePlan invalido: total_distance_m deve ser numero >= 0.");
  }

  let bestDistanceToRoute = Number.POSITIVE_INFINITY;
  let bestDistanceDone = 0;
  let bestLegIndex = 0;
  let bestLegId = routePlan.legs[0].id;

  let accumulatedDistanceBeforeLeg = 0;
  for (let legIndex = 0; legIndex < routePlan.legs.length; legIndex += 1) {
    const leg = routePlan.legs[legIndex];
    const points = decodeMockPolyline(leg.polyline);
    const polylineTotalM = Math.max(calculatePolylineLengthM(points), 1);

    let legProgressOnPolylineM = 0;
    let legDistanceToRoute = Number.POSITIVE_INFINITY;
    let accumulatedSegmentDistance = 0;

    for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
      const start = points[pointIndex];
      const end = points[pointIndex + 1];
      const projection = projectPointOnSegment(position, start, end);

      if (projection.distance_to_segment_m < legDistanceToRoute) {
        legDistanceToRoute = projection.distance_to_segment_m;
        legProgressOnPolylineM = accumulatedSegmentDistance + projection.segment_progress_m;
      }

      accumulatedSegmentDistance += projection.segment_total_m;
    }

    const legProgressRatio = Math.max(0, Math.min(1, legProgressOnPolylineM / polylineTotalM));
    const legDistanceDone = leg.distance_m * legProgressRatio;
    const distanceDone = accumulatedDistanceBeforeLeg + legDistanceDone;

    if (legDistanceToRoute < bestDistanceToRoute) {
      bestDistanceToRoute = legDistanceToRoute;
      bestDistanceDone = distanceDone;
      bestLegIndex = legIndex;
      bestLegId = leg.id;
    }

    accumulatedDistanceBeforeLeg += leg.distance_m;
  }

  const safeTotalDistance = Math.max(0, routePlan.total_distance_m);
  const distanceDone = Math.max(0, Math.min(bestDistanceDone, safeTotalDistance));
  const distanceRemaining = Math.max(0, safeTotalDistance - distanceDone);
  const progressPct =
    safeTotalDistance > 0 ? Number(((distanceDone / safeTotalDistance) * 100).toFixed(3)) : 0;

  return {
    matched_leg_index: bestLegIndex,
    matched_leg_id: bestLegId,
    distance_to_route_m: Number(bestDistanceToRoute.toFixed(3)),
    distance_done_m: Number(distanceDone.toFixed(3)),
    distance_remaining_m: Number(distanceRemaining.toFixed(3)),
    progress_pct: progressPct,
  };
};
