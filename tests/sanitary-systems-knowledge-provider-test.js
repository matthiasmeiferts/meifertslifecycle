import assert from "node:assert/strict";
import SanitarySystemsKnowledgeProvider from "../portal/core/knowledge/SanitarySystemsKnowledgeProvider.js";
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

function getKnowledge(description, overrides = {}) {
    return SanitarySystemsKnowledgeProvider.getKnowledge({
        finding: {
            category: "sanitary",
            location: "wash basin",
            description,
            observations: []
        },
        building: {
            sanitarySystemType: "domestic sanitary installation"
        },
        measurements: [],
        ...overrides
    });
}

function ids(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.id);
}

function causes(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

function allHypothesisText(result) {
    return result.hypotheses.flatMap((hypothesis) => [
        hypothesis.id,
        hypothesis.cause,
        hypothesis.classification,
        ...hypothesis.supportingIndicators,
        ...hypothesis.contradictingIndicators,
        ...hypothesis.requiredVerification,
        ...hypothesis.potentialConsequences,
        ...hypothesis.recommendedActions,
        hypothesis.riskRelevance,
        hypothesis.capexRelevance,
        hypothesis.valuationRelevance
    ]).join(" ");
}

function assertHasCause(result, cause) {
    assert.equal(result.domain, "sanitary-systems");
    assert.ok(causes(result).includes(cause), `Expected cause ${cause} in ${causes(result).join(", ")}`);
}

runTest(
    "stable empty contract for empty input",
    () => {
        assert.deepStrictEqual(SanitarySystemsKnowledgeProvider.getKnowledge(), {
            domain: "sanitary-systems",
            hypotheses: []
        });
        assert.deepStrictEqual(SanitarySystemsKnowledgeProvider.getKnowledge({}), {
            domain: "sanitary-systems",
            hypotheses: []
        });
    }
);

runTest(
    "irrelevant input returns empty contract",
    () => {
        const result = SanitarySystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "interior",
                location: "kitchen wall",
                description: "Marketing text for a plumbing company advertisement without observed defect."
            }
        });

        assert.deepStrictEqual(result, {
            domain: "sanitary-systems",
            hypotheses: []
        });
    }
);

runTest(
    "metadata-only sanitary input returns empty contract",
    () => {
        const result = SanitarySystemsKnowledgeProvider.getKnowledge({
            building: {
                sanitarySystemType: "domestic sanitary installation",
                plumbingSystemType: "mixed pipework",
                maintenanceStatus: "unknown"
            }
        });

        assert.deepStrictEqual(result, {
            domain: "sanitary-systems",
            hypotheses: []
        });
    }
);

runTest(
    "visible leakage context is recognized conservatively",
    () => {
        const result = getKnowledge("Visible leakage at wash basin trap with dripping from sanitary fitting.");

        assertHasCause(result, "visible leakage around sanitary component");
        assert.equal(ids(result)[0], "visible-leakage-at-sanitary-component");
        assert.equal(/confirmed pipe failure|replacement required|non-compliant/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "corrosion staining and moisture context is recognized",
    () => {
        const result = getKnowledge("Corrosion and water staining around waste water pipe with moisture around sanitary components.");

        assertHasCause(result, "visible corrosion, staining, or moisture around sanitary components");
    }
);

runTest(
    "damaged fixture context is recognized",
    () => {
        const result = getKnowledge("Damaged toilet and loose fixture with cracked basin edge nearby.");

        assertHasCause(result, "damaged or loose sanitary fixture");
    }
);

runTest(
    "blocked or slow drainage context remains possible only",
    () => {
        const result = getKnowledge("Blocked drain and slow drainage at sink with water backing up.");

        assertHasCause(result, "possible drainage restriction indicator");
        assert.equal(/confirmed blockage|confirmed pipe failure/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "unpleasant odour context is recognized without contamination conclusion",
    () => {
        const result = getKnowledge("Unpleasant odour at floor drain and trap odour near shower.");

        assertHasCause(result, "unpleasant odour near sanitary drainage component");
        assert.equal(/confirmed contamination|legionella|water quality/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "missing seal context is recognized",
    () => {
        const result = getKnowledge("Missing seal and damaged seal at toilet connection with seal gap visible.");

        assertHasCause(result, "missing or damaged sanitary seal");
    }
);

runTest(
    "backflow indication context is recognized cautiously",
    () => {
        const result = getKnowledge("Backflow indication at floor drain with wastewater backing up.");

        assertHasCause(result, "possible backflow indication at sanitary drain");
        assert.equal(/confirmed blockage|confirmed pipe failure/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "poor support and insulation context is recognized",
    () => {
        const result = getKnowledge("Unsupported pipe and damaged pipe insulation with poor support at drain pipe.");

        assertHasCause(result, "poor support or protection of sanitary pipework");
    }
);

runTest(
    "damaged connection and valve context is recognized",
    () => {
        const result = getKnowledge("Damaged connection, loose valve, and deteriorated fitting below wash basin.");

        assertHasCause(result, "visible deterioration at sanitary connection");
    }
);

runTest(
    "water quality and laboratory context remains empty",
    () => {
        const result = getKnowledge("Water quality laboratory analysis and legionella discussion for drinking water without visible defect.");

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "utility bill context remains empty",
    () => {
        const result = SanitarySystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "document",
                location: "tenant file",
                description: "Water bill and utility bill for drinking water consumption."
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "measurements can contribute text without invented test results",
    () => {
        const result = SanitarySystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "sanitary",
                location: "sink",
                description: "Visible moisture below sink."
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "leakage at trap and water staining",
                    location: "wash basin trap"
                }
            ]
        });

        assertHasCause(result, "visible leakage around sanitary component");
        assert.equal(/pressure test|cctv inspection|laboratory|cfu|bar measured|flow rate measured/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "stable public provider contract",
    () => {
        const result = getKnowledge("Visible leakage at sink trap.");

        assert.equal(result.domain, "sanitary-systems");
        assert.ok(Array.isArray(result.hypotheses));
        assert.ok(result.hypotheses.length > 0);

        result.hypotheses.forEach((hypothesis) => {
            assert.deepStrictEqual(Object.keys(hypothesis), [
                "id",
                "cause",
                "classification",
                "supportingIndicators",
                "contradictingIndicators",
                "requiredVerification",
                "potentialConsequences",
                "recommendedActions",
                "riskRelevance",
                "riskRelevanceVersion",
                "capexRelevance",
                "valuationRelevance"
            ]);
            assert.equal(typeof hypothesis.id, "string");
            assert.equal(typeof hypothesis.cause, "string");
            assert.ok(Array.isArray(hypothesis.supportingIndicators));
            assert.ok(Array.isArray(hypothesis.contradictingIndicators));
            assert.ok(Array.isArray(hypothesis.requiredVerification));
            assert.ok(Array.isArray(hypothesis.potentialConsequences));
            assert.ok(Array.isArray(hypothesis.recommendedActions));
            assert.equal(hypothesis.riskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        });
    }
);

runTest(
    "deterministic output and stable hypothesis order",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "wash basin",
                description: "Visible leakage, water staining, and missing seal at wash basin trap."
            }
        };

        const first = SanitarySystemsKnowledgeProvider.getKnowledge(input);
        const second = SanitarySystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(ids(first).slice(0, 3), [
            "visible-corrosion-staining-or-moisture",
            "visible-leakage-at-sanitary-component",
            "missing-or-damaged-sanitary-seal"
        ]);
    }
);

runTest(
    "input immutability",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "Blocked floor drain and unpleasant odour."
            },
            building: {
                sanitarySystemType: "domestic sanitary installation"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "standing water at floor drain",
                    location: "bathroom"
                }
            ]
        };
        const before = JSON.stringify(input);

        SanitarySystemsKnowledgeProvider.getKnowledge(input);

        assert.equal(JSON.stringify(input), before);
    }
);

runTest(
    "fresh arrays are returned on each call",
    () => {
        const first = getKnowledge("Visible leakage at sink trap.");
        const second = getKnowledge("Visible leakage at sink trap.");

        assert.notEqual(first.hypotheses, second.hypotheses);
        assert.notEqual(first.hypotheses[0].supportingIndicators, second.hypotheses[0].supportingIndicators);
    }
);

runTest(
    "no prohibited diagnostic compliance or mandate language",
    () => {
        const result = getKnowledge("Backflow indication, blocked drain, visible leakage, and deteriorated pipe fitting.");
        const text = allHypothesisText(result);

        assert.equal(/confirmed contamination|confirmed blockage|confirmed pipe failure|code violation|non-compliant|non compliant|replacement required|repair required|mandatory replacement|legionella diagnosis|insulation failure/i.test(text), false);
    }
);

runTest(
    "hypothesis wording remains cautious and verification oriented",
    () => {
        const result = getKnowledge("Visible leakage and corrosion around waste water pipe.");
        const text = allHypothesisText(result);

        assert.equal(/may indicate|possible|visually|visual inspection alone|further inspection may be appropriate/i.test(text), true);
    }
);

runTest(
    "no duplicate hypothesis ids",
    () => {
        const result = getKnowledge("Visible leakage, damaged fixture, missing seal, blocked drain, and corrosion around sanitary pipe.");

        assert.equal(new Set(ids(result)).size, ids(result).length);
    }
);

console.log("SanitarySystemsKnowledgeProvider tests completed successfully.");
