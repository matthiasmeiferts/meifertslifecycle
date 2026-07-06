/**
 * MEIFERTS Building Intelligence
 * Location Profile Manager
 *
 * Defines country, region, climate and property context for adaptive inspections.
 * Thailand document handling is intentionally limited to availability checks.
 */
export default class LocationProfileManager {

    static COUNTRIES = {
        DE: "Germany",
        TH: "Thailand"
    };

    static PROPERTY_TYPES = {
        CONDOMINIUM_UNIT: "condominium_unit",
        CONDOMINIUM_BUILDING: "condominium_building",
        VILLA: "villa",
        TOWNHOUSE: "townhouse",
        SINGLE_FAMILY_HOUSE: "single_family_house",
        MULTI_FAMILY_HOUSE: "multi_family_house",
        NEW_BUILD: "new_build",
        RENOVATION_OBJECT: "renovation_object"
    };

    static TIME_MODES = {
        RED_FLAGS: "red_flags",
        SHORT: "short",
        STANDARD: "standard",
        FULL: "full"
    };

    static create(data = {}) {
        const country = this.normalizeCountry(data.country || this.inferCountryFromGps(data.gps));
        const region = data.region || this.inferRegion(data.gps, country);
        const propertyType = data.propertyType || this.PROPERTY_TYPES.CONDOMINIUM_UNIT;
        const timeMode = data.timeMode || this.getTimeMode(data.availableMinutes || 60);

        return {
            country,
            countryLabel: this.COUNTRIES[country] || country,
            region,
            gps: data.gps || null,
            propertyType,
            timeMode,
            availableMinutes: data.availableMinutes || this.getMinutesForTimeMode(timeMode),
            climateProfile: this.getClimateProfile(country, region),
            regulatoryProfile: this.getRegulatoryProfile(country),
            documentationPolicy: this.getDocumentationPolicy(country),
            riskFocus: this.getRiskFocus(country, region, propertyType),
            createdAt: new Date().toISOString()
        };
    }

    static normalizeCountry(country = "DE") {
        const value = String(country).trim().toUpperCase();
        if (["TH", "THAILAND"].includes(value)) return "TH";
        if (["DE", "GERMANY", "DEUTSCHLAND"].includes(value)) return "DE";
        return "DE";
    }

    static inferCountryFromGps(gps = null) {
        if (!gps || typeof gps.lat !== "number" || typeof gps.lng !== "number") return "DE";

        const { lat, lng } = gps;

        if (lat >= 5 && lat <= 21 && lng >= 97 && lng <= 106) return "TH";
        if (lat >= 47 && lat <= 55.5 && lng >= 5.5 && lng <= 15.5) return "DE";

        return "DE";
    }

    static inferRegion(gps = null, country = "DE") {
        if (!gps || typeof gps.lat !== "number" || typeof gps.lng !== "number") {
            return country === "TH" ? "Thailand" : "Germany";
        }

        const { lat, lng } = gps;

        if (country === "TH") {
            if (lat >= 12.75 && lat <= 13.15 && lng >= 100.75 && lng <= 101.15) return "Pattaya / Chonburi";
            if (lat >= 13.55 && lat <= 13.95 && lng >= 100.3 && lng <= 100.95) return "Bangkok";
            if (lat >= 7.7 && lat <= 8.25 && lng >= 98.1 && lng <= 98.6) return "Phuket";
            return "Thailand";
        }

        return "Germany";
    }

    static getTimeMode(minutes = 60) {
        if (minutes <= 30) return this.TIME_MODES.RED_FLAGS;
        if (minutes <= 60) return this.TIME_MODES.SHORT;
        if (minutes <= 120) return this.TIME_MODES.STANDARD;
        return this.TIME_MODES.FULL;
    }

    static getMinutesForTimeMode(timeMode = this.TIME_MODES.SHORT) {
        const map = {
            [this.TIME_MODES.RED_FLAGS]: 30,
            [this.TIME_MODES.SHORT]: 60,
            [this.TIME_MODES.STANDARD]: 120,
            [this.TIME_MODES.FULL]: 240
        };

        return map[timeMode] || 60;
    }

    static getClimateProfile(country = "DE", region = "") {
        if (country === "TH") {
            const coastal = /pattaya|chonburi|phuket|coast|sea/i.test(region);

            return [
                "tropical_humidity",
                "heavy_rain",
                "uv_exposure",
                "air_conditioning_condensate",
                ...(coastal ? ["coastal_corrosion", "salt_air"] : [])
            ];
        }

        return [
            "temperate_climate",
            "seasonal_heating",
            "freeze_thaw",
            "rain_exposure"
        ];
    }

    static getRegulatoryProfile(country = "DE") {
        if (country === "TH") {
            return {
                legalReview: false,
                valuation: false,
                documentValidation: false,
                governanceAudit: false,
                note: "Thailand profile supports technical observation and document availability checks only."
            };
        }

        return {
            legalReview: false,
            valuation: false,
            documentValidation: "limited",
            governanceAudit: "limited",
            note: "Germany profile may record document availability and technical relevance, not legal validation."
        };
    }

    static getDocumentationPolicy(country = "DE") {
        if (country === "TH") {
            return {
                mode: "availability_check_only",
                label: "Document Availability Check",
                allowedStatements: [
                    "available",
                    "not_available",
                    "requested",
                    "not_reviewed",
                    "requires_professional_review"
                ],
                forbiddenClaims: [
                    "validated",
                    "legally_checked",
                    "financially_verified",
                    "complete_governance_review",
                    "ownership_confirmed"
                ]
            };
        }

        return {
            mode: "technical_relevance_check",
            label: "Document Relevance Check",
            allowedStatements: [
                "available",
                "not_available",
                "requested",
                "review_recommended",
                "requires_professional_review"
            ],
            forbiddenClaims: [
                "legal_validation",
                "certified_valuation",
                "guaranteed_completeness"
            ]
        };
    }

    static getRiskFocus(country = "DE", region = "", propertyType = "") {
        const base = [
            "moisture",
            "waterproofing",
            "facade",
            "roof",
            "mep",
            "fire_safety",
            "capex"
        ];

        if (country === "TH") {
            return [
                "moisture",
                "mold",
                "balcony_waterproofing",
                "facade_cracks",
                "concrete_corrosion",
                "coastal_corrosion",
                "air_conditioning_condensate",
                "water_pressure",
                "drainage",
                "flooding",
                "fire_escape",
                "lift_condition",
                "maintenance_evidence",
                "sinking_fund_availability",
                "capex"
            ];
        }

        if (propertyType === this.PROPERTY_TYPES.CONDOMINIUM_UNIT) {
            return [...base, "weg_documents", "reserve_fund_indication", "common_property"];
        }

        return base;
    }

    static isThailand(profile = {}) {
        return this.normalizeCountry(profile.country) === "TH";
    }
}
