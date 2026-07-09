import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const reportPreviewDraft = {
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036",
        text: "Are visible moisture traces, cracking or facade defects present?"
    },
    decision: {
        route: "conditional_decision"
    },
    report: {
        title: "Report draft · DE-TDD-06-036",
        previewOnly: true,
        persisted: false,
        exported: false
    }
};

const reportDraftRecord = DraftWorkspaceManager.createDraftRecord(reportPreviewDraft, {
    createdAt: "2026-07-09T20:00:00.000Z"
});

assert.equal(reportDraftRecord.draftMode, "workspace_draft_controlled");
assert.equal(reportDraftRecord.draftType, "report_draft");
assert.equal(reportDraftRecord.draftId, "report_draft-de-tdd-06-036");
assert.equal(reportDraftRecord.sourceId, "DE-TDD-06-036");
assert.equal(reportDraftRecord.status, "draft");
assert.equal(reportDraftRecord.expertReviewStatus, "not_reviewed");

assert.equal(reportDraftRecord.payload.reportPrepared, true);
assert.equal(reportDraftRecord.payload.reportSection, "conditional_acquisition_note");
assert.equal(reportDraftRecord.payload.report.previewOnly, true);
assert.equal(reportDraftRecord.payload.report.persisted, false);
assert.equal(reportDraftRecord.payload.report.exported, false);

assert.equal(reportDraftRecord.permissions.canEdit, true);
assert.equal(reportDraftRecord.permissions.canDiscard, true);
assert.equal(reportDraftRecord.permissions.canRestore, true);
assert.equal(reportDraftRecord.permissions.canExport, false);
assert.equal(reportDraftRecord.permissions.canCreateClientDocument, false);
assert.equal(reportDraftRecord.permissions.canFinalizeWorkflow, false);
assert.equal(reportDraftRecord.permissions.requiresExpertApproval, true);

assert.equal(reportDraftRecord.safetyBoundary.draftPersisted, false);
assert.equal(reportDraftRecord.safetyBoundary.clientDocumentCreated, false);
assert.equal(reportDraftRecord.safetyBoundary.reportExported, false);
assert.equal(reportDraftRecord.safetyBoundary.workflowFinalized, false);
assert.equal(reportDraftRecord.safetyBoundary.expertApprovalGranted, false);

const decisionDraftRecord = DraftWorkspaceManager.createDraftRecord({
    draftMode: "decision_draft_preview_sandbox_read_only",
    decisionPrepared: true,
    decisionRoute: "conditional_decision",
    sourceQuestion: {
        questionId: "DE-TDD-06-036"
    },
    decision: {
        route: "conditional_decision"
    }
});

assert.equal(decisionDraftRecord.draftType, "decision_draft");
assert.equal(decisionDraftRecord.payload.decisionPrepared, true);
assert.equal(decisionDraftRecord.payload.decisionRoute, "conditional_decision");
assert.equal(decisionDraftRecord.permissions.canExport, false);

const unknownDraftRecord = DraftWorkspaceManager.createDraftRecord({
    draftMode: "unknown_mode",
    sourceQuestion: {
        questionId: "UNKNOWN-001"
    }
});

assert.equal(unknownDraftRecord.draftType, "unknown_draft");
assert.equal(unknownDraftRecord.payload.raw.draftMode, "unknown_mode");
assert.equal(unknownDraftRecord.permissions.canFinalizeWorkflow, false);

console.log("DraftWorkspaceManager test passed");
console.log(`Report draft id: ${reportDraftRecord.draftId}`);
console.log(`Report draft type: ${reportDraftRecord.draftType}`);
console.log(`Can export: ${reportDraftRecord.permissions.canExport}`);
console.log(`Can create client document: ${reportDraftRecord.permissions.canCreateClientDocument}`);
console.log(`Workflow finalized: ${reportDraftRecord.safetyBoundary.workflowFinalized}`);
