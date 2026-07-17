export default class PipelineIntegrityValidator {

    static validate(result = {}) {
        const errors = [];
        const warnings = [];

        const questions =
            this.collectQuestions(result);

        const evidence =
            this.safeArray(result.evidence);

        const findings =
            this.safeArray(result.findings);

        const assessments =
            this.safeArray(result.assessments);

        const recommendations =
            this.safeArray(result.recommendations);

        const questionIds =
            this.collectIds(
                questions,
                ["id", "questionId"],
                "question",
                errors
            );

        const evidenceIds =
            this.collectIds(
                evidence,
                ["evidenceId", "id"],
                "evidence",
                errors
            );

        const findingIds =
            this.collectIds(
                findings,
                ["findingId", "id"],
                "finding",
                errors
            );

        const assessmentIds =
            this.collectIds(
                assessments,
                ["assessmentId", "id"],
                "assessment",
                errors
            );

        this.collectIds(
            recommendations,
            ["recommendationId", "id"],
            "recommendation",
            errors
        );

        evidence.forEach((entry) => {
            const references =
                this.collectReferenceIds(
                    entry,
                    [
                        "sourceQuestionId",
                        "questionId",
                        "sourceQuestionIds",
                        "questionIds"
                    ]
                );

            references.forEach((questionId) => {
                if (!questionIds.has(questionId)) {
                    errors.push({
                        code:
                            "evidence_unknown_source_question",

                        objectId:
                            this.getId(
                                entry,
                                [
                                    "evidenceId",
                                    "id"
                                ]
                            ),

                        referenceId:
                            questionId
                    });
                }
            });
        });

        findings.forEach((entry) => {
            const questionReferences =
                this.collectReferenceIds(
                    entry,
                    [
                        "sourceQuestionId",
                        "questionId",
                        "sourceQuestionIds",
                        "questionIds"
                    ]
                );

            questionReferences.forEach(
                (questionId) => {
                    if (!questionIds.has(questionId)) {
                        errors.push({
                            code:
                                "finding_unknown_source_question",

                            objectId:
                                this.getId(
                                    entry,
                                    [
                                        "findingId",
                                        "id"
                                    ]
                                ),

                            referenceId:
                                questionId
                        });
                    }
                }
            );

            const evidenceReferences =
                this.collectReferenceIds(
                    entry,
                    [
                        "evidenceId",
                        "evidenceIds"
                    ]
                );

            evidenceReferences.forEach(
                (evidenceId) => {
                    if (!evidenceIds.has(evidenceId)) {
                        errors.push({
                            code:
                                "finding_unknown_evidence",

                            objectId:
                                this.getId(
                                    entry,
                                    [
                                        "findingId",
                                        "id"
                                    ]
                                ),

                            referenceId:
                                evidenceId
                        });
                    }
                }
            );
        });

        assessments.forEach((entry) => {
            const references =
                this.collectReferenceIds(
                    entry,
                    [
                        "findingId",
                        "findingIds"
                    ]
                );

            references.forEach((findingId) => {
                if (!findingIds.has(findingId)) {
                    errors.push({
                        code:
                            "assessment_unknown_finding",

                        objectId:
                            this.getId(
                                entry,
                                [
                                    "assessmentId",
                                    "id"
                                ]
                            ),

                        referenceId:
                            findingId
                    });
                }
            });
        });

        recommendations.forEach((entry) => {
            const references =
                this.collectReferenceIds(
                    entry,
                    [
                        "assessmentId",
                        "assessmentIds"
                    ]
                );

            references.forEach(
                (assessmentId) => {
                    if (
                        !assessmentIds.has(
                            assessmentId
                        )
                    ) {
                        errors.push({
                            code:
                                "recommendation_unknown_assessment",

                            objectId:
                                this.getId(
                                    entry,
                                    [
                                        "recommendationId",
                                        "id"
                                    ]
                                ),

                            referenceId:
                                assessmentId
                        });
                    }
                }
            );
        });

        this.validateReport(
            result.report,
            {
                findings,
                assessments,
                recommendations
            },
            errors,
            warnings
        );

        return {
            valid:
                errors.length === 0,

            errors,

            warnings,

            metrics: {
                questionCount:
                    questions.length,

                evidenceCount:
                    evidence.length,

                findingCount:
                    findings.length,

                assessmentCount:
                    assessments.length,

                recommendationCount:
                    recommendations.length
            }
        };
    }

    static collectQuestions(result = {}) {
        const collections = [
            result.input?.questions,
            result.questions,
            result.visibleQuestions,
            result.prioritizedQuestions
        ];

        const sourceQuestions =
            collections
                .flatMap((entry) =>
                    this.safeArray(entry)
                )
                .filter(
                    (entry) =>
                        entry &&
                        typeof entry === "object"
                );

        const followUpQuestions =
            this.safeArray(
                result.generatedFollowUps
            )
                .map((entry) =>
                    entry?.question ?? entry
                )
                .filter(
                    (entry) =>
                        entry &&
                        typeof entry === "object"
                );

        const resultById = new Map();

        [
            ...sourceQuestions,
            ...followUpQuestions
        ].forEach((entry, index) => {
            const id =
                this.getId(
                    entry,
                    [
                        "id",
                        "questionId"
                    ]
                ) ??
                `anonymous-question-${index}`;

            if (!resultById.has(id)) {
                resultById.set(id, entry);
            }
        });

        return [
            ...resultById.values()
        ];
    }

    static validateReport(
        report,
        collections,
        errors,
        warnings
    ) {
        if (
            !report ||
            typeof report !== "object"
        ) {
            errors.push({
                code:
                    "report_missing"
            });

            return;
        }

        const expectedCounts = {
            findingCount:
                collections.findings.length,

            assessmentCount:
                collections.assessments.length,

            recommendationCount:
                collections.recommendations.length
        };

        Object.entries(expectedCounts).forEach(
            ([property, expected]) => {
                const actual =
                    report.metadata?.[property];

                if (
                    typeof actual === "number" &&
                    actual !== expected
                ) {
                    errors.push({
                        code:
                            `report_${property}_mismatch`,

                        expected,
                        actual
                    });
                }
            }
        );

        const expectedTotals = {
            totalFindings:
                collections.findings.length,

            totalAssessments:
                collections.assessments.length,

            totalRecommendations:
                collections.recommendations.length
        };

        Object.entries(expectedTotals).forEach(
            ([property, expected]) => {
                const actual =
                    report.summary?.[property];

                if (
                    typeof actual === "number" &&
                    actual !== expected
                ) {
                    errors.push({
                        code:
                            `report_${property}_mismatch`,

                        expected,
                        actual
                    });
                }
            }
        );

        const highestRisk =
            this.determineHighestRisk(
                collections.assessments
            );

        if (
            typeof report.summary?.highestRisk ===
                "string" &&
            report.summary.highestRisk !==
                highestRisk
        ) {
            errors.push({
                code:
                    "report_highest_risk_mismatch",

                expected:
                    highestRisk,

                actual:
                    report.summary.highestRisk
            });
        }

        const reportVersion =
            report.reportVersion ??
            report.metadata?.reportVersion;

        if (
            typeof reportVersion !== "string" ||
            reportVersion.length === 0
        ) {
            warnings.push({
                code:
                    "report_version_missing"
            });
        }
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
                    (entry) =>
                        entry?.risk === risk
                )
            ) {
                return risk;
            }
        }

        return "low";
    }

    static collectIds(
        collection,
        properties,
        label,
        errors
    ) {
        const ids = new Set();

        collection.forEach((entry) => {
            const id =
                this.getId(
                    entry,
                    properties
                );

            if (!id) {
                errors.push({
                    code:
                        `${label}_missing_id`,

                    objectId:
                        null
                });

                return;
            }

            if (ids.has(id)) {
                errors.push({
                    code:
                        `duplicate_${label}_id`,

                    objectId:
                        id
                });

                return;
            }

            ids.add(id);
        });

        return ids;
    }

    static getId(
        entry,
        properties
    ) {
        if (
            !entry ||
            typeof entry !== "object"
        ) {
            return null;
        }

        for (const property of properties) {
            const value =
                entry[property];

            if (
                typeof value === "string" &&
                value.length > 0
            ) {
                return value;
            }
        }

        return null;
    }

    static collectReferenceIds(
        entry,
        properties
    ) {
        const result = [];

        if (
            !entry ||
            typeof entry !== "object"
        ) {
            return result;
        }

        properties.forEach((property) => {
            const value =
                entry[property];

            if (
                typeof value === "string" &&
                value.length > 0
            ) {
                result.push(value);
            }

            if (Array.isArray(value)) {
                value.forEach((reference) => {
                    if (
                        typeof reference ===
                            "string" &&
                        reference.length > 0
                    ) {
                        result.push(reference);
                    }
                });
            }
        });

        return [
            ...new Set(result)
        ];
    }

    static safeArray(value) {
        return Array.isArray(value)
            ? value
            : [];
    }
}
