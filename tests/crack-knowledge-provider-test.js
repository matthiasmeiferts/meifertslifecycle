import assert from "node:assert/strict";

import CrackKnowledgeProvider from "../portal/core/knowledge/CrackKnowledgeProvider.js";
import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../portal/core/risk/RiskRelevanceGovernanceRegistry.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function causes(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

runTest(
    "stable contract",
    () => {
        const result =
            CrackKnowledgeProvider.getKnowledge({
                finding: {
                    category: "crack",
                    location: "Facade",
                    description: "Diagonal crack near a window opening",
                    observations: ["stair step line"]
                },
                building: {
                    constructionYear: 2004,
                    constructionType: "apartment",
                    numberOfStoreys: 5,
                    basementPresent: false
                },
                measurements: []
            });

        assert.equal(result.domain, "crack");
        assert.ok(Array.isArray(result.hypotheses));
        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => {
            return typeof hypothesis.id === "string" &&
                typeof hypothesis.cause === "string" &&
                typeof hypothesis.classification === "string" &&
                typeof hypothesis.structuralRelevance === "string" &&
                Array.isArray(hypothesis.supportingIndicators) &&
                Array.isArray(hypothesis.contradictingIndicators) &&
                Array.isArray(hypothesis.requiredVerification) &&
                Array.isArray(hypothesis.potentialConsequences) &&
                Array.isArray(hypothesis.recommendedActions) &&
                typeof hypothesis.riskRelevance === "string" &&
                hypothesis.riskRelevanceVersion === RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION &&
                typeof hypothesis.capexRelevance === "string" &&
                typeof hypothesis.valuationRelevance === "string";
        }));
    }
);

runTest(
    "diagonal crack near an opening includes opening-related and settlement hypotheses",
    () => {
        const result =
            CrackKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Window opening",
                    description: "Diagonal crack from the corner of the opening",
                    observations: ["step crack", "widening line"]
                },
                building: {
                    numberOfStoreys: 4,
                    basementPresent: false
                }
            });

        const allCauses = causes(result);

        assert.ok(allCauses.includes("lintel or opening-related movement"));
        assert.ok(allCauses.includes("differential settlement") || allCauses.includes("foundation movement"));
    }
);

runTest(
    "horizontal crack includes relevant movement hypotheses",
    () => {
        const result =
            CrackKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Interior wall",
                    description: "Horizontal crack across the wall",
                    observations: ["movement along joint"]
                },
                building: {
                    constructionType: "apartment"
                }
            });

        const allCauses = causes(result);

        assert.ok(allCauses.includes("thermal movement"));
        assert.ok(allCauses.includes("connection or joint failure") || allCauses.includes("masonry movement"));
    }
);

runTest(
    "fine surface crack includes cosmetic or non-structural hypotheses",
    () => {
        const result =
            CrackKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Plaster finish",
                    description: "Fine surface crack in the render",
                    observations: ["hairline crack"]
                },
                building: {
                    constructionType: "apartment"
                }
            });

        const allCauses = causes(result);

        assert.ok(allCauses.includes("drying shrinkage") || allCauses.includes("plaster or render movement"));
        assert.ok(allCauses.includes("plaster or render movement") || allCauses.includes("drying shrinkage"));
    }
);

runTest(
    "concrete crack with corrosion indicators includes corrosion-induced hypothesis",
    () => {
        const result =
            CrackKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Concrete column",
                    description: "Crack with rust staining and spalling",
                    observations: ["corrosion", "reinforcement"]
                },
                building: {
                    constructionType: "reinforced concrete"
                },
                measurements: [
                    {
                        type: "surface note",
                        value: "rust"
                    }
                ]
            });

        assert.ok(causes(result).includes("corrosion-induced concrete cracking"));
    }
);

runTest(
    "recurring or widening crack includes structural assessment requirement",
    () => {
        const result =
            CrackKnowledgeProvider.getKnowledge({
                finding: {
                    location: "Load-bearing wall",
                    description: "Recurring widening crack",
                    observations: ["widening", "recurring"]
                },
                building: {
                    numberOfStoreys: 8,
                    basementPresent: true
                }
            });

        assert.ok(causes(result).includes("potentially load-bearing structural distress") || causes(result).includes("foundation movement"));
        assert.ok(result.hypotheses.some((hypothesis) => /structural assessment required/i.test(hypothesis.classification)));
    }
);

runTest(
    "unknown input returns stable empty contract",
    () => {
        const result1 = CrackKnowledgeProvider.getKnowledge();
        const result2 = CrackKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "crack",
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
                location: "Facade",
                description: "Diagonal crack near a window opening",
                observations: ["widening line"]
            },
            building: {
                numberOfStoreys: 5,
                basementPresent: false
            }
        };

        const result1 = CrackKnowledgeProvider.getKnowledge(input);
        const result2 = CrackKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "Facade",
                description: "Diagonal crack near opening",
                observations: ["widening"]
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
                    value: 1.2,
                    unit: "mm",
                    location: "opening"
                }
            ]
        };

        const original = structuredClone(input);

        CrackKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "every returned hypothesis includes verification steps",
    () => {
        const result = CrackKnowledgeProvider.getKnowledge({
            finding: {
                location: "Facade",
                description: "Diagonal crack near an opening"
            },
            building: {
                basementPresent: false
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no hypothesis is presented as a confirmed diagnosis",
    () => {
        const result = CrackKnowledgeProvider.getKnowledge({
            finding: {
                location: "Facade",
                description: "Diagonal crack near an opening"
            },
            building: {
                basementPresent: false
            }
        });

        assert.ok(result.hypotheses.every((hypothesis) => {
            return /confirmed|diagnosis/i.test(hypothesis.cause) === false;
        }));
    }
);

console.log(
    "CrackKnowledgeProvider tests completed successfully."
);
