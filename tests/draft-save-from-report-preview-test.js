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
    sandboxId: "draft-save-from-report-preview-001"
});

const initialState = SandboxAnswerStateEngine.createInitialState(sandbox);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(initialState, "finding", {
    timestamp: "2026-07-09T23:00:00.000Z"
});

const evidenceRequirement = EvidenceRequirementPreviewEngine.createPreview(afterFinding);
const captureDraft = EvidenceCaptureDraftSandbox.createDraft(evidenceRequirement);

const completedCaptureDraft = EvidenceCaptureDraftSandbox.updateDraft(captureDraft, {
    photo: "sandbox-photo-placeholder.jpg",
    comment: "Observed facade defect near balcony edge.",
    moisture_indicator: "Surface moisture indicator noted."
}, {
    timestamp: "2026-07-09T23:01:00.000Z"
});

const findingDraft = FindingDraftPreviewSandbox.createDraft(completedCaptureDraft);
const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);
const recommendationDraft = RecommendationDraftPreviewSandbox.createDraft(assessmentDraft);
const decisionDraft = DecisionDraftPreviewSandbox.createDraft(recommendationDraft);
const reportPreviewDraft = ReportDraftPreviewSandbox.createDraft(decisionDraft);

assert.equal(reportPreviewDraft.reportPrepared, true);
assert.equal(reportPreviewDraft.reportSection, "conditional_acquisition_note");
assert.equal(reportPreviewDraft.report.previewOnly, true);
assert.equal(reportPreviewDraft.report.persisted, false);
assert.equal(reportPreviewDraft.report.exported, false);

const draftRecord = DraftWorkspaceManager.createDraftRecord(reportPreviewDraft, {
    createdAt: "2026-07-09T23:02:00.000Z"
});

assert.equal(draftRecord.draftMode, "workspace_draft_controlled");
assert.equal(draftRecord.draftType, "report_draft");
assert.equal(draftRecord.sourceId, "DE-TDD-06-036");
assert.equal(draftRecord.payload.reportPrepared, true);
assert.equal(draftRecord.payload.reportSection, "conditional_acquisition_note");
assert.equal(draftRecord.payload.report.previewOnly, true);
assert.equal(draftRecord.payload.report.persisted, false);
assert.equal(draftRecord.payload.report.exported, false);

assert.equal(draftRecord.permissions.canEdit, true);
assert.equal(draftRecord.permissions.canRestore, true);
assert.equal(draftRecord.permissions.canExport, false);
assert.equal(draftRecord.permissions.canCreateClientDocument, false);
assert.equal(draftRecord.permissions.canFinalizeWorkflow, false);
assert.equal(draftRecord.permissions.requiresExpertApproval, true);

const registry = DraftWorkspaceManager.createRegistry({
    registryId: "inspection-draft-registry-save-from-preview-001",
    createdAt: "2026-07-09T23:03:00.000Z"
});

const savedRegistry = DraftWorkspaceManager.addDraft(registry, draftRecord, {
    updatedAt: "2026-07-09T23:04:00.000Z"
});

const savedDraft = DraftWorkspaceManager.getDraftById(savedRegistry, draftRecord.draftId);

assert.equal(savedRegistry.drafts.length, 1);
assert.equal(savedDraft.draftId, "report_draft-de-tdd-06-036");
assert.equal(savedDraft.status, "draft");
assert.equal(savedDraft.payload.reportSection, "conditional_acquisition_note");
assert.equal(savedDraft.payload.decision.route, "conditional_decision");

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

console.log("Draft save from report preview test passed");
console.log(`Source question: ${savedDraft.sourceId}`);
console.log(`Draft id: ${savedDraft.draftId}`);
console.log(`Draft type: ${savedDraft.draftType}`);
console.log(`Report section: ${savedDraft.payload.reportSection}`);
console.log(`Can export: ${savedDraft.permissions.canExport}`);
console.log(`Can create client document: ${savedDraft.permissions.canCreateClientDocument}`);
console.log(`Workflow finalized: ${savedDraft.safetyBoundary.workflowFinalized}`);
