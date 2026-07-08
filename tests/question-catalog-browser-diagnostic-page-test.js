
import assert from "node:assert/strict";

import fs from "node:fs";

import QuestionCatalogManager from "../portal/core/QuestionCatalogManager.js";

import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";

const catalogPath = new URL("../portal/data/question-catalog/meiferts-question-catalog-import-ready.v2.7.json", import.meta.url);

const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

QuestionCatalogManager.clear();

QuestionCatalogManager.loadFromData(catalog);

QuestionCatalogPage.selectedChapter = "20";

QuestionCatalogPage.searchTerm = "";

const chapterItems = QuestionCatalogPage.getVisibleQuestions();

assert.ok(chapterItems.length > 0);

assert.ok(chapterItems.every(item => String(item.chapterNumber).padStart(2, "0") === "20"));

QuestionCatalogPage.searchTerm = "Rauchwarnmelder";

const searchItems = QuestionCatalogPage.getVisibleQuestions();

assert.ok(searchItems.length > 0);

assert.ok(searchItems.some(item => String(item.questionText || "").toLowerCase().includes("rauchwarnmelder")));

assert.equal(QuestionCatalogPage.escapeHtml("<test>"), "&lt;test&gt;");

assert.equal(QuestionCatalogPage.normalize("  CAPEX  "), "capex");

console.log("Question catalog browser diagnostic page tests passed.");

