import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import KnowledgeDomainRouter from "../portal/core/reasoning/KnowledgeDomainRouter.js";
import SanitarySystemsTerminologyAdapter from "../portal/core/reasoning/adapters/SanitarySystemsTerminologyAdapter.js";
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
    assert.equal(typeof result.primaryHypothesis.riskRelevance, "string");
    assert.equal(result.primaryHypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
    assert.equal(typeof result.primaryHypothesis.capexRelevance, "string");
    assert.equal(typeof result.primaryHypothesis.valuationRelevance, "string");
}

function analyzeAsSanitary(input) {
    const originalResolve = KnowledgeDomainRouter.resolve;

    KnowledgeDomainRouter.resolve = () => ["sanitary-systems"];

    try {
        return ExpertReasoningEngine.analyze(input);
    } finally {
        KnowledgeDomainRouter.resolve = originalResolve;
    }
}

function canonicalTerms(input) {
    return SanitarySystemsTerminologyAdapter.adapt(input).canonicalContext?.terms || [];
}

runTest(
    "sanitary finding selects sanitary provider when routed",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "wash basin",
                description: "Visible leakage at wash basin trap with dripping from sanitary fitting."
            }
        };
        const result = analyzeAsSanitary(input);

        assertHasCause(result, "visible leakage around sanitary component");
        assertReasoningContract(result);
    }
);

runTest(
    "damaged fixture finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "toilet",
                description: "Damaged toilet and loose fixture at sanitary connection."
            }
        });

        assertHasCause(result, "damaged or loose sanitary fixture");
    }
);

runTest(
    "blocked drain finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "Blocked drain with slow drainage and water backing up."
            }
        });

        assertHasCause(result, "possible drainage restriction indicator");
    }
);

runTest(
    "odour finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "Unpleasant odour at floor drain and trap odour near shower."
            }
        });

        assertHasCause(result, "unpleasant odour near sanitary drainage component");
    }
);

runTest(
    "missing seal finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "toilet connection",
                description: "Missing seal and damaged seal at toilet connection."
            }
        });

        assertHasCause(result, "missing or damaged sanitary seal");
    }
);

runTest(
    "unsupported pipe finding reaches sanitary provider",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "drain pipe",
                description: "Unsupported pipe with poor support and damaged pipe insulation."
            }
        });

        assertHasCause(result, "poor support or protection of sanitary pipework");
    }
);

runTest(
    "unrelated finding does not select sanitary provider through current router",
    () => {
        const input = {
            finding: {
                category: "document",
                location: "tenant file",
                description: "Water bill and drinking water discussion without visible sanitary defect."
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "output remains deterministic and input remains unchanged",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "wash basin",
                description: "Visible leakage, water staining, and missing seal at wash basin trap.",
                observations: ["slow drainage at sink"]
            },
            building: {
                sanitarySystemType: "domestic sanitary installation"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "leakage at trap and moisture around fixture",
                    location: "wash basin trap"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(analyzeAsSanitary(input), analyzeAsSanitary(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "public reasoning contract remains unchanged",
    () => {
        const result = analyzeAsSanitary({
            finding: {
                category: "sanitary",
                location: "wash basin trap",
                description: "Visible leakage at wash basin trap."
            }
        });

        assertReasoningContract(result);
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
);

runTest(
    "existing single-provider behaviour remains unchanged",
    () => {
        const input = {
            finding: {
                category: "window",
                location: "window frame",
                description: "defective perimeter seal at frame edge"
            },
            building: {
                windowType: "casement"
            }
        };
        const domains = KnowledgeDomainRouter.resolve(input);
        const result = ExpertReasoningEngine.analyze(input);

        assert.deepStrictEqual(domains, ["windows-doors"]);
        assertHasCause(result, "defective perimeter seal");
    }
);

runTest(
    "German sanitary input routes and renders without changing technical evidence",
    () => {
        const input = {
            finding: {
                category: "Sanitärinstallation",
                location: "Waschtisch Siphon",
                description: "sichtbar undicht und tropfend am Anschluss mit Leckagespur"
            }
        };
        const original = structuredClone(input);
        const result = ExpertReasoningEngine.analyze(input, { language: "de" });

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), ["sanitary-systems"]);
        assert.equal(result.primaryHypothesis.id, "visible-leakage-at-sanitary-component");
        assert.equal(result.primaryHypothesis.cause, "sichtbare Leckage an einer Sanitärkomponente");
        assert.deepStrictEqual(result.supportingEvidence, []);
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "canonical sanitary terms stay out of public supporting and missing evidence",
    () => {
        const input = {
            finding: {
                category: "Sanitärinstallation",
                location: "Waschtisch Siphon",
                description: "sichtbar undicht und tropfend am Anschluss mit Leckagespur"
            }
        };
        const result = ExpertReasoningEngine.analyze(input, { language: "de" });
        const evidenceText = JSON.stringify([result.supportingEvidence, result.missingEvidence]);

        canonicalTerms(input).forEach((term) => {
            assert.equal(evidenceText.includes(term), false, term);
        });
        assert.equal(JSON.stringify(result).includes("canonicalContext"), false);
    }
);

runTest(
    "German sanitary semantic cases select stable hypothesis ids",
    () => {
        const cases = [
            {
                input: { finding: { category: "Sanitärinstallation", location: "Waschtisch", description: "sichtbar undicht und tropfend am Anschluss" } },
                id: "visible-leakage-at-sanitary-component"
            },
            {
                input: { finding: { category: "Sanitärinstallation", location: "WC", description: "beschädigte Dichtung und fehlende Dichtung am Anschluss" } },
                id: "missing-or-damaged-sanitary-seal"
            },
            {
                input: { finding: { category: "Sanitärinstallation", location: "Bodenablauf", description: "langsamer Ablauf mit Rückstauanzeichen" } },
                id: "possible-drainage-restriction-indicator"
            },
            {
                input: { finding: { category: "Sanitärinstallation", location: "Ablauf", description: "unangenehmer Geruch aus dem Geruchsverschluss" } },
                id: "unpleasant-odour-near-sanitary-drainage"
            },
            {
                input: { finding: { category: "Sanitärinstallation", location: "Rohrleitung", description: "unzureichende Befestigung mit loser Rohrschelle" } },
                id: "poor-support-or-protection-of-sanitary-pipework"
            }
        ];

        cases.forEach((entry) => {
            const result = ExpertReasoningEngine.analyze(entry.input, { language: "de" });

            assert.equal(result.primaryHypothesis.id, entry.id);
            assert.deepStrictEqual(result.supportingEvidence, []);
        });
    }
);

console.log("SanitarySystems reasoning integration tests completed successfully.");
