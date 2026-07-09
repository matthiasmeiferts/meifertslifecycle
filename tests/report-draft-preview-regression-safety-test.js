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
import ReportDraftPreviewSandbox from "../portal/core/ReportDraftPreviewSandbox.js";

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
    sandboxId: "report-draft-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T18:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const openCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const partialFinding = FindingDraftPreviewSandbox.createDraft(openCaptureDraft);
const partialAssessment = AssessmentDraftPreviewSandbox.createDraft(partialFinding);
const partialRecommendation = RecommendationDraftPreviewSandbox.createDraft(partialAssessment);
const partialDecision = DecisionDraftPreviewSandbox.createDraft(partialRecommendation);
const partialReport = ReportDraftPreviewSandbox.createDraft(partialDecision);

assert.equal(openCaptureDraft.completion.readyForReview, false);
assert.equal(partialFinding.findingPrepared, false);
assert.equal(partialAssessment.assessmentPrepared, false);
assert.equal(partialRecommendation.recommendationPrepared, false);
assert.equal(partialDecision.decisionPrepared, false);
assert.equal(partialReport.reportPrepared, false);
assert.equal(partialReport.canPrepareReport, false);
assert.equal(partialReport.report, null);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(openCaptureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Observed facade defect near balcony edge.",
    moisture_indicator: "Surface moisture indicator noted."
}, {
    timestamp: "2026-07-09T18:01:00.000Z"
});

const completedFinding = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const completedAssessment = AssessmentDraftPreviewSandbox.createDraft(completedFinding);
const completedRecommendation = RecommendationDraftPreviewSandbox.createDraft(completedAssessment);
const completedDecision = DecisionDraftPreviewSandbox.createDraft(completedRecommendation);
const completedReport = ReportDraftPreviewSandbox.createDraft(completedDecision);

assert.equal(completedCaptureDraft.completion.readyForReview, true);
assert.equal(completedFinding.findingPrepared, true);
assert.equal(completedAssessment.assessmentPrepared, true);
assert.equal(completedRecommendation.recommendationPrepared, true);
assert.equal(completedDecision.decisionPrepared, true);
assert.equal(completedReport.reportPrepared, true);
assert.equal(completedReport.canPrepareReport, true);
assert.equal(completedReport.report.previewOnly, true);
assert.equal(completedReport.report.persisted, false);
assert.equal(completedReport.report.exported, false);

const okDecisionDraft = {
    draftMode: "decision_draft_preview_sandbox_read_only",
    decisionPrepared: false,
    decision: null,
    sourceQuestion: {
        questionId: "DE-TDD-06-999",
        text: "No issue observed."
    },
    safetyBoundary: {
        decisionDraftPersisted: false,
        recommendationDraftPersisted: false,
        assessmentDraftPersisted: false,
        findingDraftPersisted: false,
        evidencePersisted: false,
        decisionCreated: false,
        reportCreated: false,
        workflowCreated: false
    }
};

const okReport = ReportDraftPreviewSandbox.createDraft(okDecisionDraft);

assert.equal(okReport.reportPrepared, false);
assert.equal(okReport.canPrepareReport, false);
assert.equal(okReport.report, null);

for (const reportDraft of [partialReport, completedReport, okReport]) {
    assert.equal(reportDraft.sandboxOnly, true);
    assert.equal(reportDraft.safetyBoundary.reportDraftPersisted, false);
    assert.equal(reportDraft.safetyBoundary.decisionDraftPersisted, false);
    assert.equal(reportDraft.safetyBoundary.recommendationDraftPersisted, false);
    assert.equal(reportDraft.safetyBoundary.assessmentDraftPersisted, false);
    assert.equal(reportDraft.safetyBoundary.findingDraftPersisted, false);
    assert.equal(reportDraft.safetyBoundary.evidencePersisted, false);
    assert.equal(reportDraft.safetyBoundary.reportCreated, false);
    assert.equal(reportDraft.safetyBoundary.reportExported, false);
    assert.equal(reportDraft.safetyBoundary.clientDocumentCreated, false);
    assert.equal(reportDraft.safetyBoundary.workflowCreated, false);
}

console.log("ReportDraftPreviewSandbox regression safety test passed");
console.log(`Partial report prepared: ${partialReport.reportPrepared}`);
console.log(`Completed report prepared: ${completedReport.reportPrepared}`);
console.log(`OK report prepared: ${okReport.reportPrepared}`);
console.log("Safety boundary:");
console.log(`- reportDraftPersisted: ${completedReport.safetyBoundary.reportDraftPersisted}`);
console.log(`- reportCreated: ${completedReport.safetyBoundary.reportCreated}`);
console.log(`- reportExported: ${completedReport.safetyBoundary.reportExported}`);
console.log(`- clientDocumentCreated: ${completedReport.safetyBoundary.clientDocumentCreated}`);
console.log(`- workflowCreated: ${completedReport.safetyBoundary.workflowCreated}`);
