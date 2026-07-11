import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";

const draft = DraftWorkspaceManager.createDraftRecord({
    reportPrepared: true,
    report: {
        executiveSummary: "Executive summary draft.",
        technicalNarrative: "Technical narrative draft.",
        decisionNote: "Decision note draft."
    },
    safetyBoundary: {
        reportDraftPersisted: true,
        reportCreated: false,
        reportExported: false,
        clientDocumentCreated: false,
        workflowCreated: false
    }
}, {
    createdAt: "2026-07-09T00:00:00.000Z"
});

const expertReview = DraftWorkspaceManager.approveExpertReview(
    DraftWorkspaceManager.addExpertReviewNote(
        DraftWorkspaceManager.createExpertReview(draft),
        {
            note: "Expert reviewed.",
            reviewer: "Matthias Meiferts"
        }
    )
);

const finalizationGate = DraftWorkspaceManager.createFinalizationGate(expertReview);

const internalReview = DraftWorkspaceManager.approveInternalFinalizationReview(
    DraftWorkspaceManager.addInternalFinalizationReviewNote(
        DraftWorkspaceManager.createInternalFinalizationReview(finalizationGate),
        {
            note: "Internal finalization reviewed.",
            reviewer: "Matthias Meiferts"
        }
    )
);

const exportPreparationGate = DraftWorkspaceManager.createExportPreparationGate(internalReview);

const exportPreparationReview = DraftWorkspaceManager.approveExportPreparationReview(
    DraftWorkspaceManager.addExportPreparationReviewNote(
        DraftWorkspaceManager.createExportPreparationReview(exportPreparationGate),
        {
            note: "Export preparation reviewed.",
            reviewer: "Matthias Meiferts"
        }
    )
);

const exportAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate(exportPreparationReview);
const readyPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(exportAuthorizationGate);
const readyAssemblyPreview = DraftWorkspaceManager.createReportExportAssemblyPreview(readyPreparationPackage);

assert.equal(readyPreparationPackage.status, "report_export_preparation_required");
assert.equal(readyPreparationPackage.safetyBoundary.exportPackagePrepared, true);
assert.equal(readyAssemblyPreview.status, "report_export_assembly_preview_required");
assert.equal(readyAssemblyPreview.assemblyPrepared, true);
assert.equal(readyAssemblyPreview.assemblySectionCount, 6);
assert.equal(readyAssemblyPreview.governance.preparationPackageStatus, "report_export_preparation_required");
assert.equal(readyAssemblyPreview.governance.requiresExportReadinessReview, true);
assert.equal(readyAssemblyPreview.governance.allowsDirectExport, false);
assert.equal(readyAssemblyPreview.permissions.canExport, false);
assert.equal(readyAssemblyPreview.permissions.canCreateClientDocument, false);
assert.equal(readyAssemblyPreview.permissions.canFinalizeWorkflow, false);
assert.equal(readyAssemblyPreview.safetyBoundary.canExport, false);
assert.equal(readyAssemblyPreview.safetyBoundary.reportExported, false);
assert.equal(readyAssemblyPreview.safetyBoundary.clientDocumentCreated, false);
assert.equal(readyAssemblyPreview.safetyBoundary.workflowFinalized, false);

const blockedAuthorizationGate = DraftWorkspaceManager.createExportAuthorizationGate({
    reviewType: "export_preparation_review",
    status: "rejected",
    decision: {
        approved: false,
        rejected: true
    }
});

const blockedPreparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(blockedAuthorizationGate);
const blockedAssemblyPreview = DraftWorkspaceManager.createReportExportAssemblyPreview(blockedPreparationPackage);

assert.equal(blockedPreparationPackage.status, "blocked_pending_export_authorization_gate");
assert.equal(blockedPreparationPackage.safetyBoundary.exportPackagePrepared, false);
assert.equal(blockedAssemblyPreview.status, "blocked_pending_report_export_preparation_package");
assert.equal(blockedAssemblyPreview.assemblyPrepared, false);
assert.equal(blockedAssemblyPreview.assemblySectionCount, 0);
assert.equal(blockedAssemblyPreview.governance.preparationPackageStatus, "blocked_pending_export_authorization_gate");
assert.equal(blockedAssemblyPreview.governance.allowsDirectExport, false);
assert.equal(blockedAssemblyPreview.permissions.canExport, false);
assert.equal(blockedAssemblyPreview.safetyBoundary.canExport, false);
assert.equal(blockedAssemblyPreview.safetyBoundary.reportExported, false);

console.log("Report export assembly preview from preparation package test passed");
console.log("Ready preparation package status:", readyPreparationPackage.status);
console.log("Ready assembly preview status:", readyAssemblyPreview.status);
console.log("Ready assembly section count:", readyAssemblyPreview.assemblySectionCount);
console.log("Blocked preparation package status:", blockedPreparationPackage.status);
console.log("Blocked assembly preview status:", blockedAssemblyPreview.status);
console.log("Can export:", readyAssemblyPreview.permissions.canExport);
console.log("Report exported:", readyAssemblyPreview.safetyBoundary.reportExported);
