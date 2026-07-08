/**
 * MEIFERTS Building Intelligence
 * Adaptive Follow-up Question Engine
 * Foundation 2.2-E
 *
 * Purpose:
 * Evaluate simulated question answers and decide follow-up behavior.
 *
 * Architecture principle:
 * - No answer persistence
 * - No evidence creation
 * - No finding creation
 * - No assessment creation
 * - No report generation
 * - Rule-based adaptive behavior only
 */

export default class AdaptiveFollowUpQuestionEngine {

    static evaluateAnswer(context = {}) {
        const normalizedContext = this.normalizeContext(context);
        const rules = this.buildRules(normalizedContext);
        const actions = this.evaluateRules(normalizedContext, rules);

        return {
            questionId: normalizedContext.questionId,
            answerValue: normalizedContext.answerValue,
            answerType: normalizedContext.answerType,
            profile: normalizedContext.profile,
            actions,
            followUpQuestionIds: actions
                .filter(action => action.type === "activate_follow_up")
                .map(action => action.questionId),
            skippedQuestionIds: actions
                .filter(action => action.type === "skip_question")
                .map(action => action.questionId),
            evidenceRequirements: actions
                .filter(action => action.type === "increase_evidence_requirement")
                .map(action => action.requirement),
            signals: [...new Set(actions
                .filter(action => action.signal)
                .map(action => action.signal))]
        };
    }

    static normalizeContext(context = {}) {
        return {
            questionId: String(context.questionId || ""),
            questionText: String(context.questionText || ""),
            answerType: this.normalizeToken(context.answerType || ""),
            answerValue: this.normalizeToken(context.answerValue || ""),
            buildingSystem: this.normalizeToken(context.buildingSystem || ""),
            inspectionArea: this.normalizeToken(context.inspectionArea || ""),
            component: this.normalizeToken(context.component || ""),
            riskCategories: Array.isArray(context.riskCategories)
                ? context.riskCategories.map(item => this.normalizeToken(item)).filter(Boolean)
                : [],
            capexRelevant: Boolean(context.capexRelevant),
            evidenceRelevant: Boolean(context.evidenceRelevant),
            findingRelevant: Boolean(context.findingRelevant),
            requiresPhoto: Boolean(context.requiresPhoto),
            requiresComment: Boolean(context.requiresComment),
            requiresLocation: Boolean(context.requiresLocation),
            defaultEvidenceTypes: Array.isArray(context.defaultEvidenceTypes)
                ? context.defaultEvidenceTypes.map(item => this.normalizeToken(item)).filter(Boolean)
                : [],
            profile: this.normalizeProfile(context.profile || {}),
            candidateFollowUps: Array.isArray(context.candidateFollowUps)
                ? context.candidateFollowUps
                : []
        };
    }

    static normalizeProfile(profile = {}) {
        return {
            country: this.normalizeToken(profile.country),
            buildingType: this.normalizeToken(profile.buildingType),
            useType: this.normalizeToken(profile.useType),
            ageBand: this.normalizeToken(profile.ageBand),
            climateZone: this.normalizeToken(profile.climateZone),
            locationContext: this.normalizeToken(profile.locationContext),
            legalContext: this.normalizeToken(profile.legalContext),
            inspectionPurpose: this.normalizeToken(profile.inspectionPurpose)
        };
    }

    static buildRules(context) {
        const rules = [];

        if (this.isNegativeAnswer(context.answerValue)) {
            rules.push({
                type: "increase_evidence_requirement",
                requirement: "comment",
                reason: "Negative or finding answer requires expert comment.",
                signal: "expertCommentRequired"
            });

            rules.push({
                type: "activate_follow_up",
                selector: "same_component",
                reason: "Negative or finding answer activates component follow-up questions.",
                signal: "componentFollowUp"
            });
        }

        if (this.isNegativeAnswer(context.answerValue) && context.evidenceRelevant) {
            rules.push({
                type: "increase_evidence_requirement",
                requirement: "photo",
                reason: "Evidence-relevant negative answer requires photo documentation.",
                signal: "photoEvidenceRequired"
            });
        }

        if (this.isNegativeAnswer(context.answerValue) && context.capexRelevant) {
            rules.push({
                type: "prepare_signal",
                reason: "CAPEX-relevant negative answer prepares cost signal.",
                signal: "capexSignalPrepared"
            });
        }

        if (this.isNegativeAnswer(context.answerValue) && context.findingRelevant) {
            rules.push({
                type: "prepare_signal",
                reason: "Finding-relevant negative answer prepares finding signal.",
                signal: "findingSignalPrepared"
            });
        }

        if (this.isPositiveAnswer(context.answerValue)) {
            rules.push({
                type: "skip_question",
                selector: "defect_detail",
                reason: "Positive answer skips defect-detail follow-up questions.",
                signal: "irrelevantDefectDetailsSkipped"
            });
        }

        if (
            context.profile.climateZone === "tropical" &&
            this.isNegativeAnswer(context.answerValue) &&
            this.hasAny(context, ["facade", "roof", "waterproofing", "drainage", "basement", "moisture"])
        ) {
            rules.push({
                type: "increase_evidence_requirement",
                requirement: "moisture_photo_location_comment",
                reason: "Tropical climate risk requires stronger moisture-related documentation.",
                signal: "tropicalMoistureEvidenceRequired"
            });
        }

        return rules;
    }

    static evaluateRules(context, rules = []) {
        const actions = [];

        rules.forEach(rule => {
            if (rule.type === "activate_follow_up") {
                const matches = this.selectFollowUps(context, rule.selector)
                    .slice(0, 5);

                matches.forEach(question => {
                    actions.push({
                        type: "activate_follow_up",
                        questionId: question.questionId || question.id,
                        reason: rule.reason,
                        signal: rule.signal
                    });
                });

                return;
            }

            if (rule.type === "skip_question") {
                const matches = this.selectFollowUps(context, rule.selector)
                    .slice(0, 5);

                matches.forEach(question => {
                    actions.push({
                        type: "skip_question",
                        questionId: question.questionId || question.id,
                        reason: rule.reason,
                        signal: rule.signal
                    });
                });

                return;
            }

            actions.push({
                type: rule.type,
                requirement: rule.requirement || "",
                reason: rule.reason,
                signal: rule.signal
            });
        });

        return actions;
    }

    static selectFollowUps(context, selector = "") {
        const currentQuestionId = context.questionId;

        return context.candidateFollowUps.filter(question => {
            const questionId = question.questionId || question.id;

            if (!questionId || questionId === currentQuestionId) {
                return false;
            }

            const searchableText = this.createSearchableText(question);

            if (selector === "same_component") {
                return Boolean(context.component && searchableText.includes(context.component)) ||
                    Boolean(context.inspectionArea && searchableText.includes(context.inspectionArea)) ||
                    Boolean(context.buildingSystem && searchableText.includes(context.buildingSystem));
            }

            if (selector === "defect_detail") {
                return [
                    "defect",
                    "damage",
                    "repair",
                    "moisture",
                    "leak",
                    "crack",
                    "finding"
                ].some(term => searchableText.includes(term));
            }

            return false;
        });
    }

    static hasAny(context, terms = []) {
        const searchableText = [
            context.questionId,
            context.questionText,
            context.buildingSystem,
            context.inspectionArea,
            context.component,
            ...context.riskCategories,
            ...context.defaultEvidenceTypes
        ].join(" ");

        const normalized = this.normalizeToken(searchableText);

        return terms.some(term => normalized.includes(this.normalizeToken(term)));
    }

    static isNegativeAnswer(value = "") {
        const normalized = this.normalizeToken(value);

        return [
            "no",
            "not ok",
            "finding",
            "defect",
            "damaged",
            "failed",
            "missing",
            "critical",
            "poor",
            "requires review"
        ].includes(normalized);
    }

    static isPositiveAnswer(value = "") {
        const normalized = this.normalizeToken(value);

        return [
            "yes",
            "ok",
            "pass",
            "passed",
            "acceptable",
            "available",
            "confirmed"
        ].includes(normalized);
    }

    static createSearchableText(value) {
        const values = [];

        this.collectValues(value, values);

        return this.normalizeToken(values.join(" "));
    }

    static collectValues(value, values) {
        if (value === null || value === undefined) {
            return;
        }

        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            values.push(String(value));
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(entry => this.collectValues(entry, values));
            return;
        }

        if (typeof value === "object") {
            Object.values(value).forEach(entry => this.collectValues(entry, values));
        }
    }

    static normalizeToken(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ");
    }
}
