export type DashboardHtmlConfig = {
  tenantId: string;
  realtimeSubscriptionUrl: string;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const renderDashboardHtml = (config: DashboardHtmlConfig): string => {
  const serializedConfig = JSON.stringify({
    tenantId: config.tenantId,
    realtimeSubscriptionUrl: config.realtimeSubscriptionUrl,
  });

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TNS Dashboard - Trips</title>
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
        max-width: 1080px;
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
        align-items: flex-start;
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
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 14px;
      }
      th,
      td {
        border-bottom: 1px solid var(--line);
        text-align: left;
        padding: 10px 8px;
        font-size: 0.92rem;
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      .empty {
        margin-top: 12px;
      }
      @media (max-width: 760px) {
        th:nth-child(3),
        td:nth-child(3),
        th:nth-child(4),
        td:nth-child(4) {
          display: none;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <div class="header">
          <div>
            <h1>TNS Dashboard - Trips em Tempo Real</h1>
            <div class="muted">Tenant: <strong>${escapeHtml(config.tenantId)}</strong></div>
            <div><a href="/alerts">Ir para alerts</a></div>
          </div>
          <div id="connection-status" class="status-chip" data-state="connecting">connecting</div>
        </div>
        <p class="muted">
          Fonte realtime: <code>${escapeHtml(config.realtimeSubscriptionUrl)}</code>
        </p>
        <table aria-label="Trips em tempo real">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Status</th>
              <th>Progresso</th>
              <th>Distancia restante (m)</th>
              <th>ETA (s)</th>
              <th>Ultimo alerta</th>
              <th>Ultima atualizacao</th>
            </tr>
          </thead>
          <tbody id="trip-rows"></tbody>
        </table>
        <p class="muted empty" id="empty-state">Sem eventos recebidos.</p>
      </section>
    </main>
    <script>
      (() => {
        const config = ${serializedConfig};
        const rowsByTrip = new Map();
        const rowsElement = document.getElementById("trip-rows");
        const emptyStateElement = document.getElementById("empty-state");
        const connectionStatusElement = document.getElementById("connection-status");

        const setConnectionState = (state, detail = "") => {
          connectionStatusElement.dataset.state = state;
          connectionStatusElement.textContent = detail ? state + " - " + detail : state;
        };

        const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
        const asString = (value) => (typeof value === "string" && value.trim() ? value.trim() : null);
        const asNumber = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

        const parseEvent = (rawData) => {
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
          if (!channel || !tripId) {
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
              trip_id: tripId,
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
              trip_id: tripId,
              event: eventName,
              ts,
            };
          }

          return null;
        };

        const formatNumber = (value) => (value === null || value === undefined ? "-" : String(value));

        const renderRows = () => {
          rowsElement.textContent = "";
          const rows = Array.from(rowsByTrip.values()).sort((left, right) => {
            const byTimestamp = right.last_update_ts.localeCompare(left.last_update_ts);
            if (byTimestamp !== 0) {
              return byTimestamp;
            }
            return left.trip_id.localeCompare(right.trip_id);
          });

          if (rows.length === 0) {
            emptyStateElement.style.display = "block";
            return;
          }

          emptyStateElement.style.display = "none";

          for (const row of rows) {
            const tr = document.createElement("tr");
            const tripCell = document.createElement("td");
            const tripLink = document.createElement("a");
            tripLink.href = "/trips/" + encodeURIComponent(row.trip_id);
            tripLink.textContent = row.trip_id;
            tripCell.appendChild(tripLink);
            tr.appendChild(tripCell);

            const values = [
              row.status || "-",
              row.progress_pct === null ? "-" : row.progress_pct.toFixed(1) + "%",
              formatNumber(row.distance_remaining_m),
              formatNumber(row.eta_s),
              row.alert_event || "-",
              new Date(row.last_update_ts).toLocaleString(),
            ];

            for (const value of values) {
              const td = document.createElement("td");
              td.textContent = value;
              tr.appendChild(td);
            }

            rowsElement.appendChild(tr);
          }
        };

        const applyEvent = (event) => {
          const current = rowsByTrip.get(event.trip_id) || {
            trip_id: event.trip_id,
            status: null,
            progress_pct: null,
            distance_remaining_m: null,
            eta_s: null,
            alert_event: null,
            last_update_ts: event.ts,
          };

          if (event.kind === "trip_progress") {
            rowsByTrip.set(event.trip_id, {
              ...current,
              progress_pct: event.progress_pct,
              distance_remaining_m: event.distance_remaining_m,
              eta_s: event.eta_s,
              last_update_ts: event.ts,
            });
          } else {
            rowsByTrip.set(event.trip_id, {
              ...current,
              alert_event: event.event,
              last_update_ts: event.ts,
            });
          }
        };

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
          const parsed = parseEvent(String(event.data));
          if (!parsed) {
            return;
          }
          applyEvent(parsed);
          renderRows();
        });
      })();
    </script>
  </body>
</html>
`;
};
