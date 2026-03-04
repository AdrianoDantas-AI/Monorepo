import type {
  AiActionExecutionDTOv1,
  AiActionProposalDTOv1,
  AiInsightDTOv1,
  ScreenName,
} from "@consoledegastos/contracts";

const nowIso = () => new Date().toISOString();

const insightMap: Record<ScreenName, Array<{ title: string; message: string; severity: "info" | "warning" | "critical" }>> = {
  dashboard: [
    {
      title: "Ritmo de gastos acelerado",
      message: "Os gastos do periodo atual estao acima da media recente.",
      severity: "warning",
    },
  ],
  transactions: [
    {
      title: "Recategorizacao sugerida",
      message: "Transacoes de transporte podem ser agrupadas em 'Taxi e apps'.",
      severity: "info",
    },
  ],
  recurrents: [
    {
      title: "Nova assinatura detectada",
      message: "Foi detectado padrao mensal recorrente em compras digitais.",
      severity: "warning",
    },
  ],
  cashflow: [
    {
      title: "Risco de deficit",
      message: "Fluxo de caixa projetado indica periodo negativo no proximo mes.",
      severity: "critical",
    },
  ],
  accounts: [
    {
      title: "Uso de limite elevado",
      message: "Cartoes com uso acima de 40% podem exigir ajuste de pagamento.",
      severity: "warning",
    },
  ],
  invoices: [
    {
      title: "Priorizar fatura principal",
      message: "A maior fatura do ciclo atual deve ser priorizada para reduzir encargos.",
      severity: "warning",
    },
  ],
  categories: [
    {
      title: "Limite proximo do teto",
      message: "Categoria de transporte esta proxima do limite mensal.",
      severity: "warning",
    },
  ],
  forecast: [
    {
      title: "Cenario base estavel",
      message: "Projecao indica estabilidade com pequena margem de variacao.",
      severity: "info",
    },
  ],
  patrimony: [
    {
      title: "Concentracao de ativos",
      message: "Patrimonio concentrado em caixa; avaliar diversificacao.",
      severity: "info",
    },
  ],
  reports: [
    {
      title: "Resumo pronto para decisao",
      message: "Relatorio consolidado destaca categorias com maior impacto.",
      severity: "info",
    },
  ],
};

export const buildScreenInsights = (screen: ScreenName): AiInsightDTOv1[] => {
  const rows = insightMap[screen] ?? [];
  return rows.map((row, index) => ({
    id: `ins_${screen}_${index + 1}`,
    screen,
    title: row.title,
    message: row.message,
    severity: row.severity,
    created_at: nowIso(),
  }));
};

export const createActionProposal = (
  id: string,
  actionType: AiActionProposalDTOv1["action_type"],
  payload: Record<string, unknown>,
): AiActionProposalDTOv1 => ({
  id,
  action_type: actionType,
  summary: `Acao sugerida: ${actionType}`,
  status: "pending_confirm",
  payload,
  created_at: nowIso(),
});

export const createActionExecution = (
  id: string,
  proposalId: string,
  result: Record<string, unknown>,
): AiActionExecutionDTOv1 => ({
  id,
  proposal_id: proposalId,
  executed_at: nowIso(),
  result,
});
