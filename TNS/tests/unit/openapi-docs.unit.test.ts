import assert from "node:assert/strict";
import test from "node:test";
import { createSwaggerUiHtml, openApiSpec } from "../../services/api/src/http/openapi.js";

test("openApiSpec descreve endpoints principais da API", () => {
  assert.equal(openApiSpec.openapi, "3.0.3");
  assert.equal(openApiSpec.info.title, "TNS API");
  assert.ok(openApiSpec.paths["/api/v1/trips"]);
  assert.ok(openApiSpec.paths["/api/v1/trips/{tripId}"]);
  assert.ok(openApiSpec.paths["/api/v1/trips/{tripId}/stops/optimize"]);
  assert.ok(openApiSpec.paths["/api/v1/trips/{tripId}/start"]);
  assert.ok(openApiSpec.paths["/api/v1/trips/{tripId}/deep-links/next-stop"]);
});

test("createSwaggerUiHtml referencia bundle e openapi path", () => {
  const html = createSwaggerUiHtml("/openapi.json");
  assert.match(html, /SwaggerUIBundle/);
  assert.match(html, /swagger-ui-dist@5\/swagger-ui.css/);
  assert.match(html, /url: "\/openapi\.json"/);
});
