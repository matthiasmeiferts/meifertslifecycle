import LocationProfileManager from "./LocationProfileManager.js";

/**
 * MEIFERTS Building Intelligence
 * Adaptive Question Engine
 *
 * Selects next inspection questions, skip candidates and evidence requirements.
 * It supports decision intelligence, not automated final assessment.
 */
export default class AdaptiveQuestionEngine {

    static DEFAULT_OPTIONS = {
        maxNextQuestions: 5,
        includeSkipCandidates: true,
        includeEvidenceRequirements: true
    };

    static getInspectionPlan(questions = [], answers = {}, context = {}, options = {}) {
        const resolvedOptions = { ...this.DEFAULT_OPTIONS, ...options };
        const profile = LocationProfileManager.create(context.locationProfile || context);
        const normalizedQuestions = questions.map(question => this.normalizeQuestion(question));
        const unanswered = normalizedQuestions.filter(question => !answers[question.id]);
        const applicable = unanswered.filter(question => this.isApplicable(question, answers, profile, context));
        const ranked = this.rankQuestions(applicable, answers, profile, context);

        return {
            profile,
            timeMode: profile.timeMode,
            totalQuestions: normalizedQuestions.length,
            answeredQuestions: Object.keys(answers || {}).length,
            applicableOpenQuestions: applicable.length,
            nextQuestions: ranked.slice(0, resolvedOptions.maxNextQuestions),
            skipCandidates: resolvedOptions.includeSkipCandidates
                ? this.getSkipCandidates(unanswered, answers, profile, context)
                : [],
            missingEvidence: resolvedOptions.includeEvidenceRequirements
                ? this.getMissingEvidence(normalizedQuestions, answers, profile)
                : [],
            redFlags: this.getRedFlags(normalizedQuestions, answers, profile),
            confidence: this.calculateConfidence(normalizedQuestions, answers, profile),
            generatedAt: new Date().toISOString()
        };
    }

    static normalizeQuestion(question = {}) {
        return {
            id: question.id,
            module: question.module || "GENERAL",
            category: question.category || "General",
            text: question.text || question.question || question.label || "",
            priority: question.priority || question.riskPriority || "medium",
            appliesTo: question.appliesTo || {},
            metadata: question.metadata || {},
            answerType: question.answerType || "status",
            answerOptions: question.answerOptions || ["i.O.", "Auff.", "n.p.", "Hinweis"],
            askIf: question.askIf || [],
            skipIf: question.skipIf || [],
            followUpIf: question.followUpIf || question.followUps || {},
            requires: question.requires || {},
            riskTags: question.riskTags || [],
            capexRelevance: question.capexRelevance || "unknown",
            reportSection: question.reportSection || question.module || "General"
        };
    }

    static isApplicable(question, answers = {}, profile = {}, context = {}) {
        if (!question.id) return false;

        const appliesTo = question.appliesTo || {};
        const countryRules = this.toArray(appliesTo.countries || appliesTo.country);
        const propertyRules = this.toArray(appliesTo.propertyTypes || appliesTo.propertyType);
        const timeRules = this.toArray(appliesTo.timeModes || appliesTo.timeMode);
        const climateRules = this.toArray(appliesTo.climateTags || appliesTo.climate);

        if (countryRules.length && !countryRules.includes(profile.country)) return false;
        if (propertyRules.length && !propertyRules.includes(profile.propertyType)) return false;
        if (timeRules.length && !timeRules.includes(profile.timeMode)) return false;
        if (climateRules.length && !climateRules.some(tag => (profile.climateProfile || []).includes(tag))) return false;

        if (this.matchesRules(question.skipIf, answers, profile, context)) return false;
        if (question.askIf?.length && !this.matchesRules(question.askIf, answers, profile, context)) return false;

        return true;
    }

    static rankQuestions(questions = [], answers = {}, profile = {}, context = {}) {
        return questions
            .map(question => ({
                ...question,
                adaptiveScore: this.scoreQuestion(question, answers, profile, context),
                reason: this.getSelectionReason(question, profile)
            }))
            .sort((a, b) => b.adaptiveScore - a.adaptiveScore);
    }

    static scoreQuestion(question, answers = {}, profile = {}, context = {}) {
        let score = 0;

        const priorityScore = {
            critical: 100,
            high: 75,
            medium: 45,
            low: 20
        };

        score += priorityScore[String(question.priority).toLowerCase()] || 45;

        const riskFocus = profile.riskFocus || [];
        const riskTags = question.riskTags || [];

        if (riskTags.some(tag => riskFocus.includes(tag))) score += 35;
        if (question.requires?.photo) score += 8;
        if (question.requires?.measurement) score += 10;
        if (question.capexRelevance === "high") score += 20;
        if (question.capexRelevance === "medium") score += 10;

        if (profile.timeMode === LocationProfileManager.TIME_MODES.RED_FLAGS && score < 80) score -= 30;
        if (profile.country === "TH" && riskTags.includes("document_validation")) score -= 60;
        if (context.redFlagMode && riskTags.some(tag => context.redFlagTags?.includes(tag))) score += 40;

        return Math.max(0, score);
    }

    static getSelectionReason(question, profile = {}) {
        const tags = question.riskTags || [];
        const focusHits = tags.filter(tag => (profile.riskFocus || []).includes(tag));

        if (focusHits.length) {
            return `Matches active risk focus: ${focusHits.join(", ")}`;
        }

        if (question.capexRelevance === "high") {
            return "High CAPEX relevance.";
        }

        if (question.requires?.photo || question.requires?.measurement) {
            return "Evidence improves confidence.";
        }

        return "Open inspection question.";
    }

    static evaluateAnswer(question = {}, answer = {}, profile = {}) {
        const normalized = this.normalizeQuestion(question);
        const value = this.getAnswerValue(answer);
        const isRemarkable = this.isRemarkableAnswer(value);
        const isNotInspectable = this.isNotInspectableAnswer(value);
        const followUpQuestionIds = this.getFollowUps(normalized, value);
        const requiredEvidence = this.getRequiredEvidenceForAnswer(normalized, value, profile);
        const skipQuestionIds = this.getSkipsForAnswer(normalized, value);

        return {
            questionId: normalized.id,
            value,
            isRemarkable,
            isNotInspectable,
            followUpQuestionIds,
            skipQuestionIds,
            requiredEvidence,
            riskSignals: isRemarkable ? this.createRiskSignals(normalized, value, profile) : [],
            limitations: isNotInspectable ? this.createLimitations(normalized, value, profile) : [],
            confidenceImpact: this.getConfidenceImpact(normalized, value, requiredEvidence),
            evaluatedAt: new Date().toISOString()
        };
    }

    static getAnswerValue(answer = {}) {
        if (typeof answer === "string") return answer;
        return answer.value || answer.status || answer.answer || "";
    }

    static isRemarkableAnswer(value = "") {
        return ["auff.", "auffällig", "auffaellig", "defect", "risk", "yes"].includes(String(value).toLowerCase());
    }

    static isNotInspectableAnswer(value = "") {
        return ["n.p.", "nicht prüfbar", "nicht pruefbar", "not_accessible", "not inspectable"].includes(String(value).toLowerCase());
    }

    static getFollowUps(question, value) {
        const key = String(value || "").toLowerCase();
        const followUpIf = question.followUpIf || {};

        return [
            ...(followUpIf[value] || []),
            ...(followUpIf[key] || []),
            ...(this.isRemarkableAnswer(value) ? (followUpIf.remarkable || followUpIf["auff."] || []) : []),
            ...(this.isNotInspectableAnswer(value) ? (followUpIf.notInspectable || followUpIf["n.p."] || []) : [])
        ].filter(Boolean);
    }

    static getSkipsForAnswer(question, value) {
        const rules = question.skipIf || [];
        const direct = rules
            .filter(rule => rule.answer === value || rule.value === value)
            .flatMap(rule => rule.skip || rule.skipQuestionIds || []);

        return [...new Set(direct)];
    }

    static getRequiredEvidenceForAnswer(question, value, profile = {}) {
        const requires = question.requires || {};
        const evidence = [];

        if (requires.photo || (requires.photoIf || []).includes(value) || this.isRemarkableAnswer(value)) evidence.push("photo");
        if (requires.measurement || (requires.measurementIf || []).includes(value)) evidence.push("measurement");

        if (requires.document || (requires.documentIf || []).includes(value)) {
            evidence.push(
                LocationProfileManager.isThailand(profile)
                    ? "document_availability_check"
                    : "document_relevance_check"
            );
        }

        if (this.isNotInspectableAnswer(value)) evidence.push("limitation_note");

        return [...new Set(evidence)];
    }

    static createRiskSignals(question, value, profile = {}) {
        return [{
            questionId: question.id,
            module: question.module,
            riskTags: question.riskTags || [],
            capexRelevance: question.capexRelevance || "unknown",
            reason: `Remarkable answer recorded: ${value}`,
            status: "requires_professional_review",
            country: profile.country || null
        }];
    }

    static createLimitations(question, value, profile = {}) {
        return [{
            questionId: question.id,
            module: question.module,
            reason: `Inspection limitation recorded: ${value}`,
            reportImpact: "Add to scope and limitations.",
            country: profile.country || null
        }];
    }

    static getConfidenceImpact(question, value, requiredEvidence = []) {
        if (this.isNotInspectableAnswer(value)) return -25;
        if (this.isRemarkableAnswer(value) && requiredEvidence.length) return -10;
        if (requiredEvidence.length) return 10;
        return 5;
    }

    static getSkipCandidates(questions = [], answers = {}, profile = {}, context = {}) {
        return questions
            .filter(question => !this.isApplicable(question, answers, profile, context))
            .map(question => ({
                id: question.id,
                module: question.module,
                text: question.text,
                reason: "Not applicable for current country, property, time or prior answers."
            }));
    }

    static getMissingEvidence(questions = [], answers = {}, profile = {}) {
        return questions.flatMap(question => {
            const answer = answers[question.id];
            if (!answer) return [];

            return this.evaluateAnswer(question, answer, profile).requiredEvidence.map(type => ({
                questionId: question.id,
                module: question.module,
                evidenceType: type,
                status: "missing_or_required"
            }));
        });
    }

    static getRedFlags(questions = [], answers = {}, profile = {}) {
        return questions.flatMap(question => {
            const answer = answers[question.id];
            if (!answer) return [];

            return this.evaluateAnswer(question, answer, profile).riskSignals;
        });
    }

    static calculateConfidence(questions = [], answers = {}, profile = {}) {
        const answered = questions.filter(question => answers[question.id]).length;
        const total = questions.length || 1;
        const coverageScore = Math.round((answered / total) * 100);
        const missingEvidence = this.getMissingEvidence(questions, answers, profile).length;
        const penalty = Math.min(40, missingEvidence * 5);

        return {
            score: Math.max(0, Math.min(100, coverageScore - penalty)),
            coverageScore,
            missingEvidence,
            level: coverageScore - penalty >= 75 ? "high" : coverageScore - penalty >= 40 ? "medium" : "low"
        };
    }

    static matchesRules(rules = [], answers = {}, profile = {}, context = {}) {
        if (!Array.isArray(rules) || !rules.length) return false;

        return rules.some(rule => {
            if (typeof rule === "string") {
                return Boolean(answers[rule]);
            }

            if (rule.country && rule.country !== profile.country) return false;
            if (rule.propertyType && rule.propertyType !== profile.propertyType) return false;
            if (rule.timeMode && rule.timeMode !== profile.timeMode) return false;

            if (rule.questionId) {
                const answer = answers[rule.questionId];
                const value = this.getAnswerValue(answer || {});
                if (rule.equals !== undefined) return value === rule.equals;
                if (rule.in) return rule.in.includes(value);
                return Boolean(answer);
            }

            return false;
        });
    }

    static toArray(value) {
        if (!value) return [];
        return Array.isArray(value) ? value : [value];
    }
}
