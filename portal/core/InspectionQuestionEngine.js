/**
 * MEIFERTS Building Intelligence
 * Adaptive Inspection Question Engine
 * Foundation Framework 3.9-A/B
 *
 * Purpose:
 * Turns inspection answers into next questions, skipped questions,
 * evidence requirements, limitations, risk flags and coverage status.
 */

export default class InspectionQuestionEngine {

    static ANSWERS = {
        YES: "yes",
        NO: "no",
        UNKNOWN: "unknown",
        NOT_ACCESSIBLE: "not_accessible",
        NOT_APPLICABLE: "not_applicable"
    };

    static COVERAGE = {
        OPEN: "Open",
        INSPECTED: "Inspected",
        NOT_ACCESSIBLE: "Not Accessible",
        NOT_APPLICABLE: "Not Applicable",
        EVIDENCE_REQUIRED: "Evidence Required",
        RISK_FLAGGED: "Risk Flagged",
        LIMITATION: "Limitation"
    };

    static createAnswer(question, value, data = {}) {
        if (!question || !question.id) {
            throw new Error("InspectionQuestionEngine: question with id is required");
        }

        return {
            id: data.id || this.createAnswerId(question.id),
            questionId: question.id,
            inspectionId: data.inspectionId || null,
            caseId: data.caseId || null,
            buildingId: data.buildingId || null,
            value,
            note: data.note || "",
            measurement: data.measurement || null,
            evidenceIds: data.evidenceIds || [],
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    static evaluate(question, answer) {
        const value = this.getAnswerValue(answer);

        const result = {
            questionId: question?.id || null,
            answer: value,
            shouldAsk: this.shouldAsk(question, answer),
            nextQuestionIds: [],
            skippedQuestionIds: [],
            requiredEvidence: [],
            riskFlags: [],
            limitations: [],
            coverageStatus: this.COVERAGE.OPEN
        };

        if (!question || !question.id) {
            return result;
        }

        const matchingRules = this.getMatchingRules(question, value);

        matchingRules.forEach(rule => {
            result.nextQuestionIds.push(...(rule.askNext || []));
            result.skippedQuestionIds.push(...(rule.skip || []));
            result.requiredEvidence.push(...(rule.requireEvidence || []));

            if (rule.createRiskFlag) {
                result.riskFlags.push({
                    questionId: question.id,
                    severity: rule.severity || question.defaultSeverity || "Medium",
                    reason: rule.riskReason || question.riskReason || question.question || question.label
                });
            }

            if (rule.createLimitation) {
                result.limitations.push({
                    questionId: question.id,
                    reason: rule.limitationReason || "Inspection limitation recorded.",
                    reportImpact: rule.reportImpact || "Add to scope and limitations."
                });
            }
        });

        result.nextQuestionIds = this.unique(result.nextQuestionIds);
        result.skippedQuestionIds = this.unique(result.skippedQuestionIds);
        result.requiredEvidence = this.unique([
            ...(question.evidenceRequired || []),
            ...result.requiredEvidence
        ]);

        result.coverageStatus = this.getCoverageStatus(question, answer, result);

        return result;
    }

    static shouldAsk(question, answersByQuestionId = {}) {
        if (!question) {
            return false;
        }

        if (!question.dependsOn) {
            return true;
        }

        const dependencyAnswer = answersByQuestionId[question.dependsOn.questionId];
        const dependencyValue = this.getAnswerValue(dependencyAnswer);

        if (Array.isArray(question.dependsOn.answers)) {
            return question.dependsOn.answers.includes(dependencyValue);
        }

        return question.dependsOn.answer === dependencyValue;
    }

    static getMatchingRules(question, answerValue) {
        return (question.rules || []).filter(rule => {
            if (!rule.when) {
                return false;
            }

            if (Array.isArray(rule.when.answer)) {
                return rule.when.answer.includes(answerValue);
            }

            return rule.when.answer === answerValue;
        });
    }

    static getRequiredEvidence(question, answer) {
        return this.evaluate(question, answer).requiredEvidence;
    }

    static getNextQuestionIds(question, answer) {
        return this.evaluate(question, answer).nextQuestionIds;
    }

    static getSkippedQuestionIds(question, answer) {
        return this.evaluate(question, answer).skippedQuestionIds;
    }

    static getRiskFlags(question, answer) {
        return this.evaluate(question, answer).riskFlags;
    }

    static getLimitations(question, answer) {
        return this.evaluate(question, answer).limitations;
    }

    static getCoverageStatus(question, answer, evaluation = null) {
        const value = this.getAnswerValue(answer);
        const result = evaluation || { requiredEvidence: [], riskFlags: [], limitations: [] };
        const evidenceIds = answer?.evidenceIds || [];

        if (!value) {
            return this.COVERAGE.OPEN;
        }

        if (value === this.ANSWERS.NOT_ACCESSIBLE) {
            return this.COVERAGE.NOT_ACCESSIBLE;
        }

        if (value === this.ANSWERS.NOT_APPLICABLE) {
            return this.COVERAGE.NOT_APPLICABLE;
        }

        if (result.limitations.length) {
            return this.COVERAGE.LIMITATION;
        }

        if (result.requiredEvidence.length && !evidenceIds.length) {
            return this.COVERAGE.EVIDENCE_REQUIRED;
        }

        if (result.riskFlags.length) {
            return this.COVERAGE.RISK_FLAGGED;
        }

        return this.COVERAGE.INSPECTED;
    }

    static getAnswerValue(answer) {
        if (!answer) {
            return null;
        }

        if (typeof answer === "string") {
            return answer;
        }

        return answer.value || answer.answer || null;
    }

    static unique(values = []) {
        return [...new Set(values.filter(Boolean))];
    }

    static createAnswerId(questionId) {
        return `ANS-${questionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }

}
