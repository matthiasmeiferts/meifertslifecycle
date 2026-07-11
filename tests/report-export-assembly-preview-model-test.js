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

const preparationPackage = DraftWorkspaceManager.createReportExportPreparationPackage(exportAuthorizationGate);

const assemblyPreview = DraftWorkspaceManager.createReportExportAssemblyPreview(preparationPackage, {
    createdAt: "2026-07-09T01:00:00.000Z",
    createdBy: "Foundation 3.2-A test"
});

assert.equal(assemblyPreview.assemblyType, "report_export_assembly_preview");
assert.equal(assemblyPreview.status, "report_export_assembly_preview_required");
assert.equal(assemblyPreview.assemblyPrepared, true);
assert.equal(assemblyPreview.assemblySectionCount, 6);
assert.equal(assemblyPreview.assemblySections.length, 6);
assert.equal(assemblyPreview.governance.requiresExportReadinessReview, true);
assert.equal(assemblyPreview.governance.allowsDirectExport, false);

assert.equal(assemblyPreview.permissions.canExport, false);
assert.equal(assemblyPreview.permissions.canCreateClientDocument, false);
assert.equal(assemblyPreview.permissions.canFinalizeWorkflow, false);

assert.equal(assemblyPreview.safetyBoundary.assemblyPrepared, true);
assert.equal(assemblyPreview.safetyBoundary.canExport, false);
assert.equal(assemblyPreview.safetyBoundary.canCreateClientDocument, false);
assert.equal(assemblyPreview.safetyBoundary.canFinalizeWorkflow, false);
assert.equal(assemblyPreview.safetyBoundary.exportFileCreated, false);
assert.equal(assemblyPreview.safetyBoundary.reportExported, false);
assert.equal(assemblyPreview.safetyBoundary.clientDocumentCreated, false);
assert.equal(assemblyPreview.safetyBoundary.workflowFinalized, false);

const blockedAssemblyPreview = DraftWorkspaceManager.createReportExportAssemblyPreview({
    packageType: "report_export_preparation_package",
    status: "blocked_pending_export_authorization_gate",
    safetyBoundary: {
        exportPackagePrepared: false
    }
});

assert.equal(blockedAssemblyPreview.status, "blocked_pending_report_export_preparation_package");
assert.equal(blockedAssemblyPreview.assemblyPrepared, false);
assert.equal(blockedAssemblyPreview.assemblySectionCount, 0);
assert.equal(blockedAssemblyPreview.safetyBoundary.canExport, false);
assert.equal(blockedAssemblyPreview.safetyBoundary.reportExported, false);

console.log("Report export assembly preview model test passed");
console.log("Ready assembly preview status:", assemblyPreview.status);
console.log("Assembly section count:", assemblyPreview.assemblySectionCount);
console.log("Blocked assembly preview status:", blockedAssemblyPreview.status);
console.log("Can export:", assemblyPreview.permissions.canExport);
console.log("Report exported:", assemblyPreview.safetyBoundary.reportExported);
