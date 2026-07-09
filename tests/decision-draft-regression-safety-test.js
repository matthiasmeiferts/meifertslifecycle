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
    sandboxId: "decision-draft-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T16:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const partialCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg"
}, {
    timestamp: "2026-07-09T16:01:00.000Z"
});

const partialFindingDraft = FindingDraftPreviewSandbox.createDraft(partialCaptureDraft);
const partialAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(partialFindingDraft);
const partialRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(partialAssessmentDraft);
const partialDecisionDraft = DecisionDraftPreviewSandbox.createDraft(partialRecommendationDraft);

assert.equal(partialCaptureDraft.completion.readyForReview, false);
assert.equal(partialFindingDraft.findingPrepared, false);
assert.equal(partialAssessmentDraft.assessmentPrepared, false);
assert.equal(partialRecommendationDraft.recommendationPrepared, false);
assert.equal(partialDecisionDraft.decisionPrepared, false);
assert.equal(partialDecisionDraft.decision, null);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T16:02:00.000Z"
});

const completedFindingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const completedAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(completedFindingDraft);
const completedRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(completedAssessmentDraft);
const completedDecisionDraft = DecisionDraftPreviewSandbox.createDraft(completedRecommendationDraft);

assert.equal(completedCaptureDraft.completion.readyForReview, true);
assert.equal(completedFindingDraft.findingPrepared, true);
assert.equal(completedAssessmentDraft.assessmentPrepared, true);
assert.equal(completedRecommendationDraft.recommendationPrepared, true);
assert.equal(completedDecisionDraft.decisionPrepared, true);

assert.equal(completedDecisionDraft.sandboxOnly, true);
assert.equal(completedDecisionDraft.decision.persisted, false);
assert.equal(completedDecisionDraft.decision.previewOnly, true);
assert.equal(completedDecisionDraft.decisionRoute, "conditional_decision");

assert.equal(completedDecisionDraft.safetyBoundary.sandboxOnly, true);
assert.equal(completedDecisionDraft.safetyBoundary.decisionDraftPersisted, false);
assert.equal(completedDecisionDraft.safetyBoundary.recommendationDraftPersisted, false);
assert.equal(completedDecisionDraft.safetyBoundary.assessmentDraftPersisted, false);
assert.equal(completedDecisionDraft.safetyBoundary.findingDraftPersisted, false);
assert.equal(completedDecisionDraft.safetyBoundary.evidencePersisted, false);
assert.equal(completedDecisionDraft.safetyBoundary.decisionCreated, false);
assert.equal(completedDecisionDraft.safetyBoundary.reportCreated, false);
assert.equal(completedDecisionDraft.safetyBoundary.workflowCreated, false);

const okState = SandboxAnswerStateEngine.applyAnswer(initialState, "ok", {
    timestamp: "2026-07-09T16:03:00.000Z"
});

const okEvidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(okState);
const okCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(okEvidenceRequirement);
const okFindingDraft = FindingDraftPreviewSandbox.createDraft(okCaptureDraft);
const okAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(okFindingDraft);
const okRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(okAssessmentDraft);
const okDecisionDraft = DecisionDraftPreviewSandbox.createDraft(okRecommendationDraft);

assert.equal(okEvidenceRequirement.evidenceRequired, false);
assert.equal(okCaptureDraft.evidenceRequired, false);
assert.equal(okFindingDraft.findingPrepared, false);
assert.equal(okAssessmentDraft.assessmentPrepared, false);
assert.equal(okRecommendationDraft.recommendationPrepared, false);
assert.equal(okDecisionDraft.decisionPrepared, false);
assert.equal(okDecisionDraft.decision, null);

console.log("DecisionDraftPreviewSandbox regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Partial decision prepared: ${partialDecisionDraft.decisionPrepared}`);
console.log(`Completed decision prepared: ${completedDecisionDraft.decisionPrepared}`);
console.log(`Decision route: ${completedDecisionDraft.decisionRoute}`);
console.log(`Proposed decision: ${completedDecisionDraft.decision.proposedDecision}`);
console.log(`OK decision prepared: ${okDecisionDraft.decisionPrepared}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${completedDecisionDraft.safetyBoundary.sandboxOnly}`);
console.log(`- decisionDraftPersisted: ${completedDecisionDraft.safetyBoundary.decisionDraftPersisted}`);
console.log(`- recommendationDraftPersisted: ${completedDecisionDraft.safetyBoundary.recommendationDraftPersisted}`);
console.log(`- assessmentDraftPersisted: ${completedDecisionDraft.safetyBoundary.assessmentDraftPersisted}`);
console.log(`- findingDraftPersisted: ${completedDecisionDraft.safetyBoundary.findingDraftPersisted}`);
console.log(`- evidencePersisted: ${completedDecisionDraft.safetyBoundary.evidencePersisted}`);
console.log(`- decisionCreated: ${completedDecisionDraft.safetyBoundary.decisionCreated}`);
console.log(`- reportCreated: ${completedDecisionDraft.safetyBoundary.reportCreated}`);
console.log(`- workflowCreated: ${completedDecisionDraft.safetyBoundary.workflowCreated}`);
