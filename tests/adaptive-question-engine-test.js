import assert from "node:assert/strict";
import LocationProfileManager from "../portal/core/LocationProfileManager.js";
import AdaptiveQuestionEngine from "../portal/core/AdaptiveQuestionEngine.js";
import DamageHypothesisEngine from "../portal/core/DamageHypothesisEngine.js";

const pattayaProfile = LocationProfileManager.create({
    country: "TH",
    region: "Pattaya / Chonburi",
    propertyType: LocationProfileManager.PROPERTY_TYPES.CONDOMINIUM_UNIT,
    availableMinutes: 60
});

assert.equal(pattayaProfile.country, "TH");
assert.equal(pattayaProfile.documentationPolicy.mode, "availability_check_only");
assert.ok(pattayaProfile.riskFocus.includes("coastal_corrosion"));

const questions = [
    {
        id: "TH-BALCONY-WATERPROOFING-001",
        module: "Balcony",
        category: "Waterproofing",
        text: "Balcony waterproofing and drainage visibly intact?",
        priority: "high",
        appliesTo: {
            countries: ["TH"],
            propertyTypes: ["condominium_unit"],
            timeModes: ["short", "standard", "full"]
        },
        requires: {
            photo: true,
            measurementIf: ["Auff."]
        },
        riskTags: ["balcony_waterproofing", "moisture", "capex"],
        capexRelevance: "high",
        followUpIf: {
            "Auff.": ["TH-BALCONY-DRAINAGE-002"]
        }
    },
    {
        id: "DE-WEG-DOCUMENTS-001",
        module: "Documents",
        category: "WEG",
        text: "WEG documents available?",
        priority: "medium",
        appliesTo: {
            countries: ["DE"]
        },
        requires: {
            document: true
        },
        riskTags: ["document_validation"]
    }
];

const plan = AdaptiveQuestionEngine.getInspectionPlan(questions, {}, {
    locationProfile: pattayaProfile
});

assert.equal(plan.nextQuestions[0].id, "TH-BALCONY-WATERPROOFING-001");
assert.equal(plan.skipCandidates[0].id, "DE-WEG-DOCUMENTS-001");

const evaluation = AdaptiveQuestionEngine.evaluateAnswer(
    questions[0],
    { value: "Auff." },
    pattayaProfile
);

assert.ok(evaluation.requiredEvidence.includes("photo"));
assert.ok(evaluation.requiredEvidence.includes("measurement"));
assert.ok(evaluation.followUpQuestionIds.includes("TH-BALCONY-DRAINAGE-002"));
assert.equal(evaluation.riskSignals.length, 1);

const damage = DamageHypothesisEngine.analyze({
    description: "Moisture stain below balcony door",
    pattern: DamageHypothesisEngine.PATTERNS.BALCONY_LEAKAGE
}, {
    locationProfile: pattayaProfile
});

assert.equal(damage.pattern, DamageHypothesisEngine.PATTERNS.BALCONY_LEAKAGE);
assert.equal(damage.hypotheses.reduce((sum, item) => sum + item.probability, 0), 100);
assert.ok(damage.requiredEvidence.includes("photo"));

console.log("AdaptiveQuestionEngine tests passed.");
