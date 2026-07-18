import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

runTest(
    "valid contract and deterministic output",
    () => {

        const input = {
            finding: {
                id: "f-1",
                category: "Moisture",
                summary: "Visible damp staining near the balcony door"
            },
            building: {
                type: "Condominium",
                age: 12
            },
            measurements: [
                {
                    name: "Relative humidity",
                    value: 78
                }
            ],
            context: {
                notes: "Coastal exposure"
            }
        };

        const result1 =
            ExpertReasoningEngine.analyze(input);

        const result2 =
            ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(
            result1,
            result2
        );

        assert.ok(
            result1 &&
            typeof result1 === "object"
        );

        assert.ok(result1.primaryHypothesis);
        assert.ok(Array.isArray(result1.alternativeHypotheses));
        assert.ok(Array.isArray(result1.supportingEvidence));
        assert.ok(Array.isArray(result1.missingEvidence));
        assert.ok(Array.isArray(result1.requiredVerification));
        assert.ok(Array.isArray(result1.potentialConsequences));
        assert.equal(typeof result1.confidence, "number");

    }
);

runTest(
    "immutable inputs",
    () => {

        const input = {
            finding: {
                id: "f-2",
                summary: "Crack line at the facade"
            },
            building: {
                type: "Apartment"
            },
            measurements: [
                {
                    name: "Crack width",
                    value: 1.2
                }
            ],
            context: {
                notes: "Inspection note"
            }
        };

        const original =
            structuredClone(input);

        ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(
            input,
            original
        );

    }
);

runTest(
    "empty input returns stable contract",
    () => {

        const result =
            ExpertReasoningEngine.analyze();

        assert.ok(result.primaryHypothesis);
        assert.ok(Array.isArray(result.alternativeHypotheses));
        assert.ok(Array.isArray(result.supportingEvidence));
        assert.ok(Array.isArray(result.missingEvidence));
        assert.ok(Array.isArray(result.requiredVerification));
        assert.ok(Array.isArray(result.potentialConsequences));
        assert.equal(typeof result.confidence, "number");

    }
);

runTest(
    "multiple hypotheses are returned",
    () => {

        const result =
            ExpertReasoningEngine.analyze({
                finding: {
                    summary: "Water stain and moisture around a crack"
                },
                measurements: [
                    {
                        name: "Humidity",
                        value: 81
                    }
                ]
            });

        assert.ok(result.alternativeHypotheses.length >= 2);

    }
);

runTest(
    "confidence stays within range",
    () => {

        const result =
            ExpertReasoningEngine.analyze({
                finding: {
                    summary: "Moisture stain with supporting measurements"
                },
                building: {
                    type: "Condominium"
                },
                measurements: [
                    {
                        name: "Humidity",
                        value: 79
                    },
                    {
                        name: "Surface temperature",
                        value: 24
                    }
                ]
            });

        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 100);

    }
);

console.log(
    "ExpertReasoningEngine tests completed successfully."
);