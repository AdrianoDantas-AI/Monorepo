import { createServer } from "node:http";
import { createDomainModules } from "./modules/index.js";

const port = Number(process.env.API_PORT ?? 3000);
const domainModules = createDomainModules();

const server = createServer((req, res) => {
  if (req.url === "/ops/domain-modules") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        modules: Object.keys(domainModules),
      }),
    );
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
