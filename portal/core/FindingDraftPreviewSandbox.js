/**
 * MEIFERTS Building Intelligence
 * Finding Draft Preview Sandbox
 * Foundation 2.3-F.1
 *
 * Creates sandbox-only finding draft previews from completed evidence capture drafts.
 * Does not persist findings, evidence, assessments or reports.
 */

export default class FindingDraftPreviewSandbox {

    static createDraft(captureDraft = {}, options = {}) {
        const readyForReview = Boolean(captureDraft.completion?.readyForReview);
        const evidenceRequired = Boolean(captureDraft.evidenceRequired);
        const canPrepareFinding = evidenceRequired && readyForReview;

        return {
            draftMode: "finding_draft_preview_sandbox_read_only",
            sandboxId: captureDraft.sandboxId || options.sandboxId || "finding-draft-preview-sandbox",
            sourceDraftMode: captureDraft.draftMode || "unknown",
            canPrepareFinding,
            findingPrepared: canPrepareFinding,
            question: {
                questionId: captureDraft.question?.questionId || "",
                questionText: captureDraft.question?.questionText || "",
                sectionTitle: captureDraft.question?.sectionTitle || "",
                moduleTitle: captureDraft.question?.moduleTitle || "",
                moduleNumber: captureDraft.question?.moduleNumber || ""
            },
            answer: {
                value: captureDraft.answer?.value || "",
                label: captureDraft.answer?.label || ""
            },
            evidenceSummary: this.createEvidenceSummary(captureDraft),
            finding: canPrepareFinding
                ? this.createFindingPreview(captureDraft)
                : null,
            severityPreview: canPrepareFinding
                ? this.createSeverityPreview(captureDraft)
                : this.createNoSeverityPreview(),
            guidance: canPrepareFinding
                ? this.createFindingGuidance(captureDraft)
                : this.createNoFindingGuidance(captureDraft),
            findingState: {
                prepared: canPrepareFinding,
                submitted: false,
                persisted: false,
                previewOnly: true,
                findingCreated: false,
                assessmentCreated: false,
                reportCreated: false
            },
            safetyBoundary: this.createSafetyBoundary()
        };
    }

    static createEvidenceSummary(captureDraft = {}) {
        const fields = Array.isArray(captureDraft.fields)
            ? captureDraft.fields
            : [];

        return {
            fieldCount: fields.length,
            completedFieldCount: fields.filter(field => Boolean(field.filled)).length,
            requiredFields: captureDraft.completion?.requiredFields || 0,
            filledRequiredFields: captureDraft.completion?.filledRequiredFields || 0,
            readyForReview: Boolean(captureDraft.completion?.readyForReview),
            inputs: fields.map(field => ({
                type: field.type,
                label: field.label,
                required: Boolean(field.required),
                filled: Boolean(field.filled),
                persisted: false,
                previewOnly: true
            }))
        };
    }

    static createFindingPreview(captureDraft = {}) {
        const question = captureDraft.question || {};
        const fields = Array.isArray(captureDraft.fields)
            ? captureDraft.fields
            : [];

        const commentField = fields.find(field => field.type === "comment");
        const photoField = fields.find(field => field.type === "photo");
        const moistureField = fields.find(field => field.type === "moisture_indicator");

        return {
            title: this.createTitle(question),
            category: question.moduleTitle || "Inspection finding",
            sourceQuestionId: question.questionId || "",
            expertWording: this.createExpertWording(question, commentField, moistureField),
            evidenceReferences: [
                photoField?.filled ? "Photo draft available" : null,
                commentField?.filled ? "Comment draft available" : null,
                moistureField?.filled ? "Moisture note available" : null
            ].filter(Boolean),
            persisted: false,
            previewOnly: true
        };
    }

    static createTitle(question = {}) {
        const section = question.sectionTitle || question.moduleTitle || "Inspection item";
        return `Potential issue · ${section}`;
    }

    static createExpertWording(question = {}, commentField = {}, moistureField = {}) {
        const base = question.questionText
            ? `Observed condition related to: ${question.questionText}.`
            : "Observed condition requires expert review.";

        const comment = commentField?.value
            ? ` Draft comment: ${commentField.value}`
            : "";

        const moisture = moistureField?.value
            ? ` Moisture note: ${moistureField.value}`
            : "";

        return `${base}${comment}${moisture}`.trim();
    }

    static createSeverityPreview(captureDraft = {}) {
        const text = [
            captureDraft.question?.questionText || "",
            captureDraft.question?.sectionTitle || "",
            captureDraft.question?.moduleTitle || "",
            ...(Array.isArray(captureDraft.fields) ? captureDraft.fields.map(field => field.value || "") : [])
        ].join(" ").toLowerCase();

        let level = "medium";
        let rationale = "Issue requires expert review before classification.";

        if (
            text.includes("feuchte")
            || text.includes("moisture")
            || text.includes("abdichtung")
            || text.includes("waterproofing")
            || text.includes("keller")
        ) {
            level = "elevated";
            rationale = "Moisture or waterproofing-related signals may indicate increased building risk.";
        }

        return {
            level,
            rationale,
            confidence: "preview",
            persisted: false,
            previewOnly: true
        };
    }

    static createNoSeverityPreview() {
        return {
            level: "n/a",
            rationale: "Finding draft not prepared.",
            confidence: "none",
            persisted: false,
            previewOnly: true
        };
    }

    static createFindingGuidance() {
        return {
            title: "Finding draft prepared",
            primary: "Review issue title, severity preview and expert wording.",
            detail: "This is a sandbox-only finding draft. No finding record has been created.",
            warning: "Persistence is disabled until the finding workflow is explicitly enabled."
        };
    }

    static createNoFindingGuidance(captureDraft = {}) {
        return {
            title: "Finding draft not ready",
            primary: captureDraft.evidenceRequired
                ? "Complete required evidence fields before preparing a finding draft."
                : "No finding draft is required for this answer.",
            detail: "The finding preview remains unavailable until the capture draft is ready for review.",
            warning: "No record has been created."
        };
    }

    static createSafetyBoundary() {
        return {
            sandboxOnly: true,
            findingDraftPersisted: false,
            captureDraftPersisted: false,
            evidencePersisted: false,
            answerPersisted: false,
            inspectionCreated: false,
            evidenceCreated: false,
            findingCreated: false,
            assessmentCreated: false,
            reportCreated: false
        };
    }
}
