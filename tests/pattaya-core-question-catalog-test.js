import assert from "node:assert/strict";
import pattayaCoreQuestionCatalog from "../portal/data/inspection/pattaya-core-question-catalog.js";
import LocationProfileManager from "../portal/core/LocationProfileManager.js";
import AdaptiveQuestionEngine from "../portal/core/AdaptiveQuestionEngine.js";

const profile = LocationProfileManager.create({
    country: "TH",
    region: "Pattaya / Chonburi",
    propertyType: LocationProfileManager.PROPERTY_TYPES.CONDOMINIUM_UNIT,
    availableMinutes: 60
});

assert.ok(pattayaCoreQuestionCatalog.length >= 10);
assert.ok(pattayaCoreQuestionCatalog.every(question => question.id));
assert.ok(pattayaCoreQuestionCatalog.every(question => question.question?.de));
assert.ok(pattayaCoreQuestionCatalog.every(question => question.appliesTo?.countries?.includes("TH")));

const normalizedQuestions = pattayaCoreQuestionCatalog.map(question => ({
    ...question,
    text: question.question.de
}));

const plan = AdaptiveQuestionEngine.getInspectionPlan(normalizedQuestions, {}, {
    locationProfile: profile
}, {
    maxNextQuestions: 5
});

assert.equal(plan.profile.country, "TH");
assert.ok(plan.nextQuestions.length > 0);
assert.ok(plan.nextQuestions.length <= 5);
assert.ok(plan.nextQuestions.some(question => question.riskTags.includes("moisture") || question.riskTags.includes("balcony_waterproofing")));

const balconyQuestion = normalizedQuestions.find(question => question.id === "TH-PATTAYA-BALCONY-001");
const evaluation = AdaptiveQuestionEngine.evaluateAnswer(
    balconyQuestion,
    { value: "Auffällig" },
    profile
);

assert.ok(evaluation.requiredEvidence.includes("photo"));
assert.ok(evaluation.requiredEvidence.includes("measurement"));
assert.ok(evaluation.followUpQuestionIds.includes("TH-PATTAYA-MOISTURE-001"));

const documentQuestion = normalizedQuestions.find(question => question.id === "TH-PATTAYA-DOC-AVAILABILITY-001");
const documentEvaluation = AdaptiveQuestionEngine.evaluateAnswer(
    documentQuestion,
    { value: "Verfügbar" },
    profile
);

assert.ok(documentEvaluation.requiredEvidence.includes("document_availability_check"));
assert.ok(!documentEvaluation.requiredEvidence.includes("document_relevance_check"));

console.log("Pattaya core question catalog tests passed.");
