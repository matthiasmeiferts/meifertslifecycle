import assert from "node:assert/strict";
import CanonicalDataModel from "../portal/core/model/CanonicalDataModel.js";

function runTest(name, testFunction) {
    try {
        testFunction();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

runTest(
    "creates canonical inspection context",
    () => {
        const result =
            CanonicalDataModel.createInspectionContext({
                inspectionId: "inspection-1",
                profile: {
                    country: "Thailand"
                },
                answers: {
                    q1: "yes"
                }
            });

        assert.equal(
            result.contextVersion,
            "1.0"
        );

        assert.equal(
            result.inspectionId,
            "inspection-1"
        );

        assert.equal(
            result.profile.country,
            "Thailand"
        );

        assert.deepEqual(
            result.answers,
            {
                q1: "yes"
            }
        );
    }
);

runTest(
    "creates canonical question",
    () => {
        const result =
            CanonicalDataModel.createQuestion({
                questionId: "q1",
                text: "Is moisture visible?",
                category: "Moisture",
                priority: 100,
                required: true
            });

        assert.equal(result.id, "q1");
        assert.equal(
            result.type,
            "text"
        );
        assert.equal(
            result.category,
            "Moisture"
        );
        assert.equal(
            result.priority,
            100
        );
        assert.equal(
            result.required,
            true
        );
    }
);

runTest(
    "creates canonical answer",
    () => {
        const result =
            CanonicalDataModel.createAnswer({
                id: "q1",
                value: false
            });

        assert.equal(
            result.questionId,
            "q1"
        );

        assert.equal(
            result.value,
            false
        );
    }
);

runTest(
    "creates canonical evidence",
    () => {
        const result =
            CanonicalDataModel.createEvidence({
                id: "e1",
                sourceQuestionId: "q1"
            });

        assert.equal(
            result.evidenceId,
            "e1"
        );

        assert.equal(
            result.required,
            true
        );

        assert.equal(
            result.status,
            "requested"
        );
    }
);

runTest(
    "creates canonical finding",
    () => {
        const result =
            CanonicalDataModel.createFinding({
                id: "f1",
                sourceQuestionIds: [
                    "q1",
                    "q1",
                    null
                ],
                evidenceIds: [
                    "e1"
                ]
            });

        assert.equal(
            result.findingId,
            "f1"
        );

        assert.deepEqual(
            result.sourceQuestionIds,
            ["q1"]
        );

        assert.deepEqual(
            result.evidenceIds,
            ["e1"]
        );
    }
);

runTest(
    "creates canonical assessment",
    () => {
        const result =
            CanonicalDataModel.createAssessment({
                id: "a1",
                risk: "high",
                findingIds: [
                    "f1"
                ]
            });

        assert.equal(
            result.assessmentId,
            "a1"
        );

        assert.equal(
            result.condition,
            "fair"
        );

        assert.deepEqual(
            result.findingIds,
            ["f1"]
        );
    }
);

runTest(
    "creates canonical recommendation",
    () => {
        const result =
            CanonicalDataModel.createRecommendation({
                id: "r1",
                action: "Inspect roof.",
                assessmentIds: [
                    "a1"
                ]
            });

        assert.equal(
            result.recommendationId,
            "r1"
        );

        assert.equal(
            result.priority,
            "medium"
        );

        assert.deepEqual(
            result.assessmentIds,
            ["a1"]
        );
    }
);

runTest(
    "creates canonical report and recalculates totals",
    () => {
        const result =
            CanonicalDataModel.createReport({
                metadata: {
                    findingCount: 999
                },

                context: {
                    inspectionId:
                        "inspection-1"
                },

                findings: [
                    {
                        findingId: "f1"
                    }
                ],

                assessments: [
                    {
                        assessmentId: "a1",
                        risk: "high"
                    }
                ],

                recommendations: [
                    {
                        recommendationId: "r1"
                    }
                ]
            });

        assert.equal(
            result.metadata.findingCount,
            1
        );

        assert.equal(
            result.metadata.assessmentCount,
            1
        );

        assert.equal(
            result.metadata.recommendationCount,
            1
        );

        assert.equal(
            result.summary.highestRisk,
            "high"
        );
    }
);

runTest(
    "preserves false and zero answer values",
    () => {
        const falseAnswer =
            CanonicalDataModel.createAnswer({
                questionId: "q1",
                value: false
            });

        const zeroAnswer =
            CanonicalDataModel.createAnswer({
                questionId: "q2",
                value: 0
            });

        assert.equal(
            falseAnswer.value,
            false
        );

        assert.equal(
            zeroAnswer.value,
            0
        );
    }
);

runTest(
    "handles invalid input safely",
    () => {
        assert.equal(
            CanonicalDataModel
                .createQuestion(null)
                .id,
            null
        );

        assert.deepEqual(
            CanonicalDataModel
                .createInspectionContext(null)
                .answers,
            {}
        );

        assert.deepEqual(
            CanonicalDataModel
                .createReport(null)
                .findings,
            []
        );
    }
);

runTest(
    "does not modify source objects",
    () => {
        const source = {
            findingId: "f1",
            evidenceIds: [
                "e1"
            ],
            metadata: {
                nested: true
            }
        };

        const before =
            JSON.stringify(source);

        const result =
            CanonicalDataModel.createFinding(
                source
            );

        result.evidenceIds.push("e2");
        result.metadata.nested = false;

        assert.equal(
            JSON.stringify(source),
            before
        );
    }
);

console.log(
    "CanonicalDataModel tests completed successfully."
);
