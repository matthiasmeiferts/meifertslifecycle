import assert from "node:assert/strict";

import BuildingRiskInternalModel from "../portal/core/risk/BuildingRiskInternalModel.js";
import BuildingRiskInterpretationModel from "../portal/core/risk/BuildingRiskInterpretationModel.js";
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
            cause: "source-bound concern",
            classification: "structured hypothesis",
            status: "hypothesis",
            riskRelevance: "moderate",
            supportingIndicators: [{ label: "visible source-bound indicator" }],
            contradictingIndicators: [],
            requiredVerification: ["Review source documents."],
            potentialConsequences: [{ description: "follow-up concern", concernCategory: "MODERATE_CONCERN" }],
            recommendedActions: ["Request verification."]
        },
        alternativeHypotheses: [],
        supportingEvidence: [{ label: "visible source-bound indicator" }],
        missingEvidence: [],
        requiredVerification: ["Review source documents."],
        potentialConsequences: [{ description: "follow-up concern", concernCategory: "MODERATE_CONCERN" }],
        confidence: { level: "medium", basis: "source confidence preserved" },
        guardrails: ["No safety conclusion is made."],
        ...overrides
    };
}

function noConcernContract(overrides = {}) {
    return completeContract({
        primaryHypothesis: {
            id: "no-explicit-concern",
            cause: "source-bound observation",
            classification: "structured hypothesis",
            status: "hypothesis",
            supportingIndicators: [{ label: "visible source-bound indicator" }],
            contradictingIndicators: [],
            requiredVerification: ["Review source documents."],
            potentialConsequences: [],
            recommendedActions: []
        },
        potentialConsequences: [],
        ...overrides
    });
}

function interpretationFromContracts(contracts) {
    return BuildingRiskInterpretationModel.interpret(
        BuildingRiskInternalModel.build({ contracts })
    );
}

runTest(
    "accepts only valid BuildingRiskInternalModel result",
    () => {
        const internalModel = BuildingRiskInternalModel.build(completeContract());
        const interpretation = BuildingRiskInterpretationModel.interpret(internalModel);

        assert.equal(interpretation.inputValidation.accepted, true);
        assert.equal(interpretation.sourceInternalModelVersion, "brs-internal-model-1.0");
        assert.equal(interpretation.interpretationState, "INTERPRETED");
    }
);

runTest(
    "direct ExpertReasoningContract is rejected",
    () => {
        const interpretation = BuildingRiskInterpretationModel.interpret(completeContract());

        assert.equal(interpretation.inputValidation.accepted, false);
        assert.equal(interpretation.interpretationState, "INVALID_INPUT");
        assert.equal(interpretation.overallInterpretation.riskCategory, "UNKNOWN");
        assert.equal(interpretation.domainInterpretations.length, 0);
    }
);

runTest(
    "identical input produces identical interpretation",
    () => {
        const internalModel = BuildingRiskInternalModel.build(completeContract());

        assert.deepStrictEqual(
            BuildingRiskInterpretationModel.interpret(internalModel),
            BuildingRiskInterpretationModel.interpret(structuredClone(internalModel))
        );
    }
);

runTest(
    "internal interpretation version is exact",
    () => {
        const interpretation = interpretationFromContracts([completeContract()]);

        assert.equal(BuildingRiskInterpretationModel.MODEL_VERSION, "brs-risk-interpretation-1.0");
        assert.equal(interpretation.interpretationModelVersion, "brs-risk-interpretation-1.0");
        assert.equal(interpretation.auditContext.interpretationModelVersion, "brs-risk-interpretation-1.0");
    }
);

runTest(
    "NOT_ASSESSED remains NOT_ASSESSED",
    () => {
        const interpretation = BuildingRiskInterpretationModel.interpret(
            BuildingRiskInternalModel.build({ contracts: [] })
        );

        assert.equal(interpretation.interpretationState, "NOT_ASSESSED");
        assert.equal(interpretation.overallInterpretation.riskCategory, "NOT_ASSESSED");
        assert.equal(interpretation.overallInterpretation.evidenceSufficiency, "NOT_APPLICABLE");
    }
);

runTest(
    "professional unknown is not LOW_CONCERN",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                primaryHypothesis: {
                    label: "Insufficient information for a specific expert hypothesis",
                    category: "general",
                    rationale: "The available data does not isolate one stable root cause with confidence."
                },
                potentialConsequences: [],
                missingEvidence: [],
                confidence: "unknown"
            })
        ]);

        assert.equal(interpretation.domainInterpretations[0].riskCategory, "UNKNOWN");
        assert.notEqual(interpretation.domainInterpretations[0].riskCategory, "LOW_CONCERN");
    }
);

runTest(
    "UNKNOWN_COMPLETENESS is not confused with professional UNKNOWN",
    () => {
        const interpretation = BuildingRiskInterpretationModel.interpret({
            internalModelVersion: "brs-internal-model-1.0",
            assessmentState: "COMPLETE",
            sourceContracts: [
                {
                    sourceReference: "unknown-completeness-source",
                    sourcePosition: 0,
                    completenessState: "UNKNOWN_COMPLETENESS"
                }
            ],
            domainAssessments: [
                {
                    sourceReference: "unknown-completeness-source",
                    sourcePosition: 0,
                    domainId: "future-domain",
                    domainState: "known",
                    completenessState: "UNKNOWN_COMPLETENESS",
                    hypotheses: [],
                    evidenceReferences: [],
                    missingEvidence: [],
                    unknowns: [
                        {
                            sourceReference: "unknown-completeness-source",
                            unknownType: "unknown-completeness",
                            basis: "completenessState"
                        }
                    ],
                    positiveIndicators: [],
                    redFlags: [],
                    recommendations: [],
                    confidenceContext: {
                        sourceReference: "unknown-completeness-source",
                        value: null,
                        availabilityState: "unknown"
                    },
                    guardrails: [],
                    sourceReferences: ["unknown-completeness-source"]
                }
            ],
            invalidSources: [],
            conflicts: [],
            auditContext: {
                internalModelVersion: "brs-internal-model-1.0",
                sourceContractReferences: ["unknown-completeness-source"],
                evidenceReferences: [],
                conflictReferences: [],
                transformations: []
            }
        });

        assert.equal(interpretation.domainInterpretations[0].riskCategory, "NO_CONFIRMED_RISK_INTERPRETATION");
        assert.equal(interpretation.domainInterpretations[0].unknowns[0].value.unknownType, "unknown-completeness");
    }
);

runTest(
    "Missing Evidence does not automatically create risk",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                primaryHypothesis: {
                    id: "missing-only",
                    cause: "documentation gap",
                    classification: "documentation gap",
                    status: "hypothesis",
                    supportingIndicators: [],
                    contradictingIndicators: [],
                    requiredVerification: ["Request documents."],
                    potentialConsequences: [],
                    recommendedActions: []
                },
                supportingEvidence: [],
                missingEvidence: ["approval document missing"],
                potentialConsequences: []
            })
        ]);

        assert.equal(interpretation.domainInterpretations[0].riskDrivers.length, 0);
        assert.equal(interpretation.domainInterpretations[0].riskCategory, "UNKNOWN");
    }
);

runTest(
    "Missing Evidence can limit Evidence Sufficiency",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({ missingEvidence: ["approval document missing"] })
        ]);

        assert.equal(interpretation.domainInterpretations[0].evidenceSufficiency, "PROVISIONALLY_SUPPORTED");
    }
);

runTest(
    "Confidence remains unchanged and is not aggregated",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({ sourceReference: "src-a", confidence: { level: "low" } }),
            completeContract({ sourceReference: "src-b", domain: "roof-envelope", confidence: { level: "high" } })
        ]);

        assert.deepStrictEqual(
            interpretation.domainInterpretations.map((entry) => entry.confidenceContext.value),
            [{ level: "low" }, { level: "high" }]
        );
        assert.equal(Object.hasOwn(interpretation, "confidence"), false);
    }
);

runTest(
    "Completeness alone creates no concern category",
    () => {
        const interpretation = interpretationFromContracts([
            {
                primaryHypothesis: {
                    id: "partial",
                    cause: "partial source",
                    status: "hypothesis"
                },
                supportingEvidence: [],
                confidence: 0.4
            }
        ]);

        assert.equal(interpretation.domainInterpretations[0].completenessContext.completenessState, "INCOMPLETE");
        assert.equal(interpretation.domainInterpretations[0].riskCategory, "NO_CONFIRMED_RISK_INTERPRETATION");
    }
);

runTest(
    "existing Red Flags remain visible and no new Red Flag is created",
    () => {
        const withoutRedFlag = interpretationFromContracts([completeContract({ redFlags: [] })]);
        const withRedFlag = interpretationFromContracts([
            completeContract({
                redFlags: [
                    {
                        description: "source red flag",
                        concernCategory: "ELEVATED_CONCERN"
                    }
                ]
            })
        ]);

        assert.equal(withoutRedFlag.domainInterpretations[0].redFlags.length, 0);
        assert.equal(withRedFlag.domainInterpretations[0].redFlags.length, 1);
        assert.equal(withRedFlag.domainInterpretations[0].riskCategory, "ELEVATED_CONCERN");
    }
);

runTest(
    "Positive Indicators do not overwrite Red Flags",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                positiveIndicators: [{ description: "stabilizing source point" }],
                redFlags: [
                    {
                        description: "source red flag",
                        concernCategory: "ELEVATED_CONCERN"
                    }
                ]
            })
        ]);

        assert.equal(interpretation.domainInterpretations[0].positiveIndicators.length, 1);
        assert.equal(interpretation.domainInterpretations[0].redFlags.length, 1);
        assert.equal(interpretation.domainInterpretations[0].riskCategory, "ELEVATED_CONCERN");
    }
);

runTest(
    "Conflicts remain referenced and are not resolved",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({ sourceReference: "src-a", confidence: 0.1 }),
            completeContract({ sourceReference: "src-b", confidence: 0.9 })
        ]);

        assert.ok(interpretation.conflicts.some((entry) => entry.type === "CONFIDENCE_DIVERGENCE"));
        assert.ok(interpretation.domainInterpretations.every((entry) => entry.conflicts.length > 0));
        assert.equal(interpretation.overallInterpretation.riskCategory, "MODERATE_CONCERN");
        assert.notEqual(interpretation.overallInterpretation.evidenceSufficiency, "CONTRADICTED");
    }
);

runTest(
    "free text and structuralRelevance alone do not create a concern category",
    () => {
        const interpretation = interpretationFromContracts([
            noConcernContract({
                primaryHypothesis: {
                    id: "structural-relevance-only",
                    cause: "structural context noted",
                    classification: "requires specialist review but no governed concern category",
                    status: "hypothesis",
                    structuralRelevance: "high",
                    supportingIndicators: ["load-bearing element mentioned"],
                    contradictingIndicators: [],
                    requiredVerification: ["Review structural documents."],
                    potentialConsequences: ["uncertain load path"],
                    recommendedActions: []
                },
                potentialConsequences: ["critical sounding free text without structured category"]
            })
        ]);

        assert.equal(interpretation.domainInterpretations[0].riskDrivers.length, 0);
        assert.equal(interpretation.domainInterpretations[0].riskCategory, "NO_CONFIRMED_RISK_INTERPRETATION");
    }
);

runTest(
    "Red Flag without explicit concern category is preserved but not critical",
    () => {
        const interpretation = interpretationFromContracts([
            noConcernContract({
                redFlags: [{ description: "source red flag without governed severity" }]
            })
        ]);

        assert.equal(interpretation.domainInterpretations[0].redFlags.length, 1);
        assert.equal(interpretation.domainInterpretations[0].riskDrivers.length, 0);
        assert.notEqual(interpretation.domainInterpretations[0].riskCategory, "CRITICAL_CONCERN");
    }
);

runTest(
    "DOMAIN_OVERLAP alone is preserved but not CONTRADICTED",
    () => {
        const interpretation = interpretationFromContracts([
            noConcernContract({ sourceReference: "src-a", domain: "future-domain" }),
            noConcernContract({ sourceReference: "src-b", domain: "future-domain" })
        ]);

        assert.ok(interpretation.conflicts.some((entry) => entry.type === "DOMAIN_OVERLAP"));
        assert.equal(interpretation.domainInterpretations[0].evidenceSufficiency, "NOT_APPLICABLE");
        assert.equal(interpretation.overallInterpretation.evidenceSufficiency, "NOT_APPLICABLE");
    }
);

runTest(
    "RECOMMENDATION_DIVERGENCE is preserved and does not change risk",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({ sourceReference: "src-a", domain: "future-a", requiredVerification: ["Review A."] }),
            completeContract({ sourceReference: "src-b", domain: "future-b", requiredVerification: ["Review B."] })
        ]);

        assert.ok(interpretation.conflicts.some((entry) => entry.type === "RECOMMENDATION_DIVERGENCE"));
        assert.deepStrictEqual(
            interpretation.domainInterpretations.map((entry) => entry.riskCategory),
            ["MODERATE_CONCERN", "MODERATE_CONCERN"]
        );
        assert.equal(interpretation.overallInterpretation.riskCategory, "MODERATE_CONCERN");
    }
);

runTest(
    "EVIDENCE_CONTRADICTION remains visible and blocks confirmed interpretation",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({ sourceReference: "src-a", supportingEvidence: ["same evidence"] }),
            completeContract({ sourceReference: "src-b", missingEvidence: ["same evidence"] })
        ]);

        assert.ok(interpretation.conflicts.some((entry) => entry.type === "EVIDENCE_CONTRADICTION"));
        assert.equal(interpretation.domainInterpretations[0].evidenceSufficiency, "CONTRADICTED");
        assert.equal(interpretation.overallInterpretation.riskCategory, "UNKNOWN");
    }
);

runTest(
    "multiple domains are not averaged and higher explicit concern is preserved",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                sourceReference: "src-low",
                domain: "future-a",
                primaryHypothesis: { ...completeContract().primaryHypothesis, concernCategory: "LOW_CONCERN", potentialConsequences: [] },
                potentialConsequences: []
            }),
            completeContract({ sourceReference: "src-critical", domain: "future-b", primaryHypothesis: { ...completeContract().primaryHypothesis, concernCategory: "CRITICAL_CONCERN" } })
        ]);

        assert.deepStrictEqual(
            interpretation.domainInterpretations.map((entry) => entry.riskCategory),
            ["LOW_CONCERN", "CRITICAL_CONCERN"]
        );
        assert.equal(interpretation.overallInterpretation.riskCategory, "CRITICAL_CONCERN");
        assert.match(interpretation.overallInterpretation.basis, /without averaging/);
    }
);

runTest(
    "multi-domain order does not change overall category",
    () => {
        const low = completeContract({
            sourceReference: "src-low",
            domain: "future-a",
            primaryHypothesis: { ...completeContract().primaryHypothesis, concernCategory: "LOW_CONCERN", potentialConsequences: [] },
            potentialConsequences: []
        });
        const critical = completeContract({
            sourceReference: "src-critical",
            domain: "future-b",
            primaryHypothesis: { ...completeContract().primaryHypothesis, concernCategory: "CRITICAL_CONCERN" }
        });

        assert.equal(interpretationFromContracts([low, critical]).overallInterpretation.riskCategory, "CRITICAL_CONCERN");
        assert.equal(interpretationFromContracts([critical, low]).overallInterpretation.riskCategory, "CRITICAL_CONCERN");
    }
);

runTest(
    "risk relevance interpretations are source-bound frozen additive output",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                primaryHypothesis: {
                    ...completeContract().primaryHypothesis,
                    riskRelevance: RISK_RELEVANCE_VALUES.HIGH_RELEVANCE,
                    riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION
                },
                alternativeHypotheses: [
                    {
                        id: "h-primary",
                        cause: "duplicate id remains source-order bound",
                        status: "hypothesis",
                        riskRelevance: "medium",
                        riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION
                    }
                ]
            })
        ]);
        const entries = interpretation.domainInterpretations[0].riskRelevanceInterpretations;

        assert.equal(Object.isFrozen(entries), true);
        assert.equal(entries.length, 2);
        assert.equal(Object.isFrozen(entries[0]), true);
        assert.deepStrictEqual(entries.map((entry) => entry.sourceElementReference), [
            "src-contract-a:hypothesis:001",
            "src-contract-a:hypothesis:002"
        ]);
        assert.deepStrictEqual(entries.map((entry) => entry.sourceHypothesisId), ["h-primary", "h-primary"]);
        assert.equal(entries[0].riskRelevanceInterpretationReference, "src-contract-a:hypothesis:001:risk-relevance:interpretation");
        assert.equal(entries[0].sourceRiskRelevanceEntryReference, "src-contract-a:hypothesis:001:risk-relevance");
        assert.equal(entries[0].interpretationState, "INTERPRETED");
        assert.equal(entries[0].interpretationReason, "RR_ELIGIBLE_CANONICAL_SUPPORTED_VERSION");
        assert.equal(entries[0].relevanceLevel, RISK_RELEVANCE_VALUES.HIGH_RELEVANCE);
        assert.equal(entries[0].preservedInterpretationEligible, false);
        assert.equal(entries[1].interpretationState, "INTERPRETED");
        assert.equal(entries[1].interpretationReason, "RR_ELIGIBLE_LEGACY_SUPPORTED_VERSION");
        assert.equal(entries[1].valueState, RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED);
        assert.equal(entries[1].sourceRiskRelevanceVersion, RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION);
        assert.ok(interpretation.auditContext.riskRelevanceInterpretationReferences.includes(entries[0].riskRelevanceInterpretationReference));
    }
);

runTest(
    "risk relevance eligibility matrix keeps unknown unsupported invalid and missing states audit-only",
    () => {
        const internalModel = BuildingRiskInternalModel.build(noConcernContract());
        const assessment = internalModel.domainAssessments[0];

        assessment.riskRelevanceEntries = [
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL, versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION, canonicalValue: RISK_RELEVANCE_VALUES.LOW_RELEVANCE, reference: "rr-001" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED, canonicalValue: RISK_RELEVANCE_VALUES.LOW_RELEVANCE, rawVersion: "risk-relevance-2.0", reference: "rr-002" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED, versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION, canonicalValue: RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE, reference: "rr-003" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_SUPPORTED, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED, canonicalValue: RISK_RELEVANCE_VALUES.MODERATE_RELEVANCE, rawVersion: "risk-relevance-2.0", reference: "rr-004" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED, canonicalValue: null, reference: "rr-005" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.LEGACY_UNSUPPORTED, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED, canonicalValue: null, rawVersion: "risk-relevance-2.0", reference: "rr-006" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED, canonicalValue: null, reference: "rr-007" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.UNKNOWN_VALUE, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED, canonicalValue: null, rawVersion: "risk-relevance-2.0", reference: "rr-008" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED, canonicalValue: null, reference: "rr-009" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.INVALID_VALUE, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_UNSUPPORTED, canonicalValue: null, rawVersion: "risk-relevance-2.0", reference: "rr-010" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.NOT_PRESENT, versionState: RISK_RELEVANCE_VERSION_STATES.UNKNOWN_VERSION, canonicalValue: null, rawVersion: undefined, reference: "rr-011" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED, canonicalValue: null, reference: "rr-012" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED, canonicalValue: RISK_RELEVANCE_VALUES.HIGH_RELEVANCE, governanceVersion: null, reference: "rr-013" }),
            riskRelevanceEntry({ valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL, versionState: RISK_RELEVANCE_VERSION_STATES.VERSION_SUPPORTED, canonicalValue: RISK_RELEVANCE_VALUES.HIGH_RELEVANCE, governanceVersion: "risk-relevance-governance-2.0", reference: "rr-014" })
        ];

        const reasons = BuildingRiskInterpretationModel.interpret(internalModel)
            .domainInterpretations[0]
            .riskRelevanceInterpretations
            .map((entry) => entry.interpretationReason);

        assert.deepStrictEqual(reasons, [
            "RR_NOT_ELIGIBLE_CANONICAL_UNKNOWN_VERSION",
            "RR_NOT_ELIGIBLE_UNSUPPORTED_VERSION",
            "RR_NOT_ELIGIBLE_LEGACY_UNKNOWN_VERSION",
            "RR_NOT_ELIGIBLE_LEGACY_UNSUPPORTED_VERSION",
            "RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE",
            "RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE_AND_VERSION",
            "RR_NOT_ELIGIBLE_UNKNOWN_VALUE",
            "RR_NOT_ELIGIBLE_UNKNOWN_VALUE_UNSUPPORTED_VERSION",
            "RR_NOT_ELIGIBLE_INVALID_VALUE",
            "RR_NOT_ELIGIBLE_INVALID_VALUE_UNSUPPORTED_VERSION",
            "RR_NOT_ELIGIBLE_NOT_PRESENT",
            "RR_NOT_ELIGIBLE_MISSING_CANONICAL_VALUE",
            "RR_NOT_ELIGIBLE_UNSUPPORTED_GOVERNANCE_VERSION",
            "RR_NOT_ELIGIBLE_UNSUPPORTED_GOVERNANCE_VERSION"
        ]);
    }
);

runTest(
    "raw riskRelevance aliases no longer create concern categories when preservation entries exist",
    () => {
        ["low", "moderate", "high", "critical", "safety_relevant", "safety_critical"].forEach((riskRelevance) => {
            const interpretation = interpretationFromContracts([
                noConcernContract({
                    primaryHypothesis: {
                        ...noConcernContract().primaryHypothesis,
                        riskRelevance
                    }
                })
            ]);
            const domain = interpretation.domainInterpretations[0];

            assert.equal(domain.riskDrivers.length, 0);
            assert.equal(domain.riskCategory, "NO_CONFIRMED_RISK_INTERPRETATION");
            assert.equal(domain.riskRelevanceInterpretations.length, 1);
            assert.equal(domain.riskRelevanceInterpretations[0].interpretationState, "NOT_INTERPRETED");
        });
    }
);

runTest(
    "explicit concern aliases remain supported outside Risk Relevance interpretation",
    () => {
        [
            ["concernCategory", "MODERATE_CONCERN"],
            ["riskCategory", "ELEVATED_CONCERN"],
            ["riskConcern", "CRITICAL_CONCERN"]
        ].forEach(([field, value]) => {
            const interpretation = interpretationFromContracts([
                noConcernContract({
                    primaryHypothesis: {
                        ...noConcernContract().primaryHypothesis,
                        [field]: value
                    }
                })
            ]);

            assert.equal(interpretation.domainInterpretations[0].riskCategory, value);
        });
    }
);

runTest(
    "legacy fallback only applies when risk relevance entries are absent and never maps raw relevance to concern",
    () => {
        const missingCollectionModel = BuildingRiskInternalModel.build(noConcernContract({
            primaryHypothesis: {
                ...noConcernContract().primaryHypothesis,
                riskRelevance: "critical"
            }
        }));
        delete missingCollectionModel.domainAssessments[0].riskRelevanceEntries;

        const emptyCollectionModel = BuildingRiskInternalModel.build(noConcernContract({
            primaryHypothesis: {
                ...noConcernContract().primaryHypothesis,
                riskRelevance: "critical"
            }
        }));
        emptyCollectionModel.domainAssessments[0].riskRelevanceEntries = [];

        const undefinedCollectionModel = BuildingRiskInternalModel.build(noConcernContract({
            primaryHypothesis: {
                ...noConcernContract().primaryHypothesis,
                riskRelevance: "critical"
            }
        }));
        undefinedCollectionModel.domainAssessments[0].riskRelevanceEntries = undefined;

        const nullCollectionModel = BuildingRiskInternalModel.build(noConcernContract({
            primaryHypothesis: {
                ...noConcernContract().primaryHypothesis,
                riskRelevance: "critical"
            }
        }));
        nullCollectionModel.domainAssessments[0].riskRelevanceEntries = null;

        const inheritedCollectionModel = BuildingRiskInternalModel.build(noConcernContract({
            primaryHypothesis: {
                ...noConcernContract().primaryHypothesis,
                riskRelevance: "critical"
            }
        }));
        Object.setPrototypeOf(inheritedCollectionModel.domainAssessments[0], { riskRelevanceEntries: [] });
        delete inheritedCollectionModel.domainAssessments[0].riskRelevanceEntries;

        const fallback = BuildingRiskInterpretationModel.interpret(missingCollectionModel).domainInterpretations[0];
        const empty = BuildingRiskInterpretationModel.interpret(emptyCollectionModel).domainInterpretations[0];
        const ownUndefined = BuildingRiskInterpretationModel.interpret(undefinedCollectionModel).domainInterpretations[0];
        const ownNull = BuildingRiskInterpretationModel.interpret(nullCollectionModel).domainInterpretations[0];
        const inherited = BuildingRiskInterpretationModel.interpret(inheritedCollectionModel).domainInterpretations[0];

        assert.equal(fallback.riskCategory, "NO_CONFIRMED_RISK_INTERPRETATION");
        assert.equal(fallback.riskRelevanceInterpretations.length, 0);
        assert.ok(fallback.limitations.includes("Risk Relevance preservation entries are not available on this Internal Model input."));
        assert.equal(empty.riskCategory, "NO_CONFIRMED_RISK_INTERPRETATION");
        assert.equal(empty.riskRelevanceInterpretations.length, 0);
        assert.equal(empty.limitations.includes("Risk Relevance preservation entries are not available on this Internal Model input."), false);
        assert.equal(ownUndefined.riskRelevanceInterpretations.length, 0);
        assert.ok(ownUndefined.limitations.includes("RR_SKIPPED_MALFORMED_ENTRY_WITHOUT_REFERENCE"));
        assert.equal(ownUndefined.limitations.includes("Risk Relevance preservation entries are not available on this Internal Model input."), false);
        assert.equal(ownNull.riskRelevanceInterpretations.length, 0);
        assert.ok(ownNull.limitations.includes("RR_SKIPPED_MALFORMED_ENTRY_WITHOUT_REFERENCE"));
        assert.equal(ownNull.limitations.includes("Risk Relevance preservation entries are not available on this Internal Model input."), false);
        assert.equal(inherited.riskRelevanceInterpretations.length, 0);
        assert.ok(inherited.limitations.includes("Risk Relevance preservation entries are not available on this Internal Model input."));
    }
);

runTest(
    "malformed risk relevance entries are non-throwing and deterministic",
    () => {
        const internalModel = BuildingRiskInternalModel.build(noConcernContract());
        internalModel.domainAssessments[0].riskRelevanceEntries = [
            { riskRelevanceEntryReference: "rr-malformed", sourceReference: "src-contract-a" },
            { sourceElementReference: "src-contract-a:hypothesis:001" },
            { valueState: RISK_RELEVANCE_VALUE_STATES.CANONICAL }
        ];

        const domain = BuildingRiskInterpretationModel.interpret(internalModel).domainInterpretations[0];

        assert.deepStrictEqual(
            domain.riskRelevanceInterpretations.map((entry) => entry.interpretationReason),
            ["RR_NOT_ELIGIBLE_MALFORMED_ENTRY", "RR_NOT_ELIGIBLE_MALFORMED_ENTRY"]
        );
        assert.ok(domain.limitations.includes("RR_SKIPPED_MALFORMED_ENTRY_WITHOUT_REFERENCE"));
    }
);

runTest(
    "risk relevance interpretation output contains no forbidden fields or derived public effects",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                primaryHypothesis: {
                    ...completeContract().primaryHypothesis,
                    riskRelevance: RISK_RELEVANCE_VALUES.LOW_RELEVANCE,
                    riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION
                }
            })
        ]);
        const entry = interpretation.domainInterpretations[0].riskRelevanceInterpretations[0];
        const forbiddenFields = [
            "sourceVersion",
            "auditRequired",
            "rawValue",
            "riskCategory",
            "concernCategory",
            "riskConcern",
            "score",
            "priority",
            "severity",
            "criticality",
            "redFlag",
            "blocking",
            "recommendation",
            "decision"
        ];

        forbiddenFields.forEach((field) => {
            assert.equal(Object.hasOwn(entry, field), false);
        });
        assert.equal(Object.hasOwn(interpretation, "riskClass"), false);
        assert.equal(Object.hasOwn(interpretation, "reviewPriority"), false);
    }
);

runTest(
    "risk relevance raw getters cyclic symbols and bigint values do not influence interpretation",
    () => {
        const getterHypothesis = { ...noConcernContract().primaryHypothesis };
        Object.defineProperty(getterHypothesis, "riskRelevance", {
            enumerable: true,
            get() {
                throw new Error("raw risk relevance getter must not run");
            }
        });

        const cyclic = {};
        cyclic.self = cyclic;

        [getterHypothesis, { ...noConcernContract().primaryHypothesis, riskRelevance: cyclic }, { ...noConcernContract().primaryHypothesis, riskRelevance: Symbol("rr") }, { ...noConcernContract().primaryHypothesis, riskRelevance: 1n }].forEach((primaryHypothesis) => {
            assert.doesNotThrow(() => interpretationFromContracts([
                noConcernContract({ primaryHypothesis })
            ]));
        });
    }
);

runTest(
    "input objects are not mutated",
    () => {
        const internalModel = BuildingRiskInternalModel.build(completeContract());
        const before = structuredClone(internalModel);

        BuildingRiskInterpretationModel.interpret(internalModel);

        assert.deepStrictEqual(internalModel, before);
    }
);

runTest(
    "unknown domains remain processable and unknown fields do not break model",
    () => {
        const interpretation = interpretationFromContracts([
            completeContract({
                domain: "future-domain",
                futureExtension: { ignored: true }
            })
        ]);

        assert.equal(interpretation.domainInterpretations[0].domainId, "future-domain");
        assert.equal(interpretation.domainInterpretations[0].riskCategory, "MODERATE_CONCERN");
    }
);

runTest(
    "no numerical risk class review priority score or public contract fields are introduced",
    () => {
        const interpretation = interpretationFromContracts([completeContract()]);
        const text = JSON.stringify(interpretation);

        assert.equal(Object.hasOwn(interpretation, "riskClass"), false);
        assert.equal(Object.hasOwn(interpretation, "reviewPriority"), false);
        assert.equal(Object.hasOwn(interpretation, "contractName"), false);
        assert.equal(Object.hasOwn(interpretation, "contractVersion"), false);
        assert.equal(Object.hasOwn(interpretation.overallInterpretation, "numericValue"), false);
        assert.equal(/scoreValue|riskScore|weighted|weighting|calculateRisk|calculateConfidence/.test(text), false);
    }
);

runTest(
    "no Date.now random router provider UI report API or persistence dependency appears",
    () => {
        const source = String(BuildingRiskInterpretationModel.interpret);
        const interpretation = interpretationFromContracts([completeContract()]);
        const text = JSON.stringify(interpretation);

        assert.equal(source.includes("Date.now"), false);
        assert.equal(source.includes("Math.random"), false);
        assert.equal(text.includes("KnowledgeDomainRouter"), false);
        assert.equal(text.includes("KnowledgeProvider"), false);
        assert.equal(Object.hasOwn(interpretation, "ui"), false);
        assert.equal(Object.hasOwn(interpretation, "report"), false);
        assert.equal(Object.hasOwn(interpretation, "api"), false);
        assert.equal(Object.hasOwn(interpretation, "persistence"), false);
    }
);

runTest(
    "guardrails remain visible and recommendations are only preserved",
    () => {
        const interpretation = interpretationFromContracts([completeContract()]);
        const domain = interpretation.domainInterpretations[0];

        assert.deepStrictEqual(domain.guardrails, ["No safety conclusion is made."]);
        assert.deepStrictEqual(
            domain.recommendations.map((entry) => entry.sourceElement.value),
            ["Review source documents.", "Request verification."]
        );
        assert.equal(domain.recommendations.some((entry) => entry.sourceElement.value === "new recommendation"), false);
    }
);

function riskRelevanceEntry({
    valueState,
    versionState,
    canonicalValue,
    governanceVersion = RISK_RELEVANCE_GOVERNANCE_VERSION,
    rawVersion = RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
    reference
}) {
    return Object.freeze({
        riskRelevanceEntryReference: reference,
        sourceReference: "src-contract-a",
        sourceElementReference: "src-contract-a:hypothesis:001",
        sourceElementType: "primary-hypothesis",
        canonicalValue,
        valueState,
        versionState,
        governanceVersion,
        rawVersion,
        interpretationEligible: false
    });
}

console.log("BuildingRiskInterpretationModel tests completed successfully.");
