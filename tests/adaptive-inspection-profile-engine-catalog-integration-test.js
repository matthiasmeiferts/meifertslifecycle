import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";
import AdaptiveInspectionProfileEngine from "../portal/core/AdaptiveInspectionProfileEngine.js";

const catalogPath = "portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json";
const rawCatalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const summary = QuestionCatalogManager.loadFromData(rawCatalog);
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

const result = AdaptiveInspectionProfileEngine.createStartQuestionSet(profile, catalogItems, {
    limit: 25
});

assert.equal(summary.totalItems, 680);
assert.equal(summary.chapterCount, 19);
assert.equal(summary.validationStatus, "pass");

assert.equal(result.totalCatalogItems, 680);
assert.ok(result.selectedCount > 0);
assert.ok(result.selectedCount <= 25);

assert.equal(result.profile.country, "thailand");
assert.equal(result.profile.buildingType, "condominium");
assert.equal(result.profile.climateZone, "tropical");
assert.equal(result.profile.inspectionPurpose, "acquisition");

assert.ok(Array.isArray(result.rules));
assert.ok(result.rules.length > 0);

const firstQuestion = result.questions[0];

assert.ok(firstQuestion.questionId);
assert.ok(firstQuestion.questionText);
assert.ok(firstQuestion.adaptiveScore > 0);
assert.ok(Array.isArray(firstQuestion.adaptiveReasons));
assert.ok(firstQuestion.adaptiveReasons.length > 0);
assert.ok(Array.isArray(firstQuestion.adaptiveSignals));
assert.ok(firstQuestion.adaptiveSignals.length > 0);

const selectedWithScores = result.questions.filter((question) => question.adaptiveScore > 0);
assert.equal(selectedWithScores.length, result.selectedCount);

console.log("AdaptiveInspectionProfileEngine catalog integration test passed");
console.log(`Catalog items: ${result.totalCatalogItems}`);
console.log(`Selected questions: ${result.selectedCount}`);
console.log("Top 5 selected questions:");

result.questions.slice(0, 5).forEach((question, index) => {
    console.log(`${index + 1}. ${question.questionId} | score ${question.adaptiveScore} | ${question.chapterNumber} ${question.chapterTitle}`);
});
