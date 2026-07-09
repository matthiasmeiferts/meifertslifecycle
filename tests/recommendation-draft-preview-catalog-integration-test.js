import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";
import EvidenceRequirementPreviewEngine from "../portal/core/EvidenceRequirementPreviewEngine.js";
import EvidenceCaptureDraftSandbox from "../portal/core/EvidenceCaptureDraftSandbox.js";
import FindingDraftPreviewSandbox from "../portal/core/FindingDraftPreviewSandbox.js";
import AssessmentDraftPreviewSandbox from "../portal/core/AssessmentDraftPreviewSandbox.js";
import RecommendationDraftPreviewSandbox from "../portal/core/RecommendationDraftPreviewSandbox.js";

const catalogPath = "portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json";
const rawCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));

QuestionCatalogManager.loadFromData(rawCatalog);

const catalogItems = QuestionCatalogManager.getAll();

const profile = {
    country: "Thailand",
    buildingType: "Condominium",
    useType: "Residential",
    ageBand: "Existing",
    climateZone: "Tropical",
    locationContext: "Coastal",
    legalContext: "Ownership",
    inspectionPurpose: "Acquisition"
};

const preview = AdaptiveInspectionPreviewBridge.createPreview(profile, catalogItems, {
    startLimit: 5,
    followUpLimit: 5
});

const scopeDraft = AdaptiveScopeDraftEngine.createScopeDraft(preview);

const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(scopeDraft, {
    sandboxId: "recommendation-draft-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T13:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T13:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);

assert.equal(catalogItems.length, 680);

assert.equal(preview.previewMode, "read_only");
assert.equal(scopeDraft.draftMode, "read_only");
assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(afterFinding.stateMode, "sandbox_answer_state_read_only");

assert.equal(evidenceRequirement.previewMode, "evidence_requirement_preview_read_only");
assert.equal(evidenceRequirement.evidenceRequired, true);

assert.equal(completedCaptureDraft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(completedCaptureDraft.completion.readyForReview, true);

assert.equal(findingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(findingDraft.findingPrepared, true);

assert.equal(assessmentDraft.draftMode, "assessment_draft_preview_sandbox_read_only");
assert.equal(assessmentDraft.assessmentPrepared, true);
assert.equal(assessmentDraft.riskPreview.level, "elevated");

assert.equal(recommendationDraft.draftMode, "recommendation_draft_preview_sandbox_read_only");
assert.equal(recommendationDraft.sourceDraftMode, "assessment_draft_preview_sandbox_read_only");
assert.equal(recommendationDraft.canPrepareRecommendation, true);
assert.equal(recommendationDraft.recommendationPrepared, true);

assert.equal(recommendationDraft.question.questionId, "DE-TDD-06-036");
assert.equal(recommendationDraft.assessment.riskLevel, "elevated");
assert.equal(recommendationDraft.recommendationTone, "risk_control");

assert.ok(recommendationDraft.recommendation.title);
assert.ok(recommendationDraft.recommendation.summary);
assert.ok(recommendationDraft.recommendation.expertRecommendation);
assert.ok(recommendationDraft.recommendation.nextAction);
assert.equal(recommendationDraft.recommendation.persisted, false);
assert.equal(recommendationDraft.recommendation.previewOnly, true);

assert.equal(recommendationDraft.decisionSupport.requiresExpertReview, true);
assert.equal(recommendationDraft.decisionSupport.requiresCapexReview, true);

assert.equal(recommendationDraft.safetyBoundary.recommendationDraftPersisted, false);
assert.equal(recommendationDraft.safetyBoundary.recommendationCreated, false);
assert.equal(recommendationDraft.safetyBoundary.decisionCreated, false);
assert.equal(recommendationDraft.safetyBoundary.reportCreated, false);
assert.equal(recommendationDraft.safetyBoundary.workflowCreated, false);

console.log("RecommendationDraftPreviewSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Recommendation question: ${recommendationDraft.question.questionId}`);
console.log(`Recommendation prepared: ${recommendationDraft.recommendationPrepared}`);
console.log(`Recommendation tone: ${recommendationDraft.recommendationTone}`);
console.log(`Next action: ${recommendationDraft.recommendation.nextAction}`);
console.log(`Decision impact: ${recommendationDraft.decisionSupport.decisionImpact}`);
console.log("Safety boundary:");
console.log(`- recommendationDraftPersisted: ${recommendationDraft.safetyBoundary.recommendationDraftPersisted}`);
console.log(`- recommendationCreated: ${recommendationDraft.safetyBoundary.recommendationCreated}`);
console.log(`- decisionCreated: ${recommendationDraft.safetyBoundary.decisionCreated}`);
console.log(`- reportCreated: ${recommendationDraft.safetyBoundary.reportCreated}`);
