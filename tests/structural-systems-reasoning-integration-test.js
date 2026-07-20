import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import KnowledgeDomainRouter from "../portal/core/reasoning/KnowledgeDomainRouter.js";
import KnowledgeReasoningMapper from "../portal/core/reasoning/KnowledgeReasoningMapper.js";
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
        result.primaryHypothesis?.cause,
        ...result.alternativeHypotheses.map((hypothesis) => hypothesis.cause)
    ];
}

function assertHasCause(result, cause) {
    assert.ok(allCauses(result).includes(cause), `Expected cause: ${cause}`);
}

function assertReasoningContract(result) {
    assert.ok(result.primaryHypothesis);
    assert.ok(Array.isArray(result.alternativeHypotheses));
    assert.ok(Array.isArray(result.supportingEvidence));
    assert.ok(Array.isArray(result.missingEvidence));
    assert.ok(Array.isArray(result.requiredVerification));
    assert.ok(Array.isArray(result.potentialConsequences));
    assert.equal(typeof result.confidence, "number");
    assert.equal(result.primaryHypothesis.status, "hypothesis");
    assert.equal(Object.hasOwn(result, "severity"), false);
    assert.deepStrictEqual(Object.keys(result), [
        "primaryHypothesis",
        "alternativeHypotheses",
        "supportingEvidence",
        "missingEvidence",
        "requiredVerification",
        "potentialConsequences",
        "confidence"
    ]);
}

function assertPublicContractKeys(result) {
    assert.deepStrictEqual(Object.keys(result), [
        "primaryHypothesis",
        "alternativeHypotheses",
        "supportingEvidence",
        "missingEvidence",
        "requiredVerification",
        "potentialConsequences",
        "confidence"
    ]);
    assert.equal(Object.hasOwn(result, "severity"), false);
}

runTest(
    "structural finding selects structural-systems provider",
    () => {
        const input = {
            finding: {
                category: "structural",
                location: "load-bearing wall",
                description: "Removed load-bearing wall with structural opening and missing structural approval"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["structural-systems", "crack"]);
        assertHasCause(result, "possible structural alteration");
        assertReasoningContract(result);
        assert.equal(result.primaryHypothesis.riskRelevance, "high");
        assert.equal(result.primaryHypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
    }
);

runTest(
    "structural risk relevance version reaches internal model and interpretation",
    () => {
        const result = ExpertReasoningEngine.analyze({
            finding: {
                category: "structural",
                location: "load-bearing wall",
                description: "Removed load-bearing wall with structural opening and missing structural approval"
            }
        });
        const internalModel = BuildingRiskInternalModel.build(result);
        const entry = internalModel.domainAssessments[0].riskRelevanceEntries[0];
        const interpretation = BuildingRiskInterpretationModel.interpret(internalModel);
        const riskRelevanceInterpretation = interpretation.domainInterpretations[0].riskRelevanceInterpretations[0];

        assert.equal(entry.rawValue, "high");
        assert.equal(entry.rawVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(entry.valueState, "LEGACY_SUPPORTED");
        assert.equal(entry.versionState, "VERSION_SUPPORTED");
        assert.equal(riskRelevanceInterpretation.interpretationState, "INTERPRETED");
        assert.equal(riskRelevanceInterpretation.interpretationReason, "RR_ELIGIBLE_LEGACY_SUPPORTED_VERSION");
        assert.equal(riskRelevanceInterpretation.sourceRiskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.deepStrictEqual(interpretation.domainInterpretations[0].riskDrivers, []);
        assert.notEqual(interpretation.domainInterpretations[0].riskCategory, "ELEVATED_CONCERN");
        assert.notEqual(interpretation.domainInterpretations[0].riskCategory, "CRITICAL_CONCERN");
    }
);

runTest(
    "mapper transports only source-owned risk relevance versions",
    () => {
        const input = {
            finding: {
                category: "structural",
                location: "load-bearing wall",
                description: "source-owned indicator"
            }
        };
        const baseHypothesis = {
            id: "mapper-risk-relevance-version-probe",
            cause: "possible mapper probe",
            classification: "structural hypothesis requiring verification",
            structuralRelevance: "high",
            supportingIndicators: ["source-owned indicator"],
            contradictingIndicators: [],
            requiredVerification: [],
            potentialConsequences: [],
            recommendedActions: [],
            riskRelevance: "high",
            capexRelevance: "high",
            valuationRelevance: "high"
        };
        const missingVersion = KnowledgeReasoningMapper.map({
            knowledge: { domain: "structural-systems", hypotheses: [baseHypothesis] },
            input
        });
        const unsupportedVersion = KnowledgeReasoningMapper.map({
            knowledge: { domain: "structural-systems", hypotheses: [{ ...baseHypothesis, riskRelevanceVersion: "risk-relevance-2.0" }] },
            input
        });
        const canonicalLikeValue = KnowledgeReasoningMapper.map({
            knowledge: { domain: "structural-systems", hypotheses: [{ ...baseHypothesis, riskRelevance: "HIGH_RELEVANCE", riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION }] },
            input
        });

        assert.equal(Object.hasOwn(missingVersion.primaryHypothesis, "riskRelevanceVersion"), false);
        assert.equal(unsupportedVersion.primaryHypothesis.riskRelevanceVersion, "risk-relevance-2.0");
        assert.equal(unsupportedVersion.primaryHypothesis.riskRelevance, "high");
        assert.equal(canonicalLikeValue.primaryHypothesis.riskRelevance, "HIGH_RELEVANCE");
        assert.equal(canonicalLikeValue.primaryHypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
    }
);

runTest(
    "first-success structural wins against crack",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "foundation wall",
                description: "Differential settlement with diagonal crack and foundation movement"
            },
            measurements: [{ type: "level survey", value: "differential level change" }]
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["structural-systems", "basement-waterproofing", "crack"]);
        assertHasCause(result, "possible settlement-related movement");
        assert.equal(result.primaryHypothesis.cause.includes("crack"), false);
    }
);

runTest(
    "first-success structural wins against concrete-corrosion when structural relevance is explicit",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "damaged column",
                description: "Structural corrosion with section loss, exposed reinforcement, rust staining, and spalling at damaged column"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["structural-systems", "concrete-corrosion"]);
        assertHasCause(result, "possible structural section loss");
    }
);

runTest(
    "non-structural concrete corrosion remains concrete-corrosion",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "concrete surface",
                description: "spalling with rust staining at concrete cover"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["concrete-corrosion"]);
        assertHasCause(ExpertReasoningEngine.analyze(input), "reinforcement corrosion");
    }
);

runTest(
    "basement moisture without deformation remains existing domain",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "wet crack and seepage at retaining wall without deformation"
            }
        };

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["basement-waterproofing", "moisture", "crack"]);
    }
);

runTest(
    "generic crack remains crack and does not aggregate",
    () => {
        const input = {
            finding: {
                category: "crack",
                location: "interior wall",
                description: "generic wall crack in bedroom"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["crack"]);
        assertReasoningContract(result);
        assert.equal(Object.hasOwn(result, "candidateDomains"), false);
        assert.equal(Object.hasOwn(result, "secondaryDomains"), false);
    }
);

runTest(
    "legacy fallback remains reachable for unmapped neutral input",
    () => {
        const input = {
            finding: {
                category: "inspection",
                description: "neutral observation without mapped domain"
            }
        };
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), []);
        assert.equal(result.primaryHypothesis.id ?? null, null);
        assertPublicContractKeys(result);
    }
);

runTest(
    "deterministic output and immutable input",
    () => {
        const input = {
            finding: {
                category: "structural",
                location: "beam",
                description: "Excessive deflection and sagging beam with deflection measurement",
                observations: ["significant movement"]
            },
            measurements: [{ type: "deflection measurement", value: 25, unit: "mm" }]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(ExpertReasoningEngine.analyze(input), ExpertReasoningEngine.analyze(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

console.log("StructuralSystems reasoning integration tests completed successfully.");
