import assert from "node:assert/strict";
import AdaptiveFollowUpQuestionEngine from "../portal/core/AdaptiveFollowUpQuestionEngine.js";

const candidateFollowUps = [
    {
        questionId: "fixture-follow-001",
        questionText: "Is facade damage visible near the affected area?",
        buildingSystem: "facade",
        inspectionArea: "external envelope",
        component: "facade"
    },
    {
        questionId: "fixture-follow-002",
        questionText: "Is photo evidence required for moisture or leakage?",
        buildingSystem: "facade",
        inspectionArea: "moisture",
        component: "waterproofing"
    },
    {
        questionId: "fixture-follow-003",
        questionText: "Is the unrelated parking access confirmed?",
        buildingSystem: "parking",
        inspectionArea: "access",
        component: "parking"
    }
];

const negativeResult = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
    questionId: "fixture-main-001",
    questionText: "Is the facade waterproofing condition acceptable?",
    answerType: "checklist_rating",
    answerValue: "finding",
    buildingSystem: "facade",
    inspectionArea: "external envelope",
    component: "facade",
    riskCategories: ["moisture", "cost"],
    capexRelevant: true,
    evidenceRelevant: true,
    findingRelevant: true,
    requiresPhoto: true,
    requiresComment: true,
    requiresLocation: true,
    defaultEvidenceTypes: ["photo", "inspection_note"],
    profile: {
        country: "Thailand",
        buildingType: "Condominium",
        useType: "Residential",
        ageBand: "Existing",
        climateZone: "Tropical",
        locationContext: "Coastal",
        legalContext: "Ownership",
        inspectionPurpose: "Acquisition"
    },
    candidateFollowUps
});

assert.equal(negativeResult.questionId, "fixture-main-001");
assert.equal(negativeResult.answerValue, "finding");
assert.ok(negativeResult.followUpQuestionIds.includes("fixture-follow-001"));
assert.ok(!negativeResult.followUpQuestionIds.includes("fixture-follow-003"));
assert.ok(negativeResult.evidenceRequirements.includes("comment"));
assert.ok(negativeResult.evidenceRequirements.includes("photo"));
assert.ok(negativeResult.evidenceRequirements.includes("moisture_photo_location_comment"));
assert.ok(negativeResult.signals.includes("capexSignalPrepared"));
assert.ok(negativeResult.signals.includes("findingSignalPrepared"));
assert.ok(negativeResult.signals.includes("tropicalMoistureEvidenceRequired"));

const positiveResult = AdaptiveFollowUpQuestionEngine.evaluateAnswer({
    questionId: "fixture-main-002",
    questionText: "Is the facade condition acceptable?",
    answerType: "checklist_rating",
    answerValue: "ok",
    buildingSystem: "facade",
    inspectionArea: "external envelope",
    component: "facade",
    profile: {
        country: "Thailand",
        buildingType: "Condominium",
        climateZone: "Tropical"
    },
    candidateFollowUps
});

assert.equal(positiveResult.answerValue, "ok");
assert.ok(positiveResult.skippedQuestionIds.includes("fixture-follow-001"));
assert.ok(positiveResult.signals.includes("irrelevantDefectDetailsSkipped"));

console.log("AdaptiveFollowUpQuestionEngine test passed");
console.log(`Negative follow-ups: ${negativeResult.followUpQuestionIds.join(", ")}`);
console.log(`Negative evidence requirements: ${negativeResult.evidenceRequirements.join(", ")}`);
console.log(`Positive skipped questions: ${positiveResult.skippedQuestionIds.join(", ")}`);
