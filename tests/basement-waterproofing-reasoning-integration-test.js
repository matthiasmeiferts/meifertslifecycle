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

function allHypotheses(result) {
    return [
        result.primaryHypothesis,
        ...result.alternativeHypotheses
    ];
}

function assertHypothetical(result) {
    assert.ok(allHypotheses(result).every((hypothesis) => hypothesis.status === "hypothesis"));
    assert.ok(allHypotheses(result).every((hypothesis) => /confirmed|diagnosis|fact/i.test(JSON.stringify(hypothesis)) === false));
}

runTest(
    "basement wall moisture routes to basement-waterproofing and moisture",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "dampness and seepage at below-grade wall",
                observations: ["wet patch"]
            },
            building: {
                basementType: "full basement",
                waterproofingType: "bituminous membrane"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture"]);
        assert.ok(allCauses(result).includes("defective external basement waterproofing") || allCauses(result).includes("lateral moisture penetration"));
        assert.ok(result.confidence >= 0 && result.confidence <= 1);
    }
);

runTest(
    "wet basement crack routes to basement-waterproofing, crack, and moisture",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement retaining wall crack",
                description: "wet crack with seepage",
                observations: ["damp crack line"]
            },
            building: {
                basementType: "full basement"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture", "crack"]);
        assert.ok(allCauses(result).includes("moisture transport through cracks"));
        assertHypothetical(result);
    }
);

runTest(
    "wall-floor-junction moisture produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "basement wall-floor junction",
                description: "dampness at wall slab joint",
                observations: ["wet wall-floor line"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(allCauses(result).includes("defective wall-floor junction"));
        assertHypothetical(result);
    }
);

runTest(
    "service penetration leakage produces penetration-sealing hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "water ingress",
                location: "basement service penetration",
                description: "leakage around pipe penetration",
                observations: ["wet sleeve"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(allCauses(result).includes("defective service penetration sealing"));
    }
);

runTest(
    "groundwater pressure wording produces hydrostatic-pressure hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "water ingress",
                location: "below-grade wall",
                description: "groundwater water pressure at basement wall",
                observations: ["hydrostatic pressure"]
            },
            building: {
                basementType: "full basement",
                siteConditions: "high groundwater"
            }
        });

        assert.ok(allCauses(result).includes("hydrostatic water pressure"));
    }
);

runTest(
    "blocked basement drainage produces drainage hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "drainage",
                location: "basement perimeter drainage",
                description: "blocked drain with overflow",
                observations: ["clogged drain", "slow discharge"]
            },
            building: {
                basementType: "full basement",
                siteConditions: "water accumulation near foundation"
            }
        });

        assert.ok(allCauses(result).includes("blocked or ineffective drainage") || allCauses(result).includes("failed or missing perimeter drainage"));
    }
);

runTest(
    "lower-wall moisture does not automatically confirm rising damp",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "lower basement wall",
                description: "dampness at wall base",
                observations: ["wet patch"]
            },
            building: {
                basementType: "full basement",
                constructionType: "masonry"
            }
        });

        assert.ok(/confirmed/i.test(JSON.stringify(result)) === false);
        assert.ok(/do not infer rising damp from floor-level location alone/i.test(JSON.stringify(result)));
    }
);

runTest(
    "salt efflorescence does not prove a moisture source",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "basement moisture",
                location: "basement wall",
                description: "salt efflorescence and crystalline deposits",
                observations: ["salt bloom"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(allCauses(result).includes("salt contamination and salt-related surface deterioration"));
        assert.ok(/not proof of one specific source/i.test(JSON.stringify(result)));
    }
);

runTest(
    "basement mould with cold-surface wording supports condensation",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "mould",
                location: "basement cold wall",
                description: "surface mould and condensation at cold surface",
                observations: ["high humidity", "insufficient ventilation"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(allCauses(result).includes("condensation on basement surfaces"));
        assert.equal(allCauses(result).includes("defective external basement waterproofing"), false);
    }
);

runTest(
    "basement floor moisture supports floor-waterproofing hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "basement floor slab",
                description: "wet floor slab and damp basement floor",
                observations: ["floor seepage"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(allCauses(result).includes("defective basement floor waterproofing"));
    }
);

runTest(
    "reinforced-concrete basement spalling preserves concrete-corrosion overlap",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement wall",
                description: "spalling with rust staining",
                observations: ["exposed reinforcement"]
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing"]);
        assert.ok(allCauses(result).includes("reinforcement corrosion"));
    }
);

runTest(
    "roof-only finding does not route to basement-waterproofing",
    () => {
        const input = {
            finding: {
                category: "roof-envelope",
                location: "roof penetration",
                description: "water ingress around flashing",
                observations: ["staining"]
            },
            building: {
                constructionType: "apartment"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.equal(domains.includes("basement-waterproofing"), false);
    }
);

runTest(
    "non-basement condensation does not route to basement-waterproofing",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "condensation on cold surface",
                observations: ["high humidity"]
            },
            building: {
                constructionType: "apartment",
                basementType: "none"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "required verification is exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "basement wall-floor junction",
                description: "dampness at junction"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.ok(Array.isArray(result.requiredVerification));
        assert.ok(result.requiredVerification.length > 0);
    }
);

runTest(
    "risk, CAPEX, and valuation relevance are exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "water ingress",
                location: "basement wall",
                description: "below-grade seepage"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
    }
);

runTest(
    "all results remain explicitly hypothetical",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "basement retaining wall",
                description: "dampness with seepage"
            },
            building: {
                basementType: "full basement"
            }
        });

        assertHypothetical(result);
    }
);

runTest(
    "deterministic output",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement retaining wall crack",
                description: "wet crack with salt efflorescence",
                observations: ["seepage"]
            },
            building: {
                basementType: "full basement",
                foundationType: "strip foundation",
                siteConditions: "high groundwater"
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

        const result1 = ExpertReasoningEngine.analyze(input);
        const result2 = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement service penetration",
                description: "leak around pipe penetration"
            },
            building: {
                basementType: "full basement",
                waterproofingType: "bituminous membrane"
            }
        };

        const original = structuredClone(input);

        ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable domain ordering",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement wall crack",
                description: "water ingress with rust staining and spalling"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete"
            }
        };

        const domains1 = KnowledgeDomainRouter.resolve(input);
        const domains2 = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains1, domains2);
        assert.deepStrictEqual(domains1, ["concrete-corrosion", "basement-waterproofing", "moisture", "crack"]);
    }
);

runTest(
    "stable unknown-input fallback",
    () => {
        const unknown1 = ExpertReasoningEngine.analyze({
            finding: {
                category: "inspection"
            }
        });
        const unknown2 = ExpertReasoningEngine.analyze({
            finding: {
                category: "inspection"
            }
        });

        assert.deepStrictEqual(unknown1, unknown2);
    }
);

runTest(
    "moisture regression unchanged",
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

        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "crack regression unchanged",
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
            }
        });

        assert.ok(["lintel or opening-related movement", "differential settlement", "foundation movement"].includes(result.primaryHypothesis.cause));
    }
);

runTest(
    "roof-envelope regression unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "Moisture around a vent stack after rainfall",
                observations: ["staining near flashing"]
            },
            building: {
                constructionType: "apartment",
                roofType: "flat roof"
            }
        });

        assert.ok(allCauses(result).includes("failed flashing or penetration detail"));
    }
);

runTest(
    "concrete-corrosion regression unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "corrosion",
                location: "beam soffit",
                description: "Exposed reinforcement with rust staining",
                observations: ["rebar visible", "spalling"]
            },
            building: {
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            }
        });

        assert.equal(result.primaryHypothesis.cause, "reinforcement corrosion");
    }
);

console.log("Basement waterproofing reasoning integration test completed successfully.");
