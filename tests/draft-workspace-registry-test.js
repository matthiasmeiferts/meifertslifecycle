import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const registry = DraftWorkspaceManager.createRegistry({
    registryId: "inspection-draft-registry-001",
    createdAt: "2026-07-09T21:00:00.000Z"
});

assert.equal(registry.registryMode, "workspace_draft_registry_controlled");
assert.equal(registry.registryId, "inspection-draft-registry-001");
assert.equal(registry.drafts.length, 0);
assert.equal(registry.safetyBoundary.registryPersisted, false);
assert.equal(registry.safetyBoundary.clientDocumentCreated, false);
assert.equal(registry.safetyBoundary.reportExported, false);
assert.equal(registry.safetyBoundary.workflowFinalized, false);
assert.equal(registry.safetyBoundary.expertApprovalGranted, false);

const reportDraft = DraftWorkspaceManager.createDraftRecord({
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036"
    },
    report: {
        title: "Report draft · DE-TDD-06-036",
        previewOnly: true,
        persisted: false,
        exported: false
    },
    decision: {
        route: "conditional_decision"
    }
}, {
    createdAt: "2026-07-09T21:01:00.000Z"
});

const decisionDraft = DraftWorkspaceManager.createDraftRecord({
    draftMode: "decision_draft_preview_sandbox_read_only",
    decisionPrepared: true,
    decisionRoute: "conditional_decision",
    sourceQuestion: {
        questionId: "DE-TDD-06-036"
    },
    decision: {
        route: "conditional_decision"
    }
}, {
    createdAt: "2026-07-09T21:02:00.000Z"
});

const withReport = DraftWorkspaceManager.addDraft(registry, reportDraft, {
    updatedAt: "2026-07-09T21:03:00.000Z"
});

assert.equal(withReport.drafts.length, 1);
assert.equal(withReport.drafts[0].draftType, "report_draft");

const withDecision = DraftWorkspaceManager.addDraft(withReport, decisionDraft, {
    updatedAt: "2026-07-09T21:04:00.000Z"
});

assert.equal(withDecision.drafts.length, 2);

const foundReport = DraftWorkspaceManager.getDraftById(withDecision, reportDraft.draftId);

assert.equal(foundReport.draftId, "report_draft-de-tdd-06-036");
assert.equal(foundReport.draftType, "report_draft");
assert.equal(foundReport.permissions.canExport, false);

const reportDrafts = DraftWorkspaceManager.listDrafts(withDecision, {
    draftType: "report_draft"
});

assert.equal(reportDrafts.length, 1);
assert.equal(reportDrafts[0].draftId, reportDraft.draftId);

const sourceDrafts = DraftWorkspaceManager.listDrafts(withDecision, {
    sourceId: "DE-TDD-06-036"
});

assert.equal(sourceDrafts.length, 2);

const discardedRegistry = DraftWorkspaceManager.discardDraft(withDecision, reportDraft.draftId, {
    updatedAt: "2026-07-09T21:05:00.000Z"
});

const discardedReport = DraftWorkspaceManager.getDraftById(discardedRegistry, reportDraft.draftId);

assert.equal(discardedReport.status, "discarded");

const activeAfterDiscard = DraftWorkspaceManager.listDrafts(discardedRegistry, {
    status: "draft"
});

assert.equal(activeAfterDiscard.length, 1);

const restoredRegistry = DraftWorkspaceManager.restoreDraft(discardedRegistry, reportDraft.draftId, {
    updatedAt: "2026-07-09T21:06:00.000Z"
});

const restoredReport = DraftWorkspaceManager.getDraftById(restoredRegistry, reportDraft.draftId);

assert.equal(restoredReport.status, "draft");

const activeAfterRestore = DraftWorkspaceManager.listDrafts(restoredRegistry, {
    status: "draft"
});

assert.equal(activeAfterRestore.length, 2);

assert.equal(restoredRegistry.safetyBoundary.registryPersisted, false);
assert.equal(restoredRegistry.safetyBoundary.clientDocumentCreated, false);
assert.equal(restoredRegistry.safetyBoundary.reportExported, false);
assert.equal(restoredRegistry.safetyBoundary.workflowFinalized, false);
assert.equal(restoredRegistry.safetyBoundary.expertApprovalGranted, false);

console.log("DraftWorkspaceManager registry test passed");
console.log(`Registry id: ${restoredRegistry.registryId}`);
console.log(`Draft count: ${restoredRegistry.drafts.length}`);
console.log(`Report draft status: ${restoredReport.status}`);
console.log(`Active drafts: ${activeAfterRestore.length}`);
console.log(`Can export report: ${restoredReport.permissions.canExport}`);
console.log(`Workflow finalized: ${restoredRegistry.safetyBoundary.workflowFinalized}`);
