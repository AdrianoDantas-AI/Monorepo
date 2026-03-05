export type ScreenName =
  | "dashboard"
  | "transactions"
  | "recurrents"
  | "cashflow"
  | "accounts"
  | "invoices"
  | "categories"
  | "forecast"
  | "patrimony"
  | "reports";

export interface UserSessionDTOv1 {
  id: string;
  user_id: string;
  provider: "google" | "magic_link";
  created_at: string;
}

export interface OpenFinanceConnectionDTOv1 {
  id: string;
  institution: string;
  status: "processing" | "active" | "error";
  progress_pct: number;
  updated_at: string;
}

export interface AccountDTOv1 {
  id: string;
  name: string;
  institution: string;
  kind: "bank" | "credit_card" | "investment";
  balance_brl: number;
  limit_brl: number;
}

export interface AccountDetailDTOv1 extends AccountDTOv1 {
  masked_number: string;
}

export interface TransactionDTOv1 {
  id: string;
  description: string;
  amount_brl: number;
  type: "income" | "expense";
  category: string;
  account_id: string;
  date: string;
}

export interface RecurringDTOv1 {
  id: string;
  description: string;
  amount_brl: number;
  type: "expense" | "income";
  progress_label: string;
  due_date: string;
  confirmed: boolean;
}

export interface CategoryDTOv1 {
  id: string;
  name: string;
  monthly_limit_brl: number;
  spent_brl: number;
}

export interface InvoiceSummaryDTOv1 {
  id: string;
  card_name: string;
  month_ref: string;
  total_brl: number;
  installments_brl: number;
  recurring_brl: number;
  one_off_brl: number;
}

export interface CashflowDTOv1 {
  period: string;
  expenses_brl: number;
  incomes_brl: number;
  variation_pct: number;
}

export interface ForecastDTOv1 {
  scenario: "base" | "optimistic" | "conservative";
  horizon_months: number;
  month_end_balance_brl: number;
  confidence_range_brl: [number, number];
}

export interface PatrimonyDTOv1 {
  net_worth_brl: number;
  assets_brl: number;
  debts_brl: number;
}

export interface DashboardDTOv1 {
  spending_rhythm_brl: number;
  patrimony_brl: number;
  partial_result_brl: number;
}

export interface ReportJobDTOv1 {
  id: string;
  status: "queued" | "done";
  format: "csv" | "pdf";
  created_at: string;
}

export interface AiInsightDTOv1 {
  id: string;
  screen: ScreenName;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  created_at: string;
}

export interface AiActionProposalDTOv1 {
  id: string;
  action_type:
    | "recategorize_transaction"
    | "update_category_limit"
    | "mark_recurring_confirmed"
    | "generate_report"
    | "create_cashflow_alert";
  summary: string;
  status: "pending_confirm" | "executed";
  payload: Record<string, unknown>;
  created_at: string;
}

export interface AiActionExecutionDTOv1 {
  id: string;
  proposal_id: string;
  executed_at: string;
  result: Record<string, unknown>;
}
