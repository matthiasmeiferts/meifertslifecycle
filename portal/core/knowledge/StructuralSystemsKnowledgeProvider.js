/**
 * MBLS Expert Intelligence Layer
 * Structural Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for structural-system hypotheses.
 * The provider does not diagnose, certify safety, or confirm load capacity.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "structural-systems",
    hypotheses: []
});

const HYPOTHESES = [
    h(
        "possible-load-bearing-structural-distress",
        "possible load-bearing structural distress",
        "potentially structural hypothesis requiring verification",
        ["structural damage", "structural defect", "load-bearing", "load bearing", "load-bearing wall", "load bearing wall", "structural member"],
        ["structural or load-bearing wording is reported", "load path relevance may be present", "structural distress requires qualified verification"],
        ["component is confirmed non-load-bearing", "wording relates only to finishes or cosmetic damage"],
        ["Confirm whether the affected element is load-bearing.", "Review structural drawings, calculations, or approval records where available.", "Obtain specialist structural verification before drawing safety or capacity conclusions."],
        ["need for structural verification", "possible repair planning after assessment", "uncertain load path relevance"],
        ["Document the affected element and observed structural indicators.", "Request structural records where available.", "Arrange structural engineer review if load-bearing relevance is confirmed or unclear."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-settlement-related-movement",
        "possible settlement-related movement",
        "structural hypothesis requiring verification",
        ["differential settlement", "settlement", "foundation movement", "step crack", "diagonal crack", "level survey"],
        ["settlement indicators associated with the structural system", "crack pattern or level change may indicate differential movement", "foundation movement requires specialist verification"],
        ["crack appears limited to a cosmetic finish", "no displacement or level change is documented"],
        ["Review crack pattern, level information, and foundation context.", "Check for progression using monitoring or historical records.", "Obtain qualified structural engineer review before concluding settlement behavior."],
        ["progressive cracking", "opening distortion", "possible need for structural investigation"],
        ["Document crack geometry, location, and any level change.", "Request structural drawings or previous movement records where available.", "Arrange structural engineer review if movement indicators are confirmed."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-excessive-deflection",
        "possible excessive deflection",
        "structural hypothesis requiring verification",
        ["excessive deflection", "structural deflection", "beam deflection", "slab deflection", "sagging beam", "sagging slab", "deflection measurement"],
        ["deflection is reported at a structural member", "beam, slab, floor, or roof deformation requires dimensional verification", "structural behavior cannot be confirmed without measurement"],
        ["unevenness is limited to floor finish", "no structural member is implicated"],
        ["Measure deflection or sagging where accessible.", "Review applicable structural drawings and loading context.", "Obtain qualified structural engineer review before capacity conclusions."],
        ["serviceability concern", "possible load-path investigation", "need for dimensional survey"],
        ["Record member location and deformation pattern.", "Plan dimensional survey before repair scope decisions.", "Escalate for structural review where deflection appears significant."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-structural-alteration",
        "possible structural alteration",
        "structural hypothesis requiring verification",
        ["removed load-bearing wall", "structural alteration", "structural opening", "unapproved structural alteration", "major opening", "cut slab", "opening in load-bearing wall", "structural approval"],
        ["load-bearing element may have been altered", "approval or calculation records are required to verify the load path", "alteration should not be assessed as acceptable without documentation"],
        ["alteration is documented as non-load-bearing", "approval records verify the structural change"],
        ["Review structural drawings, calculations, and approval records.", "Inspect the altered area and any transfer elements where accessible.", "Obtain qualified structural engineer review if approval or load path is unclear."],
        ["uncertain load path", "possible need for verification works", "potential repair or strengthening scope after assessment"],
        ["Document the alteration and affected elements.", "Request renovation and approval records.", "Verify structural approval before relying on the altered arrangement."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-structural-section-loss",
        "possible structural section loss",
        "structural hypothesis requiring verification",
        ["section loss", "visible material loss", "exposed reinforcement", "structural corrosion", "corrosion with section loss", "damaged column", "damaged beam", "damaged slab"],
        ["material loss is associated with a load-bearing member", "section condition may affect structural performance", "extent of loss requires verification"],
        ["surface corrosion without structural member context", "cosmetic spalling without exposed reinforcement or load-bearing relevance"],
        ["Inspect affected structural member and material condition.", "Review drawings to confirm load-bearing role.", "Use material testing or intrusive investigation where necessary."],
        ["accelerated deterioration", "possible repair or strengthening requirement", "need for specialist condition assessment"],
        ["Document material loss and member role.", "Avoid capacity conclusions before testing or engineering review.", "Arrange structural engineer review when section loss affects a load-bearing member."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-connection-deterioration",
        "possible structural connection deterioration",
        "structural hypothesis requiring verification",
        ["damaged connection", "structural connection", "anchor deterioration", "corroded anchor", "bearing connection", "damaged support", "missing support"],
        ["connection or support deterioration is reported", "load transfer at the connection may require verification", "connection condition cannot be confirmed from surface observation alone"],
        ["sealant joint defect only", "non-structural fixing or finish connection only"],
        ["Inspect connection, support, anchor, or bearing detail where accessible.", "Review drawings or approval records for intended connection arrangement.", "Obtain qualified structural engineer review if load transfer is unclear."],
        ["local instability concern", "progressive deterioration", "need for targeted connection repair planning"],
        ["Document connection condition and accessibility limits.", "Consider intrusive investigation where the connection is concealed.", "Request structural engineer review before defining repair scope."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-foundation-movement",
        "possible foundation movement",
        "structural hypothesis requiring verification",
        ["foundation movement", "foundation settlement", "footing movement", "retaining wall bowing", "horizontal basement wall crack", "plumb measurement", "level survey"],
        ["foundation or retaining-wall movement is indicated", "substructure behavior requires specialist verification", "water or soil pressure may be relevant but cannot be confirmed from visual evidence alone"],
        ["basement moisture without movement", "waterproofing defect without deformation"],
        ["Inspect foundation or retaining-wall movement indicators.", "Review level, plumb, or monitoring data where available.", "Obtain qualified structural engineer review before conclusions."],
        ["progressive wall movement", "foundation investigation requirement", "possible stabilization or repair planning after assessment"],
        ["Document movement indicators and basement/foundation context.", "Request records of historical movement or repairs.", "Arrange structural review where foundation movement indicators are present."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-lateral-stability-deficiency",
        "possible lateral stability deficiency",
        "structural hypothesis requiring verification",
        ["lateral stability", "bracing missing", "missing bracing", "structural instability", "instability", "leaning wall", "significant misalignment", "structural frame"],
        ["stability or bracing indicators are reported", "leaning or misalignment may relate to lateral stability", "stability cannot be confirmed without structural assessment"],
        ["minor misalignment of non-structural finishes", "door or window alignment issue without structural context"],
        ["Inspect bracing, frame, wall, or roof stability indicators.", "Review structural drawings for lateral system intent.", "Obtain urgent structural review if instability indicators are severe."],
        ["possible stability investigation", "temporary access or load restrictions may require review", "need for structural verification"],
        ["Document lean, misalignment, and affected elements.", "Do not certify stability from visual inspection alone.", "Escalate for urgent safety review if instability appears acute."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-fire-related-structural-degradation",
        "possible fire-related structural degradation",
        "structural hypothesis requiring verification",
        ["structural fire damage", "fire damage to structure", "fire exposed beam", "fire exposed column", "charred roof truss", "concrete spalling after fire", "steel deformation after fire"],
        ["fire exposure is associated with structural members", "material condition after fire requires specialist verification", "structural performance cannot be inferred without assessment"],
        ["fire alarm or sprinkler defect only", "fire door issue without structural member damage"],
        ["Document affected structural members and fire exposure indicators.", "Review fire incident and repair records where available.", "Obtain structural engineer assessment and material testing where necessary."],
        ["possible material degradation", "need for structural verification", "repair planning after assessment"],
        ["Record fire-exposed structural areas.", "Avoid capacity or safety conclusions before assessment.", "Arrange urgent structural review where deformation or severe damage is visible."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-water-related-structural-degradation",
        "possible water-related structural degradation",
        "structural hypothesis requiring verification",
        ["structural water damage", "water damage to structure", "flood damage to structure", "moisture damage to beam", "moisture damage to column", "rot in structural timber", "foundation washout"],
        ["water exposure is associated with structural members", "material degradation may affect load-bearing elements", "water-related structural impact requires verification"],
        ["damp patch without structural member impact", "mould or staining only"],
        ["Inspect affected structural members and moisture exposure path.", "Review history of flooding, leakage, or repairs.", "Use intrusive investigation or material testing where hidden deterioration is possible."],
        ["possible structural material degradation", "need for intrusive verification", "repair planning after assessment"],
        ["Document moisture exposure and affected structural members.", "Do not infer structural decay from staining alone.", "Request structural review where material degradation is indicated."],
        "high",
        "high",
        "high"
    ),
    h(
        "possible-roof-structure-distress",
        "possible roof-structure distress",
        "structural hypothesis requiring verification",
        ["damaged roof truss", "roof truss damage", "sagging roof structure", "rafter deformation", "purlin deformation", "missing roof bracing", "damaged rafter", "damaged purlin"],
        ["roof structural member distress is reported", "roof deformation or member damage requires verification", "roof-envelope defects are separate from roof-structure behavior"],
        ["roof waterproofing defect only", "flashing or roof membrane defect without structural member evidence"],
        ["Inspect roof truss, rafters, purlins, and bracing where accessible.", "Review roof structure drawings or repair records.", "Obtain qualified structural engineer review where deformation or member damage is present."],
        ["possible roof-structure investigation", "repair or strengthening planning after assessment", "need for access or survey"],
        ["Document affected roof members and deformation pattern.", "Separate roof covering defects from roof structure distress.", "Arrange structural review for damaged or deformed roof members."],
        "high",
        "high",
        "high"
    )
];

const STRONG_SIGNALS = [
    "structural", "structural damage", "structural defect", "load-bearing", "load bearing", "foundation settlement", "differential settlement", "structural deflection", "excessive deflection", "instability", "structural instability", "removed load-bearing wall", "removed load bearing wall", "structural alteration", "structural opening", "damaged column", "damaged beam", "damaged slab", "damaged roof truss", "missing structural member", "structural engineer", "structural approval", "structural calculations"
];

const MEDIUM_SIGNALS = [
    "diagonal crack", "step crack", "deformation", "sagging", "leaning", "misalignment", "significant movement", "major opening", "section loss", "corrosion with section loss", "damaged connection", "anchor deterioration", "fire damage", "water damage", "deflection", "foundation movement"
];

const STRUCTURAL_CONTEXTS = [
    "column", "beam", "girder", "slab", "foundation", "footing", "load-bearing wall", "load bearing wall", "roof truss", "rafter", "purlin", "bracing", "structural connection", "structural member", "structural frame", "retaining wall", "bearing wall", "support", "anchor", "reinforcement"
];

const WEAK_ONLY_SIGNALS = [
    "crack", "cracks", "damp", "moisture", "corrosion", "movement", "uneven", "damage", "defect"
];

const EXCLUSION_PATTERNS = [
    /cosmetic crack|hairline crack|plaster crack|render crack|surface crack|paint crack/,
    /non[- ]load[- ]bearing partition|lightweight partition|partition crack/,
    /damp|moisture|mould|mold|staining|condensation/,
    /waterproofing defect|membrane defect|sealant defect|etics defect|facade surface defect/,
    /roof waterproofing|roof membrane|flashing defect|gutter|drainage defect/,
    /balcony waterproofing|terrace waterproofing/,
    /electrical|sanitary|hvac|ventilation|heating|cooling|elevator|lift|fire alarm|sprinkler/
];

export default class StructuralSystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for structural-system findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable structural systems knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);

        if (!hasSufficientInput(source)) {
            return EMPTY_CONTRACT;
        }

        const context = buildContext(source);

        if (!isRelevantContext(context)) {
            return EMPTY_CONTRACT;
        }

        const ranked = HYPOTHESES
            .map((entry, index) => ({
                entry,
                index,
                score: scoreHypothesis(entry, context)
            }))
            .filter((item) => item.score > 0)
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return left.index - right.index;
            });

        if (ranked.length === 0) {
            return EMPTY_CONTRACT;
        }

        return {
            domain: "structural-systems",
            hypotheses: ranked.map((item) => toHypothesis(item.entry))
        };
    }

}

function h(id, cause, classification, keywords, supportingIndicators, contradictingIndicators, requiredVerification, potentialConsequences, recommendedActions, riskRelevance, capexRelevance, valuationRelevance) {
    return {
        id,
        cause,
        classification,
        keywords,
        supportingIndicators,
        contradictingIndicators,
        requiredVerification,
        potentialConsequences,
        recommendedActions,
        riskRelevance,
        capexRelevance,
        valuationRelevance
    };
}

function normalizeInput(input) {
    const source = cloneObject(input);

    return {
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    };
}

function hasSufficientInput(source) {
    return Boolean(
        textOf(source.finding.category).trim().length > 0 ||
        textOf(source.finding.location).trim().length > 0 ||
        textOf(source.finding.description).trim().length > 0 ||
        textOf(source.finding.observations).trim().length > 0 ||
        textOf(source.building.constructionType).trim().length > 0 ||
        textOf(source.building.structuralSystem).trim().length > 0 ||
        source.measurements.length > 0
    );
}

function buildContext(source) {
    const findingText = [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations)
    ].join(" ").toLowerCase();

    const buildingText = [
        textOf(source.building.constructionType),
        textOf(source.building.structuralSystem),
        textOf(source.building.constructionYear),
        textOf(source.building.numberOfStoreys),
        source.building.basementPresent === true ? "basement present" : ""
    ].join(" ").toLowerCase();

    const measurementText = source.measurements
        .map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
        .join(" ")
        .toLowerCase();

    const evidenceText = [findingText, measurementText].join(" ").trim();

    return {
        text: [findingText, buildingText, measurementText].join(" ").trim(),
        evidenceText,
        findingText,
        buildingText,
        measurementText
    };
}

function isRelevantContext(context) {
    const evidence = context.evidenceText;

    if (evidence.length === 0) {
        return false;
    }

    if (/without structural (member )?(context|relevance)|no structural (member )?(context|relevance)/.test(evidence)) {
        return false;
    }

    const hasStrong = STRONG_SIGNALS.some((term) => containsWord(evidence, term));
    const mediumCount = MEDIUM_SIGNALS.filter((term) => containsWord(evidence, term)).length;
    const hasStructuralContext = STRUCTURAL_CONTEXTS.some((term) => containsWord(evidence, term));
    const weakCount = WEAK_ONLY_SIGNALS.filter((term) => containsWord(evidence, term)).length;
    const hasExclusion = EXCLUSION_PATTERNS.some((pattern) => pattern.test(evidence));

    if (hasStrong) {
        return !hasExclusion || hasStructuralContext;
    }

    if (mediumCount >= 2 && hasStructuralContext) {
        return true;
    }

    if (weakCount > 0) {
        return false;
    }

    return false;
}

function scoreHypothesis(entry, context) {
    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (containsWord(context.evidenceText, keyword)) {
            score += 5;
        }

        if (containsWord(context.findingText, keyword)) {
            score += 2;
        }

        if (containsWord(context.measurementText, keyword)) {
            score += 2;
        }

        if (containsWord(context.buildingText, keyword)) {
            score += 1;
        }
    });

    return score;
}

function toHypothesis(entry) {
    return {
        id: entry.id,
        cause: entry.cause,
        classification: entry.classification,
        structuralRelevance: "high",
        supportingIndicators: [...entry.supportingIndicators],
        contradictingIndicators: [...entry.contradictingIndicators],
        requiredVerification: [...entry.requiredVerification],
        potentialConsequences: [...entry.potentialConsequences],
        recommendedActions: [...entry.recommendedActions],
        riskRelevance: entry.riskRelevance,
        riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
        capexRelevance: entry.capexRelevance,
        valuationRelevance: entry.valuationRelevance
    };
}

function cloneObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return { ...value };
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item) => cloneObject(item));
}

function textOf(value) {
    if (Array.isArray(value)) {
        return value.map((item) => textOf(item)).join(" ");
    }

    if (value && typeof value === "object") {
        return Object.values(value).map((item) => textOf(item)).join(" ");
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function containsWord(text, term) {
    const escaped = escapeRegExp(term.toLowerCase()).replace(/\\\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
