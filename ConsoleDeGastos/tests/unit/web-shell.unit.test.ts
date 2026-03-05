import test from "node:test";
import assert from "node:assert/strict";
import {
  renderComponentSandboxPage,
  renderDashboardPage,
  renderModulePage,
  renderTransactionsPage,
} from "../../apps/web/src/pages.js";
import { defaultProtectedPath, webRoutes } from "../../apps/web/src/routes.js";

const sessionFixture = {
  id: "sess_test",
  user_id: "user_1",
  provider: "google",
  created_at: "2026-03-04T00:00:00.000Z",
};

test("web routes include all planned modules and default route", () => {
  assert.equal(webRoutes.length, 11);
  assert.equal(defaultProtectedPath, "/app/dashboard");

  const routePaths = new Set(webRoutes.map((route) => route.path));
  assert.ok(routePaths.has("/app/dashboard"));
  assert.ok(routePaths.has("/app/transactions"));
  assert.ok(routePaths.has("/app/recurrents"));
  assert.ok(routePaths.has("/app/cashflow"));
  assert.ok(routePaths.has("/app/accounts"));
  assert.ok(routePaths.has("/app/invoices"));
  assert.ok(routePaths.has("/app/categories"));
  assert.ok(routePaths.has("/app/forecast"));
  assert.ok(routePaths.has("/app/patrimony"));
  assert.ok(routePaths.has("/app/reports"));
  assert.ok(routePaths.has("/app/ai-assistant"));
});

test("module page renders appshell with active route and tokens", () => {
  const route = webRoutes[0];
  const html = renderModulePage(route, sessionFixture);

  assert.ok(html.includes('data-shell="AppShell"'));
  assert.ok(html.includes(`data-active-route="${route.path}"`));
  assert.ok(html.includes(route.label));
  assert.ok(html.includes("--bg-main"));
});

test("component sandbox renders all base component blocks", () => {
  const html = renderComponentSandboxPage(sessionFixture);

  assert.ok(html.includes("Componentes Base"));
  assert.ok(html.includes("ui-button--primary"));
  assert.ok(html.includes("ui-badge--info"));
  assert.ok(html.includes("ui-input"));
  assert.ok(html.includes("ui-empty-state"));
  assert.ok(html.includes("ui-error-state"));
  assert.ok(html.includes("ui-skeleton"));
});

test("dashboard page renders real cards with filters and lists", () => {
  const html = renderDashboardPage(sessionFixture, {
    period: "30d",
    state: "ready",
    modalState: null,
    modalConnection: null,
    errorMessage: null,
    data: {
      metrics: {
        spending_rhythm_brl: 312.12,
        patrimony_brl: 960.55,
        partial_result_brl: 212.09,
      },
      cashflow: {
        period: "last_30_days",
        expenses_brl: 312.12,
        incomes_brl: 524.21,
        variation_pct: 67.96,
      },
      recentTransactions: [
        {
          id: "tx_1",
          description: "Uber",
          amount_brl: 7.91,
          type: "expense",
          category: "taxi_apps",
          date: "2026-03-03T11:42:00.000Z",
        },
      ],
      upcomingExpenses: [
        {
          id: "rec_1",
          description: "Streaming",
          amount_brl: 39.9,
          progress_label: "1/12",
          due_date: "2026-03-10",
          confirmed: false,
        },
      ],
      connections: [],
    },
  });

  assert.ok(html.includes("Ritmo de Gastos"));
  assert.ok(html.includes("Patrimonio"));
  assert.ok(html.includes("Resultado Parcial"));
  assert.ok(html.includes("Transacoes recentes"));
  assert.ok(html.includes("Conecte suas contas"));
  assert.ok(html.includes("dashboard-filter is-active"));
});

test("dashboard modal supports auth and success states", () => {
  const authenticatingHtml = renderDashboardPage(sessionFixture, {
    period: "7d",
    state: "ready",
    errorMessage: null,
    data: {
      metrics: { spending_rhythm_brl: 0, patrimony_brl: 0, partial_result_brl: 0 },
      cashflow: { period: "last_7_days", expenses_brl: 0, incomes_brl: 0, variation_pct: 0 },
      recentTransactions: [],
      upcomingExpenses: [],
      connections: [
        {
          id: "conn_1",
          institution: "Nubank",
          status: "processing",
          progress_pct: 56,
          updated_at: "2026-03-04T00:00:00.000Z",
        },
      ],
    },
    modalState: "authenticating",
    modalConnection: {
      id: "conn_1",
      institution: "Nubank",
      status: "processing",
      progress_pct: 56,
      updated_at: "2026-03-04T00:00:00.000Z",
    },
  });

  assert.ok(authenticatingHtml.includes("Autenticando a sua conta"));
  assert.ok(authenticatingHtml.includes("56%"));

  const successHtml = renderDashboardPage(sessionFixture, {
    period: "30d",
    state: "ready",
    errorMessage: null,
    data: {
      metrics: { spending_rhythm_brl: 0, patrimony_brl: 0, partial_result_brl: 0 },
      cashflow: { period: "last_30_days", expenses_brl: 0, incomes_brl: 0, variation_pct: 0 },
      recentTransactions: [],
      upcomingExpenses: [],
      connections: [],
    },
    modalState: "success",
    modalConnection: {
      id: "conn_1",
      institution: "Nubank",
      status: "active",
      progress_pct: 100,
      updated_at: "2026-03-04T00:00:00.000Z",
    },
  });

  assert.ok(successHtml.includes("100%"));
  assert.ok(successHtml.includes("Seus dados foram coletados com sucesso."));
});

test("transactions page renders filters, metrics and table rows", () => {
  const html = renderTransactionsPage(sessionFixture, {
    state: "ready",
    errorMessage: null,
    notice: "Transacao criada com sucesso.",
    showCreateForm: true,
    exporting: true,
    returnTo: "/app/transactions",
    data: {
      filters: {
        q: "Uber",
        type: "expense",
        category: "taxi_apps",
        accountId: "acc_bank_1",
        period: "30d",
        sort: "date_desc",
        page: 1,
        pageSize: 15,
      },
      rows: [
        {
          id: "tx_1",
          description: "Uber",
          amount_brl: 7.91,
          type: "expense",
          category: "taxi_apps",
          account_id: "acc_bank_1",
          date: "2026-03-03T11:42:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 15,
      totalPages: 1,
      categories: [
        {
          id: "cat_1",
          name: "taxi_apps",
          monthly_limit_brl: 450,
          spent_brl: 200,
        },
      ],
      accounts: [
        {
          id: "acc_bank_1",
          name: "Carteira",
          institution: "Nubank",
          kind: "bank",
          balance_brl: 100,
          limit_brl: 0,
          masked_number: "**** 2107",
        },
      ],
      totals: {
        count: 1,
        incomes_brl: 0,
        expenses_brl: 7.91,
        balance_brl: -7.91,
      },
    },
  });

  assert.ok(html.includes("Resumo de transacoes"));
  assert.ok(html.includes("Tabela de transacoes"));
  assert.ok(html.includes("Mercado") === false);
  assert.ok(html.includes("Uber"));
  assert.ok(html.includes("Gerando CSV"));
  assert.ok(html.includes("Criar transacao manual"));
});
