import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { createApiHandler } from "../../services/api/src/http/app.js";

const startServer = async (): Promise<{ baseUrl: string; close: () => Promise<void> }> => {
  const handler = createApiHandler();
  const server = createServer((req, res) => {
    void handler(req, res);
  });

  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        (server as Server).close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
};

test("GET /api/v1/trips/:tripId/deep-links/next-stop retorna links da proxima parada ativa", async () => {
  const app = await startServer();
  const tripPayload = {
    id: "trip_api_dl_001",
    tenant_id: "tenant_api_dl_001",
    vehicle_id: "vehicle_api_dl_001",
    driver_id: "driver_api_dl_001",
    status: "planned",
    stops: [
      {
        id: "stop_api_dl_001",
        order: 0,
        name: "Origem",
        address: "Rua A",
        location: { lat: -23.55, lng: -46.63 },
      },
      {
        id: "stop_api_dl_002",
        order: 1,
        name: "Longe",
        address: "Rua B",
        location: { lat: -23.55, lng: -46.13 },
      },
      {
        id: "stop_api_dl_003",
        order: 2,
        name: "Perto",
        address: "Rua C",
        location: { lat: -23.55, lng: -46.62 },
      },
    ],
  };

  try {
    const createResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_dl_001",
      },
      body: JSON.stringify(tripPayload),
    });
    assert.equal(createResponse.status, 201);

    const optimizeResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_dl_001/stops/optimize`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant_api_dl_001",
        },
      },
    );
    assert.equal(optimizeResponse.status, 200);

    const startResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_dl_001/start`, {
      method: "POST",
      headers: {
        "x-tenant-id": "tenant_api_dl_001",
      },
    });
    assert.equal(startResponse.status, 200);

    const deepLinksResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_dl_001/deep-links/next-stop`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_dl_001",
        },
      },
    );
    assert.equal(deepLinksResponse.status, 200);

    const deepLinksPayload = (await deepLinksResponse.json()) as {
      data: {
        trip_id: string;
        stop_id: string;
        stop_name: string;
        stop_location: { lat: number; lng: number };
        google_maps: string;
        waze: string;
      };
    };
    assert.equal(deepLinksPayload.data.trip_id, "trip_api_dl_001");
    assert.equal(deepLinksPayload.data.stop_id, "stop_api_dl_003");
    assert.equal(deepLinksPayload.data.stop_name, "Perto");
    assert.deepEqual(deepLinksPayload.data.stop_location, { lat: -23.55, lng: -46.62 });
    assert.match(deepLinksPayload.data.google_maps, /destination=-23\.55%2C-46\.62/);
    assert.match(deepLinksPayload.data.waze, /ll=-23\.55%2C-46\.62/);

    const deepLinksWrongTenantResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_dl_001/deep-links/next-stop`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_dl_999",
        },
      },
    );
    assert.equal(deepLinksWrongTenantResponse.status, 404);
  } finally {
    await app.close();
  }
});

test("GET /api/v1/trips/:tripId/deep-links/next-stop retorna erro de dominio sem proxima parada", async () => {
  const app = await startServer();
  const completedTripPayload = {
    id: "trip_api_dl_002",
    tenant_id: "tenant_api_dl_002",
    vehicle_id: "vehicle_api_dl_002",
    driver_id: "driver_api_dl_002",
    status: "completed",
    stops: [
      {
        id: "stop_api_dl_010",
        order: 0,
        name: "Origem",
        address: "Rua A",
        location: { lat: -23.55, lng: -46.63 },
      },
      {
        id: "stop_api_dl_011",
        order: 1,
        name: "Destino",
        address: "Rua B",
        location: { lat: -23.56, lng: -46.64 },
      },
    ],
  };

  try {
    const createResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_dl_002",
      },
      body: JSON.stringify(completedTripPayload),
    });
    assert.equal(createResponse.status, 201);

    const deepLinksResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_dl_002/deep-links/next-stop`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_dl_002",
        },
      },
    );
    assert.equal(deepLinksResponse.status, 409);
  } finally {
    await app.close();
  }
});

test("GET /api/v1/trips/:tripId/deep-links/next-stop exige header de tenant", async () => {
  const app = await startServer();
  try {
    const response = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_dl_001/deep-links/next-stop`,
      {
        method: "GET",
      },
    );
    assert.equal(response.status, 400);
  } finally {
    await app.close();
  }
});
