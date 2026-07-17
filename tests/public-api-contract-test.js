import assert from "node:assert/strict";

import InspectionPipelineEngine from "../portal/core/InspectionPipelineEngine.js";
import ReportAssemblyEngine from "../portal/core/ReportAssemblyEngine.js";
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
    "public entry points exist and are callable",
    () => {

        assert.equal(
            typeof InspectionPipelineEngine,
            "function"
        );

        assert.equal(
            typeof ReportAssemblyEngine,
            "function"
        );

        assert.equal(
            typeof CanonicalDataModel,
            "function"
        );

        assert.equal(
            typeof InspectionPipelineEngine.run,
            "function"
        );

        assert.equal(
            typeof ReportAssemblyEngine.assembleReport,
            "function"
        );

        assert.equal(
            typeof CanonicalDataModel.createReport,
            "function"
        );

        const report =
            ReportAssemblyEngine.assembleReport({
                context: {
                    inspectionId: "API-1"
                },
                findings: [],
                assessments: [],
                recommendations: [],
                generatedAt: "2026-07-17T12:00:00.000Z"
            });

        assert.ok(
            report &&
            typeof report === "object"
        );

        const canonicalReport =
            CanonicalDataModel.createReport({
                context: {
                    inspectionId: "API-1"
                },
                findings: [],
                assessments: [],
                recommendations: [],
                generatedAt: "2026-07-17T12:00:00.000Z"
            });

        assert.ok(
            canonicalReport &&
            typeof canonicalReport === "object"
        );

        const pipelineResult =
            InspectionPipelineEngine.run({
                questions: [],
                answers: {},
                context: {
                    profile: {
                        country: "Thailand"
                    }
                }
            });

        assert.ok(
            pipelineResult &&
            typeof pipelineResult === "object"
        );

    }
);

runTest(
    "report assembly contract includes required metadata and sections",
    () => {

        const generatedAt =
            "2026-07-17T12:00:00.000Z";

        const report =
            ReportAssemblyEngine.assembleReport({
                context: {
                    inspectionId: "API-2"
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
                ],
                generatedAt
            });

        assert.ok(report.metadata);
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.metadata,
                "generatedAt"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.metadata,
                "reportVersion"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.metadata,
                "findingCount"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.metadata,
                "assessmentCount"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.metadata,
                "recommendationCount"
            )
        );

        assert.equal(
            report.metadata.generatedAt,
            generatedAt
        );

        assert.ok(
            Array.isArray(report.findings)
        );
        assert.ok(
            Array.isArray(report.assessments)
        );
        assert.ok(
            Array.isArray(report.recommendations)
        );
        assert.ok(
            report.summary &&
            typeof report.summary === "object"
        );

        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.summary,
                "highestRisk"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.summary,
                "totalFindings"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.summary,
                "totalAssessments"
            )
        );
        assert.ok(
            Object.prototype.hasOwnProperty.call(
                report.summary,
                "totalRecommendations"
            )
        );

    }
);

runTest(
    "inspection pipeline and canonical report keep contract shape",
    () => {

        const result =
            InspectionPipelineEngine.run({
                questions: [],
                answers: {},
                context: {
                    profile: {
                        country: "Thailand"
                    }
                }
            });

        assert.ok(
            result.input &&
            typeof result.input === "object"
        );

        assert.ok(
            Array.isArray(result.findings)
        );

        assert.ok(
            Array.isArray(result.assessments)
        );

        assert.ok(
            Array.isArray(result.recommendations)
        );

        assert.ok(
            result.report &&
            typeof result.report === "object"
        );

        assert.ok(
            result.report.metadata &&
            typeof result.report.metadata === "object"
        );

        assert.ok(
            result.report.summary &&
            typeof result.report.summary === "object"
        );

        const canonicalReport =
            CanonicalDataModel.createReport({
                context: {
                    inspectionId: "API-3"
                },
                findings: [
                    {
                        findingId: "f1"
                    }
                ],
                assessments: [
                    {
                        assessmentId: "a1",
                        risk: "medium"
                    }
                ],
                recommendations: [
                    {
                        recommendationId: "r1"
                    }
                ],
                summary: {
                    highestRisk: "medium"
                },
                generatedAt: "2026-07-17T12:00:00.000Z"
            });

        assert.ok(
            canonicalReport.metadata &&
            typeof canonicalReport.metadata === "object"
        );

        assert.ok(
            Array.isArray(canonicalReport.findings)
        );

        assert.ok(
            Array.isArray(canonicalReport.assessments)
        );

        assert.ok(
            Array.isArray(canonicalReport.recommendations)
        );

        assert.ok(
            canonicalReport.summary &&
            typeof canonicalReport.summary === "object"
        );

    }
);

console.log(
    "Public API contract test completed successfully."
);
