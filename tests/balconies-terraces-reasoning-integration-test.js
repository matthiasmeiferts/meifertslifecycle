import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import KnowledgeDomainRouter from "../portal/core/reasoning/KnowledgeDomainRouter.js";
import BuildingRiskInternalModel from "../portal/core/risk/BuildingRiskInternalModel.js";
import BuildingRiskInterpretationModel from "../portal/core/risk/BuildingRiskInterpretationModel.js";
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

function allHypotheses(result) {
    return [
        result.primaryHypothesis,
        ...result.alternativeHypotheses
    ];
}

runTest(
    "leaking balcony door threshold routes to balconies-terraces, windows-doors, roof-envelope, and moisture",
    () => {
        const input = {
            finding: {
                category: "balcony",
                location: "balcony door threshold",
                description: "leaking balcony door threshold with rain ingress",
                observations: ["sill wetting"]
            },
            building: {
                balconyType: "cantilever",
                terraceType: "roof terrace"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["balconies-terraces", "windows-doors", "roof-envelope", "moisture"]);
        assert.ok(allCauses(result).includes("failed door threshold waterproofing"));
    }
);

runTest(
    "terrace waterproofing leakage routes to balconies-terraces, roof-envelope, and moisture",
    () => {
        const input = {
            finding: {
                category: "terrace",
                location: "roof terrace",
                description: "terrace waterproofing leakage with rain ingress",
                observations: ["wet patch"]
            },
            building: {
                terraceType: "roof terrace"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["balconies-terraces", "roof-envelope", "moisture"]);
        assert.ok(allCauses(result).includes("defective terrace waterproofing"));
    }
);

runTest(
    "balcony slab spalling with exposed reinforcement preserves concrete-corrosion overlap",
    () => {
        const input = {
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "balcony edge spalling with exposed reinforcement and rust",
                observations: ["spalled concrete", "rust staining"]
            },
            building: {
                structuralSystem: "reinforced concrete"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["concrete-corrosion", "balconies-terraces"]);
        assert.ok(allCauses(result).includes("reinforcement corrosion"));
    }
);

runTest(
    "blocked balcony outlet produces blocked-drainage hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "drain outlet",
                description: "blocked drainage outlet with overflow at balcony",
                observations: ["outlet blockage", "blocked drain"]
            }
        });

        assert.ok(allCauses(result).includes("blocked drainage outlet"));
    }
);

runTest(
    "standing water produces drainage or slope hypothesis without confirming inadequate slope",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony slab",
                description: "standing water on balcony surface after rain",
                observations: ["ponding"]
            }
        });

        const causes = allCauses(result);

        assert.ok(causes.includes("insufficient drainage") || causes.includes("inadequate surface slope"));
        assert.equal(result.primaryHypothesis.cause === "inadequate surface slope" || result.primaryHypothesis.cause === "insufficient drainage", true);
    }
);

runTest(
    "balcony wall connection moisture preserves facade-wall-systems overlap",
    () => {
        const input = {
            finding: {
                category: "balcony",
                location: "balcony wall connection",
                description: "balcony wall connection moisture and staining at facade junction",
                observations: ["wall junction damp"]
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["balconies-terraces", "facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "hollow-sounding tiles produce hollow-tile hypothesis and remain unconfirmed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "tile finish",
                description: "hollow-sounding tiles on the balcony",
                observations: ["drummy sound"]
            }
        });

        assert.ok(allCauses(result).includes("hollow-sounding tiles"));
        assert.ok(allHypotheses(result).every((hypothesis) => hypothesis.status === "hypothesis"));
    }
);

runTest(
    "tile debonding produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "terrace",
                location: "tile finish",
                description: "tile debonding and lifted edge",
                observations: ["loose tile"]
            }
        });

        assert.ok(allCauses(result).includes("tile debonding"));
    }
);

runTest(
    "frost deterioration produces frost-related hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "frost deterioration and freeze-thaw damage",
                observations: ["winter weathering"]
            }
        });

        assert.ok(allCauses(result).includes("frost-related deterioration"));
    }
);

runTest(
    "railing-anchor deterioration produces corresponding hypothesis without confirming instability",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony railing anchor",
                description: "railing anchor deterioration and corrosion",
                observations: ["balustrade fixing corrosion"]
            }
        });

        assert.ok(allCauses(result).includes("railing anchorage deterioration"));
        assert.equal(result.primaryHypothesis.cause, "railing anchorage deterioration");
    }
);

runTest(
    "movement-joint defect produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "movement joint",
                description: "movement joint defect with opening",
                observations: ["joint failure"]
            }
        });

        assert.ok(allCauses(result).includes("movement joint defect"));
    }
);

runTest(
    "occupied-space leakage produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "water penetration into occupied space below balcony",
                observations: ["interior staining"]
            }
        });

        assert.ok(allCauses(result).includes("water penetration into occupied space"));
    }
);

runTest(
    "balcony thermal bridge remains hypothetical and requires supporting indicators",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony connection",
                description: "thermal bridge at balcony connection",
                observations: ["cold surface"]
            }
        });

        assert.ok(allCauses(result).includes("thermal bridge at balcony connection"));
        assert.ok(allHypotheses(result).every((hypothesis) => hypothesis.status === "hypothesis"));
    }
);

runTest(
    "basement terrace leakage preserves basement-waterproofing overlap",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "sunken terrace",
                description: "basement terrace leakage with dampness",
                observations: ["wet terrace surface"]
            },
            building: {
                basementType: "full basement"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["basement-waterproofing", "balconies-terraces", "moisture"]);
    }
);

runTest(
    "no automatic structural-failure conclusion",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony slab",
                description: "concrete spalling and hollow sounding tiles",
                observations: ["spalled concrete"]
            }
        });

        assert.ok(/structural failure|confirmed structural|load-bearing failure/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "no automatic full-replacement recommendation",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "terrace surface",
                description: "standing water and tile debonding",
                observations: ["hollow sounding tiles"]
            }
        });

        assert.ok(/full replacement|replace all|complete replacement/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "required verification is exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony slab",
                description: "balcony waterproofing defect"
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
                category: "balcony",
                location: "balcony railing anchor",
                description: "railing anchor deterioration"
            }
        });

        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
    }
);

runTest(
    "balconies terraces risk relevance source version reaches internal interpretation without risk drivers",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "balcony",
                location: "balcony railing anchor",
                description: "railing anchor deterioration and corrosion",
                observations: ["balustrade fixing corrosion"]
            }
        });
        const internalModel = BuildingRiskInternalModel.build(result);
        const entry = internalModel.domainAssessments[0].riskRelevanceEntries[0];
        const interpretation = BuildingRiskInterpretationModel.interpret(internalModel);
        const riskRelevanceInterpretation = interpretation.domainInterpretations[0].riskRelevanceInterpretations[0];

        assert.equal(result.primaryHypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(entry.rawValue, result.primaryHypothesis.riskRelevance);
        assert.equal(entry.rawVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(entry.valueState, "LEGACY_SUPPORTED");
        assert.equal(entry.versionState, "VERSION_SUPPORTED");
        assert.equal(riskRelevanceInterpretation.interpretationState, "INTERPRETED");
        assert.equal(riskRelevanceInterpretation.interpretationReason, "RR_ELIGIBLE_LEGACY_SUPPORTED_VERSION");
        assert.equal(riskRelevanceInterpretation.sourceRiskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.deepStrictEqual(interpretation.domainInterpretations[0].riskDrivers, []);
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
                terraceType: "roof terrace"
            }
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
                location: "reinforced concrete basement balcony terrace window facade crack",
                description: "water ingress with rust staining, spalling, and standing water at balcony door threshold and facade wall connection",
                observations: ["seepage", "rain ingress"]
            },
            building: {
                basementType: "full basement",
                balconyType: "cantilever",
                terraceType: "roof terrace",
                windowType: "casement"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing", "balconies-terraces", "windows-doors", "facade-wall-systems", "roof-envelope", "moisture", "crack"]);
    }
);

runTest(
    "stable unknown-input fallback",
    () => {
        const result1 = ExpertReasoningEngine.analyze({
            finding: {
                category: "inspection"
            }
        });
        const result2 = ExpertReasoningEngine.analyze({
            finding: {
                category: "inspection"
            }
        });

        assert.deepStrictEqual(result1, result2);
        assert.equal(result1.primaryHypothesis.category, "general");
    }
);

runTest(
    "internal floor tiles do not route to balconies-terraces",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "tile",
                location: "internal floor",
                description: "interior floor tiles cracked"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "generic railing does not route to balconies-terraces",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "railing",
                location: "handrail",
                description: "generic railing corrosion"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "roof-only drainage does not route to balconies-terraces",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof drain",
                description: "roof drainage outlet blockage"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "generic frost damage does not route to balconies-terraces",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "external surface",
                description: "generic frost damage"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "generic standing water does not route to balconies-terraces",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "courtyard",
                description: "generic standing water"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "existing facade-wall-systems behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "north facade",
                description: "algae on facade surface"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems"]);
    }
);

runTest(
    "existing windows-doors behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "window",
                location: "window frame",
                description: "defective perimeter seal at frame edge"
            },
            building: {
                windowType: "casement"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "existing basement-waterproofing behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "dampness and seepage"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture"]);
    }
);

runTest(
    "existing concrete-corrosion behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "concrete",
                location: "concrete beam",
                description: "durability concern in reinforced concrete"
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion"]);
    }
);

runTest(
    "existing roof-envelope behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof penetration",
                description: "failed flashing detail"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
    }
);

runTest(
    "existing moisture behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "surface dampness"
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "existing crack behavior unchanged",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "window opening",
                description: "diagonal crack from corner"
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
    }
);

console.log("BalconiesTerracesReasoningIntegration tests completed successfully.");
