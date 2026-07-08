/**
 * MEIFERTS Building Intelligence
 * Adaptive Inspection Profile Engine
 * Foundation 2.2-D
 *
 * Purpose:
 * Select, weight and order catalog questions based on an inspection profile.
 *
 * Architecture principle:
 * - No black-box AI
 * - Rule-based profile logic
 * - Adaptive layer only within the validated question catalog
 * - No answer storage
 * - No evidence creation
 * - No findings, assessments or reports
 */

export default class AdaptiveInspectionProfileEngine {

    static defaultLimit = 25;

    static createStartQuestionSet(profile = {}, catalogItems = [], options = {}) {
        const normalizedProfile = this.normalizeProfile(profile);
        const rules = this.buildRules(normalizedProfile);
        const limit = Number.isInteger(options.limit) ? options.limit : this.defaultLimit;

        const scoredItems = catalogItems
            .filter((item) => item && typeof item === "object")
            .map((item) => {
                const scoreResult = this.scoreCatalogItem(item, normalizedProfile, rules);

                return {
                    ...item,
                    adaptiveScore: scoreResult.score,
                    adaptiveReasons: scoreResult.reasons,
                    adaptiveSignals: scoreResult.signals
                };
            })
            .filter((item) => item.adaptiveScore > 0)
            .sort((a, b) => {
                if (b.adaptiveScore !== a.adaptiveScore) {
                    return b.adaptiveScore - a.adaptiveScore;
                }

                return this.getStableSortValue(a).localeCompare(this.getStableSortValue(b));
            })
            .slice(0, limit);

        return {
            profile: normalizedProfile,
            rules,
            totalCatalogItems: catalogItems.length,
            selectedCount: scoredItems.length,
            questions: scoredItems
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

    static buildRules(profile) {
        const rules = [];

        this.addRule(rules, "country", profile.country, 16);
        this.addRule(rules, "buildingType", profile.buildingType, 15);
        this.addRule(rules, "useType", profile.useType, 12);
        this.addRule(rules, "ageBand", profile.ageBand, 10);
        this.addRule(rules, "climateZone", profile.climateZone, 10);
        this.addRule(rules, "locationContext", profile.locationContext, 8);
        this.addRule(rules, "legalContext", profile.legalContext, 8);
        this.addRule(rules, "inspectionPurpose", profile.inspectionPurpose, 7);

        if (profile.country === "thailand") {
            this.addKeywordRule(rules, "countryContext", ["thailand", "thai", "bangkok", "pattaya", "phuket", "chanote", "leasehold"], 8);
        }

        if (profile.country === "germany") {
            this.addKeywordRule(rules, "countryContext", ["germany", "german", "energie", "heating", "insulation", "basement"], 8);
        }

        if (profile.climateZone === "tropical" || profile.country === "thailand") {
            this.addKeywordRule(rules, "climateRisk", ["moisture", "humidity", "waterproofing", "mold", "mould", "facade", "roof", "drainage", "air conditioning"], 9);
        }

        if (profile.buildingType === "condominium" || profile.buildingType === "apartment") {
            this.addKeywordRule(rules, "buildingTypeRisk", ["common area", "condominium", "apartment", "facade", "roof", "mep", "fire safety", "parking", "elevator", "lift"], 9);
        }

        if (profile.ageBand === "older" || profile.ageBand === "existing") {
            this.addKeywordRule(rules, "ageRisk", ["maintenance", "repair", "defect", "remaining useful life", "capex", "replacement", "condition"], 9);
        }

        if (profile.inspectionPurpose === "acquisition") {
            this.addKeywordRule(rules, "transactionRisk", ["risk", "capex", "due diligence", "document", "legal", "ownership", "maintenance", "reserve"], 10);
        }

        return rules;
    }

    static scoreCatalogItem(item, profile, rules) {
        const searchableText = this.createSearchableText(item);
        const reasons = [];
        const signals = [];

        let score = 0;

        for (const rule of rules) {
            const result = this.applyRule(rule, searchableText);

            if (result.matched) {
                score += result.score;
                reasons.push(result.reason);
                signals.push(rule.name);
            }
        }

        const chapterBoost = this.getChapterPriorityBoost(item, profile);

        if (chapterBoost > 0) {
            score += chapterBoost;
            reasons.push(`Chapter priority boost +${chapterBoost}`);
            signals.push("chapterPriority");
        }

        const countryAdjustment = this.getCountryCompatibilityAdjustment(item, profile, searchableText);

        if (countryAdjustment.adjustment !== 0) {
            score += countryAdjustment.adjustment;
            reasons.push(countryAdjustment.reason);
            signals.push(countryAdjustment.signal);
        }

        return {
            score: Math.max(score, 0),
            reasons,
            signals: [...new Set(signals)]
        };
    }

    static applyRule(rule, searchableText) {
        const matchedTerms = rule.terms.filter((term) => searchableText.includes(term));

        if (matchedTerms.length === 0) {
            return {
                matched: false,
                score: 0,
                reason: ""
            };
        }

        const cappedMatchCount = Math.min(matchedTerms.length, 3);
        const score = rule.weight + cappedMatchCount;

        return {
            matched: true,
            score,
            reason: `${rule.name}: ${matchedTerms.join(", ")} +${score}`
        };
    }

    static getChapterPriorityBoost(item, profile) {
        const chapterText = this.normalizeToken(
            item.chapter ||
            item.chapterTitle ||
            item.section ||
            item.category ||
            ""
        );

        if (!chapterText) {
            return 0;
        }

        if (profile.inspectionPurpose === "acquisition" && chapterText.includes("risk")) {
            return 6;
        }

        if (profile.country === "thailand" && chapterText.includes("ownership")) {
            return 6;
        }

        if (profile.climateZone === "tropical" && chapterText.includes("building envelope")) {
            return 5;
        }

        if (profile.buildingType === "condominium" && chapterText.includes("common")) {
            return 5;
        }

        return 0;
    }

    static getCountryCompatibilityAdjustment(item, profile, searchableText) {
        const countryProfile = this.normalizeToken(item.countryProfile || "");
        const normReference = this.normalizeToken(item.normReference || "");
        const germanLegalTerms = [
            "weg",
            "bvi",
            "teilungserklärung",
            "sondereigentum",
            "sondernutzungsrecht",
            "miteigentumsanteile",
            "wirtschaftsplan",
            "sonderumlage",
            "zertifizierter verwalter",
            "verwalter"
        ];

        if (profile.country === "thailand") {
            let penalty = 0;
            const matchedTerms = [];

            if (countryProfile.includes("germany")) {
                penalty -= 28;
                matchedTerms.push("countryProfile:germany");
            }

            germanLegalTerms.forEach((term) => {
                if (searchableText.includes(term) || normReference.includes(term)) {
                    penalty -= 8;
                    matchedTerms.push(term);
                }
            });

            if (penalty < 0) {
                return {
                    adjustment: penalty,
                    reason: `Country compatibility penalty ${penalty}: ${matchedTerms.join(", ")}`,
                    signal: "countryCompatibilityPenalty"
                };
            }
        }

        if (profile.country === "germany" && countryProfile.includes("germany")) {
            return {
                adjustment: 12,
                reason: "Country compatibility boost +12: countryProfile:germany",
                signal: "countryCompatibilityBoost"
            };
        }

        return {
            adjustment: 0,
            reason: "",
            signal: ""
        };
    }

    static addRule(rules, name, value, weight) {
        if (!value) {
            return;
        }

        rules.push({
            name,
            terms: this.expandTerms(value),
            weight
        });
    }

    static addKeywordRule(rules, name, terms, weight) {
        rules.push({
            name,
            terms: terms.map((term) => this.normalizeToken(term)).filter(Boolean),
            weight
        });
    }

    static expandTerms(value) {
        const normalizedValue = this.normalizeToken(value);
        const terms = [normalizedValue];

        const synonyms = {
            thailand: ["thai", "tropical", "bangkok", "pattaya", "phuket"],
            germany: ["german", "energie", "heating", "basement"],
            condominium: ["condo", "apartment", "common area", "juristic"],
            residential: ["housing", "dwelling", "apartment", "condominium"],
            commercial: ["office", "retail", "tenant", "commercial"],
            older: ["existing", "aged", "maintenance", "repair", "replacement"],
            existing: ["older", "maintenance", "repair", "condition"],
            tropical: ["humidity", "moisture", "rain", "waterproofing", "mold", "mould"],
            coastal: ["salt", "corrosion", "humidity", "wind"],
            acquisition: ["purchase", "buyer", "due diligence", "transaction", "risk"]
        };

        if (synonyms[normalizedValue]) {
            terms.push(...synonyms[normalizedValue]);
        }

        return [...new Set(terms)];
    }

    static createSearchableText(item) {
        const searchableFields = [
            item.id,
            item.questionId,
            item.language,
            item.countryProfile,
            item.chapterNumber,
            item.chapterTitle,
            item.sectionTitle,
            item.questionText,
            item.buildingSystem,
            item.component,
            item.inspectionArea,
            item.answerType,
            item.normReference,
            item.sourceDocument,
            ...(Array.isArray(item.defaultEvidenceTypes) ? item.defaultEvidenceTypes : [])
        ];

        return this.normalizeToken(searchableFields.filter(Boolean).join(" "));
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
            value.forEach((entry) => this.collectValues(entry, values));
            return;
        }

        if (typeof value === "object") {
            Object.values(value).forEach((entry) => this.collectValues(entry, values));
        }
    }

    static normalizeToken(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[_-]+/g, " ")
            .replace(/\s+/g, " ");
    }

    static getStableSortValue(item) {
        return String(
            item.id ||
            item.questionId ||
            item.catalogId ||
            item.title ||
            item.question ||
            ""
        );
    }
}
