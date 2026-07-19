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

runTest(
    "German sanitary terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("sanitary-systems", {
            finding: {
                category: "Sanitärinstallation",
                location: "Waschtisch Siphon",
                description: "sichtbar undicht und tropfend am Anschluss"
            }
        }), true);
    }
);

runTest(
    "German sanitary ASCII variants are recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("sanitary-systems", {
            finding: {
                category: "Sanitaerinstallation",
                location: "Waschbecken Anschluss",
                description: "beschaedigte Dichtung und Feuchtespur am Siphon"
            }
        }), true);
    }
);

runTest(
    "mixed sanitary terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("sanitary-systems", {
            finding: {
                category: "sanitary",
                location: "WC Anschluss",
                description: "fehlende Dichtung and damaged seal"
            }
        }), true);
    }
);

runTest(
    "sanitary evidence requires component issue and signal terminology",
    () => {
        [
            { finding: { description: "water" } },
            { finding: { description: "pipe" } },
            { finding: { description: "drain" } },
            { finding: { description: "smell" } },
            { finding: { description: "leak" } },
            { finding: { description: "wet" } },
            { finding: { category: "Sanitärinstallation", description: "ohne sichtbaren Defekt" } },
            { finding: { category: "interior", description: "connection moisture and staining" } }
        ].forEach((input) => {
            assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("sanitary-systems", input), false);
        });
    }
);

runTest(
    "German electrical terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("electrical-systems", {
            finding: {
                category: "Elektroinstallation",
                location: "Sicherungskasten",
                description: "fehlende Abdeckung und offenes Gehäuse an der Verteilung"
            }
        }), true);
    }
);

runTest(
    "mixed electrical terminology is recognized",
    () => {
        assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("electrical-systems", {
            finding: {
                category: "electrical",
                location: "Unterverteilung",
                description: "Schmorspuren and missing circuit labeling at circuit breaker"
            }
        }), true);
    }
);

runTest(
    "electrical evidence requires component issue and signal terminology",
    () => {
        [
            { finding: { description: "cable" } },
            { finding: { description: "wire" } },
            { finding: { description: "power" } },
            { finding: { description: "current" } },
            { finding: { description: "socket" } },
            { finding: { description: "light" } },
            { finding: { description: "switch" } },
            { finding: { description: "panel" } },
            { finding: { description: "box" } },
            { finding: { description: "heat" } },
            { finding: { description: "smell" } },
            { finding: { description: "burn" } },
            { finding: { description: "damage" } },
            { finding: { category: "Elektroinstallation", description: "ohne sichtbaren Defekt" } }
        ].forEach((input) => {
            assert.equal(ExpertIntelligenceTerminologyRegistry.hasDomainEvidence("electrical-systems", input), false);
        });
    }
);

console.log("ExpertIntelligenceTerminologyRegistry tests completed successfully.");