import { createServer } from "node:http";
import { mobileParityModules } from "./index.js";

const portRaw = Number.parseInt(process.env.PORT ?? "4030", 10);
const port = Number.isNaN(portRaw) ? 4030 : portRaw;
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
    <title>ConsoleDeGastos Mobile Preview</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0b1020; color: #e6ecff; margin: 0; padding: 24px; }
      .card { background: #101830; border: 1px solid #2f4f9e; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
      .ok { color: #34d399; }
      ul { padding-left: 20px; margin: 8px 0 0; }
      code { color: #8ec5ff; }
    </style>
  </head>
  <body>
    <h1>ConsoleDeGastos - Mobile Preview</h1>
    <div class="card">
      <div>API Base URL: <code>${apiBaseUrl}</code></div>
      <div>API health: <span class="ok">${apiHealth}</span></div>
    </div>
    <div class="card">
      <h2>Módulos com paridade planejada</h2>
      <ul>${mobileParityModules.map((moduleName) => `<li>${moduleName}</li>`).join("")}</ul>
    </div>
  </body>
</html>
`;

const server = createServer(async (req, res) => {
  const path = req.url ?? "/";

  if (path === "/health") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ status: "ok", app: "consoledegastos-mobile-preview" }));
    return;
  }

  const apiHealth = await getApiHealth();
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(renderPage(apiHealth));
});

server.listen(port, "0.0.0.0", () => {
  console.log(`[consoledegastos-mobile] listening on http://0.0.0.0:${port}`);
});
