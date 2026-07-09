/**
 * MEIFERTS Building Intelligence
 * Draft Workspace Manager
 * Foundation 2.4-A
 *
 * Purpose:
 * Convert sandbox preview outputs into controlled draft workspace records.
 *
 * Safety:
 * - no client report creation
 * - no export
 * - no workflow finalization
 * - no expert approval
 */

export default class DraftWorkspaceManager {

    static createDraftRecord(sourceDraft = {}, options = {}) {

        const draftType = this.resolveDraftType(sourceDraft);
        const sourceQuestion = sourceDraft.question || sourceDraft.sourceQuestion || {};
        const sourceId = options.sourceId || sourceQuestion.questionId || "unknown-source";

        const draftRecord = {
            draftMode: "workspace_draft_controlled",
            draftType,
            draftId: options.draftId || this.createDraftId(draftType, sourceId),
            sourceId,
            sourceDraftMode: sourceDraft.draftMode || sourceDraft.previewMode || "unknown",
            createdAt: options.createdAt || new Date().toISOString(),
            updatedAt: options.updatedAt || options.createdAt || new Date().toISOString(),
            status: "draft",
            expertReviewStatus: "not_reviewed",
            sourceQuestion,
            payload: this.createPayload(sourceDraft, draftType),
            permissions: {
                canEdit: true,
                canDiscard: true,
                canRestore: true,
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false,
                requiresExpertApproval: true
            },
            safetyBoundary: this.createSafetyBoundary()
        };

        return draftRecord;

    }

    static resolveDraftType(sourceDraft = {}) {

        const mode = sourceDraft.draftMode || sourceDraft.previewMode || "";

        if (mode.includes("evidence_capture")) {
            return "evidence_capture_draft";
        }

        if (mode.includes("finding_draft")) {
            return "finding_draft";
        }

        if (mode.includes("assessment_draft")) {
            return "assessment_draft";
        }

        if (mode.includes("recommendation_draft")) {
            return "recommendation_draft";
        }

        if (mode.includes("decision_draft")) {
            return "decision_draft";
        }

        if (mode.includes("report_draft")) {
            return "report_draft";
        }

        return "unknown_draft";

    }

    static createDraftId(draftType, sourceId) {

        const safeType = String(draftType || "draft").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
        const safeSource = String(sourceId || "source").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();

        return `${safeType}-${safeSource}`;

    }

    static createPayload(sourceDraft = {}, draftType = "unknown_draft") {

        if (draftType === "report_draft") {
            return {
                reportPrepared: Boolean(sourceDraft.reportPrepared),
                reportSection: sourceDraft.reportSection || null,
                report: sourceDraft.report || null,
                decision: sourceDraft.decision || null
            };
        }

        if (draftType === "decision_draft") {
            return {
                decisionPrepared: Boolean(sourceDraft.decisionPrepared),
                decisionRoute: sourceDraft.decisionRoute || null,
                decision: sourceDraft.decision || null
            };
        }

        if (draftType === "recommendation_draft") {
            return {
                recommendationPrepared: Boolean(sourceDraft.recommendationPrepared),
                recommendationTone: sourceDraft.recommendationTone || null,
                recommendation: sourceDraft.recommendation || null
            };
        }

        if (draftType === "assessment_draft") {
            return {
                assessmentPrepared: Boolean(sourceDraft.assessmentPrepared),
                riskLevel: sourceDraft.riskLevel || null,
                assessment: sourceDraft.assessment || null
            };
        }

        if (draftType === "finding_draft") {
            return {
                findingPrepared: Boolean(sourceDraft.findingPrepared),
                finding: sourceDraft.finding || null
            };
        }

        if (draftType === "evidence_capture_draft") {
            return {
                completion: sourceDraft.completion || null,
                evidence: sourceDraft.evidence || null
            };
        }

        return {
            raw: sourceDraft
        };

    }

    static createSafetyBoundary() {

        return {
            draftPersisted: false,
            clientDocumentCreated: false,
            reportExported: false,
            workflowFinalized: false,
            expertApprovalGranted: false
        };

    }

    static createRegistry(options = {}) {

        return {
            registryMode: "workspace_draft_registry_controlled",
            registryId: options.registryId || "draft-registry",
            createdAt: options.createdAt || new Date().toISOString(),
            updatedAt: options.updatedAt || options.createdAt || new Date().toISOString(),
            drafts: [],
            safetyBoundary: this.createRegistrySafetyBoundary()
        };

    }

    static addDraft(registry = {}, draftRecord = {}, options = {}) {

        const nextRegistry = this.cloneRegistry(registry);
        const existingIndex = nextRegistry.drafts.findIndex((draft) => draft.draftId === draftRecord.draftId);

        const nextDraft = {
            ...draftRecord,
            updatedAt: options.updatedAt || draftRecord.updatedAt || new Date().toISOString(),
            status: draftRecord.status || "draft"
        };

        if (existingIndex >= 0) {
            nextRegistry.drafts[existingIndex] = nextDraft;
        } else {
            nextRegistry.drafts.push(nextDraft);
        }

        nextRegistry.updatedAt = options.updatedAt || new Date().toISOString();

        return nextRegistry;

    }

    static getDraftById(registry = {}, draftId = "") {

        return (registry.drafts || []).find((draft) => draft.draftId === draftId) || null;

    }

    static listDrafts(registry = {}, filters = {}) {

        let drafts = [...(registry.drafts || [])];

        if (filters.status) {
            drafts = drafts.filter((draft) => draft.status === filters.status);
        }

        if (filters.draftType) {
            drafts = drafts.filter((draft) => draft.draftType === filters.draftType);
        }

        if (filters.sourceId) {
            drafts = drafts.filter((draft) => draft.sourceId === filters.sourceId);
        }

        return drafts;

    }

    static replaceDraft(registry = {}, draftId = "", replacementDraft = {}, options = {}) {

        const nextRegistry = this.cloneRegistry(registry);
        const existingIndex = nextRegistry.drafts.findIndex((draft) => draft.draftId === draftId);

        if (existingIndex < 0) {
            return nextRegistry;
        }

        nextRegistry.drafts[existingIndex] = {
            ...replacementDraft,
            draftId,
            updatedAt: options.updatedAt || new Date().toISOString()
        };

        nextRegistry.updatedAt = options.updatedAt || new Date().toISOString();

        return nextRegistry;

    }

    static discardDraft(registry = {}, draftId = "", options = {}) {

        const draft = this.getDraftById(registry, draftId);

        if (!draft) {
            return this.cloneRegistry(registry);
        }

        const discardedDraft = {
            ...draft,
            status: "discarded",
            updatedAt: options.updatedAt || new Date().toISOString()
        };

        return this.replaceDraft(registry, draftId, discardedDraft, options);

    }

    static restoreDraft(registry = {}, draftId = "", options = {}) {

        const draft = this.getDraftById(registry, draftId);

        if (!draft) {
            return this.cloneRegistry(registry);
        }

        const restoredDraft = {
            ...draft,
            status: "draft",
            updatedAt: options.updatedAt || new Date().toISOString()
        };

        return this.replaceDraft(registry, draftId, restoredDraft, options);

    }

    static cloneRegistry(registry = {}) {

        return {
            registryMode: registry.registryMode || "workspace_draft_registry_controlled",
            registryId: registry.registryId || "draft-registry",
            createdAt: registry.createdAt || new Date().toISOString(),
            updatedAt: registry.updatedAt || registry.createdAt || new Date().toISOString(),
            drafts: [...(registry.drafts || [])],
            safetyBoundary: registry.safetyBoundary || this.createRegistrySafetyBoundary()
        };

    }

    static createRegistrySafetyBoundary() {

        return {
            registryPersisted: false,
            clientDocumentCreated: false,
            reportExported: false,
            workflowFinalized: false,
            expertApprovalGranted: false
        };

    }

    static createExpertReview(draftRecord = {}, options = {}) {

        return {
            reviewMode: "expert_review_controlled",
            reviewId: options.reviewId || this.createReviewId(draftRecord),
            draftId: draftRecord.draftId || "unknown-draft",
            draftType: draftRecord.draftType || "unknown_draft",
            sourceId: draftRecord.sourceId || "unknown-source",
            createdAt: options.createdAt || new Date().toISOString(),
            updatedAt: options.updatedAt || options.createdAt || new Date().toISOString(),
            status: "review_required",
            reviewer: options.reviewer || null,
            notes: [],
            decision: null,
            permissions: {
                canAddNote: true,
                canApprove: true,
                canReject: true,
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: this.createExpertReviewSafetyBoundary()
        };

    }

    static createReviewId(draftRecord = {}) {

        const draftId = draftRecord.draftId || "unknown-draft";
        return `expert_review-${draftId}`;

    }

    static addExpertReviewNote(review = {}, note = {}, options = {}) {

        const nextReview = this.cloneExpertReview(review);

        const nextNote = {
            noteId: note.noteId || `review-note-${nextReview.notes.length + 1}`,
            text: note.text || "",
            author: note.author || options.author || "expert",
            createdAt: note.createdAt || options.createdAt || new Date().toISOString(),
            category: note.category || "general"
        };

        nextReview.notes.push(nextNote);
        nextReview.updatedAt = options.updatedAt || nextNote.createdAt;

        return nextReview;

    }

    static approveExpertReview(review = {}, decision = {}, options = {}) {

        const nextReview = this.cloneExpertReview(review);

        nextReview.status = "approved";
        nextReview.updatedAt = options.updatedAt || new Date().toISOString();
        nextReview.decision = {
            decisionType: "approved",
            comment: decision.comment || "Expert review approved.",
            decidedBy: decision.decidedBy || options.decidedBy || "expert",
            decidedAt: decision.decidedAt || nextReview.updatedAt
        };

        nextReview.safetyBoundary.expertApprovalGranted = true;
        nextReview.permissions.canExport = false;
        nextReview.permissions.canCreateClientDocument = false;
        nextReview.permissions.canFinalizeWorkflow = false;

        return nextReview;

    }

    static rejectExpertReview(review = {}, decision = {}, options = {}) {

        const nextReview = this.cloneExpertReview(review);

        nextReview.status = "rejected";
        nextReview.updatedAt = options.updatedAt || new Date().toISOString();
        nextReview.decision = {
            decisionType: "rejected",
            comment: decision.comment || "Expert review rejected.",
            decidedBy: decision.decidedBy || options.decidedBy || "expert",
            decidedAt: decision.decidedAt || nextReview.updatedAt
        };

        nextReview.safetyBoundary.expertApprovalGranted = false;
        nextReview.permissions.canExport = false;
        nextReview.permissions.canCreateClientDocument = false;
        nextReview.permissions.canFinalizeWorkflow = false;

        return nextReview;

    }

    static cloneExpertReview(review = {}) {

        return {
            reviewMode: review.reviewMode || "expert_review_controlled",
            reviewId: review.reviewId || "expert_review-unknown",
            draftId: review.draftId || "unknown-draft",
            draftType: review.draftType || "unknown_draft",
            sourceId: review.sourceId || "unknown-source",
            createdAt: review.createdAt || new Date().toISOString(),
            updatedAt: review.updatedAt || review.createdAt || new Date().toISOString(),
            status: review.status || "review_required",
            reviewer: review.reviewer || null,
            notes: [...(review.notes || [])],
            decision: review.decision || null,
            permissions: {
                canAddNote: review.permissions?.canAddNote ?? true,
                canApprove: review.permissions?.canApprove ?? true,
                canReject: review.permissions?.canReject ?? true,
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: {
                ...this.createExpertReviewSafetyBoundary(),
                ...(review.safetyBoundary || {})
            }
        };

    }

    static createFinalizationGate(review = {}, options = {}) {

        const createdAt = options.createdAt || new Date().toISOString();

        const isApprovedReview = review.status === "approved"
            && review.safetyBoundary?.expertApprovalGranted === true;

        return {
            gateId: this.createFinalizationGateId(review),
            gateType: "controlled_finalization_gate",
            sourceReviewId: review.reviewId || null,
            sourceDraftId: review.sourceDraftId || review.draftId || null,
            status: isApprovedReview
                ? "ready_for_internal_finalization_review"
                : "blocked_pending_expert_approval",
            createdAt,
            updatedAt: createdAt,
            readiness: {
                expertReviewApproved: isApprovedReview,
                internalFinalizationReviewRequired: true,
                exportPreparationAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: this.createFinalizationGateSafetyBoundary()
        };

    }

    static createFinalizationGateId(review = {}) {

        const sourceId = review.reviewId || review.sourceDraftId || review.draftId || "unknown-review";

        return `finalization_gate-${String(sourceId).replace(/^expert_review-/, "")}`;

    }

    static createFinalizationGateSafetyBoundary() {

        return {
            finalizationGatePersisted: false,
            internalFinalizationReviewCompleted: false,
            exportPrepared: false,
            reportExported: false,
            clientDocumentCreated: false,
            workflowFinalized: false
        };

    }

    static createExpertReviewSafetyBoundary() {

        return {
            reviewPersisted: false,
            expertApprovalGranted: false,
            clientDocumentCreated: false,
            reportExported: false,
            workflowFinalized: false
        };

    }

}
