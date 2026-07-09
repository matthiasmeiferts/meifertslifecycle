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
    sandboxId: "recommendation-draft-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T14:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const partialCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg"
}, {
    timestamp: "2026-07-09T14:01:00.000Z"
});

const partialFindingDraft = FindingDraftPreviewSandbox.createDraft(partialCaptureDraft);
const partialAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(partialFindingDraft);
const partialRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(partialAssessmentDraft);

assert.equal(partialCaptureDraft.completion.readyForReview, false);
assert.equal(partialFindingDraft.findingPrepared, false);
assert.equal(partialAssessmentDraft.assessmentPrepared, false);
assert.equal(partialRecommendationDraft.recommendationPrepared, false);
assert.equal(partialRecommendationDraft.recommendation, null);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T14:02:00.000Z"
});

const completedFindingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const completedAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(completedFindingDraft);
const completedRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(completedAssessmentDraft);

assert.equal(completedCaptureDraft.completion.readyForReview, true);
assert.equal(completedFindingDraft.findingPrepared, true);
assert.equal(completedAssessmentDraft.assessmentPrepared, true);
assert.equal(completedRecommendationDraft.recommendationPrepared, true);

assert.equal(completedRecommendationDraft.sandboxOnly, true);
assert.equal(completedRecommendationDraft.recommendation.persisted, false);
assert.equal(completedRecommendationDraft.recommendation.previewOnly, true);

assert.equal(completedRecommendationDraft.safetyBoundary.sandboxOnly, true);
assert.equal(completedRecommendationDraft.safetyBoundary.recommendationDraftPersisted, false);
assert.equal(completedRecommendationDraft.safetyBoundary.assessmentDraftPersisted, false);
assert.equal(completedRecommendationDraft.safetyBoundary.findingDraftPersisted, false);
assert.equal(completedRecommendationDraft.safetyBoundary.evidencePersisted, false);
assert.equal(completedRecommendationDraft.safetyBoundary.recommendationCreated, false);
assert.equal(completedRecommendationDraft.safetyBoundary.decisionCreated, false);
assert.equal(completedRecommendationDraft.safetyBoundary.reportCreated, false);
assert.equal(completedRecommendationDraft.safetyBoundary.workflowCreated, false);

const okState = SandboxAnswerStateEngine.applyAnswer(initialState, "ok", {
    timestamp: "2026-07-09T14:03:00.000Z"
});

const okEvidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(okState);
const okCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(okEvidenceRequirement);
const okFindingDraft = FindingDraftPreviewSandbox.createDraft(okCaptureDraft);
const okAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(okFindingDraft);
const okRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(okAssessmentDraft);

assert.equal(okEvidenceRequirement.evidenceRequired, false);
assert.equal(okCaptureDraft.evidenceRequired, false);
assert.equal(okFindingDraft.findingPrepared, false);
assert.equal(okAssessmentDraft.assessmentPrepared, false);
assert.equal(okRecommendationDraft.recommendationPrepared, false);
assert.equal(okRecommendationDraft.recommendation, null);

console.log("RecommendationDraftPreviewSandbox regression safety test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Partial recommendation prepared: ${partialRecommendationDraft.recommendationPrepared}`);
console.log(`Completed recommendation prepared: ${completedRecommendationDraft.recommendationPrepared}`);
console.log(`Recommendation tone: ${completedRecommendationDraft.recommendationTone}`);
console.log(`Next action: ${completedRecommendationDraft.recommendation.nextAction}`);
console.log(`OK recommendation prepared: ${okRecommendationDraft.recommendationPrepared}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${completedRecommendationDraft.safetyBoundary.sandboxOnly}`);
console.log(`- recommendationDraftPersisted: ${completedRecommendationDraft.safetyBoundary.recommendationDraftPersisted}`);
console.log(`- assessmentDraftPersisted: ${completedRecommendationDraft.safetyBoundary.assessmentDraftPersisted}`);
console.log(`- findingDraftPersisted: ${completedRecommendationDraft.safetyBoundary.findingDraftPersisted}`);
console.log(`- evidencePersisted: ${completedRecommendationDraft.safetyBoundary.evidencePersisted}`);
console.log(`- recommendationCreated: ${completedRecommendationDraft.safetyBoundary.recommendationCreated}`);
console.log(`- decisionCreated: ${completedRecommendationDraft.safetyBoundary.decisionCreated}`);
console.log(`- reportCreated: ${completedRecommendationDraft.safetyBoundary.reportCreated}`);
console.log(`- workflowCreated: ${completedRecommendationDraft.safetyBoundary.workflowCreated}`);
