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

    static clonePlainObject(value = {}) {

        return {
            ...(value || {})
        };

    }



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

    static createInternalFinalizationReview(gate = {}, options = {}) {

        const createdAt = options.createdAt || new Date().toISOString();

        const isReadyGate = gate.status === "ready_for_internal_finalization_review"
            && gate.readiness?.expertReviewApproved === true;

        return {
            reviewId: this.createInternalFinalizationReviewId(gate),
            reviewType: "internal_finalization_review",
            sourceGateId: gate.gateId || null,
            sourceReviewId: gate.sourceReviewId || null,
            sourceDraftId: gate.sourceDraftId || null,
            status: isReadyGate
                ? "internal_review_required"
                : "blocked_pending_finalization_gate",
            reviewer: options.reviewer || null,
            notes: [],
            decision: null,
            createdAt,
            updatedAt: createdAt,
            readiness: {
                finalizationGateReady: isReadyGate,
                internalReviewCompleted: false,
                exportPreparationAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: this.createInternalFinalizationReviewSafetyBoundary()
        };

    }

    static createInternalFinalizationReviewId(gate = {}) {

        const sourceId = gate.gateId || gate.sourceReviewId || gate.sourceDraftId || "unknown-gate";

        return `internal_finalization_review-${String(sourceId).replace(/^finalization_gate-/, "")}`;

    }

    static addInternalFinalizationReviewNote(review = {}, note = {}, options = {}) {

        const nextReview = this.cloneInternalFinalizationReview(review);
        const createdAt = options.createdAt || new Date().toISOString();

        nextReview.notes.push({
            noteId: `internal_finalization_note-${nextReview.notes.length + 1}`,
            text: note.text || "",
            author: note.author || null,
            category: note.category || "internal-finalization",
            createdAt
        });

        nextReview.updatedAt = createdAt;

        return nextReview;

    }

    static approveInternalFinalizationReview(review = {}, decision = {}, options = {}) {

        const nextReview = this.cloneInternalFinalizationReview(review);
        const updatedAt = options.updatedAt || new Date().toISOString();

        nextReview.status = "internally_approved";
        nextReview.decision = {
            decisionType: "internally_approved",
            comment: decision.comment || "",
            decidedBy: decision.decidedBy || null,
            decidedAt: updatedAt
        };

        nextReview.readiness.internalReviewCompleted = true;
        nextReview.safetyBoundary.internalFinalizationReviewCompleted = true;
        nextReview.updatedAt = updatedAt;

        return nextReview;

    }

    static rejectInternalFinalizationReview(review = {}, decision = {}, options = {}) {

        const nextReview = this.cloneInternalFinalizationReview(review);
        const updatedAt = options.updatedAt || new Date().toISOString();

        nextReview.status = "internally_rejected";
        nextReview.decision = {
            decisionType: "internally_rejected",
            comment: decision.comment || "",
            decidedBy: decision.decidedBy || null,
            decidedAt: updatedAt
        };

        nextReview.readiness.internalReviewCompleted = false;
        nextReview.safetyBoundary.internalFinalizationReviewCompleted = false;
        nextReview.updatedAt = updatedAt;

        return nextReview;

    }

    static cloneInternalFinalizationReview(review = {}) {

        return {
            ...review,
            notes: Array.isArray(review.notes)
                ? review.notes.map(note => ({ ...note }))
                : [],
            decision: review.decision
                ? { ...review.decision }
                : null,
            readiness: {
                finalizationGateReady: false,
                internalReviewCompleted: false,
                exportPreparationAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false,
                ...(review.readiness || {})
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false,
                ...(review.permissions || {})
            },
            safetyBoundary: {
                ...this.createInternalFinalizationReviewSafetyBoundary(),
                ...(review.safetyBoundary || {})
            }
        };

    }

    static createExportPreparationGate(internalReview = {}, options = {}) {

        const createdAt = options.createdAt || new Date().toISOString();

        const isInternallyApproved = internalReview.status === "internally_approved"
            && internalReview.safetyBoundary?.internalFinalizationReviewCompleted === true;

        return {
            gateId: this.createExportPreparationGateId(internalReview),
            gateType: "export_preparation_gate",
            sourceInternalReviewId: internalReview.reviewId || null,
            sourceGateId: internalReview.sourceGateId || null,
            sourceReviewId: internalReview.sourceReviewId || null,
            sourceDraftId: internalReview.sourceDraftId || null,
            status: isInternallyApproved
                ? "export_preparation_review_required"
                : "blocked_pending_internal_finalization_review",
            createdAt,
            updatedAt: createdAt,
            readiness: {
                internalFinalizationReviewCompleted: isInternallyApproved,
                exportPreparationReviewRequired: true,
                exportPreparationAllowed: false,
                reportExportAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: this.createExportPreparationGateSafetyBoundary()
        };

    }

    static createExportPreparationGateId(internalReview = {}) {

        const sourceId = internalReview.reviewId || internalReview.sourceGateId || internalReview.sourceDraftId || "unknown-internal-review";

        return `export_preparation_gate-${String(sourceId).replace(/^internal_finalization_review-/, "")}`;

    }

    static createExportPreparationReview(exportPreparationGate = {}, options = {}) {

        const createdAt = options.createdAt || new Date().toISOString();

        const isGateReady = exportPreparationGate.status === "export_preparation_review_required"
            && exportPreparationGate.readiness?.internalFinalizationReviewCompleted === true;

        return {
            reviewId: this.createExportPreparationReviewId(exportPreparationGate),
            reviewType: "export_preparation_review",
            sourceExportPreparationGateId: exportPreparationGate.gateId || null,
            sourceInternalReviewId: exportPreparationGate.sourceInternalReviewId || null,
            sourceGateId: exportPreparationGate.sourceGateId || null,
            sourceReviewId: exportPreparationGate.sourceReviewId || null,
            sourceDraftId: exportPreparationGate.sourceDraftId || null,
            status: isGateReady
                ? "review_required"
                : "blocked_pending_export_preparation_gate",
            reviewer: options.reviewer || "Internal Export Preparation Reviewer",
            notes: [],
            decision: null,
            createdAt,
            updatedAt: createdAt,
            readiness: {
                exportPreparationGateReady: isGateReady,
                exportPreparationReviewCompleted: false,
                exportPreparationAllowed: false,
                reportExportAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: this.createExportPreparationReviewSafetyBoundary()
        };

    }

    static createExportPreparationReviewId(exportPreparationGate = {}) {

        const sourceId = exportPreparationGate.gateId || exportPreparationGate.sourceDraftId || "unknown-export-preparation-gate";

        return `export_preparation_review-${String(sourceId).replace(/^export_preparation_gate-/, "")}`;

    }

    static addExportPreparationReviewNote(exportPreparationReview = {}, note = {}, options = {}) {

        const createdAt = options.createdAt || new Date().toISOString();

        return {
            ...exportPreparationReview,
            notes: [
                ...(exportPreparationReview.notes || []),
                {
                    noteId: note.noteId || `export_preparation_note-${Date.now()}`,
                    text: note.text || "",
                    author: note.author || "Internal Export Preparation Reviewer",
                    category: note.category || "export-preparation",
                    createdAt
                }
            ],
            updatedAt: createdAt
        };

    }

    static approveExportPreparationReview(exportPreparationReview = {}, decision = {}, options = {}) {

        const updatedAt = options.updatedAt || new Date().toISOString();
        const hasNote = (exportPreparationReview.notes || []).length > 0;
        const canApprove = exportPreparationReview.status === "review_required" && hasNote;

        if (!canApprove) {
            return {
                ...exportPreparationReview,
                updatedAt
            };
        }

        return {
            ...exportPreparationReview,
            status: "approved",
            decision: {
                decisionType: "approved",
                comment: decision.comment || "",
                decidedBy: decision.decidedBy || "Internal Export Preparation Reviewer",
                decidedAt: updatedAt
            },
            readiness: {
                ...exportPreparationReview.readiness,
                exportPreparationReviewCompleted: true,
                exportPreparationAllowed: false,
                reportExportAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: {
                ...this.clonePlainObject(exportPreparationReview.safetyBoundary),
                exportPreparationReviewCompleted: true,
                exportPrepared: false,
                exportFileCreated: false,
                reportExported: false,
                clientDocumentCreated: false,
                workflowFinalized: false
            },
            updatedAt
        };

    }

    static rejectExportPreparationReview(exportPreparationReview = {}, decision = {}, options = {}) {

        const updatedAt = options.updatedAt || new Date().toISOString();
        const hasNote = (exportPreparationReview.notes || []).length > 0;
        const canReject = exportPreparationReview.status === "review_required" && hasNote;

        if (!canReject) {
            return {
                ...exportPreparationReview,
                updatedAt
            };
        }

        return {
            ...exportPreparationReview,
            status: "rejected",
            decision: {
                decisionType: "rejected",
                comment: decision.comment || "",
                decidedBy: decision.decidedBy || "Internal Export Preparation Reviewer",
                decidedAt: updatedAt
            },
            readiness: {
                ...exportPreparationReview.readiness,
                exportPreparationReviewCompleted: false,
                exportPreparationAllowed: false,
                reportExportAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: {
                ...this.clonePlainObject(exportPreparationReview.safetyBoundary),
                exportPreparationReviewCompleted: false,
                exportPrepared: false,
                exportFileCreated: false,
                reportExported: false,
                clientDocumentCreated: false,
                workflowFinalized: false
            },
            updatedAt
        };

    }

    static cloneExportPreparationReview(exportPreparationReview = {}) {

        return {
            ...exportPreparationReview,
            notes: (exportPreparationReview.notes || []).map((note) => ({
                ...note
            })),
            decision: exportPreparationReview.decision
                ? {
                    ...exportPreparationReview.decision
                }
                : null,
            readiness: this.clonePlainObject(exportPreparationReview.readiness),
            permissions: this.clonePlainObject(exportPreparationReview.permissions),
            safetyBoundary: this.clonePlainObject(exportPreparationReview.safetyBoundary)
        };

    }

    static createExportAuthorizationGate(exportPreparationReview = {}, options = {}) {

        const createdAt = options.createdAt || new Date().toISOString();

        const isReviewApproved = exportPreparationReview.status === "approved"
            && exportPreparationReview.readiness?.exportPreparationReviewCompleted === true
            && exportPreparationReview.safetyBoundary?.exportPreparationReviewCompleted === true;

        return {
            gateId: this.createExportAuthorizationGateId(exportPreparationReview),
            gateType: "export_authorization_gate",
            sourceExportPreparationReviewId: exportPreparationReview.reviewId || null,
            sourceExportPreparationGateId: exportPreparationReview.sourceExportPreparationGateId || null,
            sourceInternalReviewId: exportPreparationReview.sourceInternalReviewId || null,
            sourceGateId: exportPreparationReview.sourceGateId || null,
            sourceReviewId: exportPreparationReview.sourceReviewId || null,
            sourceDraftId: exportPreparationReview.sourceDraftId || null,
            status: isReviewApproved
                ? "export_authorization_required"
                : "blocked_pending_export_preparation_review",
            createdAt,
            updatedAt: createdAt,
            readiness: {
                exportPreparationReviewCompleted: isReviewApproved,
                exportAuthorizationRequired: true,
                exportAuthorizationGranted: false,
                exportAllowed: false,
                reportExportAllowed: false,
                clientDocumentPreparationAllowed: false,
                workflowFinalizationAllowed: false
            },
            permissions: {
                canExport: false,
                canCreateClientDocument: false,
                canFinalizeWorkflow: false
            },
            safetyBoundary: this.createExportAuthorizationGateSafetyBoundary()
        };

    }

    static createExportAuthorizationGateId(exportPreparationReview = {}) {

        const sourceId = exportPreparationReview.reviewId
            || exportPreparationReview.sourceExportPreparationGateId
            || exportPreparationReview.sourceDraftId
            || "unknown-export-preparation-review";

        return `export_authorization_gate-${String(sourceId).replace(/^export_preparation_review-/, "")}`;

    }

    static createExportPreparationReviewSafetyBoundary() {

        return {
            exportPreparationReviewPersisted: false,
            exportPreparationReviewCompleted: false,
            exportPrepared: false,
            exportFileCreated: false,
            reportExported: false,
            clientDocumentCreated: false,
            workflowFinalized: false
        };

    }

    static createExportAuthorizationGateSafetyBoundary() {

        return {
            exportAuthorizationGatePersisted: false,
            exportAuthorizationCompleted: false,
            exportPrepared: false,
            exportFileCreated: false,
            reportExported: false,
            clientDocumentCreated: false,
            workflowFinalized: false
        };

    }

    static createExportPreparationGateSafetyBoundary() {

        return {
            exportPreparationGatePersisted: false,
            exportPreparationReviewCompleted: false,
            exportPrepared: false,
            exportFileCreated: false,
            reportExported: false,
            clientDocumentCreated: false,
            workflowFinalized: false
        };

    }

    static createInternalFinalizationReviewSafetyBoundary() {

        return {
            internalFinalizationReviewPersisted: false,
            internalFinalizationReviewCompleted: false,
            exportPrepared: false,
            reportExported: false,
            clientDocumentCreated: false,
            workflowFinalized: false
        };

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
