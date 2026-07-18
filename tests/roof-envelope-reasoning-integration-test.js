import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import KnowledgeDomainRouter from "../portal/core/reasoning/KnowledgeDomainRouter.js";

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

function assertHypothetical(result) {
    const hypotheses = [
        result.primaryHypothesis,
        ...result.alternativeHypotheses
    ];

    assert.ok(hypotheses.every((hypothesis) => /confirmed|diagnosis/i.test(JSON.stringify(hypothesis)) === false));
}

runTest(
    "roof penetration moisture produces a flashing or penetration hypothesis",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "Moisture around a vent stack after rainfall",
                observations: ["staining near flashing"]
            },
            building: {
                constructionType: "apartment",
                roofType: "flat roof"
            },
            measurements: [
                {
                    type: "moisture note",
                    value: "active"
                }
            ]
        };

        const original = structuredClone(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.ok(allCauses(result).includes("failed flashing or penetration detail"));
        assert.ok(result.primaryHypothesis.classification);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assert.ok(Array.isArray(result.requiredVerification) && result.requiredVerification.length > 0);
        assertHypothetical(result);
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "flat-roof ponding produces drainage or waterproofing hypotheses",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "flat roof",
                description: "Standing water and ponding on the membrane",
                observations: ["wet patches after rain"]
            },
            building: {
                roofType: "flat roof"
            }
        });

        const causes = allCauses(result);

        assert.ok(causes.includes("defective flat-roof waterproofing"));
        assert.ok(causes.includes("defective roof drainage"));
        assert.ok(result.primaryHypothesis.classification);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assert.ok(result.primaryHypothesis.requiredVerification.length > 0);
        assertHypothetical(result);
    }
);

runTest(
    "facade joint moisture produces a joint or sealant hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "facade joint",
                description: "Moisture along a sealant line",
                observations: ["joint staining"]
            },
            building: {
                constructionType: "residential"
            }
        });

        assert.ok(allCauses(result).includes("facade joint or sealant failure"));
        assert.ok(result.primaryHypothesis.classification);
        assert.ok(Array.isArray(result.supportingEvidence));
        assert.ok(Array.isArray(result.missingEvidence));
        assert.ok(Array.isArray(result.requiredVerification) && result.requiredVerification.length > 0);
        assertHypothetical(result);
    }
);

runTest(
    "window connection moisture produces a connection-defect hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "window reveal",
                description: "Dampness at the frame connection",
                observations: ["threshold staining"]
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.ok(allCauses(result).includes("defective window or door connection"));
        assert.ok(result.primaryHypothesis.classification);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assert.ok(Array.isArray(result.requiredVerification) && result.requiredVerification.length > 0);
        assertHypothetical(result);
    }
);

runTest(
    "balcony or terrace leakage produces a waterproofing hypothesis",
    () => {
        const input = {
            finding: {
                location: "terrace",
                description: "Leakage below the balcony edge",
                observations: ["wet finish below platform"]
            },
            building: {
                constructionType: "mixed use"
            }
        };

        const result = ExpertReasoningEngine.analyze({
            ...input
        });

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["balconies-terraces", "roof-envelope", "moisture"]);
        assert.ok(allCauses(result).includes("defective terrace waterproofing"));
        assert.ok(result.primaryHypothesis.classification);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assert.ok(result.primaryHypothesis.requiredVerification.length > 0);
        assertHypothetical(result);
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "Moisture around a flashing detail",
                observations: ["staining"]
            },
            building: {
                constructionYear: 2010,
                constructionType: "mixed use",
                roofType: "flat roof"
            }
        };

        const original = structuredClone(input);
        const result1 = ExpertReasoningEngine.analyze(input);
        const result2 = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(result1, result2);
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "moisture behavior unchanged",
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
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "crack behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
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
        });

        assert.ok([
            "lintel or opening-related movement",
            "differential settlement",
            "foundation movement"
        ].includes(result.primaryHypothesis.cause));
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "unknown roof-envelope input returns a stable existing contract",
    () => {
        const unknown1 = ExpertReasoningEngine.analyze({
            finding: {
                location: "roof envelope"
            }
        });
        const unknown2 = ExpertReasoningEngine.analyze({
            finding: {
                location: "roof envelope"
            }
        });

        assert.deepStrictEqual(unknown1, unknown2);
        assert.ok(unknown1.primaryHypothesis);
        assert.ok(Array.isArray(unknown1.alternativeHypotheses));
        assert.ok(Array.isArray(unknown1.supportingEvidence));
        assert.ok(Array.isArray(unknown1.missingEvidence));
        assert.ok(Array.isArray(unknown1.requiredVerification));
        assert.ok(Array.isArray(unknown1.potentialConsequences));
        assert.equal(typeof unknown1.confidence, "number");
    }
);

console.log("Roof-envelope reasoning integration test completed successfully.");
