import assert from "node:assert/strict";
import InspectionPipelineEngine from "../portal/core/InspectionPipelineEngine.js";

function runTest(
    name,
    testFunction
) {
    try {
        testFunction();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

runTest(
    "returns complete pipeline result",
    () => {

        const result =
            InspectionPipelineEngine.run({
                questions: [],
                answers: {},
                context: {
                    country: "Thailand"
                }
            });

        assert.ok(
            result &&
            typeof result === "object"
        );

        assert.ok(
            result.input
        );

        assert.ok(
            result.report
        );

    }
);

runTest(
    "returns all pipeline stages",
    () => {

        const result =
            InspectionPipelineEngine.run();

        assert.ok(
            Array.isArray(
                result.visibleQuestions
            )
        );

        assert.ok(
            Array.isArray(
                result.prioritizedQuestions
            )
        );

        assert.ok(
            Array.isArray(
                result.generatedFollowUps
            )
        );

        assert.ok(
            Array.isArray(
                result.evidence
            )
        );

        assert.ok(
            Array.isArray(
                result.findings
            )
        );

        assert.ok(
            Array.isArray(
                result.assessments
            )
        );

        assert.ok(
            Array.isArray(
                result.recommendations
            )
        );

    }
);

runTest(
    "creates assembled report",
    () => {

        const result =
            InspectionPipelineEngine.run();

        assert.equal(
            result.report.metadata
                .reportVersion,
            "Foundation-4.0"
        );

        assert.equal(
            result.report.summary
                .totalFindings,
            result.findings.length
        );

        assert.equal(
            result.report.summary
                .totalAssessments,
            result.assessments.length
        );

        assert.equal(
            result.report.summary
                .totalRecommendations,
            result.recommendations.length
        );

    }
);

runTest(
    "preserves valid context and injects answers",
    () => {

        const context = {
            profile: {
                country:
                    "Thailand",

                propertyType:
                    "Condominium"
            }
        };

        const result =
            InspectionPipelineEngine.run({
                questions: [],
                answers: {},
                context
            });

        assert.deepEqual(
            result.report.context.profile,
            context.profile
        );

        assert.deepEqual(
            result.report.context.answers,
            {}
        );

    }
);

runTest(
    "handles invalid collections safely",
    () => {

        const result =
            InspectionPipelineEngine.run({
                questions: null,
                answers: null,
                context: null,
                graph: null
            });

        assert.deepEqual(
            result.input.questions,
            []
        );

        assert.deepEqual(
            result.input.answers,
            {}
        );

        assert.deepEqual(
            result.input.context,
            {}
        );

    }
);

runTest(
    "does not modify source input",
    () => {

        const questions = [
            {
                questionId: "q-1",
                answer: "yes"
            }
        ];

        const answers = {
            "q-1": "yes"
        };

        const context = {
            country: "Thailand"
        };

        const questionsBefore =
            JSON.stringify(questions);

        const answersBefore =
            JSON.stringify(answers);

        const contextBefore =
            JSON.stringify(context);

        InspectionPipelineEngine.run({
            questions,
            answers,
            context
        });

        assert.equal(
            JSON.stringify(questions),
            questionsBefore
        );

        assert.equal(
            JSON.stringify(answers),
            answersBefore
        );

        assert.equal(
            JSON.stringify(context),
            contextBefore
        );

    }
);

runTest(
    "empty input creates stable empty report",
    () => {

        const result =
            InspectionPipelineEngine.run();

        assert.deepEqual(
            result.report.findings,
            []
        );

        assert.deepEqual(
            result.report.assessments,
            []
        );

        assert.deepEqual(
            result.report
                .recommendations,
            []
        );

        assert.equal(
            result.report.summary
                .highestRisk,
            "low"
        );

    }
);

console.log(
    "InspectionPipelineEngine tests completed successfully."
);
