/**
 * MEIFERTS Building Intelligence
 * Evidence Requirement Preview Engine
 * Foundation 2.3-D.1
 *
 * Prepares sandbox-only evidence requirements after an answer state interaction.
 * Does not create evidence, findings, assessments or reports.
 */

export default class EvidenceRequirementPreviewEngine {

    static createPreview(answerState = {}, options = {}) {
        const lastInteraction = answerState.lastInteraction || {};
        const selectedAnswer = lastInteraction.selectedAnswer || {};
        const currentQuestion = this.resolveQuestion(answerState, lastInteraction);
        const answerValue = selectedAnswer.value || options.answerValue || "";

        const evidenceRequired = this.requiresEvidence(answerValue, currentQuestion);

        return {
            previewMode: "evidence_requirement_preview_read_only",
            sandboxId: answerState.sandboxId || options.sandboxId || "evidence-requirement-preview",
            sourceStateMode: answerState.stateMode || "unknown",
            answerValue,
            answerLabel: selectedAnswer.label || this.labelForAnswer(answerValue),
            question: {
                questionId: currentQuestion.questionId || lastInteraction.questionId || "",
                questionText: currentQuestion.questionText || lastInteraction.questionText || "",
                sectionTitle: currentQuestion.sectionTitle || "",
                moduleTitle: currentQuestion.moduleTitle || "",
                moduleNumber: currentQuestion.moduleNumber || ""
            },
            evidenceRequired,
            requiredInputs: evidenceRequired
                ? this.createRequiredInputs(currentQuestion, answerValue)
                : [],
            nextStep: evidenceRequired
                ? "Prepare evidence capture"
                : "Continue to next question",
            guidance: evidenceRequired
                ? this.createEvidenceGuidance(currentQuestion)
                : this.createNoEvidenceGuidance(answerValue),
            captureState: {
                prepared: evidenceRequired,
                persisted: false,
                previewOnly: true,
                evidenceCreated: false,
                findingCreated: false
            },
            safetyBoundary: this.createSafetyBoundary()
        };
    }

    static resolveQuestion(answerState = {}, lastInteraction = {}) {
        const questions = Array.isArray(answerState.questions)
            ? answerState.questions
            : [];

        const interactionQuestionId = lastInteraction.questionId;

        if (interactionQuestionId) {
            const matched = questions.find(question => question.questionId === interactionQuestionId);
            if (matched) {
                return matched;
            }
        }

        return answerState.currentQuestion || {};
    }

    static requiresEvidence(answerValue = "", question = {}) {
        if (answerValue !== "finding") {
            return false;
        }

        return question.evidenceRequiredIfFinding !== false;
    }

    static createRequiredInputs(question = {}, answerValue = "") {
        const inputs = [
            {
                type: "photo",
                label: "Photo",
                required: true,
                description: "Capture visible condition or relevant component."
            },
            {
                type: "comment",
                label: "Comment",
                required: true,
                description: "Describe the observed issue in expert language."
            }
        ];

        const text = [
            question.questionText || "",
            question.sectionTitle || "",
            question.moduleTitle || ""
        ].join(" ").toLowerCase();

        if (
            text.includes("feuchte")
            || text.includes("moisture")
            || text.includes("abdichtung")
            || text.includes("keller")
            || text.includes("waterproofing")
        ) {
            inputs.push({
                type: "moisture_indicator",
                label: "Moisture indicator",
                required: false,
                description: "Optional moisture reading, location note or measurement photo."
            });
        }

        return inputs;
    }

    static createEvidenceGuidance(question = {}) {
        const section = question.sectionTitle || "current inspection item";

        return {
            title: "Evidence required",
            primary: `Prepare photo and comment for ${section}.`,
            detail: "This is a sandbox-only capture preview. No evidence record has been created.",
            warning: "Finding preparation remains preview-only until persistence is explicitly enabled."
        };
    }

    static createNoEvidenceGuidance(answerValue = "") {
        return {
            title: "No evidence required",
            primary: answerValue === "later"
                ? "Question remains open for later review."
                : "Continue to the next question.",
            detail: "No evidence capture step is prepared for this answer.",
            warning: "No record has been created."
        };
    }

    static labelForAnswer(answerValue = "") {
        const labels = {
            ok: "OK",
            finding: "Auffällig",
            not_verifiable: "Nicht prüfbar",
            later: "Später"
        };

        return labels[answerValue] || "n/a";
    }

    static createSafetyBoundary() {
        return {
            sandboxOnly: true,
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
