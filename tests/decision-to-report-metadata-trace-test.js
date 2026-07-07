import DecisionManager from "../portal/core/DecisionManager.js";
import ReportManager from "../portal/core/ReportManager.js";
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

StorageManager.clear(DecisionManager.collection);
StorageManager.clear(ReportManager.collection);

const decision = DecisionManager.create({
    caseId: "CASE-D4-1",
    buildingId: "BLD-D4-1",
    inspectionId: "INS-D4-1",
    recommendationIds: ["REC-D4-1"],
    assessmentIds: ["ASM-D4-1"],
    findingIds: ["FND-D4-1"],
    evidenceIds: ["EVD-D4-1"],
    sourceRecommendationIds: ["REC-D4-1"],
    sourceAssessmentIds: ["ASM-D4-1"],
    sourceFindingIds: ["FND-D4-1"],
    sourceEvidenceIds: ["EVD-D4-1"],
    title: "Decision Draft from recommendation",
    description: "Decision with evidence metadata trace.",
    decisionType: "Monitor",
    rationale: "Decision support only.",
    source: "Recommendation Review",
    buildingSystem: "Interior / Wall",
    riskScore: 40,
    decisionImpact: "Medium",
    riskLevel: "Medium",
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
    confidence: 60,
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    noAutomaticDecision: true,
    decisionSupportOnly: true
});

const report = ReportManager.create({
    caseId: decision.caseId,
    buildingId: decision.buildingId,
    inspectionId: decision.inspectionId,
    decisionIds: [decision.id],
    recommendationIds: decision.recommendationIds || [],
    assessmentIds: decision.assessmentIds || [],
    findingIds: decision.findingIds || [],
    evidenceIds: decision.evidenceIds || [],
    sourceDecisionIds: [decision.id],
    sourceRecommendationIds: decision.sourceRecommendationIds || decision.recommendationIds || [],
    sourceAssessmentIds: decision.sourceAssessmentIds || decision.assessmentIds || [],
    sourceFindingIds: decision.sourceFindingIds || decision.findingIds || [],
    sourceEvidenceIds: decision.sourceEvidenceIds || decision.evidenceIds || [],
    title: "Building Intelligence Report",
    sourceTitle: decision.title,
    reportType: "Technical Due Diligence",
    version: "1.0.0",
    source: decision.source || "Decision Review",
    buildingSystem: decision.buildingSystem || "",
    riskScore: decision.riskScore || 0,
    decisionImpact: decision.decisionImpact || "",
    riskLevel: decision.riskLevel || "",
    sourceFileName: decision.sourceFileName || "",
    sourceFileType: decision.sourceFileType || "",
    sourceFileReference: decision.sourceFileReference || "",
    sourceCaptureMethod: decision.sourceCaptureMethod || "",
    sourceLocationLabel: decision.sourceLocationLabel || "",
    sourceInspectionArea: decision.sourceInspectionArea || "",
    sourceMeasurementValue: decision.sourceMeasurementValue ?? null,
    sourceMeasurementUnit: decision.sourceMeasurementUnit || "",
    sourceReviewStatus: decision.sourceReviewStatus || "",
    sourceExpertReviewRequired: decision.sourceExpertReviewRequired,
    executiveSummary: decision.description || "",
    scope: "Evidence-first report draft.",
    methodology: "Evidence-based workflow review.",
    status: "Draft"
});

if (!report.decisionIds.includes(decision.id)) throw new Error("Decision ID not linked to report");
if (!report.evidenceIds.includes("EVD-D4-1")) throw new Error("Evidence ID not linked to report");
if (report.sourceFileName !== "wall-base-moisture.jpg") throw new Error("sourceFileName not propagated");
if (report.sourceFileReference !== "local://evidence/wall-base-moisture.jpg") throw new Error("sourceFileReference not propagated");
if (report.sourceCaptureMethod !== "field-photo") throw new Error("sourceCaptureMethod not propagated");
if (report.sourceLocationLabel !== "Bedroom wall base") throw new Error("sourceLocationLabel not propagated");
if (report.sourceInspectionArea !== "Interior / Wall base") throw new Error("sourceInspectionArea not propagated");
if (report.sourceMeasurementValue !== 22.4) throw new Error("sourceMeasurementValue not propagated");
if (report.sourceMeasurementUnit !== "% WME") throw new Error("sourceMeasurementUnit not propagated");
if (report.sourceReviewStatus !== "Needs review") throw new Error("sourceReviewStatus not propagated");
if (report.sourceExpertReviewRequired !== true) throw new Error("sourceExpertReviewRequired not propagated");

console.log("Decision to report metadata trace tests passed.");
