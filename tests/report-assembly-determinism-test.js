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
    "produces deterministic report with fixed generatedAt",
    () => {

        const generatedAt = "2026-07-17T12:00:00.000Z";

        const findings = [
            {
                findingId: "f1",
                category: "Structure",
                severity: "high"
            }
        ];

        const assessments = [
            {
                assessmentId: "a1",
                risk: "high",
                condition: "fair"
            }
        ];

        const recommendations = [
            {
                recommendationId: "r1",
                priority: "high",
                action: "Schedule structural specialist review."
            }
        ];

        const findingsBefore =
            structuredClone(findings);

        const assessmentsBefore =
            structuredClone(assessments);

        const recommendationsBefore =
            structuredClone(recommendations);

        const baseInput = {
            context: {
                inspectionId: "I-100"
            },
            findings,
            assessments,
            recommendations,
            generatedAt
        };

        const report1 =
            ReportAssemblyEngine.assembleReport(baseInput);

        const report2 =
            ReportAssemblyEngine.assembleReport(baseInput);

        assert.deepStrictEqual(
            report1,
            report2
        );

        assert.equal(
            report1.metadata.generatedAt,
            generatedAt
        );

        assert.equal(
            report2.metadata.generatedAt,
            generatedAt
        );

        assert.deepStrictEqual(
            findings,
            findingsBefore
        );

        assert.deepStrictEqual(
            assessments,
            assessmentsBefore
        );

        assert.deepStrictEqual(
            recommendations,
            recommendationsBefore
        );

    }
);

console.log(
    "ReportAssemblyEngine determinism test completed successfully."
);
