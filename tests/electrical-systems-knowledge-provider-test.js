import assert from "node:assert/strict";
import ElectricalSystemsKnowledgeProvider from "../portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js";
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
    return ElectricalSystemsKnowledgeProvider.getKnowledge({
        finding: {
            category: "electrical",
            location: "distribution board",
            description,
            observations: []
        },
        building: {
            electricalSystemType: "low-voltage building installation"
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
    assert.equal(result.domain, "electrical-systems");
    assert.ok(causes(result).includes(cause), `Expected cause ${cause} in ${causes(result).join(", ")}`);
}

runTest(
    "stable empty contract for empty input",
    () => {
        assert.deepStrictEqual(ElectricalSystemsKnowledgeProvider.getKnowledge(), {
            domain: "electrical-systems",
            hypotheses: []
        });
        assert.deepStrictEqual(ElectricalSystemsKnowledgeProvider.getKnowledge({}), {
            domain: "electrical-systems",
            hypotheses: []
        });
    }
);

runTest(
    "irrelevant input returns empty contract",
    () => {
        const result = getKnowledge("Room wall paint discoloration near decorative switch style only.", {
            finding: {
                category: "interior",
                location: "living room",
                description: "Decorative switch style and wall paint color noted without damage or electrical observation."
            },
            building: {},
            measurements: []
        });

        assert.deepStrictEqual(result, {
            domain: "electrical-systems",
            hypotheses: []
        });
    }
);

runTest(
    "metadata-only electrical input returns empty contract",
    () => {
        const result = ElectricalSystemsKnowledgeProvider.getKnowledge({
            building: {
                electricalSystemType: "low-voltage building installation",
                electricalInstallationAge: "older installation",
                maintenanceStatus: "unknown"
            }
        });

        assert.deepStrictEqual(result, {
            domain: "electrical-systems",
            hypotheses: []
        });
    }
);

runTest(
    "distribution board overheating context is recognized conservatively",
    () => {
        const result = getKnowledge("Distribution board has visible overheating marks, scorching, and heat discoloration near circuit breaker.");

        assertHasCause(result, "visible thermal stress or overheating indicators");
        assert.equal(ids(result)[0], "visible-thermal-stress-indication");
        assert.equal(/fire risk confirmed|overheating confirmed|unsafe/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "missing cover context is recognized",
    () => {
        const result = getKnowledge("Electrical panel missing cover with damaged electrical enclosure in service area.");

        assertHasCause(result, "damaged or incomplete electrical enclosure");
    }
);

runTest(
    "exposed conductor context is recognized without confirmed shock wording",
    () => {
        const result = getKnowledge("Junction box has exposed conductors and visible bare wire at open cable end.");

        assertHasCause(result, "exposed or insufficiently protected conductors");
        assert.equal(/shock hazard confirmed|unsafe|electrical installation is unsafe/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "corrosion or moisture-adjacent context is recognized",
    () => {
        const result = getKnowledge("Corrosion in electrical panel with water marks near consumer unit and moisture proximity.");

        assertHasCause(result, "visible corrosion or moisture-related electrical deterioration");
    }
);

runTest(
    "temporary wiring context is recognized",
    () => {
        const result = getKnowledge("Temporary wiring with unsupported cable and poor cable support in plant room.");

        assertHasCause(result, "temporary or poorly supported wiring");
    }
);

runTest(
    "damaged socket context is recognized",
    () => {
        const result = getKnowledge("Damaged socket and cracked socket cover with loose socket at wall outlet.");

        assertHasCause(result, "damaged socket or switch component");
    }
);

runTest(
    "damaged switch context is recognized",
    () => {
        const result = getKnowledge("Damaged switch with cracked switch cover and loose switch fixing.");

        assertHasCause(result, "damaged socket or switch component");
    }
);

runTest(
    "missing labeling context is recognized",
    () => {
        const result = getKnowledge("Distribution board labeling missing with unclear circuit labeling and unlabeled circuit breaker.");

        assertHasCause(result, "unclear or missing circuit labeling");
    }
);

runTest(
    "aged electrical component context is recognized without age-only conclusion",
    () => {
        const result = getKnowledge("Old fuse box with aged electrical component and visible age-related deterioration.");

        assertHasCause(result, "aged or visibly deteriorated electrical components");
        assert.equal(/replacement required|rewiring required|replace/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "age metadata alone remains empty",
    () => {
        const result = ElectricalSystemsKnowledgeProvider.getKnowledge({
            building: {
                electricalInstallationAge: "old consumer unit"
            }
        });

        assert.equal(result.hypotheses.length, 0);
    }
);

runTest(
    "overloaded extension context remains possible arrangement only",
    () => {
        const result = getKnowledge("Overloaded adapter with multiple extension leads and daisy chained extension near desk.");

        assertHasCause(result, "possible overloaded extension or adapter arrangement");
        assert.equal(/circuit overload confirmed|overload confirmed/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "grounding or bonding observation is recognized without continuity conclusion",
    () => {
        const result = getKnowledge("Loose grounding conductor and missing bonding conductor visible near electrical enclosure.");

        assertHasCause(result, "visible grounding or bonding irregularity");
        assert.equal(/continuity confirmed|grounding failure confirmed|bonding failure confirmed/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "measurements can contribute text without invented measurement results",
    () => {
        const result = ElectricalSystemsKnowledgeProvider.getKnowledge({
            finding: {
                category: "electrical",
                location: "consumer unit",
                description: "Visible discoloration at consumer unit."
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "scorch marks at electrical panel",
                    location: "distribution board"
                }
            ]
        });

        assertHasCause(result, "visible thermal stress or overheating indicators");
        assert.equal(/\b(230|400|30\s?ma|ohm|ampere|amps|degrees celsius|temperature measured)\b/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "stable public provider contract",
    () => {
        const result = getKnowledge("Damaged socket with loose socket cover.");

        assert.equal(result.domain, "electrical-systems");
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
                category: "electrical",
                location: "distribution board",
                description: "Missing cover, visible overheating marks, and unclear circuit labeling at electrical panel."
            }
        };

        const first = ElectricalSystemsKnowledgeProvider.getKnowledge(input);
        const second = ElectricalSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(ids(first).slice(0, 3), [
            "visible-thermal-stress-indication",
            "damaged-or-incomplete-electrical-enclosure",
            "unclear-or-missing-circuit-labeling"
        ]);
    }
);

runTest(
    "input immutability",
    () => {
        const input = {
            finding: {
                category: "electrical",
                location: "fuse box",
                description: "Missing fuse box cover and damaged electrical enclosure."
            },
            building: {
                electricalSystemType: "low-voltage building installation"
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "missing cover",
                    location: "fuse box"
                }
            ]
        };
        const before = JSON.stringify(input);

        ElectricalSystemsKnowledgeProvider.getKnowledge(input);

        assert.equal(JSON.stringify(input), before);
    }
);

runTest(
    "fresh arrays are returned on each call",
    () => {
        const first = getKnowledge("Damaged socket and cracked socket cover.");
        const second = getKnowledge("Damaged socket and cracked socket cover.");

        assert.notEqual(first.hypotheses, second.hypotheses);
        assert.notEqual(first.hypotheses[0].supportingIndicators, second.hypotheses[0].supportingIndicators);
    }
);

runTest(
    "no confirmed unsafe non-compliant or repair mandate language",
    () => {
        const result = getKnowledge("Exposed conductors, overloaded adapter, and scorching at distribution board.");
        const text = allHypothesisText(result);

        assert.equal(/electrical installation is unsafe|code violation|non-compliant|non compliant|fire risk confirmed|shock hazard confirmed|circuit overload confirmed|insulation failure confirmed|replacement required|rewiring required/i.test(text), false);
    }
);

runTest(
    "hypothesis wording remains cautious and verification oriented",
    () => {
        const result = getKnowledge("Exposed conductor and scorching at electrical panel.");
        const text = allHypothesisText(result);

        assert.equal(/may indicate|may be associated with|possible|further electrical inspection may be appropriate|condition cannot be confirmed without testing|visual inspection alone is insufficient/i.test(text), true);
        assert.equal(/confirmed defect|proves|diagnosed/i.test(text), false);
    }
);

runTest(
    "no duplicate hypothesis ids",
    () => {
        const result = getKnowledge("Damaged socket, damaged switch, missing cover, exposed conductors, and temporary wiring.");
        const uniqueIds = new Set(ids(result));

        assert.equal(uniqueIds.size, result.hypotheses.length);
    }
);

console.log("ElectricalSystemsKnowledgeProvider tests completed successfully.");
