import type {
  AccountDetailDTOv1,
  AiActionExecutionDTOv1,
  AiActionProposalDTOv1,
  CategoryDTOv1,
  InvoiceSummaryDTOv1,
  OpenFinanceConnectionDTOv1,
  RecurringDTOv1,
  ReportJobDTOv1,
  TransactionDTOv1,
  UserSessionDTOv1,
} from "@consoledegastos/contracts";

export interface AiSession {
  id: string;
  screen: string;
  messages: Array<{ role: "user" | "assistant"; text: string; created_at: string }>;
}

export interface RuntimeStore {
  sessions: UserSessionDTOv1[];
  open_finance_connections: OpenFinanceConnectionDTOv1[];
  accounts: AccountDetailDTOv1[];
  transactions: TransactionDTOv1[];
  recurrents: RecurringDTOv1[];
  categories: CategoryDTOv1[];
  invoices: InvoiceSummaryDTOv1[];
  report_jobs: ReportJobDTOv1[];
  ai_sessions: AiSession[];
  ai_action_proposals: AiActionProposalDTOv1[];
  ai_action_executions: AiActionExecutionDTOv1[];
  feedbacks: Array<{ id: string; score: number; comment: string; created_at: string }>;
  alerts: Array<{ id: string; kind: string; message: string; created_at: string }>;
}

const nowIso = () => new Date().toISOString();

export const createRuntimeStore = (): RuntimeStore => ({
  sessions: [],
  open_finance_connections: [],
  accounts: [
    {
      id: "acc_bank_1",
      name: "Carteira",
      institution: "Nubank",
      kind: "bank",
      balance_brl: 960.55,
      limit_brl: 0,
      masked_number: "**** 2107",
    },
    {
      id: "acc_card_1",
      name: "gold",
      institution: "Nubank",
      kind: "credit_card",
      balance_brl: -5113.98,
      limit_brl: 12200,
      masked_number: "**** 2107",
    },
  ],
  transactions: [
    {
      id: "tx_1",
      description: "Uber",
      amount_brl: 7.91,
      type: "expense",
      category: "taxi_apps",
      account_id: "acc_bank_1",
      date: "2026-03-03T11:42:00.000Z",
    },
    {
      id: "tx_2",
      description: "Transferencia Recebida",
      amount_brl: 220,
      type: "income",
      category: "transferencias",
      account_id: "acc_bank_1",
      date: "2026-03-02T07:58:00.000Z",
    },
  ],
  recurrents: [
    {
      id: "rec_1",
      description: "Streaming",
      amount_brl: 39.9,
      type: "expense",
      progress_label: "1/12",
      due_date: "2026-03-10",
      confirmed: false,
    },
  ],
  categories: [
    {
      id: "cat_1",
      name: "taxi_apps",
      monthly_limit_brl: 450,
      spent_brl: 207.2,
    },
    {
      id: "cat_2",
      name: "transferencias",
      monthly_limit_brl: 0,
      spent_brl: 0,
    },
  ],
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
  report_jobs: [],
  ai_sessions: [],
  ai_action_proposals: [],
  ai_action_executions: [],
  feedbacks: [],
  alerts: [
    {
      id: "alert_1",
      kind: "category_limit",
      message: "Categoria taxi_apps proxima do limite mensal.",
      created_at: nowIso(),
    },
  ],
});
