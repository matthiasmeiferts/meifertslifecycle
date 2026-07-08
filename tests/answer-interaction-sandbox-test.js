import assert from "node:assert/strict";
import AnswerInteractionSandbox from "../portal/core/AnswerInteractionSandbox.js";

const workViewFixture = {
    workMode: "human_read_only",
    currentModule: {
        moduleIndex: 1,
        chapterNumber: "06",
        chapterTitle: "Keller & Abdichtung"
    },
    currentQuestion: {
        questionIndex: 1,
        questionId: "fixture-001",
        questionText: "Is waterproofing acceptable?",
        evidenceRequiredIfFinding: true,
        findingPreparedIfFinding: true
    },
    progress: {
        totalQuestions: 5,
        answeredQuestions: 0,
        unansweredQuestions: 5,
        completionRate: 0
    },
    answerOptions: [
        {
            value: "ok",
            label: "OK",
            tone: "positive",
            description: "No relevant issue observed."
        },
        {
            value: "finding",
            label: "Auffällig",
            tone: "warning",
            description: "Issue observed. Evidence and expert review may be required."
        },
        {
            value: "not_verifiable",
            label: "Nicht prüfbar",
            tone: "neutral",
            description: "Could not be verified during inspection."
        },
        {
            value: "later",
            label: "Später",
            tone: "neutral",
            description: "Return to this question later."
        }
    ]
};

const findingInteraction = AnswerInteractionSandbox.applyAnswer(workViewFixture, "finding", {
    interactionId: "answer-sandbox-test-001",
    timestamp: "2026-07-08T12:00:00.000Z"
});

assert.equal(findingInteraction.interactionMode, "answer_sandbox_read_only");
assert.equal(findingInteraction.workMode, "human_read_only");
assert.equal(findingInteraction.selectedAnswer.value, "finding");
assert.equal(findingInteraction.selectedAnswer.label, "Auffällig");

assert.equal(findingInteraction.interaction.interactionId, "answer-sandbox-test-001");
assert.equal(findingInteraction.interaction.status, "preview_only");
assert.equal(findingInteraction.interaction.questionId, "fixture-001");
assert.equal(findingInteraction.interaction.persisted, false);
assert.equal(findingInteraction.interaction.evidenceCreated, false);
assert.equal(findingInteraction.interaction.findingCreated, false);

assert.equal(findingInteraction.progressPreview.totalQuestions, 5);
assert.equal(findingInteraction.progressPreview.answeredQuestions, 1);
assert.equal(findingInteraction.progressPreview.unansweredQuestions, 4);
assert.equal(findingInteraction.progressPreview.completionRate, 20);
assert.equal(findingInteraction.progressPreview.previewOnly, true);

assert.equal(findingInteraction.safetyBoundary.sandboxOnly, true);
assert.equal(findingInteraction.safetyBoundary.answerPersisted, false);
assert.equal(findingInteraction.safetyBoundary.inspectionCreated, false);
assert.equal(findingInteraction.safetyBoundary.evidenceCreated, false);
assert.equal(findingInteraction.safetyBoundary.findingCreated, false);
assert.equal(findingInteraction.safetyBoundary.assessmentCreated, false);
assert.equal(findingInteraction.safetyBoundary.reportCreated, false);

assert.ok(findingInteraction.guidance.evidenceHint.includes("No evidence has been created"));

const okInteraction = AnswerInteractionSandbox.applyAnswer(workViewFixture, "ok");

assert.equal(okInteraction.selectedAnswer.value, "ok");
assert.equal(okInteraction.progressPreview.answeredQuestions, 1);
assert.equal(okInteraction.progressPreview.completionRate, 20);
assert.equal(okInteraction.safetyBoundary.answerPersisted, false);

const laterInteraction = AnswerInteractionSandbox.applyAnswer(workViewFixture, "later");

assert.equal(laterInteraction.selectedAnswer.value, "later");
assert.equal(laterInteraction.progressPreview.answeredQuestions, 0);
assert.equal(laterInteraction.progressPreview.unansweredQuestions, 5);
assert.equal(laterInteraction.progressPreview.completionRate, 0);

const rejectedInteraction = AnswerInteractionSandbox.applyAnswer(workViewFixture, "invalid");

assert.equal(rejectedInteraction.interactionMode, "answer_sandbox_rejected");
assert.equal(rejectedInteraction.reason, "Unknown answer option");
assert.equal(rejectedInteraction.safetyBoundary.answerPersisted, false);

assert.ok(!("answerId" in findingInteraction));
assert.ok(!("answerIds" in findingInteraction));
assert.ok(!("evidenceId" in findingInteraction));
assert.ok(!("findingId" in findingInteraction));
assert.ok(!("inspectionId" in findingInteraction));

console.log("AnswerInteractionSandbox test passed");
console.log(`Interaction mode: ${findingInteraction.interactionMode}`);
console.log(`Selected answer: ${findingInteraction.selectedAnswer.label}`);
console.log(`Progress preview: ${findingInteraction.progressPreview.completionRate}%`);
console.log(`Guidance: ${findingInteraction.guidance.primary}`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${findingInteraction.safetyBoundary.sandboxOnly}`);
console.log(`- answerPersisted: ${findingInteraction.safetyBoundary.answerPersisted}`);
console.log(`- evidenceCreated: ${findingInteraction.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${findingInteraction.safetyBoundary.findingCreated}`);
