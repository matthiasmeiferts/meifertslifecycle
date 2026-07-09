import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const registry = DraftWorkspaceManager.createRegistry({
    registryId: "inspection-draft-registry-restore-001",
    createdAt: "2026-07-09T22:00:00.000Z"
});

const originalReportDraft = DraftWorkspaceManager.createDraftRecord({
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036"
    },
    decision: {
        route: "conditional_decision"
    },
    report: {
        title: "Report draft · original",
        executiveSummary: "Original executive summary.",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-09T22:01:00.000Z"
});

const withOriginal = DraftWorkspaceManager.addDraft(registry, originalReportDraft, {
    updatedAt: "2026-07-09T22:02:00.000Z"
});

const restoredOriginal = DraftWorkspaceManager.getDraftById(withOriginal, originalReportDraft.draftId);

assert.equal(restoredOriginal.payload.report.title, "Report draft · original");
assert.equal(restoredOriginal.payload.report.exported, false);
assert.equal(restoredOriginal.permissions.canExport, false);
assert.equal(restoredOriginal.permissions.canCreateClientDocument, false);
assert.equal(restoredOriginal.permissions.canFinalizeWorkflow, false);

const updatedReportDraft = DraftWorkspaceManager.createDraftRecord({
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036"
    },
    decision: {
        route: "conditional_decision"
    },
    report: {
        title: "Report draft · updated",
        executiveSummary: "Updated executive summary after expert edit.",
        previewOnly: true,
        persisted: false,
        exported: false
    }
}, {
    createdAt: "2026-07-09T22:03:00.000Z",
    updatedAt: "2026-07-09T22:04:00.000Z"
});

const replacedRegistry = DraftWorkspaceManager.replaceDraft(
    withOriginal,
    originalReportDraft.draftId,
    updatedReportDraft,
    {
        updatedAt: "2026-07-09T22:05:00.000Z"
    }
);

const replacedDraft = DraftWorkspaceManager.getDraftById(replacedRegistry, originalReportDraft.draftId);

assert.equal(replacedRegistry.drafts.length, 1);
assert.equal(replacedDraft.draftId, originalReportDraft.draftId);
assert.equal(replacedDraft.payload.report.title, "Report draft · updated");
assert.equal(replacedDraft.payload.report.executiveSummary, "Updated executive summary after expert edit.");
assert.equal(replacedDraft.payload.report.previewOnly, true);
assert.equal(replacedDraft.payload.report.persisted, false);
assert.equal(replacedDraft.payload.report.exported, false);

const discardedRegistry = DraftWorkspaceManager.discardDraft(replacedRegistry, originalReportDraft.draftId, {
    updatedAt: "2026-07-09T22:06:00.000Z"
});

const discardedDraft = DraftWorkspaceManager.getDraftById(discardedRegistry, originalReportDraft.draftId);

assert.equal(discardedDraft.status, "discarded");

const restoredRegistry = DraftWorkspaceManager.restoreDraft(discardedRegistry, originalReportDraft.draftId, {
    updatedAt: "2026-07-09T22:07:00.000Z"
});

const restoredDraft = DraftWorkspaceManager.getDraftById(restoredRegistry, originalReportDraft.draftId);

assert.equal(restoredDraft.status, "draft");
assert.equal(restoredDraft.payload.report.title, "Report draft · updated");
assert.equal(restoredDraft.permissions.canEdit, true);
assert.equal(restoredDraft.permissions.canRestore, true);
assert.equal(restoredDraft.permissions.canExport, false);
assert.equal(restoredDraft.permissions.canCreateClientDocument, false);
assert.equal(restoredDraft.permissions.canFinalizeWorkflow, false);
assert.equal(restoredDraft.permissions.requiresExpertApproval, true);

assert.equal(restoredDraft.safetyBoundary.draftPersisted, false);
assert.equal(restoredDraft.safetyBoundary.clientDocumentCreated, false);
assert.equal(restoredDraft.safetyBoundary.reportExported, false);
assert.equal(restoredDraft.safetyBoundary.workflowFinalized, false);
assert.equal(restoredDraft.safetyBoundary.expertApprovalGranted, false);

assert.equal(restoredRegistry.safetyBoundary.registryPersisted, false);
assert.equal(restoredRegistry.safetyBoundary.clientDocumentCreated, false);
assert.equal(restoredRegistry.safetyBoundary.reportExported, false);
assert.equal(restoredRegistry.safetyBoundary.workflowFinalized, false);
assert.equal(restoredRegistry.safetyBoundary.expertApprovalGranted, false);

console.log("DraftWorkspaceManager restore replace safety test passed");
console.log(`Draft id: ${restoredDraft.draftId}`);
console.log(`Draft status: ${restoredDraft.status}`);
console.log(`Report title: ${restoredDraft.payload.report.title}`);
console.log(`Can export: ${restoredDraft.permissions.canExport}`);
console.log(`Can create client document: ${restoredDraft.permissions.canCreateClientDocument}`);
console.log(`Workflow finalized: ${restoredDraft.safetyBoundary.workflowFinalized}`);
