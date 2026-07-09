import assert from "node:assert/strict";
import AssessmentDraftPreviewSandbox from "../portal/core/AssessmentDraftPreviewSandbox.js";

const findingDraft = {
    draftMode: "finding_draft_preview_sandbox_read_only",
    sandboxId: "assessment-draft-core-test-001",
    findingPrepared: true,
    question: {
        questionId: "Q-001",
        questionText: "Feuchte Spuren im Keller vorhanden",
        sectionTitle: "Keller Abdichtung",
        moduleTitle: "Keller & Abdichtung",
        moduleNumber: "06"
    },
    finding: {
        title: "Potential issue · Keller Abdichtung",
        category: "Keller & Abdichtung",
        sourceQuestionId: "Q-001",
        expertWording: "Observed condition related to: Feuchte Spuren im Keller vorhanden. Draft comment: Visible moisture staining.",
        evidenceReferences: [
            "Photo draft available",
            "Comment draft available",
            "Moisture note available"
        ],
        persisted: false,
        previewOnly: true
    },
    severityPreview: {
        level: "elevated",
        rationale: "Moisture or waterproofing-related signals may indicate increased building risk.",
        confidence: "preview",
        persisted: false,
        previewOnly: true
    }
};

const assessmentDraft = AssessmentDraftPreviewSandbox.createDraft(findingDraft);

assert.equal(assessmentDraft.draftMode, "assessment_draft_preview_sandbox_read_only");
assert.equal(assessmentDraft.sourceDraftMode, "finding_draft_preview_sandbox_read_only");
assert.equal(assessmentDraft.sandboxId, "assessment-draft-core-test-001");
assert.equal(assessmentDraft.canPrepareAssessment, true);
assert.equal(assessmentDraft.assessmentPrepared, true);
assert.equal(assessmentDraft.question.questionId, "Q-001");
assert.equal(assessmentDraft.finding.title, "Potential issue · Keller Abdichtung");
assert.equal(assessmentDraft.finding.evidenceReferenceCount, 3);
assert.equal(assessmentDraft.finding.persisted, false);
assert.equal(assessmentDraft.assessment.riskLevel, "elevated");
assert.ok(assessmentDraft.assessment.assessmentTitle.includes("Potential issue"));
assert.ok(assessmentDraft.assessment.technicalImplication.includes("Keller"));
assert.ok(assessmentDraft.assessment.recommendedReview.includes("Expert review"));
assert.equal(assessmentDraft.assessment.persisted, false);
assert.equal(assessmentDraft.assessment.previewOnly, true);
assert.equal(assessmentDraft.riskPreview.level, "elevated");
assert.equal(assessmentDraft.riskPreview.persisted, false);
assert.equal(assessmentDraft.reviewLogic.inputs.length, 4);
assert.equal(assessmentDraft.reviewLogic.checks.length, 4);
assert.equal(assessmentDraft.assessmentState.prepared, true);
assert.equal(assessmentDraft.assessmentState.persisted, false);
assert.equal(assessmentDraft.assessmentState.assessmentCreated, false);
assert.equal(assessmentDraft.assessmentState.recommendationCreated, false);

const notReadyDraft = {
    ...findingDraft,
    findingPrepared: false,
    finding: null
};

const notReadyAssessment = AssessmentDraftPreviewSandbox.createDraft(notReadyDraft);

assert.equal(notReadyAssessment.canPrepareAssessment, false);
assert.equal(notReadyAssessment.assessmentPrepared, false);
assert.equal(notReadyAssessment.finding, null);
assert.equal(notReadyAssessment.assessment, null);
assert.equal(notReadyAssessment.riskPreview.level, "n/a");
assert.equal(notReadyAssessment.assessmentState.prepared, false);
assert.equal(notReadyAssessment.assessmentState.assessmentCreated, false);

[
    assessmentDraft,
    notReadyAssessment
].forEach((draft) => {
    assert.equal(draft.safetyBoundary.sandboxOnly, true);
    assert.equal(draft.safetyBoundary.assessmentDraftPersisted, false);
    assert.equal(draft.safetyBoundary.findingDraftPersisted, false);
    assert.equal(draft.safetyBoundary.captureDraftPersisted, false);
    assert.equal(draft.safetyBoundary.evidencePersisted, false);
    assert.equal(draft.safetyBoundary.answerPersisted, false);
    assert.equal(draft.safetyBoundary.inspectionCreated, false);
    assert.equal(draft.safetyBoundary.evidenceCreated, false);
    assert.equal(draft.safetyBoundary.findingCreated, false);
    assert.equal(draft.safetyBoundary.assessmentCreated, false);
    assert.equal(draft.safetyBoundary.recommendationCreated, false);
    assert.equal(draft.safetyBoundary.decisionCreated, false);
    assert.equal(draft.safetyBoundary.reportCreated, false);

    assert.ok(!("assessmentId" in draft));
    assert.ok(!("assessmentIds" in draft));
    assert.ok(!("recommendationId" in draft));
    assert.ok(!("decisionId" in draft));
    assert.ok(!("reportId" in draft));
});

console.log("AssessmentDraftPreviewSandbox core test passed");
console.log(`Assessment prepared: ${assessmentDraft.assessmentPrepared}`);
console.log(`Risk level: ${assessmentDraft.riskPreview.level}`);
console.log(`Technical implication: ${assessmentDraft.assessment.technicalImplication}`);
console.log(`Not ready assessment prepared: ${notReadyAssessment.assessmentPrepared}`);
console.log("Safety boundary:");
console.log(`- assessmentDraftPersisted: ${assessmentDraft.safetyBoundary.assessmentDraftPersisted}`);
console.log(`- assessmentCreated: ${assessmentDraft.safetyBoundary.assessmentCreated}`);
console.log(`- recommendationCreated: ${assessmentDraft.safetyBoundary.recommendationCreated}`);
