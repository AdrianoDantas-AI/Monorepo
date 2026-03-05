import test from "node:test";
import assert from "node:assert/strict";
import {
  renderCashflowPage,
  renderComponentSandboxPage,
  renderDashboardPage,
  renderInvoicesPage,
  renderModulePage,
  renderRecurrentsPage,
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

test("recurrents page renders tabs, monthly ring and grouped rows", () => {
  const html = renderRecurrentsPage(sessionFixture, {
    state: "ready",
    errorMessage: null,
    data: {
      filters: {
        type: "expense",
        month: "2026-03",
      },
      summary: {
        paid_brl: 39.9,
        expected_brl: 478.8,
        remaining_brl: 438.9,
        paid_pct: 8.3,
        installments_paid_brl: 39.9,
        installments_expected_brl: 478.8,
        recurrents_paid_brl: 0,
        recurrents_expected_brl: 0,
      },
      groups: [
        {
          due_date: "2026-03-10",
          label: "ter., 10 de marco",
          rows: [
            {
              id: "rec_1",
              description: "Streaming",
              amount_brl: 39.9,
              type: "expense",
              progress_label: "1/12",
              due_date: "2026-03-10",
              confirmed: false,
              paid_brl: 0,
              expected_total_brl: 478.8,
              remaining_brl: 478.8,
            },
          ],
        },
      ],
    },
  });

  assert.ok(html.includes("Resumo mensal de recorrentes"));
  assert.ok(html.includes("Despesas"));
  assert.ok(html.includes("Receitas"));
  assert.ok(html.includes("progress-ring"));
  assert.ok(html.includes("Streaming"));
});

test("cashflow page renders trend and category breakdown", () => {
  const html = renderCashflowPage(sessionFixture, {
    state: "ready",
    period: "last_3_months",
    errorMessage: null,
    data: {
      period: "last_3_months",
      metrics: {
        period: "last_3_months",
        expenses_brl: 280.5,
        incomes_brl: 520,
        variation_pct: 85.4,
      },
      trend_direction: "up",
      timeline: [
        {
          key: "2026-02",
          label: "fev. de 26",
          expenses_brl: 140.25,
          incomes_brl: 260,
          balance_brl: 119.75,
        },
        {
          key: "2026-03",
          label: "mar. de 26",
          expenses_brl: 140.25,
          incomes_brl: 260,
          balance_brl: 119.75,
        },
      ],
      expenses_breakdown: [
        {
          category: "taxi_apps",
          amount_brl: 140.25,
          participation_pct: 50,
        },
      ],
      incomes_breakdown: [
        {
          category: "transferencias",
          amount_brl: 520,
          participation_pct: 100,
        },
      ],
    },
  });

  assert.ok(html.includes("Fluxo consolidado"));
  assert.ok(html.includes("Tendencia de alta"));
  assert.ok(html.includes("Drilldown despesas"));
  assert.ok(html.includes("Drilldown receitas"));
});

test("invoices page renders monthly breakdown and invoice drilldown", () => {
  const html = renderInvoicesPage(sessionFixture, {
    state: "ready",
    errorMessage: null,
    data: {
      month_ref: "2026-02",
      totals: {
        total_brl: 3327.39,
        installments_brl: 34.97,
        recurring_brl: 0,
        one_off_brl: 3292.42,
      },
      invoices: [
        {
          id: "inv_2026_02_1",
          card_name: "Cartao BTG BLACK",
          month_ref: "2026-02",
          total_brl: 3327.39,
          installments_brl: 34.97,
          recurring_brl: 0,
          one_off_brl: 3292.42,
        },
      ],
      selected_invoice_id: "inv_2026_02_1",
      selected_invoice_transactions: [
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
    },
  });

  assert.ok(html.includes("Total das faturas"));
  assert.ok(html.includes("Cartao BTG BLACK"));
  assert.ok(html.includes("Transacoes da fatura"));
  assert.ok(html.includes("Uber"));
});
