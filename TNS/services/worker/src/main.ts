import { createServer } from "node:http";

const port = Number(process.env.WORKER_PORT ?? 3003);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "worker" }));
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ service: "worker", message: "TNS Worker online" }));
});

server.listen(port, () => {
  console.log(`[worker] listening on ${port}`);
});
