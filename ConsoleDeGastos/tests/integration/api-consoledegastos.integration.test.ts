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
