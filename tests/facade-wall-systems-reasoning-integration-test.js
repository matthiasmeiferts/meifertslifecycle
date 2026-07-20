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
    "cracked rendered facade routes to facade-wall-systems and crack",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "rendered external wall",
                description: "cracked render on facade",
                observations: ["render cracking"]
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["facade-wall-systems", "crack"]);
        assert.ok(allCauses(result).includes("render cracking"));
    }
);

runTest(
    "detached render produces detached-render hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "rendered wall",
                description: "detached render with delamination",
                observations: ["render detachment"]
            }
        });

        assert.ok(allCauses(result).includes("detached render"));
    }
);

runTest(
    "hollow render produces hollow-render hypothesis and remains unconfirmed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "render zone",
                description: "hollow render with drummy sounding",
                observations: ["hollow sounding"]
            }
        });

        assert.ok(allCauses(result).includes("hollow render"));
        assert.ok(allHypotheses(result).every((hypothesis) => hypothesis.status === "hypothesis"));
    }
);

runTest(
    "facade moisture routes to facade-wall-systems, roof-envelope, and moisture",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "facade sealant joint",
                description: "damp facade with failed sealant joint and rain ingress",
                observations: ["water seepage"]
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "defective facade sealant joint produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "sealant joint",
                description: "failed sealant joint with cracking",
                observations: ["joint sealant shrinkage"]
            }
        });

        assert.ok(allCauses(result).includes("defective sealant joints"));
    }
);

runTest(
    "ETICS moisture near a window preserves windows-doors and moisture overlap",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "ETICS window connection",
                description: "ETICS moisture near window flashing with ingress",
                observations: ["wet insulation"]
            },
            building: {
                insulationSystem: "ETICS",
                windowType: "casement"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["windows-doors", "facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "ETICS detachment produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "EIFS board area",
                description: "eifs detachment at insulation board edge",
                observations: ["detached eifs"]
            },
            building: {
                insulationSystem: "EIFS"
            }
        });

        assert.ok(allCauses(result).includes("ETICS detachment"));
    }
);

runTest(
    "algae growth produces biological-growth hypothesis without confirming moisture ingress",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "north facade",
                description: "algae on facade and biological growth",
                observations: ["green facade staining"]
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["facade-wall-systems"]);
        assert.ok(allCauses(result).includes("algae or biological growth"));
        assert.ok(/confirm(ed|ation)?\s+moisture\s+ingress/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "coating deterioration produces coating hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "east elevation",
                description: "coating deterioration with paint failure",
                observations: ["coating peel"]
            }
        });

        assert.ok(allCauses(result).includes("coating deterioration"));
    }
);

runTest(
    "freeze-thaw facade wording produces freeze-thaw hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "masonry facade",
                location: "parapet",
                description: "freeze-thaw and frost spalling on facade",
                observations: ["frost damage"]
            }
        });

        assert.ok(allCauses(result).includes("freeze-thaw deterioration"));
    }
);

runTest(
    "masonry weathering produces masonry-weathering hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "masonry facade",
                location: "brick facade",
                description: "masonry weathering with brick erosion",
                observations: ["mortar weathering"]
            }
        });

        assert.ok(allCauses(result).includes("masonry weathering"));
    }
);

runTest(
    "facade-anchor wording produces anchor-deterioration hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "cladding facade",
                location: "facade anchor line",
                description: "facade anchor deterioration with corrosion",
                observations: ["cladding anchor distress"]
            }
        });

        assert.ok(allCauses(result).includes("facade anchor deterioration"));
    }
);

runTest(
    "movement-joint defect produces corresponding hypothesis",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "movement joint",
                description: "failed movement joint and expansion joint restraint",
                observations: ["joint closure"]
            }
        });

        assert.ok(allCauses(result).includes("facade movement joint defect"));
    }
);

runTest(
    "workmanship wording remains hypothetical",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "external wall system",
                location: "detail transition",
                description: "poor workmanship and installation defect",
                observations: ["improper execution"]
            }
        });

        assert.ok(allCauses(result).includes("workmanship defect"));
        assert.ok(allHypotheses(result).every((hypothesis) => hypothesis.status === "hypothesis"));
    }
);

runTest(
    "concrete facade spalling preserves concrete-corrosion overlap",
    () => {
        const input = {
            finding: {
                category: "facade",
                location: "reinforced concrete facade",
                description: "spalling facade finish with exposed reinforcement and rust",
                observations: ["concrete cover loss"]
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["concrete-corrosion", "facade-wall-systems"]);
    }
);

runTest(
    "basement plinth moisture preserves basement-waterproofing overlap",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement plinth external wall",
                description: "facade moisture and seepage at plinth",
                observations: ["damp lower wall"]
            },
            building: {
                basementType: "full basement"
            }
        };

        const domains = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(domains, ["basement-waterproofing", "facade-wall-systems", "moisture"]);
    }
);

runTest(
    "no automatic structural-failure conclusion",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "rendered wall",
                description: "render cracking and hollow areas",
                observations: ["detached render"]
            }
        });

        assert.ok(/structural failure|load-bearing failure|confirmed structural/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "no automatic full-replacement recommendation",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "north elevation",
                description: "algae on facade and coating deterioration",
                observations: ["biological growth"]
            }
        });

        assert.ok(/full replacement|replace entire facade|complete facade replacement/i.test(JSON.stringify(result)) === false);
    }
);

runTest(
    "required verification is exposed",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "sealant joint",
                description: "defective sealant joint"
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
                category: "facade",
                location: "cladding anchor",
                description: "facade anchor deterioration"
            }
        });

        assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
        assert.equal(result.primaryHypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
        assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
    }
);

runTest(
    "facade wall risk relevance source version reaches internal interpretation without risk drivers",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "facade",
                location: "north facade",
                description: "algae on facade and biological growth",
                observations: ["green facade staining"]
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
                category: "facade",
                location: "rendered external wall and movement joint",
                description: "render cracking and failed movement joint",
                observations: ["open joint"]
            },
            building: {
                facadeType: "render",
                exposure: "north-west"
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
                category: "facade",
                location: "ETICS window connection",
                description: "ETICS moisture near window flashing with ingress",
                observations: ["wet insulation"]
            },
            building: {
                insulationSystem: "ETICS",
                facadeType: "external insulation",
                windowType: "casement"
            },
            measurements: [
                {
                    type: "observation",
                    value: "localized damp patch",
                    unit: "qualitative",
                    location: "window reveal"
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
                location: "reinforced concrete basement external wall window frame crack",
                description: "water ingress with rust staining and spalling facade finish at window joint and flashing",
                observations: ["seepage"]
            }
        };

        const first = KnowledgeDomainRouter.resolve(input);
        const second = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(first, ["concrete-corrosion", "basement-waterproofing", "windows-doors", "facade-wall-systems", "roof-envelope", "moisture", "crack"]);
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
    "internal plaster does not route to facade-wall-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "internal wall",
                location: "living room",
                description: "internal decorative render and plaster crack"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "generic internal wall crack does not route to facade-wall-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "internal wall",
                description: "generic wall crack"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "roof cladding alone does not route to facade-wall-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof cladding",
                description: "roof cladding weathering"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "generic algae without facade context does not route to facade-wall-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "garden item",
                description: "algae growth observed"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
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

console.log("Facade-wall-systems reasoning integration test completed successfully.");
