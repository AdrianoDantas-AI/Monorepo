export type WebScreen =
  | "dashboard"
  | "transactions"
  | "recurrents"
  | "cashflow"
  | "accounts"
  | "invoices"
  | "categories"
  | "forecast"
  | "patrimony"
  | "reports"
  | "ai_assistant";

export type WebSection = "organizacao" | "controle_financeiro" | "visao_estrategica" | "assistente";

export interface WebRoute {
  screen: WebScreen;
  path: string;
  label: string;
  section: WebSection;
  icon: string;
}

export const webRoutes: WebRoute[] = [
  { screen: "dashboard", path: "/app/dashboard", label: "Visao Geral", section: "organizacao", icon: "[]"},
  { screen: "transactions", path: "/app/transactions", label: "Transacoes", section: "organizacao", icon: "<>" },
  { screen: "recurrents", path: "/app/recurrents", label: "Recorrentes", section: "organizacao", icon: "@@" },
  { screen: "cashflow", path: "/app/cashflow", label: "Fluxo de Caixa", section: "organizacao", icon: "||" },
  { screen: "accounts", path: "/app/accounts", label: "Contas", section: "controle_financeiro", icon: "==" },
  { screen: "invoices", path: "/app/invoices", label: "Faturas", section: "controle_financeiro", icon: "$$" },
  { screen: "categories", path: "/app/categories", label: "Categorias", section: "controle_financeiro", icon: "##" },
  { screen: "forecast", path: "/app/forecast", label: "Projecao", section: "visao_estrategica", icon: "/^" },
  { screen: "patrimony", path: "/app/patrimony", label: "Patrimonio", section: "visao_estrategica", icon: "++" },
  { screen: "reports", path: "/app/reports", label: "Relatorios", section: "visao_estrategica", icon: "::" },
  { screen: "ai_assistant", path: "/app/ai-assistant", label: "Assistente IA", section: "assistente", icon: "AI" },
];

export const defaultProtectedPath = "/app/dashboard";

export const sectionOrder: WebSection[] = [
  "organizacao",
  "controle_financeiro",
  "visao_estrategica",
  "assistente",
];

export const sectionLabels: Record<WebSection, string> = {
  organizacao: "Organizacao",
  controle_financeiro: "Controle Financeiro",
  visao_estrategica: "Visao Estrategica",
  assistente: "Assistente",
};

const routeByPath = new Map(webRoutes.map((route) => [route.path, route]));

export const findWebRoute = (pathname: string): WebRoute | null => routeByPath.get(pathname) ?? null;

export const isProtectedPath = (pathname: string): boolean =>
  pathname === "/app" || pathname === "/sandbox/components" || pathname.startsWith("/app/");
