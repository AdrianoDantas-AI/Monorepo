import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createApiHandler } from "../../services/api/src/http/app.js";
import { createMapProviderFromEnv } from "../../services/api/src/maps/index.js";

test("ops/map-provider expoe modo efetivo e fallback quando token mapbox ausente", async () => {
  const mapProviderRuntime = createMapProviderFromEnv({
    env: {
      MAP_PROVIDER_MODE: "mapbox",
      MAPBOX_ACCESS_TOKEN: "",
    } as NodeJS.ProcessEnv,
  });
  const handler = createApiHandler({ mapProviderRuntime });
  const server = createServer((req, res) => {
    void handler(req, res);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = (server.address() as AddressInfo).port;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/ops/map-provider`);
    assert.equal(response.status, 200);
    const payload = (await response.json()) as {
      mode: string;
      fallback_applied: boolean;
      fallback_reason: string | null;
    };

    assert.equal(payload.mode, "mock");
    assert.equal(payload.fallback_applied, true);
    assert.match(payload.fallback_reason ?? "", /MAPBOX_ACCESS_TOKEN ausente/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
