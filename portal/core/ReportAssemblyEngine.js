import FoundationVersion from "./FoundationVersion.js";

export default class ReportAssemblyEngine {

    static assembleReport({
        context = {},
        findings = [],
        assessments = [],
        recommendations = []
    } = {}) {

        return {

            metadata: {

                generatedAt:
                    new Date().toISOString(),

                reportVersion:
                    FoundationVersion.CURRENT,

                findingCount:
                    findings.length,

                assessmentCount:
                    assessments.length,

                recommendationCount:
                    recommendations.length

            },

            context,

            findings:
                [...findings],

            assessments:
                [...assessments],

            recommendations:
                [...recommendations],

            summary: {

                highestRisk:
                    this.determineHighestRisk(
                        assessments
                    ),

                totalFindings:
                    findings.length,

                totalAssessments:
                    assessments.length,

                totalRecommendations:
                    recommendations.length

            }

        };

    }

    static determineHighestRisk(
        assessments = []
    ) {

        const ranking = [
            "critical",
            "high",
            "medium",
            "low"
        ];

        for (const risk of ranking) {

            if (
                assessments.some(
                    assessment =>
                        assessment?.risk === risk
                )
            ) {
                return risk;
            }

        }

        return "low";

    }

}
