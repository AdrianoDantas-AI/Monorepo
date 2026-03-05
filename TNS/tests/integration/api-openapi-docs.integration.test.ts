import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createApiHandler } from "../../services/api/src/http/app.js";

const startServer = async (): Promise<{ baseUrl: string; close: () => Promise<void> }> => {
  const handler = createApiHandler();
  const server = createServer((req, res) => {
    void handler(req, res);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        (server as Server).close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
};

test("GET /openapi.json retorna especificacao OpenAPI", async () => {
  const app = await startServer();
  try {
    const response = await fetch(`${app.baseUrl}/openapi.json`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /application\/json/);

    const payload = (await response.json()) as {
      openapi: string;
      info: { title: string };
      paths: Record<string, unknown>;
    };

    assert.equal(payload.openapi, "3.0.3");
    assert.equal(payload.info.title, "TNS API");
    assert.ok(payload.paths["/api/v1/trips"]);
    assert.ok(payload.paths["/api/v1/trips/{tripId}/deep-links/next-stop"]);
  } finally {
    await app.close();
  }
});

test("GET /docs retorna Swagger UI", async () => {
  const app = await startServer();
  try {
    const response = await fetch(`${app.baseUrl}/docs`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /text\/html/);

    const html = await response.text();
    assert.match(html, /SwaggerUIBundle/);
    assert.match(html, /\/openapi\.json/);
  } finally {
    await app.close();
  }
});
