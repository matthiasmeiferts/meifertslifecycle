import assert from "node:assert/strict";
import ReportAssemblyEngine from "../portal/core/ReportAssemblyEngine.js";

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
    "assembles complete report",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport({

                context: {
                    country: "Thailand"
                },

                findings: [
                    { findingId: "f1" }
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
            report.findings.length,
            1
        );

        assert.equal(
            report.assessments.length,
            1
        );

        assert.equal(
            report.recommendations.length,
            1
        );

    }
);

runTest(
    "counts objects correctly",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport({

                findings: [{}, {}],

                assessments: [{}, {}, {}],

                recommendations: [{}]

            });

        assert.equal(
            report.metadata.findingCount,
            2
        );

        assert.equal(
            report.metadata.assessmentCount,
            3
        );

        assert.equal(
            report.metadata.recommendationCount,
            1
        );

    }
);

runTest(
    "detects highest critical risk",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport({

                assessments: [

                    {
                        risk: "medium"
                    },

                    {
                        risk: "critical"
                    }

                ]

            });

        assert.equal(
            report.summary.highestRisk,
            "critical"
        );

    }
);

runTest(
    "detects highest high risk",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport({

                assessments: [

                    {
                        risk: "medium"
                    },

                    {
                        risk: "high"
                    }

                ]

            });

        assert.equal(
            report.summary.highestRisk,
            "high"
        );

    }
);

runTest(
    "returns low when no risks exist",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport({

                assessments: []

            });

        assert.equal(
            report.summary.highestRisk,
            "low"
        );

    }
);

runTest(
    "creates ISO timestamp",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport();

        assert.ok(
            report.metadata.generatedAt.includes("T")
        );

    }
);

runTest(
    "uses Foundation version",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport();

        assert.equal(
            report.metadata.reportVersion,
            "Foundation-1.0"
        );

    }
);

runTest(
    "summary totals are correct",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport({

                findings: [{}, {}, {}],

                assessments: [{}, {}],

                recommendations: [{}, {}, {}, {}]

            });

        assert.equal(
            report.summary.totalFindings,
            3
        );

        assert.equal(
            report.summary.totalAssessments,
            2
        );

        assert.equal(
            report.summary.totalRecommendations,
            4
        );

    }
);

runTest(
    "copies arrays instead of reusing references",
    () => {

        const findings = [
            {
                findingId: "f1"
            }
        ];

        const report =
            ReportAssemblyEngine.assembleReport({
                findings
            });

        assert.notEqual(
            report.findings,
            findings
        );

    }
);

runTest(
    "preserves context",
    () => {

        const context = {

            profile: {

                country:
                    "Thailand"

            }

        };

        const report =
            ReportAssemblyEngine.assembleReport({

                context

            });

        assert.deepEqual(
            report.context,
            context
        );

    }
);

runTest(
    "handles empty report",
    () => {

        const report =
            ReportAssemblyEngine.assembleReport();

        assert.deepEqual(
            report.findings,
            []
        );

        assert.deepEqual(
            report.assessments,
            []
        );

        assert.deepEqual(
            report.recommendations,
            []
        );

    }
);

console.log(
    "ReportAssemblyEngine tests completed successfully."
);
