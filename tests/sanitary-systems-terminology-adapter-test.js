import assert from "node:assert/strict";

import SanitarySystemsTerminologyAdapter from "../portal/core/reasoning/adapters/SanitarySystemsTerminologyAdapter.js";

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
    return SanitarySystemsTerminologyAdapter.adapt(input);
}

const germanInput = {
    finding: {
        category: "Sanitärinstallation",
        location: "Waschtisch Siphon",
        description: "sichtbar undicht, tropfend am Anschluss mit Leckagespur"
    },
    measurements: [
        { type: "Notiz", value: "Feuchtespur am Siphon", location: "Waschbecken" }
    ]
};

runTest("German sanitary terminology creates separate canonical context", () => {
    const adapted = adapt(germanInput);

    assert.deepStrictEqual(adapted.canonicalContext.matchedSignalIds, ["visible-leakage-at-sanitary-component", "visible-corrosion-staining-or-moisture"]);
    assert.deepStrictEqual(adapted.canonicalContext.terms, ["sanitary component", "visible leakage", "dripping", "corrosion", "staining", "moisture"]);
});

runTest("adapter preserves original technical input exactly", () => {
    const adapted = adapt(germanInput);

    assert.deepStrictEqual(adapted.input, germanInput);
    assert.equal(adapted.input.finding.description, germanInput.finding.description);
    assert.equal(adapted.input.measurements[0].value, germanInput.measurements[0].value);
});

runTest("original input and nested values are not mutated", () => {
    const input = structuredClone(germanInput);
    const original = structuredClone(input);

    adapt(input);

    assert.deepStrictEqual(input, original);
});

runTest("canonical context is not stored in technical fields", () => {
    const adapted = adapt(germanInput);
    const technicalText = JSON.stringify(adapted.input);

    adapted.canonicalContext.terms.forEach((term) => {
        assert.equal(technicalText.includes(term), false);
    });
    assert.equal(adapted.input.context, undefined);
    assert.equal(adapted.input.language, undefined);
});

runTest("single generic words do not create canonical context", () => {
    ["water", "pipe", "drain", "smell", "leak", "wet"].forEach((word) => {
        assert.equal(adapt({ finding: { description: word } }).canonicalContext, null, word);
    });
});

runTest("unsupported and non-sanitary text produces no canonical context", () => {
    assert.equal(adapt({ finding: { category: "interior", description: "paint scratch" } }).canonicalContext, null);
    assert.equal(adapt({ finding: { category: "roof", description: "leaking gutter" } }).canonicalContext, null);
});

runTest("mixed-language sanitary terminology is recognized deterministically", () => {
    const first = adapt({ finding: { category: "sanitary", location: "WC Anschluss", description: "fehlende Dichtung and damaged seal" } });
    const second = adapt({ finding: { category: "sanitary", location: "WC Anschluss", description: "fehlende Dichtung and damaged seal" } });

    assert.deepStrictEqual(first, second);
    assert.deepStrictEqual(first.canonicalContext.matchedSignalIds, ["missing-or-damaged-sanitary-seal"]);
});

runTest("output contains no conclusion or diagnosis fields", () => {
    const text = JSON.stringify(adapt(germanInput).canonicalContext);

    assert.equal(/diagnosis|confirmed|conclusion|confidence|status/i.test(text), false);
});

console.log("SanitarySystemsTerminologyAdapter tests completed successfully.");