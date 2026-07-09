/**
 * MEIFERTS Building Intelligence
 * Evidence Capture Draft Sandbox
 * Foundation 2.3-E.1
 *
 * Creates sandbox-only evidence capture drafts from evidence requirement previews.
 * Does not persist evidence, create findings, assessments or reports.
 */

export default class EvidenceCaptureDraftSandbox {

    static createDraft(evidencePreview = {}, options = {}) {
        const requiredInputs = Array.isArray(evidencePreview.requiredInputs)
            ? evidencePreview.requiredInputs
            : [];

        const evidenceRequired = Boolean(evidencePreview.evidenceRequired);

        return {
            draftMode: "evidence_capture_draft_sandbox_read_only",
            sandboxId: evidencePreview.sandboxId || options.sandboxId || "evidence-capture-draft-sandbox",
            sourcePreviewMode: evidencePreview.previewMode || "unknown",
            evidenceRequired,
            question: {
                questionId: evidencePreview.question?.questionId || "",
                questionText: evidencePreview.question?.questionText || "",
                sectionTitle: evidencePreview.question?.sectionTitle || "",
                moduleTitle: evidencePreview.question?.moduleTitle || "",
                moduleNumber: evidencePreview.question?.moduleNumber || ""
            },
            answer: {
                value: evidencePreview.answerValue || "",
                label: evidencePreview.answerLabel || ""
            },
            fields: evidenceRequired
                ? this.createDraftFields(requiredInputs, options)
                : [],
            completion: this.createCompletion(requiredInputs, {}),
            captureGuidance: evidenceRequired
                ? this.createCaptureGuidance(evidencePreview)
                : this.createNoCaptureGuidance(evidencePreview),
            captureState: {
                prepared: evidenceRequired,
                submitted: false,
                persisted: false,
                previewOnly: true,
                evidenceCreated: false,
                findingCreated: false
            },
            safetyBoundary: this.createSafetyBoundary()
        };
    }

    static updateDraft(draft = {}, fieldValues = {}, options = {}) {
        const fields = Array.isArray(draft.fields)
            ? draft.fields
            : [];

        const updatedFields = fields.map((field) => {
            const value = Object.prototype.hasOwnProperty.call(fieldValues, field.type)
                ? fieldValues[field.type]
                : field.value;

            return {
                ...field,
                value,
                filled: this.hasValue(value),
                persisted: false,
                previewOnly: true
            };
        });

        return {
            ...draft,
            draftMode: "evidence_capture_draft_sandbox_read_only",
            fields: updatedFields,
            completion: this.createCompletion(updatedFields, fieldValues),
            lastUpdatedAt: options.timestamp || new Date().toISOString(),
            captureState: {
                ...(draft.captureState || {}),
                submitted: false,
                persisted: false,
                previewOnly: true,
                evidenceCreated: false,
                findingCreated: false
            },
            safetyBoundary: this.createSafetyBoundary()
        };
    }

    static createDraftFields(requiredInputs = [], options = {}) {
        return requiredInputs.map((input) => {
            const placeholder = this.placeholderForInput(input);

            return {
                type: input.type,
                label: input.label,
                required: Boolean(input.required),
                description: input.description || "",
                placeholder,
                value: options.defaultValues?.[input.type] || "",
                filled: false,
                persisted: false,
                previewOnly: true
            };
        });
    }

    static createCompletion(fieldsOrInputs = [], values = {}) {
        const fields = Array.isArray(fieldsOrInputs)
            ? fieldsOrInputs
            : [];

        const requiredFields = fields.filter(field => Boolean(field.required));
        const filledRequiredFields = requiredFields.filter((field) => {
            const value = Object.prototype.hasOwnProperty.call(values, field.type)
                ? values[field.type]
                : field.value;

            return this.hasValue(value);
        });

        const totalRequired = requiredFields.length;
        const filledRequired = filledRequiredFields.length;
        const readyForReview = totalRequired > 0 && filledRequired === totalRequired;

        return {
            totalFields: fields.length,
            requiredFields: totalRequired,
            filledRequiredFields: filledRequired,
            missingRequiredFields: Math.max(totalRequired - filledRequired, 0),
            completionRate: totalRequired > 0
                ? Math.round((filledRequired / totalRequired) * 100)
                : 0,
            readyForReview,
            previewOnly: true
        };
    }

    static placeholderForInput(input = {}) {
        const placeholders = {
            photo: "Photo placeholder · no file uploaded",
            comment: "Draft expert comment · not saved",
            moisture_indicator: "Optional moisture reading / location note · not saved"
        };

        return placeholders[input.type] || "Draft value · not saved";
    }

    static createCaptureGuidance(evidencePreview = {}) {
        return {
            title: "Capture draft prepared",
            primary: "Add photo and comment in sandbox mode.",
            detail: "The draft can be completed for review, but no evidence record will be created.",
            warning: "Persistence is disabled. This remains a capture draft only."
        };
    }

    static createNoCaptureGuidance(evidencePreview = {}) {
        return {
            title: "No capture draft required",
            primary: "Continue inspection flow.",
            detail: "No evidence capture draft is prepared for this answer.",
            warning: "No record has been created."
        };
    }

    static hasValue(value) {
        return typeof value === "string"
            ? value.trim().length > 0
            : Boolean(value);
    }

    static createSafetyBoundary() {
        return {
            sandboxOnly: true,
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
