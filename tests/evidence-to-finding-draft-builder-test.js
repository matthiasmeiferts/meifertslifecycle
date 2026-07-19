import EvidenceToFindingDraftBuilder
    from "../portal/core/EvidenceToFindingDraftBuilder.js";

const evidence = {
    id: "EVD-BUILDER-1",
    caseId: "CASE-BUILDER-1",
    buildingId: "BLD-BUILDER-1",
    inspectionId: "INS-BUILDER-1",
    type: "measurement",
    category: "Interior",
    title: "Moisture measurement at wall base",
    description: "Elevated moisture reading at wall base.",
    buildingSystem: "Interior / Wall",
    location: "Bedroom",
    locationLabel: "Bedroom wall base",
    inspectionArea: "Interior / Wall base",
    fileName: "wall-base-moisture.jpg",
    fileType: "image",
    fileReference: "local://evidence/wall-base-moisture.jpg",
    captureMethod: "field-photo",
    measurementValue: 22.4,
    measurementUnit: "% WME",
    reviewStatus: "Needs review",
    expertReviewRequired: false,
    sourceQuestionId: "QUESTION-1",
    sourceQuestion: "Are moisture indicators visible?",
    sourceModule: "Interior",
    sourceCategory: "Moisture",
    sourcePolicy: "inspection-policy",
    sourceRequiredEvidenceRaw: "photo, measurement"
};

const originalEvidence = JSON.stringify(evidence);

const draft =
    EvidenceToFindingDraftBuilder.build(
        evidence
    );

if (
    JSON.stringify(evidence) !== originalEvidence
) {
    throw new Error(
        "Builder mutated source evidence"
    );
}

if (
    draft.caseId !== evidence.caseId
) {
    throw new Error(
        "caseId not preserved"
    );
}

if (
    draft.buildingId !== evidence.buildingId
) {
    throw new Error(
        "buildingId not preserved"
    );
}

if (
    draft.inspectionId !== evidence.inspectionId
) {
    throw new Error(
        "inspectionId not preserved"
    );
}

if (
    draft.evidenceIds.length !== 1
    || draft.evidenceIds[0] !== evidence.id
) {
    throw new Error(
        "evidenceIds not created correctly"
    );
}

if (
    draft.sourceEvidenceIds.length !== 1
    || draft.sourceEvidenceIds[0] !== evidence.id
) {
    throw new Error(
        "sourceEvidenceIds not created correctly"
    );
}

if (
    draft.sourceFileName
    !== evidence.fileName
) {
    throw new Error(
        "sourceFileName not preserved"
    );
}

if (
    draft.sourceFileReference
    !== evidence.fileReference
) {
    throw new Error(
        "sourceFileReference not preserved"
    );
}

if (
    draft.sourceMeasurementValue
    !== evidence.measurementValue
) {
    throw new Error(
        "sourceMeasurementValue not preserved"
    );
}

if (
    draft.sourceMeasurementUnit
    !== evidence.measurementUnit
) {
    throw new Error(
        "sourceMeasurementUnit not preserved"
    );
}

if (
    draft.sourceReviewStatus
    !== evidence.reviewStatus
) {
    throw new Error(
        "sourceReviewStatus not preserved"
    );
}

if (
    draft.status !== "Draft"
    || draft.reviewStatus !== "Draft"
) {
    throw new Error(
        "Draft workflow status not enforced"
    );
}

if (
    draft.severity !== "Unrated"
    || draft.probability !== "Unrated"
    || draft.urgency !== "Unrated"
) {
    throw new Error(
        "Unreviewed classification must remain Unrated"
    );
}

if (
    draft.expertReviewRequired !== true
    || draft.sourceExpertReviewRequired !== true
) {
    throw new Error(
        "Expert review boundary not enforced"
    );
}

if (
    !draft.description.includes(
        "Evidence metadata trace:"
    )
) {
    throw new Error(
        "Evidence metadata trace missing"
    );
}

if (
    !draft.description.includes(
        "has not been confirmed as a diagnosis"
    )
) {
    throw new Error(
        "Diagnostic wording safeguard missing"
    );
}

const customDraft =
    EvidenceToFindingDraftBuilder.build(
        evidence,
        {
            title: "Custom review draft",
            description: "Custom draft description.",
            confidence: 55
        }
    );

if (
    customDraft.title
    !== "Custom review draft"
) {
    throw new Error(
        "Custom title not applied"
    );
}

if (
    !customDraft.description.startsWith(
        "Custom draft description."
    )
) {
    throw new Error(
        "Custom description not applied"
    );
}

if (
    !customDraft.description.includes(
        "has not been confirmed as a diagnosis"
    )
) {
    throw new Error(
        "Custom description bypassed diagnostic wording safeguard"
    );
}

if (
    customDraft.confidence !== 55
) {
    throw new Error(
        "Custom confidence not applied"
    );
}

let missingEvidenceError = false;

try {
    EvidenceToFindingDraftBuilder.build();
} catch (error) {
    missingEvidenceError =
        error.message.includes(
            "evidence object required"
        );
}

if (!missingEvidenceError) {
    throw new Error(
        "Missing evidence object was not rejected"
    );
}

let missingIdError = false;

try {
    EvidenceToFindingDraftBuilder.build({
        caseId: "CASE-1"
    });
} catch (error) {
    missingIdError =
        error.message.includes(
            "evidence id required"
        );
}

if (!missingIdError) {
    throw new Error(
        "Missing evidence id was not rejected"
    );
}

let missingCaseError = false;

try {
    EvidenceToFindingDraftBuilder.build({
        id: "EVD-1"
    });
} catch (error) {
    missingCaseError =
        error.message.includes(
            "evidence caseId required"
        );
}

if (!missingCaseError) {
    throw new Error(
        "Missing evidence caseId was not rejected"
    );
}

console.log(
    "Evidence-to-finding draft builder tests passed."
);
