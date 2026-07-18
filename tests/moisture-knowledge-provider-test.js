import assert from "node:assert/strict";

import MoistureKnowledgeProvider from "../portal/core/knowledge/MoistureKnowledgeProvider.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function causeList(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

runTest(
    "stable contract",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    category: "moisture",
                    location: "basement wall",
                    description: "Damp staining",
                    observations: ["lower wall moisture"]
                },
                building: {
                    constructionYear: 1998,
                    constructionType: "apartment",
                    basementPresent: true
                },
                measurements: []
            });

        assert.equal(result.domain, "moisture");
        assert.ok(Array.isArray(result.hypotheses));
        assert.ok(result.hypotheses.length > 0);
        assert.equal(typeof result.hypotheses[0].id, "string");
        assert.equal(typeof result.hypotheses[0].cause, "string");
        assert.ok(Array.isArray(result.hypotheses[0].supportingIndicators));
        assert.ok(Array.isArray(result.hypotheses[0].contradictingIndicators));
        assert.ok(Array.isArray(result.hypotheses[0].requiredVerification));
        assert.ok(Array.isArray(result.hypotheses[0].potentialConsequences));
        assert.ok(Array.isArray(result.hypotheses[0].recommendedActions));
        assert.equal(typeof result.hypotheses[0].riskRelevance, "string");
        assert.equal(typeof result.hypotheses[0].capexRelevance, "string");
        assert.equal(typeof result.hypotheses[0].valuationRelevance, "string");
    }
);

runTest(
    "basement wall moisture returns relevant hypotheses",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Basement wall",
                    description: "Moisture at the lower wall",
                    observations: ["base staining"]
                },
                building: {
                    basementPresent: true,
                    constructionType: "residential"
                }
            });

        const causes = causeList(result);

        assert.ok(causes.includes("rising damp"));
    }
);

runTest(
    "indoor surface moisture includes condensation and ventilation hypotheses",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Interior wall",
                    description: "Surface moisture and recurring dampness",
                    observations: ["cold corner", "bathroom"]
                },
                building: {
                    constructionType: "apartment",
                    basementPresent: false
                }
            });

        const causes = causeList(result);

        assert.ok(causes.includes("condensation"));
        assert.ok(causes.includes("insufficient ventilation") || causes.includes("thermal bridge"));
    }
);

runTest(
    "localized moisture near plumbing includes leakage hypothesis",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Kitchen wall beside sink",
                    description: "Localized moisture around pipe chase",
                    observations: ["fixture area", "drip pattern"]
                },
                building: {
                    constructionType: "apartment"
                }
            });

        const causes = causeList(result);

        assert.ok(causes.includes("plumbing leakage"));
    }
);

runTest(
    "roof or facade junction moisture includes connection-defect hypothesis",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Roof facade junction",
                    description: "Moisture at connection detail",
                    observations: ["penetration edge"]
                },
                building: {
                    constructionType: "mixed use"
                }
            });

        const causes = causeList(result);

        assert.ok(causes.includes("defective roof or facade connection"));
    }
);

runTest(
    "unknown input returns stable empty contract",
    () => {
        const result1 =
            MoistureKnowledgeProvider.getKnowledge();
        const result2 =
            MoistureKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "moisture",
            hypotheses: []
        });

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "deterministic output",
    () => {
        const input = {
            finding: {
                location: "Bathroom wall",
                description: "Damp patch near a pipe",
                observations: ["localized moisture"]
            },
            building: {
                constructionType: "apartment",
                basementPresent: false
            }
        };

        const result1 =
            MoistureKnowledgeProvider.getKnowledge(input);
        const result2 =
            MoistureKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "Facade",
                description: "Moisture by the roof junction",
                observations: ["staining"]
            },
            building: {
                constructionYear: 2005,
                constructionType: "residential",
                basementPresent: false
            },
            measurements: [
                {
                    type: "humidity",
                    value: 78
                }
            ]
        };

        const original = structuredClone(input);

        MoistureKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "all returned hypotheses include verification steps",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Basement wall",
                    description: "Moisture at the base of the wall"
                },
                building: {
                    basementPresent: true
                }
            });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no hypothesis is presented as a confirmed cause",
    () => {
        const result =
            MoistureKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Interior wall",
                    description: "Damp surface",
                    observations: ["condensation"]
                },
                building: {
                    constructionType: "apartment"
                }
            });

        assert.ok(result.hypotheses.every((hypothesis) => /hypothesis/i.test(hypothesis.cause) === false));
    }
);

console.log(
    "MoistureKnowledgeProvider tests completed successfully."
);
