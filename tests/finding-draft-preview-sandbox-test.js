import assert from "node:assert/strict";
import FindingDraftPreviewSandbox from "../portal/core/FindingDraftPreviewSandbox.js";

const captureDraft = {
    draftMode: "evidence_capture_draft_sandbox_read_only",
    sandboxId: "finding-draft-core-test-001",
    evidenceRequired: true,
    question: {
        questionId: "Q-001",
        questionText: "Feuchte Spuren im Keller vorhanden",
        sectionTitle: "Keller Abdichtung",
        moduleTitle: "Keller & Abdichtung",
        moduleNumber: "06"
    },
    answer: {
        value: "finding",
        label: "Auffällig"
    },
    fields: [
        {
            type: "photo",
            label: "Photo",
            required: true,
            value: "sandbox-photo-placeholder.jpg",
            filled: true,
            persisted: false,
            previewOnly: true
        },
        {
            type: "comment",
            label: "Comment",
            required: true,
            value: "Visible moisture staining near basement wall junction.",
            filled: true,
            persisted: false,
            previewOnly: true
        },
        {
            type: "moisture_indicator",
            label: "Moisture indicator",
            required: false,
            value: "Optional moisture note.",
            filled: true,
            persisted: false,
            previewOnly: true
        }
    ],
    completion: {
        requiredFields: 2,
        filledRequiredFields: 2,
        completionRate: 100,
        readyForReview: true,
        previewOnly: true
    }
};

const findingDraft = FindingDraftPreviewSandbox.createDraft(captureDraft);

assert.equal(findingDraft.draftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(findingDraft.sourceDraftMode, "evidence_capture_draft_sandbox_read_only");
assert.equal(findingDraft.sandboxId, "finding-draft-core-test-001");
assert.equal(findingDraft.canPrepareFinding, true);
assert.equal(findingDraft.findingPrepared, true);
assert.equal(findingDraft.question.questionId, "Q-001");
assert.equal(findingDraft.answer.value, "finding");
assert.equal(findingDraft.evidenceSummary.readyForReview, true);
assert.equal(findingDraft.evidenceSummary.completedFieldCount, 3);
assert.ok(findingDraft.finding.title.includes("Keller Abdichtung"));
assert.equal(findingDraft.finding.sourceQuestionId, "Q-001");
assert.ok(findingDraft.finding.expertWording.includes("Feuchte Spuren"));
assert.ok(findingDraft.finding.evidenceReferences.includes("Photo draft available"));
assert.ok(findingDraft.finding.evidenceReferences.includes("Comment draft available"));
assert.equal(findingDraft.finding.persisted, false);
assert.equal(findingDraft.finding.previewOnly, true);
assert.equal(findingDraft.severityPreview.level, "elevated");
assert.equal(findingDraft.severityPreview.persisted, false);
assert.equal(findingDraft.findingState.prepared, true);
assert.equal(findingDraft.findingState.persisted, false);
assert.equal(findingDraft.findingState.findingCreated, false);

const incompleteDraft = {
    ...captureDraft,
    completion: {
        requiredFields: 2,
        filledRequiredFields: 1,
        completionRate: 50,
        readyForReview: false,
        previewOnly: true
    }
};

const incompleteFindingDraft = FindingDraftPreviewSandbox.createDraft(incompleteDraft);

assert.equal(incompleteFindingDraft.canPrepareFinding, false);
assert.equal(incompleteFindingDraft.findingPrepared, false);
assert.equal(incompleteFindingDraft.finding, null);
assert.equal(incompleteFindingDraft.severityPreview.level, "n/a");
assert.equal(incompleteFindingDraft.findingState.prepared, false);

[
    findingDraft,
    incompleteFindingDraft
].forEach((draft) => {
    assert.equal(draft.safetyBoundary.sandboxOnly, true);
    assert.equal(draft.safetyBoundary.findingDraftPersisted, false);
    assert.equal(draft.safetyBoundary.captureDraftPersisted, false);
    assert.equal(draft.safetyBoundary.evidencePersisted, false);
    assert.equal(draft.safetyBoundary.answerPersisted, false);
    assert.equal(draft.safetyBoundary.inspectionCreated, false);
    assert.equal(draft.safetyBoundary.evidenceCreated, false);
    assert.equal(draft.safetyBoundary.findingCreated, false);
    assert.equal(draft.safetyBoundary.assessmentCreated, false);
    assert.equal(draft.safetyBoundary.reportCreated, false);

    assert.ok(!("findingId" in draft));
    assert.ok(!("findingIds" in draft));
    assert.ok(!("assessmentId" in draft));
    assert.ok(!("reportId" in draft));
});

console.log("FindingDraftPreviewSandbox core test passed");
console.log(`Finding prepared: ${findingDraft.findingPrepared}`);
console.log(`Finding title: ${findingDraft.finding.title}`);
console.log(`Severity preview: ${findingDraft.severityPreview.level}`);
console.log(`Incomplete finding prepared: ${incompleteFindingDraft.findingPrepared}`);
console.log("Safety boundary:");
console.log(`- findingDraftPersisted: ${findingDraft.safetyBoundary.findingDraftPersisted}`);
console.log(`- findingCreated: ${findingDraft.safetyBoundary.findingCreated}`);
console.log(`- assessmentCreated: ${findingDraft.safetyBoundary.assessmentCreated}`);
