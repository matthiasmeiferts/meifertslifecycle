import assert from "node:assert/strict";

import ExpertIntelligenceLanguage from "../portal/core/reasoning/ExpertIntelligenceLanguage.js";

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
    "omitted language normalizes to English",
    () => {
        assert.equal(ExpertIntelligenceLanguage.normalize(), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(undefined), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(null), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(""), "en");
    }
);

runTest(
    "canonical English and German values are accepted",
    () => {
        assert.equal(ExpertIntelligenceLanguage.normalize("en"), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize("de"), "de");
        assert.equal(ExpertIntelligenceLanguage.normalize(" DE "), "de");
    }
);

runTest(
    "unsupported language normalizes to English",
    () => {
        assert.equal(ExpertIntelligenceLanguage.normalize("fr"), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize("german"), "en");
    }
);

runTest(
    "non-string language values normalize to English without throwing",
    () => {
        assert.equal(ExpertIntelligenceLanguage.normalize({ language: "de" }), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(["de"]), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(1), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(true), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(() => "de"), "en");
        assert.equal(ExpertIntelligenceLanguage.normalize(Symbol("de")), "en");
    }
);

runTest(
    "supported language data is not externally mutable",
    () => {
        assert.equal(Object.isFrozen(ExpertIntelligenceLanguage.supportedLanguages), true);
        assert.throws(() => {
            ExpertIntelligenceLanguage.supportedLanguages.push("fr");
        }, TypeError);
        assert.deepStrictEqual(ExpertIntelligenceLanguage.supportedLanguages, ["en", "de"]);
    }
);

console.log("ExpertIntelligenceLanguage tests completed successfully.");