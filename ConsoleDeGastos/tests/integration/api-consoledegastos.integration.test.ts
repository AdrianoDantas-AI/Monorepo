import test from "node:test";
import assert from "node:assert/strict";
import { startApiServer } from "../../services/api/src/app.js";

const jsonHeaders = { "content-type": "application/json" };

test("auth flow supports google callback and session lookup", async () => {
  const runtime = await startApiServer();

  try {
    const callbackResponse = await fetch(`${runtime.baseUrl}/api/v1/auth/google/callback?code=abc123`);
    assert.equal(callbackResponse.status, 200);

    const callbackPayload = (await callbackResponse.json()) as {
      data: { id: string; provider: string };
    };

    assert.equal(callbackPayload.data.provider, "google");

    const sessionResponse = await fetch(`${runtime.baseUrl}/api/v1/auth/session`, {
      headers: { "x-session-id": callbackPayload.data.id },
    });

    const sessionPayload = (await sessionResponse.json()) as {
      data: { id: string; provider: string };
    };

    assert.equal(sessionResponse.status, 200);
    assert.equal(sessionPayload.data.id, callbackPayload.data.id);
  } finally {
    await runtime.close();
  }
});

test("open finance connect callback and sync progression", async () => {
  const runtime = await startApiServer();

  try {
    const createResponse = await fetch(`${runtime.baseUrl}/api/v1/openfinance/connect/callback`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ institution: "Nubank" }),
    });

    assert.equal(createResponse.status, 201);
    const createPayload = (await createResponse.json()) as {
      data: { id: string; progress_pct: number; status: string };
    };

    assert.equal(createPayload.data.status, "processing");

    const syncResponse = await fetch(
      `${runtime.baseUrl}/api/v1/openfinance/connections/${createPayload.data.id}/sync`,
      {
        method: "POST",
      },
    );
    assert.equal(syncResponse.status, 200);

    const statusResponse = await fetch(
      `${runtime.baseUrl}/api/v1/openfinance/connections/${createPayload.data.id}/status`,
    );
    const statusPayload = (await statusResponse.json()) as {
      data: { progress_pct: number; status: string };
    };

    assert.equal(statusPayload.data.status, "active");
    assert.equal(statusPayload.data.progress_pct, 100);

    const webhookFirst = await fetch(`${runtime.baseUrl}/api/v1/openfinance/webhooks`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        event_id: "evt_001",
        connection_id: createPayload.data.id,
        status: "active",
      }),
    });
    assert.equal(webhookFirst.status, 200);
    const webhookFirstPayload = (await webhookFirst.json()) as {
      data: { duplicate: boolean };
    };
    assert.equal(webhookFirstPayload.data.duplicate, false);

    const webhookSecond = await fetch(`${runtime.baseUrl}/api/v1/openfinance/webhooks`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        event_id: "evt_001",
        connection_id: createPayload.data.id,
        status: "active",
      }),
    });
    assert.equal(webhookSecond.status, 200);
    const webhookSecondPayload = (await webhookSecond.json()) as {
      data: { duplicate: boolean };
    };
    assert.equal(webhookSecondPayload.data.duplicate, true);
  } finally {
    await runtime.close();
  }
});

test("ai action preview requires confirm before execution", async () => {
  const runtime = await startApiServer();

  try {
    const previewResponse = await fetch(`${runtime.baseUrl}/api/v1/ai/actions/preview`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        action_type: "recategorize_transaction",
        payload: {
          transaction_id: "tx_1",
          target_category: "mobilidade",
        },
      }),
    });

    assert.equal(previewResponse.status, 201);
    const previewPayload = (await previewResponse.json()) as {
      data: { id: string; status: string };
    };

    assert.equal(previewPayload.data.status, "pending_confirm");

    const confirmResponse = await fetch(
      `${runtime.baseUrl}/api/v1/ai/actions/${previewPayload.data.id}/confirm`,
      {
        method: "POST",
      },
    );

    assert.equal(confirmResponse.status, 200);

    const txResponse = await fetch(`${runtime.baseUrl}/api/v1/transactions?category=mobilidade`);
    const txPayload = (await txResponse.json()) as {
      total: number;
    };

    assert.ok(txPayload.total >= 1);
  } finally {
    await runtime.close();
  }
});

test("transactions endpoint supports search, sorting and pagination", async () => {
  const runtime = await startApiServer();

  try {
    await fetch(`${runtime.baseUrl}/api/v1/transactions/manual`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        description: "Uber Black",
        amount_brl: 40,
        type: "expense",
        category: "taxi_apps",
        account_id: "acc_bank_1",
        date: "2026-03-04T12:00:00.000Z",
      }),
    });

    await fetch(`${runtime.baseUrl}/api/v1/transactions/manual`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({
        description: "Salario",
        amount_brl: 5200,
        type: "income",
        category: "transferencias",
        account_id: "acc_bank_1",
        date: "2026-03-04T08:00:00.000Z",
      }),
    });

    const searchResponse = await fetch(
      `${runtime.baseUrl}/api/v1/transactions?q=uber&sort=amount_desc&page=1&page_size=1`,
    );
    assert.equal(searchResponse.status, 200);

    const searchPayload = (await searchResponse.json()) as {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      data: Array<{ description: string; amount_brl: number }>;
    };

    assert.ok(searchPayload.total >= 2);
    assert.equal(searchPayload.page, 1);
    assert.equal(searchPayload.page_size, 1);
    assert.ok(searchPayload.total_pages >= 2);
    assert.ok(searchPayload.data[0].description.toLowerCase().includes("uber"));
  } finally {
    await runtime.close();
  }
});
