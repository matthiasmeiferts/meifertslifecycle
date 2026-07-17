import assert from "node:assert/strict";
import InspectionContext from "../portal/core/InspectionContext.js";

const context = InspectionContext.create({
    profile: {
        country: "Thailand",
        buildingType: "Condominium"
    },
    questions: {
        catalog: [
            {
                questionId: "Q-001",
                questionText: "Inspect facade"
            }
        ]
    },
    answers: {
        history: [
            {
                questionId: "Q-001",
                answerValue: "finding"
            }
        ]
    },
    safetyBoundary: {
        contextPersisted: true,
        answersPersisted: true
    }
}, {
    contextId: "context-serialization-001",
    createdAt: "2026-07-17T07:00:00.000Z",
    timestamp: "2026-07-17T07:10:00.000Z"
});

const serialized = InspectionContext.serialize(context);
const restored = InspectionContext.restore(serialized);

assert.equal(typeof serialized, "string");
assert.notEqual(restored, context);
assert.deepEqual(restored, context);
assert.notEqual(restored.questions.catalog, context.questions.catalog);
assert.notEqual(restored.answers.history, context.answers.history);
assert.equal(restored.safetyBoundary.contextPersisted, true);
assert.equal(restored.safetyBoundary.answersPersisted, true);
assert.equal(restored.safetyBoundary.exportExecuted, false);

assert.throws(
    () => InspectionContext.restore(JSON.stringify({ contextMode: "unknown" })),
    /Invalid inspection context payload/
);

assert.throws(
    () => InspectionContext.restore(JSON.stringify({
        contextMode: "adaptive_inspection_context",
        metadata: {
            version: "9.0.0"
        }
    })),
    /Unsupported inspection context version/
);

console.log("InspectionContext serialization test passed");
console.log(`Serialized bytes: ${Buffer.byteLength(serialized, "utf8")}`);
console.log(`Restored context ID: ${restored.metadata.contextId}`);
