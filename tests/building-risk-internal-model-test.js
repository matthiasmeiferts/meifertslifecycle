import assert from "node:assert/strict";

import BuildingRiskInternalModel from "../portal/core/risk/BuildingRiskInternalModel.js";

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

console.log("BuildingRiskInternalModel tests completed successfully.");
