import assert from "node:assert/strict";
import EvidenceRequirementPreviewEngine from "../portal/core/EvidenceRequirementPreviewEngine.js";

const answerState = {
    stateMode: "sandbox_answer_state_read_only",
    sandboxId: "evidence-preview-core-test-001",
    questions: [
        {
            questionId: "Q-001",
            questionText: "Feuchte Spuren im Keller vorhanden",
            sectionTitle: "Keller Abdichtung",
            moduleTitle: "Keller & Abdichtung",
            moduleNumber: "06",
            evidenceRequiredIfFinding: true
        }
    ],
    lastInteraction: {
        selectedAnswer: {
            value: "finding",
            label: "Auffällig"
        },
        questionId: "Q-001",
        questionText: "Feuchte Spuren im Keller vorhanden"
    },
    currentQuestion: {
        questionId: "Q-002",
        questionText: "Next question"
    }
};

const preview = EvidenceRequirementPreviewEngine.createPreview(answerState);

assert.equal(preview.previewMode, "evidence_requirement_preview_read_only");
assert.equal(preview.sourceStateMode, "sandbox_answer_state_read_only");
assert.equal(preview.sandboxId, "evidence-preview-core-test-001");
assert.equal(preview.answerValue, "finding");
assert.equal(preview.answerLabel, "Auffällig");
assert.equal(preview.question.questionId, "Q-001");
assert.equal(preview.evidenceRequired, true);
assert.equal(preview.nextStep, "Prepare evidence capture");
assert.equal(preview.captureState.prepared, true);
assert.equal(preview.captureState.persisted, false);
assert.equal(preview.captureState.previewOnly, true);
assert.equal(preview.captureState.evidenceCreated, false);
assert.equal(preview.captureState.findingCreated, false);
assert.ok(preview.requiredInputs.some(input => input.type === "photo"));
assert.ok(preview.requiredInputs.some(input => input.type === "comment"));
assert.ok(preview.requiredInputs.some(input => input.type === "moisture_indicator"));

const okState = {
    ...answerState,
    lastInteraction: {
        selectedAnswer: {
            value: "ok",
            label: "OK"
        },
        questionId: "Q-001"
    }
};

const okPreview = EvidenceRequirementPreviewEngine.createPreview(okState);

assert.equal(okPreview.answerValue, "ok");
assert.equal(okPreview.evidenceRequired, false);
assert.equal(okPreview.requiredInputs.length, 0);
assert.equal(okPreview.nextStep, "Continue to next question");
assert.equal(okPreview.captureState.prepared, false);
assert.equal(okPreview.captureState.evidenceCreated, false);

const laterState = {
    ...answerState,
    lastInteraction: {
        selectedAnswer: {
            value: "later",
            label: "Später"
        },
        questionId: "Q-001"
    }
};

const laterPreview = EvidenceRequirementPreviewEngine.createPreview(laterState);

assert.equal(laterPreview.answerValue, "later");
assert.equal(laterPreview.evidenceRequired, false);
assert.equal(laterPreview.guidance.primary, "Question remains open for later review.");

[
    preview,
    okPreview,
    laterPreview
].forEach((item) => {
    assert.equal(item.safetyBoundary.sandboxOnly, true);
    assert.equal(item.safetyBoundary.evidencePersisted, false);
    assert.equal(item.safetyBoundary.answerPersisted, false);
    assert.equal(item.safetyBoundary.inspectionCreated, false);
    assert.equal(item.safetyBoundary.evidenceCreated, false);
    assert.equal(item.safetyBoundary.findingCreated, false);
    assert.equal(item.safetyBoundary.assessmentCreated, false);
    assert.equal(item.safetyBoundary.reportCreated, false);

    assert.ok(!("evidenceId" in item));
    assert.ok(!("evidenceIds" in item));
    assert.ok(!("findingId" in item));
    assert.ok(!("findingIds" in item));
});

console.log("EvidenceRequirementPreviewEngine core test passed");
console.log(`Finding evidence required: ${preview.evidenceRequired}`);
console.log(`Required inputs: ${preview.requiredInputs.map(input => input.type).join(", ")}`);
console.log(`OK evidence required: ${okPreview.evidenceRequired}`);
console.log(`Later evidence required: ${laterPreview.evidenceRequired}`);
console.log("Safety boundary:");
console.log(`- evidencePersisted: ${preview.safetyBoundary.evidencePersisted}`);
console.log(`- evidenceCreated: ${preview.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${preview.safetyBoundary.findingCreated}`);
