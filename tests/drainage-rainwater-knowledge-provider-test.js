import assert from "node:assert/strict";

import DrainageRainwaterKnowledgeProvider from "../portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js";

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
    return DrainageRainwaterKnowledgeProvider.getKnowledge({
        finding: {
            category: "drainage",
            location: "external rainwater drainage",
            description,
            observations: []
        },
        building: {
            roofType: "flat roof",
            drainageSystem: "rainwater drainage"
        },
        measurements: [],
        ...overrides
    });
}

function causes(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.cause);
}

function ids(result) {
    return result.hypotheses.map((hypothesis) => hypothesis.id);
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
    assert.ok(causes(result).includes(cause), `Expected cause: ${cause}`);
}

runTest(
    "blocked gutter produces blocked-gutter hypothesis",
    () => {
        assertHasCause(getKnowledge("Blocked gutter with debris in gutter and overflow."), "blocked rainwater gutter");
    }
);

runTest(
    "gutter overflow produces drainage hypothesis but does not confirm insufficient capacity",
    () => {
        const result = getKnowledge("Gutter overflow observed during rainfall at the rainwater gutter.");
        const text = allHypothesisText(result);

        assertHasCause(result, "insufficient gutter drainage");
        assert.equal(/enough to conclude insufficient gutter capacity/i.test(text), true);
        assert.equal(/confirmed insufficient capacity|confirmed capacity|capacity confirmed/i.test(text), false);
    }
);

runTest(
    "defective gutter produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Damaged gutter and deformed gutter section at eaves."), "defective rainwater gutter");
    }
);

runTest(
    "leaking gutter joint produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Leaking gutter joint with dripping below the connection."), "leaking gutter joint");
    }
);

runTest(
    "blocked downpipe produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Blocked downpipe with overflowing downpipe connection."), "blocked downpipe");
    }
);

runTest(
    "leaking downpipe connection produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Leaking downpipe connection at the rainwater pipe joint."), "leaking downpipe connection");
    }
);

runTest(
    "disconnected downpipe produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Disconnected downpipe with missing downpipe connection."), "disconnected downpipe");
    }
);

runTest(
    "blocked roof outlet produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Blocked roof outlet and roof outlet overflow at flat roof."), "blocked roof outlet");
    }
);

runTest(
    "roof ponding near outlet produces drainage hypothesis without roof-membrane failure conclusion",
    () => {
        const result = getKnowledge("Ponding near roof outlet after rainfall.");
        const text = allHypothesisText(result);

        assertHasCause(result, "blocked roof outlet");
        assert.equal(/roof-membrane failure|roof membrane failure|membrane failure/i.test(text), false);
    }
);

runTest(
    "insufficient roof drainage wording produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Insufficient roof drainage with roof water not draining."), "insufficient roof drainage");
    }
);

runTest(
    "blocked emergency outlet produces emergency-drainage hypothesis",
    () => {
        assertHasCause(getKnowledge("Blocked emergency outlet and emergency overflow defect."), "defective emergency drainage");
    }
);

runTest(
    "missing emergency-drainage wording remains an indication requiring verification",
    () => {
        const result = getKnowledge("No visible emergency overflow; missing emergency drainage noted.");
        const hypothesis = result.hypotheses.find((item) => item.id === "missing-emergency-drainage-indication");

        assert.ok(hypothesis);
        assert.equal(/indication|verification-required/i.test(hypothesis.classification), true);
        assert.equal(/absence conclusion/i.test(allHypothesisText(result)), true);
    }
);

runTest(
    "blocked courtyard drain produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Blocked courtyard drain with standing water around building."), "blocked courtyard drain");
    }
);

runTest(
    "blocked external gully produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Blocked external gully and clogged gully at paved area."), "blocked external gully");
    }
);

runTest(
    "defective drainage channel produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Defective drainage channel with damaged drainage channel grate."), "defective drainage channel");
    }
);

runTest(
    "adverse grading produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Ground slopes toward building with adverse grading at entrance."), "adverse site grading");
    }
);

runTest(
    "water directed toward building produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Runoff directed toward facade and water flows toward building."), "water directed toward building");
    }
);

runTest(
    "local surface-water accumulation does not prove inadequate slope",
    () => {
        const result = getKnowledge("Surface water accumulation and standing water around building after rainfall.");
        const text = allHypothesisText(result);

        assertHasCause(result, "local surface-water accumulation");
        assert.equal(/proof of inadequate slope|proves inadequate slope|inadequate construction slope confirmed/i.test(text), false);
    }
);

runTest(
    "uncontrolled downpipe discharge near foundation produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Uncontrolled discharge near foundation from downpipe discharge near foundation."), "uncontrolled discharge near foundation");
    }
);

runTest(
    "backwater indicators produce backwater-risk hypothesis",
    () => {
        assertHasCause(getKnowledge("Backwater and sewer surcharge with water rising from drain."), "backwater-related drainage risk");
    }
);

runTest(
    "missing backwater-protection wording remains unconfirmed and requires verification",
    () => {
        const result = getKnowledge("Missing backwater valve and backwater protection absent in drainage record.");
        const hypothesis = result.hypotheses.find((item) => item.id === "missing-or-defective-backwater-protection-indication");

        assert.ok(hypothesis);
        assert.equal(/verification-required|indication/i.test(hypothesis.classification), true);
        assert.equal(/absence conclusion/i.test(allHypothesisText(result)), true);
    }
);

runTest(
    "age-related deterioration produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Age-related drainage deterioration with old corroded gutter."), "age-related drainage deterioration");
    }
);

runTest(
    "workmanship wording produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Poor drainage installation and incorrect drainage connection."), "workmanship defect");
    }
);

runTest(
    "maintenance-related blockage produces corresponding hypothesis",
    () => {
        assertHasCause(getKnowledge("Drainage not maintained with gutter not cleaned and debris accumulation."), "maintenance-related drainage defect");
    }
);

runTest(
    "unknown input returns the stable empty contract",
    () => {
        assert.deepStrictEqual(DrainageRainwaterKnowledgeProvider.getKnowledge(), {
            domain: "drainage-rainwater",
            hypotheses: []
        });
        assert.deepStrictEqual(DrainageRainwaterKnowledgeProvider.getKnowledge({}), {
            domain: "drainage-rainwater",
            hypotheses: []
        });
    }
);

runTest(
    "irrelevant indoor plumbing input returns the stable empty contract",
    () => {
        const result = DrainageRainwaterKnowledgeProvider.getKnowledge({
            finding: {
                category: "plumbing",
                location: "bathroom",
                description: "Indoor plumbing leak below sink with sanitary drainage odor.",
                observations: ["internal pipe"]
            }
        });

        assert.deepStrictEqual(result, {
            domain: "drainage-rainwater",
            hypotheses: []
        });
    }
);

runTest(
    "generic rain wording does not create a hypothesis",
    () => {
        assert.equal(getKnowledge("Heavy rain occurred yesterday.", { finding: { description: "Heavy rain occurred yesterday." } }).hypotheses.length, 0);
    }
);

runTest(
    "generic pipe leakage without rainwater context does not create a hypothesis",
    () => {
        assert.equal(getKnowledge("Pipe leakage observed below appliance.", { finding: { description: "Pipe leakage observed below appliance." } }).hypotheses.length, 0);
    }
);

runTest(
    "generic standing water without drainage or site context does not create a hypothesis",
    () => {
        assert.equal(getKnowledge("Standing water in a bucket.", { finding: { description: "Standing water in a bucket." } }).hypotheses.length, 0);
    }
);

runTest(
    "generic roof leakage without drainage context does not create a hypothesis",
    () => {
        assert.equal(getKnowledge("Generic roof leakage reported at ceiling.", { finding: { description: "Generic roof leakage reported at ceiling." } }).hypotheses.length, 0);
    }
);

runTest(
    "generic basement moisture without drainage context does not create a hypothesis",
    () => {
        assert.equal(getKnowledge("Basement moisture on internal wall.", { finding: { description: "Basement moisture on internal wall." } }).hypotheses.length, 0);
    }
);

runTest(
    "no automatic roof-membrane failure conclusion",
    () => {
        assert.equal(/roof-membrane failure|roof membrane failure|membrane failure/i.test(allHypothesisText(getKnowledge("Blocked roof outlet with ponding near roof outlet."))), false);
    }
);

runTest(
    "no automatic basement-waterproofing failure conclusion",
    () => {
        assert.equal(/basement-waterproofing failure|basement waterproofing failure|failed basement waterproofing/i.test(allHypothesisText(getKnowledge("Water accumulation at building base from downpipe discharge."))), false);
    }
);

runTest(
    "no automatic facade-failure conclusion",
    () => {
        assert.equal(/facade failure|failed facade/i.test(allHypothesisText(getKnowledge("Leaking downpipe connection causing facade wetting."))), false);
    }
);

runTest(
    "no automatic drainage-system replacement recommendation",
    () => {
        assert.equal(/complete drainage-system replacement|complete drainage system replacement|replace the complete drainage system/i.test(allHypothesisText(getKnowledge("Corroded gutter and damaged downpipe."))), false);
    }
);

runTest(
    "no automatic structural-failure conclusion",
    () => {
        assert.equal(/structural failure|structural instability|foundation failure/i.test(allHypothesisText(getKnowledge("Discharge near foundation from disconnected downpipe."))), false);
    }
);

runTest(
    "requiredVerification is present for every hypothesis",
    () => {
        const result = getKnowledge("Blocked gutter, leaking downpipe connection, and backwater indicators.");

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "riskRelevance, capexRelevance, and valuationRelevance are present",
    () => {
        const result = getKnowledge("Blocked external gully and defective drainage channel.");

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => typeof hypothesis.riskRelevance === "string"));
        assert.ok(result.hypotheses.every((hypothesis) => typeof hypothesis.capexRelevance === "string"));
        assert.ok(result.hypotheses.every((hypothesis) => typeof hypothesis.valuationRelevance === "string"));
    }
);

runTest(
    "no invented standards, thresholds, dimensions, capacities, rainfall values, slopes, or probabilities appear",
    () => {
        const text = allHypothesisText(getKnowledge("Gutter overflow, blocked roof outlet, and surface water accumulation around building."));

        assert.equal(/\b\d+\s*(mm|cm|m|%|l\/s|litres|liters|year|years)\b/i.test(text), false);
        assert.equal(/threshold|rainfall intensity|probability|likelihood|statistical|capacity value|minimum slope|standard requires/i.test(text), false);
    }
);

runTest(
    "deterministic output for repeated equivalent input",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "external wall",
                description: "Blocked gutter and blocked downpipe with debris accumulation.",
                observations: ["overflow"]
            },
            building: {
                drainageSystem: "rainwater drainage"
            },
            measurements: []
        };

        assert.deepStrictEqual(
            DrainageRainwaterKnowledgeProvider.getKnowledge(input),
            DrainageRainwaterKnowledgeProvider.getKnowledge(structuredClone(input))
        );
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "drainage",
                location: "roof",
                description: "Blocked roof outlet with emergency overflow defect.",
                observations: ["ponding near roof outlet"]
            },
            building: {
                constructionYear: 2001,
                roofType: "flat roof",
                drainageSystem: "internal rainwater drainage",
                rainwaterDischargeType: "connected",
                siteDrainageType: "external gullies",
                backwaterProtection: "unknown",
                terrainCondition: "paved"
            },
            measurements: [
                {
                    type: "observation",
                    value: "standing water",
                    unit: "text",
                    location: "roof outlet"
                }
            ]
        };
        const original = structuredClone(input);

        DrainageRainwaterKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "stable hypothesis ordering",
    () => {
        const result = getKnowledge("Blocked gutter, blocked downpipe, and blocked roof outlet.");

        assert.deepStrictEqual(ids(result).slice(0, 3), [
            "blocked-roof-outlet",
            "blocked-rainwater-gutter",
            "blocked-downpipe"
        ]);
    }
);

runTest(
    "stable unique hypothesis ids",
    () => {
        const result = getKnowledge("Blocked gutter, leaking gutter joint, blocked downpipe, leaking downpipe connection, blocked roof outlet, blocked external gully, adverse grading, backwater.");
        const hypothesisIds = ids(result);

        assert.equal(hypothesisIds.length, new Set(hypothesisIds).size);
        assert.ok(hypothesisIds.every((id) => typeof id === "string" && id.length > 0));
    }
);

runTest(
    "all conclusions remain explicitly hypothetical or verification-dependent",
    () => {
        const result = getKnowledge("Blocked gutter, disconnected downpipe, missing emergency overflow, missing backwater valve, and water directed toward building.");
        const text = allHypothesisText(result);

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => /hypothesis|indication/i.test(hypothesis.classification)));
        assert.equal(/confirmed|diagnosed|proven|proves|definitive|certain/i.test(text), false);
    }
);

console.log("DrainageRainwaterKnowledgeProvider tests completed successfully.");