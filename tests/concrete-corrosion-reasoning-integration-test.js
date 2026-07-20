import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
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

    assert.ok(hypotheses.every((hypothesis) => /confirmed|fact|diagnosis/i.test(JSON.stringify(hypothesis)) === false));
}

runTest(
    "exposed reinforcement produces reinforcement corrosion hypothesis",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "beam soffit",
                description: "Exposed reinforcement with rust staining",
                observations: ["rebar visible", "spalling"]
            },
            building: {
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            },
            measurements: [
                {
                    type: "surface note",
                    value: "rust staining"
                }
            ]
        };

        const original = structuredClone(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.equal(result.primaryHypothesis.cause, "reinforcement corrosion");
        assert.ok(result.primaryHypothesis.classification);
        assert.ok(Array.isArray(result.requiredVerification) && result.requiredVerification.length > 0);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(result.primaryHypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assertHypothetical(result);
        assert.deepStrictEqual(input, original);
        assert.ok(result.confidence >= 0);
        assert.ok(result.confidence <= 1);
    }
);

runTest(
    "rust staining produces corrosion-related hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "column",
                description: "Rust staining with cracking in reinforced concrete",
                observations: ["corrosion"]
            },
            building: {
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            }
        });

        assert.ok(allCauses(result).includes("reinforcement corrosion"));
        assert.ok(result.primaryHypothesis.classification);
        assert.ok(result.primaryHypothesis.requiredVerification.length > 0);
        assertHypothetical(result);
    }
);

runTest(
    "concrete spalling produces concrete deterioration hypothesis without confirming structural failure",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "facade slab",
                description: "Concrete spalling at the edge",
                observations: ["broken concrete"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(allCauses(result).includes("concrete spalling"));
        assert.equal(result.primaryHypothesis.cause, "concrete spalling");
        assert.ok(result.primaryHypothesis.classification);
        assert.ok(/structural failure/i.test(JSON.stringify(result.primaryHypothesis)) === false);
        assertHypothetical(result);
    }
);

runTest(
    "hollow-sounding concrete produces delamination hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "slab",
                description: "Hollow sounding concrete near the joint",
                observations: ["drummy sound"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(allCauses(result).includes("delamination or hollow-sounding concrete"));
        assert.ok(result.primaryHypothesis.requiredVerification.length > 0);
        assertHypothetical(result);
    }
);

runTest(
    "carbonation wording produces carbonation-induced corrosion hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "wall",
                description: "Carbonation-related corrosion at the cover",
                observations: ["carbonated cover"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(allCauses(result).includes("carbonation-induced corrosion"));
        assertHypothetical(result);
    }
);

runTest(
    "chloride wording produces chloride-induced corrosion hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "seaside column",
                description: "Chloride ingress with rust staining",
                observations: ["salt exposure"]
            },
            building: {
                exposureClass: "coastal"
            }
        });

        assert.ok(allCauses(result).includes("chloride-induced corrosion"));
        assertHypothetical(result);
    }
);

runTest(
    "freeze-thaw wording produces freeze-thaw hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "external concrete edge",
                description: "Freeze-thaw deterioration with scaling",
                observations: ["frost damage"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(allCauses(result).includes("freeze-thaw deterioration"));
        assertHypothetical(result);
    }
);

runTest(
    "ASR wording produces alkali-silica reaction hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "wall panel",
                description: "ASR map cracking and expansion",
                observations: ["gel", "map cracking"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(allCauses(result).includes("alkali-silica reaction"));
        assertHypothetical(result);
    }
);

runTest(
    "insufficient concrete cover wording produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "edge beam",
                description: "Insufficient concrete cover at exposed reinforcement",
                observations: ["shallow cover"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(allCauses(result).includes("insufficient concrete cover"));
        assertHypothetical(result);
    }
);

runTest(
    "moisture plus exposed reinforcement preserves relevant corrosion reasoning",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "corrosion",
                location: "balcony slab",
                description: "Moisture with exposed reinforcement and rust staining",
                observations: ["wet concrete", "rebar visible"]
            },
            building: {
                constructionType: "reinforced concrete",
                exposureClass: "coastal"
            }
        });

        const causes = allCauses(result);

        assert.ok(causes.includes("reinforcement corrosion"));
        assert.ok(causes.includes("moisture-accelerated deterioration"));
        assert.ok(causes.includes("chloride-induced corrosion") || causes.includes("carbonation-induced corrosion") || causes.includes("structural durability deficit"));
        assertHypothetical(result);
    }
);

runTest(
    "required verification and relevance fields are exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "column",
                description: "Rust staining and spalling",
                observations: ["exposed reinforcement"]
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.ok(result.primaryHypothesis.requiredVerification.length > 0);
        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
        assertHypothetical(result);
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "beam",
                description: "Rust staining with exposed reinforcement",
                observations: ["spalling"]
            },
            building: {
                constructionYear: 1988,
                constructionType: "reinforced concrete",
                exposureClass: "coastal",
                numberOfStoreys: 8
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
        assert.ok(unknown1.primaryHypothesis);
        assert.ok(Array.isArray(unknown1.alternativeHypotheses));
        assert.ok(Array.isArray(unknown1.supportingEvidence));
        assert.ok(Array.isArray(unknown1.missingEvidence));
        assert.ok(Array.isArray(unknown1.requiredVerification));
        assert.ok(Array.isArray(unknown1.potentialConsequences));
        assert.equal(typeof unknown1.confidence, "number");
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
    "roof-envelope behavior unchanged",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                location: "roof penetration",
                description: "Moisture around a vent stack after rainfall",
                observations: ["staining near flashing"]
            },
            building: {
                constructionType: "apartment",
                roofType: "flat roof"
            }
        });

        assert.ok([
            "failed flashing or penetration detail",
            "defective flat-roof waterproofing",
            "defective roof drainage"
        ].includes(result.primaryHypothesis.cause));
        assert.ok(result.primaryHypothesis.classification);
    }
);

console.log("ConcreteCorrosionReasoningEngine integration test completed successfully.");
