import assert from "node:assert/strict";
import InspectionHumanWorkLayer from "../portal/core/InspectionHumanWorkLayer.js";

const sandboxFixture = {
    sessionMode: "sandbox_read_only",
    profile: {
        country: "Thailand",
        buildingType: "Condominium"
    },
    questionCount: 2,
    progress: {
        totalQuestions: 2,
        answeredQuestions: 0,
        unansweredQuestions: 2,
        completionRate: 0
    },
    modules: [
        {
            moduleIndex: 1,
            chapterNumber: "06",
            chapterTitle: "Keller & Abdichtung",
            buildingSystem: "basement_waterproofing",
            questionCount: 2,
            questions: [
                {
                    questionId: "fixture-001",
                    questionText: "Is waterproofing acceptable?",
                    sectionTitle: "Basement",
                    evidenceState: {
                        required: true,
                        created: false,
                        evidenceIds: []
                    },
                    findingState: {
                        prepared: true,
                        created: false,
                        findingIds: []
                    }
                },
                {
                    questionId: "fixture-002",
                    questionText: "Is drainage acceptable?",
                    sectionTitle: "Basement",
                    evidenceState: {
                        required: false,
                        created: false,
                        evidenceIds: []
                    },
                    findingState: {
                        prepared: false,
                        created: false,
                        findingIds: []
                    }
                }
            ]
        }
    ]
};

const workView = InspectionHumanWorkLayer.createWorkView(sandboxFixture, {
    currentModuleIndex: 0,
    currentQuestionIndex: 0
});

assert.equal(workView.workMode, "human_read_only");
assert.equal(workView.sourceSessionMode, "sandbox_read_only");

assert.equal(workView.currentModule.moduleIndex, 1);
assert.equal(workView.currentModule.chapterNumber, "06");
assert.equal(workView.currentModule.chapterTitle, "Keller & Abdichtung");
assert.equal(workView.currentModule.questionCount, 2);

assert.equal(workView.currentQuestion.questionIndex, 1);
assert.equal(workView.currentQuestion.questionId, "fixture-001");
assert.equal(workView.currentQuestion.questionText, "Is waterproofing acceptable?");
assert.equal(workView.currentQuestion.evidenceRequiredIfFinding, true);
assert.equal(workView.currentQuestion.findingPreparedIfFinding, true);

assert.equal(workView.progress.totalQuestions, 2);
assert.equal(workView.progress.answeredQuestions, 0);
assert.equal(workView.progress.unansweredQuestions, 2);
assert.equal(workView.progress.completionRate, 0);

assert.equal(workView.answerOptions.length, 4);
assert.ok(workView.answerOptions.find(option => option.value === "ok"));
assert.ok(workView.answerOptions.find(option => option.value === "finding"));
assert.ok(workView.answerOptions.find(option => option.value === "not_verifiable"));
assert.ok(workView.answerOptions.find(option => option.value === "later"));

assert.equal(workView.guidance.nextStep, "Choose answer");
assert.ok(workView.guidance.evidenceHint.includes("photo"));

assert.equal(workView.safetyBoundary.humanLayerOnly, true);
assert.equal(workView.safetyBoundary.inspectionCreated, false);
assert.equal(workView.safetyBoundary.answersPersisted, false);
assert.equal(workView.safetyBoundary.evidenceCreated, false);
assert.equal(workView.safetyBoundary.findingsCreated, false);
assert.equal(workView.safetyBoundary.assessmentsCreated, false);
assert.equal(workView.safetyBoundary.reportsCreated, false);

assert.ok(!("inspectionId" in workView));
assert.ok(!("answerIds" in workView));
assert.ok(!("evidenceIds" in workView));
assert.ok(!("findingIds" in workView));

console.log("InspectionHumanWorkLayer test passed");
console.log(`Work mode: ${workView.workMode}`);
console.log(`Current module: ${workView.currentModule.chapterNumber} ${workView.currentModule.chapterTitle}`);
console.log(`Current question: ${workView.currentQuestion.questionId}`);
console.log(`Answer options: ${workView.answerOptions.map(option => option.label).join(", ")}`);
console.log(`Evidence hint: ${workView.guidance.evidenceHint}`);
console.log("Safety boundary:");
console.log(`- humanLayerOnly: ${workView.safetyBoundary.humanLayerOnly}`);
console.log(`- inspectionCreated: ${workView.safetyBoundary.inspectionCreated}`);
console.log(`- answersPersisted: ${workView.safetyBoundary.answersPersisted}`);
console.log(`- evidenceCreated: ${workView.safetyBoundary.evidenceCreated}`);
console.log(`- findingsCreated: ${workView.safetyBoundary.findingsCreated}`);
console.log(`- assessmentsCreated: ${workView.safetyBoundary.assessmentsCreated}`);
console.log(`- reportsCreated: ${workView.safetyBoundary.reportsCreated}`);
