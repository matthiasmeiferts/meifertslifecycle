import EvidenceManager from "../portal/core/EvidenceManager.js";
import FindingManager from "../portal/core/FindingManager.js";
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

StorageManager.clear(EvidenceManager.collection);
StorageManager.clear(FindingManager.collection);

const evidence = EvidenceManager.create({
    caseId: "CASE-BRIDGE-1",
    buildingId: "BLD-BRIDGE-1",
    inspectionId: "INS-BRIDGE-1",
    type: "measurement",
    title: "Moisture measurement at wall base",
    description: "Elevated moisture reading at wall base.",
    fileName: "wall-base-moisture.jpg",
    fileType: "image",
    fileReference: "local://evidence/wall-base-moisture.jpg",
    captureMethod: "field-photo",
    locationLabel: "Bedroom wall base",
    inspectionArea: "Interior / Wall base",
    measurementValue: 22.4,
    measurementUnit: "% WME",
    reviewStatus: "Needs review",
    expertReviewRequired: true,
    confidence: 68
});

const finding = FindingManager.create({
    caseId: evidence.caseId,
    buildingId: evidence.buildingId,
    inspectionId: evidence.inspectionId,
    evidenceIds: [evidence.id],
    sourceEvidenceIds: [evidence.id],
    title: `Finding Draft from ${evidence.title}`,
    description: [
        evidence.description,
        "",
        "Evidence metadata trace:",
        `File name: ${evidence.fileName}`,
        `File reference: ${evidence.fileReference}`,
        `Measurement: ${evidence.measurementValue} ${evidence.measurementUnit}`,
        `Evidence review status: ${evidence.reviewStatus}`
    ].join("\\n"),
    category: evidence.category || evidence.type || "General",
    buildingSystem: evidence.buildingSystem || "",
    location: evidence.locationLabel || evidence.location || "",
    inspectionArea: evidence.inspectionArea || "",
    sourceFileName: evidence.fileName || "",
    sourceFileType: evidence.fileType || "",
    sourceFileReference: evidence.fileReference || "",
    sourceCaptureMethod: evidence.captureMethod || "",
    sourceLocationLabel: evidence.locationLabel || "",
    sourceInspectionArea: evidence.inspectionArea || "",
    sourceMeasurementValue: evidence.measurementValue ?? null,
    sourceMeasurementUnit: evidence.measurementUnit || "",
    sourceReviewStatus: evidence.reviewStatus || "",
    sourceExpertReviewRequired: evidence.expertReviewRequired,
    status: "Draft",
    reviewStatus: "Draft",
    expertReviewRequired: true,
    confidence: 60
});

if (!finding.evidenceIds.includes(evidence.id)) throw new Error("Evidence ID not linked to finding");
if (!finding.sourceEvidenceIds.includes(evidence.id)) throw new Error("Source evidence ID not linked to finding");
if (finding.sourceFileName !== "wall-base-moisture.jpg") throw new Error("sourceFileName not stored");
if (finding.sourceFileReference !== "local://evidence/wall-base-moisture.jpg") throw new Error("sourceFileReference not stored");
if (finding.sourceCaptureMethod !== "field-photo") throw new Error("sourceCaptureMethod not stored");
if (finding.sourceLocationLabel !== "Bedroom wall base") throw new Error("sourceLocationLabel not stored");
if (finding.sourceInspectionArea !== "Interior / Wall base") throw new Error("sourceInspectionArea not stored");
if (finding.sourceMeasurementValue !== 22.4) throw new Error("sourceMeasurementValue not stored");
if (finding.sourceMeasurementUnit !== "% WME") throw new Error("sourceMeasurementUnit not stored");
if (finding.sourceReviewStatus !== "Needs review") throw new Error("sourceReviewStatus not stored");
if (finding.sourceExpertReviewRequired !== true) throw new Error("sourceExpertReviewRequired not stored");
if (!finding.description.includes("Evidence metadata trace:")) throw new Error("Metadata trace missing in finding description");

console.log("Evidence to finding bridge metadata tests passed.");
