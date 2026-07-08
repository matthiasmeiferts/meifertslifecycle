import assert from "node:assert/strict";
import AdaptiveScopeDraftEngine from "../portal/core/AdaptiveScopeDraftEngine.js";

const previewFixture = {
    previewMode: "read_only",
    totalCatalogItems: 4,
    profile: {
        country: "thailand",
        buildingType: "condominium"
    },
    previewQuestions: [
        {
            question: {
                questionId: "fixture-main-001",
                questionText: "Is facade waterproofing acceptable?",
                chapterNumber: "01",
                chapterTitle: "Building Envelope",
                sectionTitle: "Facade",
                buildingSystem: "facade",
                adaptiveScore: 80
            },
            candidateFollowUpCount: 2,
            negativeSimulation: {
                followUpQuestionIds: ["fixture-follow-001", "fixture-follow-002"],
                evidenceRequirements: ["comment", "photo", "moisture_photo_location_comment"],
                signals: ["expertCommentRequired", "findingSignalPrepared", "capexSignalPrepared"]
            },
            positiveSimulation: {
                skippedQuestionIds: ["fixture-follow-001", "fixture-follow-002"],
                signals: ["irrelevantDefectDetailsSkipped"]
            }
        },
        {
            question: {
                questionId: "fixture-main-002",
                questionText: "Is roof drainage acceptable?",
                chapterNumber: "01",
                chapterTitle: "Building Envelope",
                sectionTitle: "Roof",
                buildingSystem: "roof",
                adaptiveScore: 75
            },
            candidateFollowUpCount: 3,
            negativeSimulation: {
                followUpQuestionIds: ["fixture-follow-003"],
                evidenceRequirements: ["comment", "photo"],
                signals: ["expertCommentRequired", "findingSignalPrepared"]
            },
            positiveSimulation: {
                skippedQuestionIds: ["fixture-follow-003"],
                signals: ["irrelevantDefectDetailsSkipped"]
            }
        }
    ]
};

const draft = AdaptiveScopeDraftEngine.createScopeDraft(previewFixture);

assert.equal(draft.draftMode, "read_only");
assert.equal(draft.sourcePreviewMode, "read_only");
assert.equal(draft.totalCatalogItems, 4);
assert.equal(draft.questionCount, 2);
assert.equal(draft.moduleCount, 2);

assert.equal(draft.safetyBoundary.inspectionCreated, false);
assert.equal(draft.safetyBoundary.answersPersisted, false);
assert.equal(draft.safetyBoundary.evidenceCreated, false);
assert.equal(draft.safetyBoundary.findingsCreated, false);
assert.equal(draft.safetyBoundary.assessmentsCreated, false);
assert.equal(draft.safetyBoundary.reportsCreated, false);

assert.ok(draft.evidenceRequirements.includes("comment"));
assert.ok(draft.evidenceRequirements.includes("photo"));
assert.ok(draft.evidenceRequirements.includes("moisture_photo_location_comment"));

assert.ok(draft.signalSummary.find(item => item.signal === "findingSignalPrepared"));
assert.ok(draft.signalSummary.find(item => item.signal === "irrelevantDefectDetailsSkipped"));

const facadeModule = draft.modules.find(module => module.buildingSystem === "facade");

assert.ok(facadeModule);
assert.equal(facadeModule.questionCount, 1);
assert.equal(facadeModule.candidateFollowUpCount, 2);
assert.equal(facadeModule.findingFollowUpCount, 2);
assert.equal(facadeModule.okSkipCount, 2);
assert.ok(facadeModule.evidenceRequirements.includes("comment"));
assert.ok(facadeModule.signals.includes("findingSignalPrepared"));

console.log("AdaptiveScopeDraftEngine test passed");
console.log(`Draft questions: ${draft.questionCount}`);
console.log(`Draft modules: ${draft.moduleCount}`);
console.log(`Evidence requirements: ${draft.evidenceRequirements.join(", ")}`);
console.log(`Signals: ${draft.signalSummary.map(item => `${item.signal}:${item.count}`).join(", ")}`);
