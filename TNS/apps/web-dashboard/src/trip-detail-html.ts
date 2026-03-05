export type TripDetailHtmlConfig = {
  tenantId: string;
  tripId: string;
  realtimeSubscriptionUrl: string;
  snapshotEndpointPath: string;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const renderTripDetailHtml = (config: TripDetailHtmlConfig): string => {
  const serializedConfig = JSON.stringify(config);

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TNS Dashboard - Trip ${escapeHtml(config.tripId)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7fb;
        --fg: #14213d;
        --panel: #ffffff;
        --line: #d7deeb;
        --ok: #1e824c;
        --warn: #9c5a03;
        --err: #b3261e;
        --muted: #5f6f8a;
      }
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        font-family: "Segoe UI", "Helvetica Neue", sans-serif;
        background: radial-gradient(circle at top right, #d9e8ff 0, var(--bg) 50%);
        color: var(--fg);
      }
      main {
        max-width: 920px;
        margin: 0 auto;
        padding: 28px 18px 40px;
      }
      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 18px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        align-items: center;
      }
      h1 {
        margin: 0;
        font-size: 1.4rem;
      }
      .muted {
        color: var(--muted);
      }
      .status-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
      }
      .status-chip[data-state="connected"] {
        color: var(--ok);
        border-color: #8cd3a8;
        background: #effaf3;
      }
      .status-chip[data-state="connecting"] {
        color: var(--warn);
        border-color: #f6d39f;
        background: #fff7e9;
      }
      .status-chip[data-state="disconnected"],
      .status-chip[data-state="error"] {
        color: var(--err);
        border-color: #e8a8a3;
        background: #fff1f0;
      }
      .grid {
        margin-top: 14px;
        display: grid;
        grid-template-columns: repeat(2, minmax(160px, 1fr));
        gap: 12px;
      }
      .metric {
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 12px;
      }
      .metric span {
        display: block;
      }
      .metric-label {
        font-size: 0.85rem;
        color: var(--muted);
        margin-bottom: 4px;
      }
      .metric-value {
        font-size: 1.2rem;
        font-weight: 600;
      }
      .back-link {
        margin-bottom: 10px;
        display: inline-block;
      }
      @media (max-width: 640px) {
        .grid {
          grid-template-columns: repeat(1, minmax(140px, 1fr));
        }
      }
    </style>
  </head>
  <body>
    <main>
      <a class="back-link" href="/">&larr; Voltar para lista de trips</a>
      <a class="back-link" href="/alerts">Ir para alerts</a>
      <section class="panel">
        <div class="header">
          <div>
            <h1>Trip <span id="trip-id">${escapeHtml(config.tripId)}</span></h1>
            <div class="muted">
              Tenant: <strong>${escapeHtml(config.tenantId)}</strong> -
              <span id="snapshot-status">carregando snapshot...</span>
            </div>
          </div>
          <div id="connection-status" class="status-chip" data-state="connecting">connecting</div>
        </div>
        <div class="muted">Realtime: <code>${escapeHtml(config.realtimeSubscriptionUrl)}</code></div>

        <div class="grid">
          <div class="metric">
            <span class="metric-label">Status</span>
            <span class="metric-value" id="metric-status">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Progresso</span>
            <span class="metric-value" id="metric-progress">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Distancia restante (m)</span>
            <span class="metric-value" id="metric-distance">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">ETA (s)</span>
            <span class="metric-value" id="metric-eta">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Ultimo alerta</span>
            <span class="metric-value" id="metric-alert">-</span>
          </div>
          <div class="metric">
            <span class="metric-label">Ultima atualizacao</span>
            <span class="metric-value" id="metric-last-update">-</span>
          </div>
        </div>
      </section>
    </main>
    <script>
      (() => {
        const config = ${serializedConfig};
        const state = {
          status: null,
          progress_pct: null,
          distance_remaining_m: null,
          eta_s: null,
          alert_event: null,
          last_update_ts: null,
        };

        const statusElement = document.getElementById("metric-status");
        const progressElement = document.getElementById("metric-progress");
        const distanceElement = document.getElementById("metric-distance");
        const etaElement = document.getElementById("metric-eta");
        const alertElement = document.getElementById("metric-alert");
        const lastUpdateElement = document.getElementById("metric-last-update");
        const snapshotStatusElement = document.getElementById("snapshot-status");
        const connectionStatusElement = document.getElementById("connection-status");

        const setConnectionState = (stateName, detail = "") => {
          connectionStatusElement.dataset.state = stateName;
          connectionStatusElement.textContent = detail ? stateName + " - " + detail : stateName;
        };

        const render = () => {
          statusElement.textContent = state.status || "-";
          progressElement.textContent =
            typeof state.progress_pct === "number" ? state.progress_pct.toFixed(1) + "%" : "-";
          distanceElement.textContent =
            typeof state.distance_remaining_m === "number" ? String(state.distance_remaining_m) : "-";
          etaElement.textContent = typeof state.eta_s === "number" ? String(state.eta_s) : "-";
          alertElement.textContent = state.alert_event || "-";
          lastUpdateElement.textContent = state.last_update_ts
            ? new Date(state.last_update_ts).toLocaleString()
            : "-";
        };

        const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
        const asString = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);
        const asNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

        const parseRealtimeEvent = (rawData) => {
          let envelope;
          try {
            envelope = JSON.parse(rawData);
          } catch {
            return null;
          }

          if (!isObject(envelope) || !isObject(envelope.payload)) {
            return null;
          }

          const channel = asString(envelope.channel);
          const ts = asString(envelope.ts) || new Date().toISOString();
          const tripId = asString(envelope.payload.trip_id);
          if (!channel || !tripId || tripId !== config.tripId) {
            return null;
          }

          if (channel === "trip.progress.v1") {
            const progress = asNumber(envelope.payload.progress_pct);
            const remaining = asNumber(envelope.payload.distance_remaining_m);
            const eta = asNumber(envelope.payload.eta_s);
            if (progress === null || remaining === null || eta === null) {
              return null;
            }
            return {
              kind: "trip_progress",
              progress_pct: progress,
              distance_remaining_m: remaining,
              eta_s: eta,
              ts,
            };
          }

          if (channel === "alert.event.v1") {
            const eventName = asString(envelope.payload.event);
            if (!eventName) {
              return null;
            }
            return {
              kind: "alert_event",
              event: eventName,
              ts,
            };
          }

          return null;
        };

        const applyRealtimeEvent = (event) => {
          if (event.kind === "trip_progress") {
            state.progress_pct = event.progress_pct;
            state.distance_remaining_m = event.distance_remaining_m;
            state.eta_s = event.eta_s;
            state.last_update_ts = event.ts;
            return;
          }

          state.alert_event = event.event;
          state.last_update_ts = event.ts;
        };

        const applySnapshot = async () => {
          try {
            const response = await fetch(config.snapshotEndpointPath);
            if (!response.ok) {
              throw new Error("snapshot HTTP " + response.status);
            }
            const payload = await response.json();
            if (!isObject(payload) || !isObject(payload.data)) {
              throw new Error("snapshot payload invalido");
            }

            const data = payload.data;
            if (asString(data.trip_id) !== config.tripId) {
              throw new Error("snapshot de trip divergente");
            }

            state.status = asString(data.status);
            state.progress_pct = asNumber(data.progress_pct);
            state.distance_remaining_m = asNumber(data.distance_remaining_m);
            state.eta_s = asNumber(data.eta_s);
            state.last_update_ts = asString(data.last_update_ts) || new Date().toISOString();
            render();
            snapshotStatusElement.textContent = "snapshot carregado";
          } catch (error) {
            snapshotStatusElement.textContent = "erro ao carregar snapshot";
            console.error(error);
          }
        };

        render();
        applySnapshot();
        setConnectionState("connecting");

        let socket;
        try {
          socket = new WebSocket(config.realtimeSubscriptionUrl);
        } catch (error) {
          setConnectionState("error", String(error));
          return;
        }

        socket.addEventListener("open", () => setConnectionState("connected"));
        socket.addEventListener("close", () => setConnectionState("disconnected"));
        socket.addEventListener("error", () => setConnectionState("error"));
        socket.addEventListener("message", (event) => {
          const parsed = parseRealtimeEvent(String(event.data));
          if (!parsed) {
            return;
          }
          applyRealtimeEvent(parsed);
          render();
        });
      })();
    </script>
  </body>
</html>
`;
};
