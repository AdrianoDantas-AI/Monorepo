import { MapboxMapProvider, type FetchLike } from "./mapbox-map.provider.js";
import { MockMapProvider } from "./mock-map.provider.js";
import type { MapProvider, MapProviderMode } from "./types.js";

export interface MapProviderRuntime {
  mode: MapProviderMode;
  provider: MapProvider;
  fallbackApplied: boolean;
  fallbackReason?: string;
}

export interface CreateMapProviderFromEnvOptions {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: FetchLike;
}

const normalizeMode = (value: string | undefined): MapProviderMode =>
  value === "mapbox" ? "mapbox" : "mock";

export const createMapProviderFromEnv = (
  options: CreateMapProviderFromEnvOptions = {},
): MapProviderRuntime => {
  const env = options.env ?? process.env;
  const mode = normalizeMode(env.MAP_PROVIDER_MODE);

  if (mode === "mapbox") {
    const token = env.MAPBOX_ACCESS_TOKEN?.trim() ?? "";
    if (!token) {
      return {
        mode: "mock",
        provider: new MockMapProvider(),
        fallbackApplied: true,
        fallbackReason: "MAPBOX_ACCESS_TOKEN ausente",
      };
    }

    return {
      mode,
      provider: new MapboxMapProvider(token, options.fetchImpl),
      fallbackApplied: false,
    };
  }

  return {
    mode,
    provider: new MockMapProvider(),
    fallbackApplied: false,
  };
};
