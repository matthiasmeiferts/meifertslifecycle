import MoistureKnowledgeProvider from "./knowledge/MoistureKnowledgeProvider.js";
import CrackKnowledgeProvider from "./knowledge/CrackKnowledgeProvider.js";
import RoofEnvelopeKnowledgeProvider from "./knowledge/RoofEnvelopeKnowledgeProvider.js";
import ConcreteCorrosionKnowledgeProvider from "./knowledge/ConcreteCorrosionKnowledgeProvider.js";
import BasementWaterproofingKnowledgeProvider from "./knowledge/BasementWaterproofingKnowledgeProvider.js";
import BalconiesTerracesKnowledgeProvider from "./knowledge/BalconiesTerracesKnowledgeProvider.js";
import DrainageRainwaterKnowledgeProvider from "./knowledge/DrainageRainwaterKnowledgeProvider.js";
import HvacSystemsKnowledgeProvider from "./knowledge/HvacSystemsKnowledgeProvider.js";
import ElectricalSystemsKnowledgeProvider from "./knowledge/ElectricalSystemsKnowledgeProvider.js";
import SanitarySystemsKnowledgeProvider from "./knowledge/SanitarySystemsKnowledgeProvider.js";
import FireProtectionSystemsKnowledgeProvider from "./knowledge/FireProtectionSystemsKnowledgeProvider.js";
import VerticalTransportationSystemsKnowledgeProvider from "./knowledge/VerticalTransportationSystemsKnowledgeProvider.js";
import WindowsDoorsKnowledgeProvider from "./knowledge/WindowsDoorsKnowledgeProvider.js";
import FacadeWallSystemsKnowledgeProvider from "./knowledge/FacadeWallSystemsKnowledgeProvider.js";
import KnowledgeReasoningMapper from "./reasoning/KnowledgeReasoningMapper.js";
import KnowledgeDomainRouter from "./reasoning/KnowledgeDomainRouter.js";

/**
 * MBLS Expert Intelligence Layer
 * Expert Reasoning Engine
 *
 * Deterministic reasoning contract for future expert intelligence workflows.
 * The engine derives stable hypotheses from inspection findings, building
 * context, and measurements without AI, external providers, or side effects.
 */

const SCENARIOS = {
    general: {
        primaryHypothesis: {
            label: "Insufficient information for a specific expert hypothesis",
            category: "general",
            rationale:
                "The available data does not isolate one stable root cause with confidence."
        },
        alternativeHypotheses: [
            {
                label: "Concealed moisture-related issue",
                category: "general",
                rationale:
                    "Moisture can remain hidden until additional verification is completed."
            },
            {
                label: "Maintenance or material-aging issue",
                category: "general",
                rationale:
                    "Routine wear and maintenance gaps can produce ambiguous observations."
            },
            {
                label: "Context-dependent condition requiring inspection",
                category: "general",
                rationale:
                    "Some observations require more site detail before a stable conclusion is possible."
            }
        ],
        requiredVerification: [
            "Collect additional inspection evidence.",
            "Document the observed condition with context and measurements.",
            "Reassess once more site-specific information is available."
        ],
        potentialConsequences: [
            "Delayed diagnosis.",
            "Potential escalation of an undetected condition.",
            "Need for follow-up inspection."
        ]
    },
    cracking: {
        primaryHypothesis: {
            label: "Movement or cracking of the building fabric",
            category: "cracking",
            rationale:
                "Observed cracking points to movement, stress, or substrate instability."
        },
        alternativeHypotheses: [
            {
                label: "Thermal movement",
                category: "cracking",
                rationale:
                    "Repeated temperature change can create patterned cracking."
            },
            {
                label: "Finish or render failure",
                category: "cracking",
                rationale:
                    "Surface layers may crack before deeper structural elements are affected."
            },
            {
                label: "Structural movement requiring specialist review",
                category: "cracking",
                rationale:
                    "Persistent or widening cracks may indicate structural relevance."
            }
        ],
        requiredVerification: [
            "Record crack pattern, orientation and width.",
            "Check for progression and nearby movement indicators.",
            "Escalate for specialist review if deformation is suspected."
        ],
        potentialConsequences: [
            "Continued deterioration of finishes.",
            "Water ingress through openings in the fabric.",
            "Possible structural implications if movement continues."
        ]
    },
    corrosion: {
        primaryHypothesis: {
            label: "Corrosion from moisture or environmental exposure",
            category: "corrosion",
            rationale:
                "Corrosion indicators usually arise from repeated exposure to moisture or aggressive air."
        },
        alternativeHypotheses: [
            {
                label: "Coating or protective layer failure",
                category: "corrosion",
                rationale:
                    "Loss of protective coating can accelerate oxidation or deterioration."
            },
            {
                label: "Water retention at a detail",
                category: "corrosion",
                rationale:
                    "Standing water or poor drainage can intensify surface attack."
            },
            {
                label: "Age-related material degradation",
                category: "corrosion",
                rationale:
                    "Older materials may degrade even without a single dominant defect."
            }
        ],
        requiredVerification: [
            "Check exposure to water, salt air or aggressive conditions.",
            "Verify remaining protective coating and drainage behavior.",
            "Determine whether any structural elements are affected."
        ],
        potentialConsequences: [
            "Reduced service life of affected components.",
            "Progressive material loss.",
            "Possible structural impact in advanced cases."
        ]
    }
};

/**
 * Analyze a finding/building/measurement bundle and return a deterministic
 * expert-reasoning contract.
 *
 * @param {Object} [input={}] - Analysis input.
 * @param {Object} [input.finding] - Primary finding payload.
 * @param {Object} [input.building] - Building context payload.
 * @param {Array<Object>} [input.measurements] - Measurement entries.
 * @param {Object} [input.context] - Supplemental context.
 * @returns {Object} Stable reasoning output.
 */
export default class ExpertReasoningEngine {

    static analyze(input = {}) {
        const source = cloneObject(input);
        const domains = KnowledgeDomainRouter.resolve(source);

        for (const domain of domains) {
            const contract = domain === "concrete-corrosion"
                ? buildConcreteCorrosionReasoning(source)
                : domain === "basement-waterproofing"
                    ? buildBasementWaterproofingReasoning(source)
                : domain === "balconies-terraces"
                    ? buildBalconiesTerracesReasoning(source)
                : domain === "drainage-rainwater"
                    ? buildDrainageRainwaterReasoning(source)
                : domain === "hvac-systems"
                    ? buildHvacSystemsReasoning(source)
                : domain === "electrical-systems"
                    ? buildElectricalSystemsReasoning(source)
                : domain === "sanitary-systems"
                    ? buildSanitarySystemsReasoning(source)
                : domain === "fire-protection-systems"
                    ? buildFireProtectionSystemsReasoning(source)
                : domain === "vertical-transportation-systems"
                    ? buildVerticalTransportationSystemsReasoning(source)
                : domain === "windows-doors"
                    ? buildWindowsDoorsReasoning(source)
                : domain === "facade-wall-systems"
                    ? buildFacadeWallSystemsReasoning(source)
                : domain === "roof-envelope"
                    ? buildRoofEnvelopeReasoning(source)
                    : domain === "moisture"
                        ? buildMoistureReasoning(source)
                        : domain === "crack"
                            ? buildCrackReasoning(source)
                            : null;

            if (contract) {
                return contract;
            }
        }

        if (domains.length > 0) {
            return this.analyzeLegacy();
        }

        return this.analyzeLegacy(source);
    }

    static analyzeLegacy(input = {}) {
        const source = cloneObject(input);
        const finding = cloneObject(source.finding);
        const building = cloneObject(source.building);
        const context = cloneObject(source.context);
        const measurements = cloneArray(source.measurements).filter((entry) => entry && typeof entry === "object");

        const combinedText = [
            textOf(finding),
            textOf(building),
            textOf(context),
            ...measurements.map((measurement) => textOf(measurement))
        ].join(" ");

        const scenario = detectScenario(combinedText);
        const template = SCENARIOS[scenario] || SCENARIOS.general;

        const supportingEvidence = collectSupportingEvidence({
            finding,
            building,
            context,
            measurements
        });

        const missingEvidence = collectMissingEvidence({
            finding,
            building,
            measurements,
            supportingEvidence
        });

        const primaryHypothesis = {
            ...cloneObject(template.primaryHypothesis),
            rationale: enrichRationale(template.primaryHypothesis.rationale, supportingEvidence.length)
        };

        const alternativeHypotheses = template.alternativeHypotheses.map((hypothesis, index) => ({
            ...cloneObject(hypothesis),
            rationale: `${hypothesis.rationale} (${scenario} alternate ${index + 1})`
        }));

        const requiredVerification = missingEvidence.length > 0
            ? [...template.requiredVerification, "Close evidence gaps before finalizing the hypothesis."]
            : [...template.requiredVerification];

        const potentialConsequences = [
            ...template.potentialConsequences,
            ...(textOf(context).trim().length > 0
                ? [`Context-sensitive follow-up may be required for ${scenario}.`]
                : [])
        ];

        const confidence = clampConfidence(
            20 +
            (scenario === "general" ? 0 : 20) +
            Math.min(supportingEvidence.length, 4) * 10 -
            Math.min(missingEvidence.length, 4) * 6 -
            Math.min(alternativeHypotheses.length, 3) * 2 +
            (measurements.length > 0 ? 8 : 0)
        );

        return {
            primaryHypothesis,
            alternativeHypotheses,
            supportingEvidence,
            missingEvidence,
            requiredVerification,
            potentialConsequences,
            confidence
        };
    }

}

function buildMoistureReasoning(source = {}) {
    const knowledge = MoistureKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    const ranked = knowledge.hypotheses
        .map((hypothesis) => ({
            hypothesis,
            score: scoreMoistureHypothesis(hypothesis, source)
        }))
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score;
            }

            return left.hypothesis.id.localeCompare(right.hypothesis.id);
        });

    if (ranked.length === 0 || ranked[0].score === 0) {
        return null;
    }

    const primary = ranked[0].hypothesis;
    const alternativeHypotheses = ranked.slice(1).map((entry) => cloneValue(entry.hypothesis));
    const supportingEvidence = collectMatchedIndicators(primary, source);
    const missingEvidence = collectMoistureMissingEvidence(primary, supportingEvidence);
    const requiredVerification = [...cloneArray(primary.requiredVerification)];
    const potentialConsequences = [...cloneArray(primary.potentialConsequences)];
    const confidence = calculateMoistureConfidence(supportingEvidence);

    return {
        primaryHypothesis: cloneValue(primary),
        alternativeHypotheses,
        supportingEvidence,
        missingEvidence,
        requiredVerification,
        potentialConsequences,
        confidence
    };
}

function buildCrackReasoning(source = {}) {
    const knowledge = CrackKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    const ranked = knowledge.hypotheses
        .map((hypothesis) => ({
            hypothesis,
            score: scoreCrackHypothesis(hypothesis, source)
        }))
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score;
            }

            return left.hypothesis.id.localeCompare(right.hypothesis.id);
        });

    if (ranked.length === 0 || ranked[0].score === 0) {
        return null;
    }

    const primary = ranked[0].hypothesis;
    const alternativeHypotheses = ranked.slice(1).map((entry) => mapCrackHypothesis(entry.hypothesis, false));
    const supportingEvidence = collectCrackSupportingEvidence(primary, source);
    const missingEvidence = collectCrackMissingEvidence(primary, supportingEvidence);
    const requiredVerification = [...cloneArray(primary.requiredVerification)];

    if (isStructurallySuspiciousCrack(primary, source)) {
        requiredVerification.push("Specialist structural verification is required before any conclusion is drawn.");
    }

    const potentialConsequences = [...cloneArray(primary.potentialConsequences)];
    const confidence = calculateCrackConfidence(supportingEvidence, primary, source);

    return {
        primaryHypothesis: mapCrackHypothesis(primary, true),
        alternativeHypotheses,
        supportingEvidence,
        missingEvidence,
        requiredVerification,
        potentialConsequences,
        confidence
    };
}

function buildRoofEnvelopeReasoning(source = {}) {
    const knowledge = RoofEnvelopeKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildWindowsDoorsReasoning(source = {}) {
    const knowledge = WindowsDoorsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildBalconiesTerracesReasoning(source = {}) {
    const knowledge = BalconiesTerracesKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildDrainageRainwaterReasoning(source = {}) {
    const knowledge = DrainageRainwaterKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildHvacSystemsReasoning(source = {}) {
    const knowledge = HvacSystemsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildElectricalSystemsReasoning(source = {}) {
    const knowledge = ElectricalSystemsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildSanitarySystemsReasoning(source = {}) {
    const knowledge = SanitarySystemsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildFireProtectionSystemsReasoning(source = {}) {
    const knowledge = FireProtectionSystemsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildVerticalTransportationSystemsReasoning(source = {}) {
    const knowledge = VerticalTransportationSystemsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildFacadeWallSystemsReasoning(source = {}) {
    const knowledge = FacadeWallSystemsKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    return KnowledgeReasoningMapper.map({
        knowledge,
        input: source
    });
}

function buildBasementWaterproofingReasoning(source = {}) {
    const knowledge = BasementWaterproofingKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    const [primaryHypothesis, ...alternativeHypotheses] = knowledge.hypotheses;
    const mappedPrimary = mapBasementHypothesis(primaryHypothesis, source);

    return KnowledgeReasoningMapper.map({
        knowledge: {
            domain: knowledge.domain,
            hypotheses: [primaryHypothesis]
        },
        input: source
    }) && {
        primaryHypothesis: mappedPrimary.primaryHypothesis,
        alternativeHypotheses: alternativeHypotheses.map((hypothesis) => {
            const mapped = mapBasementHypothesis(hypothesis, source);
            return mapped.primaryHypothesis;
        }),
        supportingEvidence: mappedPrimary.supportingEvidence,
        missingEvidence: mappedPrimary.missingEvidence,
        requiredVerification: mappedPrimary.requiredVerification,
        potentialConsequences: mappedPrimary.potentialConsequences,
        confidence: mappedPrimary.confidence
    };
}

function mapBasementHypothesis(hypothesis = {}, source = {}) {
    const mapped = KnowledgeReasoningMapper.map({
        knowledge: {
            domain: "basement-waterproofing",
            hypotheses: [cloneObject(hypothesis)]
        },
        input: cloneObject(source)
    });

    if (mapped?.primaryHypothesis) {
        const normalizedCause = normalizeBasementCauseLabel(mapped.primaryHypothesis.cause);

        return {
            ...mapped,
            primaryHypothesis: {
                ...mapped.primaryHypothesis,
                cause: normalizedCause,
                label: normalizedCause
            }
        };
    }

    const fallbackCause = normalizeBasementCauseLabel(hypothesis.cause);

    return {
        primaryHypothesis: {
            id: hypothesis.id,
            label: fallbackCause,
            cause: fallbackCause,
            classification: hypothesis.classification,
            structuralRelevance: hypothesis.structuralRelevance,
            supportingIndicators: cloneArray(hypothesis.supportingIndicators),
            contradictingIndicators: cloneArray(hypothesis.contradictingIndicators),
            requiredVerification: cloneArray(hypothesis.requiredVerification),
            potentialConsequences: cloneArray(hypothesis.potentialConsequences),
            recommendedActions: cloneArray(hypothesis.recommendedActions),
            riskRelevance: hypothesis.riskRelevance,
            capexRelevance: hypothesis.capexRelevance,
            valuationRelevance: hypothesis.valuationRelevance,
            status: "hypothesis"
        },
        alternativeHypotheses: [],
        supportingEvidence: [],
        missingEvidence: cloneArray(hypothesis.contradictingIndicators),
        requiredVerification: cloneArray(hypothesis.requiredVerification),
        potentialConsequences: cloneArray(hypothesis.potentialConsequences),
        confidence: 0
    };
}

function normalizeBasementCauseLabel(value) {
    const cause = String(value || "").trim().toLowerCase();

    return cause === "rising damp in masonry"
        ? "rising damp"
        : value;
}

function buildConcreteCorrosionReasoning(source = {}) {
    const knowledge = ConcreteCorrosionKnowledgeProvider.getKnowledge({
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    });

    if (!knowledge.hypotheses.length) {
        return null;
    }

    const [primaryHypothesis, ...alternativeHypotheses] = knowledge.hypotheses;
    const mappedPrimary = mapConcreteHypothesis(primaryHypothesis, source);

    return KnowledgeReasoningMapper.map({
        knowledge: {
            domain: knowledge.domain,
            hypotheses: [primaryHypothesis]
        },
        input: source
    }) && {
        primaryHypothesis: mappedPrimary.primaryHypothesis,
        alternativeHypotheses: alternativeHypotheses.map((hypothesis) => {
            const mapped = mapConcreteHypothesis(hypothesis, source);
            return mapped.primaryHypothesis;
        }),
        supportingEvidence: mappedPrimary.supportingEvidence,
        missingEvidence: mappedPrimary.missingEvidence,
        requiredVerification: mappedPrimary.requiredVerification,
        potentialConsequences: mappedPrimary.potentialConsequences,
        confidence: mappedPrimary.confidence
    };
}

function mapConcreteHypothesis(hypothesis = {}, source = {}) {
    const mapped = KnowledgeReasoningMapper.map({
        knowledge: {
            domain: "concrete-corrosion",
            hypotheses: [cloneObject(hypothesis)]
        },
        input: buildConcreteMappingInput(source, hypothesis?.cause)
    });

    return mapped || {
        primaryHypothesis: {
            id: hypothesis.id,
            label: hypothesis.cause,
            cause: hypothesis.cause,
            classification: hypothesis.classification,
            structuralRelevance: hypothesis.structuralRelevance,
            supportingIndicators: cloneArray(hypothesis.supportingIndicators),
            contradictingIndicators: cloneArray(hypothesis.contradictingIndicators),
            requiredVerification: cloneArray(hypothesis.requiredVerification),
            potentialConsequences: cloneArray(hypothesis.potentialConsequences),
            recommendedActions: cloneArray(hypothesis.recommendedActions),
            riskRelevance: hypothesis.riskRelevance,
            capexRelevance: hypothesis.capexRelevance,
            valuationRelevance: hypothesis.valuationRelevance,
            status: "hypothesis"
        },
        alternativeHypotheses: [],
        supportingEvidence: [],
        missingEvidence: cloneArray(hypothesis.contradictingIndicators),
        requiredVerification: cloneArray(hypothesis.requiredVerification),
        potentialConsequences: cloneArray(hypothesis.potentialConsequences),
        confidence: 0
    };
}

function buildConcreteMappingInput(source = {}, primaryCause = "") {
    const mappedInput = cloneObject(source);
    const primary = String(primaryCause).toLowerCase();

    mappedInput.building = {
        ...cloneObject(source.building),
        constructionType: "",
        exposureClass: ""
    };
    mappedInput.finding = {
        ...cloneObject(source.finding),
        category: primary
    };

    if (primary === "reinforcement corrosion") {
        mappedInput.finding = sanitizeConcreteText(mappedInput.finding, [
            "spalling",
            "concrete",
            "chloride",
            "salt",
            "coastal",
            "marine",
            "de-icing"
        ]);
        mappedInput.measurements = cloneArray(source.measurements).map((entry) => sanitizeConcreteText(entry, [
            "spalling",
            "concrete",
            "chloride",
            "salt",
            "coastal",
            "marine",
            "de-icing"
        ]));
    }

    return mappedInput;
}

function sanitizeConcreteText(value, terms) {
    if (!value || typeof value !== "object") {
        return value;
    }

    const cloned = cloneValue(value);
    const pattern = new RegExp(`\\b(${terms.map((term) => escapeRegex(term)).join("|")})\\b`, "gi");

    const scrub = (entry) => {
        if (typeof entry === "string") {
            return entry.replace(pattern, " ").replace(/\s+/g, " ").trim();
        }

        if (Array.isArray(entry)) {
            return entry.map((item) => scrub(item));
        }

        if (entry && typeof entry === "object") {
            const result = {};

            Object.entries(entry).forEach(([key, child]) => {
                result[key] = scrub(child);
            });

            return result;
        }

        return entry;
    };

    return scrub(cloned);
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreCrackHypothesis(hypothesis = {}, source = {}) {
    const text = buildCrackText(source);

    return cloneArray(hypothesis.supportingIndicators).reduce((total, indicator) => {
        const match = matchesCrackIndicator(text, indicator);
        return total + (match ? 1 : 0);
    }, 0);
}

function collectCrackSupportingEvidence(hypothesis = {}, source = {}) {
    const text = buildCrackText(source);

    return cloneArray(hypothesis.supportingIndicators).filter((indicator) => matchesCrackIndicator(text, indicator)).map((indicator) => ({
        source: "indicator",
        label: indicator
    }));
}

function collectCrackMissingEvidence(hypothesis = {}, supportingEvidence = []) {
    const missingEvidence = cloneArray(hypothesis.contradictingIndicators);

    if (supportingEvidence.length === 0) {
        missingEvidence.push("No supporting crack indicators were available.");
    }

    return missingEvidence;
}

function calculateCrackConfidence(supportingEvidence = [], hypothesis = {}, source = {}) {
    if (supportingEvidence.length === 0) {
        return 0;
    }

    const totalIndicators = cloneArray(hypothesis.supportingIndicators).length || 1;
    const score = supportingEvidence.length / totalIndicators;

    return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

function mapCrackHypothesis(hypothesis = {}, isPrimary = false) {
    return {
        id: hypothesis.id,
        label: hypothesis.cause,
        cause: hypothesis.cause,
        classification: hypothesis.classification,
        structuralRelevance: hypothesis.structuralRelevance,
        supportingIndicators: cloneArray(hypothesis.supportingIndicators),
        contradictingIndicators: cloneArray(hypothesis.contradictingIndicators),
        requiredVerification: cloneArray(hypothesis.requiredVerification),
        potentialConsequences: cloneArray(hypothesis.potentialConsequences),
        recommendedActions: cloneArray(hypothesis.recommendedActions),
        riskRelevance: hypothesis.riskRelevance,
        capexRelevance: hypothesis.capexRelevance,
        valuationRelevance: hypothesis.valuationRelevance,
        status: isPrimary ? "hypothesis" : "hypothesis"
    };
}

function isStructurallySuspiciousCrack(hypothesis = {}, source = {}) {
    const text = buildCrackText(source);

    return /recurring|widening|load-bearing|bearing|displacement|displaced|structural|settlement|foundation|sagging|deflection|step crack/.test(text) ||
        /structural assessment required/i.test(String(hypothesis.classification));
}

function buildCrackText(source = {}) {
    return [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionYear),
        textOf(source.building?.constructionType),
        textOf(source.building?.numberOfStoreys),
        source.building?.basementPresent === true ? "basement present" : "",
        ...cloneArray(source.measurements).map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
    ].join(" ").toLowerCase();
}

function matchesCrackIndicator(text, indicator) {
    const normalizedText = String(text).toLowerCase();
    const normalizedIndicator = String(indicator).toLowerCase();

    if (normalizedText.includes(normalizedIndicator)) {
        return true;
    }

    return normalizedIndicator
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 4)
        .some((token) => normalizedText.includes(token));
}

function scoreMoistureHypothesis(hypothesis = {}, source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionType),
        textOf(source.building?.constructionYear),
        source.building?.basementPresent === true ? "basement present" : "",
        ...cloneArray(source.measurements).map((entry) => textOf(entry))
    ].join(" ").toLowerCase();

    return cloneArray(hypothesis.supportingIndicators).reduce((total, indicator) => {
        const match = matchesIndicator(text, indicator);
        return total + (match ? 1 : 0);
    }, 0);
}

function collectMatchedIndicators(hypothesis = {}, source = {}) {
    const text = [
        textOf(source.finding?.category),
        textOf(source.finding?.location),
        textOf(source.finding?.description),
        textOf(source.finding?.observations),
        textOf(source.building?.constructionType),
        textOf(source.building?.constructionYear),
        source.building?.basementPresent === true ? "basement present" : "",
        ...cloneArray(source.measurements).map((entry) => textOf(entry))
    ].join(" ").toLowerCase();

    return cloneArray(hypothesis.supportingIndicators).filter((indicator) => matchesIndicator(text, indicator));
}

function collectMoistureMissingEvidence(hypothesis = {}, supportingEvidence = []) {
    const missingEvidence = [];

    cloneArray(hypothesis.contradictingIndicators).forEach((indicator) => {
        missingEvidence.push(indicator);
    });

    if (supportingEvidence.length === 0) {
        missingEvidence.push("No supporting indicators matched the available moisture knowledge.");
    }

    return missingEvidence;
}

function calculateMoistureConfidence(supportingEvidence = []) {
    if (supportingEvidence.length === 0) {
        return 0;
    }

    const score = supportingEvidence.length >= 4
        ? 1
        : supportingEvidence.length === 3
            ? 0.75
            : supportingEvidence.length === 2
                ? 0.5
                : 0.25;

    return score;
}

function detectScenario(text = "") {
    const normalized = String(text).toLowerCase();

    if (/crack|cracking|fracture|split|movement|deformation/.test(normalized)) {
        return "cracking";
    }

    if (/corrosion|rust|oxidation|salt|coating|metal/.test(normalized)) {
        return "corrosion";
    }

    if (/moisture|leak|water|humidity|damp|stain/.test(normalized)) {
        return "moisture";
    }

    return "general";
}

function collectSupportingEvidence({ finding, building, context, measurements }) {
    const evidence = [];

    if (hasMeaningfulText(finding)) {
        evidence.push({
            source: "finding",
            label: summarize(finding)
        });
    }

    if (hasMeaningfulText(building)) {
        evidence.push({
            source: "building",
            label: summarize(building)
        });
    }

    measurements.forEach((measurement, index) => {
        evidence.push({
            source: "measurement",
            label: summarizeMeasurement(measurement, index)
        });
    });

    if (hasMeaningfulText(context)) {
        evidence.push({
            source: "context",
            label: summarize(context)
        });
    }

    return evidence;
}

function collectMissingEvidence({ finding, building, measurements, supportingEvidence }) {
    const missingEvidence = [];

    if (!hasMeaningfulText(finding)) {
        missingEvidence.push("Finding detail is missing.");
    }

    if (!hasMeaningfulText(building)) {
        missingEvidence.push("Building context is missing.");
    }

    if (measurements.length === 0) {
        missingEvidence.push("Measurement data is missing.");
    }

    if (supportingEvidence.length === 0) {
        missingEvidence.push("No supporting evidence was available.");
    }

    return missingEvidence;
}

function enrichRationale(rationale, supportingEvidenceCount) {
    if (supportingEvidenceCount === 0) {
        return `${rationale} Evidence is currently limited.`;
    }

    return `${rationale} Supported by ${supportingEvidenceCount} evidence item(s).`;
}

function summarize(value) {
    if (typeof value === "string") {
        return value;
    }

    if (!value || typeof value !== "object") {
        return "Unspecified evidence";
    }

    const label = value.label || value.name || value.type || value.category || value.summary;
    const detail = value.value ?? value.amount ?? value.level ?? value.note;

    if (label && detail !== undefined && detail !== null && `${detail}`.length > 0) {
        return `${label}: ${detail}`;
    }

    if (label) {
        return String(label);
    }

    return textOf(value) || "Unspecified evidence";
}

function summarizeMeasurement(measurement, index) {
    const name = measurement.name || measurement.type || measurement.measurementType || `Measurement ${index + 1}`;
    const value = measurement.value ?? measurement.amount ?? measurement.level ?? measurement.reading;

    if (value !== undefined && value !== null && `${value}`.length > 0) {
        return `${name}: ${value}`;
    }

    return String(name);
}

function textOf(value) {
    if (typeof value === "string") {
        return value;
    }

    if (!value || typeof value !== "object") {
        return "";
    }

    return Object.values(value)
        .filter((entry) => typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean")
        .map((entry) => String(entry))
        .join(" ");
}

function hasMeaningfulText(value) {
    return textOf(value).trim().length > 0;
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((entry) => cloneValue(entry));
}

function cloneObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return cloneValue(value);
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}

function contains(source, value) {
    return String(source).includes(String(value).toLowerCase());
}

function matchesIndicator(text, indicator) {
    const normalizedText = String(text).toLowerCase();
    const normalizedIndicator = String(indicator).toLowerCase();

    if (normalizedText.includes(normalizedIndicator)) {
        return true;
    }

    return normalizedIndicator
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 4)
        .some((token) => normalizedText.includes(token));
}

function clampConfidence(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(number)));
}