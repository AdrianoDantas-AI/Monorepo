import assert from "node:assert/strict";
import test from "node:test";
import {
  applyRealtimeUpdateToTrips,
  parseDashboardRealtimeUpdate,
  sortTripsByLastUpdate,
} from "../../apps/web-dashboard/src/dashboard-state.js";
import {
  buildRealtimeSubscriptionUrl,
  resolveWebDashboardRuntimeConfig,
} from "../../apps/web-dashboard/src/server.js";

test("parseDashboardRealtimeUpdate parseia evento de progresso", () => {
  const parsed = parseDashboardRealtimeUpdate(
    JSON.stringify({
      channel: "trip.progress.v1",
      ts: "2026-03-03T20:00:00.000Z",
      payload: {
        trip_id: "trip_001",
        progress_pct: 37.5,
        distance_remaining_m: 9100,
        eta_s: 720,
      },
    }),
  );

  assert.deepEqual(parsed, {
    channel: "trip.progress.v1",
    trip_id: "trip_001",
    progress_pct: 37.5,
    distance_remaining_m: 9100,
    eta_s: 720,
    ts: "2026-03-03T20:00:00.000Z",
  });
});

test("parseDashboardRealtimeUpdate parseia evento de alerta e ignora payload invalido", () => {
  const parsedAlert = parseDashboardRealtimeUpdate(
    JSON.stringify({
      channel: "alert.event.v1",
      ts: "2026-03-03T20:01:00.000Z",
      payload: {
        trip_id: "trip_001",
        event: "off_route.confirmed.v1",
      },
    }),
  );
  assert.deepEqual(parsedAlert, {
    channel: "alert.event.v1",
    trip_id: "trip_001",
    event: "off_route.confirmed.v1",
    ts: "2026-03-03T20:01:00.000Z",
  });

  const parsedInvalid = parseDashboardRealtimeUpdate(
    JSON.stringify({
      channel: "trip.progress.v1",
      payload: {
        trip_id: "trip_001",
        progress_pct: "invalid",
      },
    }),
  );
  assert.equal(parsedInvalid, null);
});

test("applyRealtimeUpdateToTrips atualiza estado incremental e ordena por recencia", () => {
  const progressUpdate = parseDashboardRealtimeUpdate(
    JSON.stringify({
      channel: "trip.progress.v1",
      ts: "2026-03-03T20:02:00.000Z",
      payload: {
        trip_id: "trip_001",
        progress_pct: 50,
        distance_remaining_m: 8000,
        eta_s: 600,
      },
    }),
  );
  assert.ok(progressUpdate);

  const alertUpdate = parseDashboardRealtimeUpdate(
    JSON.stringify({
      channel: "alert.event.v1",
      ts: "2026-03-03T20:03:00.000Z",
      payload: {
        trip_id: "trip_002",
        event: "off_route.suspected.v1",
      },
    }),
  );
  assert.ok(alertUpdate);

  const updatedState = applyRealtimeUpdateToTrips(
    applyRealtimeUpdateToTrips({}, progressUpdate),
    alertUpdate,
  );

  assert.equal(updatedState.trip_001.progress_pct, 50);
  assert.equal(updatedState.trip_002.alert_event, "off_route.suspected.v1");

  const ordered = sortTripsByLastUpdate(updatedState);
  assert.equal(ordered[0]?.trip_id, "trip_002");
  assert.equal(ordered[1]?.trip_id, "trip_001");
});

test("config de runtime do dashboard usa env vars e monta URL de subscription", () => {
  const config = resolveWebDashboardRuntimeConfig({
    WEB_DASHBOARD_PORT: "3010",
    WEB_DASHBOARD_TENANT_ID: "tenant_unit_001",
    WEB_DASHBOARD_REALTIME_WS_URL: "ws://127.0.0.1:3002/ws",
  });

  assert.equal(config.port, 3010);
  assert.equal(config.tenantId, "tenant_unit_001");

  const subscriptionUrl = buildRealtimeSubscriptionUrl(config.realtimeWsUrl, config.tenantId);
  const parsedUrl = new URL(subscriptionUrl);
  assert.equal(parsedUrl.searchParams.get("tenant_id"), "tenant_unit_001");
  assert.equal(parsedUrl.searchParams.get("channels"), "trip.progress.v1,alert.event.v1");
});
