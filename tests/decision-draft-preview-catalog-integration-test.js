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
import DecisionDraftPreviewSandbox from "../portal/core/DecisionDraftPreviewSandbox.js";

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
    sandboxId: "decision-draft-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T15:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T15:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);
const decisionDraft = DecisionDraftPreviewSandbox.createDraft(recommendationDraft);

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

assert.equal(recommendationDraft.draftMode, "recommendation_draft_preview_sandbox_read_only");
assert.equal(recommendationDraft.recommendationPrepared, true);

assert.equal(decisionDraft.draftMode, "decision_draft_preview_sandbox_read_only");
assert.equal(decisionDraft.sourceDraftMode, "recommendation_draft_preview_sandbox_read_only");
assert.equal(decisionDraft.canPrepareDecision, true);
assert.equal(decisionDraft.decisionPrepared, true);

assert.equal(decisionDraft.question.questionId, "DE-TDD-06-036");
assert.equal(decisionDraft.recommendation.linkedRiskLevel, "elevated");
assert.equal(decisionDraft.decisionRoute, "conditional_decision");

assert.ok(decisionDraft.decision.title);
assert.ok(decisionDraft.decision.summary);
assert.ok(decisionDraft.decision.proposedDecision);
assert.ok(decisionDraft.decision.requiredCondition);
assert.equal(decisionDraft.decision.persisted, false);
assert.equal(decisionDraft.decision.previewOnly, true);

assert.equal(decisionDraft.governanceImpact.requiresExpertReview, true);
assert.equal(decisionDraft.governanceImpact.requiresCapexReview, true);
assert.equal(decisionDraft.governanceImpact.requiresDecisionNote, true);

assert.equal(decisionDraft.safetyBoundary.decisionDraftPersisted, false);
assert.equal(decisionDraft.safetyBoundary.decisionCreated, false);
assert.equal(decisionDraft.safetyBoundary.reportCreated, false);
assert.equal(decisionDraft.safetyBoundary.workflowCreated, false);

console.log("DecisionDraftPreviewSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Decision question: ${decisionDraft.question.questionId}`);
console.log(`Decision prepared: ${decisionDraft.decisionPrepared}`);
console.log(`Decision route: ${decisionDraft.decisionRoute}`);
console.log(`Proposed decision: ${decisionDraft.decision.proposedDecision}`);
console.log(`Required condition: ${decisionDraft.decision.requiredCondition}`);
console.log("Safety boundary:");
console.log(`- decisionDraftPersisted: ${decisionDraft.safetyBoundary.decisionDraftPersisted}`);
console.log(`- decisionCreated: ${decisionDraft.safetyBoundary.decisionCreated}`);
console.log(`- reportCreated: ${decisionDraft.safetyBoundary.reportCreated}`);
console.log(`- workflowCreated: ${decisionDraft.safetyBoundary.workflowCreated}`);
