/**
 * MEIFERTS Building Intelligence
 * Assessment Draft Preview Sandbox
 * Foundation 2.3-G.1
 *
 * Creates sandbox-only assessment draft previews from finding draft previews.
 * Does not persist assessments, findings, recommendations, decisions or reports.
 */

export default class AssessmentDraftPreviewSandbox {

    static createDraft(findingDraft = {}, options = {}) {
        const canPrepareAssessment = Boolean(findingDraft.findingPrepared && findingDraft.finding);

        return {
            draftMode: "assessment_draft_preview_sandbox_read_only",
            sandboxId: findingDraft.sandboxId || options.sandboxId || "assessment-draft-preview-sandbox",
            sourceDraftMode: findingDraft.draftMode || "unknown",
            canPrepareAssessment,
            assessmentPrepared: canPrepareAssessment,
            question: {
                questionId: findingDraft.question?.questionId || "",
                questionText: findingDraft.question?.questionText || "",
                sectionTitle: findingDraft.question?.sectionTitle || "",
                moduleTitle: findingDraft.question?.moduleTitle || "",
                moduleNumber: findingDraft.question?.moduleNumber || ""
            },
            finding: canPrepareAssessment
                ? this.createFindingSnapshot(findingDraft)
                : null,
            assessment: canPrepareAssessment
                ? this.createAssessmentPreview(findingDraft)
                : null,
            riskPreview: canPrepareAssessment
                ? this.createRiskPreview(findingDraft)
                : this.createNoRiskPreview(),
            reviewLogic: canPrepareAssessment
                ? this.createReviewLogic(findingDraft)
                : this.createNoReviewLogic(),
            guidance: canPrepareAssessment
                ? this.createAssessmentGuidance()
                : this.createNoAssessmentGuidance(findingDraft),
            assessmentState: {
                prepared: canPrepareAssessment,
                submitted: false,
                persisted: false,
                previewOnly: true,
                assessmentCreated: false,
                recommendationCreated: false,
                decisionCreated: false,
                reportCreated: false
            },
            safetyBoundary: this.createSafetyBoundary()
        };
    }

    static createFindingSnapshot(findingDraft = {}) {
        return {
            title: findingDraft.finding?.title || "",
            category: findingDraft.finding?.category || "",
            sourceQuestionId: findingDraft.finding?.sourceQuestionId || "",
            expertWording: findingDraft.finding?.expertWording || "",
            severityLevel: findingDraft.severityPreview?.level || "n/a",
            severityRationale: findingDraft.severityPreview?.rationale || "",
            evidenceReferenceCount: Array.isArray(findingDraft.finding?.evidenceReferences)
                ? findingDraft.finding.evidenceReferences.length
                : 0,
            persisted: false,
            previewOnly: true
        };
    }

    static createAssessmentPreview(findingDraft = {}) {
        const risk = this.createRiskPreview(findingDraft);
        const implication = this.createTechnicalImplication(findingDraft, risk);

        return {
            assessmentTitle: this.createAssessmentTitle(findingDraft),
            riskLevel: risk.level,
            technicalImplication: implication,
            recommendedReview: this.createRecommendedReview(findingDraft, risk),
            confidence: "preview",
            persisted: false,
            previewOnly: true
        };
    }

    static createAssessmentTitle(findingDraft = {}) {
        const title = findingDraft.finding?.title || "Finding";
        return `Assessment preview · ${title}`;
    }

    static createRiskPreview(findingDraft = {}) {
        const severityLevel = findingDraft.severityPreview?.level || "medium";
        const text = [
            findingDraft.finding?.title || "",
            findingDraft.finding?.expertWording || "",
            findingDraft.question?.moduleTitle || "",
            findingDraft.question?.sectionTitle || ""
        ].join(" ").toLowerCase();

        let level = severityLevel === "elevated" ? "elevated" : "moderate";
        let rationale = "Assessment requires expert confirmation before risk classification.";

        if (
            text.includes("feuchte")
            || text.includes("moisture")
            || text.includes("abdichtung")
            || text.includes("waterproofing")
            || text.includes("keller")
        ) {
            level = "elevated";
            rationale = "Moisture or waterproofing-related finding may affect durability, CAPEX exposure and acquisition risk.";
        }

        return {
            level,
            rationale,
            confidence: "preview",
            persisted: false,
            previewOnly: true
        };
    }

    static createNoRiskPreview() {
        return {
            level: "n/a",
            rationale: "Assessment draft not prepared.",
            confidence: "none",
            persisted: false,
            previewOnly: true
        };
    }

    static createTechnicalImplication(findingDraft = {}, risk = {}) {
        const moduleTitle = findingDraft.question?.moduleTitle || "building system";

        if (risk.level === "elevated") {
            return `Potential elevated impact on ${moduleTitle}, maintenance planning and transaction risk.`;
        }

        return `Potential technical implication for ${moduleTitle}; expert review required.`;
    }

    static createRecommendedReview(findingDraft = {}, risk = {}) {
        if (risk.level === "elevated") {
            return "Expert review recommended before acquisition decision or CAPEX assumption.";
        }

        return "Review during technical assessment before final recommendation.";
    }

    static createReviewLogic(findingDraft = {}) {
        return {
            inputs: [
                "Finding draft",
                "Evidence references",
                "Severity preview",
                "Expert wording"
            ],
            checks: [
                "Confirm evidence completeness",
                "Review severity rationale",
                "Assess technical implication",
                "Determine recommendation pathway"
            ],
            output: "Assessment preview only",
            persisted: false,
            previewOnly: true
        };
    }

    static createNoReviewLogic() {
        return {
            inputs: [],
            checks: [],
            output: "No assessment preview",
            persisted: false,
            previewOnly: true
        };
    }

    static createAssessmentGuidance() {
        return {
            title: "Assessment draft prepared",
            primary: "Review risk level, technical implication and review logic.",
            detail: "This is a sandbox-only assessment preview. No assessment record has been created.",
            warning: "Persistence is disabled until the assessment workflow is explicitly enabled."
        };
    }

    static createNoAssessmentGuidance() {
        return {
            title: "Assessment draft not ready",
            primary: "Prepare a finding draft before assessment preview.",
            detail: "The assessment preview remains unavailable until a finding draft is ready.",
            warning: "No record has been created."
        };
    }

    static createSafetyBoundary() {
        return {
            sandboxOnly: true,
            assessmentDraftPersisted: false,
            findingDraftPersisted: false,
            captureDraftPersisted: false,
            evidencePersisted: false,
            answerPersisted: false,
            inspectionCreated: false,
            evidenceCreated: false,
            findingCreated: false,
            assessmentCreated: false,
            recommendationCreated: false,
            decisionCreated: false,
            reportCreated: false
        };
    }
}
