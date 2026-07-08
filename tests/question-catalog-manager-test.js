import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";

const catalogPath = new URL("../portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json", import.meta.url);
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

QuestionCatalogManager.clear();

const summary = QuestionCatalogManager.loadFromData(catalog);

assert.equal(summary.totalItems, 680);
assert.equal(summary.validationStatus, "pass");
assert.equal(summary.duplicateQuestionIds, 0);
assert.equal(summary.missingRequiredFieldItems, 0);

assert.equal(QuestionCatalogManager.count(), 680);

const chapters = QuestionCatalogManager.getChapters();
assert.ok(chapters.length >= 19);
assert.ok(chapters.find(chapter => chapter.chapterNumber === "10"));
assert.ok(chapters.find(chapter => chapter.chapterNumber === "20"));

const electricalItems = QuestionCatalogManager.getByBuildingSystem("electrical");
assert.ok(electricalItems.length > 0);
assert.ok(electricalItems.find(item => item.questionId === "DE-TDD-10-001"));

const reportItems = QuestionCatalogManager.getByChapter("20");
assert.ok(reportItems.length > 0);
assert.ok(reportItems.find(item => item.questionId === "DE-TDD-20-D-001"));

const checklistItems = QuestionCatalogManager.getByAnswerType("checklist_rating");
assert.ok(checklistItems.length > 0);

const uploadItems = QuestionCatalogManager.getUploadRelevant();
assert.ok(uploadItems.length > 0);

const evidenceItems = QuestionCatalogManager.getEvidenceRelevant();
assert.ok(evidenceItems.length > 0);

const capexItems = QuestionCatalogManager.getCapexRelevant();
assert.ok(capexItems.length > 0);

const smokeResults = QuestionCatalogManager.search("Rauchwarnmelder");
assert.ok(smokeResults.length > 0);

const knownQuestion = QuestionCatalogManager.getById("DE-TDD-10-001");
assert.equal(knownQuestion.questionId, "DE-TDD-10-001");

assert.equal(QuestionCatalogManager.has("DE-TDD-10-001"), true);
assert.equal(QuestionCatalogManager.has("DOES-NOT-EXIST"), false);

const duplicateValidation = QuestionCatalogManager.validate([
    catalog[0],
    catalog[0]
]);

assert.equal(duplicateValidation.isValid, false);
assert.equal(duplicateValidation.duplicateQuestionIds.length, 1);

const missingValidation = QuestionCatalogManager.validate([
    {
        questionId: "BROKEN"
    }
]);

assert.equal(missingValidation.isValid, false);
assert.ok(missingValidation.missingRequiredFields.length > 0);

QuestionCatalogManager.clear();
assert.equal(QuestionCatalogManager.count(), 0);

console.log("QuestionCatalogManager tests passed.");
