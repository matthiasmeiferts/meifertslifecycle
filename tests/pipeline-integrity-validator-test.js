import assert from "node:assert/strict";
import PipelineIntegrityValidator from "../portal/core/PipelineIntegrityValidator.js";

function runTest(name, testFunction) {
    try {
        testFunction();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

function createValidResult() {
    const findings = [
        {
            findingId: "f-roof",
            sourceQuestionIds: [
                "q-roof"
            ],
            evidenceIds: [
                "e-roof"
            ]
        }
    ];

    const assessments = [
        {
            assessmentId: "a-roof",
            risk: "high",
            findingIds: [
                "f-roof"
            ]
        }
    ];

    const recommendations = [
        {
            recommendationId: "r-roof",
            assessmentIds: [
                "a-roof"
            ]
        }
    ];

    return {
        input: {
            questions: [
                {
                    id: "q-roof"
                }
            ]
        },

        generatedFollowUps: [],

        evidence: [
            {
                evidenceId: "e-roof",
                sourceQuestionId: "q-roof"
            }
        ],

        findings,
        assessments,
        recommendations,

        report: {
            metadata: {
                reportVersion:
                    "Foundation-1.0",

                findingCount:
                    1,

                assessmentCount:
                    1,

                recommendationCount:
                    1
            },

            findings,
            assessments,
            recommendations,

            summary: {
                highestRisk:
                    "high",

                totalFindings:
                    1,

                totalAssessments:
                    1,

                totalRecommendations:
                    1
            }
        }
    };
}

runTest(
    "accepts a valid pipeline result",
    () => {
        const result =
            PipelineIntegrityValidator.validate(
                createValidResult()
            );

        assert.equal(result.valid, true);
        assert.deepEqual(result.errors, []);
    }
);

runTest(
    "detects duplicate identifiers",
    () => {
        const source =
            createValidResult();

        source.evidence.push({
            evidenceId: "e-roof",
            sourceQuestionId: "q-roof"
        });

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(result.valid, false);

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "duplicate_evidence_id"
            ),
            true
        );
    }
);

runTest(
    "detects unknown evidence references",
    () => {
        const source =
            createValidResult();

        source.findings[0].evidenceIds = [
            "e-missing"
        ];

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "finding_unknown_evidence"
            ),
            true
        );
    }
);

runTest(
    "detects unknown finding references",
    () => {
        const source =
            createValidResult();

        source.assessments[0].findingIds = [
            "f-missing"
        ];

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "assessment_unknown_finding"
            ),
            true
        );
    }
);

runTest(
    "detects unknown assessment references",
    () => {
        const source =
            createValidResult();

        source.recommendations[0]
            .assessmentIds = [
                "a-missing"
            ];

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "recommendation_unknown_assessment"
            ),
            true
        );
    }
);

runTest(
    "includes generated follow-up questions",
    () => {
        const source =
            createValidResult();

        source.generatedFollowUps = [
            {
                question: {
                    id: "q-roof-detail"
                }
            }
        ];

        source.evidence.push({
            evidenceId:
                "e-roof-detail",

            sourceQuestionId:
                "q-roof-detail"
        });

        source.report.metadata.findingCount =
            source.findings.length;

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "evidence_unknown_source_question"
            ),
            false
        );
    }
);

runTest(
    "detects incorrect report totals",
    () => {
        const source =
            createValidResult();

        source.report.summary.totalFindings =
            99;

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "report_totalFindings_mismatch"
            ),
            true
        );
    }
);

runTest(
    "detects incorrect highest risk",
    () => {
        const source =
            createValidResult();

        source.report.summary.highestRisk =
            "low";

        const result =
            PipelineIntegrityValidator.validate(
                source
            );

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "report_highest_risk_mismatch"
            ),
            true
        );
    }
);

runTest(
    "invalid empty result is rejected safely",
    () => {
        const result =
            PipelineIntegrityValidator.validate();

        assert.equal(result.valid, false);

        assert.equal(
            result.errors.some(
                (error) =>
                    error.code ===
                    "report_missing"
            ),
            true
        );
    }
);

console.log(
    "PipelineIntegrityValidator tests completed successfully."
);
