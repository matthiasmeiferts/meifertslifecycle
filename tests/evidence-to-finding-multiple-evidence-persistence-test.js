import EvidenceToFindingDraftBuilder
    from "../portal/core/EvidenceToFindingDraftBuilder.js";
import FindingManager
    from "../portal/core/FindingManager.js";
import StorageManager
    from "../portal/core/storage/StorageManager.js";

const memoryStorage = new Map();

global.localStorage = {
    getItem(key) {
        return memoryStorage.has(key)
            ? memoryStorage.get(key)
            : null;
    },

    setItem(key, value) {
        memoryStorage.set(
            key,
            String(value)
        );
    },

    removeItem(key) {
        memoryStorage.delete(key);
    },

    clear() {
        memoryStorage.clear();
    }
};

StorageManager.clear(
    FindingManager.collection
);

const evidenceItems = [
    {
        id: "EVD-PERSIST-MULTI-1",
        caseId: "CASE-PERSIST-MULTI-1",
        buildingId: "BLD-PERSIST-MULTI-1",
        inspectionId: "INS-PERSIST-MULTI-1",
        type: "image",
        category: "Interior",
        title: "Visible staining",
        description:
            "Visible staining at bedroom wall base.",
        buildingSystem: "Interior / Wall",
        locationLabel: "Bedroom wall base",
        inspectionArea: "Interior / Wall base",
        fileName: "visible-staining.jpg",
        fileType: "image",
        fileReference:
            "local://evidence/visible-staining.jpg",
        captureMethod: "field-photo",
        reviewStatus: "Needs review",
        sourceModule: "Interior",
        sourceCategory: "Moisture"
    },
    {
        id: "EVD-PERSIST-MULTI-2",
        caseId: "CASE-PERSIST-MULTI-1",
        buildingId: "BLD-PERSIST-MULTI-1",
        inspectionId: "INS-PERSIST-MULTI-1",
        type: "measurement",
        category: "Interior",
        title: "Moisture measurement",
        description:
            "Moisture reading recorded at bedroom wall base.",
        buildingSystem: "Interior / Wall",
        locationLabel: "Bedroom wall base",
        inspectionArea: "Interior / Wall base",
        fileName: "moisture-reading.jpg",
        fileType: "image",
        fileReference:
            "local://evidence/moisture-reading.jpg",
        captureMethod: "field-photo",
        measurementValue: 22.4,
        measurementUnit: "% WME",
        reviewStatus: "Needs review",
        sourceModule: "Interior",
        sourceCategory: "Moisture"
    }
];

const draftPayload =
    EvidenceToFindingDraftBuilder.buildMany(
        evidenceItems,
        {
            title:
                "Combined bedroom wall evidence review",
            description:
                "Two related evidence items require expert assessment.",
            confidence: 45
        }
    );

const createdFinding =
    FindingManager.create(
        draftPayload
    );

if (!createdFinding.id) {
    throw new Error(
        "Persisted multiple-evidence finding ID missing"
    );
}

const loadedFinding =
    FindingManager.load(
        createdFinding.id
    );

if (!loadedFinding) {
    throw new Error(
        "Persisted multiple-evidence finding could not be loaded"
    );
}

if (
    loadedFinding.caseId
        !== "CASE-PERSIST-MULTI-1"
    || loadedFinding.buildingId
        !== "BLD-PERSIST-MULTI-1"
    || loadedFinding.inspectionId
        !== "INS-PERSIST-MULTI-1"
) {
    throw new Error(
        "Persisted finding context IDs were not preserved"
    );
}

if (
    loadedFinding.evidenceIds.length !== 2
    || loadedFinding.sourceEvidenceIds.length !== 2
) {
    throw new Error(
        "Persisted finding evidence links are incomplete"
    );
}

if (
    loadedFinding.evidenceIds[0]
        !== "EVD-PERSIST-MULTI-1"
    || loadedFinding.evidenceIds[1]
        !== "EVD-PERSIST-MULTI-2"
    || loadedFinding.sourceEvidenceIds[0]
        !== "EVD-PERSIST-MULTI-1"
    || loadedFinding.sourceEvidenceIds[1]
        !== "EVD-PERSIST-MULTI-2"
) {
    throw new Error(
        "Persisted evidence ID order was not preserved"
    );
}

if (
    loadedFinding.title
        !== "Combined bedroom wall evidence review"
) {
    throw new Error(
        "Persisted multiple-evidence title was not preserved"
    );
}

if (
    !loadedFinding.description.startsWith(
        "Two related evidence items require expert assessment."
    )
    || !loadedFinding.description.includes(
        "Evidence ID: EVD-PERSIST-MULTI-1"
    )
    || !loadedFinding.description.includes(
        "Evidence ID: EVD-PERSIST-MULTI-2"
    )
    || !loadedFinding.description.includes(
        "Measurement: 22.4 % WME"
    )
) {
    throw new Error(
        "Persisted multiple-evidence trace is incomplete"
    );
}

if (
    !loadedFinding.description.includes(
        "have not been confirmed as a diagnosis"
    )
) {
    throw new Error(
        "Persisted diagnostic wording safeguard missing"
    );
}

if (
    loadedFinding.category !== "Interior"
    || loadedFinding.buildingSystem
        !== "Interior / Wall"
    || loadedFinding.location
        !== "Bedroom wall base"
) {
    throw new Error(
        "Persisted shared evidence metadata was not preserved"
    );
}

if (
    loadedFinding.sourceFileName !== ""
    || loadedFinding.sourceFileReference !== ""
    || loadedFinding.sourceMeasurementValue !== null
) {
    throw new Error(
        "Persisted finding misrepresents evidence-specific metadata as shared"
    );
}

if (
    loadedFinding.status !== "Draft"
    || loadedFinding.reviewStatus !== "Draft"
    || loadedFinding.expertReviewRequired !== true
    || loadedFinding.sourceExpertReviewRequired !== true
) {
    throw new Error(
        "Persisted review boundary was not preserved"
    );
}

if (
    loadedFinding.severity !== "Unrated"
    || loadedFinding.probability !== "Unrated"
    || loadedFinding.urgency !== "Unrated"
) {
    throw new Error(
        "Persisted finding received an automatic classification"
    );
}

if (
    loadedFinding.priority !== "Medium"
    || loadedFinding.confidence !== 45
    || loadedFinding.source
        !== "Evidence Review"
) {
    throw new Error(
        "Persisted draft control metadata was not preserved"
    );
}

const findingsForFirstEvidence =
    FindingManager.getByEvidence(
        "EVD-PERSIST-MULTI-1"
    );

const findingsForSecondEvidence =
    FindingManager.getByEvidence(
        "EVD-PERSIST-MULTI-2"
    );

if (
    findingsForFirstEvidence.length !== 1
    || findingsForFirstEvidence[0].id
        !== createdFinding.id
) {
    throw new Error(
        "Persisted finding could not be resolved from first evidence item"
    );
}

if (
    findingsForSecondEvidence.length !== 1
    || findingsForSecondEvidence[0].id
        !== createdFinding.id
) {
    throw new Error(
        "Persisted finding could not be resolved from second evidence item"
    );
}

if (
    FindingManager.countByCase(
        "CASE-PERSIST-MULTI-1"
    ) !== 1
) {
    throw new Error(
        "Persisted multiple-evidence finding case count incorrect"
    );
}

StorageManager.clear(
    FindingManager.collection
);

console.log(
    "Evidence-to-finding multiple evidence persistence tests passed."
);
