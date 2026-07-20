import assert from "node:assert/strict";

import ConcreteCorrosionKnowledgeProvider from "../portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js";
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

function hypothesisText(result) {
    return result.hypotheses.flatMap((hypothesis) => [
        hypothesis.cause,
        hypothesis.classification,
        ...hypothesis.supportingIndicators,
        ...hypothesis.contradictingIndicators,
        ...hypothesis.requiredVerification,
        ...hypothesis.potentialConsequences,
        ...hypothesis.recommendedActions
    ]).join(" ");
}

runTest(
    "stable contract",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                category: "corrosion",
                location: "Concrete column",
                description: "Rust staining around exposed reinforcement",
                observations: ["spalling", "exposed rebar"]
            },
            building: {
                constructionYear: 1992,
                constructionType: "reinforced concrete",
                exposureClass: "coastal",
                numberOfStoreys: 6
            },
            measurements: []
        });

        assert.equal(result.domain, "concrete-corrosion");
        assert.ok(Array.isArray(result.hypotheses));
        assert.ok(result.hypotheses.length > 0);
        assert.equal(typeof result.hypotheses[0].id, "string");
        assert.equal(typeof result.hypotheses[0].cause, "string");
        assert.equal(typeof result.hypotheses[0].classification, "string");
        assert.ok(Array.isArray(result.hypotheses[0].supportingIndicators));
        assert.ok(Array.isArray(result.hypotheses[0].contradictingIndicators));
        assert.ok(Array.isArray(result.hypotheses[0].requiredVerification));
        assert.ok(Array.isArray(result.hypotheses[0].potentialConsequences));
        assert.ok(Array.isArray(result.hypotheses[0].recommendedActions));
        assert.equal(typeof result.hypotheses[0].riskRelevance, "string");
        assert.equal(result.hypotheses[0].riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(typeof result.hypotheses[0].capexRelevance, "string");
        assert.equal(typeof result.hypotheses[0].valuationRelevance, "string");
    }
);

runTest(
    "exposed reinforcement includes reinforcement corrosion hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "beam soffit",
                description: "Exposed reinforcement with rust staining",
                observations: ["rebar visible", "spalling"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(causes(result).includes("reinforcement corrosion"));
    }
);

runTest(
    "rust staining includes corrosion hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "concrete facade",
                description: "Rust staining and cracking",
                observations: ["corroded steel"]
            },
            building: {
                exposureClass: "coastal"
            }
        });

        assert.ok(causes(result).includes("reinforcement corrosion") || causes(result).includes("chloride-induced corrosion") || causes(result).includes("carbonation-induced corrosion"));
    }
);

runTest(
    "concrete spalling includes concrete deterioration hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "column",
                description: "Concrete spalling at the edge",
                observations: ["broken concrete"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(causes(result).includes("concrete spalling"));
    }
);

runTest(
    "hollow sounding concrete includes delamination hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "slab",
                description: "Hollow sounding concrete near the joint",
                observations: ["drummy sound"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(causes(result).includes("delamination or hollow-sounding concrete"));
    }
);

runTest(
    "moisture plus exposed reinforcement increases relevant hypotheses",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "balcony slab",
                description: "Moisture with exposed reinforcement and rust staining",
                observations: ["wet concrete", "rebar visible"]
            },
            building: {
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            }
        });

        const allCauses = causes(result);

        assert.ok(allCauses.includes("reinforcement corrosion"));
        assert.ok(allCauses.includes("moisture-accelerated deterioration"));
        assert.ok(allCauses.includes("chloride-induced corrosion") || allCauses.includes("carbonation-induced corrosion") || allCauses.includes("structural durability deficit"));
    }
);

runTest(
    "carbonation wording returns carbonation hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "concrete wall",
                description: "Carbonation-related corrosion at the cover",
                observations: ["carbonated cover"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(causes(result).includes("carbonation-induced corrosion"));
    }
);

runTest(
    "chloride wording returns chloride hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "seaside column",
                description: "Chloride ingress with rust staining",
                observations: ["salt exposure"]
            },
            building: {
                exposureClass: "coastal"
            }
        });

        assert.ok(causes(result).includes("chloride-induced corrosion"));
    }
);

runTest(
    "freeze-thaw wording returns freeze-thaw hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "external concrete edge",
                description: "Freeze-thaw deterioration with scaling",
                observations: ["frost damage"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(causes(result).includes("freeze-thaw deterioration"));
    }
);

runTest(
    "ASR wording returns alkali-silica hypothesis",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "wall panel",
                description: "ASR map cracking and expansion",
                observations: ["gel", "map cracking"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(causes(result).includes("alkali-silica reaction"));
    }
);

runTest(
    "unknown input returns stable empty contract",
    () => {
        const result1 = ConcreteCorrosionKnowledgeProvider.getKnowledge();
        const result2 = ConcreteCorrosionKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "concrete-corrosion",
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
                location: "column",
                description: "Rust staining with exposed reinforcement",
                observations: ["spalling"]
            },
            building: {
                constructionYear: 1992,
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            }
        };

        const result1 = ConcreteCorrosionKnowledgeProvider.getKnowledge(input);
        const result2 = ConcreteCorrosionKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "beam",
                description: "Spalling concrete with rust staining",
                observations: ["exposed reinforcement"]
            },
            building: {
                constructionYear: 1988,
                constructionType: "reinforced concrete",
                exposureClass: "coastal",
                numberOfStoreys: 8
            },
            measurements: [
                {
                    type: "surface note",
                    value: "hollow sounding"
                }
            ]
        };

        const original = structuredClone(input);

        ConcreteCorrosionKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "every hypothesis includes requiredVerification",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "column",
                description: "Rust staining and spalling"
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no hypothesis is presented as confirmed damage",
    () => {
        const result = ConcreteCorrosionKnowledgeProvider.getKnowledge({
            finding: {
                location: "wall",
                description: "Rust staining and cracking",
                observations: ["spalling"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(/confirmed/i.test(hypothesisText(result)) === false);
        assert.ok(/fact/i.test(hypothesisText(result)) === false);
    }
);

console.log("ConcreteCorrosionKnowledgeProvider tests completed successfully.");
