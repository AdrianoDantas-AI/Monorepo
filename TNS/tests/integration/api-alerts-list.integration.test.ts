import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import test from "node:test";
import { alertsListResponseDTOSchemaV1 } from "../../packages/contracts/src/events.js";
import { InMemoryAlertRepository } from "../../services/api/src/http/alert.repository.js";
import { createApiHandler } from "../../services/api/src/http/app.js";

const startServerWithAlerts = async (
  alertRepository: InMemoryAlertRepository,
): Promise<{ baseUrl: string; close: () => Promise<void> }> => {
  const handler = createApiHandler({ alertRepository });
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

const seededAlertRepository = (): InMemoryAlertRepository =>
  new InMemoryAlertRepository([
    {
      id: "alert_api_001",
      tenant_id: "tenant_alerts_001",
      trip_id: "trip_alerts_001",
      vehicle_id: "vehicle_alerts_001",
      event: "off_route.suspected.v1",
      severity: "high",
      status: "open",
      created_at: "2026-03-03T10:00:00.000Z",
      updated_at: "2026-03-03T10:00:00.000Z",
      data: {
        confidence: 0.7,
      },
    },
    {
      id: "alert_api_002",
      tenant_id: "tenant_alerts_001",
      trip_id: "trip_alerts_001",
      vehicle_id: "vehicle_alerts_001",
      event: "off_route.confirmed.v1",
      severity: "critical",
      status: "acknowledged",
      created_at: "2026-03-03T10:05:00.000Z",
      updated_at: "2026-03-03T10:05:00.000Z",
      data: {
        confidence: 0.95,
      },
    },
    {
      id: "alert_api_003",
      tenant_id: "tenant_alerts_001",
      trip_id: "trip_alerts_002",
      vehicle_id: "vehicle_alerts_002",
      event: "back_on_route.v1",
      severity: "low",
      status: "resolved",
      created_at: "2026-03-03T10:10:00.000Z",
      updated_at: "2026-03-03T10:10:00.000Z",
      data: {
        confidence: 1,
      },
    },
    {
      id: "alert_api_004",
      tenant_id: "tenant_alerts_999",
      trip_id: "trip_alerts_003",
      vehicle_id: "vehicle_alerts_999",
      event: "off_route.suspected.v1",
      severity: "medium",
      status: "open",
      created_at: "2026-03-03T10:15:00.000Z",
      updated_at: "2026-03-03T10:15:00.000Z",
      data: {
        confidence: 0.6,
      },
    },
  ]);

test("GET /api/v1/alerts lista alertas por tenant e aplica filtros", async () => {
  const app = await startServerWithAlerts(seededAlertRepository());

  try {
    const allResponse = await fetch(`${app.baseUrl}/api/v1/alerts`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_alerts_001",
      },
    });
    assert.equal(allResponse.status, 200);
    const allPayload = (await allResponse.json()) as {
      data: unknown;
    };
    const allParsed = alertsListResponseDTOSchemaV1.parse(allPayload.data);
    assert.equal(allParsed.total, 3);
    assert.equal(allParsed.items[0]?.id, "alert_api_003");

    const tripFilteredResponse = await fetch(
      `${app.baseUrl}/api/v1/alerts?trip_id=trip_alerts_001`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_alerts_001",
        },
      },
    );
    assert.equal(tripFilteredResponse.status, 200);
    const tripFilteredPayload = (await tripFilteredResponse.json()) as {
      data: unknown;
    };
    const tripFilteredParsed = alertsListResponseDTOSchemaV1.parse(tripFilteredPayload.data);
    assert.equal(tripFilteredParsed.total, 2);

    const severityStatusFilteredResponse = await fetch(
      `${app.baseUrl}/api/v1/alerts?severity=critical&status=acknowledged`,
      {
        method: "GET",
        headers: {
          "x-tenant-id": "tenant_alerts_001",
        },
      },
    );
    assert.equal(severityStatusFilteredResponse.status, 200);
    const severityStatusPayload = (await severityStatusFilteredResponse.json()) as {
      data: unknown;
    };
    const severityStatusParsed = alertsListResponseDTOSchemaV1.parse(severityStatusPayload.data);
    assert.equal(severityStatusParsed.total, 1);
    assert.equal(severityStatusParsed.items[0]?.id, "alert_api_002");
  } finally {
    await app.close();
  }
});

test("GET /api/v1/alerts exige tenant header e valida filtros", async () => {
  const app = await startServerWithAlerts(seededAlertRepository());

  try {
    const missingTenantResponse = await fetch(`${app.baseUrl}/api/v1/alerts`, {
      method: "GET",
    });
    assert.equal(missingTenantResponse.status, 400);

    const invalidSeverityResponse = await fetch(`${app.baseUrl}/api/v1/alerts?severity=urgent`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_alerts_001",
      },
    });
    assert.equal(invalidSeverityResponse.status, 400);

    const invalidStatusResponse = await fetch(`${app.baseUrl}/api/v1/alerts?status=pending`, {
      method: "GET",
      headers: {
        "x-tenant-id": "tenant_alerts_001",
      },
    });
    assert.equal(invalidStatusResponse.status, 400);
  } finally {
    await app.close();
  }
});
