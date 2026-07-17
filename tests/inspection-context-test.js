import assert from "node:assert/strict";
import InspectionContext from "../portal/core/InspectionContext.js";

const source = {
    profile: {
        country: "Thailand",
        region: "Chonburi",
        city: "Pattaya",
        buildingType: "Condominium",
        useType: "Residential",
        constructionYear: 2012,
        ageBand: "Existing",
        climateZone: "Tropical",
        locationContext: "Coastal",
        legalContext: "Ownership",
        ownershipModel: "Foreign freehold",
        inspectionPurpose: "Acquisition",
        inspectionLevel: "Technical Due Diligence"
    },
    inspection: {
        inspectionId: "inspection-001",
        status: "in_progress",
        inspector: {
            name: "Matthias Meiferts"
        }
    },
    navigation: {
        currentQuestionId: "Q-001",
        visitedQuestionIds: ["Q-000"]
    },
    modules: {
        active: ["facade", "roof"]
    },
    questions: {
        visibleQuestionIds: ["Q-001", "Q-002"]
    },
    answers: {
        byQuestionId: {
            "Q-000": {
                value: "ok"
            }
        }
    }
};

const context = InspectionContext.create(source, {
    contextId: "context-001",
    createdAt: "2026-07-17T06:00:00.000Z",
    timestamp: "2026-07-17T06:05:00.000Z"
});

assert.equal(context.contextMode, "adaptive_inspection_context");
assert.equal(context.metadata.contextId, "context-001");
assert.equal(context.metadata.version, "1.0.0");
assert.equal(context.metadata.engineVersion, "adaptive-inspection-engine-2.0");
assert.equal(context.profile.country, "Thailand");
assert.equal(context.profile.constructionYear, 2012);
assert.equal(context.inspection.status, "in_progress");
assert.equal(context.navigation.currentQuestionId, "Q-001");
assert.deepEqual(context.modules.active, ["facade", "roof"]);
assert.deepEqual(context.questions.visibleQuestionIds, ["Q-001", "Q-002"]);
assert.equal(context.answers.byQuestionId["Q-000"].value, "ok");
assert.equal(context.workflow.currentStage, "inspection_setup");
assert.equal(context.statistics.completionRate, 0);
assert.equal(context.safetyBoundary.contextPersisted, false);
assert.equal(context.safetyBoundary.answersPersisted, false);
assert.equal(context.safetyBoundary.exportExecuted, false);

source.profile.country = "Germany";
source.modules.active.push("basement");
source.answers.byQuestionId["Q-000"].value = "finding";

assert.equal(context.profile.country, "Thailand");
assert.deepEqual(context.modules.active, ["facade", "roof"]);
assert.equal(context.answers.byQuestionId["Q-000"].value, "ok");

console.log("InspectionContext core test passed");
console.log(`Context version: ${context.metadata.version}`);
console.log(`Profile: ${context.profile.country} · ${context.profile.buildingType}`);
console.log(`Safety boundary exportExecuted: ${context.safetyBoundary.exportExecuted}`);
