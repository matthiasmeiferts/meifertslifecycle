import assert from "node:assert/strict";
import DecisionDraftPreviewSandbox from "../portal/core/DecisionDraftPreviewSandbox.js";

const preparedRecommendationDraft = {
    draftMode: "recommendation_draft_preview_sandbox_read_only",
    recommendationPrepared: true,
    question: {
        questionId: "DE-TDD-06-036",
        moduleId: "06",
        moduleTitle: "Keller & Abdichtung"
    },
    assessment: {
        riskLevel: "elevated"
    },
    recommendationTone: "risk_control",
    recommendation: {
        title: "Recommendation draft · DE-TDD-06-036",
        expertRecommendation: "Proceed only with documented expert review, risk allocation and CAPEX consideration.",
        nextAction: "Include in CAPEX review and transaction risk discussion.",
        linkedRiskLevel: "elevated",
        sourceQuestionId: "DE-TDD-06-036",
        persisted: false,
        previewOnly: true
    },
    decisionSupport: {
        decisionImpact: "May affect acquisition decision, negotiation position or CAPEX assumption.",
        requiresExpertReview: true,
        requiresCapexReview: true
    },
    safetyBoundary: {
        recommendationDraftPersisted: false,
        recommendationCreated: false,
        decisionCreated: false,
        reportCreated: false
    }
};

const decisionDraft = DecisionDraftPreviewSandbox.createDraft(preparedRecommendationDraft);

assert.equal(decisionDraft.draftMode, "decision_draft_preview_sandbox_read_only");
assert.equal(decisionDraft.sourceDraftMode, "recommendation_draft_preview_sandbox_read_only");
assert.equal(decisionDraft.sandboxOnly, true);
assert.equal(decisionDraft.canPrepareDecision, true);
assert.equal(decisionDraft.decisionPrepared, true);

assert.equal(decisionDraft.question.questionId, "DE-TDD-06-036");
assert.equal(decisionDraft.recommendation.linkedRiskLevel, "elevated");
assert.equal(decisionDraft.decisionRoute, "conditional_decision");

assert.ok(decisionDraft.decision.title.includes("DE-TDD-06-036"));
assert.equal(decisionDraft.decision.route, "conditional_decision");
assert.ok(decisionDraft.decision.proposedDecision.includes("documented conditions"));
assert.ok(decisionDraft.decision.requiredCondition.includes("CAPEX"));
assert.equal(decisionDraft.decision.persisted, false);
assert.equal(decisionDraft.decision.previewOnly, true);

assert.equal(decisionDraft.governanceImpact.requiresExpertReview, true);
assert.equal(decisionDraft.governanceImpact.requiresCapexReview, true);
assert.equal(decisionDraft.governanceImpact.requiresDecisionNote, true);

assert.equal(decisionDraft.safetyBoundary.sandboxOnly, true);
assert.equal(decisionDraft.safetyBoundary.decisionDraftPersisted, false);
assert.equal(decisionDraft.safetyBoundary.decisionCreated, false);
assert.equal(decisionDraft.safetyBoundary.reportCreated, false);
assert.equal(decisionDraft.safetyBoundary.workflowCreated, false);

const notReadyDecision = DecisionDraftPreviewSandbox.createDraft({
    draftMode: "recommendation_draft_preview_sandbox_read_only",
    recommendationPrepared: false
});

assert.equal(notReadyDecision.canPrepareDecision, false);
assert.equal(notReadyDecision.decisionPrepared, false);
assert.equal(notReadyDecision.decision, null);
assert.equal(notReadyDecision.guidance.title, "Decision draft not ready");

console.log("DecisionDraftPreviewSandbox core test passed");
console.log(`Decision prepared: ${decisionDraft.decisionPrepared}`);
console.log(`Decision route: ${decisionDraft.decisionRoute}`);
console.log(`Proposed decision: ${decisionDraft.decision.proposedDecision}`);
console.log(`Required condition: ${decisionDraft.decision.requiredCondition}`);
console.log("Safety boundary:");
console.log(`- decisionDraftPersisted: ${decisionDraft.safetyBoundary.decisionDraftPersisted}`);
console.log(`- decisionCreated: ${decisionDraft.safetyBoundary.decisionCreated}`);
console.log(`- reportCreated: ${decisionDraft.safetyBoundary.reportCreated}`);
console.log(`- workflowCreated: ${decisionDraft.safetyBoundary.workflowCreated}`);
