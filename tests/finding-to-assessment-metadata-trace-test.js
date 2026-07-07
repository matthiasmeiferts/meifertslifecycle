import FindingManager from "../portal/core/FindingManager.js";
import AssessmentManager from "../portal/core/AssessmentManager.js";
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

StorageManager.clear(FindingManager.collection);
StorageManager.clear(AssessmentManager.collection);

const finding = FindingManager.create({
    caseId: "CASE-TRACE-1",
    buildingId: "BLD-TRACE-1",
    inspectionId: "INS-TRACE-1",
    evidenceIds: ["EVD-TRACE-1"],
    sourceEvidenceIds: ["EVD-TRACE-1"],
    title: "Finding Draft from moisture evidence",
    description: "Finding with uploaded evidence metadata.",
    category: "Interior",
    buildingSystem: "Interior / Wall",
    location: "Bedroom wall base",
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
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    confidence: 60
});

const assessment = AssessmentManager.create({
    caseId: finding.caseId,
    buildingId: finding.buildingId,
    inspectionId: finding.inspectionId,
    findingIds: [finding.id],
    evidenceIds: finding.evidenceIds || [],
    sourceFindingIds: [finding.id],
    sourceEvidenceIds: finding.sourceEvidenceIds || finding.evidenceIds || [],
    title: `Assessment Draft: ${finding.title}`,
    description: [
        finding.description,
        "",
        "Evidence metadata trace:",
        `File name: ${finding.sourceFileName}`,
        `File reference: ${finding.sourceFileReference}`,
        `Measurement: ${finding.sourceMeasurementValue} ${finding.sourceMeasurementUnit}`,
        `Evidence review status: ${finding.sourceReviewStatus}`
    ].join("\\n"),
    category: finding.category || "General",
    buildingSystem: finding.buildingSystem || "",
    source: finding.source || "Finding Review",
    sourceFileName: finding.sourceFileName || "",
    sourceFileType: finding.sourceFileType || "",
    sourceFileReference: finding.sourceFileReference || "",
    sourceCaptureMethod: finding.sourceCaptureMethod || "",
    sourceLocationLabel: finding.sourceLocationLabel || "",
    sourceInspectionArea: finding.sourceInspectionArea || "",
    sourceMeasurementValue: finding.sourceMeasurementValue ?? null,
    sourceMeasurementUnit: finding.sourceMeasurementUnit || "",
    sourceReviewStatus: finding.sourceReviewStatus || "",
    sourceExpertReviewRequired: finding.sourceExpertReviewRequired,
    severity: "Medium",
    probability: "Medium",
    consequence: "Medium",
    riskScore: 40,
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    confidence: 60
});

if (!assessment.findingIds.includes(finding.id)) throw new Error("Finding ID not linked to assessment");
if (!assessment.evidenceIds.includes("EVD-TRACE-1")) throw new Error("Evidence ID not linked to assessment");
if (assessment.sourceFileName !== "wall-base-moisture.jpg") throw new Error("sourceFileName not propagated");
if (assessment.sourceFileReference !== "local://evidence/wall-base-moisture.jpg") throw new Error("sourceFileReference not propagated");
if (assessment.sourceCaptureMethod !== "field-photo") throw new Error("sourceCaptureMethod not propagated");
if (assessment.sourceLocationLabel !== "Bedroom wall base") throw new Error("sourceLocationLabel not propagated");
if (assessment.sourceInspectionArea !== "Interior / Wall base") throw new Error("sourceInspectionArea not propagated");
if (assessment.sourceMeasurementValue !== 22.4) throw new Error("sourceMeasurementValue not propagated");
if (assessment.sourceMeasurementUnit !== "% WME") throw new Error("sourceMeasurementUnit not propagated");
if (assessment.sourceReviewStatus !== "Needs review") throw new Error("sourceReviewStatus not propagated");
if (assessment.sourceExpertReviewRequired !== true) throw new Error("sourceExpertReviewRequired not propagated");
if (!assessment.description.includes("Evidence metadata trace:")) throw new Error("Metadata trace missing in assessment description");

console.log("Finding to assessment metadata trace tests passed.");
