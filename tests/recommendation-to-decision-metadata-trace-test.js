import RecommendationManager from "../portal/core/RecommendationManager.js";
import DecisionManager from "../portal/core/DecisionManager.js";
import StorageManager from "../portal/core/storage/StorageManager.js";

const memoryStorage = new Map();

global.localStorage = {
    getItem(key) {
        return memoryStorage.has(key) ? memoryStorage.get(key) : null;
    },
    setItem(key, value) {
        memoryStorage.set(key, String(value));
    },
    removeItem(key) {
        memoryStorage.delete(key);
    },
    clear() {
        memoryStorage.clear();
    }
};

StorageManager.clear(RecommendationManager.collection);
StorageManager.clear(DecisionManager.collection);

const recommendation = RecommendationManager.create({
    caseId: "CASE-D3-1",
    buildingId: "BLD-D3-1",
    inspectionId: "INS-D3-1",
    assessmentIds: ["ASM-D3-1"],
    findingIds: ["FND-D3-1"],
    evidenceIds: ["EVD-D3-1"],
    sourceAssessmentIds: ["ASM-D3-1"],
    sourceFindingIds: ["FND-D3-1"],
    sourceEvidenceIds: ["EVD-D3-1"],
    title: "Recommendation Draft from assessment",
    description: "Recommendation with evidence metadata trace.",
    action: "Prepare decision support only after expert review.",
    source: "Assessment Review",
    buildingSystem: "Interior / Wall",
    riskScore: 40,
    sourceFileName: "wall-base-moisture.jpg",
    sourceFileType: "image",
    sourceFileReference: "local://evidence/wall-base-moisture.jpg",
    sourceCaptureMethod: "field-photo",
    sourceLocationLabel: "Bedroom wall base",
    sourceInspectionArea: "Interior / Wall base",
    sourceMeasurementValue: 22.4,
    sourceMeasurementUnit: "% WME",
    sourceReviewStatus: "Needs review",
    sourceExpertReviewRequired: true,
    priority: "High",
    timeframe: "Short Term",
    decisionImpact: "Medium",
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    noAutomaticDecision: true,
    confidence: 60
});

const decision = DecisionManager.create({
    caseId: recommendation.caseId,
    buildingId: recommendation.buildingId,
    inspectionId: recommendation.inspectionId,
    recommendationId: recommendation.id,
    recommendationIds: [recommendation.id],
    assessmentIds: recommendation.assessmentIds || [],
    findingIds: recommendation.findingIds || [],
    evidenceIds: recommendation.evidenceIds || [],
    sourceRecommendationIds: [recommendation.id],
    sourceAssessmentIds: recommendation.sourceAssessmentIds || recommendation.assessmentIds || [],
    sourceFindingIds: recommendation.sourceFindingIds || recommendation.findingIds || [],
    sourceEvidenceIds: recommendation.sourceEvidenceIds || recommendation.evidenceIds || [],
    title: `Decision Draft: ${recommendation.title}`,
    description: [
        recommendation.description,
        "",
        "Evidence metadata trace:",
        `File name: ${recommendation.sourceFileName}`,
        `File reference: ${recommendation.sourceFileReference}`,
        `Measurement: ${recommendation.sourceMeasurementValue} ${recommendation.sourceMeasurementUnit}`,
        `Evidence review status: ${recommendation.sourceReviewStatus}`
    ].join("\\n"),
    decisionType: "Monitor",
    rationale: recommendation.action || "",
    source: recommendation.source || "Recommendation Review",
    buildingSystem: recommendation.buildingSystem || "",
    riskScore: recommendation.riskScore || 0,
    decisionImpact: recommendation.decisionImpact || "Medium",
    sourceFileName: recommendation.sourceFileName || "",
    sourceFileType: recommendation.sourceFileType || "",
    sourceFileReference: recommendation.sourceFileReference || "",
    sourceCaptureMethod: recommendation.sourceCaptureMethod || "",
    sourceLocationLabel: recommendation.sourceLocationLabel || "",
    sourceInspectionArea: recommendation.sourceInspectionArea || "",
    sourceMeasurementValue: recommendation.sourceMeasurementValue ?? null,
    sourceMeasurementUnit: recommendation.sourceMeasurementUnit || "",
    sourceReviewStatus: recommendation.sourceReviewStatus || "",
    sourceExpertReviewRequired: recommendation.sourceExpertReviewRequired,
    riskLevel: "Medium",
    confidence: 60,
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    noAutomaticDecision: true,
    decisionSupportOnly: true
});

if (!decision.recommendationIds.includes(recommendation.id)) throw new Error("Recommendation ID not linked to decision");
if (!decision.evidenceIds.includes("EVD-D3-1")) throw new Error("Evidence ID not linked to decision");
if (decision.sourceFileName !== "wall-base-moisture.jpg") throw new Error("sourceFileName not propagated");
if (decision.sourceFileReference !== "local://evidence/wall-base-moisture.jpg") throw new Error("sourceFileReference not propagated");
if (decision.sourceCaptureMethod !== "field-photo") throw new Error("sourceCaptureMethod not propagated");
if (decision.sourceLocationLabel !== "Bedroom wall base") throw new Error("sourceLocationLabel not propagated");
if (decision.sourceInspectionArea !== "Interior / Wall base") throw new Error("sourceInspectionArea not propagated");
if (decision.sourceMeasurementValue !== 22.4) throw new Error("sourceMeasurementValue not propagated");
if (decision.sourceMeasurementUnit !== "% WME") throw new Error("sourceMeasurementUnit not propagated");
if (decision.sourceReviewStatus !== "Needs review") throw new Error("sourceReviewStatus not propagated");
if (decision.sourceExpertReviewRequired !== true) throw new Error("sourceExpertReviewRequired not propagated");
if (!decision.description.includes("Evidence metadata trace:")) throw new Error("Metadata trace missing in decision description");

console.log("Recommendation to decision metadata trace tests passed.");
