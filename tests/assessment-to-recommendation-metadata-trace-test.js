import AssessmentManager from "../portal/core/AssessmentManager.js";
import RecommendationManager from "../portal/core/RecommendationManager.js";
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

StorageManager.clear(AssessmentManager.collection);
StorageManager.clear(RecommendationManager.collection);

const assessment = AssessmentManager.create({
    caseId: "CASE-D2-1",
    buildingId: "BLD-D2-1",
    inspectionId: "INS-D2-1",
    findingIds: ["FND-D2-1"],
    evidenceIds: ["EVD-D2-1"],
    sourceFindingIds: ["FND-D2-1"],
    sourceEvidenceIds: ["EVD-D2-1"],
    title: "Assessment Draft from moisture finding",
    description: "Assessment with evidence metadata trace.",
    category: "Interior",
    buildingSystem: "Interior / Wall",
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
    severity: "Medium",
    probability: "Medium",
    consequence: "Medium",
    riskScore: 40,
    priority: "High",
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    confidence: 60
});

const recommendation = RecommendationManager.create({
    caseId: assessment.caseId,
    buildingId: assessment.buildingId,
    inspectionId: assessment.inspectionId,
    assessmentIds: [assessment.id],
    findingIds: assessment.findingIds || [],
    evidenceIds: assessment.evidenceIds || [],
    sourceAssessmentIds: [assessment.id],
    sourceFindingIds: assessment.sourceFindingIds || assessment.findingIds || [],
    sourceEvidenceIds: assessment.sourceEvidenceIds || assessment.evidenceIds || [],
    title: `Recommendation Draft: ${assessment.title}`,
    description: [
        assessment.description,
        "",
        "Evidence metadata trace:",
        `File name: ${assessment.sourceFileName}`,
        `File reference: ${assessment.sourceFileReference}`,
        `Measurement: ${assessment.sourceMeasurementValue} ${assessment.sourceMeasurementUnit}`,
        `Evidence review status: ${assessment.sourceReviewStatus}`
    ].join("\\n"),
    action: "Prepare expert review before decision support.",
    source: assessment.source || "Assessment Review",
    buildingSystem: assessment.buildingSystem || "",
    riskScore: assessment.riskScore || 0,
    sourceFileName: assessment.sourceFileName || "",
    sourceFileType: assessment.sourceFileType || "",
    sourceFileReference: assessment.sourceFileReference || "",
    sourceCaptureMethod: assessment.sourceCaptureMethod || "",
    sourceLocationLabel: assessment.sourceLocationLabel || "",
    sourceInspectionArea: assessment.sourceInspectionArea || "",
    sourceMeasurementValue: assessment.sourceMeasurementValue ?? null,
    sourceMeasurementUnit: assessment.sourceMeasurementUnit || "",
    sourceReviewStatus: assessment.sourceReviewStatus || "",
    sourceExpertReviewRequired: assessment.sourceExpertReviewRequired,
    priority: "High",
    timeframe: "Short Term",
    decisionImpact: "Medium",
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    noAutomaticDecision: true,
    confidence: 60
});

if (!recommendation.assessmentIds.includes(assessment.id)) throw new Error("Assessment ID not linked to recommendation");
if (!recommendation.evidenceIds.includes("EVD-D2-1")) throw new Error("Evidence ID not linked to recommendation");
if (recommendation.sourceFileName !== "wall-base-moisture.jpg") throw new Error("sourceFileName not propagated");
if (recommendation.sourceFileReference !== "local://evidence/wall-base-moisture.jpg") throw new Error("sourceFileReference not propagated");
if (recommendation.sourceCaptureMethod !== "field-photo") throw new Error("sourceCaptureMethod not propagated");
if (recommendation.sourceLocationLabel !== "Bedroom wall base") throw new Error("sourceLocationLabel not propagated");
if (recommendation.sourceInspectionArea !== "Interior / Wall base") throw new Error("sourceInspectionArea not propagated");
if (recommendation.sourceMeasurementValue !== 22.4) throw new Error("sourceMeasurementValue not propagated");
if (recommendation.sourceMeasurementUnit !== "% WME") throw new Error("sourceMeasurementUnit not propagated");
if (recommendation.sourceReviewStatus !== "Needs review") throw new Error("sourceReviewStatus not propagated");
if (recommendation.sourceExpertReviewRequired !== true) throw new Error("sourceExpertReviewRequired not propagated");
if (!recommendation.description.includes("Evidence metadata trace:")) throw new Error("Metadata trace missing in recommendation description");

console.log("Assessment to recommendation metadata trace tests passed.");
