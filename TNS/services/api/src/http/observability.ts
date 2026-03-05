export type StructuredTripLog = {
  event: "trip_request";
  method: string;
  route: string;
  status_code: number;
  latency_ms: number;
  tenant_id: string | null;
  trip_id: string | null;
};

export type HttpRouteMetricSnapshot = {
  method: string;
  route: string;
  request_count: number;
  error_count: number;
  avg_latency_ms: number;
  max_latency_ms: number;
};

type MutableRouteMetric = {
  method: string;
  route: string;
  request_count: number;
  error_count: number;
  total_latency_ms: number;
  max_latency_ms: number;
};

const toMetricKey = (method: string, route: string): string => `${method.toUpperCase()} ${route}`;

export class HttpMetricsRegistry {
  private readonly routeMetrics = new Map<string, MutableRouteMetric>();

  record(method: string, route: string, statusCode: number, latencyMs: number): void {
    const normalizedMethod = method.toUpperCase();
    const normalizedRoute = route || "unknown";
    const key = toMetricKey(normalizedMethod, normalizedRoute);
    const metric =
      this.routeMetrics.get(key) ??
      ({
        method: normalizedMethod,
        route: normalizedRoute,
        request_count: 0,
        error_count: 0,
        total_latency_ms: 0,
        max_latency_ms: 0,
      } satisfies MutableRouteMetric);

    metric.request_count += 1;
    metric.total_latency_ms += Math.max(0, latencyMs);
    metric.max_latency_ms = Math.max(metric.max_latency_ms, Math.max(0, latencyMs));
    if (statusCode >= 400) {
      metric.error_count += 1;
    }

    this.routeMetrics.set(key, metric);
  }

  snapshot(): { generated_at: string; routes: HttpRouteMetricSnapshot[] } {
    const routes = [...this.routeMetrics.values()]
      .map<HttpRouteMetricSnapshot>((metric) => ({
        method: metric.method,
        route: metric.route,
        request_count: metric.request_count,
        error_count: metric.error_count,
        avg_latency_ms:
          metric.request_count > 0
            ? Number((metric.total_latency_ms / metric.request_count).toFixed(2))
            : 0,
        max_latency_ms: Number(metric.max_latency_ms.toFixed(2)),
      }))
      .sort((left, right) =>
        `${left.method} ${left.route}`.localeCompare(`${right.method} ${right.route}`),
      );

    return {
      generated_at: new Date().toISOString(),
      routes,
    };
  }
}

export const logStructuredTripRequest = (entry: StructuredTripLog): void => {
  console.info(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: "info",
      ...entry,
    }),
  );
};
