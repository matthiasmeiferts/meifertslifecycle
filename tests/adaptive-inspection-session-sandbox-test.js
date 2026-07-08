import assert from "node:assert/strict";
import AdaptiveInspectionSessionSandbox from "../portal/core/AdaptiveInspectionSessionSandbox.js";

const scopeDraftFixture = {
    draftMode: "read_only",
    totalCatalogItems: 680,
    profile: {
        country: "Thailand",
        buildingType: "Condominium"
    },
    evidenceRequirements: ["comment", "photo", "moisture_photo_location_comment"],
    signalSummary: [
        { signal: "findingSignalPrepared", count: 2 },
        { signal: "capexSignalPrepared", count: 1 }
    ],
    modules: [
        {
            key: "06|Keller & Abdichtung|basement_waterproofing",
            chapterNumber: "06",
            chapterTitle: "Keller & Abdichtung",
            buildingSystem: "basement_waterproofing",
            candidateFollowUpCount: 20,
            findingFollowUpCount: 4,
            okSkipCount: 4,
            evidenceRequirements: ["comment", "photo"],
            signals: ["findingSignalPrepared"],
            questions: [
                {
                    questionId: "fixture-001",
                    questionText: "Is waterproofing acceptable?",
                    sectionTitle: "Basement",
                    adaptiveScore: 80,
                    candidateFollowUpCount: 10,
                    findingFollowUpCount: 2,
                    okSkipCount: 2
                },
                {
                    questionId: "fixture-002",
                    questionText: "Is drainage acceptable?",
                    sectionTitle: "Basement",
                    adaptiveScore: 75,
                    candidateFollowUpCount: 10,
                    findingFollowUpCount: 2,
                    okSkipCount: 2
                }
            ]
        }
    ]
};

const sandbox = AdaptiveInspectionSessionSandbox.createSandboxSession(scopeDraftFixture, {
    sandboxId: "sandbox-test-001"
});

assert.equal(sandbox.sessionMode, "sandbox_read_only");
assert.equal(sandbox.sourceDraftMode, "read_only");
assert.equal(sandbox.sandboxId, "sandbox-test-001");
assert.equal(sandbox.totalCatalogItems, 680);
assert.equal(sandbox.moduleCount, 1);
assert.equal(sandbox.questionCount, 2);

assert.equal(sandbox.progress.totalQuestions, 2);
assert.equal(sandbox.progress.answeredQuestions, 0);
assert.equal(sandbox.progress.unansweredQuestions, 2);
assert.equal(sandbox.progress.completionRate, 0);

assert.equal(sandbox.safetyBoundary.sandboxOnly, true);
assert.equal(sandbox.safetyBoundary.inspectionCreated, false);
assert.equal(sandbox.safetyBoundary.answersPersisted, false);
assert.equal(sandbox.safetyBoundary.evidenceCreated, false);
assert.equal(sandbox.safetyBoundary.findingsCreated, false);
assert.equal(sandbox.safetyBoundary.assessmentsCreated, false);
assert.equal(sandbox.safetyBoundary.reportsCreated, false);

assert.ok(!("inspectionId" in sandbox));
assert.ok(!("answerIds" in sandbox));
assert.ok(!("evidenceIds" in sandbox));
assert.ok(!("findingIds" in sandbox));
assert.ok(!("assessmentIds" in sandbox));
assert.ok(!("reportIds" in sandbox));

const module = sandbox.modules[0];

assert.equal(module.moduleIndex, 1);
assert.equal(module.questionCount, 2);
assert.equal(module.questions.length, 2);

const question = module.questions[0];

assert.equal(question.sandboxQuestionIndex, 1);
assert.equal(question.questionId, "fixture-001");
assert.equal(question.answerState.value, null);
assert.equal(question.answerState.isAnswered, false);
assert.equal(question.answerState.persisted, false);
assert.equal(question.evidenceState.created, false);
assert.deepEqual(question.evidenceState.evidenceIds, []);
assert.equal(question.findingState.created, false);
assert.deepEqual(question.findingState.findingIds, []);

console.log("AdaptiveInspectionSessionSandbox test passed");
console.log(`Sandbox mode: ${sandbox.sessionMode}`);
console.log(`Sandbox ID: ${sandbox.sandboxId}`);
console.log(`Modules: ${sandbox.moduleCount}`);
console.log(`Questions: ${sandbox.questionCount}`);
console.log(`Completion: ${sandbox.progress.completionRate}%`);
console.log("Safety boundary:");
console.log(`- sandboxOnly: ${sandbox.safetyBoundary.sandboxOnly}`);
console.log(`- inspectionCreated: ${sandbox.safetyBoundary.inspectionCreated}`);
console.log(`- answersPersisted: ${sandbox.safetyBoundary.answersPersisted}`);
console.log(`- evidenceCreated: ${sandbox.safetyBoundary.evidenceCreated}`);
console.log(`- findingsCreated: ${sandbox.safetyBoundary.findingsCreated}`);
console.log(`- assessmentsCreated: ${sandbox.safetyBoundary.assessmentsCreated}`);
console.log(`- reportsCreated: ${sandbox.safetyBoundary.reportsCreated}`);
