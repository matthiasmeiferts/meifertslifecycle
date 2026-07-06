/**
 * MEIFERTS Building Intelligence
 * Damage Hypothesis Engine
 *
 * Produces plausible cause rankings for observed damage patterns.
 * Output is a hypothesis ranking, not a final diagnosis.
 */
export default class DamageHypothesisEngine {

    static PATTERNS = {
        MOISTURE_STAIN: "moisture_stain",
        MOLD: "mold",
        FACADE_CRACK: "facade_crack",
        BALCONY_LEAKAGE: "balcony_leakage",
        CORROSION: "corrosion",
        AC_CONDENSATE: "air_conditioning_condensate",
        ROOF_LEAKAGE: "roof_leakage"
    };

    static analyze(observation = {}, context = {}) {
        const pattern = observation.pattern || this.inferPattern(observation);
        const hypotheses = this.getHypotheses(pattern, observation, context);
        const ranked = this.normalizeWeights(hypotheses);

        return {
            pattern,
            title: this.getPatternTitle(pattern),
            hypotheses: ranked,
            recommendedNextChecks: this.getRecommendedNextChecks(pattern),
            requiredEvidence: this.getRequiredEvidence(pattern),
            limitation: "Plausibility ranking based on available observations. Not a final technical diagnosis.",
            createdAt: new Date().toISOString()
        };
    }

    static inferPattern(observation = {}) {
        const text = [
            observation.description,
            observation.location,
            ...(observation.tags || [])
        ].join(" ").toLowerCase();

        if (/mold|schimmel/.test(text)) return this.PATTERNS.MOLD;
        if (/balcony|balkon/.test(text)) return this.PATTERNS.BALCONY_LEAKAGE;
        if (/corrosion|korrosion|rost/.test(text)) return this.PATTERNS.CORROSION;
        if (/air.?con|ac|klima|condensate|kondensat/.test(text)) return this.PATTERNS.AC_CONDENSATE;
        if (/roof|dach/.test(text)) return this.PATTERNS.ROOF_LEAKAGE;
        if (/crack|riss/.test(text)) return this.PATTERNS.FACADE_CRACK;
        return this.PATTERNS.MOISTURE_STAIN;
    }

    static getPatternTitle(pattern) {
        const titles = {
            [this.PATTERNS.MOISTURE_STAIN]: "Moisture stain",
            [this.PATTERNS.MOLD]: "Mold indication",
            [this.PATTERNS.FACADE_CRACK]: "Facade crack",
            [this.PATTERNS.BALCONY_LEAKAGE]: "Balcony leakage indication",
            [this.PATTERNS.CORROSION]: "Corrosion indication",
            [this.PATTERNS.AC_CONDENSATE]: "Air-conditioning condensate indication",
            [this.PATTERNS.ROOF_LEAKAGE]: "Roof leakage indication"
        };

        return titles[pattern] || "Observed damage pattern";
    }

    static getHypotheses(pattern, observation = {}, context = {}) {
        const coastal = (context.locationProfile?.climateProfile || []).includes("coastal_corrosion");

        const library = {
            [this.PATTERNS.MOISTURE_STAIN]: [
                { cause: "Facade or window connection leakage", probability: 45 },
                { cause: "Condensation / thermal bridge", probability: 30 },
                { cause: "Plumbing leakage", probability: 15 },
                { cause: "Previous damage without active source", probability: 10 }
            ],
            [this.PATTERNS.MOLD]: [
                { cause: "Persistent humidity and insufficient ventilation", probability: 45 },
                { cause: "Thermal bridge / surface cooling", probability: 25 },
                { cause: "Hidden water ingress", probability: 20 },
                { cause: "Past moisture event", probability: 10 }
            ],
            [this.PATTERNS.FACADE_CRACK]: [
                { cause: "Render / coating movement", probability: 40 },
                { cause: "Thermal movement", probability: 25 },
                { cause: "Moisture ingress with substrate movement", probability: 20 },
                { cause: "Structural movement requiring specialist review", probability: 15 }
            ],
            [this.PATTERNS.BALCONY_LEAKAGE]: [
                { cause: "Waterproofing detail failure", probability: 50 },
                { cause: "Drainage defect or blocked outlet", probability: 25 },
                { cause: "Door threshold / connection leakage", probability: 15 },
                { cause: "Cracked tile bed or surface layer", probability: 10 }
            ],
            [this.PATTERNS.CORROSION]: [
                { cause: coastal ? "Salt air exposure / coastal corrosion" : "Moisture exposure", probability: coastal ? 55 : 35 },
                { cause: "Insufficient protective coating", probability: 25 },
                { cause: "Water retention at detail", probability: 15 },
                { cause: "Age-related material degradation", probability: 5 }
            ],
            [this.PATTERNS.AC_CONDENSATE]: [
                { cause: "Condensate drain defect", probability: 45 },
                { cause: "Insulation defect at chilled pipe", probability: 25 },
                { cause: "Incorrect slope or installation detail", probability: 20 },
                { cause: "High indoor humidity", probability: 10 }
            ],
            [this.PATTERNS.ROOF_LEAKAGE]: [
                { cause: "Waterproofing membrane defect", probability: 45 },
                { cause: "Drainage / outlet blockage", probability: 25 },
                { cause: "Flashing or penetration detail failure", probability: 20 },
                { cause: "Condensation below roof build-up", probability: 10 }
            ]
        };

        return library[pattern] || library[this.PATTERNS.MOISTURE_STAIN];
    }

    static normalizeWeights(hypotheses = []) {
        const total = hypotheses.reduce((sum, item) => sum + Number(item.probability || 0), 0) || 1;

        return hypotheses
            .map(item => ({
                ...item,
                probability: Math.round((Number(item.probability || 0) / total) * 100),
                confidence: "preliminary"
            }))
            .sort((a, b) => b.probability - a.probability);
    }

    static getRecommendedNextChecks(pattern) {
        const checks = {
            [this.PATTERNS.MOISTURE_STAIN]: [
                "Take overview and detail photos.",
                "Measure surface moisture if equipment is available.",
                "Check adjacent facade, window, balcony or wet-area connection.",
                "Record whether the stain is active, dry or historic."
            ],
            [this.PATTERNS.MOLD]: [
                "Take photos and record room use.",
                "Measure air humidity and surface temperature.",
                "Check ventilation, thermal bridge risk and adjacent moisture sources.",
                "Record limitation if hidden construction cannot be inspected."
            ],
            [this.PATTERNS.FACADE_CRACK]: [
                "Take overview and detail photos with scale reference.",
                "Record crack direction, width and pattern.",
                "Check moisture traces, hollow render and coating condition.",
                "Flag specialist review if movement or structural relevance is suspected."
            ],
            [this.PATTERNS.BALCONY_LEAKAGE]: [
                "Photograph floor, drain, upstands and door threshold.",
                "Check slope, drainage and sealant condition.",
                "Check rooms below or adjacent for moisture indications.",
                "Request maintenance evidence if available."
            ],
            [this.PATTERNS.CORROSION]: [
                "Photograph affected metal/concrete areas.",
                "Record exposure to coast, water retention or missing coating.",
                "Check whether structural elements may be affected.",
                "Recommend specialist review for advanced corrosion."
            ],
            [this.PATTERNS.AC_CONDENSATE]: [
                "Photograph AC unit, drain line and affected area.",
                "Check condensate pipe route and insulation.",
                "Record operation status if observable.",
                "Measure humidity if available."
            ],
            [this.PATTERNS.ROOF_LEAKAGE]: [
                "Photograph roof surface, drains and penetrations.",
                "Check waterproofing age and visible defects.",
                "Check rooms below for corresponding moisture traces.",
                "Record access limitation if roof cannot be inspected."
            ]
        };

        return checks[pattern] || checks[this.PATTERNS.MOISTURE_STAIN];
    }

    static getRequiredEvidence(pattern) {
        const evidence = ["photo", "observation_note"];

        if ([this.PATTERNS.MOISTURE_STAIN, this.PATTERNS.MOLD, this.PATTERNS.AC_CONDENSATE].includes(pattern)) {
            evidence.push("moisture_measurement");
        }

        if ([this.PATTERNS.FACADE_CRACK, this.PATTERNS.CORROSION].includes(pattern)) {
            evidence.push("detail_photo_with_scale");
        }

        return evidence;
    }
}
