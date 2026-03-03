import { createServer } from "node:http";
import { createApiHandler } from "./http/app.js";

const port = Number(process.env.API_PORT ?? 3000);
const apiHandler = createApiHandler();

const server = createServer((req, res) => {
  void apiHandler(req, res);
});

server.listen(port, () => {
  // Keep startup log explicit for container diagnostics.
  console.log(`[api] listening on ${port}`);
});
