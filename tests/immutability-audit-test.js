import assert from "node:assert/strict";

import CanonicalDataModel from "../portal/core/model/CanonicalDataModel.js";
import InspectionPipelineEngine from "../portal/core/InspectionPipelineEngine.js";
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
    "keeps source inputs immutable across canonical model, pipeline and report assembly",
    () => {

        const context = {
            contextVersion: "1.0",
            inspectionId: "INSP-001",
            profile: {
                country: "Thailand",
                buildingType: "condominium",
                useType: "residential"
            },
            answers: {
                q1: {
                    value: "yes"
                }
            },
            metadata: {
                requestedBy: "audit"
            }
        };

        const findings = [
            {
                findingId: "f1",
                category: "Structure",
                severity: "high",
                confidence: "supported",
                summary: "Crack observed"
            }
        ];

        const assessments = [
            {
                assessmentId: "a1",
                category: "Structure",
                risk: "high",
                condition: "poor",
                confidence: "supported",
                summary: "Structural issue"
            }
        ];

        const recommendations = [
            {
                recommendationId: "r1",
                category: "Structure",
                priority: "high",
                action: "Engage specialist",
                timeframe: "Within 30 days",
                justification: "Risk is high",
                assessmentIds: ["a1"]
            }
        ];

        const contextOriginal =
            structuredClone(context);

        const findingsOriginal =
            structuredClone(findings);

        const assessmentsOriginal =
            structuredClone(assessments);

        const recommendationsOriginal =
            structuredClone(recommendations);

        const questions = [
            {
                id: "q1",
                text: "Visible structural crack?",
                required: true,
                priority: 100,
                visibility: {
                    countries: ["Thailand"]
                },
                evidenceRules: [
                    {
                        evidenceId: "ev-1",
                        equals: "yes",
                        required: true,
                        priority: "high"
                    }
                ],
                findingRules: [
                    {
                        findingId: "fx-1",
                        equals: "yes",
                        category: "Structure",
                        severity: "high",
                        summary: "Structural crack indicated"
                    }
                ]
            }
        ];

        const answers = {
            q1: {
                value: "yes"
            }
        };

        CanonicalDataModel.createReport({
            context,
            findings,
            assessments,
            recommendations,
            generatedAt: "2026-07-17T12:00:00.000Z"
        });

        InspectionPipelineEngine.run({
            questions,
            answers,
            context
        });

        ReportAssemblyEngine.assembleReport({
            context,
            findings,
            assessments,
            recommendations,
            generatedAt: "2026-07-17T12:00:00.000Z"
        });

        assert.deepStrictEqual(
            context,
            contextOriginal
        );

        assert.deepStrictEqual(
            findings,
            findingsOriginal
        );

        assert.deepStrictEqual(
            assessments,
            assessmentsOriginal
        );

        assert.deepStrictEqual(
            recommendations,
            recommendationsOriginal
        );

    }
);

console.log(
    "Immutability audit test completed successfully."
);
