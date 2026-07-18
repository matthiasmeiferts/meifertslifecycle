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
    "basement wall moisture produces a primary moisture hypothesis",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "Basement wall",
                description: "Damp staining at the lower wall",
                observations: ["base of wall", "salt tide marks"]
            },
            building: {
                constructionYear: 1998,
                constructionType: "apartment",
                basementPresent: true
            },
            measurements: []
        };

        const result =
            ExpertReasoningEngine.analyze(input);

        assert.ok(result.primaryHypothesis);
        assert.equal(result.primaryHypothesis.cause, "rising damp");
        assert.ok(Array.isArray(result.alternativeHypotheses));
        assert.ok(result.alternativeHypotheses.length > 0);
        assert.ok(Array.isArray(result.supportingEvidence));
        assert.ok(result.supportingEvidence.length > 0);
        assert.ok(Array.isArray(result.missingEvidence));
        assert.ok(Array.isArray(result.requiredVerification));
        assert.ok(result.requiredVerification.length > 0);
        assert.ok(Array.isArray(result.potentialConsequences));
        assert.ok(result.potentialConsequences.length > 0);
        assert.ok(/confirmed/i.test(result.primaryHypothesis.cause) === false);
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "indoor and plumbing moisture support the relevant hypotheses",
    () => {
        const indoorInput = {
            finding: {
                category: "moisture",
                location: "Interior wall",
                description: "Moisture on the indoor surface",
                observations: ["cold corner", "condensation"]
            },
            building: {
                constructionType: "apartment",
                basementPresent: false
            }
        };

        const plumbingInput = {
            finding: {
                category: "moisture",
                location: "Kitchen wall beside sink",
                description: "Localized moisture around pipe chase",
                observations: ["fixture area", "drip pattern"]
            },
            building: {
                constructionType: "apartment",
                basementPresent: false
            }
        };

        const indoorResult =
            ExpertReasoningEngine.analyze(indoorInput);

        const plumbingResult =
            ExpertReasoningEngine.analyze(plumbingInput);

        const indoorCauses = [
            indoorResult.primaryHypothesis.cause,
            ...indoorResult.alternativeHypotheses.map((hypothesis) => hypothesis.cause)
        ];

        const plumbingCauses = [
            plumbingResult.primaryHypothesis.cause,
            ...plumbingResult.alternativeHypotheses.map((hypothesis) => hypothesis.cause)
        ];

        assert.ok(indoorCauses.includes("condensation"));
        assert.ok(indoorCauses.includes("insufficient ventilation"));
        assert.ok(indoorCauses.includes("thermal bridge"));
        assert.ok(indoorResult.primaryHypothesis.supportingIndicators.length > 0);
        assert.ok(indoorResult.primaryHypothesis.requiredVerification.length > 0);
        assert.ok(indoorResult.primaryHypothesis.potentialConsequences.length > 0);
        assert.ok(plumbingCauses.includes("plumbing leakage"));
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "Roof facade junction",
                description: "Moisture at the connection detail",
                observations: ["penetration edge"]
            },
            building: {
                constructionYear: 2010,
                constructionType: "mixed use",
                basementPresent: false
            }
        };

        const original =
            structuredClone(input);

        const result1 =
            ExpertReasoningEngine.analyze(input);
        const result2 =
            ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(result1, result2);
        assert.deepStrictEqual(input, original);
        assert.ok(result1.confidence >= 0);
        assert.ok(result1.confidence <= 1);
    }
);

runTest(
    "unknown moisture input returns the stable existing contract",
    () => {
        const unknownMoisture =
            ExpertReasoningEngine.analyze({
                finding: {
                    category: "moisture"
                }
            });

        const stableExistingContract =
            ExpertReasoningEngine.analyze();

        assert.deepStrictEqual(
            unknownMoisture,
            stableExistingContract
        );
    }
);

runTest(
    "non-moisture behavior remains unchanged",
    () => {
        const result =
            ExpertReasoningEngine.analyze({
                finding: {
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
            });

        assert.equal(
            result.primaryHypothesis.label,
            "Movement or cracking of the building fabric"
        );

        assert.equal(
            result.alternativeHypotheses.length,
            3
        );

        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 100);
    }
);

console.log(
    "Moisture reasoning integration test completed successfully."
);
