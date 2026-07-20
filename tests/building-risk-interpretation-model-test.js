import assert from "node:assert/strict";

import BuildingRiskInternalModel from "../portal/core/risk/BuildingRiskInternalModel.js";
import BuildingRiskInterpretationModel from "../portal/core/risk/BuildingRiskInterpretationModel.js";

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
                primaryHypothesis: { ...completeContract().primaryHypothesis, riskRelevance: "low", potentialConsequences: [] },
                potentialConsequences: []
            }),
            completeContract({ sourceReference: "src-critical", domain: "future-b", primaryHypothesis: { ...completeContract().primaryHypothesis, riskRelevance: "critical" } })
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
            primaryHypothesis: { ...completeContract().primaryHypothesis, riskRelevance: "low", potentialConsequences: [] },
            potentialConsequences: []
        });
        const critical = completeContract({
            sourceReference: "src-critical",
            domain: "future-b",
            primaryHypothesis: { ...completeContract().primaryHypothesis, riskRelevance: "critical" }
        });

        assert.equal(interpretationFromContracts([low, critical]).overallInterpretation.riskCategory, "CRITICAL_CONCERN");
        assert.equal(interpretationFromContracts([critical, low]).overallInterpretation.riskCategory, "CRITICAL_CONCERN");
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

console.log("BuildingRiskInterpretationModel tests completed successfully.");
