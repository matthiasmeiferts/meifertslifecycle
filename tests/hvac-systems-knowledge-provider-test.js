import assert from "node:assert/strict";
import HvacSystemsKnowledgeProvider from "../portal/core/knowledge/HvacSystemsKnowledgeProvider.js";

function runTest(name, fn) {
    try {
        fn();
    } catch (error) {
        console.error(`FAILED: ${name}`);
        throw error;
    }
}

function getKnowledge(description, overrides = {}) {
    return HvacSystemsKnowledgeProvider.getKnowledge({
        finding: {
            category: "HVAC",
            location: "plant room",
            description,
            observations: []
        },
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
    return JSON.stringify(result.hypotheses);
}

function assertHasCause(result, cause) {
    assert.equal(result.domain, "hvac-systems");
    assert.ok(causes(result).includes(cause), `Expected cause ${cause} in ${causes(result).join(", ")}`);
}

runTest(
    "unknown input returns stable empty contract",
    () => {
        assert.deepStrictEqual(HvacSystemsKnowledgeProvider.getKnowledge(), {
            domain: "hvac-systems",
            hypotheses: []
        });
        assert.deepStrictEqual(HvacSystemsKnowledgeProvider.getKnowledge({}), {
            domain: "hvac-systems",
            hypotheses: []
        });
    }
);

runTest(
    "metadata-only HVAC input returns empty contract",
    () => {
        const result = HvacSystemsKnowledgeProvider.getKnowledge({
            building: {
                constructionYear: 1998,
                heatingSystemType: "radiator heating",
                heatGeneratorType: "boiler",
                ventilationSystemType: "mechanical ventilation",
                coolingSystemType: "split air-conditioning",
                maintenanceStatus: "unknown"
            }
        });

        assert.deepStrictEqual(result, {
            domain: "hvac-systems",
            hypotheses: []
        });
    }
);

runTest(
    "radiator cold and pressure warning create heating hypotheses",
    () => {
        const result = getKnowledge("Radiator remains cold and heating pressure low at the heating system.");

        assertHasCause(result, "local heating emitter malfunction");
        assertHasCause(result, "heating system pressure-related indication");
    }
);

runTest(
    "gurgling radiator remains trapped-air indication only",
    () => {
        const result = getKnowledge("Gurgling radiator with air in radiator reported by tenant.");

        assertHasCause(result, "air trapped in heating system indication");
        assert.equal(/confirmed air pocket|proves air|air pocket confirmed/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "hydraulic imbalance wording produces verification-dependent hypothesis",
    () => {
        const result = getKnowledge("Uneven heating with some rooms cold and several radiators partially cold.");

        assertHasCause(result, "hydraulic imbalance indication");
        assert.ok(result.hypotheses.some((hypothesis) => hypothesis.id === "hydraulic-imbalance-indication" && /indication/i.test(hypothesis.classification)));
    }
);

runTest(
    "underfloor heating circuit issue is recognized",
    () => {
        assertHasCause(
            getKnowledge("Underfloor heating zone not responding and one heating circuit cold at manifold."),
            "underfloor heating circuit irregularity"
        );
    }
);

runTest(
    "heating control or thermostat malfunction is recognized",
    () => {
        assertHasCause(
            getKnowledge("Thermostat not responding and underfloor heating actuator not responding."),
            "heating control or thermostat malfunction"
        );
    }
);

runTest(
    "heat generator alarm remains operational hypothesis",
    () => {
        const result = getKnowledge("Boiler fault and heating error code displayed; heating system switches off intermittently.");

        assertHasCause(result, "heat generator performance irregularity");
        assertHasCause(result, "intermittent heat generation");
    }
);

runTest(
    "ventilation weak airflow and blocked filter are recognized",
    () => {
        const result = getKnowledge("Mechanical ventilation weak airflow with clogged ventilation filter and air outlet blocked.");

        assertHasCause(result, "ventilation airflow restriction");
        assertHasCause(result, "ventilation filter contamination");
    }
);

runTest(
    "ventilation fan noise produces fan and noise hypotheses",
    () => {
        const result = getKnowledge("Rattling ventilation unit and fan noise during mechanical ventilation operation.");

        assertHasCause(result, "ventilation fan malfunction");
        assertHasCause(result, "excessive ventilation noise");
    }
);

runTest(
    "ventilation controls and stale air remain verification-dependent",
    () => {
        const result = getKnowledge("Ventilation control fault and stale air despite ventilation in several rooms.");

        assertHasCause(result, "ventilation control malfunction");
        assertHasCause(result, "insufficient ventilation operation indication");
    }
);

runTest(
    "ventilation condensate management defect is recognized",
    () => {
        assertHasCause(
            getKnowledge("Water below ventilation unit with ventilation condensate drain blocked."),
            "ventilation condensate-management defect"
        );
    }
);

runTest(
    "air conditioner not cooling produces cooling performance indication",
    () => {
        const result = getKnowledge("Air conditioner not cooling and cooling performance reduced in occupied room.");

        assertHasCause(result, "insufficient cooling performance indication");
        assert.equal(/refrigerant leak confirmed|confirmed refrigerant loss|compressor failure confirmed/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "cooling airflow restriction and dirty filter are recognized",
    () => {
        assertHasCause(
            getKnowledge("Weak cooling airflow with dirty air-conditioning filter at indoor unit."),
            "cooling airflow restriction"
        );
    }
);

runTest(
    "condensate leakage creates condensate hypotheses",
    () => {
        const result = getKnowledge("Air-conditioning unit leaking water; condensate dripping and blocked condensate drain observed.");

        assertHasCause(result, "condensate overflow or leakage");
        assertHasCause(result, "HVAC condensate drainage defect");
    }
);

runTest(
    "evaporator icing stays verification-required",
    () => {
        const result = getKnowledge("Indoor unit icing and ice on cooling coil during air-conditioning operation.");

        assertHasCause(result, "evaporator icing indication");
        assert.equal(/refrigerant defect confirmed|low refrigerant confirmed|compressor failure/i.test(allHypothesisText(result)), false);
    }
);

runTest(
    "HVAC installation and support defects are recognized",
    () => {
        const result = getKnowledge("Poor HVAC installation with unsupported duct and defective bracket at plant-room ventilation duct.");

        assertHasCause(result, "HVAC installation defect indication");
        assertHasCause(result, "unsupported or poorly secured HVAC component");
    }
);

runTest(
    "damaged insulation and corroded HVAC component are recognized",
    () => {
        const result = getKnowledge("Damaged HVAC insulation and corrosion on HVAC component near cooling pipework.");

        assertHasCause(result, "defective insulation on HVAC distribution components");
        assertHasCause(result, "damaged or deteriorated HVAC component");
    }
);

runTest(
    "maintenance deficiency is recognized for heating, ventilation, and cooling",
    () => {
        assertHasCause(getKnowledge("Heating not serviced and heating maintenance overdue."), "heating-system maintenance deficiency indication");
        assertHasCause(getKnowledge("Ventilation not serviced and filter not replaced."), "ventilation maintenance deficiency indication");
        assertHasCause(getKnowledge("Air conditioning not serviced and cooling not maintained."), "cooling-system maintenance deficiency indication");
    }
);

runTest(
    "age-related deterioration requires observed defect wording",
    () => {
        assertHasCause(getKnowledge("Old boiler fault with age-related heating-system deterioration."), "age-related heating-system deterioration");
        assertHasCause(getKnowledge("Old ventilation unit noisy with aged ventilation unit deterioration."), "age-related ventilation-system deterioration");
        assertHasCause(getKnowledge("Old air-conditioning system defect with aged cooling unit deterioration."), "age-related cooling-system deterioration");
    }
);

runTest(
    "generic hot or cold weather does not create HVAC hypotheses",
    () => {
        assert.equal(getKnowledge("Hot weather made the room warm yesterday.").hypotheses.length, 0);
        assert.equal(getKnowledge("Cold weather outside made the room cold.").hypotheses.length, 0);
    }
);

runTest(
    "generic comfort complaint without HVAC component does not create hypotheses",
    () => {
        assert.equal(getKnowledge("The room feels warm and uncomfortable in the afternoon.").hypotheses.length, 0);
        assert.equal(getKnowledge("The room feels cold near the window.").hypotheses.length, 0);
    }
);

runTest(
    "non-HVAC fan, appliance cooling, and domestic pressure false positives are ignored",
    () => {
        assert.equal(getKnowledge("Decorative fan noise in lobby display.").hypotheses.length, 0);
        assert.equal(getKnowledge("Refrigerator cooling not working in tenant appliance.").hypotheses.length, 0);
        assert.equal(getKnowledge("Drinking-water pressure low at kitchen faucet.").hypotheses.length, 0);
    }
);

runTest(
    "natural window ventilation and roof ventilation wording are ignored",
    () => {
        assert.equal(getKnowledge("Natural window ventilation by open windows in office.").hypotheses.length, 0);
        assert.equal(getKnowledge("Roof ventilation opening visible at attic.").hypotheses.length, 0);
    }
);

runTest(
    "generic moisture or mould without HVAC context is ignored",
    () => {
        assert.equal(getKnowledge("Condensation and mould at bathroom ceiling with no ventilation equipment noted.").hypotheses.length, 0);
        assert.equal(getKnowledge("Water leak at kitchen pipework below sink.").hypotheses.length, 0);
    }
);

runTest(
    "requiredVerification is present for every hypothesis",
    () => {
        const result = getKnowledge("Radiator cold, ventilation weak airflow, and air-conditioning unit leaking water.");

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => Array.isArray(hypothesis.requiredVerification) && hypothesis.requiredVerification.length > 0));
    }
);

runTest(
    "riskRelevance, capexRelevance, and valuationRelevance are present",
    () => {
        const result = getKnowledge("Ventilation fan fault and blocked condensate drain at air-conditioning unit.");

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => typeof hypothesis.riskRelevance === "string"));
        assert.ok(result.hypotheses.every((hypothesis) => typeof hypothesis.capexRelevance === "string"));
        assert.ok(result.hypotheses.every((hypothesis) => typeof hypothesis.valuationRelevance === "string"));
    }
);

runTest(
    "no diagnostic certainty, probabilities, capacities, thresholds, or invented standards appear",
    () => {
        const text = allHypothesisText(getKnowledge("Air conditioner not cooling, evaporator icing, radiator cold, and weak ventilation airflow."));

        assert.equal(/confirmed|diagnosed|proven|proves|definitive|certain/i.test(text), false);
        assert.equal(/probability|likelihood|statistical|threshold|standard requires|capacity value|required airflow|minimum airflow|required temperature/i.test(text), false);
        assert.equal(/\b\d+\s*(kw|w|m3\/h|l\/s|pa|bar|psi|c|°c|mm|cm|m|%)\b/i.test(text), false);
    }
);

runTest(
    "no automatic replacement, refrigerant, compressor, mould, or structural conclusions",
    () => {
        const text = allHypothesisText(getKnowledge("Old air-conditioning system defect, indoor unit icing, condensate dripping, and ventilation weak airflow."));

        assert.equal(/complete HVAC replacement|replace the complete HVAC system|mandatory replacement/i.test(text), false);
        assert.equal(/refrigerant leak confirmed|confirmed refrigerant loss|compressor failure confirmed/i.test(text), false);
        assert.equal(/mould cause confirmed|mold cause confirmed|structural failure|structural instability/i.test(text), false);
    }
);

runTest(
    "deterministic output for repeated equivalent input",
    () => {
        const input = {
            finding: {
                category: "HVAC",
                location: "plant room",
                description: "Ventilation fan fault, blocked condensate drain, and radiator cold.",
                observations: ["weak airflow"]
            },
            building: {
                heatingSystemType: "radiator heating",
                ventilationSystemType: "mechanical ventilation",
                coolingSystemType: "split air-conditioning"
            },
            measurements: []
        };

        assert.deepStrictEqual(
            HvacSystemsKnowledgeProvider.getKnowledge(input),
            HvacSystemsKnowledgeProvider.getKnowledge(structuredClone(input))
        );
    }
);

runTest(
    "input is not mutated",
    () => {
        const input = {
            finding: {
                category: "HVAC",
                location: "mechanical room",
                description: "Air-conditioning unit leaking water and ventilation weak airflow.",
                observations: ["condensate dripping"]
            },
            building: {
                constructionYear: 2004,
                heatingSystemType: "radiator heating",
                heatGeneratorType: "boiler",
                heatDistributionType: "hydronic",
                ventilationSystemType: "mechanical extract",
                coolingSystemType: "split cooling",
                controlSystemType: "local thermostats",
                energySource: "electricity",
                systemAge: "older equipment",
                maintenanceStatus: "unknown"
            },
            measurements: [
                {
                    type: "observation",
                    value: "water below indoor unit",
                    unit: "text",
                    location: "office ceiling"
                }
            ]
        };
        const original = structuredClone(input);

        HvacSystemsKnowledgeProvider.getKnowledge(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "returned arrays are fresh mutable copies, not shared catalogue arrays",
    () => {
        const first = getKnowledge("Radiator cold and heating pressure low.");
        const second = getKnowledge("Radiator cold and heating pressure low.");

        first.hypotheses[0].supportingIndicators.push("test mutation");

        assert.equal(second.hypotheses[0].supportingIndicators.includes("test mutation"), false);
    }
);

runTest(
    "stable hypothesis ordering",
    () => {
        const result = getKnowledge("Radiator cold, heating pressure low, and ventilation weak airflow.");

        assert.deepStrictEqual(ids(result).slice(0, 3), [
            "heating-system-pressure-related-indication",
            "local-heating-emitter-malfunction",
            "ventilation-airflow-restriction"
        ]);
    }
);

runTest(
    "stable unique hypothesis ids",
    () => {
        const result = getKnowledge("Radiator cold, ventilation weak airflow, blocked condensate drain, indoor unit icing, poor HVAC installation, and damaged HVAC insulation.");
        const hypothesisIds = ids(result);

        assert.equal(hypothesisIds.length, new Set(hypothesisIds).size);
        assert.ok(hypothesisIds.every((id) => typeof id === "string" && id.length > 0));
    }
);

runTest(
    "every conclusion remains hypothetical or verification-dependent",
    () => {
        const result = getKnowledge("Boiler fault, ventilation fan fault, air conditioner not cooling, evaporator icing, and blocked condensate drain.");

        assert.ok(result.hypotheses.length > 0);
        assert.ok(result.hypotheses.every((hypothesis) => /hypothesis|indication/i.test(hypothesis.classification)));
    }
);

console.log("HvacSystemsKnowledgeProvider tests completed successfully.");
