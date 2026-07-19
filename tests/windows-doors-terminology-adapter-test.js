import assert from "node:assert/strict";

import ExpertReasoningEngine from "../portal/core/ExpertReasoningEngine.js";
import WindowsDoorsKnowledgeProvider from "../portal/core/knowledge/WindowsDoorsKnowledgeProvider.js";
import WindowsDoorsReasoningCoordinator from "../portal/core/reasoning/adapters/WindowsDoorsReasoningCoordinator.js";
import WindowsDoorsTerminologyAdapter from "../portal/core/reasoning/adapters/WindowsDoorsTerminologyAdapter.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function adapt(input) {
    return WindowsDoorsTerminologyAdapter.adapt(input);
}

function canonicalTerms(input) {
    return adapt(input).canonicalContext?.terms || [];
}

function assertNoForbiddenOutput(value) {
    const text = JSON.stringify(value);

    assert.equal(/language/.test(text), false);
    assert.equal(/diagnosis|confirmed|conclusion|confidence|status/i.test(JSON.stringify(value.canonicalContext || {})), false);
}

const germanInput = {
    finding: {
        category: "Fenster",
        location: "Fensterrahmen",
        description: "undichte Dichtung mit Zugluft am Rahmen"
    },
    building: {
        frameMaterial: "Holz"
    },
    measurements: [
        { type: "note", value: "Zugluft", location: "Rahmen" }
    ]
};

runTest("German terminology creates canonical English terms", () => {
    assert.deepStrictEqual(canonicalTerms(germanInput), ["window", "perimeter seal", "joint seal", "frame connection", "draught"]);
});

runTest("English terminology creates canonical English terms", () => {
    const terms = canonicalTerms({ finding: { category: "window", location: "frame", description: "perimeter seal draught" } });

    assert.deepStrictEqual(terms, ["window", "perimeter seal", "joint seal", "frame connection", "draught"]);
});

runTest("mixed-language terminology creates canonical English terms", () => {
    const terms = canonicalTerms({ finding: { category: "window", location: "Rahmen", description: "undichte seal with draught" } });

    assert.deepStrictEqual(terms, ["window", "perimeter seal", "joint seal", "frame connection", "draught"]);
});

runTest("original finding.description remains exactly unchanged", () => {
    const adapted = adapt(germanInput);

    assert.equal(adapted.input.finding.description, germanInput.finding.description);
});

runTest("original fields remain present", () => {
    const adapted = adapt(germanInput);

    assert.equal(adapted.input.finding.category, germanInput.finding.category);
    assert.equal(adapted.input.finding.location, germanInput.finding.location);
    assert.equal(adapted.input.building.frameMaterial, germanInput.building.frameMaterial);
    assert.equal(adapted.input.measurements[0].value, germanInput.measurements[0].value);
});

runTest("original input and nested data are not mutated", () => {
    const input = structuredClone(germanInput);
    const original = structuredClone(input);

    adapt(input);

    assert.deepStrictEqual(input, original);
    assert.deepStrictEqual(input.finding, original.finding);
    assert.deepStrictEqual(input.measurements, original.measurements);
});

runTest("unsupported text produces no canonical context", () => {
    const adapted = adapt({ finding: { category: "interior", description: "paint scratch" } });

    assert.equal(adapted.canonicalContext, null);
});

runTest("non-windows input is not accepted by this domain-specific adapter", () => {
    const adapted = adapt({ finding: { category: "roof", description: "rain ingress at roof flashing" } });

    assert.equal(adapted.canonicalContext, null);
});

runTest("output contains no language property and no conclusion fields", () => {
    const adapted = adapt(germanInput);

    assertNoForbiddenOutput(adapted);
});

runTest("duplicate canonical terms are removed", () => {
    const terms = canonicalTerms({ finding: { category: "window", location: "window frame", description: "window perimeter seal perimeter seal draught draught" } });

    assert.equal(new Set(terms).size, terms.length);
});

runTest("canonical term order is deterministic and repeated adaptation is deeply equal", () => {
    const first = adapt(germanInput);
    const second = adapt(germanInput);

    assert.deepStrictEqual(first, second);
    assert.deepStrictEqual(first.canonicalContext.terms, ["window", "perimeter seal", "joint seal", "frame connection", "draught"]);
});

runTest("specific seal terminology outranks generic draught while retaining generic context", () => {
    const adapted = adapt(germanInput);
    const terms = adapted.canonicalContext.terms;

    assert.ok(terms.indexOf("perimeter seal") < terms.indexOf("draught"));
    assert.ok(terms.includes("draught"));
});

runTest("canonical context is separate and not stored in technical fields", () => {
    const adapted = adapt(germanInput);

    assert.deepStrictEqual(adapted.input, germanInput);
    assert.equal(JSON.stringify(adapted.input.measurements).includes("perimeter seal"), false);
    assert.equal(JSON.stringify(adapted.input.finding).includes("perimeter seal"), false);
    assert.equal(JSON.stringify(adapted.input.building).includes("perimeter seal"), false);
    assert.equal(adapted.input.context, undefined);
    assert.equal(adapted.input.language, undefined);
    assert.deepStrictEqual(adapted.canonicalContext.matchedSignalIds, ["defective-perimeter-seal", "air-leakage"]);
});

runTest("adapter-only internal context does not appear in public engine result", () => {
    const result = ExpertReasoningEngine.analyze(germanInput, { language: "de" });

    assert.equal(JSON.stringify(result).includes("expertIntelligenceCanonicalContext"), false);
    assert.equal(JSON.stringify(result).includes("perimeter seal") && result.primaryHypothesis.cause !== "defective perimeter seal", false);
});

runTest("canonical terms do not appear in public supporting or missing evidence", () => {
    const result = ExpertReasoningEngine.analyze(germanInput, { language: "de" });
    const evidenceText = JSON.stringify([result.supportingEvidence, result.missingEvidence]);

    canonicalTerms(germanInput).forEach((term) => {
        assert.equal(evidenceText.includes(term), false);
    });
});

runTest("six German and mixed cases select stable hypotheses without synthetic evidence", () => {
    const cases = [
        {
            name: "German perimeter seal and draught",
            input: { finding: { category: "Fenster", location: "Fensterrahmen", description: "undichte Dichtung mit Zugluft am Rahmen" } },
            matchedSignalIds: ["defective-perimeter-seal", "air-leakage"],
            providerHypothesisIds: [],
            primaryId: "defective-perimeter-seal"
        },
        {
            name: "German exterior-door threshold seal",
            input: { finding: { category: "Außentür", location: "Schwelle", description: "undichte Außentürdichtung mit Zugluft" } },
            matchedSignalIds: ["defective-exterior-door-seal", "defective-flashing-or-sill-connection", "air-leakage"],
            providerHypothesisIds: [],
            primaryId: "defective-exterior-door-seal"
        },
        {
            name: "German glazing damage",
            input: { finding: { category: "Verglasung", location: "Scheibe", description: "Glasscheibe gerissen mit Glasbruch" } },
            matchedSignalIds: ["glazing-damage"],
            providerHypothesisIds: [],
            primaryId: "glazing-damage"
        },
        {
            name: "German condensation",
            input: { finding: { category: "Fenster", location: "Verglasung", description: "Kondensation und Tauwasser an der Scheibe" } },
            matchedSignalIds: ["condensation-on-glazing-or-frame"],
            providerHypothesisIds: [],
            primaryId: "condensation-on-glazing-or-frame"
        },
        {
            name: "German frame distortion",
            input: { finding: { category: "Fenster", location: "Rahmen", description: "verzogener Rahmen und klemmender Flügel, Rahmen verzogen" } },
            matchedSignalIds: ["distorted-frame-or-sash"],
            providerHypothesisIds: [],
            primaryId: "distorted-frame-or-sash"
        },
        {
            name: "Mixed installation workmanship",
            input: { finding: { category: "window", location: "Anschluss", description: "Montagefehler and poor installation workmanship" } },
            matchedSignalIds: ["installation-workmanship-defect"],
            providerHypothesisIds: ["installation-workmanship-defect"],
            primaryId: "installation-workmanship-defect"
        }
    ];

    cases.forEach((entry) => {
        const adapted = adapt(entry.input);
        const providerKnowledge = WindowsDoorsKnowledgeProvider.getKnowledge(adapted.input);
        const reasoning = WindowsDoorsReasoningCoordinator.build({
            providerKnowledge,
            input: adapted.input,
            canonicalContext: adapted.canonicalContext
        });
        const providerHypothesisIds = providerKnowledge.hypotheses.map((hypothesis) => hypothesis.id);

        assert.deepStrictEqual(adapted.canonicalContext.matchedSignalIds, entry.matchedSignalIds, entry.name);
        assert.deepStrictEqual(providerHypothesisIds, entry.providerHypothesisIds, entry.name);
        assert.equal(reasoning.primaryHypothesis.id, entry.primaryId, entry.name);
        if (entry.providerHypothesisIds.length === 0) {
            assert.deepStrictEqual(reasoning.supportingEvidence, [], entry.name);
        }
    });
});

console.log("WindowsDoorsTerminologyAdapter tests completed successfully.");