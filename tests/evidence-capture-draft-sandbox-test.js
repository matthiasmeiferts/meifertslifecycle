import assert from "node:assert/strict";
import EvidenceCaptureDraftSandbox from "../portal/core/EvidenceCaptureDraftSandbox.js";

const evidencePreview = {
    previewMode: "evidence_requirement_preview_read_only",
    sandboxId: "capture-draft-core-test-001",
    evidenceRequired: true,
    answerValue: "finding",
    answerLabel: "Auffällig",
    question: {
        questionId: "Q-001",
        questionText: "Feuchte Spuren im Keller vorhanden",
        sectionTitle: "Keller Abdichtung",
        moduleTitle: "Keller & Abdichtung",
        moduleNumber: "06"
    },
    requiredInputs: [
        {
            type: "photo",
            label: "Photo",
            required: true,
            description: "Capture visible condition."
        },
        {
            type: "comment",
            label: "Comment",
            required: true,
            description: "Describe the observed issue."
        },
        {
            type: "moisture_indicator",
            label: "Moisture indicator",
            required: false,
            description: "Optional moisture note."
        }
    ]
};

const draft = EvidenceCaptureDraftSandbox.createDraft(evidencePreview);

assert.equal(draft.draftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(draft.sourcePreviewMode, "evidence_requirement_preview_read_only");
assert.equal(draft.sandboxId, "capture-draft-core-test-001");
assert.equal(draft.evidenceRequired, true);
assert.equal(draft.question.questionId, "Q-001");
assert.equal(draft.answer.value, "finding");
assert.equal(draft.answer.label, "Auffällig");
assert.equal(draft.fields.length, 3);
assert.equal(draft.fields.filter(field => field.required).length, 2);
assert.ok(draft.fields.some(field => field.type === "photo"));
assert.ok(draft.fields.some(field => field.type === "comment"));
assert.ok(draft.fields.some(field => field.type === "moisture_indicator"));
assert.equal(draft.completion.requiredFields, 2);
assert.equal(draft.completion.filledRequiredFields, 0);
assert.equal(draft.completion.completionRate, 0);
assert.equal(draft.completion.readyForReview, false);
assert.equal(draft.captureState.prepared, true);
assert.equal(draft.captureState.persisted, false);
assert.equal(draft.captureState.evidenceCreated, false);
assert.equal(draft.captureState.findingCreated, false);

const updatedDraft = EvidenceCaptureDraftSandbox.updateDraft(draft, {
    photo: "photo-placeholder-001.jpg",
    comment: "Visible moisture staining near basement wall junction."
}, {
    timestamp: "2026-07-08T16:00:00.000Z"
});

assert.equal(updatedDraft.fields.find(field => field.type === "photo").filled, true);
assert.equal(updatedDraft.fields.find(field => field.type === "comment").filled, true);
assert.equal(updatedDraft.fields.find(field => field.type === "moisture_indicator").filled, false);
assert.equal(updatedDraft.completion.filledRequiredFields, 2);
assert.equal(updatedDraft.completion.missingRequiredFields, 0);
assert.equal(updatedDraft.completion.completionRate, 100);
assert.equal(updatedDraft.completion.readyForReview, true);
assert.equal(updatedDraft.captureState.persisted, false);
assert.equal(updatedDraft.captureState.evidenceCreated, false);
assert.equal(updatedDraft.captureState.findingCreated, false);

const noEvidenceDraft = EvidenceCaptureDraftSandbox.createDraft({
    previewMode: "evidence_requirement_preview_read_only",
    evidenceRequired: false,
    answerValue: "ok",
    answerLabel: "OK",
    requiredInputs: []
});

assert.equal(noEvidenceDraft.evidenceRequired, false);
assert.equal(noEvidenceDraft.fields.length, 0);
assert.equal(noEvidenceDraft.captureState.prepared, false);
assert.equal(noEvidenceDraft.completion.readyForReview, false);

[
    draft,
    updatedDraft,
    noEvidenceDraft
].forEach((item) => {
    assert.equal(item.safetyBoundary.sandboxOnly, true);
    assert.equal(item.safetyBoundary.captureDraftPersisted, false);
    assert.equal(item.safetyBoundary.evidencePersisted, false);
    assert.equal(item.safetyBoundary.answerPersisted, false);
    assert.equal(item.safetyBoundary.inspectionCreated, false);
    assert.equal(item.safetyBoundary.evidenceCreated, false);
    assert.equal(item.safetyBoundary.findingCreated, false);
    assert.equal(item.safetyBoundary.assessmentCreated, false);
    assert.equal(item.safetyBoundary.reportCreated, false);

    assert.ok(!("captureDraftId" in item));
    assert.ok(!("evidenceId" in item));
    assert.ok(!("findingId" in item));
});

console.log("EvidenceCaptureDraftSandbox core test passed");
console.log(`Draft fields: ${draft.fields.map(field => field.type).join(", ")}`);
console.log(`Initial completion: ${draft.completion.completionRate}%`);
console.log(`Updated completion: ${updatedDraft.completion.completionRate}%`);
console.log(`Ready for review: ${updatedDraft.completion.readyForReview}`);
console.log("Safety boundary:");
console.log(`- captureDraftPersisted: ${updatedDraft.safetyBoundary.captureDraftPersisted}`);
console.log(`- evidenceCreated: ${updatedDraft.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${updatedDraft.safetyBoundary.findingCreated}`);
