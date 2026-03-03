import { createServer } from "node:http";

const port = Number(process.env.INGEST_PORT ?? 3001);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "ingest" }));
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ service: "ingest", message: "TNS Ingest online" }));
});

server.listen(port, () => {
  console.log(`[ingest] listening on ${port}`);
});
