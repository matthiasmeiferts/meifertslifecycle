export default class AssessmentGenerationEngine {

    static generateAssessments(
        findings = [],
        context = {}
    ) {
        if (!Array.isArray(findings)) {
            return [];
        }

        const groups = new Map();

        findings.forEach((finding) => {
            if (!finding || typeof finding !== "object") {
                return;
            }

            const category =
                finding.category ?? "General";

            if (!groups.has(category)) {
                groups.set(category, []);
            }

            groups.get(category).push(finding);
        });

        return Array.from(groups.entries()).map(
            ([category, categoryFindings]) => {

                const risks =
                    categoryFindings.map(
                        f => f.severity ?? "medium"
                    );

                const confidence =
                    categoryFindings.some(
                        f => f.confidence === "confirmed"
                    )
                        ? "confirmed"
                        : "supported";

                return {

                    assessmentId:
                        this.createAssessmentId(
                            category
                        ),

                    category,

                    risk:
                        this.calculateRisk(
                            risks
                        ),

                    condition:
                        this.calculateCondition(
                            risks
                        ),

                    confidence,

                    summary:
                        `${categoryFindings.length} finding(s) assessed for ${category}.`,

                    findingIds:
                        categoryFindings.map(
                            f => f.findingId
                        )

                };

            });

    }

    static calculateRisk(severities = []) {

        if (severities.includes("critical")) {
            return "critical";
        }

        if (severities.includes("high")) {
            return "high";
        }

        if (severities.includes("medium")) {
            return "medium";
        }

        return "low";

    }

    static calculateCondition(
        severities = []
    ) {

        const risk =
            this.calculateRisk(
                severities
            );

        switch (risk) {

            case "critical":
                return "critical";

            case "high":
                return "poor";

            case "medium":
                return "fair";

            default:
                return "good";

        }

    }

    static createAssessmentId(
        category
    ) {

        return category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

    }

}
