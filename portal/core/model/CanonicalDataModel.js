export default class CanonicalDataModel {

    static createInspectionContext(input = {}) {
        const source =
            this.normalizeObject(input);

        return {
            contextVersion:
                this.normalizeString(
                    source.contextVersion,
                    "1.0"
                ),

            inspectionId:
                this.normalizeOptionalString(
                    source.inspectionId
                ),

            propertyId:
                this.normalizeOptionalString(
                    source.propertyId
                ),

            profile:
                this.cloneObject(
                    source.profile
                ),

            answers:
                this.normalizeAnswers(
                    source.answers
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createQuestion(input = {}) {
        const source =
            this.normalizeObject(input);

        const id =
            this.resolveId(
                source.id,
                source.questionId
            );

        return {
            id,

            type:
                this.normalizeString(
                    source.type,
                    "text"
                ),

            text:
                this.normalizeString(
                    source.text,
                    ""
                ),

            category:
                this.normalizeString(
                    source.category,
                    "General"
                ),

            priority:
                this.normalizeNumber(
                    source.priority,
                    0
                ),

            required:
                this.normalizeBoolean(
                    source.required,
                    false
                ),

            dependencies:
                this.cloneArray(
                    source.dependencies
                ),

            visibilityRules:
                this.cloneArray(
                    source.visibilityRules
                ),

            followUps:
                this.cloneArray(
                    source.followUps
                ),

            evidenceRules:
                this.cloneArray(
                    source.evidenceRules
                ),

            findingRules:
                this.cloneArray(
                    source.findingRules
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createAnswer(input = {}) {
        const source =
            this.normalizeObject(input);

        return {
            questionId:
                this.resolveId(
                    source.questionId,
                    source.id
                ),

            value:
                Object.prototype.hasOwnProperty.call(
                    source,
                    "value"
                )
                    ? this.cloneValue(
                        source.value
                    )
                    : null,

            answeredAt:
                this.normalizeOptionalString(
                    source.answeredAt
                ),

            source:
                this.normalizeString(
                    source.source,
                    "user"
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createEvidence(input = {}) {
        const source =
            this.normalizeObject(input);

        return {
            evidenceId:
                this.resolveId(
                    source.evidenceId,
                    source.id
                ),

            sourceQuestionId:
                this.normalizeOptionalString(
                    source.sourceQuestionId
                ),

            priority:
                this.normalizeString(
                    source.priority,
                    "normal"
                ),

            required:
                this.normalizeBoolean(
                    source.required,
                    true
                ),

            reason:
                this.normalizeString(
                    source.reason,
                    "rule_match"
                ),

            status:
                this.normalizeString(
                    source.status,
                    "requested"
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createFinding(input = {}) {
        const source =
            this.normalizeObject(input);

        return {
            findingId:
                this.resolveId(
                    source.findingId,
                    source.id
                ),

            category:
                this.normalizeString(
                    source.category,
                    "General"
                ),

            severity:
                this.normalizeString(
                    source.severity,
                    "medium"
                ),

            confidence:
                this.normalizeString(
                    source.confidence,
                    "preliminary"
                ),

            summary:
                this.normalizeString(
                    source.summary,
                    "Inspection finding generated."
                ),

            sourceQuestionIds:
                this.normalizeStringArray(
                    source.sourceQuestionIds
                ),

            evidenceIds:
                this.normalizeStringArray(
                    source.evidenceIds
                ),

            generated:
                this.normalizeBoolean(
                    source.generated,
                    false
                ),

            generationReason:
                this.normalizeOptionalString(
                    source.generationReason
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createAssessment(input = {}) {
        const source =
            this.normalizeObject(input);

        return {
            assessmentId:
                this.resolveId(
                    source.assessmentId,
                    source.id
                ),

            category:
                this.normalizeString(
                    source.category,
                    "General"
                ),

            risk:
                this.normalizeString(
                    source.risk,
                    "medium"
                ),

            condition:
                this.normalizeString(
                    source.condition,
                    "fair"
                ),

            confidence:
                this.normalizeString(
                    source.confidence,
                    "supported"
                ),

            summary:
                this.normalizeString(
                    source.summary,
                    ""
                ),

            findingIds:
                this.normalizeStringArray(
                    source.findingIds
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createRecommendation(input = {}) {
        const source =
            this.normalizeObject(input);

        return {
            recommendationId:
                this.resolveId(
                    source.recommendationId,
                    source.id
                ),

            category:
                this.normalizeString(
                    source.category,
                    "General"
                ),

            priority:
                this.normalizeString(
                    source.priority,
                    "medium"
                ),

            action:
                this.normalizeString(
                    source.action,
                    ""
                ),

            timeframe:
                this.normalizeString(
                    source.timeframe,
                    "Within 6 months"
                ),

            justification:
                this.normalizeString(
                    source.justification,
                    ""
                ),

            assessmentIds:
                this.normalizeStringArray(
                    source.assessmentIds
                ),

            generated:
                this.normalizeBoolean(
                    source.generated,
                    false
                ),

            metadata:
                this.cloneObject(
                    source.metadata
                )
        };
    }

    static createReport(input = {}) {
        const source =
            this.normalizeObject(input);

        const findings =
            this.normalizeCollection(
                source.findings,
                (entry) =>
                    this.createFinding(entry)
            );

        const assessments =
            this.normalizeCollection(
                source.assessments,
                (entry) =>
                    this.createAssessment(entry)
            );

        const recommendations =
            this.normalizeCollection(
                source.recommendations,
                (entry) =>
                    this.createRecommendation(entry)
            );

        return {
            metadata: {
                generatedAt:
                    this.normalizeString(
                        source.metadata?.generatedAt,
                        new Date().toISOString()
                    ),

                reportVersion:
                    this.normalizeString(
                        source.metadata?.reportVersion,
                        "Foundation-1.0"
                    ),

                findingCount:
                    findings.length,

                assessmentCount:
                    assessments.length,

                recommendationCount:
                    recommendations.length
            },

            context:
                this.createInspectionContext(
                    source.context
                ),

            findings,

            assessments,

            recommendations,

            summary: {
                highestRisk:
                    this.normalizeString(
                        source.summary?.highestRisk,
                        this.determineHighestRisk(
                            assessments
                        )
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

    static normalizeAnswers(answers) {
        if (Array.isArray(answers)) {
            return answers
                .filter(
                    (entry) =>
                        entry &&
                        typeof entry === "object"
                )
                .map(
                    (entry) =>
                        this.createAnswer(entry)
                );
        }

        if (
            answers &&
            typeof answers === "object"
        ) {
            return Object.fromEntries(
                Object.entries(answers)
                    .map(([questionId, value]) => [
                        questionId,
                        this.cloneValue(value)
                    ])
            );
        }

        return {};
    }

    static normalizeCollection(
        collection,
        factory
    ) {
        if (!Array.isArray(collection)) {
            return [];
        }

        return collection
            .filter(
                (entry) =>
                    entry &&
                    typeof entry === "object"
            )
            .map(factory);
    }

    static normalizeObject(value) {
        if (
            !value ||
            typeof value !== "object" ||
            Array.isArray(value)
        ) {
            return {};
        }

        return value;
    }

    static normalizeString(
        value,
        fallback = ""
    ) {
        return (
            typeof value === "string" &&
            value.length > 0
        )
            ? value
            : fallback;
    }

    static normalizeOptionalString(value) {
        return (
            typeof value === "string" &&
            value.length > 0
        )
            ? value
            : null;
    }

    static normalizeBoolean(
        value,
        fallback = false
    ) {
        return typeof value === "boolean"
            ? value
            : fallback;
    }

    static normalizeNumber(
        value,
        fallback = 0
    ) {
        return (
            typeof value === "number" &&
            Number.isFinite(value)
        )
            ? value
            : fallback;
    }

    static normalizeStringArray(value) {
        if (!Array.isArray(value)) {
            return [];
        }

        return [
            ...new Set(
                value.filter(
                    (entry) =>
                        typeof entry === "string" &&
                        entry.length > 0
                )
            )
        ];
    }

    static resolveId(
        primary,
        secondary
    ) {
        if (
            typeof primary === "string" &&
            primary.length > 0
        ) {
            return primary;
        }

        if (
            typeof secondary === "string" &&
            secondary.length > 0
        ) {
            return secondary;
        }

        return null;
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
                    (assessment) =>
                        assessment?.risk === risk
                )
            ) {
                return risk;
            }
        }

        return "low";
    }

    static cloneArray(value) {
        return Array.isArray(value)
            ? this.cloneValue(value)
            : [];
    }

    static cloneObject(value) {
        return (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
        )
            ? this.cloneValue(value)
            : {};
    }

    static cloneValue(value) {
        if (value === undefined) {
            return undefined;
        }

        return JSON.parse(
            JSON.stringify(value)
        );
    }

}
