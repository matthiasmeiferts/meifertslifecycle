export default class RecommendationGenerationEngine {

    static generateRecommendations(
        assessments = [],
        context = {}
    ) {
        if (!Array.isArray(assessments)) {
            return [];
        }

        const recommendations = [];
        const recommendationIds = new Set();

        assessments.forEach((assessment, index) => {
            if (!assessment || typeof assessment !== "object") {
                return;
            }

            const recommendation =
                this.createRecommendation(
                    assessment,
                    index
                );

            if (
                recommendationIds.has(
                    recommendation.recommendationId
                )
            ) {
                return;
            }

            recommendationIds.add(
                recommendation.recommendationId
            );

            recommendations.push(
                recommendation
            );
        });

        return recommendations;
    }

    static createRecommendation(
        assessment = {},
        index = 0
    ) {

        const risk =
            assessment.risk ?? "medium";

        const category =
            assessment.category ?? "General";

        return {

            recommendationId:
                assessment.recommendationId ??
                `recommendation-${index + 1}`,

            category,

            priority:
                this.mapPriority(
                    risk
                ),

            action:
                this.createAction(
                    category,
                    risk
                ),

            timeframe:
                this.createTimeframe(
                    risk
                ),

            justification:
                assessment.summary ??
                "",

            assessmentIds: [
                assessment.assessmentId
            ].filter(Boolean),

            generated: true

        };

    }

    static mapPriority(risk) {

        switch (risk) {

            case "critical":
                return "critical";

            case "high":
                return "high";

            case "medium":
                return "medium";

            default:
                return "low";

        }

    }

    static createTimeframe(risk) {

        switch (risk) {

            case "critical":
                return "Immediately";

            case "high":
                return "Within 30 days";

            case "medium":
                return "Within 6 months";

            default:
                return "Monitor";

        }

    }

    static createAction(
        category,
        risk
    ) {

        if (
            risk === "critical"
        ) {

            return `Immediate specialist assessment required for ${category}.`;

        }

        if (
            risk === "high"
        ) {

            return `Prepare corrective action plan for ${category}.`;

        }

        if (
            risk === "medium"
        ) {

            return `Schedule maintenance review for ${category}.`;

        }

        return `Continue routine monitoring of ${category}.`;

    }

}
