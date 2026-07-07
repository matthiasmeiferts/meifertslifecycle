import EvidenceManager from "../portal/core/EvidenceManager.js";
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

const evidence = EvidenceManager.create({
    caseId: "CASE-1",
    buildingId: "BLD-1",
    inspectionId: "INS-1",
    type: "photo",
    title: "Moisture stain at ceiling",
    description: "Visible stain below bathroom area.",
    fileName: "ceiling-moisture.jpg",
    fileType: "image",
    fileSize: 245760,
    mimeType: "image/jpeg",
    fileReference: "local://evidence/ceiling-moisture.jpg",
    fileSource: "field-device",
    captureMethod: "field-photo",
    capturedAt: "2026-07-07T10:00:00.000Z",
    locationLabel: "Bathroom ceiling",
    buildingSystem: "Envelope",
    inspectionArea: "Interior / Wet area",
    measurementValue: 18.5,
    measurementUnit: "% WME",
    reviewStatus: "Needs review",
    expertReviewRequired: true,
    confidence: 72
});

if (!evidence.id) throw new Error("Evidence ID missing");
if (evidence.fileName !== "ceiling-moisture.jpg") throw new Error("fileName not stored");
if (evidence.fileType !== "image") throw new Error("fileType not stored");
if (evidence.fileSize !== 245760) throw new Error("fileSize not stored");
if (evidence.mimeType !== "image/jpeg") throw new Error("mimeType not stored");
if (evidence.fileReference !== "local://evidence/ceiling-moisture.jpg") throw new Error("fileReference not stored");
if (evidence.captureMethod !== "field-photo") throw new Error("captureMethod not stored");
if (evidence.locationLabel !== "Bathroom ceiling") throw new Error("locationLabel not stored");
if (evidence.inspectionArea !== "Interior / Wet area") throw new Error("inspectionArea not stored");
if (evidence.measurementValue !== 18.5) throw new Error("measurementValue not stored");
if (evidence.measurementUnit !== "% WME") throw new Error("measurementUnit not stored");
if (evidence.reviewStatus !== "Needs review") throw new Error("reviewStatus not stored");
if (evidence.expertReviewRequired !== true) throw new Error("expertReviewRequired not stored");

const validationErrors = EvidenceManager.validate({
    id: "TEST",
    caseId: "CASE-1",
    type: "photo",
    title: "Invalid file size",
    fileSize: -1
});

if (!validationErrors.includes("File size must be a positive number")) {
    throw new Error("fileSize validation did not trigger");
}

const measurementValidationErrors = EvidenceManager.validate({
    id: "TEST-2",
    caseId: "CASE-1",
    type: "measurement",
    title: "Invalid measurement",
    measurementValue: "18.5"
});

if (!measurementValidationErrors.includes("Measurement value must be a number")) {
    throw new Error("measurementValue validation did not trigger");
}

console.log("Evidence upload metadata model tests passed.");
