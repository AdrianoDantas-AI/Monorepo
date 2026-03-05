export type AlertsHtmlConfig = {
  tenantId: string;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const renderAlertsHtml = (config: AlertsHtmlConfig): string => `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TNS Dashboard - Alerts</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7fb;
        --fg: #14213d;
        --panel: #ffffff;
        --line: #d7deeb;
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
        max-width: 1100px;
        margin: 0 auto;
        padding: 28px 18px 40px;
      }
      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 18px;
      }
      h1 {
        margin: 0 0 10px;
        font-size: 1.4rem;
      }
      .muted {
        color: var(--muted);
      }
      form {
        display: grid;
        grid-template-columns: repeat(4, minmax(140px, 1fr));
        gap: 10px;
        margin-top: 14px;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: 0.9rem;
      }
      input,
      select,
      button {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid var(--line);
        font: inherit;
      }
      button {
        cursor: pointer;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 16px;
      }
      th,
      td {
        border-bottom: 1px solid var(--line);
        text-align: left;
        padding: 10px 8px;
        font-size: 0.92rem;
      }
      @media (max-width: 840px) {
        form {
          grid-template-columns: repeat(1, minmax(120px, 1fr));
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <a href="/">&larr; Voltar para trips</a>
        <h1>TNS Dashboard - Alerts</h1>
        <div class="muted">Tenant: <strong>${escapeHtml(config.tenantId)}</strong></div>

        <form id="alerts-filter-form" action="/alerts" method="GET">
          <label>
            Trip ID
            <input id="trip-id-input" name="trip_id" type="text" placeholder="trip_001" />
          </label>
          <label>
            Severidade
            <select id="severity-select" name="severity">
              <option value="">Todas</option>
              <option value="critical">critical</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </select>
          </label>
          <label>
            Status
            <select id="status-select" name="status">
              <option value="">Todos</option>
              <option value="open">open</option>
              <option value="acknowledged">acknowledged</option>
              <option value="resolved">resolved</option>
            </select>
          </label>
          <label>
            Acoes
            <button type="submit">Filtrar</button>
          </label>
        </form>

        <p id="alerts-summary" class="muted">Carregando alertas...</p>
        <table aria-label="Lista de alertas">
          <thead>
            <tr>
              <th>ID</th>
              <th>Trip</th>
              <th>Evento</th>
              <th>Severidade</th>
              <th>Status</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody id="alerts-rows"></tbody>
        </table>
      </section>
    </main>

    <script>
      (() => {
        const summaryElement = document.getElementById("alerts-summary");
        const rowsElement = document.getElementById("alerts-rows");
        const tripInput = document.getElementById("trip-id-input");
        const severitySelect = document.getElementById("severity-select");
        const statusSelect = document.getElementById("status-select");

        const currentParams = new URLSearchParams(window.location.search);
        tripInput.value = currentParams.get("trip_id") || "";
        severitySelect.value = currentParams.get("severity") || "";
        statusSelect.value = currentParams.get("status") || "";

        const renderRows = (items) => {
          rowsElement.textContent = "";

          if (!Array.isArray(items) || items.length === 0) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 6;
            td.textContent = "Nenhum alerta encontrado para os filtros atuais.";
            tr.appendChild(td);
            rowsElement.appendChild(tr);
            return;
          }

          for (const item of items) {
            const tr = document.createElement("tr");
            const tripCell = document.createElement("td");
            tripCell.textContent = item.id || "-";
            tr.appendChild(tripCell);

            const tripLinkCell = document.createElement("td");
            if (item.trip_id) {
              const link = document.createElement("a");
              link.href = "/trips/" + encodeURIComponent(item.trip_id);
              link.textContent = item.trip_id;
              tripLinkCell.appendChild(link);
            } else {
              tripLinkCell.textContent = "-";
            }
            tr.appendChild(tripLinkCell);

            const fields = [
              item.event || "-",
              item.severity || "-",
              item.status || "-",
              item.created_at ? new Date(item.created_at).toLocaleString() : "-",
            ];

            for (const field of fields) {
              const td = document.createElement("td");
              td.textContent = field;
              tr.appendChild(td);
            }

            rowsElement.appendChild(tr);
          }
        };

        const loadAlerts = async () => {
          try {
            const response = await fetch("/api/alerts" + window.location.search);
            if (!response.ok) {
              throw new Error("HTTP " + response.status);
            }

            const payload = await response.json();
            const data = payload && payload.data ? payload.data : null;
            const items = data && Array.isArray(data.items) ? data.items : [];
            const total = data && typeof data.total === "number" ? data.total : items.length;

            summaryElement.textContent = "Total de alertas: " + total;
            renderRows(items);
          } catch (error) {
            summaryElement.textContent = "Falha ao carregar alertas.";
            console.error(error);
            renderRows([]);
          }
        };

        loadAlerts();
      })();
    </script>
  </body>
</html>
`;
