import test from "node:test";
import assert from "node:assert/strict";
import { buildScreenInsights, createActionExecution, createActionProposal } from "../../packages/domain/src/index.js";

test("buildScreenInsights returns contextual insights for each screen", () => {
  const dashboardInsights = buildScreenInsights("dashboard");
  const transactionInsights = buildScreenInsights("transactions");

  assert.ok(dashboardInsights.length > 0);
  assert.ok(transactionInsights.length > 0);
  assert.equal(dashboardInsights[0].screen, "dashboard");
  assert.equal(transactionInsights[0].screen, "transactions");
});

test("action proposal and execution keep confirm flow metadata", () => {
  const proposal = createActionProposal("aip_1", "recategorize_transaction", {
    transaction_id: "tx_1",
    target_category: "transporte",
  });

  assert.equal(proposal.status, "pending_confirm");
  assert.equal(proposal.action_type, "recategorize_transaction");

  const execution = createActionExecution("aie_1", proposal.id, { applied: true });
  assert.equal(execution.proposal_id, proposal.id);
  assert.equal(execution.result.applied, true);
});
