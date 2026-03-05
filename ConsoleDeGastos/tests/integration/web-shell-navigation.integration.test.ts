import test from "node:test";
import assert from "node:assert/strict";
import { startApiServer } from "../../services/api/src/app.js";
import { startWebServer } from "../../apps/web/src/server.js";

const loginAndGetCookie = async (baseUrl: string): Promise<string> => {
  const loginResponse = await fetch(`${baseUrl}/login?provider=google`, { redirect: "manual" });
  assert.equal(loginResponse.status, 302);
  assert.equal(loginResponse.headers.get("location"), "/app/dashboard");

  const setCookie = loginResponse.headers.get("set-cookie");
  assert.ok(setCookie);
  assert.ok(setCookie.includes("cdg_session_id="));

  const authCookie = (setCookie.split(";")[0] ?? "").trim();
  assert.ok(authCookie.startsWith("cdg_session_id="));
  return authCookie;
};

test("protected web routes require session and redirect to login", async () => {
  const api = await startApiServer();
  const web = await startWebServer({
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: api.baseUrl,
  });

  try {
    const response = await fetch(`${web.baseUrl}/app/dashboard`, { redirect: "manual" });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "/login");
  } finally {
    await web.close();
    await api.close();
  }
});

test("login flow creates session cookie and unlocks appshell routes", async () => {
  const api = await startApiServer();
  const web = await startWebServer({
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: api.baseUrl,
  });

  try {
    const authCookie = await loginAndGetCookie(web.baseUrl);

    const dashboardResponse = await fetch(`${web.baseUrl}/app/dashboard`, {
      headers: { cookie: authCookie },
    });
    assert.equal(dashboardResponse.status, 200);

    const dashboardHtml = await dashboardResponse.text();
    assert.ok(dashboardHtml.includes("AppShell"));
    assert.ok(dashboardHtml.includes("Visao Geral"));
    assert.ok(dashboardHtml.includes("sessao google"));

    const sandboxResponse = await fetch(`${web.baseUrl}/sandbox/components`, {
      headers: { cookie: authCookie },
    });
    assert.equal(sandboxResponse.status, 200);
    const sandboxHtml = await sandboxResponse.text();
    assert.ok(sandboxHtml.includes("Componentes Base"));
  } finally {
    await web.close();
    await api.close();
  }
});

test("dashboard openfinance connect flow transitions from authenticating to success", async () => {
  const api = await startApiServer();
  const web = await startWebServer({
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: api.baseUrl,
  });

  try {
    const authCookie = await loginAndGetCookie(web.baseUrl);

    const beforeResponse = await fetch(`${web.baseUrl}/app/dashboard?period=30d`, {
      headers: { cookie: authCookie },
    });
    assert.equal(beforeResponse.status, 200);
    const beforeHtml = await beforeResponse.text();
    assert.ok(beforeHtml.includes("Conecte suas contas"));
    assert.ok(beforeHtml.includes("Ritmo de Gastos"));
    assert.ok(beforeHtml.includes("Transacoes recentes"));

    const connectStart = await fetch(`${web.baseUrl}/app/dashboard/connect/start?period=30d`, {
      redirect: "manual",
      headers: { cookie: authCookie },
    });
    assert.equal(connectStart.status, 302);
    const connectLocation = connectStart.headers.get("location");
    assert.ok(connectLocation);
    assert.ok(connectLocation.includes("modal=authenticating"));
    assert.ok(connectLocation.includes("connection_id="));

    const authModalResponse = await fetch(new URL(connectLocation, web.baseUrl), {
      headers: { cookie: authCookie },
    });
    assert.equal(authModalResponse.status, 200);
    const authModalHtml = await authModalResponse.text();
    assert.ok(authModalHtml.includes("Autenticando a sua conta"));
    assert.ok(authModalHtml.includes("56%"));

    const connectionId = new URL(connectLocation, web.baseUrl).searchParams.get("connection_id");
    assert.ok(connectionId);

    const syncResponse = await fetch(
      `${web.baseUrl}/app/dashboard/connect/sync?period=30d&connection_id=${encodeURIComponent(connectionId)}`,
      {
        redirect: "manual",
        headers: { cookie: authCookie },
      },
    );
    assert.equal(syncResponse.status, 302);
    const syncLocation = syncResponse.headers.get("location");
    assert.ok(syncLocation);
    assert.ok(syncLocation.includes("modal=success"));

    const successResponse = await fetch(new URL(syncLocation, web.baseUrl), {
      headers: { cookie: authCookie },
    });
    assert.equal(successResponse.status, 200);
    const successHtml = await successResponse.text();
    assert.ok(successHtml.includes("100%"));
    assert.ok(successHtml.includes("Seus dados foram coletados com sucesso."));

    const afterResponse = await fetch(`${web.baseUrl}/app/dashboard?period=30d`, {
      headers: { cookie: authCookie },
    });
    const afterHtml = await afterResponse.text();
    assert.ok(afterHtml.includes("Conexoes Open Finance"));
    assert.ok(afterHtml.includes("status: active"));
  } finally {
    await web.close();
    await api.close();
  }
});

test("dashboard supports loading and fallback error states", async () => {
  const api = await startApiServer();
  const web = await startWebServer({
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: api.baseUrl,
  });

  try {
    const authCookie = await loginAndGetCookie(web.baseUrl);

    const loadingResponse = await fetch(`${web.baseUrl}/app/dashboard?state=loading`, {
      headers: { cookie: authCookie },
    });
    assert.equal(loadingResponse.status, 200);
    const loadingHtml = await loadingResponse.text();
    assert.ok(loadingHtml.includes("Carregando dashboard"));

    const errorResponse = await fetch(`${web.baseUrl}/app/dashboard?state=error`, {
      headers: { cookie: authCookie },
    });
    assert.equal(errorResponse.status, 200);
    const errorHtml = await errorResponse.text();
    assert.ok(errorHtml.includes("Nao foi possivel carregar o dashboard"));
  } finally {
    await web.close();
    await api.close();
  }
});

test("transactions screen supports filter, pagination, manual create, recategorize and csv export", async () => {
  const api = await startApiServer();
  const web = await startWebServer({
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: api.baseUrl,
  });

  try {
    const authCookie = await loginAndGetCookie(web.baseUrl);

    const createResponse = await fetch(`${web.baseUrl}/app/transactions/create`, {
      method: "POST",
      redirect: "manual",
      headers: {
        cookie: authCookie,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        description: "Mercado Sprint3",
        amount_brl: "120.50",
        type: "expense",
        category: "taxi_apps",
        account_id: "acc_bank_1",
        date: "2026-03-05T10:30",
        return_to: "/app/transactions",
      }),
    });

    assert.equal(createResponse.status, 302);
    const createdLocation = createResponse.headers.get("location");
    assert.ok(createdLocation);
    assert.ok(createdLocation.includes("notice="));

    const transactionsFiltered = await fetch(
      `${web.baseUrl}/app/transactions?q=Mercado%20Sprint3&type=expense&sort=amount_desc&page=1&page_size=1`,
      {
        headers: { cookie: authCookie },
      },
    );
    assert.equal(transactionsFiltered.status, 200);
    const transactionsHtml = await transactionsFiltered.text();
    assert.ok(transactionsHtml.includes("Resumo de transacoes"));
    assert.ok(transactionsHtml.includes("Mercado Sprint3"));
    assert.ok(transactionsHtml.includes("Pagina 1 de"));

    const createdTx = api.store.transactions.find((item) => item.description === "Mercado Sprint3");
    assert.ok(createdTx);

    const recategorizeResponse = await fetch(`${web.baseUrl}/app/transactions/recategorize`, {
      method: "POST",
      redirect: "manual",
      headers: {
        cookie: authCookie,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        tx_id: createdTx.id,
        category: "transferencias",
        return_to: "/app/transactions?q=Mercado%20Sprint3&type=expense",
      }),
    });

    assert.equal(recategorizeResponse.status, 302);
    const recategorizedTx = api.store.transactions.find((item) => item.id === createdTx.id);
    assert.equal(recategorizedTx?.category, "transferencias");

    const exportResponse = await fetch(`${web.baseUrl}/app/transactions/export.csv?category=transferencias`, {
      headers: { cookie: authCookie },
    });
    assert.equal(exportResponse.status, 200);
    assert.ok((exportResponse.headers.get("content-type") ?? "").includes("text/csv"));
    const csvPayload = await exportResponse.text();
    assert.ok(csvPayload.includes("id,description,type,category,account_id,amount_brl,date"));
    assert.ok(csvPayload.includes("Mercado Sprint3"));
  } finally {
    await web.close();
    await api.close();
  }
});

test("recurrents, cashflow and invoices render real modules with loading and drilldown", async () => {
  const api = await startApiServer();
  const web = await startWebServer({
    host: "127.0.0.1",
    port: 0,
    apiBaseUrl: api.baseUrl,
  });

  try {
    const authCookie = await loginAndGetCookie(web.baseUrl);

    const recurrentsResponse = await fetch(`${web.baseUrl}/app/recurrents?type=expense&month=2026-03`, {
      headers: { cookie: authCookie },
    });
    assert.equal(recurrentsResponse.status, 200);
    const recurrentsHtml = await recurrentsResponse.text();
    assert.ok(recurrentsHtml.includes("Resumo mensal de recorrentes"));
    assert.ok(recurrentsHtml.includes("Streaming"));

    const recurrentsIncomeResponse = await fetch(`${web.baseUrl}/app/recurrents?type=income&month=2026-03`, {
      headers: { cookie: authCookie },
    });
    const recurrentsIncomeHtml = await recurrentsIncomeResponse.text();
    assert.ok(recurrentsIncomeHtml.includes("Nenhum recorrente encontrado"));

    const cashflowResponse = await fetch(`${web.baseUrl}/app/cashflow?period=last_3_months`, {
      headers: { cookie: authCookie },
    });
    assert.equal(cashflowResponse.status, 200);
    const cashflowHtml = await cashflowResponse.text();
    assert.ok(cashflowHtml.includes("Fluxo consolidado"));
    assert.ok(cashflowHtml.includes("Drilldown despesas"));

    const cashflowLoadingResponse = await fetch(`${web.baseUrl}/app/cashflow?period=last_3_months&state=loading`, {
      headers: { cookie: authCookie },
    });
    const cashflowLoadingHtml = await cashflowLoadingResponse.text();
    assert.ok(cashflowLoadingHtml.includes("Carregando"));

    const invoicesResponse = await fetch(`${web.baseUrl}/app/invoices?month=2026-02`, {
      headers: { cookie: authCookie },
    });
    assert.equal(invoicesResponse.status, 200);
    const invoicesHtml = await invoicesResponse.text();
    assert.ok(invoicesHtml.includes("Total das faturas"));
    assert.ok(invoicesHtml.includes("Cartao BTG BLACK"));

    const invoicesDetailsResponse = await fetch(
      `${web.baseUrl}/app/invoices?month=2026-02&invoice_id=inv_2026_02_1`,
      {
        headers: { cookie: authCookie },
      },
    );
    const invoicesDetailsHtml = await invoicesDetailsResponse.text();
    assert.ok(invoicesDetailsHtml.includes("Transacoes da fatura"));
    assert.ok(invoicesDetailsHtml.includes("Uber"));
  } finally {
    await web.close();
    await api.close();
  }
});
