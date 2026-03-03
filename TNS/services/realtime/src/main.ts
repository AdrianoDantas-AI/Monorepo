import { createServer } from "node:http";

const port = Number(process.env.REALTIME_PORT ?? 3002);

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "realtime" }));
    return;
  }

  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ service: "realtime", message: "TNS Realtime online" }));
});

server.listen(port, () => {
  console.log(`[realtime] listening on ${port}`);
});
