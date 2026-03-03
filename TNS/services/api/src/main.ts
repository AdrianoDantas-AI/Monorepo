import { createServer } from "node:http";

const port = Number(process.env.API_PORT ?? 3000);

const server = createServer((req, res) => {
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
