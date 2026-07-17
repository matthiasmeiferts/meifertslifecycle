export default class QuestionVisibilityEngine {

    static isVisible(question = {}, context = {}) {

        const reasons = [];
        const matchedRules = [];

        const profile = context.profile || {};
        const visibility = question.visibility || {};

        this.evaluateRule(
            "countries",
            profile.country,
            visibility.countries,
            reasons,
            matchedRules
        );

        this.evaluateRule(
            "buildingTypes",
            profile.buildingType,
            visibility.buildingTypes,
            reasons,
            matchedRules
        );

        this.evaluateRule(
            "useTypes",
            profile.useType,
            visibility.useTypes,
            reasons,
            matchedRules
        );

        this.evaluateRule(
            "climateZones",
            profile.climateZone,
            visibility.climateZones,
            reasons,
            matchedRules
        );

        this.evaluateRule(
            "ageBands",
            profile.ageBand,
            visibility.ageBands,
            reasons,
            matchedRules
        );

        return {
            visible: reasons.length === 0,
            reasons,
            matchedRules
        };
    }

    static evaluateRule(
        name,
        value,
        allowedValues,
        reasons,
        matchedRules
    ) {
        if (!Array.isArray(allowedValues) || allowedValues.length === 0) {
            return;
        }

        if (allowedValues.includes(value)) {
            matchedRules.push(name);
            return;
        }

        reasons.push(`${name}_not_supported`);
    }
}
