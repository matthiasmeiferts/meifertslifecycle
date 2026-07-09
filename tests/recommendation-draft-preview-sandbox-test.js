import assert from "node:assert/strict";
import AssessmentDraftPreviewSandbox from "../portal/core/AssessmentDraftPreviewSandbox.js";
import RecommendationDraftPreviewSandbox from "../portal/core/RecommendationDraftPreviewSandbox.js";

const preparedFindingDraft = {
    draftMode: "finding_draft_preview_sandbox_read_only",
    findingPrepared: true,
    question: {
        questionId: "DE-TDD-06-036",
        moduleId: "06",
        moduleTitle: "Keller & Abdichtung"
    },
    finding: {
        title: "Potential issue · Rückstausicherung",
        sourceQuestionId: "DE-TDD-06-036",
        expertWording: "Sandbox finding wording.",
        evidenceReferences: ["photo", "comment"],
        persisted: false,
        previewOnly: true
    },
    severityPreview: {
        level: "elevated",
        persisted: false
    },
    safetyBoundary: {
        findingDraftPersisted: false,
        findingCreated: false,
        assessmentCreated: false,
        reportCreated: false
    }
};

const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(preparedFindingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);

assert.equal(assessmentDraft.assessmentPrepared, true);

assert.equal(recommendationDraft.draftMode, "recommendation_draft_preview_sandbox_read_only");
assert.equal(recommendationDraft.sourceDraftMode, "assessment_draft_preview_sandbox_read_only");
assert.equal(recommendationDraft.sandboxOnly, true);
assert.equal(recommendationDraft.canPrepareRecommendation, true);
assert.equal(recommendationDraft.recommendationPrepared, true);

assert.equal(recommendationDraft.question.questionId, "DE-TDD-06-036");
assert.equal(recommendationDraft.assessment.riskLevel, "elevated");
assert.equal(recommendationDraft.recommendationTone, "risk_control");

assert.ok(recommendationDraft.recommendation.title.includes("DE-TDD-06-036"));
assert.ok(recommendationDraft.recommendation.summary.includes("elevated"));
assert.ok(recommendationDraft.recommendation.expertRecommendation.includes("CAPEX"));
assert.equal(recommendationDraft.recommendation.persisted, false);
assert.equal(recommendationDraft.recommendation.previewOnly, true);

assert.equal(recommendationDraft.decisionSupport.requiresExpertReview, true);
assert.equal(recommendationDraft.decisionSupport.requiresCapexReview, true);

assert.equal(recommendationDraft.safetyBoundary.recommendationDraftPersisted, false);
assert.equal(recommendationDraft.safetyBoundary.recommendationCreated, false);
assert.equal(recommendationDraft.safetyBoundary.decisionCreated, false);
assert.equal(recommendationDraft.safetyBoundary.reportCreated, false);
assert.equal(recommendationDraft.safetyBoundary.workflowCreated, false);

const notReadyRecommendation = RecommendationDraftPreviewSandbox.createDraft({
    draftMode: "assessment_draft_preview_sandbox_read_only",
    assessmentPrepared: false
});

assert.equal(notReadyRecommendation.canPrepareRecommendation, false);
assert.equal(notReadyRecommendation.recommendationPrepared, false);
assert.equal(notReadyRecommendation.recommendation, null);
assert.equal(notReadyRecommendation.guidance.title, "Recommendation draft not ready");

console.log("RecommendationDraftPreviewSandbox core test passed");
console.log(`Recommendation prepared: ${recommendationDraft.recommendationPrepared}`);
console.log(`Recommendation tone: ${recommendationDraft.recommendationTone}`);
console.log(`Next action: ${recommendationDraft.recommendation.nextAction}`);
console.log(`Decision impact: ${recommendationDraft.decisionSupport.decisionImpact}`);
console.log("Safety boundary:");
console.log(`- recommendationDraftPersisted: ${recommendationDraft.safetyBoundary.recommendationDraftPersisted}`);
console.log(`- recommendationCreated: ${recommendationDraft.safetyBoundary.recommendationCreated}`);
console.log(`- decisionCreated: ${recommendationDraft.safetyBoundary.decisionCreated}`);
console.log(`- reportCreated: ${recommendationDraft.safetyBoundary.reportCreated}`);
