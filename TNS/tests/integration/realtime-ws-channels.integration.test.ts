import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { WebSocket } from "ws";
import { createRealtimeRuntime } from "../../services/realtime/src/realtime-server.js";

type WsCollector = {
  socket: WebSocket;
  messages: Array<Record<string, unknown>>;
  waitFor: (
    predicate: (message: Record<string, unknown>) => boolean,
    timeoutMs?: number,
  ) => Promise<Record<string, unknown>>;
  close: () => Promise<void>;
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const connectCollector = async (url: string): Promise<WsCollector> => {
  const socket = new WebSocket(url);
  const messages: Array<Record<string, unknown>> = [];

  socket.on("message", (raw) => {
    try {
      const parsed = JSON.parse(String(raw)) as Record<string, unknown>;
      messages.push(parsed);
    } catch {
      // Ignora payload não-JSON.
    }
  });

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("timeout ao conectar websocket")), 2_000);
    socket.once("open", () => {
      clearTimeout(timeout);
      resolve();
    });
    socket.once("error", () => {
      clearTimeout(timeout);
      reject(new Error("erro ao conectar websocket"));
    });
  });

  const waitFor = async (
    predicate: (message: Record<string, unknown>) => boolean,
    timeoutMs = 2_000,
  ): Promise<Record<string, unknown>> => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const matched = messages.find(predicate);
      if (matched) {
        return matched;
      }
      await sleep(25);
    }
    throw new Error("timeout aguardando mensagem websocket");
  };

  return {
    socket,
    messages,
    waitFor,
    close: async () =>
      new Promise<void>((resolve) => {
        if (socket.readyState === WebSocket.CLOSED) {
          resolve();
          return;
        }

        const timeout = setTimeout(() => resolve(), 1_500);
        socket.once("close", () => {
          clearTimeout(timeout);
          resolve();
        });
        socket.close();
      }),
  };
};

test("realtime publica nos canais trip.progress.v1 e alert.event.v1 com escopo tenant", async () => {
  const runtime = createRealtimeRuntime();
  runtime.httpServer.listen(0, "127.0.0.1");
  await once(runtime.httpServer, "listening");
  const address = runtime.httpServer.address() as AddressInfo;
  const httpBaseUrl = `http://127.0.0.1:${address.port}`;
  const wsBaseUrl = `ws://127.0.0.1:${address.port}`;

  const tripCollector = await connectCollector(
    `${wsBaseUrl}/ws?channels=trip.progress.v1&tenant_id=tenant_ws_001`,
  );
  const alertCollector = await connectCollector(
    `${wsBaseUrl}/ws?channels=alert.event.v1&tenant_id=tenant_ws_001`,
  );
  const otherTenantCollector = await connectCollector(
    `${wsBaseUrl}/ws?channels=trip.progress.v1&tenant_id=tenant_ws_999`,
  );

  try {
    await tripCollector.waitFor((message) => message.type === "subscribed");
    await alertCollector.waitFor((message) => message.type === "subscribed");
    await otherTenantCollector.waitFor((message) => message.type === "subscribed");

    const tripPublishResponse = await fetch(`${httpBaseUrl}/ops/publish`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        channel: "trip.progress.v1",
        tenant_id: "tenant_ws_001",
        payload: {
          trip_id: "trip_ws_001",
          progress_pct: 54.2,
        },
      }),
    });
    assert.equal(tripPublishResponse.status, 200);

    const tripMessage = await tripCollector.waitFor(
      (message) => message.channel === "trip.progress.v1",
    );
    assert.equal(tripMessage.tenant_id, "tenant_ws_001");

    await sleep(150);
    assert.equal(
      otherTenantCollector.messages.some(
        (message) =>
          message.channel === "trip.progress.v1" && message.tenant_id === "tenant_ws_001",
      ),
      false,
    );

    const alertPublishResponse = await fetch(`${httpBaseUrl}/ops/publish`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        channel: "alert.event.v1",
        tenant_id: "tenant_ws_001",
        payload: {
          event: "off_route.confirmed.v1",
          trip_id: "trip_ws_001",
        },
      }),
    });
    assert.equal(alertPublishResponse.status, 200);

    const alertMessage = await alertCollector.waitFor(
      (message) => message.channel === "alert.event.v1",
    );
    assert.equal(alertMessage.tenant_id, "tenant_ws_001");
  } finally {
    await tripCollector.close();
    await alertCollector.close();
    await otherTenantCollector.close();
    await runtime.close();
  }
});
