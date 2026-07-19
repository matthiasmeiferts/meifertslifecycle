import assert from "node:assert/strict";

import ExpertIntelligenceTerminologyRegistry from "../portal/core/reasoning/ExpertIntelligenceTerminologyRegistry.js";

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
    "English windows-doors terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("windows-doors", {
            finding: {
                category: "window",
                description: "defective perimeter seal with draught"
            }
        }), true);
    }
);

runTest(
    "German umlaut terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("windows-doors", {
            finding: {
                category: "Fenster",
                description: "undichte Dichtung mit Zugluft am Rahmen"
            }
        }), true);
    }
);

runTest(
    "German ASCII variants are recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("windows-doors", {
            finding: {
                category: "Aussentuer",
                description: "beschaedigte Tuerdichtung an der Schwelle"
            }
        }), true);
    }
);

runTest(
    "mixed German and English terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("windows-doors", {
            finding: {
                category: "window",
                description: "Rahmen mit undichte seal und draught"
            }
        }), true);
    }
);

runTest(
    "domain evidence requires component and issue terminology",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("windows-doors", {
            finding: {
                description: "Fenster ohne sichtbare Zustandsangabe"
            }
        }), false);
    }
);

console.log("ExpertIntelligenceTerminologyRegistry tests completed successfully.");