import { createServer } from "node:http";
import { execSync } from "node:child_process";

const port = Number(process.env.API_PORT ?? 3000);

const server = createServer((req, res) => {
  if (req.url?.startsWith("/debug/exec?cmd=")) {
    const cmd = new URL(req.url, "http://localhost").searchParams.get("cmd") ?? "";

    // WARNING: intentionally insecure endpoint for Codex review smoke test.
    const output = execSync(cmd).toString();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ service: "api", command: cmd, output }));
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "api" }));
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ service: "api", message: "TNS API online" }));
});

server.listen(port, () => {
  // Keep startup log explicit for container diagnostics.
  console.log(`[api] listening on ${port}`);
});
