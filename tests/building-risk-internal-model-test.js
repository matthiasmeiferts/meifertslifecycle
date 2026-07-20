import assert from "node:assert/strict";

import BuildingRiskInternalModel from "../portal/core/risk/BuildingRiskInternalModel.js";
import {
    RISK_RELEVANCE_GOVERNANCE_VERSION,
    RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
    RISK_RELEVANCE_VALUES,
    RISK_RELEVANCE_VALUE_STATES,
    RISK_RELEVANCE_VERSION_STATES
} from "../portal/core/risk/RiskRelevanceGovernanceRegistry.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function completeContract(overrides = {}) {
    return {
        contractVersion: "expert-reasoning-contract-1.0",
        sourceReference: "src-contract-a",
        domain: "structural-systems",
        primaryHypothesis: {
            id: "h-primary",
            cause: "possible structural alteration",
            classification: "structural hypothesis requiring verification",
            status: "hypothesis",
            supportingIndicators: ["structural opening"],
            contradictingIndicators: ["approved structural alteration"],
            requiredVerification: ["Review structural drawings."],
            potentialConsequences: ["uncertain load path"],
            recommendedActions: ["Request approval records."],
            riskRelevance: "high"
        },
        alternativeHypotheses: [
            {
                id: "h-alt",
                cause: "possible load-bearing structural distress",
                classification: "potentially structural hypothesis requiring verification",
                status: "hypothesis",
                supportingIndicators: ["load-bearing wall"],
                contradictingIndicators: [],
                requiredVerification: ["Confirm whether the affected element is load-bearing."],
                potentialConsequences: ["need for structural verification"],
                recommendedActions: ["Arrange structural engineer review."]
            }
        ],
        supportingEvidence: ["structural opening", "structural opening"],
        missingEvidence: ["approval records missing"],
        requiredVerification: ["Review structural drawings."],
        potentialConsequences: ["uncertain load path"],
        confidence: 0.67,
        guardrails: ["No safety conclusion is made."],
        ...overrides
    };
}

function legacyContract() {
    return {
        primaryHypothesis: {
            label: "Insufficient information for a specific expert hypothesis",
            category: "general",
            rationale: "The available data does not isolate one stable root cause with confidence."
        },
        alternativeHypotheses: [],
        supportingEvidence: [],
        missingEvidence: ["additional inspection evidence"],
        requiredVerification: ["Collect additional inspection evidence."],
        potentialConsequences: ["Delayed diagnosis."],
        confidence: 20
    };
}

function completeContractWithPrimaryRiskRelevance(primaryFields = {}) {
    return completeContract({
        primaryHypothesis: {
            ...completeContract().primaryHypothesis,
            ...primaryFields
        }
    });
}

function primaryRiskRelevanceEntry(contract) {
    return BuildingRiskInternalModel.build(contract).domainAssessments[0].riskRelevanceEntries[0];
}

runTest(
    "identical input produces identical internal model",
    () => {
        const input = {
            assessmentContext: { assessmentReference: "case-001" },
            contracts: [completeContract()]
        };

        assert.deepStrictEqual(
            BuildingRiskInternalModel.build(input),
            BuildingRiskInternalModel.build(structuredClone(input))
        );
    }
);

runTest(
    "single-contract input is processed as one source contract",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());

        assert.equal(model.internalModelVersion, "brs-internal-model-1.0");
        assert.equal(model.sourceContracts.length, 1);
        assert.equal(model.domainAssessments.length, 1);
        assert.equal(model.domainAssessments[0].completenessState, "COMPLETE");
    }
);

runTest(
    "multi-contract input preserves source order and separate confidence values",
    () => {
        const model = BuildingRiskInternalModel.build({
            contracts: [
                completeContract({ sourceReference: "src-a", confidence: 0.25 }),
                completeContract({ sourceReference: "src-b", domain: "roof-envelope", confidence: 0.9 })
            ]
        });

        assert.deepStrictEqual(model.sourceContracts.map((entry) => entry.sourceReference), ["src-a", "src-b"]);
        assert.deepStrictEqual(model.domainAssessments.map((entry) => entry.confidenceContext.value), [0.25, 0.9]);
        assert.ok(model.conflicts.some((entry) => entry.type === "CONFIDENCE_DIVERGENCE"));
        assert.equal(Object.hasOwn(model, "riskClass"), false);
        assert.equal(Object.hasOwn(model, "reviewPriority"), false);
    }
);

runTest(
    "stable source contract references are provided or derived",
    () => {
        const model = BuildingRiskInternalModel.build({
            contracts: [
                completeContract({ sourceReference: "external-1" }),
                completeContract({ sourceReference: undefined, contractReference: undefined })
            ]
        });

        assert.equal(model.sourceContracts[0].sourceReference, "external-1");
        assert.equal(model.sourceContracts[0].referenceOrigin, "provided");
        assert.equal(model.sourceContracts[1].sourceReference, "brs-src-002");
        assert.equal(model.sourceContracts[1].referenceOrigin, "derived");
    }
);

runTest(
    "stable evidence references point to exactly one source contract",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());
        const assessment = model.domainAssessments[0];

        assert.ok(assessment.evidenceReferences.length > 0);
        assert.ok(assessment.evidenceReferences.every((entry) => entry.sourceReference === assessment.sourceReference));
        assert.equal(new Set(assessment.evidenceReferences.map((entry) => entry.evidenceReference)).size, assessment.evidenceReferences.length);
        assert.ok(assessment.evidenceReferences.some((entry) => entry.section === "supportingEvidence" && entry.duplicatePositions.length === 1));
    }
);

runTest(
    "complete contract is classified COMPLETE",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());

        assert.equal(model.domainAssessments[0].completenessState, "COMPLETE");
    }
);

runTest(
    "incomplete usable contract is classified INCOMPLETE",
    () => {
        const model = BuildingRiskInternalModel.build({
            primaryHypothesis: {
                id: "partial",
                cause: "partial hypothesis",
                status: "hypothesis"
            },
            supportingEvidence: ["visible condition"],
            confidence: 0.4
        });

        assert.equal(model.domainAssessments[0].completenessState, "INCOMPLETE");
    }
);

runTest(
    "legacy contract is classified LEGACY without inventing provider fields",
    () => {
        const model = BuildingRiskInternalModel.build(legacyContract());
        const assessment = model.domainAssessments[0];

        assert.equal(assessment.completenessState, "LEGACY");
        assert.equal(model.sourceContracts[0].referenceOrigin, "legacy-derived");
        assert.equal(Object.hasOwn(assessment.hypotheses[0].hypothesis, "status"), false);
    }
);

runTest(
    "invalid contract is isolated as INVALID",
    () => {
        const model = BuildingRiskInternalModel.build({ contracts: [{ finding: { description: "raw finding" } }] });

        assert.equal(model.domainAssessments.length, 0);
        assert.equal(model.invalidSources.length, 1);
        assert.equal(model.invalidSources[0].completenessState, "INVALID");
    }
);

runTest(
    "empty assessment is NOT_ASSESSED",
    () => {
        const model = BuildingRiskInternalModel.build({ contracts: [] });

        assert.equal(model.assessmentState, "NOT_ASSESSED");
        assert.deepStrictEqual(model.sourceContracts, []);
    }
);

runTest(
    "contract outcome unknown remains separate from UNKNOWN_COMPLETENESS",
    () => {
        const model = BuildingRiskInternalModel.build(legacyContract());
        const assessment = model.domainAssessments[0];

        assert.equal(assessment.completenessState, "LEGACY");
        assert.ok(assessment.unknowns.some((entry) => entry.unknownType === "source-contract-outcome"));
        assert.equal(assessment.unknowns.some((entry) => entry.unknownType === "unknown-completeness"), false);
    }
);

runTest(
    "different confidence values are not aggregated",
    () => {
        const model = BuildingRiskInternalModel.build({
            contracts: [
                completeContract({ sourceReference: "c1", confidence: 0.1 }),
                completeContract({ sourceReference: "c2", confidence: 0.8 })
            ]
        });

        assert.deepStrictEqual(model.domainAssessments.map((entry) => entry.confidenceContext.value), [0.1, 0.8]);
        assert.equal(Object.hasOwn(model, "confidence"), false);
    }
);

runTest(
    "unknown domain id remains processable",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract({ domain: "future-domain" }));

        assert.equal(model.domainAssessments[0].domainId, "future-domain");
        assert.equal(model.domainAssessments[0].domainState, "known");
    }
);

runTest(
    "additional unknown fields do not break the model",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract({ futureExtension: { value: true } }));

        assert.equal(model.domainAssessments[0].completenessState, "COMPLETE");
    }
);

runTest(
    "provider router and keyword information is not required",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract({
            providerClass: "ShouldNotMatter",
            candidateDomains: ["router-output"],
            keywords: ["keyword"]
        }));

        assert.equal(model.domainAssessments[0].completenessState, "COMPLETE");
        assert.equal(JSON.stringify(model).includes("ShouldNotMatter"), false);
        assert.equal(JSON.stringify(model).includes("router-output"), false);
        assert.equal(JSON.stringify(model).includes("keyword"), false);
    }
);

runTest(
    "input order remains deterministic",
    () => {
        const model = BuildingRiskInternalModel.build({
            contracts: [
                completeContract({ sourceReference: "first", domain: "facade-wall-systems" }),
                completeContract({ sourceReference: "second", domain: "electrical-systems" })
            ]
        });

        assert.deepStrictEqual(model.domainAssessments.map((entry) => entry.sourceReference), ["first", "second"]);
    }
);

runTest(
    "no new red flag is created while existing red flags are preserved",
    () => {
        const withoutRedFlag = BuildingRiskInternalModel.build(completeContract());
        const withRedFlag = BuildingRiskInternalModel.build(completeContract({
            redFlags: [{ classification: "P1", description: "Source contract red flag" }]
        }));

        assert.deepStrictEqual(withoutRedFlag.domainAssessments[0].redFlags, []);
        assert.equal(withRedFlag.domainAssessments[0].redFlags.length, 1);
        assert.equal(withRedFlag.domainAssessments[0].redFlags[0].value.description, "Source contract red flag");
    }
);

runTest(
    "guardrails are preserved",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());

        assert.deepStrictEqual(model.domainAssessments[0].guardrails, ["No safety conclusion is made."]);
    }
);

runTest(
    "public score contract is not introduced",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());

        assert.equal(Object.hasOwn(model, "contractName"), false);
        assert.equal(Object.hasOwn(model, "contractVersion"), false);
        assert.equal(Object.hasOwn(model, "riskSummary"), false);
        assert.equal(Object.hasOwn(model, "resultClassification"), false);
    }
);

runTest(
    "internal model version is exact",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());

        assert.equal(BuildingRiskInternalModel.MODEL_VERSION, "brs-internal-model-1.0");
        assert.equal(model.internalModelVersion, "brs-internal-model-1.0");
        assert.equal(model.auditContext.internalModelVersion, "brs-internal-model-1.0");
    }
);

runTest(
    "risk relevance entries preserve canonical value and supported source version",
    () => {
        const model = BuildingRiskInternalModel.build(completeContractWithPrimaryRiskRelevance({
            riskRelevance: RISK_RELEVANCE_VALUES.HIGH_RELEVANCE,
            riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION
        }));
        const entry = model.domainAssessments[0].riskRelevanceEntries[0];

        assert.deepStrictEqual(Object.keys(entry), [
            "riskRelevanceEntryReference",
            "sourceReference",
            "sourceElementReference",
            "sourceElementType",
            "sourceField",
            "valuePresent",
            "rawValue",
            "canonicalValue",
            "valueState",
            "versionField",
            "versionPresent",
            "rawVersion",
            "versionState",
            "governanceVersion",
            "interpretationEligible"
        ]);
        assert.equal(entry.riskRelevanceEntryReference, "src-contract-a:hypothesis:001:risk-relevance");
        assert.equal(entry.sourceReference, "src-contract-a");
        assert.equal(entry.sourceElementReference, "src-contract-a:hypothesis:001");
        assert.equal(entry.sourceElementType, "primary-hypothesis");
        assert.equal(entry.sourceField, "riskRelevance");
        assert.equal(entry.valuePresent, true);
        assert.equal(entry.rawValue, RISK_RELEVANCE_VALUES.HIGH_RELEVANCE);
        assert.equal(entry.canonicalValue, RISK_RELEVANCE_VALUES.HIGH_RELEVANCE);
        assert.equal(entry.valueState, RISK_RELEVANCE_VALUE_STATES.CANONICAL);
        assert.equal(entry.versionField, "riskRelevanceVersion");
        assert.equal(entry.versionPresent, true);
        assert.equal(entry.rawVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.equal(entry.versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED);
        assert.equal(entry.governanceVersion, RISK_RELEVANCE_GOVERNANCE_VERSION);
        assert.equal(entry.interpretationEligible, false);
        assert.equal(Object.isFrozen(entry), true);
        assert.equal(Object.isFrozen(model), false);
    }
);

runTest(
    "risk relevance entries are created for primary and alternative hypotheses",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract({
            alternativeHypotheses: [
                {
                    id: "h-alt-a",
                    cause: "alternative A",
                    status: "hypothesis",
                    riskRelevance: "medium"
                },
                {
                    id: "h-alt-b",
                    cause: "alternative B",
                    status: "hypothesis",
                    riskRelevance: "critical",
                    riskRelevanceVersion: "risk-relevance-2.0"
                }
            ]
        }));

        assert.deepStrictEqual(
            model.domainAssessments[0].riskRelevanceEntries.map((entry) => entry.sourceElementReference),
            [
                "src-contract-a:hypothesis:001",
                "src-contract-a:hypothesis:002",
                "src-contract-a:hypothesis:003"
            ]
        );
        assert.deepStrictEqual(
            model.domainAssessments[0].riskRelevanceEntries.map((entry) => entry.valueState),
            [
                RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED,
                RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED,
                RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED
            ]
        );
        assert.equal(model.domainAssessments[0].riskRelevanceEntries[2].versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED);
    }
);

runTest(
    "risk relevance value presence distinguishes absent undefined null empty whitespace legacy unknown and invalid values",
    () => {
        const absent = { ...completeContract().primaryHypothesis };
        delete absent.riskRelevance;

        const cases = [
            [completeContract({ primaryHypothesis: absent }), false, undefined, null, RISK_RELEVANCE_VALUE_STATES.NOT_PRESENT],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: undefined }), true, undefined, null, RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: null }), true, null, null, RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: "" }), true, "", null, RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: "   " }), true, "   ", null, RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: "low" }), true, "low", RISK_RELEVANCE_VALUES.LOW_RELEVANCE, RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: "critical" }), true, "critical", null, RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: "unknown" }), true, "unknown", null, RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: "future" }), true, "future", null, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE],
            [completeContractWithPrimaryRiskRelevance({ riskRelevance: 42 }), true, 42, null, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE]
        ];

        cases.forEach(([contract, valuePresent, rawValue, canonicalValue, valueState]) => {
            const entry = primaryRiskRelevanceEntry(contract);

            assert.equal(entry.valuePresent, valuePresent);
            assert.equal(entry.rawValue, rawValue);
            assert.equal(entry.canonicalValue, canonicalValue);
            assert.equal(entry.valueState, valueState);
        });
    }
);

runTest(
    "risk relevance version presence preserves supported missing unknown and invalid source versions",
    () => {
        const absent = { riskRelevance: RISK_RELEVANCE_VALUES.LOW_RELEVANCE };

        const cases = [
            [absent, false, undefined, RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION],
            [{ riskRelevanceVersion: undefined }, true, undefined, RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION],
            [{ riskRelevanceVersion: null }, true, null, RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION],
            [{ riskRelevanceVersion: "" }, true, "", RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION],
            [{ riskRelevanceVersion: "   " }, true, "   ", RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION],
            [{ riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION }, true, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION, RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED],
            [{ riskRelevanceVersion: "risk-relevance-2.0" }, true, "risk-relevance-2.0", RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED],
            [{ riskRelevanceVersion: 12 }, true, 12, RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED]
        ];

        cases.forEach(([fields, versionPresent, rawVersion, versionState]) => {
            const entry = primaryRiskRelevanceEntry(completeContractWithPrimaryRiskRelevance({
                riskRelevance: RISK_RELEVANCE_VALUES.LOW_RELEVANCE,
                ...fields
            }));

            assert.equal(entry.versionPresent, versionPresent);
            assert.equal(entry.rawVersion, rawVersion);
            assert.equal(entry.versionState, versionState);
            assert.equal(entry.governanceVersion, RISK_RELEVANCE_GOVERNANCE_VERSION);
        });
    }
);

runTest(
    "risk relevance complex raw values keep the original reference without copying",
    () => {
        const rawValue = { nested: { state: "before" } };
        const model = BuildingRiskInternalModel.build(completeContractWithPrimaryRiskRelevance({
            riskRelevance: rawValue
        }));
        const entry = model.domainAssessments[0].riskRelevanceEntries[0];

        rawValue.nested.state = "after";

        assert.equal(entry.rawValue, rawValue);
        assert.equal(entry.rawValue.nested, rawValue.nested);
        assert.equal(entry.rawValue.nested.state, "after");
        assert.equal(entry.valueState, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE);
    }
);

runTest(
    "risk relevance raw object edge cases do not break internal model construction",
    () => {
        const cyclic = {};
        const arrayValue = [{ nested: true }];
        const throwingJson = {
            toJSON() {
                throw new Error("risk relevance toJSON must not run");
            }
        };
        const accessorHypothesis = {
            ...completeContract().primaryHypothesis
        };
        const cases = [cyclic, arrayValue, throwingJson, 1n, Symbol("risk-relevance"), Object.freeze({ value: "high" }), Object.create(null)];

        cyclic.self = cyclic;
        Object.defineProperty(accessorHypothesis, "riskRelevance", {
            enumerable: true,
            get() {
                throw new Error("risk relevance getter must not run");
            }
        });

        cases.forEach((rawValue) => {
            const entry = primaryRiskRelevanceEntry(completeContractWithPrimaryRiskRelevance({ riskRelevance: rawValue }));

            assert.equal(entry.rawValue, rawValue);
            assert.equal(entry.valueState, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE);
        });

        const accessorEntry = primaryRiskRelevanceEntry(completeContract({ primaryHypothesis: accessorHypothesis }));
        assert.equal(accessorEntry.valuePresent, true);
        assert.equal(typeof accessorEntry.rawValue, "function");
        assert.equal(accessorEntry.valueState, RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE);
    }
);

runTest(
    "risk relevance preservation does not mutate source input and creates independent entry wrappers",
    () => {
        const input = completeContractWithPrimaryRiskRelevance({
            riskRelevance: "medium",
            riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION
        });
        const before = structuredClone(input);
        const first = BuildingRiskInternalModel.build(input).domainAssessments[0].riskRelevanceEntries[0];
        const second = BuildingRiskInternalModel.build(input).domainAssessments[0].riskRelevanceEntries[0];

        assert.deepStrictEqual(input, before);
        assert.deepStrictEqual(first, second);
        assert.notEqual(first, second);
        assert.equal(Object.isFrozen(first), true);
        assert.equal(Object.isFrozen(second), true);
    }
);

runTest(
    "risk relevance preservation is additive and keeps existing model fields unchanged",
    () => {
        const model = BuildingRiskInternalModel.build(completeContract());
        const assessment = model.domainAssessments[0];

        assert.equal(Array.isArray(assessment.riskRelevanceEntries), true);
        assert.equal(assessment.hypotheses.length, 2);
        assert.equal(assessment.evidenceReferences.length > 0, true);
        assert.deepStrictEqual(assessment.sourceReferences, ["src-contract-a"]);
        assert.equal(assessment.confidenceContext.value, 0.67);
        assert.equal(assessment.riskRelevanceEntries[0].valueState, RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED);
        assert.equal(assessment.riskRelevanceEntries[1].valueState, RISK_RELEVANCE_VALUE_STATES.NOT_PRESENT);
    }
);

runTest(
    "risk relevance preservation adds no interpretation priority score provider router or conflict fields",
    () => {
        const entry = primaryRiskRelevanceEntry(completeContractWithPrimaryRiskRelevance({
            riskRelevance: "critical",
            riskRelevanceVersion: "risk-relevance-2.0"
        }));
        const forbiddenFields = [
            "concernCategory",
            "riskCategory",
            "riskConcern",
            "severity",
            "criticality",
            "redFlag",
            "reviewPriority",
            "score",
            "riskClass",
            "resultClassification",
            "blocking",
            "auditRequired",
            "priority",
            "decision",
            "recommendation",
            "provider",
            "domain",
            "router",
            "hypothesis",
            "sourceReferenceText",
            "conflictReferences"
        ];

        forbiddenFields.forEach((field) => {
            assert.equal(Object.hasOwn(entry, field), false);
        });
        assert.equal(entry.valueState, RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED);
        assert.equal(entry.versionState, RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED);
    }
);

console.log("BuildingRiskInternalModel tests completed successfully.");
