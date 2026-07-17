import assert from "node:assert/strict";
import InspectionContext from "../portal/core/InspectionContext.js";

const context = InspectionContext.create();

assert.deepEqual(context.navigation.visitedQuestionIds, []);
assert.deepEqual(context.modules.active, []);
assert.deepEqual(context.questions.catalog, []);
assert.deepEqual(context.answers.byQuestionId, {});
assert.deepEqual(context.evidence.required, []);
assert.deepEqual(context.findings.approved, []);
assert.equal(context.risk.overallRisk, null);
assert.equal(context.governance.expertReviewRequired, false);
assert.equal(context.export.exportReady, false);

Object.values(context.safetyBoundary).forEach(value => {
    assert.equal(value, false);
});

const unsafeInput = {
    safetyBoundary: {
        exportExecuted: "false",
        reportsPersisted: 1
    }
};

const normalized = InspectionContext.create(unsafeInput);

assert.equal(normalized.safetyBoundary.exportExecuted, false);
assert.equal(normalized.safetyBoundary.reportsPersisted, false);
assert.equal(normalized.safetyBoundary.answersPersisted, false);

console.log("InspectionContext regression safety test passed");
console.log(`Safety flags checked: ${Object.keys(context.safetyBoundary).length}`);
