import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionProfileEngine from "../portal/core/AdaptiveInspectionProfileEngine.js";
import AdaptiveFollowUpQuestionEngine from "../portal/core/AdaptiveFollowUpQuestionEngine.js";

const catalogPath = "portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json";
const rawCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));

QuestionCatalogManager.loadFromData(rawCatalog);

const catalogItems = QuestionCatalogManager.getAll();

const profile = {
    country: "Thailand",
    buildingType: "Condominium",
    useType: "Residential",
    ageBand: "Existing",
    climateZone: "Tropical",
    locationContext: "Coastal",
    legalContext: "Ownership",
    inspectionPurpose: "Acquisition"
};

const startQuestionSet = AdaptiveInspectionProfileEngine.createStartQuestionSet(profile, catalogItems, {
    limit: 25
});

assert.equal(startQuestionSet.totalCatalogItems, 680);
assert.ok(startQuestionSet.selectedCount > 0);

const mainQuestion = startQuestionSet.questions[0];

const candidateFollowUps = catalogItems.filter((question) => {
    return question.questionId !== mainQuestion.questionId &&
        (
            question.buildingSystem === mainQuestion.buildingSystem ||
            question.inspectionArea === mainQuestion.inspectionArea ||
            question.component === mainQuestion.component ||
            question.chapterNumber === mainQuestion.chapterNumber
        );
});

const negativeResult = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
    ...mainQuestion,
    answerValue: "finding",
    profile,
    candidateFollowUps
});

assert.equal(negativeResult.questionId, mainQuestion.questionId);
assert.equal(negativeResult.answerValue, "finding");
assert.ok(Array.isArray(negativeResult.actions));
assert.ok(negativeResult.actions.length > 0);
assert.ok(negativeResult.followUpQuestionIds.length <= 5);
assert.ok(negativeResult.evidenceRequirements.includes("comment"));
assert.ok(negativeResult.signals.includes("findingSignalPrepared"));

if (mainQuestion.evidenceRelevant) {
    assert.ok(negativeResult.evidenceRequirements.includes("photo"));
}

if (mainQuestion.capexRelevant) {
    assert.ok(negativeResult.signals.includes("capexSignalPrepared"));
}

const positiveResult = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
    ...mainQuestion,
    answerValue: "ok",
    profile,
    candidateFollowUps
});

assert.equal(positiveResult.questionId, mainQuestion.questionId);
assert.equal(positiveResult.answerValue, "ok");
assert.ok(Array.isArray(positiveResult.actions));
assert.ok(positiveResult.skippedQuestionIds.length <= 5);
assert.ok(positiveResult.signals.includes("irrelevantDefectDetailsSkipped"));

console.log("AdaptiveFollowUpQuestionEngine catalog integration test passed");
console.log(`Main question: ${mainQuestion.questionId} | ${mainQuestion.questionText}`);
console.log(`Candidate follow-ups: ${candidateFollowUps.length}`);
console.log(`Negative follow-ups: ${negativeResult.followUpQuestionIds.length}`);
console.log(`Negative evidence requirements: ${negativeResult.evidenceRequirements.join(", ")}`);
console.log(`Negative signals: ${negativeResult.signals.join(", ")}`);
console.log(`Positive skipped questions: ${positiveResult.skippedQuestionIds.length}`);
