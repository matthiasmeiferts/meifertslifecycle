import EvidenceToFindingDraftBuilder
    from "../portal/core/EvidenceToFindingDraftBuilder.js";

const evidenceItems = [
    {
        id: "EVD-MULTI-1",
        caseId: "CASE-MULTI-1",
        buildingId: "BLD-MULTI-1",
        inspectionId: "INS-MULTI-1",
        type: "image",
        category: "Interior",
        title: "Visible staining",
        description: "Visible staining at wall base.",
        buildingSystem: "Interior / Wall",
        locationLabel: "Bedroom wall base",
        inspectionArea: "Interior / Wall base",
        fileName: "wall-staining.jpg",
        fileType: "image",
        fileReference: "local://evidence/wall-staining.jpg",
        captureMethod: "field-photo",
        reviewStatus: "Needs review",
        sourceModule: "Interior",
        sourceCategory: "Moisture"
    },
    {
        id: "EVD-MULTI-2",
        caseId: "CASE-MULTI-1",
        buildingId: "BLD-MULTI-1",
        inspectionId: "INS-MULTI-1",
        type: "measurement",
        category: "Interior",
        title: "Moisture measurement",
        description: "Elevated moisture reading.",
        buildingSystem: "Interior / Wall",
        locationLabel: "Bedroom wall base",
        inspectionArea: "Interior / Wall base",
        fileName: "wall-measurement.jpg",
        fileType: "image",
        fileReference: "local://evidence/wall-measurement.jpg",
        captureMethod: "field-photo",
        measurementValue: 22.4,
        measurementUnit: "% WME",
        reviewStatus: "Needs review",
        sourceModule: "Interior",
        sourceCategory: "Moisture"
    }
];

const originalEvidence =
    JSON.stringify(evidenceItems);

const draft =
    EvidenceToFindingDraftBuilder.buildMany(
        evidenceItems
    );

if (
    JSON.stringify(evidenceItems)
    !== originalEvidence
) {
    throw new Error(
        "Multiple-evidence builder mutated source evidence"
    );
}

if (
    draft.caseId !== "CASE-MULTI-1"
    || draft.buildingId !== "BLD-MULTI-1"
    || draft.inspectionId !== "INS-MULTI-1"
) {
    throw new Error(
        "Shared context IDs were not preserved"
    );
}

if (
    draft.evidenceIds.length !== 2
    || draft.sourceEvidenceIds.length !== 2
) {
    throw new Error(
        "Multiple evidence IDs were not preserved"
    );
}

if (
    draft.evidenceIds[0] !== "EVD-MULTI-1"
    || draft.evidenceIds[1] !== "EVD-MULTI-2"
) {
    throw new Error(
        "Evidence ID order was not preserved"
    );
}

if (
    draft.sourceEvidenceIds
    === draft.evidenceIds
) {
    throw new Error(
        "Evidence arrays must not share the same array reference"
    );
}

if (
    draft.category !== "Interior"
    || draft.buildingSystem !== "Interior / Wall"
    || draft.location !== "Bedroom wall base"
) {
    throw new Error(
        "Shared evidence metadata was not preserved"
    );
}

if (
    draft.sourceFileName !== ""
    || draft.sourceFileReference !== ""
    || draft.sourceMeasurementValue !== null
) {
    throw new Error(
        "Single-evidence metadata fields must not misrepresent multiple evidence items"
    );
}

if (
    !draft.description.includes(
        "Evidence 1:"
    )
    || !draft.description.includes(
        "Evidence ID: EVD-MULTI-1"
    )
    || !draft.description.includes(
        "Evidence 2:"
    )
    || !draft.description.includes(
        "Evidence ID: EVD-MULTI-2"
    )
    || !draft.description.includes(
        "Measurement: 22.4 % WME"
    )
) {
    throw new Error(
        "Multiple-evidence trace is incomplete"
    );
}

if (
    !draft.description.includes(
        "have not been confirmed as a diagnosis"
    )
) {
    throw new Error(
        "Multiple-evidence diagnostic safeguard missing"
    );
}

if (
    draft.status !== "Draft"
    || draft.reviewStatus !== "Draft"
    || draft.expertReviewRequired !== true
) {
    throw new Error(
        "Draft review boundary not enforced"
    );
}

if (
    draft.severity !== "Unrated"
    || draft.probability !== "Unrated"
    || draft.urgency !== "Unrated"
) {
    throw new Error(
        "Multiple evidence must not create an automatic classification"
    );
}

const customDraft =
    EvidenceToFindingDraftBuilder.buildMany(
        evidenceItems,
        {
            title: "Combined evidence review",
            description:
                "Two evidence items require combined expert assessment.",
            confidence: 45
        }
    );

if (
    customDraft.title
    !== "Combined evidence review"
) {
    throw new Error(
        "Custom multiple-evidence title not applied"
    );
}

if (
    !customDraft.description.startsWith(
        "Two evidence items require combined expert assessment."
    )
    || !customDraft.description.includes(
        "Evidence metadata trace:"
    )
    || !customDraft.description.includes(
        "have not been confirmed as a diagnosis"
    )
) {
    throw new Error(
        "Custom multiple-evidence description bypassed trace or safeguard"
    );
}

if (
    customDraft.confidence !== 45
) {
    throw new Error(
        "Custom multiple-evidence confidence not applied"
    );
}

const mixedCategoryDraft =
    EvidenceToFindingDraftBuilder.buildMany([
        evidenceItems[0],
        {
            ...evidenceItems[1],
            category: "Envelope",
            buildingSystem: "Facade",
            locationLabel: "External wall"
        }
    ]);

if (
    mixedCategoryDraft.category !== "General"
    || mixedCategoryDraft.buildingSystem !== ""
    || mixedCategoryDraft.location !== ""
) {
    throw new Error(
        "Conflicting metadata must not be presented as shared metadata"
    );
}

let arrayRequiredError = false;

try {
    EvidenceToFindingDraftBuilder.buildMany(
        {}
    );
} catch (error) {
    arrayRequiredError =
        error.message.includes(
            "evidence array required"
        );
}

if (!arrayRequiredError) {
    throw new Error(
        "Non-array evidence collection was not rejected"
    );
}

let emptyArrayError = false;

try {
    EvidenceToFindingDraftBuilder.buildMany(
        []
    );
} catch (error) {
    emptyArrayError =
        error.message.includes(
            "at least one evidence item required"
        );
}

if (!emptyArrayError) {
    throw new Error(
        "Empty evidence collection was not rejected"
    );
}

let caseMismatchError = false;

try {
    EvidenceToFindingDraftBuilder.buildMany([
        evidenceItems[0],
        {
            ...evidenceItems[1],
            caseId: "CASE-OTHER"
        }
    ]);
} catch (error) {
    caseMismatchError =
        error.message.includes(
            "caseId mismatch"
        );
}

if (!caseMismatchError) {
    throw new Error(
        "Cross-case evidence collection was not rejected"
    );
}

let buildingMismatchError = false;

try {
    EvidenceToFindingDraftBuilder.buildMany([
        evidenceItems[0],
        {
            ...evidenceItems[1],
            buildingId: "BLD-OTHER"
        }
    ]);
} catch (error) {
    buildingMismatchError =
        error.message.includes(
            "buildingId mismatch"
        );
}

if (!buildingMismatchError) {
    throw new Error(
        "Cross-building evidence collection was not rejected"
    );
}

let inspectionMismatchError = false;

try {
    EvidenceToFindingDraftBuilder.buildMany([
        evidenceItems[0],
        {
            ...evidenceItems[1],
            inspectionId: "INS-OTHER"
        }
    ]);
} catch (error) {
    inspectionMismatchError =
        error.message.includes(
            "inspectionId mismatch"
        );
}

if (!inspectionMismatchError) {
    throw new Error(
        "Cross-inspection evidence collection was not rejected"
    );
}

console.log(
    "Evidence-to-finding multiple evidence tests passed."
);
