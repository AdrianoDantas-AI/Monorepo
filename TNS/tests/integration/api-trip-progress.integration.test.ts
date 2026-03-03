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

const createTripPayload = {
  id: "trip_api_progress_001",
  tenant_id: "tenant_api_progress_001",
  vehicle_id: "vehicle_api_progress_001",
  driver_id: "driver_api_progress_001",
  status: "planned",
  stops: [
    {
      id: "stop_api_progress_001",
      order: 0,
      name: "Origem",
      address: "Rua A",
      location: { lat: -23.55, lng: -46.63 },
    },
    {
      id: "stop_api_progress_002",
      order: 1,
      name: "Meio",
      address: "Rua B",
      location: { lat: -23.56, lng: -46.62 },
    },
    {
      id: "stop_api_progress_003",
      order: 2,
      name: "Destino",
      address: "Rua C",
      location: { lat: -23.57, lng: -46.61 },
    },
  ],
};

test("GET /api/v1/trips/:tripId/progress calcula km percorrido/restante para trip ativa", async () => {
  const app = await startServer();

  try {
    const createResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_progress_001",
      },
      body: JSON.stringify(createTripPayload),
    });
    assert.equal(createResponse.status, 201);

    const optimizeResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_001/stops/optimize`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant_api_progress_001",
        },
      },
    );
    assert.equal(optimizeResponse.status, 200);

    const startResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_progress_001/start`, {
      method: "POST",
      headers: {
        "x-tenant-id": "tenant_api_progress_001",
      },
    });
    assert.equal(startResponse.status, 200);

    const progressResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_001/progress?lat=-23.556&lng=-46.624`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_progress_001",
        },
      },
    );
    assert.equal(progressResponse.status, 200);

    const progressPayload = (await progressResponse.json()) as {
      data: {
        trip_id: string;
        status: string;
        route_track: {
          progress_pct: number;
          distance_done_m: number;
          distance_remaining_m: number;
          eta_s: number | null;
        };
        matched_leg_id: string;
        matched_leg_index: number;
        distance_to_route_m: number;
      };
    };

    assert.equal(progressPayload.data.trip_id, "trip_api_progress_001");
    assert.equal(progressPayload.data.status, "active");
    assert.ok(progressPayload.data.route_track.progress_pct > 0);
    assert.ok(progressPayload.data.route_track.distance_done_m > 0);
    assert.ok(progressPayload.data.route_track.distance_remaining_m > 0);
    assert.ok(progressPayload.data.route_track.distance_remaining_m > 0);
    assert.ok(progressPayload.data.matched_leg_id.length > 0);
    assert.ok(progressPayload.data.matched_leg_index >= 0);
    assert.ok(progressPayload.data.distance_to_route_m >= 0);

    const getTripResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_progress_001`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_api_progress_001",
      },
    });
    assert.equal(getTripResponse.status, 200);

    const tripPayload = (await getTripResponse.json()) as {
      data: {
        route_track?: {
          distance_done_m: number;
          distance_remaining_m: number;
        };
      };
    };
    assert.equal(
      tripPayload.data.route_track?.distance_done_m,
      progressPayload.data.route_track.distance_done_m,
    );
    assert.equal(
      tripPayload.data.route_track?.distance_remaining_m,
      progressPayload.data.route_track.distance_remaining_m,
    );
  } finally {
    await app.close();
  }
});

test("GET /api/v1/trips/:tripId/progress retorna 409 para trip nao ativa", async () => {
  const app = await startServer();

  try {
    const createResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_progress_001",
      },
      body: JSON.stringify({
        ...createTripPayload,
        id: "trip_api_progress_002",
      }),
    });
    assert.equal(createResponse.status, 201);

    const optimizeResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_002/stops/optimize`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant_api_progress_001",
        },
      },
    );
    assert.equal(optimizeResponse.status, 200);

    const response = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_002/progress?lat=-23.556&lng=-46.624`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_progress_001",
        },
      },
    );

    assert.equal(response.status, 409);
  } finally {
    await app.close();
  }
});

test("GET /api/v1/trips/:tripId/progress valida tenant e query obrigatoria", async () => {
  const app = await startServer();

  try {
    const createResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_progress_001",
      },
      body: JSON.stringify({
        ...createTripPayload,
        id: "trip_api_progress_003",
      }),
    });
    assert.equal(createResponse.status, 201);

    const optimizeResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_003/stops/optimize`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant_api_progress_001",
        },
      },
    );
    assert.equal(optimizeResponse.status, 200);

    const startResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_progress_003/start`, {
      method: "POST",
      headers: {
        "x-tenant-id": "tenant_api_progress_001",
      },
    });
    assert.equal(startResponse.status, 200);

    const missingTenant = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_003/progress?lat=-23.556&lng=-46.624`,
      {
        method: "GET",
      },
    );
    assert.equal(missingTenant.status, 400);

    const missingQuery = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_003/progress?lat=-23.556`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_progress_001",
        },
      },
    );
    assert.equal(missingQuery.status, 400);

    const wrongTenant = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_progress_003/progress?lat=-23.556&lng=-46.624`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_api_progress_999",
        },
      },
    );
    assert.equal(wrongTenant.status, 404);
  } finally {
    await app.close();
  }
});
