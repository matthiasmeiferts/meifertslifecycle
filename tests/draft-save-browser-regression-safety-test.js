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
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

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
    sandboxId: "draft-save-browser-regression-safety-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const okState = SandboxAnswerStateEngine.applyAnswer(initialState, "ok", {
    timestamp: "2026-07-09T23:30:00.000Z"
});

const okRequirement = EvidenceRequirementPreviewEngine.createPreview(okState);
const okCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(okRequirement);
const okFindingDraft = FindingDraftPreviewSandbox.createDraft(okCaptureDraft);
const okAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(okFindingDraft);
const okRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(okAssessmentDraft);
const okDecisionDraft = DecisionDraftPreviewSandbox.createDraft(okRecommendationDraft);
const okReportDraft = ReportDraftPreviewSandbox.createDraft(okDecisionDraft);

assert.equal(okReportDraft.reportPrepared, false);
assert.equal(okReportDraft.canPrepareReport, false);
assert.equal(okReportDraft.report, null);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T23:31:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const openCaptureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const partialFindingDraft = FindingDraftPreviewSandbox.createDraft(openCaptureDraft);
const partialAssessmentDraft = AssessmentDraftPreviewSandbox.createDraft(partialFindingDraft);
const partialRecommendationDraft = RecommendationDraftPreviewSandbox.createDraft(partialAssessmentDraft);
const partialDecisionDraft = DecisionDraftPreviewSandbox.createDraft(partialRecommendationDraft);
const partialReportDraft = ReportDraftPreviewSandbox.createDraft(partialDecisionDraft);

assert.equal(partialReportDraft.reportPrepared, false);
assert.equal(partialReportDraft.canPrepareReport, false);
assert.equal(partialReportDraft.report, null);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(openCaptureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Observed facade defect near balcony edge.",
    moisture_indicator: "Surface moisture indicator noted."
}, {
    timestamp: "2026-07-09T23:32:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);
const decisionDraft = DecisionDraftPreviewSandbox.createDraft(recommendationDraft);
const reportDraft = ReportDraftPreviewSandbox.createDraft(decisionDraft);

assert.equal(reportDraft.reportPrepared, true);
assert.equal(reportDraft.reportSection, "conditional_acquisition_note");

const registry = DraftWorkspaceManager.createRegistry({
    registryId: "draft-save-browser-regression-registry-001",
    createdAt: "2026-07-09T23:33:00.000Z"
});

const draftRecord = DraftWorkspaceManager.createDraftRecord(reportDraft, {
    createdAt: "2026-07-09T23:34:00.000Z"
});

const savedRegistry = DraftWorkspaceManager.addDraft(registry, draftRecord, {
    updatedAt: "2026-07-09T23:35:00.000Z"
});

const savedDraft = DraftWorkspaceManager.getDraftById(savedRegistry, draftRecord.draftId);

assert.equal(savedRegistry.drafts.length, 1);
assert.equal(savedDraft.draftMode, "workspace_draft_controlled");
assert.equal(savedDraft.draftType, "report_draft");
assert.equal(savedDraft.status, "draft");
assert.equal(savedDraft.sourceId, "DE-TDD-06-036");

assert.equal(savedDraft.permissions.canEdit, true);
assert.equal(savedDraft.permissions.canDiscard, true);
assert.equal(savedDraft.permissions.canRestore, true);
assert.equal(savedDraft.permissions.canExport, false);
assert.equal(savedDraft.permissions.canCreateClientDocument, false);
assert.equal(savedDraft.permissions.canFinalizeWorkflow, false);
assert.equal(savedDraft.permissions.requiresExpertApproval, true);

assert.equal(savedDraft.safetyBoundary.draftPersisted, false);
assert.equal(savedDraft.safetyBoundary.clientDocumentCreated, false);
assert.equal(savedDraft.safetyBoundary.reportExported, false);
assert.equal(savedDraft.safetyBoundary.workflowFinalized, false);
assert.equal(savedDraft.safetyBoundary.expertApprovalGranted, false);

assert.equal(savedRegistry.safetyBoundary.registryPersisted, false);
assert.equal(savedRegistry.safetyBoundary.clientDocumentCreated, false);
assert.equal(savedRegistry.safetyBoundary.reportExported, false);
assert.equal(savedRegistry.safetyBoundary.workflowFinalized, false);
assert.equal(savedRegistry.safetyBoundary.expertApprovalGranted, false);

console.log("Draft save browser regression safety test passed");
console.log(`OK report prepared: ${okReportDraft.reportPrepared}`);
console.log(`Partial report prepared: ${partialReportDraft.reportPrepared}`);
console.log(`Completed report prepared: ${reportDraft.reportPrepared}`);
console.log(`Saved draft id: ${savedDraft.draftId}`);
console.log(`Can export: ${savedDraft.permissions.canExport}`);
console.log(`Can create client document: ${savedDraft.permissions.canCreateClientDocument}`);
console.log(`Workflow finalized: ${savedDraft.safetyBoundary.workflowFinalized}`);
