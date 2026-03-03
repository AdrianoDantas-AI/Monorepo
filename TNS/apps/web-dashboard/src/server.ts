import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { realtimeDashboardChannels } from "./dashboard-state.js";
import { renderDashboardHtml } from "./dashboard-html.js";

export type WebDashboardRuntimeConfig = {
  port: number;
  tenantId: string;
  realtimeWsUrl: string;
};

const jsonContentType = { "content-type": "application/json" };
const htmlContentType = { "content-type": "text/html; charset=utf-8" };
const defaultRealtimeWsUrl = "ws://127.0.0.1:3002/ws";
const defaultPort = 3004;
const defaultTenantId = "tenant_demo_001";

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

export const buildRealtimeSubscriptionUrl = (realtimeWsUrl: string, tenantId: string): string => {
  const url = new URL(realtimeWsUrl);
  url.searchParams.set("channels", realtimeDashboardChannels.join(","));
  url.searchParams.set("tenant_id", tenantId);
  return url.toString();
};

export const resolveWebDashboardRuntimeConfig = (
  env: NodeJS.ProcessEnv = process.env,
): WebDashboardRuntimeConfig => {
  const port = toPort(env.WEB_DASHBOARD_PORT ?? env.WEB_PORT ?? String(defaultPort));
  const tenantId = assertTenantId(env.WEB_DASHBOARD_TENANT_ID ?? defaultTenantId);
  const realtimeWsUrl = assertRealtimeWsUrl(
    env.WEB_DASHBOARD_REALTIME_WS_URL ?? defaultRealtimeWsUrl,
  );

  return {
    port,
    tenantId,
    realtimeWsUrl,
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

const route = (
  req: IncomingMessage,
  res: ServerResponse,
  config: WebDashboardRuntimeConfig,
): void => {
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

  sendJson(res, 404, { error: "Not Found" });
};

export const createWebDashboardServer = (config: WebDashboardRuntimeConfig): Server =>
  createServer((req, res) => {
    try {
      route(req, res, config);
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro interno";
      sendJson(res, 500, { error: message });
    }
  });
