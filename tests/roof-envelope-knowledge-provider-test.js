import assert from "node:assert/strict";

import RoofEnvelopeKnowledgeProvider from "../portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js";
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

function causeList(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

runTest(
    "stable contract",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "Moisture around a vent stack",
                observations: ["staining near the flashing"]
            },
            building: {
                constructionType: "apartment",
                roofType: "flat roof"
            },
            measurements: []
        });

        assert.equal(result.domain, "roof-envelope");
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
        assert.ok(["medium", "high"].includes(result.hypotheses[0].riskRelevance));
        assert.equal(typeof result.hypotheses[0].capexRelevance, "string");
        assert.equal(typeof result.hypotheses[0].valuationRelevance, "string");
    }
);

runTest(
    "risk relevance source version is emitted next to every roof envelope risk relevance value",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "flat roof and gutter",
                description: "Standing water on flat roof membrane with blocked gutter overflow",
                observations: ["ponding", "debris in downpipe"]
            },
            building: {
                roofType: "flat roof"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        result.hypotheses.forEach((hypothesis) => {
            assert.equal(typeof hypothesis.riskRelevance, "string");
            assert.equal(hypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
            assert.ok(["medium", "high"].includes(hypothesis.riskRelevance));
        });
    }
);

runTest(
    "roof penetration moisture",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "roof penetration",
                description: "Moisture around a pipe penetration after rainfall",
                observations: ["flashing line", "water entry"]
            },
            building: {
                roofType: "pitched roof"
            }
        });

        const causes = causeList(result);

        assert.ok(causes.includes("failed flashing or penetration detail"));
    }
);

runTest(
    "flat-roof ponding",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "flat roof",
                description: "Standing water and ponding on the membrane",
                observations: ["wet patches after rain"]
            },
            building: {
                roofType: "flat roof"
            }
        });

        const causes = causeList(result);

        assert.ok(causes.includes("defective flat-roof waterproofing"));
        assert.ok(causes.includes("defective roof drainage"));
    }
);

runTest(
    "facade joint moisture",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "facade joint",
                description: "Moisture along a sealant line",
                observations: ["joint staining"]
            },
            building: {
                constructionType: "residential"
            }
        });

        const causes = causeList(result);

        assert.ok(causes.includes("facade joint or sealant failure"));
    }
);

runTest(
    "window connection moisture",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "window reveal",
                description: "Dampness at the frame connection",
                observations: ["threshold staining"]
            },
            building: {
                constructionType: "apartment"
            }
        });

        const causes = causeList(result);

        assert.ok(causes.includes("defective window or door connection"));
    }
);

runTest(
    "balcony or terrace leakage",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "terrace",
                description: "Leakage below the balcony edge",
                observations: ["wet finish below platform"]
            },
            building: {
                constructionType: "mixed use"
            }
        });

        const causes = causeList(result);

        assert.ok(causes.includes("failed balcony or terrace waterproofing"));
    }
);

runTest(
    "blocked gutter indicators",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "gutter and downpipe",
                description: "Blocked gutter overflow with debris in the downpipe",
                observations: ["overflow below the gutter line"]
            },
            building: {
                roofType: "pitched roof"
            }
        });

        const causes = causeList(result);

        assert.ok(causes.includes("blocked gutter or downpipe"));
        assert.ok(causes.includes("defective roof drainage"));
    }
);

runTest(
    "unknown input returns stable empty contract",
    () => {
        const result1 = RoofEnvelopeKnowledgeProvider.getKnowledge();
        const result2 = RoofEnvelopeKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "roof-envelope",
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
                location: "roof penetration",
                description: "Moisture around a flashing detail",
                observations: ["staining"]
            },
            building: {
                roofType: "flat roof"
            }
        };

        const result1 = RoofEnvelopeKnowledgeProvider.getKnowledge(input);
        const result2 = RoofEnvelopeKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "balcony",
                description: "Leakage at the edge detail",
                observations: ["wet soffit"]
            },
            building: {
                constructionYear: 2008,
                constructionType: "apartment",
                roofType: "terrace"
            },
            measurements: [
                {
                    type: "moisture note",
                    value: "present"
                }
            ]
        };

        const original = structuredClone(input);

        RoofEnvelopeKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "verification steps exist",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "flat roof",
                description: "Standing water on the roof membrane"
            },
            building: {
                roofType: "flat roof"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no confirmed diagnosis wording",
    () => {
        const result = RoofEnvelopeKnowledgeProvider.getKnowledge({
            finding: {
                location: "facade joint",
                description: "Moisture at a sealant line"
            },
            building: {
                constructionType: "residential"
            }
        });

        assert.ok(result.hypotheses.every((hypothesis) => {
            const text = [
                hypothesis.cause,
                hypothesis.classification,
                ...hypothesis.potentialConsequences,
                ...hypothesis.recommendedActions
            ].join(" ");

            return /confirmed|diagnosis/i.test(text) === false;
        }));
    }
);

console.log("RoofEnvelopeKnowledgeProvider tests completed successfully.");
