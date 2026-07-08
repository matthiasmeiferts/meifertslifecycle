import assert from "node:assert/strict";
import AdaptiveInspectionPreviewBridge from "../portal/core/AdaptiveInspectionPreviewBridge.js";

const catalogFixture = [
    {
        questionId: "fixture-main-001",
        chapterNumber: "01",
        chapterTitle: "Building Envelope",
        sectionTitle: "Facade",
        questionText: "Is facade waterproofing acceptable in tropical climate?",
        buildingSystem: "facade",
        inspectionArea: "external envelope",
        component: "facade",
        answerType: "checklist_rating",
        riskCategories: ["moisture", "cost"],
        capexRelevant: true,
        evidenceRelevant: true,
        findingRelevant: true,
        defaultEvidenceTypes: ["photo", "inspection_note"]
    },
    {
        questionId: "fixture-follow-001",
        chapterNumber: "01",
        chapterTitle: "Building Envelope",
        sectionTitle: "Facade",
        questionText: "Is facade damage visible near the affected area?",
        buildingSystem: "facade",
        inspectionArea: "external envelope",
        component: "facade",
        answerType: "checklist_rating"
    },
    {
        questionId: "fixture-follow-002",
        chapterNumber: "01",
        chapterTitle: "Building Envelope",
        sectionTitle: "Moisture",
        questionText: "Is photo evidence required for moisture or leakage?",
        buildingSystem: "facade",
        inspectionArea: "moisture",
        component: "waterproofing",
        answerType: "checklist_rating"
    },
    {
        questionId: "fixture-unrelated-001",
        chapterNumber: "09",
        chapterTitle: "Parking",
        sectionTitle: "Access",
        questionText: "Is the parking access confirmed?",
        buildingSystem: "parking",
        inspectionArea: "access",
        component: "parking",
        answerType: "checklist_rating"
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

const preview = AdaptiveInspectionPreviewBridge.createPreview(profile, catalogFixture, {
    startLimit: 1,
    followUpLimit: 5
});

assert.equal(preview.previewMode, "read_only");
assert.equal(preview.totalCatalogItems, 4);
assert.equal(preview.startQuestionCount, 1);
assert.equal(preview.safetyBoundary.answersPersisted, false);
assert.equal(preview.safetyBoundary.evidenceCreated, false);
assert.equal(preview.safetyBoundary.findingsCreated, false);
assert.equal(preview.safetyBoundary.assessmentsCreated, false);
assert.equal(preview.safetyBoundary.reportsCreated, false);

const firstPreview = preview.previewQuestions[0];

assert.equal(firstPreview.question.questionId, "fixture-main-001");
assert.ok(firstPreview.candidateFollowUpCount >= 2);
assert.ok(firstPreview.negativeSimulation.followUpQuestionIds.includes("fixture-follow-001"));
assert.ok(firstPreview.negativeSimulation.evidenceRequirements.includes("comment"));
assert.ok(firstPreview.negativeSimulation.signals.includes("findingSignalPrepared"));
assert.ok(firstPreview.positiveSimulation.skippedQuestionIds.includes("fixture-follow-001"));
assert.ok(firstPreview.positiveSimulation.signals.includes("irrelevantDefectDetailsSkipped"));

console.log("AdaptiveInspectionPreviewBridge test passed");
console.log(`Preview questions: ${preview.startQuestionCount}`);
console.log(`Candidate follow-ups: ${firstPreview.candidateFollowUpCount}`);
console.log(`Negative follow-ups: ${firstPreview.negativeSimulation.followUpQuestionIds.join(", ")}`);
console.log(`Positive skipped: ${firstPreview.positiveSimulation.skippedQuestionIds.join(", ")}`);
