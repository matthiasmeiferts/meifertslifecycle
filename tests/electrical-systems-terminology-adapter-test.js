import assert from "node:assert/strict";

import ElectricalSystemsTerminologyAdapter from "../portal/core/reasoning/adapters/ElectricalSystemsTerminologyAdapter.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

runTest(
    "German electrical terminology produces canonical context without mutating input",
    () => {
        const input = {
            finding: {
                category: "Elektroinstallation",
                location: "Sicherungskasten",
                description: "fehlende Abdeckung und offenes Gehäuse an der Verteilung"
            }
        };
        const original = structuredClone(input);
        const result = ElectricalSystemsTerminologyAdapter.adapt(input);

        assert.deepStrictEqual(input, original);
        assert.deepStrictEqual(result.input, original);
        assert.equal(result.canonicalContext.domainId, "electrical-systems");
        assert.deepStrictEqual(result.canonicalContext.matchedSignalIds, ["damaged-or-incomplete-electrical-enclosure"]);
        assert.ok(result.canonicalContext.terms.includes("electrical enclosure"));
        assert.equal(JSON.stringify(result.input).includes("canonicalContext"), false);
    }
);

runTest(
    "mixed electrical terminology preserves provider-neutral input and ordered signals",
    () => {
        const result = ElectricalSystemsTerminologyAdapter.adapt({
            finding: {
                category: "electrical",
                location: "Unterverteilung",
                description: "Schmorspuren and missing circuit labeling at circuit breaker"
            }
        });

        assert.deepStrictEqual(result.canonicalContext.matchedSignalIds, [
            "visible-thermal-stress-indication",
            "unclear-or-missing-circuit-labeling"
        ]);
        assert.equal(JSON.stringify(result.input).includes("visible overheating marks"), false);
    }
);

runTest(
    "generic electrical words alone do not produce canonical context",
    () => {
        ["cable", "wire", "power", "current", "socket", "light", "switch", "panel", "box", "heat", "smell", "burn", "damage"].forEach((description) => {
            const result = ElectricalSystemsTerminologyAdapter.adapt({
                finding: {
                    category: "inspection",
                    description
                }
            });

            assert.equal(result.canonicalContext, null, description);
        });
    }
);

runTest(
    "irrelevant document context does not produce canonical context",
    () => {
        const result = ElectricalSystemsTerminologyAdapter.adapt({
            finding: {
                category: "document",
                description: "electricity bill and electrical contractor address without observed condition"
            }
        });

        assert.equal(result.canonicalContext, null);
    }
);

console.log("ElectricalSystemsTerminologyAdapter tests completed successfully.");