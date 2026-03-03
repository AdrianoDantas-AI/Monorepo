import type { IncomingMessage, ServerResponse } from "node:http";
import { createMapProviderFromEnv, type MapProviderRuntime } from "../maps/index.js";
import { type DomainModules, createDomainModules } from "../modules/index.js";
import type { TripDTO } from "../modules/domain.types.js";
import { InMemoryAlertRepository, type AlertRepository } from "./alert.repository.js";
import { parseAlertFiltersFromQuery } from "./alerts.js";
import { generateRoutePlanFromStops } from "./route-plan-generator.js";
import {
  InMemoryTripRepository,
  TripConflictError,
  type TripRepository,
} from "./trip.repository.js";
import { optimizeStopsNearestNeighbor } from "./stop-optimizer.js";
import {
  NextStopUnavailableError,
  buildNextStopDeepLinksForTrip,
} from "./trip-next-stop-deep-links.js";
import {
  TripProgressUnavailableError,
  buildTripProgressSnapshot,
  parseTripProgressPositionFromQuery,
} from "./trip-progress.js";
import { createSwaggerUiHtml, openApiSpec } from "./openapi.js";
import {
  HttpMetricsRegistry,
  logStructuredTripRequest,
  type StructuredTripLog,
} from "./observability.js";

const jsonContentType = { "content-type": "application/json" };
const htmlContentType = { "content-type": "text/html; charset=utf-8" };

export interface ApiAppDependencies {
  domainModules?: DomainModules;
  tripRepository?: TripRepository;
  alertRepository?: AlertRepository;
  mapProviderRuntime?: MapProviderRuntime;
  metricsRegistry?: HttpMetricsRegistry;
}

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown): void => {
  res.writeHead(statusCode, jsonContentType);
  res.end(JSON.stringify(payload));
};

const sendHtml = (res: ServerResponse, statusCode: number, html: string): void => {
  res.writeHead(statusCode, htmlContentType);
  res.end(html);
};

const readJsonBody = async (req: IncomingMessage): Promise<unknown> =>
  new Promise((resolve, reject) => {
    let rawBody = "";

    req.on("data", (chunk: Buffer) => {
      rawBody += chunk.toString("utf8");
      if (rawBody.length > 1_000_000) {
        reject(new Error("Payload excede limite de 1MB."));
      }
    });

    req.on("end", () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new SyntaxError("JSON invalido."));
      }
    });

    req.on("error", (error) => {
      reject(error);
    });
  });

const readTenantIdFromHeaders = (req: IncomingMessage): string | null => {
  const tenantHeader = req.headers["x-tenant-id"];
  if (!tenantHeader) {
    return null;
  }

  const tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;
  return tenantId?.trim() ? tenantId.trim() : null;
};

export const extractTripIdFromPathname = (pathname: string): string | null => {
  const match = /^\/api\/v1\/trips\/([^/]+)$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

export const extractTripIdForStopOptimizationPath = (pathname: string): string | null => {
  const match = /^\/api\/v1\/trips\/([^/]+)\/stops\/optimize$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

export const extractTripIdForStartPath = (pathname: string): string | null => {
  const match = /^\/api\/v1\/trips\/([^/]+)\/start$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

export const extractTripIdForNextStopDeepLinksPath = (pathname: string): string | null => {
  const match = /^\/api\/v1\/trips\/([^/]+)\/deep-links\/next-stop$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

export const extractTripIdForProgressPath = (pathname: string): string | null => {
  const match = /^\/api\/v1\/trips\/([^/]+)\/progress$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

const asTripDTO = (payload: unknown): TripDTO => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("Payload de trip invalido: esperado objeto JSON.");
  }

  return payload as TripDTO;
};

const handleCreateTrip = async (
  req: IncomingMessage,
  res: ServerResponse,
  domainModules: DomainModules,
  tripRepository: TripRepository,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  const payload = await readJsonBody(req);
  let tripPayload: TripDTO;
  try {
    tripPayload = asTripDTO(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payload de trip invalido.";
    sendJson(res, 400, {
      error: message,
    });
    return;
  }

  if (tripPayload.tenant_id !== tenantId) {
    sendJson(res, 403, {
      error: "Tenant scoping invalido: tenant do header diverge do payload.",
    });
    return;
  }

  try {
    const normalizedTrip = domainModules.trip.create(tripPayload);
    const createdTrip = await tripRepository.create(normalizedTrip);
    sendJson(res, 201, { data: createdTrip });
  } catch (error) {
    if (error instanceof TripConflictError) {
      sendJson(res, 409, {
        error: "Trip ja cadastrada para este tenant.",
        trip_id: error.tripId,
        tenant_id: error.tenantId,
      });
      return;
    }

    if (error instanceof TypeError) {
      sendJson(res, 400, {
        error: error.message,
      });
      return;
    }

    throw error;
  }
};

const handleGetTripById = async (
  req: IncomingMessage,
  res: ServerResponse,
  tripRepository: TripRepository,
  tripId: string,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  const trip = await tripRepository.getById(tenantId, tripId);
  if (!trip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para o tenant informado.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  sendJson(res, 200, { data: trip });
};

const handleOptimizeTripStops = async (
  req: IncomingMessage,
  res: ServerResponse,
  tripRepository: TripRepository,
  tripId: string,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  const trip = await tripRepository.getById(tenantId, tripId);
  if (!trip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para o tenant informado.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  const optimization = optimizeStopsNearestNeighbor(trip.stops);
  const routePlan = generateRoutePlanFromStops(trip.id, optimization.stops);
  const updatedTrip = await tripRepository.update({
    ...trip,
    stops: optimization.stops,
    route_plan: routePlan,
  });

  if (!updatedTrip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para atualizar.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  sendJson(res, 200, {
    data: {
      trip: updatedTrip,
      strategy: optimization.strategy,
    },
  });
};

const handleStartTrip = async (
  req: IncomingMessage,
  res: ServerResponse,
  tripRepository: TripRepository,
  tripId: string,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  const trip = await tripRepository.getById(tenantId, tripId);
  if (!trip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para o tenant informado.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  const plannedDistance = trip.route_plan?.total_distance_m ?? 0;
  const plannedDuration = trip.route_plan?.total_duration_s ?? null;
  const updatedTrip = await tripRepository.update({
    ...trip,
    status: "active",
    route_track: trip.route_track ?? {
      progress_pct: 0,
      distance_done_m: 0,
      distance_remaining_m: plannedDistance,
      eta_s: plannedDuration,
    },
  });

  if (!updatedTrip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para atualizar.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  sendJson(res, 200, { data: updatedTrip });
};

const handleGetTripNextStopDeepLinks = async (
  req: IncomingMessage,
  res: ServerResponse,
  tripRepository: TripRepository,
  tripId: string,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  const trip = await tripRepository.getById(tenantId, tripId);
  if (!trip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para o tenant informado.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  try {
    const deepLinks = buildNextStopDeepLinksForTrip(trip);
    sendJson(res, 200, { data: deepLinks });
  } catch (error) {
    if (error instanceof NextStopUnavailableError) {
      sendJson(res, 409, {
        error: "Nao existe proxima parada elegivel para gerar deep links.",
        trip_id: tripId,
        tenant_id: tenantId,
      });
      return;
    }

    if (error instanceof TypeError) {
      sendJson(res, 400, {
        error: error.message,
        trip_id: tripId,
        tenant_id: tenantId,
      });
      return;
    }

    throw error;
  }
};

const handleGetTripProgress = async (
  req: IncomingMessage,
  res: ServerResponse,
  domainModules: DomainModules,
  tripRepository: TripRepository,
  tripId: string,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  const trip = await tripRepository.getById(tenantId, tripId);
  if (!trip) {
    sendJson(res, 404, {
      error: "Trip nao encontrada para o tenant informado.",
      trip_id: tripId,
      tenant_id: tenantId,
    });
    return;
  }

  try {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const position = parseTripProgressPositionFromQuery(requestUrl.searchParams);
    const progressSnapshot = buildTripProgressSnapshot(trip, position);
    const routeTrack = domainModules.routeTrack.create({
      progress_pct: progressSnapshot.progress_pct,
      distance_done_m: progressSnapshot.distance_done_m,
      distance_remaining_m: progressSnapshot.distance_remaining_m,
      eta_s: progressSnapshot.eta_s,
    });

    const updatedTrip = await tripRepository.update({
      ...trip,
      route_track: routeTrack,
    });

    if (!updatedTrip) {
      sendJson(res, 404, {
        error: "Trip nao encontrada para atualizar.",
        trip_id: tripId,
        tenant_id: tenantId,
      });
      return;
    }

    sendJson(res, 200, {
      data: {
        trip_id: updatedTrip.id,
        status: updatedTrip.status,
        route_track: updatedTrip.route_track,
        matched_leg_id: progressSnapshot.matched_leg_id,
        matched_leg_index: progressSnapshot.matched_leg_index,
        distance_to_route_m: progressSnapshot.distance_to_route_m,
      },
    });
  } catch (error) {
    if (error instanceof TripProgressUnavailableError) {
      sendJson(res, 409, {
        error: error.message,
        trip_id: tripId,
        tenant_id: tenantId,
      });
      return;
    }

    if (error instanceof TypeError) {
      sendJson(res, 400, {
        error: error.message,
        trip_id: tripId,
        tenant_id: tenantId,
      });
      return;
    }

    throw error;
  }
};

const handleListAlerts = async (
  req: IncomingMessage,
  res: ServerResponse,
  alertRepository: AlertRepository,
): Promise<void> => {
  const tenantId = readTenantIdFromHeaders(req);
  if (!tenantId) {
    sendJson(res, 400, {
      error: "Tenant ausente. Informe o header x-tenant-id.",
    });
    return;
  }

  try {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const filters = parseAlertFiltersFromQuery(requestUrl.searchParams);
    const alerts = await alertRepository.listByTenant(tenantId, filters);

    sendJson(res, 200, {
      data: {
        items: alerts,
        total: alerts.length,
      },
    });
  } catch (error) {
    if (error instanceof TypeError) {
      sendJson(res, 400, {
        error: error.message,
      });
      return;
    }

    throw error;
  }
};

export const createApiHandler = (dependencies: ApiAppDependencies = {}) => {
  const domainModules = dependencies.domainModules ?? createDomainModules();
  const tripRepository = dependencies.tripRepository ?? new InMemoryTripRepository();
  const alertRepository = dependencies.alertRepository ?? new InMemoryAlertRepository();
  const mapProviderRuntime = dependencies.mapProviderRuntime ?? createMapProviderFromEnv();
  const metricsRegistry = dependencies.metricsRegistry ?? new HttpMetricsRegistry();

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const pathname = requestUrl.pathname;
    const requestMethod = req.method ?? "UNKNOWN";
    const tenantIdForObservability = readTenantIdFromHeaders(req);
    let routeLabel = pathname;
    let tripIdForObservability: string | null = null;
    const startedAtMs = Date.now();

    try {
      if (pathname === "/ops/domain-modules" && req.method === "GET") {
        routeLabel = "/ops/domain-modules";
        sendJson(res, 200, {
          status: "ok",
          modules: Object.keys(domainModules),
          map_provider_mode: mapProviderRuntime.mode,
        });
        return;
      }

      if (pathname === "/ops/map-provider" && req.method === "GET") {
        routeLabel = "/ops/map-provider";
        sendJson(res, 200, {
          status: "ok",
          mode: mapProviderRuntime.mode,
          fallback_applied: mapProviderRuntime.fallbackApplied,
          fallback_reason: mapProviderRuntime.fallbackReason ?? null,
        });
        return;
      }

      if (pathname === "/ops/metrics" && req.method === "GET") {
        routeLabel = "/ops/metrics";
        sendJson(res, 200, {
          status: "ok",
          metrics: metricsRegistry.snapshot(),
        });
        return;
      }

      if (pathname === "/health" && req.method === "GET") {
        routeLabel = "/health";
        sendJson(res, 200, { status: "ok", service: "api" });
        return;
      }

      if (pathname === "/openapi.json" && req.method === "GET") {
        routeLabel = "/openapi.json";
        sendJson(res, 200, openApiSpec);
        return;
      }

      if ((pathname === "/docs" || pathname === "/docs/") && req.method === "GET") {
        routeLabel = "/docs";
        sendHtml(res, 200, createSwaggerUiHtml("/openapi.json"));
        return;
      }

      if (pathname === "/api/v1/trips" && req.method === "POST") {
        routeLabel = "/api/v1/trips";
        await handleCreateTrip(req, res, domainModules, tripRepository);
        return;
      }

      if (pathname === "/api/v1/alerts" && req.method === "GET") {
        routeLabel = "/api/v1/alerts";
        await handleListAlerts(req, res, alertRepository);
        return;
      }

      const tripId = extractTripIdFromPathname(pathname);
      if (tripId && req.method === "GET") {
        routeLabel = "/api/v1/trips/{tripId}";
        tripIdForObservability = tripId;
        await handleGetTripById(req, res, tripRepository, tripId);
        return;
      }

      const optimizeTripId = extractTripIdForStopOptimizationPath(pathname);
      if (optimizeTripId && req.method === "POST") {
        routeLabel = "/api/v1/trips/{tripId}/stops/optimize";
        tripIdForObservability = optimizeTripId;
        await handleOptimizeTripStops(req, res, tripRepository, optimizeTripId);
        return;
      }

      const startTripId = extractTripIdForStartPath(pathname);
      if (startTripId && req.method === "POST") {
        routeLabel = "/api/v1/trips/{tripId}/start";
        tripIdForObservability = startTripId;
        await handleStartTrip(req, res, tripRepository, startTripId);
        return;
      }

      const nextStopDeepLinksTripId = extractTripIdForNextStopDeepLinksPath(pathname);
      if (nextStopDeepLinksTripId && req.method === "GET") {
        routeLabel = "/api/v1/trips/{tripId}/deep-links/next-stop";
        tripIdForObservability = nextStopDeepLinksTripId;
        await handleGetTripNextStopDeepLinks(req, res, tripRepository, nextStopDeepLinksTripId);
        return;
      }

      const progressTripId = extractTripIdForProgressPath(pathname);
      if (progressTripId && req.method === "GET") {
        routeLabel = "/api/v1/trips/{tripId}/progress";
        tripIdForObservability = progressTripId;
        await handleGetTripProgress(req, res, domainModules, tripRepository, progressTripId);
        return;
      }

      sendJson(res, 200, { service: "api", message: "TNS API online" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro interno";
      sendJson(res, 500, {
        error: "Erro interno no processamento da requisicao.",
        details: message,
      });
    } finally {
      const latencyMs = Math.max(0, Date.now() - startedAtMs);
      metricsRegistry.record(requestMethod, routeLabel, res.statusCode, latencyMs);

      if (routeLabel.startsWith("/api/v1/trips")) {
        const tripLog: StructuredTripLog = {
          event: "trip_request",
          method: requestMethod,
          route: routeLabel,
          status_code: res.statusCode,
          latency_ms: latencyMs,
          tenant_id: tenantIdForObservability,
          trip_id: tripIdForObservability,
        };
        logStructuredTripRequest(tripLog);
      }
    }
  };
};
