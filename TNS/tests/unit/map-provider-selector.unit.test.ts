import assert from "node:assert/strict";
import test from "node:test";
import {
  MapboxMapProvider,
  MockMapProvider,
  createMapProviderFromEnv,
} from "../../services/api/src/maps/index.js";

test("selector usa mock como default", () => {
  const runtime = createMapProviderFromEnv({ env: {} as NodeJS.ProcessEnv });
  assert.equal(runtime.mode, "mock");
  assert.equal(runtime.fallbackApplied, false);
  assert.ok(runtime.provider instanceof MockMapProvider);
});

test("selector usa mapbox quando modo e token estao definidos", () => {
  const runtime = createMapProviderFromEnv({
    env: {
      MAP_PROVIDER_MODE: "mapbox",
      MAPBOX_ACCESS_TOKEN: "token_123",
    } as NodeJS.ProcessEnv,
    fetchImpl: async () => new Response("{}", { status: 200 }),
  });

  assert.equal(runtime.mode, "mapbox");
  assert.equal(runtime.fallbackApplied, false);
  assert.ok(runtime.provider instanceof MapboxMapProvider);
});

test("selector aplica fallback para mock quando token mapbox esta ausente", () => {
  const runtime = createMapProviderFromEnv({
    env: {
      MAP_PROVIDER_MODE: "mapbox",
    } as NodeJS.ProcessEnv,
  });

  assert.equal(runtime.mode, "mock");
  assert.equal(runtime.fallbackApplied, true);
  assert.match(runtime.fallbackReason ?? "", /MAPBOX_ACCESS_TOKEN ausente/);
  assert.ok(runtime.provider instanceof MockMapProvider);
});
