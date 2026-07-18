import assert from "node:assert/strict";

import BalconiesTerracesKnowledgeProvider from "../portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js";

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
    "balcony waterproofing defect",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "balcony slab",
                description: "balcony waterproofing defect and leakage",
                observations: ["waterproofing failure"]
            },
            building: {
                balconyType: "cantilever"
            }
        });

        assert.ok(causes(result).includes("defective balcony waterproofing"));
    }
);

runTest(
    "terrace waterproofing defect",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "terrace",
                location: "roof terrace",
                description: "terrace waterproofing defect with leakage",
                observations: ["membrane issue"]
            },
            building: {
                terraceType: "roof terrace"
            }
        });

        assert.ok(causes(result).includes("defective terrace waterproofing"));
    }
);

runTest(
    "blocked drainage outlet",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "terrace",
                location: "drain",
                description: "blocked drainage outlet with overflow",
                observations: ["outlet blockage"]
            }
        });

        assert.ok(causes(result).includes("blocked drainage outlet"));
    }
);

runTest(
    "standing water",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "balcony slab",
                description: "standing water on balcony surface after rain",
                observations: ["ponding"]
            }
        });

        assert.ok(causes(result).includes("insufficient drainage"));
    }
);

runTest(
    "inadequate slope wording",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "terrace",
                location: "terrace surface",
                description: "inadequate slope causes poor runoff",
                observations: ["no fall"]
            }
        });

        assert.ok(causes(result).includes("inadequate surface slope"));
    }
);

runTest(
    "wall connection defect",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "wall junction",
                description: "wall connection defect with leakage at upstand",
                observations: ["staining at wall connection"]
            }
        });

        assert.ok(causes(result).includes("failed wall connection waterproofing"));
    }
);

runTest(
    "door threshold leakage",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "door threshold",
                description: "door threshold leakage into the opening",
                observations: ["sill wetting"]
            }
        });

        assert.ok(causes(result).includes("failed door threshold waterproofing"));
    }
);

runTest(
    "hollow-sounding tiles",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "terrace",
                location: "tile finish",
                description: "hollow-sounding tiles on the terrace",
                observations: ["drummy sound"]
            }
        });

        assert.ok(causes(result).includes("hollow-sounding tiles"));
    }
);

runTest(
    "tile debonding",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "tile finish",
                description: "tile debonding and lifted edge",
                observations: ["loose tile"]
            }
        });

        assert.ok(causes(result).includes("tile debonding"));
    }
);

runTest(
    "frost deterioration",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "frost deterioration and freeze-thaw damage",
                observations: ["winter weathering"]
            }
        });

        assert.ok(causes(result).includes("frost-related deterioration"));
    }
);

runTest(
    "balcony slab corrosion",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony slab",
                location: "slab edge",
                description: "balcony slab corrosion with rust staining",
                observations: ["concrete cover loss"]
            }
        });

        assert.ok(causes(result).includes("reinforcement corrosion at balcony slab"));
    }
);

runTest(
    "concrete spalling",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony slab",
                location: "slab edge",
                description: "concrete spalling at balcony edge",
                observations: ["spalled concrete"]
            }
        });

        assert.ok(causes(result).includes("concrete spalling"));
    }
);

runTest(
    "railing anchor deterioration",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "railing",
                location: "railing anchor",
                description: "railing anchor deterioration and corrosion",
                observations: ["balustrade fixing corrosion"]
            }
        });

        assert.ok(causes(result).includes("railing anchorage deterioration"));
    }
);

runTest(
    "movement joint defect",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "movement joint",
                description: "movement joint defect with opening",
                observations: ["joint failure"]
            }
        });

        assert.ok(causes(result).includes("movement joint defect"));
    }
);

runTest(
    "thermal bridge wording",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "balcony connection",
                description: "thermal bridge at balcony connection",
                observations: ["cold surface"]
            }
        });

        assert.ok(causes(result).includes("thermal bridge at balcony connection"));
    }
);

runTest(
    "occupied-space leakage",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "water penetration into occupied space below the balcony",
                observations: ["interior staining"]
            }
        });

        assert.ok(causes(result).includes("water penetration into occupied space"));
    }
);

runTest(
    "workmanship wording",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "terrace",
                location: "tile edge",
                description: "workmanship defect and poor installation detail",
                observations: ["incorrect detailing"]
            }
        });

        assert.ok(causes(result).includes("workmanship defect"));
    }
);

runTest(
    "unknown input",
    () => {
        const result1 = BalconiesTerracesKnowledgeProvider.getKnowledge();
        const result2 = BalconiesTerracesKnowledgeProvider.getKnowledge({});

        assert.deepStrictEqual(result1, {
            domain: "balconies-terraces",
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
                category: "balcony",
                location: "balcony slab and threshold",
                description: "standing water and door threshold leakage",
                observations: ["wet surface", "sill wetting"]
            },
            building: {
                balconyType: "cantilever",
                waterproofingType: "membrane"
            }
        };

        const result1 = BalconiesTerracesKnowledgeProvider.getKnowledge(input);
        const result2 = BalconiesTerracesKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "terrace",
                location: "terrace slab",
                description: "tile debonding and hollow sounding tiles",
                observations: ["loose tile", "drummy sound"]
            },
            building: {
                constructionYear: 2014,
                balconyType: "loggia",
                terraceType: "roof terrace",
                waterproofingType: "membrane",
                railingType: "steel",
                structuralSystem: "reinforced concrete"
            },
            measurements: [
                {
                    type: "note",
                    value: "standing water",
                    unit: "qualitative",
                    location: "slab surface"
                }
            ]
        };

        const original = structuredClone(input);

        BalconiesTerracesKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable ordering",
    () => {
        const input = {
            finding: {
                category: "balcony",
                location: "balcony slab edge and threshold",
                description: "standing water, tile debonding, and door threshold leakage",
                observations: ["ponding", "loose tile", "sill wetting"]
            },
            building: {
                balconyType: "cantilever",
                terraceType: "terrace"
            }
        };

        const first = BalconiesTerracesKnowledgeProvider.getKnowledge(input);
        const second = BalconiesTerracesKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(ids(first), ids(second));
    }
);

runTest(
    "requiredVerification always present",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "balcony waterproofing defect"
            },
            building: {
                balconyType: "cantilever"
            }
        });

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "no confirmed diagnosis wording",
    () => {
        const result = BalconiesTerracesKnowledgeProvider.getKnowledge({
            finding: {
                category: "terrace",
                location: "terrace surface",
                description: "hollow-sounding tiles and standing water",
                observations: ["drummy sound"]
            }
        });

        const text = hypothesisText(result);

        assert.equal(/confirmed/i.test(text), false);
        assert.equal(/diagnosis/i.test(text), false);
    }
);

console.log("BalconiesTerracesKnowledgeProvider tests completed successfully.");
