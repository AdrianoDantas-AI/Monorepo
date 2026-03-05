import type {
  CashflowPeriod,
  CashflowViewData,
  DashboardModalState,
  DashboardPeriod,
  DashboardUiState,
  DashboardViewData,
  InvoicesViewData,
  OpenFinanceConnectionView,
  TransactionFilters,
  RecurrentsViewData,
  TransactionsViewData,
} from "./api.js";
import type { WebRoute, WebSection } from "./routes.js";
import { sectionLabels, sectionOrder, webRoutes } from "./routes.js";
import { appStyles } from "./styles.js";
import {
  renderBadge,
  renderButton,
  renderCard,
  renderEmptyState,
  renderErrorState,
  renderInput,
  renderSkeleton,
} from "./components.js";

export interface WebSession {
  id: string;
  user_id: string;
  provider: string;
  created_at: string;
}

export interface DashboardRenderModel {
  period: DashboardPeriod;
  state: DashboardUiState;
  data: DashboardViewData | null;
  modalState: DashboardModalState | null;
  modalConnection: OpenFinanceConnectionView | null;
  errorMessage: string | null;
}

export interface TransactionsRenderModel {
  state: DashboardUiState;
  data: TransactionsViewData | null;
  errorMessage: string | null;
  notice: string | null;
  showCreateForm: boolean;
  exporting: boolean;
  returnTo: string;
}

export interface RecurrentsRenderModel {
  state: DashboardUiState;
  data: RecurrentsViewData | null;
  errorMessage: string | null;
}

export interface CashflowRenderModel {
  state: DashboardUiState;
  period: CashflowPeriod;
  data: CashflowViewData | null;
  errorMessage: string | null;
}

export interface InvoicesRenderModel {
  state: DashboardUiState;
  data: InvoicesViewData | null;
  errorMessage: string | null;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 }).format(value);

const formatSignedCurrency = (value: number): string => {
  if (value > 0) {
    return `+${formatCurrency(value)}`;
  }

  if (value < 0) {
    return `-${formatCurrency(Math.abs(value))}`;
  }

  return formatCurrency(0);
};

const formatPercent = (value: number): string => `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

const formatMonthRef = (monthRef: string): string => {
  const parsed = new Date(`${monthRef}-01T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return monthRef;
  }
  return parsed.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
};

const recurringStatusBadge = (confirmed: boolean): string =>
  renderBadge({ label: confirmed ? "Confirmado" : "Pendente", tone: confirmed ? "success" : "warning" });

const renderDocument = (title: string, body: string): string => `
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>${appStyles}</style>
  </head>
  <body>${body}</body>
</html>
`;

const routesBySection = (section: WebSection): WebRoute[] => webRoutes.filter((route) => route.section === section);

const renderSidebar = (activePath: string): string => `
<aside class="shell__sidebar">
  <div class="shell__brand">ConsoleDeGastos</div>
  ${sectionOrder
    .map(
      (section) => `
    <p class="shell__section-title">${sectionLabels[section]}</p>
    <nav class="shell__menu">
      ${routesBySection(section)
        .map(
          (route) => `
        <a class="shell__menu-link ${route.path === activePath ? "is-active" : ""}" href="${route.path}">
          <span>${route.icon}</span>
          <span class="shell__menu-label">${route.label}</span>
        </a>
      `,
        )
        .join("")}
    </nav>
  `,
    )
    .join("")}
</aside>
`;

const renderTopbar = (session: WebSession, title: string): string => `
<header class="shell__topbar">
  <h1 class="shell__topbar-title">${title}</h1>
  <div class="shell__topbar-actions">
    ${renderBadge({ label: `sessao ${session.provider}`, tone: "info" })}
    ${renderButton({ label: "Logout", href: "/logout", variant: "ghost" })}
  </div>
</header>
`;

const renderShell = (options: {
  activePath: string;
  pageTitle: string;
  contentHtml: string;
  session: WebSession;
  overlayHtml?: string;
}): string =>
  renderDocument(
    options.pageTitle,
    `
<main class="shell" data-active-route="${options.activePath}" data-shell="AppShell">
  ${renderSidebar(options.activePath)}
  <section class="shell__content">
    ${renderTopbar(options.session, options.pageTitle)}
    <div class="shell__viewport">
      ${options.contentHtml}
    </div>
  </section>
</main>
${options.overlayHtml ?? ""}
`,
  );

export const renderLoginPage = (errorMessage: string | null = null): string =>
  renderDocument(
    "ConsoleDeGastos | Login",
    `
<main class="login-page">
  <section class="login-page__panel">
    <h1>Acesso</h1>
    <p>Entre com Google OAuth ou Magic Link para usar o console.</p>
    <div class="stack">
      ${errorMessage ? renderErrorState({ title: "Falha no login", description: errorMessage, retryHref: "/login" }) : ""}
      ${renderButton({ label: "Entrar com Google", href: "/login?provider=google", variant: "primary" })}
      ${renderButton({ label: "Entrar com Magic Link", href: "/login?provider=magic", variant: "secondary" })}
    </div>
  </section>
</main>
`,
  );

const renderScreenPlaceholder = (route: WebRoute): string =>
  renderCard({
    title: route.label,
    subtitle: `Modulo ${route.screen}`,
    body: `
<div class="stack">
  ${renderBadge({ label: "Sprint 1 foundation", tone: "warning" })}
  <p class="text-muted">Layout base implementado. Tela real sera concluida nas sprints seguintes.</p>
  ${renderEmptyState({
    title: "Conteudo em evolucao",
    description: "Este modulo ja esta com shell, guard de sessao e design system base.",
    actionHref: "/sandbox/components",
    actionLabel: "Abrir sandbox",
  })}
</div>
`,
  });

const renderDashboardFilters = (period: DashboardPeriod): string => `
<div class="dashboard-filters">
  <a class="dashboard-filter ${period === "7d" ? "is-active" : ""}" href="/app/dashboard?period=7d">7D</a>
  <a class="dashboard-filter ${period === "30d" ? "is-active" : ""}" href="/app/dashboard?period=30d">30D</a>
  <a class="dashboard-filter ${period === "90d" ? "is-active" : ""}" href="/app/dashboard?period=90d">90D</a>
  <a class="dashboard-filter ${period === "ytd" ? "is-active" : ""}" href="/app/dashboard?period=ytd">YTD</a>
</div>
`;

const renderOpenFinanceSection = (model: DashboardRenderModel): string => {
  if (!model.data || model.state !== "ready") {
    return renderCard({
      title: "Conectar Open Finance",
      subtitle: "Aguardando dados da dashboard",
      body: renderSkeleton(3),
    });
  }

  if (model.data.connections.length === 0) {
    return renderCard({
      title: "Conecte suas contas",
      subtitle: "Comece conectando contas bancarias e cartoes para visao completa",
      body: `
<div class="stack">
  ${renderEmptyState({
    title: "Nenhuma conexao ativa",
    description: "Conecte uma instituicao para sincronizar dados financeiros.",
  })}
  ${renderButton({ label: "Conectar conta", href: "/app/dashboard/connect/start", variant: "primary" })}
</div>
`,
    });
  }

  return renderCard({
    title: "Conexoes Open Finance",
    subtitle: `${model.data.connections.length} conexao(oes) cadastrada(s)`,
    body: `
<div class="stack">
  ${model.data.connections
    .map(
      (connection) => `
    <div class="connection-row">
      <div>
        <strong>${connection.institution}</strong>
        <p class="text-muted">status: ${connection.status}</p>
      </div>
      <div class="connection-row__actions">
        ${renderBadge({
          label: `${connection.progress_pct}%`,
          tone: connection.status === "active" ? "success" : connection.status === "error" ? "warning" : "info",
        })}
        ${renderButton({
          label: "Sincronizar",
          href: `/app/dashboard/connect/sync?connection_id=${encodeURIComponent(connection.id)}`,
          variant: "secondary",
        })}
      </div>
    </div>
  `,
    )
    .join("")}
  ${renderButton({ label: "Conectar nova conta", href: "/app/dashboard/connect/start", variant: "ghost" })}
</div>
`,
  });
};

const renderDashboardMain = (model: DashboardRenderModel): string => {
  if (model.state === "loading") {
    return `
<div class="stack">
  ${renderCard({ title: "Carregando dashboard", subtitle: "Buscando dados em tempo real", body: renderSkeleton(4) })}
  ${renderCard({ title: "Aguarde", subtitle: "Preparando blocos de visao geral", body: renderSkeleton(5) })}
</div>
`;
  }

  if (model.state === "error" || !model.data) {
    return renderErrorState({
      title: "Nao foi possivel carregar o dashboard",
      description: model.errorMessage ?? "Falha de comunicacao com a API.",
      retryHref: "/app/dashboard",
    });
  }

  const variationLabel = `${model.data.cashflow.variation_pct >= 0 ? "+" : ""}${model.data.cashflow.variation_pct.toFixed(2)}%`;
  const variationTone = model.data.cashflow.variation_pct < 0 ? "warning" : "success";

  return `
<div class="stack">
  ${renderDashboardFilters(model.period)}
  ${renderOpenFinanceSection(model)}
  <div class="grid-2">
    ${renderCard({
      title: "Ritmo de Gastos",
      subtitle: `Periodo ${model.period.toUpperCase()}`,
      body: `
        <div class="stack">
          <p class="metric">${formatCurrency(model.data.metrics.spending_rhythm_brl)}</p>
          ${renderBadge({ label: `variacao ${variationLabel}`, tone: variationTone })}
        </div>
      `,
    })}
    ${renderCard({
      title: "Patrimonio",
      subtitle: "Consolidado atual",
      body: `
        <div class="stack">
          <p class="metric">${formatCurrency(model.data.metrics.patrimony_brl)}</p>
          ${renderBadge({ label: "dados sincronizados", tone: "info" })}
        </div>
      `,
    })}
  </div>
  <div class="grid-2">
    ${renderCard({
      title: "Resultado Parcial",
      subtitle: "Receitas - despesas",
      body: `
        <div class="stack">
          <p class="metric">${formatSignedCurrency(model.data.metrics.partial_result_brl)}</p>
          ${renderBadge({ label: `cashflow ${variationLabel}`, tone: variationTone })}
        </div>
      `,
    })}
    ${renderCard({
      title: "Faturas do Mes",
      subtitle: "Resumo de despesas recorrentes",
      body: `
        ${
          model.data.upcomingExpenses.length === 0
            ? renderEmptyState({
                title: "Sem despesas recorrentes",
                description: "Nenhum pagamento recorrente para os proximos dias.",
              })
            : `<ul class="list-plain">
                ${model.data.upcomingExpenses
                  .map(
                    (item) => `
                  <li>
                    <div>
                      <strong>${item.description}</strong>
                      <p class="text-muted">vence em ${item.due_date} - ${item.progress_label}</p>
                    </div>
                    <span>${formatCurrency(item.amount_brl)}</span>
                  </li>
                `,
                  )
                  .join("")}
              </ul>`
        }
      `,
    })}
  </div>
  ${renderCard({
    title: "Transacoes recentes",
    subtitle: "Atualizadas por Open Finance",
    body: `
      ${
        model.data.recentTransactions.length === 0
          ? renderEmptyState({
              title: "Nenhuma transacao encontrada",
              description: "Conecte uma conta para ver as transacoes recentes aqui.",
              actionHref: "/app/dashboard/connect/start",
              actionLabel: "Conectar conta",
            })
          : `<ul class="list-plain">
              ${model.data.recentTransactions
                .map(
                  (tx) => `
                <li>
                  <div>
                    <strong>${tx.description}</strong>
                    <p class="text-muted">${tx.category} - ${tx.date.slice(0, 10)}</p>
                  </div>
                  <span class="${tx.type === "income" ? "is-positive" : "is-negative"}">${formatCurrency(tx.amount_brl)}</span>
                </li>
              `,
                )
                .join("")}
            </ul>`
      }
    `,
  })}
</div>
`;
};

const renderOpenFinanceModal = (model: DashboardRenderModel): string => {
  if (!model.modalState) {
    return "";
  }

  const progress = model.modalConnection?.progress_pct ?? (model.modalState === "success" ? 100 : 0);
  const institution = model.modalConnection?.institution ?? "Instituicao";
  const message =
    model.modalState === "success"
      ? "Seus dados foram coletados com sucesso."
      : model.modalState === "error"
        ? "Falha ao coletar dados. Tente novamente."
        : "Coletando dados de investimentos.";

  const tone =
    model.modalState === "success" ? "success" : model.modalState === "error" ? "warning" : "info";
  const actionHref =
    model.modalState === "success"
      ? "/app/dashboard"
      : model.modalState === "error"
        ? "/app/dashboard/connect/start"
        : model.modalConnection
          ? `/app/dashboard/connect/sync?connection_id=${encodeURIComponent(model.modalConnection.id)}`
          : "/app/dashboard";

  const actionLabel =
    model.modalState === "success"
      ? "Fechar"
      : model.modalState === "error"
        ? "Tentar novamente"
        : "Concluir sincronizacao";

  return `
<section class="dashboard-modal-backdrop">
  <div class="dashboard-modal-card">
    <h3>Autenticando a sua conta</h3>
    <p class="text-muted">${institution}</p>
    <div class="dashboard-modal-progress">
      <strong>${progress}%</strong>
      <div class="progress-track">
        <span class="progress-fill" style="width:${Math.max(0, Math.min(100, progress))}%"></span>
      </div>
    </div>
    ${renderBadge({ label: message, tone })}
    <div class="dashboard-modal-actions">
      ${renderButton({ label: actionLabel, href: actionHref, variant: "primary" })}
      ${renderButton({ label: "Cancelar", href: "/app/dashboard", variant: "ghost" })}
    </div>
  </div>
</section>
`;
};

export const renderDashboardPage = (session: WebSession, model: DashboardRenderModel): string =>
  renderShell({
    activePath: "/app/dashboard",
    pageTitle: "Dashboard",
    session,
    contentHtml: renderDashboardMain(model),
    overlayHtml: renderOpenFinanceModal(model),
  });

const buildTransactionsQuery = (
  filters: TransactionFilters,
  overrides: Partial<TransactionFilters & { create: boolean; exporting: boolean }> = {},
): string => {
  const merged = {
    ...filters,
    ...overrides,
  };
  const search = new URLSearchParams();
  if (merged.q.trim().length > 0) {
    search.set("q", merged.q.trim());
  }
  if (merged.type !== "all") {
    search.set("type", merged.type);
  }
  if (merged.category.length > 0) {
    search.set("category", merged.category);
  }
  if (merged.accountId.length > 0) {
    search.set("account_id", merged.accountId);
  }
  if (merged.period !== "all") {
    search.set("period", merged.period);
  }
  if (merged.sort !== "date_desc") {
    search.set("sort", merged.sort);
  }
  if (merged.page !== 1) {
    search.set("page", String(merged.page));
  }
  if (merged.pageSize !== 15) {
    search.set("page_size", String(merged.pageSize));
  }
  if (overrides.create) {
    search.set("create", "1");
  }
  if (overrides.exporting) {
    search.set("exporting", "1");
  }
  return search.toString();
};

const renderTransactionsFilters = (model: TransactionsRenderModel): string => {
  if (!model.data) {
    return "";
  }

  const filters = model.data.filters;
  const baseQuery = buildTransactionsQuery(filters);
  const exportQuery = buildTransactionsQuery(filters, { exporting: true });
  const createQuery = buildTransactionsQuery(filters, { create: true });

  return `
<div class="stack">
  ${
    model.notice
      ? renderBadge({
          label: model.notice,
          tone: "success",
        })
      : ""
  }
  <form class="transactions-filter-form" method="GET" action="/app/transactions" data-transactions-filter-form="1">
    <div class="grid-2">
      ${renderInput({
        id: "tx-q",
        name: "q",
        label: "Busca",
        placeholder: "Buscar transacoes...",
        value: filters.q,
        type: "search",
      })}
      <label class="ui-field" for="tx-period">
        <span class="ui-field__label">Periodo</span>
        <select class="ui-input" id="tx-period" name="period">
          <option value="all" ${filters.period === "all" ? "selected" : ""}>Tudo</option>
          <option value="7d" ${filters.period === "7d" ? "selected" : ""}>Ultimos 7 dias</option>
          <option value="30d" ${filters.period === "30d" ? "selected" : ""}>Ultimos 30 dias</option>
          <option value="90d" ${filters.period === "90d" ? "selected" : ""}>Ultimos 90 dias</option>
        </select>
      </label>
    </div>
    <div class="grid-2">
      <label class="ui-field" for="tx-type">
        <span class="ui-field__label">Tipo</span>
        <select class="ui-input" id="tx-type" name="type">
          <option value="all" ${filters.type === "all" ? "selected" : ""}>Todos</option>
          <option value="expense" ${filters.type === "expense" ? "selected" : ""}>Despesas</option>
          <option value="income" ${filters.type === "income" ? "selected" : ""}>Receitas</option>
        </select>
      </label>
      <label class="ui-field" for="tx-sort">
        <span class="ui-field__label">Ordenacao</span>
        <select class="ui-input" id="tx-sort" name="sort">
          <option value="date_desc" ${filters.sort === "date_desc" ? "selected" : ""}>Data desc</option>
          <option value="date_asc" ${filters.sort === "date_asc" ? "selected" : ""}>Data asc</option>
          <option value="amount_desc" ${filters.sort === "amount_desc" ? "selected" : ""}>Valor desc</option>
          <option value="amount_asc" ${filters.sort === "amount_asc" ? "selected" : ""}>Valor asc</option>
        </select>
      </label>
    </div>
    <div class="grid-2">
      <label class="ui-field" for="tx-category">
        <span class="ui-field__label">Categoria</span>
        <select class="ui-input" id="tx-category" name="category">
          <option value="">Todas</option>
          ${model.data.categories
            .map(
              (category) =>
                `<option value="${category.name}" ${filters.category === category.name ? "selected" : ""}>${category.name}</option>`,
            )
            .join("")}
        </select>
      </label>
      <label class="ui-field" for="tx-account">
        <span class="ui-field__label">Conta</span>
        <select class="ui-input" id="tx-account" name="account_id">
          <option value="">Todas</option>
          ${model.data.accounts
            .map(
              (account) =>
                `<option value="${account.id}" ${filters.accountId === account.id ? "selected" : ""}>${account.name}</option>`,
            )
            .join("")}
        </select>
      </label>
    </div>
    <input type="hidden" name="page_size" value="${filters.pageSize}" />
    <div class="transactions-toolbar-actions">
      <button class="ui-button ui-button--primary" type="submit"><span>Aplicar filtros</span></button>
      ${renderButton({ label: "Limpar", href: "/app/transactions", variant: "ghost" })}
      ${renderButton({ label: "Criar transacao", href: `/app/transactions?${createQuery}`, variant: "secondary" })}
      ${
        model.exporting
          ? `${renderBadge({ label: "Gerando CSV...", tone: "info" })}
             ${renderButton({ label: "Baixar CSV", href: `/app/transactions/export.csv?${baseQuery}`, variant: "primary" })}`
          : renderButton({ label: "Exportar CSV", href: `/app/transactions?${exportQuery}`, variant: "secondary" })
      }
    </div>
  </form>
  <script>
    (() => {
      const form = document.querySelector('[data-transactions-filter-form="1"]');
      const input = document.getElementById('tx-q');
      if (!(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) {
        return;
      }

      let debounceHandle = 0;
      input.addEventListener('input', () => {
        clearTimeout(debounceHandle);
        debounceHandle = window.setTimeout(() => {
          form.requestSubmit();
        }, 350);
      });
    })();
  </script>
</div>
`;
};

const renderTransactionsCreateForm = (model: TransactionsRenderModel): string => {
  if (!model.showCreateForm || !model.data) {
    return "";
  }

  return renderCard({
    title: "Criar transacao manual",
    subtitle: "Preencha os campos para inserir uma nova transacao",
    body: `
<form class="stack" method="POST" action="/app/transactions/create">
  <input type="hidden" name="return_to" value="${model.returnTo}" />
  ${renderInput({ id: "manual-description", name: "description", label: "Descricao", placeholder: "Ex: Uber", value: "" })}
  <div class="grid-2">
    ${renderInput({
      id: "manual-amount",
      name: "amount_brl",
      label: "Valor BRL",
      placeholder: "0.00",
      value: "",
      type: "number",
    })}
    <label class="ui-field" for="manual-type">
      <span class="ui-field__label">Tipo</span>
      <select class="ui-input" id="manual-type" name="type">
        <option value="expense">Despesa</option>
        <option value="income">Receita</option>
      </select>
    </label>
  </div>
  <div class="grid-2">
    <label class="ui-field" for="manual-category">
      <span class="ui-field__label">Categoria</span>
      <select class="ui-input" id="manual-category" name="category">
        ${model.data.categories.map((category) => `<option value="${category.name}">${category.name}</option>`).join("")}
      </select>
    </label>
    <label class="ui-field" for="manual-account">
      <span class="ui-field__label">Conta</span>
      <select class="ui-input" id="manual-account" name="account_id">
        ${model.data.accounts.map((account) => `<option value="${account.id}">${account.name}</option>`).join("")}
      </select>
    </label>
  </div>
  ${renderInput({
    id: "manual-date",
    name: "date",
    label: "Data (ISO)",
    placeholder: "2026-03-05T10:00:00.000Z",
    value: new Date().toISOString().slice(0, 16),
    type: "datetime-local",
  })}
  <div class="transactions-toolbar-actions">
    <button class="ui-button ui-button--primary" type="submit"><span>Salvar transacao</span></button>
    ${renderButton({ label: "Fechar", href: model.returnTo, variant: "ghost" })}
  </div>
</form>
`,
  });
};

const renderTransactionsTable = (model: TransactionsRenderModel): string => {
  if (model.state === "loading") {
    return renderCard({
      title: "Carregando transacoes",
      subtitle: "Buscando dados com filtros aplicados",
      body: renderSkeleton(6),
    });
  }

  if (model.state === "error" || !model.data) {
    return renderErrorState({
      title: "Erro ao carregar transacoes",
      description: model.errorMessage ?? "Nao foi possivel carregar a lista no momento.",
      retryHref: "/app/transactions",
    });
  }

  if (model.data.rows.length === 0) {
    return renderEmptyState({
      title: "Nenhuma transacao encontrada",
      description: "Altere os filtros ou crie uma transacao manual para iniciar o historico.",
      actionHref: "/app/transactions?create=1",
      actionLabel: "Criar transacao",
    });
  }

  const page = model.data.page;
  const pageSize = model.data.pageSize;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(start + model.data.rows.length - 1, model.data.total);

  return renderCard({
    title: "Tabela de transacoes",
    subtitle: `Mostrando ${start}-${end} de ${model.data.total}`,
    body: `
<div class="transactions-table-wrapper">
  <table class="transactions-table">
    <thead>
      <tr>
        <th>Descricao</th>
        <th>Categoria</th>
        <th>Conta</th>
        <th>Data</th>
        <th>Valor</th>
        <th>Acao</th>
      </tr>
    </thead>
    <tbody>
      ${model.data.rows
        .map(
          (row) => `
        <tr>
          <td>${row.description}</td>
          <td>${row.category}</td>
          <td>${row.account_id}</td>
          <td>${row.date.slice(0, 10)}</td>
          <td class="${row.type === "income" ? "is-positive" : "is-negative"}">${formatCurrency(row.amount_brl)}</td>
          <td>
            <form class="row-action-form" method="POST" action="/app/transactions/recategorize">
              <input type="hidden" name="tx_id" value="${row.id}" />
              <input type="hidden" name="return_to" value="${model.returnTo}" />
              <select class="ui-input" name="category">
                ${model.data?.categories
                  .map(
                    (category) =>
                      `<option value="${category.name}" ${row.category === category.name ? "selected" : ""}>${category.name}</option>`,
                  )
                  .join("")}
              </select>
              <button class="ui-button ui-button--ghost" type="submit">Salvar</button>
            </form>
          </td>
        </tr>
      `,
        )
        .join("")}
    </tbody>
  </table>
</div>
<div class="transactions-pagination">
  <a class="dashboard-filter ${model.data.page <= 1 ? "is-disabled" : ""}" href="/app/transactions?${buildTransactionsQuery(model.data.filters, { page: Math.max(1, model.data.page - 1) })}">Anterior</a>
  <span>Pagina ${model.data.page} de ${model.data.totalPages}</span>
  <a class="dashboard-filter ${model.data.page >= model.data.totalPages ? "is-disabled" : ""}" href="/app/transactions?${buildTransactionsQuery(model.data.filters, { page: Math.min(model.data.totalPages, model.data.page + 1) })}">Proxima</a>
</div>
`,
  });
};

const renderTransactionsMetrics = (model: TransactionsRenderModel): string => {
  if (!model.data || model.state !== "ready") {
    return renderCard({
      title: "Resumo",
      subtitle: "Aguardando dados",
      body: renderSkeleton(3),
    });
  }

  return renderCard({
    title: "Resumo de transacoes",
    subtitle: "Metricas agregadas dos filtros atuais",
    body: `
<div class="grid-2">
  <div class="stack">
    ${renderBadge({ label: `Quantidade ${model.data.totals.count}`, tone: "info" })}
    <p class="metric">${formatCurrency(model.data.totals.expenses_brl)}</p>
    <p class="text-muted">Saidas</p>
  </div>
  <div class="stack">
    ${renderBadge({ label: "Receitas", tone: "success" })}
    <p class="metric">${formatCurrency(model.data.totals.incomes_brl)}</p>
    <p class="text-muted">Entradas</p>
  </div>
</div>
<div class="stack">
  ${renderBadge({ label: "Saldo", tone: model.data.totals.balance_brl >= 0 ? "success" : "warning" })}
  <p class="metric">${formatSignedCurrency(model.data.totals.balance_brl)}</p>
</div>
`,
  });
};

export const renderTransactionsPage = (session: WebSession, model: TransactionsRenderModel): string =>
  renderShell({
    activePath: "/app/transactions",
    pageTitle: "Transacoes",
    session,
    contentHtml: `
<div class="stack">
  ${renderTransactionsFilters(model)}
  ${renderTransactionsMetrics(model)}
  ${renderTransactionsCreateForm(model)}
  ${renderTransactionsTable(model)}
</div>
`,
  });

const renderRecurrentsFilters = (model: RecurrentsRenderModel): string => {
  if (!model.data) {
    return renderSkeleton(2);
  }

  const { type, month } = model.data.filters;
  return `
<div class="stack">
  <div class="module-tabs">
    <a class="dashboard-filter ${type === "expense" ? "is-active" : ""}" href="/app/recurrents?type=expense&month=${encodeURIComponent(month)}">Despesas</a>
    <a class="dashboard-filter ${type === "income" ? "is-active" : ""}" href="/app/recurrents?type=income&month=${encodeURIComponent(month)}">Receitas</a>
  </div>
  <form class="transactions-filter-form" method="GET" action="/app/recurrents">
    <input type="hidden" name="type" value="${type}" />
    ${renderInput({
      id: "recurrents-month",
      name: "month",
      label: "Mes de referencia",
      type: "text",
      value: month,
      placeholder: "AAAA-MM",
    })}
    <div class="transactions-toolbar-actions">
      <button class="ui-button ui-button--primary" type="submit"><span>Aplicar mes</span></button>
      ${renderButton({ label: "Mes atual", href: `/app/recurrents?type=${type}`, variant: "ghost" })}
    </div>
  </form>
</div>
`;
};

const renderRecurrentsSummary = (model: RecurrentsRenderModel): string => {
  if (!model.data) {
    return renderCard({
      title: "Resumo mensal de recorrentes",
      subtitle: "Aguardando dados",
      body: renderSkeleton(5),
    });
  }

  const summary = model.data.summary;
  const progress = Math.max(0, Math.min(100, summary.paid_pct));

  return renderCard({
    title: "Resumo mensal de recorrentes",
    subtitle: formatMonthRef(model.data.filters.month),
    body: `
<div class="grid-2">
  <div class="progress-ring" style="--progress:${progress};">
    <div class="progress-ring__inner">
      <strong>${progress.toFixed(1)}%</strong>
      <span>pago</span>
    </div>
  </div>
  <div class="stack">
    <p class="metric">${formatCurrency(summary.paid_brl)} / ${formatCurrency(summary.expected_brl)}</p>
    <p class="text-muted">Total pago vs previsto</p>
    ${renderBadge({ label: `Restante ${formatCurrency(summary.remaining_brl)}`, tone: "info" })}
    <div class="grid-2">
      <div class="stack">
        <strong>Parcelas</strong>
        <p class="text-muted">${formatCurrency(summary.installments_paid_brl)} / ${formatCurrency(summary.installments_expected_brl)}</p>
      </div>
      <div class="stack">
        <strong>Recorrentes</strong>
        <p class="text-muted">${formatCurrency(summary.recurrents_paid_brl)} / ${formatCurrency(summary.recurrents_expected_brl)}</p>
      </div>
    </div>
  </div>
</div>
`,
  });
};

const renderRecurrentsList = (model: RecurrentsRenderModel): string => {
  if (model.state === "loading") {
    return renderCard({
      title: "Recorrentes",
      subtitle: "Carregando lista",
      body: renderSkeleton(6),
    });
  }

  if (model.state === "error" || !model.data) {
    return renderErrorState({
      title: "Falha ao carregar recorrentes",
      description: model.errorMessage ?? "Nao foi possivel carregar os recorrentes.",
      retryHref: "/app/recurrents",
    });
  }

  if (model.data.groups.length === 0) {
    return renderEmptyState({
      title: "Nenhum recorrente encontrado",
      description: "Sem recorrencias para o tipo e mes selecionados.",
    });
  }

  return renderCard({
    title: "Lancamentos recorrentes",
    subtitle: `Agrupado por data (${model.data.groups.length} grupo(s))`,
    body: `
<div class="stack">
  ${model.data.groups
    .map(
      (group) => `
    <section class="recurrents-group">
      <header class="recurrents-group__header">
        <h3>${group.label}</h3>
      </header>
      <ul class="list-plain">
        ${group.rows
          .map(
            (row) => `
          <li class="recurrents-row">
            <div>
              <strong>${row.description}</strong>
              <p class="text-muted">${row.progress_label} - vence ${row.due_date.slice(0, 10)}</p>
            </div>
            <div class="recurrents-row__meta">
              ${recurringStatusBadge(row.confirmed)}
              ${renderBadge({ label: `Restante ${formatCurrency(row.remaining_brl)}`, tone: row.remaining_brl > 0 ? "warning" : "success" })}
              <span>${formatCurrency(row.amount_brl)}</span>
            </div>
          </li>
        `,
          )
          .join("")}
      </ul>
    </section>
  `,
    )
    .join("")}
</div>
`,
  });
};

export const renderRecurrentsPage = (session: WebSession, model: RecurrentsRenderModel): string =>
  renderShell({
    activePath: "/app/recurrents",
    pageTitle: "Recorrentes",
    session,
    contentHtml: `
<div class="stack">
  ${renderRecurrentsFilters(model)}
  ${renderRecurrentsSummary(model)}
  ${renderRecurrentsList(model)}
</div>
`,
  });

const renderCashflowFilters = (period: CashflowPeriod): string => `
<div class="module-tabs">
  <a class="dashboard-filter ${period === "last_30_days" ? "is-active" : ""}" href="/app/cashflow?period=last_30_days">30 dias</a>
  <a class="dashboard-filter ${period === "last_3_months" ? "is-active" : ""}" href="/app/cashflow?period=last_3_months">3 meses</a>
  <a class="dashboard-filter ${period === "ytd" ? "is-active" : ""}" href="/app/cashflow?period=ytd">YTD</a>
</div>
`;

const renderCashflowMain = (model: CashflowRenderModel): string => {
  if (model.state === "loading") {
    return `
<div class="stack">
  ${renderCashflowFilters(model.period)}
  ${renderCard({ title: "Fluxo consolidado", subtitle: "Carregando", body: renderSkeleton(6) })}
</div>
`;
  }

  if (model.state === "error" || !model.data) {
    return renderErrorState({
      title: "Falha ao carregar fluxo de caixa",
      description: model.errorMessage ?? "Nao foi possivel montar os graficos agora.",
      retryHref: "/app/cashflow",
    });
  }

  const peak = Math.max(
    1,
    ...model.data.timeline.map((point) => Math.max(point.expenses_brl, point.incomes_brl)),
  );
  const trendTone = model.data.trend_direction === "up" ? "success" : model.data.trend_direction === "down" ? "warning" : "info";
  const trendLabel = model.data.trend_direction === "up" ? "Tendencia de alta" : model.data.trend_direction === "down" ? "Tendencia de queda" : "Tendencia estavel";

  return `
<div class="stack">
  ${renderCashflowFilters(model.period)}
  ${renderCard({
    title: "Fluxo consolidado",
    subtitle: "Visao por periodo com tendencia",
    body: `
      <div class="stack">
        <div class="grid-2">
          <div class="stack">
            <p class="metric">${formatCurrency(model.data.metrics.incomes_brl - model.data.metrics.expenses_brl)}</p>
            ${renderBadge({ label: trendLabel, tone: trendTone })}
          </div>
          <div class="stack">
            <p class="text-muted">Variacao consolidada</p>
            <p class="metric">${formatPercent(model.data.metrics.variation_pct)}</p>
          </div>
        </div>
        <div class="cashflow-timeline">
          ${model.data.timeline
            .map(
              (point) => `
            <div class="cashflow-timeline__row">
              <span>${point.label}</span>
              <div class="cashflow-bar cashflow-bar--income" style="width:${Math.max(4, (point.incomes_brl / peak) * 100)}%"></div>
              <div class="cashflow-bar cashflow-bar--expense" style="width:${Math.max(4, (point.expenses_brl / peak) * 100)}%"></div>
              <strong>${formatSignedCurrency(point.balance_brl)}</strong>
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `,
  })}
  <div class="grid-2">
    ${renderCard({
      title: "Gastos",
      subtitle: `${formatCurrency(model.data.metrics.expenses_brl)} no periodo`,
      body: `
        <div class="stack">
          ${renderBadge({ label: `Variacao ${formatPercent(model.data.metrics.variation_pct)}`, tone: model.data.metrics.variation_pct <= 0 ? "success" : "warning" })}
          ${
            model.data.expenses_breakdown.length === 0
              ? `<p class="text-muted">Sem despesas para detalhamento.</p>`
              : `<ul class="list-plain">
                  ${model.data.expenses_breakdown
                    .map(
                      (item) => `
                    <li>
                      <div>
                        <strong>${item.category}</strong>
                        <p class="text-muted">${item.participation_pct.toFixed(1)}%</p>
                      </div>
                      <span>${formatCurrency(item.amount_brl)}</span>
                    </li>
                  `,
                    )
                    .join("")}
                </ul>`
          }
          ${renderButton({ label: "Drilldown despesas", href: "/app/transactions?type=expense", variant: "ghost" })}
        </div>
      `,
    })}
    ${renderCard({
      title: "Receitas",
      subtitle: `${formatCurrency(model.data.metrics.incomes_brl)} no periodo`,
      body: `
        <div class="stack">
          ${renderBadge({ label: "Entradas por categoria", tone: "success" })}
          ${
            model.data.incomes_breakdown.length === 0
              ? `<p class="text-muted">Sem receitas para detalhamento.</p>`
              : `<ul class="list-plain">
                  ${model.data.incomes_breakdown
                    .map(
                      (item) => `
                    <li>
                      <div>
                        <strong>${item.category}</strong>
                        <p class="text-muted">${item.participation_pct.toFixed(1)}%</p>
                      </div>
                      <span>${formatCurrency(item.amount_brl)}</span>
                    </li>
                  `,
                    )
                    .join("")}
                </ul>`
          }
          ${renderButton({ label: "Drilldown receitas", href: "/app/transactions?type=income", variant: "ghost" })}
        </div>
      `,
    })}
  </div>
</div>
`;
};

export const renderCashflowPage = (session: WebSession, model: CashflowRenderModel): string =>
  renderShell({
    activePath: "/app/cashflow",
    pageTitle: "Fluxo de Caixa",
    session,
    contentHtml: renderCashflowMain(model),
  });

const renderInvoicesMain = (model: InvoicesRenderModel): string => {
  if (model.state === "loading") {
    return `
<div class="stack">
  ${renderCard({ title: "Faturas", subtitle: "Carregando", body: renderSkeleton(6) })}
</div>
`;
  }

  if (model.state === "error" || !model.data) {
    return renderErrorState({
      title: "Falha ao carregar faturas",
      description: model.errorMessage ?? "Nao foi possivel carregar as faturas deste mes.",
      retryHref: "/app/invoices",
    });
  }

  const data = model.data;

  return `
<div class="stack">
  <form class="transactions-filter-form" method="GET" action="/app/invoices">
    ${renderInput({
      id: "invoice-month",
      name: "month",
      label: "Mes de referencia",
      value: data.month_ref,
      placeholder: "AAAA-MM",
    })}
    <div class="transactions-toolbar-actions">
      <button class="ui-button ui-button--primary" type="submit"><span>Aplicar</span></button>
      ${renderButton({ label: "Mes atual", href: "/app/invoices", variant: "ghost" })}
    </div>
  </form>
  ${renderCard({
    title: "Total das faturas",
    subtitle: formatMonthRef(data.month_ref),
    body: `
      <div class="grid-2">
        <div class="stack">
          <p class="metric">${formatCurrency(data.totals.total_brl)}</p>
          <p class="text-muted">Soma mensal consolidada</p>
        </div>
        <div class="stack invoices-breakdown">
          <div><span>Parcelas</span><strong>${formatCurrency(data.totals.installments_brl)}</strong></div>
          <div><span>Recorrentes</span><strong>${formatCurrency(data.totals.recurring_brl)}</strong></div>
          <div><span>Avulsas</span><strong>${formatCurrency(data.totals.one_off_brl)}</strong></div>
        </div>
      </div>
    `,
  })}
  ${
    data.invoices.length === 0
      ? renderEmptyState({
          title: "Nenhuma fatura encontrada",
          description: "Nao existem faturas para o mes selecionado.",
        })
      : renderCard({
          title: "Faturas por cartao",
          subtitle: `${data.invoices.length} cartao(oes)`,
          body: `
            <ul class="list-plain">
              ${data.invoices
                .map(
                  (invoice) => `
                <li>
                  <div>
                    <strong>${invoice.card_name}</strong>
                    <p class="text-muted">${formatCurrency(invoice.total_brl)} - ${invoice.month_ref}</p>
                  </div>
                  <div class="transactions-toolbar-actions">
                    ${renderBadge({ label: `${formatCurrency(invoice.installments_brl)} parcelas`, tone: "warning" })}
                    ${renderBadge({ label: `${formatCurrency(invoice.one_off_brl)} avulsas`, tone: "info" })}
                    ${renderButton({
                      label: "Ver transacoes",
                      href: `/app/invoices?month=${encodeURIComponent(data.month_ref)}&invoice_id=${encodeURIComponent(invoice.id)}`,
                      variant: data.selected_invoice_id === invoice.id ? "primary" : "secondary",
                    })}
                  </div>
                </li>
              `,
                )
                .join("")}
            </ul>
          `,
        })
  }
  ${renderCard({
    title: "Transacoes da fatura",
    subtitle: data.selected_invoice_id ?? "Nenhuma fatura selecionada",
    body:
      data.selected_invoice_transactions.length === 0
        ? `<p class="text-muted">Nenhuma transacao vinculada para exibir.</p>`
        : `<ul class="list-plain">
            ${data.selected_invoice_transactions
              .map(
                (transaction) => `
              <li>
                <div>
                  <strong>${transaction.description}</strong>
                  <p class="text-muted">${transaction.category} - ${transaction.date.slice(0, 10)}</p>
                </div>
                <span class="${transaction.type === "income" ? "is-positive" : "is-negative"}">${formatCurrency(transaction.amount_brl)}</span>
              </li>
            `,
              )
              .join("")}
          </ul>`,
  })}
</div>
`;
};

export const renderInvoicesPage = (session: WebSession, model: InvoicesRenderModel): string =>
  renderShell({
    activePath: "/app/invoices",
    pageTitle: "Faturas",
    session,
    contentHtml: renderInvoicesMain(model),
  });

export const renderModulePage = (route: WebRoute, session: WebSession): string =>
  renderShell({
    activePath: route.path,
    pageTitle: route.label,
    session,
    contentHtml: `
<div class="grid-2">
  ${renderCard({
    title: "Estado inicial",
    subtitle: "Base para loading/empty/error",
    body: `
      <div class="stack">
        ${renderSkeleton(4)}
        ${renderBadge({ label: "Loading state", tone: "neutral" })}
      </div>
    `,
  })}
  ${renderCard({
    title: "Sessao ativa",
    subtitle: "Guard de rota validado",
    body: `
      <div class="stack">
        ${renderBadge({ label: `user ${session.user_id}`, tone: "success" })}
        ${renderBadge({ label: `provider ${session.provider}`, tone: "info" })}
      </div>
    `,
  })}
</div>
${renderScreenPlaceholder(route)}
`,
  });

export const renderComponentSandboxPage = (session: WebSession): string =>
  renderShell({
    activePath: "/sandbox/components",
    pageTitle: "Sandbox de Componentes",
    session,
    contentHtml: `
${renderCard({
  title: "Componentes Base",
  subtitle: "Button, Badge, Input, EmptyState, ErrorState e Skeleton",
  body: `
    <div class="stack">
      <div class="stack">
        ${renderButton({ label: "Primary", href: "#", variant: "primary" })}
        ${renderButton({ label: "Secondary", href: "#", variant: "secondary" })}
        ${renderButton({ label: "Ghost", href: "#", variant: "ghost" })}
      </div>
      <div class="stack">
        ${renderBadge({ label: "Info", tone: "info" })}
        ${renderBadge({ label: "Success", tone: "success" })}
        ${renderBadge({ label: "Warning", tone: "warning" })}
      </div>
      ${renderInput({ id: "sandbox-search", label: "Busca", placeholder: "Digite para filtrar..." })}
      ${renderEmptyState({
        title: "Sem resultados",
        description: "Nenhum item encontrado para os filtros aplicados.",
        actionHref: "/app/transactions",
        actionLabel: "Ir para Transacoes",
      })}
      ${renderErrorState({
        title: "Falha de carregamento",
        description: "Nao foi possivel carregar os dados no momento.",
        retryHref: "/sandbox/components",
      })}
      ${renderSkeleton(4)}
    </div>
  `,
})}
`,
  });

export const renderNotFoundPage = (session: WebSession | null): string => {
  if (!session) {
    return renderDocument(
      "Pagina nao encontrada",
      `
<main class="login-page">
  <section class="login-page__panel">
    ${renderErrorState({
      title: "Pagina nao encontrada",
      description: "A rota informada nao existe.",
      retryHref: "/login",
    })}
  </section>
</main>
`,
    );
  }

  return renderShell({
    activePath: "",
    pageTitle: "Nao encontrado",
    session,
    contentHtml: renderErrorState({
      title: "Rota invalida",
      description: "Escolha um modulo valido no menu lateral.",
      retryHref: "/app/dashboard",
    }),
  });
};
