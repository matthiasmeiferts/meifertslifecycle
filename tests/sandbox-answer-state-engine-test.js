import assert from "node:assert/strict";
import SandboxAnswerStateEngine from "../portal/core/SandboxAnswerStateEngine.js";

const sandboxSession = {
    sessionMode: "sandbox_read_only",
    sandboxId: "sandbox-answer-state-test-001",
    profile: {
        country: "Thailand",
        buildingType: "Condominium"
    },
    modules: [
        {
            chapterNumber: "06",
            chapterTitle: "Keller & Abdichtung",
            questions: [
                {
                    questionId: "Q-001",
                    questionText: "First question"
                },
                {
                    questionId: "Q-002",
                    questionText: "Second question"
                }
            ]
        },
        {
            chapterNumber: "14",
            chapterTitle: "Spezial Eigentumswohnung",
            questions: [
                {
                    questionId: "Q-003",
                    questionText: "Third question"
                }
            ]
        }
    ]
};

const initialState = SandboxAnswerStateEngine.createInitialState(sandboxSession);

assert.equal(initialState.stateMode, "sandbox_answer_state_read_only");
assert.equal(initialState.sourceSessionMode, "sandbox_read_only");
assert.equal(initialState.sandboxId, "sandbox-answer-state-test-001");
assert.equal(initialState.totalQuestions, 3);
assert.equal(initialState.currentQuestion.questionId, "Q-001");
assert.equal(initialState.nextQuestion.questionId, "Q-002");
assert.equal(initialState.progress.totalQuestions, 3);
assert.equal(initialState.progress.answeredQuestions, 0);
assert.equal(initialState.progress.completionRate, 0);
assert.equal(initialState.safetyBoundary.answerPersisted, false);
assert.equal(initialState.safetyBoundary.evidenceCreated, false);
assert.equal(initialState.safetyBoundary.findingCreated, false);

const afterOk = SandboxAnswerStateEngine.applyAnswer(initialState, "ok", {
    timestamp: "2026-07-08T12:00:00.000Z"
});

assert.equal(afterOk.stateMode, "sandbox_answer_state_read_only");
assert.equal(afterOk.lastInteraction.interactionMode, "sandbox_answer_state_preview");
assert.equal(afterOk.lastInteraction.selectedAnswer.value, "ok");
assert.equal(afterOk.lastInteraction.answerPersisted, false);
assert.equal(afterOk.answers["Q-001"].answerValue, "ok");
assert.equal(afterOk.answers["Q-001"].persisted, false);
assert.deepEqual(afterOk.answeredQuestionIds, ["Q-001"]);
assert.equal(afterOk.currentQuestion.questionId, "Q-002");
assert.equal(afterOk.nextQuestion.questionId, "Q-003");
assert.equal(afterOk.progress.answeredQuestions, 1);
assert.equal(afterOk.progress.unansweredQuestions, 2);
assert.equal(afterOk.progress.completionRate, 33);

const afterFinding = SandboxAnswerStateEngine.applyAnswer(afterOk, "finding", {
    timestamp: "2026-07-08T12:01:00.000Z"
});

assert.equal(afterFinding.lastInteraction.selectedAnswer.value, "finding");
assert.equal(afterFinding.lastInteraction.evidenceCreated, false);
assert.equal(afterFinding.lastInteraction.findingCreated, false);
assert.equal(afterFinding.answers["Q-002"].answerValue, "finding");
assert.equal(afterFinding.currentQuestion.questionId, "Q-003");
assert.equal(afterFinding.progress.answeredQuestions, 2);
assert.equal(afterFinding.progress.completionRate, 67);

const afterLater = SandboxAnswerStateEngine.applyAnswer(afterFinding, "later", {
    timestamp: "2026-07-08T12:02:00.000Z"
});

assert.equal(afterLater.lastInteraction.selectedAnswer.value, "later");
assert.equal(afterLater.answers["Q-003"], undefined);
assert.equal(afterLater.skippedQuestionIds.includes("Q-003"), true);
assert.equal(afterLater.progress.answeredQuestions, 2);
assert.equal(afterLater.progress.completionRate, 67);
assert.equal(afterLater.safetyBoundary.answerPersisted, false);

const rejected = SandboxAnswerStateEngine.applyAnswer(afterLater, "invalid-answer");

assert.equal(rejected.stateMode, "sandbox_answer_state_rejected");
assert.equal(rejected.reason, "Unknown answer option");
assert.equal(rejected.safetyBoundary.answerPersisted, false);
assert.equal(rejected.safetyBoundary.evidenceCreated, false);
assert.equal(rejected.safetyBoundary.findingCreated, false);

console.log("SandboxAnswerStateEngine core test passed");
console.log(`Initial progress: ${initialState.progress.completionRate}%`);
console.log(`After OK progress: ${afterOk.progress.completionRate}%`);
console.log(`After finding progress: ${afterFinding.progress.completionRate}%`);
console.log(`After later progress: ${afterLater.progress.completionRate}%`);
console.log(`Current question after OK: ${afterOk.currentQuestion.questionId}`);
console.log(`Current question after finding: ${afterFinding.currentQuestion.questionId}`);
console.log("Safety boundary:");
console.log(`- answerPersisted: ${afterFinding.safetyBoundary.answerPersisted}`);
console.log(`- evidenceCreated: ${afterFinding.safetyBoundary.evidenceCreated}`);
console.log(`- findingCreated: ${afterFinding.safetyBoundary.findingCreated}`);
