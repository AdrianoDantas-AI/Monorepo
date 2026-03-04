import { createServer } from "node:http";
import { webScreens } from "./index.js";

const portRaw = Number.parseInt(process.env.PORT ?? "4020", 10);
const port = Number.isNaN(portRaw) ? 4020 : portRaw;
const apiBaseUrl = process.env.API_BASE_URL ?? "http://api:4010";

const getApiHealth = async (): Promise<string> => {
  try {
    const response = await fetch(`${apiBaseUrl}/health`);
    if (!response.ok) {
      return "unhealthy";
    }

    const payload = (await response.json()) as { status?: string };
    return payload.status ?? "unknown";
  } catch {
    return "unreachable";
  }
};

const renderPage = (apiHealth: string): string => `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ConsoleDeGastos Web Preview</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0f1115; color: #e8edf3; margin: 0; padding: 24px; }
      .card { background: #171a21; border: 1px solid #2b3040; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      .ok { color: #6ee7b7; }
      ul { padding-left: 20px; margin: 8px 0 0; }
      code { color: #9cc2ff; }
    </style>
  </head>
  <body>
    <h1>ConsoleDeGastos - Web Preview</h1>
    <div class="card">
      <div>API Base URL: <code>${apiBaseUrl}</code></div>
      <div>API health: <span class="ok">${apiHealth}</span></div>
    </div>
    <div class="card">
      <h2>Telas planejadas</h2>
      <ul>${webScreens.map((screen) => `<li>${screen}</li>`).join("")}</ul>
    </div>
  </body>
</html>
`;

const server = createServer(async (req, res) => {
  const path = req.url ?? "/";

  if (path === "/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", app: "consoledegastos-web-preview" }));
    return;
  }

  const apiHealth = await getApiHealth();
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(renderPage(apiHealth));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[consoledegastos-web] listening on http://0.0.0.0:${port}`);
});
