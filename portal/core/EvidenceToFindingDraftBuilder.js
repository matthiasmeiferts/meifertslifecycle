/**
 * MEIFERTS Building Intelligence
 * Evidence-to-Finding Draft Builder
 * Foundation 1.1-C.1–C.3
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
                this.createGuardedDraftDescription(
                    evidence,
                    options.description
                ),

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

    static buildMany(evidenceItems, options = {}) {
        this.validateEvidenceCollection(evidenceItems);

        const evidenceIds =
            evidenceItems.map(
                evidence => evidence.id
            );

        const firstEvidence = evidenceItems[0];

        return {
            caseId: firstEvidence.caseId,
            buildingId: firstEvidence.buildingId || null,
            inspectionId: firstEvidence.inspectionId || null,

            evidenceIds: [...evidenceIds],
            sourceEvidenceIds: [...evidenceIds],

            title:
                options.title
                || `Finding Draft from ${evidenceItems.length} selected evidence items`,

            description:
                this.createGuardedMultiDraftDescription(
                    evidenceItems,
                    options.description
                ),

            category:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.category
                        || evidence.type
                        || "General",
                    "General"
                ),

            buildingSystem:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.buildingSystem
                        || "",
                    ""
                ),

            location:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.locationLabel
                        || evidence.location
                        || "",
                    ""
                ),

            sourceQuestionId:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.sourceQuestionId
                        || "",
                    ""
                ),

            sourceQuestion:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.sourceQuestion
                        || "",
                    ""
                ),

            sourceModule:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.sourceModule
                        || "",
                    ""
                ),

            sourceCategory:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.sourceCategory
                        || "",
                    ""
                ),

            sourcePolicy:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.sourcePolicy
                        || "",
                    ""
                ),

            sourceRequiredEvidenceRaw:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.sourceRequiredEvidenceRaw
                        || "",
                    ""
                ),

            sourceFileName: "",
            sourceFileType: "",
            sourceFileReference: "",
            sourceCaptureMethod: "",

            sourceLocationLabel:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.locationLabel
                        || "",
                    ""
                ),

            sourceInspectionArea:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.inspectionArea
                        || "",
                    ""
                ),

            sourceMeasurementValue: null,
            sourceMeasurementUnit: "",

            sourceReviewStatus:
                this.getSharedValue(
                    evidenceItems,
                    evidence =>
                        evidence.reviewStatus
                        || "",
                    ""
                ),

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

    static validateEvidenceCollection(evidenceItems) {
        if (!Array.isArray(evidenceItems)) {
            throw new Error(
                "EvidenceToFindingDraftBuilder: evidence array required"
            );
        }

        if (evidenceItems.length === 0) {
            throw new Error(
                "EvidenceToFindingDraftBuilder: at least one evidence item required"
            );
        }

        evidenceItems.forEach((evidence, index) => {
            if (!evidence || typeof evidence !== "object") {
                throw new Error(
                    `EvidenceToFindingDraftBuilder: evidence object required at index ${index}`
                );
            }

            if (!evidence.id) {
                throw new Error(
                    `EvidenceToFindingDraftBuilder: evidence id required at index ${index}`
                );
            }

            if (!evidence.caseId) {
                throw new Error(
                    `EvidenceToFindingDraftBuilder: evidence caseId required at index ${index}`
                );
            }
        });

        const firstEvidence = evidenceItems[0];

        evidenceItems.forEach((evidence, index) => {
            if (evidence.caseId !== firstEvidence.caseId) {
                throw new Error(
                    `EvidenceToFindingDraftBuilder: caseId mismatch at index ${index}`
                );
            }

            if (
                (evidence.buildingId || null)
                !== (firstEvidence.buildingId || null)
            ) {
                throw new Error(
                    `EvidenceToFindingDraftBuilder: buildingId mismatch at index ${index}`
                );
            }

            if (
                (evidence.inspectionId || null)
                !== (firstEvidence.inspectionId || null)
            ) {
                throw new Error(
                    `EvidenceToFindingDraftBuilder: inspectionId mismatch at index ${index}`
                );
            }
        });
    }

    static getSharedValue(
        evidenceItems,
        selector,
        fallback
    ) {
        const values =
            evidenceItems.map(selector);

        const firstValue = values[0];

        return values.every(
            value => value === firstValue
        )
            ? firstValue
            : fallback;
    }

    static createGuardedMultiDraftDescription(
        evidenceItems = [],
        customDescription
    ) {
        const safeguard =
            "Draft only. The observed conditions require expert review and have not been confirmed as a diagnosis.";

        if (
            typeof customDescription === "string"
            && customDescription.trim().length > 0
        ) {
            return [
                customDescription.trim(),
                "",
                this.createMultiEvidenceTrace(
                    evidenceItems
                ),
                "",
                safeguard
            ].join("\n");
        }

        return [
            this.createMultiEvidenceTrace(
                evidenceItems
            ),
            "",
            safeguard
        ].join("\n");
    }

    static createMultiEvidenceTrace(
        evidenceItems = []
    ) {
        const lines = [
            "Evidence metadata trace:"
        ];

        evidenceItems.forEach(
            (evidence, index) => {
                lines.push("");
                lines.push(
                    `Evidence ${index + 1}:`
                );
                lines.push(
                    `Evidence ID: ${evidence.id || ""}`
                );
                lines.push(
                    `Title: ${evidence.title || ""}`
                );
                lines.push(
                    `File name: ${evidence.fileName || ""}`
                );
                lines.push(
                    `File reference: ${evidence.fileReference || ""}`
                );

                if (
                    evidence.measurementValue !== undefined
                    && evidence.measurementValue !== null
                ) {
                    const unit =
                        evidence.measurementUnit
                            ? ` ${evidence.measurementUnit}`
                            : "";

                    lines.push(
                        `Measurement: ${evidence.measurementValue}${unit}`
                    );
                }

                lines.push(
                    `Evidence review status: ${evidence.reviewStatus || ""}`
                );
            }
        );

        return lines.join("\n");
    }

    static createDraftTitle(evidence = {}) {
        const title =
            typeof evidence.title === "string"
            && evidence.title.trim().length > 0
                ? evidence.title.trim()
                : "selected evidence";

        return `Finding Draft from ${title}`;
    }

    static createGuardedDraftDescription(
        evidence = {},
        customDescription
    ) {
        const safeguard =
            "Draft only. The observed condition requires expert review and has not been confirmed as a diagnosis.";

        if (
            typeof customDescription === "string"
            && customDescription.trim().length > 0
        ) {
            return [
                customDescription.trim(),
                "",
                safeguard
            ].join("\n");
        }

        return this.createDraftDescription(evidence);
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
