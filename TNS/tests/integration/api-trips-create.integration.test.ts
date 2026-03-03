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

test("POST/GET /api/v1/trips respeitam tenant scoping e detectam conflito", async () => {
  const app = await startServer();
  const createTripPayload = {
    id: "trip_api_001",
    tenant_id: "tenant_api_001",
    vehicle_id: "vehicle_api_001",
    driver_id: "driver_api_001",
    status: "planned",
    stops: [
      {
        id: "stop_api_001",
        order: 0,
        name: "Origem",
        address: "Rua A",
        location: { lat: -23.55, lng: -46.63 },
      },
      {
        id: "stop_api_002",
        order: 1,
        name: "Longe",
        address: "Rua B",
        location: { lat: -23.55, lng: -46.13 },
      },
      {
        id: "stop_api_003",
        order: 2,
        name: "Perto",
        address: "Rua C",
        location: { lat: -23.55, lng: -46.62 },
      },
    ],
  };

  try {
    const createdResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_001",
      },
      body: JSON.stringify(createTripPayload),
    });

    assert.equal(createdResponse.status, 201);
    const createdPayload = (await createdResponse.json()) as {
      data: {
        id: string;
        tenant_id: string;
        stops: Array<{ order: number }>;
      };
    };
    assert.equal(createdPayload.data.id, "trip_api_001");
    assert.equal(createdPayload.data.tenant_id, "tenant_api_001");
    assert.deepEqual(
      createdPayload.data.stops.map((stop) => stop.order),
      [0, 1, 2],
    );

    const getCreatedResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_001`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_api_001",
      },
    });
    assert.equal(getCreatedResponse.status, 200);
    const getCreatedPayload = (await getCreatedResponse.json()) as {
      data: {
        id: string;
        tenant_id: string;
      };
    };
    assert.equal(getCreatedPayload.data.id, "trip_api_001");
    assert.equal(getCreatedPayload.data.tenant_id, "tenant_api_001");

    const optimizeResponse = await fetch(
      `${app.baseUrl}/api/v1/trips/trip_api_001/stops/optimize`,
      {
        method: "POST",
        headers: {
          "x-tenant-id": "tenant_api_001",
        },
      },
    );
    assert.equal(optimizeResponse.status, 200);
    const optimizePayload = (await optimizeResponse.json()) as {
      data: {
        strategy: string;
        trip: {
          stops: Array<{ id: string; order: number }>;
          route_plan?: {
            legs: Array<{ id: string; polyline: string; distance_m: number; duration_s: number }>;
            total_distance_m: number;
            total_duration_s: number;
          };
        };
      };
    };
    assert.equal(optimizePayload.data.strategy, "nearest-neighbor-v1");
    assert.deepEqual(
      optimizePayload.data.trip.stops.map((stop) => stop.id),
      ["stop_api_001", "stop_api_003", "stop_api_002"],
    );
    assert.deepEqual(
      optimizePayload.data.trip.stops.map((stop) => stop.order),
      [0, 1, 2],
    );
    assert.ok(optimizePayload.data.trip.route_plan);
    assert.equal(optimizePayload.data.trip.route_plan?.legs.length, 2);
    assert.match(optimizePayload.data.trip.route_plan?.legs[0].id ?? "", /trip_api_001_leg_1/);
    assert.ok((optimizePayload.data.trip.route_plan?.legs[0].distance_m ?? 0) > 0);
    assert.ok((optimizePayload.data.trip.route_plan?.total_distance_m ?? 0) > 0);

    const getAfterOptimizeResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_001`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_api_001",
      },
    });
    assert.equal(getAfterOptimizeResponse.status, 200);
    const getAfterOptimizePayload = (await getAfterOptimizeResponse.json()) as {
      data: {
        route_plan?: {
          legs: Array<{ id: string }>;
        };
        stops: Array<{ id: string }>;
      };
    };
    assert.equal(getAfterOptimizePayload.data.route_plan?.legs.length, 2);
    assert.deepEqual(
      getAfterOptimizePayload.data.stops.map((stop) => stop.id),
      ["stop_api_001", "stop_api_003", "stop_api_002"],
    );

    const getWithOtherTenantResponse = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_001`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_api_999",
      },
    });
    assert.equal(getWithOtherTenantResponse.status, 404);

    const duplicatedResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_001",
      },
      body: JSON.stringify(createTripPayload),
    });
    assert.equal(duplicatedResponse.status, 409);

    const mismatchedTenantResponse = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": "tenant_api_999",
      },
      body: JSON.stringify({
        ...createTripPayload,
        id: "trip_api_002",
      }),
    });
    assert.equal(mismatchedTenantResponse.status, 403);
  } finally {
    await app.close();
  }
});

test("POST /api/v1/trips exige header de tenant", async () => {
  const app = await startServer();
  try {
    const response = await fetch(`${app.baseUrl}/api/v1/trips`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: "trip_api_missing_tenant",
        tenant_id: "tenant_api_001",
        vehicle_id: "vehicle_api_001",
        driver_id: "driver_api_001",
        status: "planned",
        stops: [
          {
            id: "stop_api_001",
            order: 0,
            name: "Origem",
            address: "Rua A",
            location: { lat: -23.55, lng: -46.63 },
          },
          {
            id: "stop_api_002",
            order: 1,
            name: "Destino",
            address: "Rua B",
            location: { lat: -23.56, lng: -46.64 },
          },
        ],
      }),
    });

    assert.equal(response.status, 400);
  } finally {
    await app.close();
  }
});

test("GET /api/v1/trips/:tripId exige header de tenant", async () => {
  const app = await startServer();
  try {
    const response = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_001`, {
      method: "GET",
    });

    assert.equal(response.status, 400);
  } finally {
    await app.close();
  }
});

test("POST /api/v1/trips/:tripId/stops/optimize exige header de tenant", async () => {
  const app = await startServer();
  try {
    const response = await fetch(`${app.baseUrl}/api/v1/trips/trip_api_001/stops/optimize`, {
      method: "POST",
    });

    assert.equal(response.status, 400);
  } finally {
    await app.close();
  }
});
