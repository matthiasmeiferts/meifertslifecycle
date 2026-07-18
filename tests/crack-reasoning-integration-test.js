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

function allCauses(result) {
    return [
        result.primaryHypothesis.cause,
        ...result.alternativeHypotheses.map((hypothesis) => hypothesis.cause)
    ];
}

runTest(
    "diagonal crack near opening produces a relevant primary hypothesis",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "Window opening",
                description: "Diagonal crack from the corner of the opening",
                observations: ["step crack", "widening line"]
            },
            building: {
                constructionYear: 2004,
                constructionType: "apartment",
                numberOfStoreys: 5,
                basementPresent: false
            },
            measurements: [
                {
                    type: "crack width",
                    value: 0.6,
                    unit: "mm",
                    location: "opening corner"
                }
            ]
        };

        const result = ExpertReasoningEngine.analyze(input);

        assert.ok(result.primaryHypothesis);
        assert.ok(
            [
                "lintel or opening-related movement",
                "differential settlement",
                "foundation movement"
            ].includes(result.primaryHypothesis.cause)
        );
        assert.ok(result.alternativeHypotheses.length > 0);
        assert.ok(result.primaryHypothesis.classification);
        assert.ok(result.primaryHypothesis.structuralRelevance);
        assert.ok(result.primaryHypothesis.requiredVerification.length > 0);
        assert.ok(result.primaryHypothesis.potentialConsequences.length > 0);
        assert.ok(result.primaryHypothesis.status === "hypothesis");
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "potentially structural cracks require specialist verification",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "crack",
                location: "Load-bearing wall",
                description: "Recurring widening crack with displacement",
                observations: ["widening", "recurring"]
            },
            building: {
                constructionType: "apartment",
                numberOfStoreys: 7,
                basementPresent: true
            }
        });

        const allHypotheses = [
            result.primaryHypothesis,
            ...result.alternativeHypotheses
        ];

        assert.ok(allHypotheses.some((hypothesis) => /structural assessment required/i.test(hypothesis.classification) || /potentially structural/i.test(hypothesis.classification)));
        assert.ok(result.requiredVerification.some((step) => /specialist structural verification/i.test(step)));
        assert.ok(allHypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
        assert.ok(allHypotheses.every((hypothesis) => /confirmed|diagnosis/i.test(hypothesis.cause) === false));
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "Facade",
                description: "Diagonal crack near a window opening",
                observations: ["widening line"]
            },
            building: {
                constructionYear: 2010,
                constructionType: "mixed use",
                numberOfStoreys: 6,
                basementPresent: false
            }
        };

        const original = structuredClone(input);

        const result1 = ExpertReasoningEngine.analyze(input);
        const result2 = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(result1, result2);
        assert.deepStrictEqual(input, original);
        assert.ok(result1.confidence >= 0);
        assert.ok(result1.confidence <= 1);
    }
);

runTest(
    "moisture behavior remains unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
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
            }
        });

        assert.equal(result.primaryHypothesis.cause, "rising damp");
        assert.ok(allCauses(result).includes("rising damp"));
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "non-crack behavior remains unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
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
        assert.equal(result.alternativeHypotheses.length, 3);
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 100);
    }
);

runTest(
    "unknown crack input returns the stable existing contract",
    () => {
        const unknownCrack = ExpertReasoningEngine.analyze({
            finding: {
                category: "crack"
            }
        });

        const stableExistingContract = ExpertReasoningEngine.analyze();

        assert.deepStrictEqual(unknownCrack, stableExistingContract);
    }
);

console.log(
    "CrackReasoningEngine integration test completed successfully."
);
