/**
 * MEIFERTS Building Intelligence
 * Evidence-to-Finding Draft Builder
 * Foundation 1.1-C.1
 *
 * Creates a non-persistent finding draft payload from selected evidence.
 * The builder performs traceable metadata translation only.
 * It does not create, persist, diagnose, classify or approve a finding.
 */

export default class EvidenceToFindingDraftBuilder {
    static build(evidence, options = {}) {
        if (!evidence || typeof evidence !== "object") {
            throw new Error(
                "EvidenceToFindingDraftBuilder: evidence object required"
            );
        }

        if (!evidence.id) {
            throw new Error(
                "EvidenceToFindingDraftBuilder: evidence id required"
            );
        }

        if (!evidence.caseId) {
            throw new Error(
                "EvidenceToFindingDraftBuilder: evidence caseId required"
            );
        }

        return {
            caseId: evidence.caseId,
            buildingId: evidence.buildingId || null,
            inspectionId: evidence.inspectionId || null,

            evidenceIds: [evidence.id],
            sourceEvidenceIds: [evidence.id],

            title:
                options.title
                || this.createDraftTitle(evidence),

            description:
                options.description
                || this.createDraftDescription(evidence),

            category:
                evidence.category
                || evidence.type
                || "General",

            buildingSystem:
                evidence.buildingSystem
                || "",

            location:
                evidence.locationLabel
                || evidence.location
                || "",

            sourceQuestionId:
                evidence.sourceQuestionId
                || "",

            sourceQuestion:
                evidence.sourceQuestion
                || "",

            sourceModule:
                evidence.sourceModule
                || "",

            sourceCategory:
                evidence.sourceCategory
                || "",

            sourcePolicy:
                evidence.sourcePolicy
                || "",

            sourceRequiredEvidenceRaw:
                evidence.sourceRequiredEvidenceRaw
                || "",

            sourceFileName:
                evidence.fileName
                || "",

            sourceFileType:
                evidence.fileType
                || "",

            sourceFileReference:
                evidence.fileReference
                || "",

            sourceCaptureMethod:
                evidence.captureMethod
                || "",

            sourceLocationLabel:
                evidence.locationLabel
                || "",

            sourceInspectionArea:
                evidence.inspectionArea
                || "",

            sourceMeasurementValue:
                evidence.measurementValue
                ?? null,

            sourceMeasurementUnit:
                evidence.measurementUnit
                || "",

            sourceReviewStatus:
                evidence.reviewStatus
                || "",

            sourceExpertReviewRequired: true,

            severity: "Unrated",
            probability: "Unrated",
            urgency: "Unrated",
            priority: "Medium",

            confidence:
                typeof options.confidence === "number"
                    ? options.confidence
                    : null,

            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,
            source: "Evidence Review"
        };
    }

    static createDraftTitle(evidence = {}) {
        const title =
            typeof evidence.title === "string"
            && evidence.title.trim().length > 0
                ? evidence.title.trim()
                : "selected evidence";

        return `Finding Draft from ${title}`;
    }

    static createDraftDescription(evidence = {}) {
        const lines = [];

        if (
            typeof evidence.description === "string"
            && evidence.description.trim().length > 0
        ) {
            lines.push(evidence.description.trim());
            lines.push("");
        }

        lines.push("Evidence metadata trace:");
        lines.push(`Evidence ID: ${evidence.id || ""}`);
        lines.push(`File name: ${evidence.fileName || ""}`);
        lines.push(`File reference: ${evidence.fileReference || ""}`);

        if (
            evidence.measurementValue !== undefined
            && evidence.measurementValue !== null
        ) {
            const measurementUnit =
                evidence.measurementUnit
                    ? ` ${evidence.measurementUnit}`
                    : "";

            lines.push(
                `Measurement: ${evidence.measurementValue}${measurementUnit}`
            );
        }

        lines.push(
            `Evidence review status: ${evidence.reviewStatus || ""}`
        );
        lines.push("");
        lines.push(
            "Draft only. The observed condition requires expert review and has not been confirmed as a diagnosis."
        );

        return lines.join("\n");
    }
}
