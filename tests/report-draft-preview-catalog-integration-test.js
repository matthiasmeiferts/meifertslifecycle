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
    sandboxId: "report-draft-catalog-integration-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T17:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Sandbox comment for observed issue.",
    moisture_indicator: "Optional moisture note."
}, {
    timestamp: "2026-07-09T17:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);
const decisionDraft = DecisionDraftPreviewSandbox.createDraft(recommendationDraft);
const reportDraft = ReportDraftPreviewSandbox.createDraft(decisionDraft);

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
assert.equal(decisionDraft.decisionPrepared, true);

assert.equal(reportDraft.draftMode, "report_draft_preview_sandbox_read_only");
assert.equal(reportDraft.sourceDraftMode, "decision_draft_preview_sandbox_read_only");
assert.equal(reportDraft.canPrepareReport, true);
assert.equal(reportDraft.reportPrepared, true);

assert.equal(reportDraft.question.questionId, "DE-TDD-06-036");
assert.equal(reportDraft.decision.route, "conditional_decision");
assert.equal(reportDraft.reportSection, "conditional_acquisition_note");

assert.ok(reportDraft.report.title);
assert.ok(reportDraft.report.executiveSummary);
assert.ok(reportDraft.report.technicalNarrative);
assert.ok(reportDraft.report.decisionNote);
assert.equal(reportDraft.report.persisted, false);
assert.equal(reportDraft.report.previewOnly, true);
assert.equal(reportDraft.report.exported, false);

assert.equal(reportDraft.reportQuality.readyForExpertReview, true);
assert.equal(reportDraft.reportQuality.requiresSourceEvidence, true);
assert.equal(reportDraft.reportQuality.requiresCapexReference, true);
assert.equal(reportDraft.reportQuality.requiresDecisionNote, true);

assert.equal(reportDraft.safetyBoundary.reportDraftPersisted, false);
assert.equal(reportDraft.safetyBoundary.reportCreated, false);
assert.equal(reportDraft.safetyBoundary.reportExported, false);
assert.equal(reportDraft.safetyBoundary.clientDocumentCreated, false);
assert.equal(reportDraft.safetyBoundary.workflowCreated, false);

console.log("ReportDraftPreviewSandbox catalog integration test passed");
console.log(`Catalog items: ${catalogItems.length}`);
console.log(`Report question: ${reportDraft.question.questionId}`);
console.log(`Report prepared: ${reportDraft.reportPrepared}`);
console.log(`Report section: ${reportDraft.reportSection}`);
console.log(`Executive summary: ${reportDraft.report.executiveSummary}`);
console.log(`Decision note: ${reportDraft.report.decisionNote}`);
console.log("Safety boundary:");
console.log(`- reportDraftPersisted: ${reportDraft.safetyBoundary.reportDraftPersisted}`);
console.log(`- reportCreated: ${reportDraft.safetyBoundary.reportCreated}`);
console.log(`- reportExported: ${reportDraft.safetyBoundary.reportExported}`);
console.log(`- clientDocumentCreated: ${reportDraft.safetyBoundary.clientDocumentCreated}`);
console.log(`- workflowCreated: ${reportDraft.safetyBoundary.workflowCreated}`);
