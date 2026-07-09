import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pageSource = readFileSync("portal/ui/pages/QuestionCatalogPage.js", "utf8");
const styleSource = readFileSync("portal/ui/styles/workspace.css", "utf8");

assert.ok(
    pageSource.includes('data-expert-review-preview'),
    "Expert review preview panel must be present in browser preview."
);

assert.ok(
    pageSource.includes('static bindExpertReviewPreview'),
    "QuestionCatalogPage must bind expert review preview interactions."
);

assert.ok(
    pageSource.includes('DraftWorkspaceManager.createExpertReview'),
    "Browser preview must create an expert review from the workspace draft."
);

assert.ok(
    pageSource.includes('DraftWorkspaceManager.addExpertReviewNote'),
    "Browser preview must support adding an expert review note."
);

assert.ok(
    pageSource.includes('DraftWorkspaceManager.approveExpertReview'),
    "Browser preview must support approving an expert review."
);

assert.ok(
    pageSource.includes('DraftWorkspaceManager.rejectExpertReview'),
    "Browser preview must support rejecting an expert review."
);

assert.ok(
    pageSource.includes('if (currentReview.notes.length > 0)'),
    "Add review note button must guard against duplicate preview notes."
);

assert.ok(
    pageSource.includes('addNoteButton.disabled = true'),
    "Add review note button must disable after the controlled note is added."
);

assert.ok(
    pageSource.includes('canExport: ${String(currentReview.permissions.canExport)}'),
    "Expert review safety output must include canExport."
);

assert.ok(
    pageSource.includes('canCreateClientDocument: ${String(currentReview.permissions.canCreateClientDocument)}'),
    "Expert review safety output must include canCreateClientDocument."
);

assert.ok(
    pageSource.includes('canFinalizeWorkflow: ${String(currentReview.permissions.canFinalizeWorkflow)}'),
    "Expert review safety output must include canFinalizeWorkflow."
);

assert.ok(
    pageSource.includes('expertApprovalGranted: ${String(currentReview.safetyBoundary.expertApprovalGranted)}'),
    "Expert review safety output must include expertApprovalGranted."
);

assert.ok(
    styleSource.includes('Foundation 2.5-C Expert Review Browser Preview'),
    "Expert review browser preview styles must be present."
);

assert.ok(
    styleSource.includes('Foundation 2.5-C Expert Review Visual State Fix'),
    "Expert review visual state styles must be present."
);

assert.ok(
    styleSource.includes('.expert-review-preview.is-approved'),
    "Approved expert review state must have a visible style hook."
);

assert.ok(
    styleSource.includes('.expert-review-preview.is-rejected'),
    "Rejected expert review state must have a visible style hook."
);

console.log("Expert review browser regression safety test passed");
console.log("Panel present: true");
console.log("Single-note guard present: true");
console.log("Approve/reject actions present: true");
console.log("Safety output present: true");
console.log("Visual state hooks present: true");
