import type { IncomingMessage, ServerResponse } from "node:http";
import { type DomainModules, createDomainModules } from "../modules/index.js";
import type { TripDTO } from "../modules/domain.types.js";
import { generateRoutePlanFromStops } from "./route-plan-generator.js";
import {
  InMemoryTripRepository,
  TripConflictError,
  type TripRepository,
} from "./trip.repository.js";
import { optimizeStopsNearestNeighbor } from "./stop-optimizer.js";

const jsonContentType = { "content-type": "application/json" };

export interface ApiAppDependencies {
  domainModules?: DomainModules;
  tripRepository?: TripRepository;
}

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown): void => {
  res.writeHead(statusCode, jsonContentType);
  res.end(JSON.stringify(payload));
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

export const createApiHandler = (dependencies: ApiAppDependencies = {}) => {
  const domainModules = dependencies.domainModules ?? createDomainModules();
  const tripRepository = dependencies.tripRepository ?? new InMemoryTripRepository();

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;

    try {
      if (pathname === "/ops/domain-modules" && req.method === "GET") {
        sendJson(res, 200, {
          status: "ok",
          modules: Object.keys(domainModules),
        });
        return;
      }

      if (pathname === "/health" && req.method === "GET") {
        sendJson(res, 200, { status: "ok", service: "api" });
        return;
      }

      if (pathname === "/api/v1/trips" && req.method === "POST") {
        await handleCreateTrip(req, res, domainModules, tripRepository);
        return;
      }

      const tripId = extractTripIdFromPathname(pathname);
      if (tripId && req.method === "GET") {
        await handleGetTripById(req, res, tripRepository, tripId);
        return;
      }

      const optimizeTripId = extractTripIdForStopOptimizationPath(pathname);
      if (optimizeTripId && req.method === "POST") {
        await handleOptimizeTripStops(req, res, tripRepository, optimizeTripId);
        return;
      }

      sendJson(res, 200, { service: "api", message: "TNS API online" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro interno";
      sendJson(res, 500, {
        error: "Erro interno no processamento da requisicao.",
        details: message,
      });
    }
  };
};
