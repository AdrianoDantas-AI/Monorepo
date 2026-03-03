import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

export const realtimeChannels = ["trip.progress.v1", "alert.event.v1"] as const;
export type RealtimeChannel = (typeof realtimeChannels)[number];

export type RealtimePublishRequest = {
  channel: RealtimeChannel;
  payload: Record<string, unknown>;
  tenant_id?: string;
};

type SubscriptionMetadata = {
  tenantId: string | null;
  channels: Set<RealtimeChannel>;
};

const jsonContentType = { "content-type": "application/json" };

const isRealtimeChannel = (value: string): value is RealtimeChannel =>
  realtimeChannels.includes(value as RealtimeChannel);

export const parseChannelsFromQuery = (value: string | null): RealtimeChannel[] => {
  if (!value || !value.trim()) {
    return [];
  }

  const channels = value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (channels.length === 0) {
    return [];
  }

  for (const channel of channels) {
    if (!isRealtimeChannel(channel)) {
      throw new TypeError(
        `Canal websocket invalido: ${channel}. Canais permitidos: ${realtimeChannels.join(", ")}.`,
      );
    }
  }

  return [...new Set(channels)] as RealtimeChannel[];
};

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
        reject(new TypeError("JSON invalido."));
      }
    });

    req.on("error", (error) => reject(error));
  });

const parsePublishRequest = (payload: unknown): RealtimePublishRequest => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("Payload invalido: esperado objeto JSON.");
  }

  const candidate = payload as Record<string, unknown>;
  const channel = candidate.channel;
  if (typeof channel !== "string" || !isRealtimeChannel(channel)) {
    throw new TypeError(`Payload invalido: channel deve ser um de ${realtimeChannels.join(", ")}.`);
  }

  const tenantId = candidate.tenant_id;
  if (tenantId !== undefined && typeof tenantId !== "string") {
    throw new TypeError("Payload invalido: tenant_id deve ser string quando informado.");
  }

  const payloadData = candidate.payload;
  if (!payloadData || typeof payloadData !== "object" || Array.isArray(payloadData)) {
    throw new TypeError("Payload invalido: payload deve ser objeto.");
  }

  return {
    channel,
    tenant_id: tenantId?.trim() || undefined,
    payload: payloadData as Record<string, unknown>,
  };
};

export type RealtimeRuntime = {
  httpServer: Server;
  publish: (request: RealtimePublishRequest) => number;
  snapshot: () => {
    connected_clients: number;
    channels: ReadonlyArray<RealtimeChannel>;
  };
  close: () => Promise<void>;
};

export const createRealtimeRuntime = (): RealtimeRuntime => {
  const subscriptions = new Map<WebSocket, SubscriptionMetadata>();
  const webSocketServer = new WebSocketServer({ noServer: true });

  const publish = (request: RealtimePublishRequest): number => {
    if (!isRealtimeChannel(request.channel)) {
      throw new TypeError("Publish invalido: channel nao suportado.");
    }

    const envelope = JSON.stringify({
      channel: request.channel,
      tenant_id: request.tenant_id ?? null,
      ts: new Date().toISOString(),
      payload: request.payload,
    });

    let deliveredCount = 0;
    for (const [socket, metadata] of subscriptions.entries()) {
      if (socket.readyState !== WebSocket.OPEN) {
        continue;
      }

      if (!metadata.channels.has(request.channel)) {
        continue;
      }

      if (request.tenant_id) {
        if (!metadata.tenantId || metadata.tenantId !== request.tenant_id) {
          continue;
        }
      }

      socket.send(envelope);
      deliveredCount += 1;
    }

    return deliveredCount;
  };

  const httpServer = createServer(async (req, res) => {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    const pathname = requestUrl.pathname;

    try {
      if (pathname === "/health" && req.method === "GET") {
        sendJson(res, 200, { status: "ok", service: "realtime" });
        return;
      }

      if (pathname === "/ops/channels" && req.method === "GET") {
        sendJson(res, 200, {
          status: "ok",
          channels: realtimeChannels,
          connected_clients: subscriptions.size,
        });
        return;
      }

      if (pathname === "/ops/publish" && req.method === "POST") {
        const body = await readJsonBody(req);
        const publishRequest = parsePublishRequest(body);
        const delivered = publish(publishRequest);
        sendJson(res, 200, {
          status: "ok",
          delivered,
        });
        return;
      }

      sendJson(res, 200, { service: "realtime", message: "TNS Realtime online" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "erro interno";
      sendJson(res, 400, { error: message });
    }
  });

  httpServer.on("upgrade", (request, socket, head) => {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    if (requestUrl.pathname !== "/ws") {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    let channels: RealtimeChannel[];
    try {
      channels = parseChannelsFromQuery(requestUrl.searchParams.get("channels"));
    } catch {
      socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
      socket.destroy();
      return;
    }

    const tenantId = requestUrl.searchParams.get("tenant_id")?.trim() || null;
    const subscribedChannels = channels.length > 0 ? channels : [...realtimeChannels];

    webSocketServer.handleUpgrade(request, socket, head, (ws: WebSocket) => {
      subscriptions.set(ws, {
        tenantId,
        channels: new Set(subscribedChannels),
      });
      webSocketServer.emit("connection", ws, request);
    });
  });

  webSocketServer.on("connection", (socket: WebSocket) => {
    const metadata = subscriptions.get(socket);
    if (metadata) {
      socket.send(
        JSON.stringify({
          type: "subscribed",
          channels: [...metadata.channels],
          tenant_id: metadata.tenantId,
        }),
      );
    }

    socket.on("close", () => {
      subscriptions.delete(socket);
    });
  });

  return {
    httpServer,
    publish,
    snapshot: () => ({
      connected_clients: subscriptions.size,
      channels: realtimeChannels,
    }),
    close: async () => {
      for (const socket of subscriptions.keys()) {
        socket.close();
      }

      await new Promise<void>((resolve) => {
        webSocketServer.close(() => resolve());
      });

      await new Promise<void>((resolve) => {
        httpServer.close(() => resolve());
      });
    },
  };
};
