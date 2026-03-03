import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { buildTripLiveStatusFromApiTrip, realtimeDashboardChannels } from "./dashboard-state.js";
import { renderDashboardHtml } from "./dashboard-html.js";
import { renderTripDetailHtml } from "./trip-detail-html.js";

export type WebDashboardRuntimeConfig = {
  port: number;
  tenantId: string;
  realtimeWsUrl: string;
  apiBaseUrl: string;
};

export type WebDashboardDependencies = {
  fetchImpl?: typeof fetch;
};

const jsonContentType = { "content-type": "application/json" };
const htmlContentType = { "content-type": "text/html; charset=utf-8" };
const defaultRealtimeWsUrl = "ws://127.0.0.1:3002/ws";
const defaultApiBaseUrl = "http://127.0.0.1:3000";
const defaultPort = 3004;
const defaultTenantId = "tenant_demo_001";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const sendJson = (res: ServerResponse, statusCode: number, payload: unknown): void => {
  res.writeHead(statusCode, jsonContentType);
  res.end(JSON.stringify(payload));
};

const sendHtml = (res: ServerResponse, statusCode: number, html: string): void => {
  res.writeHead(statusCode, htmlContentType);
  res.end(html);
};

const toPort = (value: string): number => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
    throw new TypeError(
      `WEB_DASHBOARD_PORT invalida: ${value}. Informe uma porta inteira entre 1 e 65535.`,
    );
  }

  return parsed;
};

const assertTenantId = (value: string): string => {
  const tenantId = value.trim();
  if (!tenantId) {
    throw new TypeError("WEB_DASHBOARD_TENANT_ID invalido: valor vazio.");
  }

  return tenantId;
};

const assertRealtimeWsUrl = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError("WEB_DASHBOARD_REALTIME_WS_URL invalida: valor vazio.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new TypeError(
      `WEB_DASHBOARD_REALTIME_WS_URL invalida: ${normalized}. Informe uma URL ws:// ou wss://.`,
    );
  }

  if (parsedUrl.protocol !== "ws:" && parsedUrl.protocol !== "wss:") {
    throw new TypeError(
      `WEB_DASHBOARD_REALTIME_WS_URL invalida: ${normalized}. Protocolo deve ser ws:// ou wss://.`,
    );
  }

  return parsedUrl.toString();
};

const assertApiBaseUrl = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    throw new TypeError("WEB_DASHBOARD_API_BASE_URL invalida: valor vazio.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    throw new TypeError(
      `WEB_DASHBOARD_API_BASE_URL invalida: ${normalized}. Informe uma URL http:// ou https://.`,
    );
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new TypeError(
      `WEB_DASHBOARD_API_BASE_URL invalida: ${normalized}. Protocolo deve ser http:// ou https://.`,
    );
  }

  return parsedUrl.toString().replace(/\/+$/, "");
};

export const buildRealtimeSubscriptionUrl = (realtimeWsUrl: string, tenantId: string): string => {
  const url = new URL(realtimeWsUrl);
  url.searchParams.set("channels", realtimeDashboardChannels.join(","));
  url.searchParams.set("tenant_id", tenantId);
  return url.toString();
};

const extractTripIdFromDetailPath = (pathname: string): string | null => {
  const match = /^\/trips\/([^/]+)$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

const extractTripIdFromSnapshotPath = (pathname: string): string | null => {
  const match = /^\/api\/trips\/([^/]+)\/snapshot$/.exec(pathname);
  if (!match) {
    return null;
  }

  const tripId = decodeURIComponent(match[1] ?? "").trim();
  return tripId.length > 0 ? tripId : null;
};

export const resolveWebDashboardRuntimeConfig = (
  env: NodeJS.ProcessEnv = process.env,
): WebDashboardRuntimeConfig => {
  const port = toPort(env.WEB_DASHBOARD_PORT ?? env.WEB_PORT ?? String(defaultPort));
  const tenantId = assertTenantId(env.WEB_DASHBOARD_TENANT_ID ?? defaultTenantId);
  const realtimeWsUrl = assertRealtimeWsUrl(
    env.WEB_DASHBOARD_REALTIME_WS_URL ?? defaultRealtimeWsUrl,
  );
  const apiBaseUrl = assertApiBaseUrl(env.WEB_DASHBOARD_API_BASE_URL ?? defaultApiBaseUrl);

  return {
    port,
    tenantId,
    realtimeWsUrl,
    apiBaseUrl,
  };
};

const handleRoot = (res: ServerResponse, config: WebDashboardRuntimeConfig): void => {
  const realtimeSubscriptionUrl = buildRealtimeSubscriptionUrl(
    config.realtimeWsUrl,
    config.tenantId,
  );
  const html = renderDashboardHtml({
    tenantId: config.tenantId,
    realtimeSubscriptionUrl,
  });
  sendHtml(res, 200, html);
};

const handleTripDetail = (
  res: ServerResponse,
  config: WebDashboardRuntimeConfig,
  tripId: string,
): void => {
  const realtimeSubscriptionUrl = buildRealtimeSubscriptionUrl(
    config.realtimeWsUrl,
    config.tenantId,
  );
  const html = renderTripDetailHtml({
    tenantId: config.tenantId,
    tripId,
    realtimeSubscriptionUrl,
    snapshotEndpointPath: `/api/trips/${encodeURIComponent(tripId)}/snapshot`,
  });
  sendHtml(res, 200, html);
};

const handleTripSnapshot = async (
  res: ServerResponse,
  config: WebDashboardRuntimeConfig,
  dependencies: WebDashboardDependencies,
  tripId: string,
): Promise<void> => {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const upstreamUrl = `${config.apiBaseUrl}/api/v1/trips/${encodeURIComponent(tripId)}`;
  const upstreamResponse = await fetchImpl(upstreamUrl, {
    method: "GET",
    headers: {
      "x-tenant-id": config.tenantId,
    },
  });

  if (upstreamResponse.status === 404) {
    sendJson(res, 404, { error: `Trip ${tripId} nao encontrada para tenant ${config.tenantId}.` });
    return;
  }

  if (!upstreamResponse.ok) {
    sendJson(res, 502, {
      error: "Falha ao obter snapshot da API principal.",
      upstream_status: upstreamResponse.status,
    });
    return;
  }

  const upstreamPayload = (await upstreamResponse.json()) as unknown;
  const upstreamData = isRecord(upstreamPayload) ? upstreamPayload.data : null;
  const snapshot = buildTripLiveStatusFromApiTrip(upstreamData);
  if (!snapshot) {
    sendJson(res, 502, { error: "Payload de snapshot invalido vindo da API principal." });
    return;
  }

  sendJson(res, 200, { data: snapshot });
};

const route = async (
  req: IncomingMessage,
  res: ServerResponse,
  config: WebDashboardRuntimeConfig,
  dependencies: WebDashboardDependencies,
): Promise<void> => {
  const requestUrl = new URL(req.url ?? "/", "http://localhost");

  if (req.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      status: "ok",
      service: "web-dashboard",
      tenant_id: config.tenantId,
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/ops/config") {
    sendJson(res, 200, {
      port: config.port,
      tenant_id: config.tenantId,
      realtime_ws_url: config.realtimeWsUrl,
      api_base_url: config.apiBaseUrl,
      realtime_subscription_url: buildRealtimeSubscriptionUrl(
        config.realtimeWsUrl,
        config.tenantId,
      ),
      channels: realtimeDashboardChannels,
    });
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/") {
    handleRoot(res, config);
    return;
  }

  const detailTripId = extractTripIdFromDetailPath(requestUrl.pathname);
  if (req.method === "GET" && detailTripId) {
    handleTripDetail(res, config, detailTripId);
    return;
  }

  const snapshotTripId = extractTripIdFromSnapshotPath(requestUrl.pathname);
  if (req.method === "GET" && snapshotTripId) {
    await handleTripSnapshot(res, config, dependencies, snapshotTripId);
    return;
  }

  sendJson(res, 404, { error: "Not Found" });
};

export const createWebDashboardServer = (
  config: WebDashboardRuntimeConfig,
  dependencies: WebDashboardDependencies = {},
): Server =>
  createServer((req, res) => {
    route(req, res, config, dependencies).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "erro interno";
      sendJson(res, 500, { error: message });
    });
  });
