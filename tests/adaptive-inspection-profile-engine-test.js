import assert from "node:assert/strict";
import AdaptiveInspectionProfileEngine from "../portal/core/AdaptiveInspectionProfileEngine.js";

const catalogFixture = [
    {
        id: "fixture-001",
        chapter: "Building Envelope",
        question: "Are facade, roof and waterproofing conditions suitable for tropical humidity and heavy rain?",
        tags: ["moisture", "facade", "waterproofing"]
    },
    {
        id: "fixture-002",
        chapter: "Ownership Documents",
        question: "Are condominium ownership documents, reserve fund information and common area responsibilities available?",
        tags: ["condominium", "ownership", "reserve"]
    },
    {
        id: "fixture-003",
        chapter: "Heating Systems",
        question: "Is the basement heating system documented for German energy compliance?",
        tags: ["germany", "heating", "basement"]
    },
    {
        id: "fixture-004",
        chapter: "General",
        question: "Is the general inspection appointment confirmed?",
        tags: ["general"]
    }
];

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

const result = AdaptiveInspectionProfileEngine.createStartQuestionSet(profile, catalogFixture, {
    limit: 3
});

assert.equal(result.totalCatalogItems, 4);
assert.equal(result.selectedCount, 2);
assert.equal(result.profile.country, "thailand");
assert.equal(result.profile.buildingType, "condominium");
assert.ok(Array.isArray(result.rules));
assert.ok(result.rules.length > 0);

assert.ok(result.questions[0].adaptiveScore > 0);
assert.ok(result.questions[0].adaptiveReasons.length > 0);

const selectedIds = result.questions.map((question) => question.id);
assert.ok(selectedIds.includes("fixture-001"));
assert.ok(selectedIds.includes("fixture-002"));
assert.ok(!selectedIds.includes("fixture-004"));

const ownershipQuestion = result.questions.find((question) => question.id === "fixture-002");
assert.ok(ownershipQuestion);
assert.ok(ownershipQuestion.adaptiveSignals.length > 0);

console.log("AdaptiveInspectionProfileEngine test passed");
console.log(`Selected questions: ${result.questions.map((question) => question.id).join(", ")}`);
