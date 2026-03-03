export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "TNS API",
    version: "1.0.0",
    description: "Documentacao REST da API TNS (trips, operacao e health).",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "Health", description: "Healthchecks e endpoint de liveness." },
    { name: "Ops", description: "Endpoints operacionais e diagnostico de runtime." },
    { name: "Trips", description: "CRUD parcial de trips e operacoes de rota." },
  ],
  components: {
    parameters: {
      TenantHeader: {
        name: "x-tenant-id",
        in: "header",
        required: true,
        description: "Identificador do tenant usado para isolamento multi-tenant.",
        schema: { type: "string", minLength: 1 },
      },
      TripIdPath: {
        name: "tripId",
        in: "path",
        required: true,
        description: "Identificador da trip.",
        schema: { type: "string", minLength: 1 },
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" },
          details: { type: "string" },
          tenant_id: { type: "string" },
          trip_id: { type: "string" },
        },
      },
      LatLng: {
        type: "object",
        required: ["lat", "lng"],
        properties: {
          lat: { type: "number", format: "double" },
          lng: { type: "number", format: "double" },
        },
      },
      StopDTO: {
        type: "object",
        required: ["id", "order", "name", "address", "location"],
        properties: {
          id: { type: "string" },
          order: { type: "integer", minimum: 0 },
          name: { type: "string" },
          address: { type: "string" },
          location: { $ref: "#/components/schemas/LatLng" },
        },
      },
      LegDTO: {
        type: "object",
        required: ["id", "from_stop_id", "to_stop_id", "polyline", "distance_m", "duration_s"],
        properties: {
          id: { type: "string" },
          from_stop_id: { type: "string" },
          to_stop_id: { type: "string" },
          polyline: { type: "string" },
          distance_m: { type: "number", minimum: 0 },
          duration_s: { type: "number", minimum: 0 },
        },
      },
      RoutePlanDTO: {
        type: "object",
        required: ["legs", "total_distance_m", "total_duration_s"],
        properties: {
          legs: {
            type: "array",
            items: { $ref: "#/components/schemas/LegDTO" },
          },
          total_distance_m: { type: "number", minimum: 0 },
          total_duration_s: { type: "number", minimum: 0 },
        },
      },
      RouteTrackDTO: {
        type: "object",
        required: ["progress_pct", "distance_done_m", "distance_remaining_m", "eta_s"],
        properties: {
          progress_pct: { type: "number", minimum: 0, maximum: 100 },
          distance_done_m: { type: "number", minimum: 0 },
          distance_remaining_m: { type: "number", minimum: 0 },
          eta_s: { type: "number", nullable: true, minimum: 0 },
        },
      },
      TripDTO: {
        type: "object",
        required: ["id", "tenant_id", "vehicle_id", "driver_id", "status", "stops"],
        properties: {
          id: { type: "string" },
          tenant_id: { type: "string" },
          vehicle_id: { type: "string" },
          driver_id: { type: "string" },
          status: {
            type: "string",
            enum: ["draft", "planned", "active", "completed", "canceled"],
          },
          stops: {
            type: "array",
            items: { $ref: "#/components/schemas/StopDTO" },
            minItems: 2,
          },
          route_plan: { $ref: "#/components/schemas/RoutePlanDTO" },
          route_track: { $ref: "#/components/schemas/RouteTrackDTO" },
        },
      },
      NextStopDeepLinksDTO: {
        type: "object",
        required: ["trip_id", "stop_id", "stop_name", "stop_location", "google_maps", "waze"],
        properties: {
          trip_id: { type: "string" },
          stop_id: { type: "string" },
          stop_name: { type: "string" },
          stop_location: { $ref: "#/components/schemas/LatLng" },
          google_maps: { type: "string", format: "uri" },
          waze: { type: "string", format: "uri" },
        },
      },
      TripsOptimizeResponseData: {
        type: "object",
        required: ["trip", "strategy"],
        properties: {
          trip: { $ref: "#/components/schemas/TripDTO" },
          strategy: { type: "string", example: "nearest-neighbor-v1" },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Healthcheck do servico API",
        responses: {
          200: {
            description: "Servico disponivel",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "service"],
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "api" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/ops/domain-modules": {
      get: {
        tags: ["Ops"],
        summary: "Lista modulos de dominio carregados",
        responses: {
          200: {
            description: "Diagnostico de modulos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "modules", "map_provider_mode"],
                  properties: {
                    status: { type: "string", example: "ok" },
                    modules: { type: "array", items: { type: "string" } },
                    map_provider_mode: { type: "string", example: "mock" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/ops/map-provider": {
      get: {
        tags: ["Ops"],
        summary: "Exibe provider de mapas efetivo e fallback",
        responses: {
          200: {
            description: "Diagnostico do map provider",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "mode", "fallback_applied", "fallback_reason"],
                  properties: {
                    status: { type: "string", example: "ok" },
                    mode: { type: "string", enum: ["mock", "mapbox"] },
                    fallback_applied: { type: "boolean" },
                    fallback_reason: { type: ["string", "null"] },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/v1/trips": {
      post: {
        tags: ["Trips"],
        summary: "Cria uma trip",
        parameters: [{ $ref: "#/components/parameters/TenantHeader" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TripDTO" },
            },
          },
        },
        responses: {
          201: {
            description: "Trip criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/TripDTO" },
                  },
                },
              },
            },
          },
          400: {
            description: "Requisicao invalida",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          403: {
            description: "Tenant do header diverge do payload",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          409: {
            description: "Trip ja cadastrada",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          500: {
            description: "Erro interno",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/v1/trips/{tripId}": {
      get: {
        tags: ["Trips"],
        summary: "Busca uma trip por ID",
        parameters: [
          { $ref: "#/components/parameters/TenantHeader" },
          { $ref: "#/components/parameters/TripIdPath" },
        ],
        responses: {
          200: {
            description: "Trip encontrada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/TripDTO" },
                  },
                },
              },
            },
          },
          400: {
            description: "Requisicao invalida",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          404: {
            description: "Trip nao encontrada para o tenant",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          500: {
            description: "Erro interno",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/v1/trips/{tripId}/stops/optimize": {
      post: {
        tags: ["Trips"],
        summary: "Otimiza a ordem dos stops de uma trip",
        parameters: [
          { $ref: "#/components/parameters/TenantHeader" },
          { $ref: "#/components/parameters/TripIdPath" },
        ],
        responses: {
          200: {
            description: "Stops otimizados e route_plan atualizado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/TripsOptimizeResponseData" },
                  },
                },
              },
            },
          },
          400: {
            description: "Requisicao invalida",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          404: {
            description: "Trip nao encontrada para o tenant",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          500: {
            description: "Erro interno",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/v1/trips/{tripId}/start": {
      post: {
        tags: ["Trips"],
        summary: "Ativa uma trip e inicializa route_track",
        parameters: [
          { $ref: "#/components/parameters/TenantHeader" },
          { $ref: "#/components/parameters/TripIdPath" },
        ],
        responses: {
          200: {
            description: "Trip ativada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/TripDTO" },
                  },
                },
              },
            },
          },
          400: {
            description: "Requisicao invalida",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          404: {
            description: "Trip nao encontrada para o tenant",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          500: {
            description: "Erro interno",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
    "/api/v1/trips/{tripId}/deep-links/next-stop": {
      get: {
        tags: ["Trips"],
        summary: "Gera deep links para a proxima parada da trip",
        parameters: [
          { $ref: "#/components/parameters/TenantHeader" },
          { $ref: "#/components/parameters/TripIdPath" },
        ],
        responses: {
          200: {
            description: "Deep links gerados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: { $ref: "#/components/schemas/NextStopDeepLinksDTO" },
                  },
                },
              },
            },
          },
          400: {
            description: "Requisicao invalida",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          404: {
            description: "Trip nao encontrada para o tenant",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          409: {
            description: "Trip sem proxima parada elegivel",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
          500: {
            description: "Erro interno",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },
  },
} as const;

export const createSwaggerUiHtml = (openApiUrl = "/openapi.json"): string => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TNS API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body { margin: 0; padding: 0; background: #f8f9fb; }
      #swagger-ui { max-width: 1200px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "${openApiUrl}",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: "BaseLayout",
      });
    </script>
  </body>
</html>
`;
