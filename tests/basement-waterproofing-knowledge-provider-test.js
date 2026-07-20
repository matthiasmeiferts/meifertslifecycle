import assert from "node:assert/strict";

import BasementWaterproofingKnowledgeProvider from "../portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js";
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

function ids(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.id);
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
    "basement wall moisture includes defective external waterproofing or lateral penetration hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "Recurring damp patches at below-grade retaining wall",
                observations: ["seepage marks", "wall dampness"]
            },
            building: {
                basementType: "full basement",
                waterproofingType: "bituminous membrane",
                foundationType: "strip foundation"
            }
        });

        const allCauses = causes(result);

        assert.ok(
            allCauses.includes("defective external basement waterproofing") ||
            allCauses.includes("lateral moisture penetration")
        );
        assert.ok(result.hypotheses.every((hypothesis) => hypothesis.riskRelevanceVersion === RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION));
    }
);

runTest(
    "moisture at wall-floor junction includes wall-floor junction hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "basement wall-floor junction",
                description: "Dampness and seepage at wall slab joint",
                observations: ["wet wall-floor line"]
            },
            building: {
                basementType: "partial basement"
            }
        });

        assert.ok(causes(result).includes("defective wall-floor junction"));
    }
);

runTest(
    "moisture around pipe penetration includes service penetration sealing hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "basement service penetration",
                description: "Wetness around pipe penetration sleeve",
                observations: ["seepage around pipe"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(causes(result).includes("defective service penetration sealing"));
    }
);

runTest(
    "blocked drainage indicators include blocked or ineffective drainage hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "drainage",
                location: "perimeter drainage near foundation",
                description: "Blocked drain with overflow and slow discharge",
                observations: ["clogged drain", "silted outlet"]
            },
            building: {
                siteConditions: "water accumulates near basement wall after rain"
            }
        });

        assert.ok(causes(result).includes("blocked or ineffective drainage"));
    }
);

runTest(
    "groundwater or water-pressure wording includes hydrostatic pressure hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "water ingress",
                location: "below-grade wall",
                description: "Groundwater water pressure at basement envelope",
                observations: ["hydrostatic pressure noted"]
            },
            building: {
                siteConditions: "high groundwater"
            }
        });

        assert.ok(causes(result).includes("hydrostatic water pressure"));
    }
);

runTest(
    "lower wall moisture may include rising damp but remains explicitly unconfirmed",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "lower masonry wall in basement",
                description: "Persistent dampness and moisture near wall base in brick masonry",
                observations: ["masonry damp", "possible rising moisture"]
            },
            building: {
                basementType: "full basement"
            }
        });

        const text = hypothesisText(result);

        assert.ok(causes(result).includes("rising damp in masonry"));
        assert.equal(/confirmed/i.test(text), false);
        assert.equal(/fact/i.test(text), false);
    }
);

runTest(
    "salt efflorescence includes salt contamination hypothesis without proving moisture source",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "basement moisture",
                location: "basement wall",
                description: "Salt efflorescence and crystalline deposits on damp plaster",
                observations: ["salt bloom"]
            },
            building: {
                basementType: "full basement"
            }
        });

        const allCauses = causes(result);
        const allText = hypothesisText(result);

        assert.ok(allCauses.includes("salt contamination and salt-related surface deterioration"));
        assert.ok(/not proof of one specific source/i.test(allText));
    }
);

runTest(
    "basement mould with cold surface indicators includes condensation hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "mould",
                location: "basement cold surface",
                description: "Surface mould and condensation at cold wall with high humidity",
                observations: ["insufficient ventilation", "cold bridge"]
            },
            building: {
                basementType: "full basement",
                constructionType: "masonry basement"
            }
        });

        const allCauses = causes(result);

        assert.ok(allCauses.includes("condensation on basement surfaces"));
        assert.equal(allCauses.includes("defective external basement waterproofing"), false);
    }
);

runTest(
    "crack with moisture includes moisture transport through cracks hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "basement retaining wall crack",
                description: "Seepage along visible crack",
                observations: ["wet crack line"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(causes(result).includes("moisture transport through cracks"));
    }
);

runTest(
    "basement floor moisture includes floor waterproofing hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "basement floor slab",
                description: "Wet basement floor with damp slab surface",
                observations: ["floor seepage"]
            },
            building: {
                basementType: "full basement",
                waterproofingType: "under-slab membrane"
            }
        });

        assert.ok(causes(result).includes("defective basement floor waterproofing"));
    }
);

runTest(
    "age-related waterproofing wording includes age-related deterioration hypothesis",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "waterproofing",
                location: "below-grade wall",
                description: "Age-related deterioration of old membrane",
                observations: ["weathered waterproofing"]
            },
            building: {
                constructionYear: 1978,
                basementType: "full basement",
                waterproofingType: "aged bituminous membrane"
            }
        });

        assert.ok(causes(result).includes("age-related waterproofing deterioration"));
    }
);

runTest(
    "unknown input returns stable empty contract",
    () => {
        const result1 = BasementWaterproofingKnowledgeProvider.getKnowledge();
        const result2 = BasementWaterproofingKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "basement-waterproofing",
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
                category: "moisture",
                location: "basement retaining wall",
                description: "Dampness with efflorescence and lateral ingress",
                observations: ["wet patch", "salt deposits"]
            },
            building: {
                basementType: "full basement",
                waterproofingType: "bituminous membrane",
                siteConditions: "poor drainage near foundation"
            },
            measurements: [
                {
                    type: "moisture meter",
                    value: "high",
                    unit: "qualitative",
                    location: "wall base"
                }
            ]
        };

        const result1 = BasementWaterproofingKnowledgeProvider.getKnowledge(input);
        const result2 = BasementWaterproofingKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement wall-floor junction",
                description: "Dampness at wall slab joint",
                observations: ["wet line"]
            },
            building: {
                constructionYear: 1984,
                constructionType: "masonry",
                basementType: "full basement",
                foundationType: "strip foundation",
                waterproofingType: "bituminous",
                siteConditions: "poor runoff"
            },
            measurements: [
                {
                    type: "humidity",
                    value: 82,
                    unit: "%",
                    location: "basement room"
                }
            ]
        };

        const original = structuredClone(input);

        BasementWaterproofingKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable hypothesis ordering",
    () => {
        const input = {
            finding: {
                category: "basement moisture",
                location: "basement wall-floor junction and crack",
                description: "Blocked drain, seepage at pipe penetration, salt efflorescence",
                observations: ["wet crack line", "clogged drain", "cold surface mould"]
            },
            building: {
                basementType: "full basement",
                waterproofingType: "old membrane",
                siteConditions: "high groundwater and poor drainage"
            }
        };

        const first = BasementWaterproofingKnowledgeProvider.getKnowledge(input);
        const second = BasementWaterproofingKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(ids(first), ids(second));
    }
);

runTest(
    "every returned hypothesis includes requiredVerification",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "Damp wall with seepage and efflorescence"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no hypothesis is presented as confirmed damage",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "basement moisture",
                location: "below-grade wall",
                description: "Dampness and seepage near retaining wall",
                observations: ["wet patch"]
            },
            building: {
                basementType: "full basement",
                foundationType: "strip"
            }
        });

        const text = hypothesisText(result);

        assert.equal(/confirmed/i.test(text), false);
        assert.equal(/fact/i.test(text), false);
    }
);

runTest(
    "no visible symptom automatically confirms external waterproofing failure",
    () => {
        const result = BasementWaterproofingKnowledgeProvider.getKnowledge({
            finding: {
                category: "mould",
                location: "basement interior cold wall",
                description: "Visible mould at cold surface with high humidity",
                observations: ["condensation", "insufficient ventilation"]
            },
            building: {
                basementType: "full basement",
                constructionType: "masonry"
            }
        });

        const allCauses = causes(result);

        assert.ok(allCauses.includes("condensation on basement surfaces"));
        assert.equal(allCauses.includes("defective external basement waterproofing"), false);
    }
);

console.log("BasementWaterproofingKnowledgeProvider tests completed successfully.");
