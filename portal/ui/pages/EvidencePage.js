import WorkspaceController from "../../controllers/WorkspaceController.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import FindingManager from "../../core/FindingManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import WorkspaceActionGovernanceManager from "../../core/WorkspaceActionGovernanceManager.js";
import LanguageManager from "../../core/LanguageManager.js";
import SectionHeader from "../components/SectionHeader.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import WorkflowProgressPanel from "../components/WorkflowProgressPanel.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import ReviewAuditTrailFields from "../components/ReviewAuditTrailFields.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";
import FormDialog from "../components/FormDialog.js";

export default class EvidencePage {

    static flowSteps = [
        {
            key: "evidence",
            label: LanguageManager.t("NavEvidence"),
            description: LanguageManager.t("EvidenceInspectionCaptured")
        },
        {
            key: "finding",
            label: "Finding",
            description: "Technical finding derived"
        }
    ];

    static statusLabels = {
        draft: LanguageManager.t("EvidenceStatusDraft"),
        open: LanguageManager.t("EvidenceStatusOpen"),
        captured: LanguageManager.t("EvidenceStatusCaptured"),
        linked: LanguageManager.t("EvidenceStatusLinked"),
        reviewed: LanguageManager.t("EvidenceStatusReviewed"),
        blocked: LanguageManager.t("EvidenceStatusBlocked")
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const activeEvidence = EvidenceManager.get();

        fragment.appendChild(this.createHeader(activeEvidence));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "evidence"));
        const evidenceOverview = document.createElement("section");
        evidenceOverview.className = "evidence-polish-stack";
        evidenceOverview.appendChild(this.createFlowIndicator(activeEvidence));
        evidenceOverview.appendChild(this.createNextActionPanel(activeEvidence));
        evidenceOverview.appendChild(this.createCompletionPanel(activeEvidence));

        fragment.appendChild(evidenceOverview);
        fragment.appendChild(this.createEvidenceIntelligenceSnapshot(activeEvidence));
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        this.scrollToRequestedTarget();

        return fragment;
    }

    static getEvidenceStatus(evidence = {}) {
        evidence = evidence || {};
        if (evidence.blocked || evidence.status === "blocked") {
            return "blocked";
        }

        if (evidence.reviewed || evidence.status === "reviewed") {
            return "reviewed";
        }

        if (
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding ||
            evidence.status === "linked"
        ) {
            return "linked";
        }

        if (
            evidence.captured ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl ||
            evidence.status === "captured"
        ) {
            return "captured";
        }

        return "draft";
    }

    static getNextAction(evidence = {}) {
        const status = this.getEvidenceStatus
            ? this.getEvidenceStatus(evidence)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This evidence cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: LanguageManager.t("EvidenceCreateConfirmFinding"),
                description: LanguageManager.t("EvidenceReadyForFinding"),
                tone: "ready"
            };
        }

        if (status === "linked") {
            return {
                label: LanguageManager.t("EvidenceReviewLinkedFindingAction"),
                description: "This evidence is already connected to a finding. Check completeness before assessment.",
                tone: "linked"
            };
        }

        if (status === "captured") {
            return {
                label: LanguageManager.t("EvidenceReviewEvidence"),
                description: "Captured evidence should be checked before it is linked to a finding.",
                tone: "active"
            };
        }

        return {
            label: "Capture evidence",
            description: "Add a photo, document, note or inspection reference to start the workflow.",
            tone: "draft"
        };
    }

    static getCompletionState(evidence = {}) {
        evidence = evidence || {};
        const hasTitle = Boolean(evidence.title || evidence.name);
        const hasType = Boolean(evidence.type || evidence.category);
        const hasSource = Boolean(
            evidence.source ||
            evidence.inspectionId ||
            evidence.buildingId ||
            evidence.caseId
        );
        const hasContent = Boolean(
            evidence.description ||
            evidence.note ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl
        );
        const hasFindingLink = Boolean(
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding
        );

        const checks = [
            {
                key: "identity",
                label: LanguageManager.t("EvidenceIdentified"),
                complete: hasTitle
            },
            {
                key: "classification",
                label: LanguageManager.t("EvidenceClassified"),
                complete: hasType
            },
            {
                key: "source",
                label: LanguageManager.t("EvidenceSourceLinked"),
                complete: hasSource
            },
            {
                key: "content",
                label: "Content captured",
                complete: hasContent
            },
            {
                key: "finding",
                label: "Finding connection",
                complete: hasFindingLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForFinding: hasTitle && hasType && hasContent,
            isComplete: completed === total
        };
    }

    static getFlowState(evidence = {}) {
        evidence = evidence || {};
        const hasFindingLink =
            Boolean(evidence.findingId) ||
            Boolean(evidence.linkedFindingId) ||
            Boolean(evidence.finding) ||
            Boolean(evidence.hasFinding);

        return {
            evidence: "active",
            finding: hasFindingLink ? "complete" : "next"
        };
    }

    static renderEvidenceStatusBadge(evidence = {}) {
        evidence = evidence || {};
        const status = this.getEvidenceStatus(evidence);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static renderCompletionPanel(evidence = {}) {
        evidence = evidence || {};
        const completion = this.getCompletionState(evidence);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForFinding
            ? "Ready for Finding"
            : "Needs more evidence data";

        return `
            <section class="completion-panel" aria-label="${LanguageManager.t("EvidenceCompletionLabel")}">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">Completion</span>
                        <strong>${readinessLabel}</strong>
                    </div>
                    <span class="completion-panel__score">${percent}%</span>
                </div>

                <div class="completion-panel__bar" aria-hidden="true">
                    <div class="completion-panel__bar-fill" style="width: ${percent}%"></div>
                </div>

                <div class="completion-panel__checks">
                    ${completion.checks.map((check) => `
                        <div class="completion-panel__check ${check.complete ? "is-complete" : "is-open"}">
                            <span class="completion-panel__check-marker"></span>
                            <span>${check.label}</span>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    static renderNextActionPanel(evidence = {}) {
        const action = this.getNextAction(evidence);

        return `
            <section class="next-action next-action--${action.tone}" aria-label="Next action">
                <div>
                    <span class="next-action__eyebrow">Next Action</span>
                    <strong>${action.label}</strong>
                    <p>${action.description}</p>
                </div>
            </section>
        `;
    }

    static renderActiveFlowIndicator(evidence = {}) {
        evidence = evidence || {};
        const flowState = this.getFlowState(evidence);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>${LanguageManager.t("EvidenceToFindingLabel")}</strong>
                </div>

                <div class="workspace-flow__steps">
                    ${this.flowSteps.map((step) => `
                        <div class="workspace-flow__step workspace-flow__step--${flowState[step.key]}">
                            <div class="workspace-flow__marker"></div>
                            <div>
                                <strong>${step.label}</strong>
                                <span>${step.description}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    static createFlowIndicator(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(evidence);
        return container;
    }

    static createNextActionPanel(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(evidence);
        return container;
    }

    static createCompletionPanel(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(evidence);
        return container;
    }

    static createHeader(activeEvidence = null) {
        const summary = WorkspaceController.getActiveCaseSummary();

        return SectionHeader.create({
            eyebrow: LanguageManager.t("EvidenceWorkspaceTitle"),
            title: LanguageManager.t("EvidenceCollectionTitle"),
            description: activeEvidence
                ? `${LanguageManager.t("EvidenceActivePrefix")}: ${activeEvidence.title || activeEvidence.id}`
                : `${summary.title} · Capture, classify, and prepare evidence for findings.`,
            actions: [
                {
                    id: "new-evidence",
                    label: LanguageManager.t("EvidenceNewAction"),
                    onClick: () => this.createSampleEvidence()
                }
            ]
        });
    }

    static createMetrics() {
        const evidenceItems = this.getEvidenceItems();
        const evidenceCount = evidenceItems.length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create(LanguageManager.t("EvidenceTotalMetric"), evidenceCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("EvidenceSelectedMetric"), EvidenceManager.get() ? "1" : "0"));
        grid.appendChild(MetricCard.create(LanguageManager.t("EvidenceLinkedFindingsMetric"), this.countFindingsLinkedToEvidence()));
        grid.appendChild(MetricCard.create(LanguageManager.t("EvidenceReviewStatusMetric"), LanguageManager.t("EvidenceStatusOpen")));

        return grid;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        const activeEvidence = EvidenceManager.get();
        const downstreamActionState = WorkspaceActionGovernanceManager.getActionState(activeEvidence || {}, {
            requireContent: true,
            blockedReason: LanguageManager.t("EvidenceBlockedActionReason"),
            contentRequiredReason: LanguageManager.t("EvidenceContentRequiredBeforeFindingReason")
        });
        const createFindingDisabled = !activeEvidence || !downstreamActionState.downstreamAllowed;

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("EvidenceRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-evidence",
                label: LanguageManager.t("EvidenceCloseAction"),
                onClick: () => {
                    EvidenceManager.clear();
                    this.refresh();
                }
            },
            {
                id: "upload-evidence",
                label: LanguageManager.t("EvidenceUploadAction"),
                onClick: () => this.createSampleEvidence()
            },
            {
                id: "create-finding",
                label: LanguageManager.t("EvidenceCreateFindingAction"),
                disabled: createFindingDisabled,
                title: createFindingDisabled ? downstreamActionState.reason : "",
                onClick: () => this.createFindingFromSelectedEvidence()
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const evidenceItems = this.getEvidenceItems();
        const activeEvidence = EvidenceManager.get();

        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(evidenceItems));
        layout.appendChild(this.createDetailPanel(activeEvidence, evidenceItems));

        return layout;
    }

    static createContent(evidenceItems = this.getEvidenceItems()) {
        if (!evidenceItems.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("EvidenceWorkspaceTitle"),
                title: LanguageManager.t("EvidenceEmptyTitle"),
                description: LanguageManager.t("EvidenceEmptyDescription"),
                actionLabel: LanguageManager.t("EvidenceNewAction"),
                onAction: () => this.createSampleEvidence()
            });
        }

        const list = document.createElement("section");
        list.id = "evidence-list";
        list.className = "workflow-card evidence-list";

        evidenceItems.forEach(item => {
            list.appendChild(this.createEvidenceRow(item));
        });

        return list;
    }

    static createEvidenceRow(item) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            EvidenceManager.set(item);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = item.title || item.name || item.id || LanguageManager.t("EvidenceItemFallback");

        const meta = document.createElement("span");
        meta.textContent = [
            item.evidenceType || item.type || LanguageManager.t("EvidenceDefaultType"),
            item.source || item.sourceType || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("div");
        statusContainer.innerHTML = this.renderEvidenceStatusBadge(item);
        const statusBadge = statusContainer.firstChild;

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusBadge);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        const actionState = WorkspaceActionGovernanceManager.getActionState(item);

        [
            ["open", LanguageManager.t("EvidenceOpenAction"), actionState.openAllowed],
            ["edit", LanguageManager.t("EvidenceEditAction"), actionState.editAllowed],
            ["delete", LanguageManager.t("EvidenceDeleteAction"), actionState.deleteAllowed]
        ].forEach(([action, label, isAllowed]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = isAllowed ? "button" : "button secondary";
            button.textContent = isAllowed ? label : `${label} · ${LanguageManager.t("EvidenceActionLockedLabel")}`;
            button.disabled = !isAllowed;
            button.title = isAllowed ? "" : actionState.reason;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (!isAllowed) {
                    Notification.warning(LanguageManager.t("EvidenceActionBlockedNotification"));
                    return;
                }

                if (action === "open") {
                    EvidenceManager.set(item);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    EvidenceManager.set(item);
                    this.editSelectedEvidence();
                    return;
                }

                if (action === "delete") {
                    this.deleteEvidence(item);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static normalizeEvidenceType(type = "Photo") {
        const value = String(type || "").toLowerCase();

        if (value.includes("document")) return "document";
        if (value.includes("note")) return "note";
        if (value.includes("measurement")) return "measurement";

        return "photo";
    }

    static parseOptionalNumber(value) {
        if (value === "" || value === null || value === undefined) {
            return null;
        }

        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : null;
    }

    static formatMeasurement(evidence = {}) {
        if (evidence.measurementValue === null || evidence.measurementValue === undefined || evidence.measurementValue === "") {
            return LanguageManager.t("EvidenceNone");
        }

        return `${evidence.measurementValue}${evidence.measurementUnit ? " " + evidence.measurementUnit : ""}`;
    }

    static deleteEvidence(item) {
        const actionState = WorkspaceActionGovernanceManager.getActionState(item);

        if (!actionState.deleteAllowed) {
            Notification.warning(LanguageManager.t("EvidenceDeleteBlockedNotification"));
            return;
        }

        if (!window.confirm(`${LanguageManager.t("EvidenceDeleteConfirmPrefix")} "${item.title || item.id}"?`)) {
            return;
        }

        EvidenceManager.delete(item.id);

        if (EvidenceManager.get()?.id === item.id) {
            EvidenceManager.clear();
        }

        Notification.success(LanguageManager.t("EvidenceDeletedNotification"));
        this.refresh();
    }

    static createDetailPanel(activeEvidence = EvidenceManager.get(), evidenceItems = this.getEvidenceItems()) {
        if (!activeEvidence) {
            return DetailPanel.create(LanguageManager.t("EvidenceContextTitle"), [
                { label: LanguageManager.t("EvidenceItemsLabel"), value: String(evidenceItems.length) },
                { label: LanguageManager.t("EvidenceSelectedLabel"), value: LanguageManager.t("EvidenceNotSelected") },
                { label: LanguageManager.t("EvidenceStatusLabel"), value: evidenceItems.length ? LanguageManager.t("EvidenceInReview") : LanguageManager.t("EvidenceNotStarted") },
                { label: LanguageManager.t("EvidenceWorkspaceStatusLabel"), value: "—" },
                { label: LanguageManager.t("EvidenceNextStepLabel"), value: LanguageManager.t("EvidenceCreateOrSelect") }
            ]);
        }

        const statusLabel = this.statusLabels[this.getEvidenceStatus(activeEvidence)] || "Draft";

        return DetailPanel.create(LanguageManager.t("EvidenceContextTitle"), [
            { label: LanguageManager.t("EvidenceSelectedLabel"), value: activeEvidence.title || activeEvidence.id },
            { label: LanguageManager.t("EvidenceWorkspaceStatusLabel"), value: statusLabel },
            { label: LanguageManager.t("EvidenceSafetyBoundariesLabel"), value: DetailPanel.createBoundaryBadges(activeEvidence) },
            { label: LanguageManager.t("EvidenceCaseIdLabel"), value: activeEvidence.caseId || LanguageManager.t("EvidenceNotLinked") },
            { label: LanguageManager.t("EvidenceBuildingIdLabel"), value: activeEvidence.buildingId || LanguageManager.t("EvidenceNotLinked") },
            { label: LanguageManager.t("EvidenceInspectionIdLabel"), value: activeEvidence.inspectionId || LanguageManager.t("EvidenceNotLinked") },
            { label: LanguageManager.t("EvidenceSourceLabel"), value: activeEvidence.source || activeEvidence.sourceType || LanguageManager.t("EvidenceManualEvidence") },
            { label: LanguageManager.t("EvidenceQuestionIdLabel"), value: activeEvidence.sourceQuestionId || LanguageManager.t("EvidenceNotLinked") },
            { label: LanguageManager.t("EvidenceQuestionLabel"), value: activeEvidence.sourceQuestion || LanguageManager.t("EvidenceNotLinked") },
            { label: LanguageManager.t("EvidenceRequiredEvidenceLabel"), value: (activeEvidence.sourceRequiredEvidence || []).join(", ") || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceFileNameField"), value: activeEvidence.fileName || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceFileTypeField"), value: activeEvidence.fileType || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceFileReferenceField"), value: activeEvidence.fileReference || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceCaptureMethodField"), value: activeEvidence.captureMethod || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceLocationLabelField"), value: activeEvidence.locationLabel || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceInspectionAreaField"), value: activeEvidence.inspectionArea || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceMeasurementField"), value: this.formatMeasurement(activeEvidence) },
            { label: LanguageManager.t("EvidenceReviewStatusField"), value: activeEvidence.reviewStatus || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceExpertReviewRequiredField"), value: activeEvidence.expertReviewRequired ? LanguageManager.t("EvidenceYes") : LanguageManager.t("EvidenceNo") },
            ...ReviewAuditTrailFields.create(activeEvidence),
            { label: LanguageManager.t("EvidenceScopeIdLabel"), value: activeEvidence.scopeId || LanguageManager.t("EvidenceNotLinked") },
            { label: LanguageManager.t("EvidenceFindingIdsLabel"), value: (activeEvidence.findingIds || []).join(", ") || LanguageManager.t("EvidenceNone") },
            { label: LanguageManager.t("EvidenceLinkedFindingsMetric"), value: String(this.countFindingsLinkedToEvidence(activeEvidence.id)) }
        ]);
    }

    static scrollToRequestedTarget() {
        if (sessionStorage.getItem("workspaceScrollTarget") !== "evidence-list") {
            return;
        }

        sessionStorage.removeItem("workspaceScrollTarget");

        window.setTimeout(() => {
            document.getElementById("evidence-list")?.scrollIntoView({
                block: "start",
                behavior: "smooth"
            });
        }, 80);
    }

    static getEvidenceItems() {
        const currentCase = CaseManager.getCurrent();

        return WorkspaceController.safeValue(
            () => currentCase
                ? EvidenceManager.getByCase(currentCase.id)
                : EvidenceManager.getAll(),
            []
        );
    }

    static countFindingsLinkedToEvidence(evidenceId = null) {
        const targetEvidenceId = evidenceId || EvidenceManager.get()?.id;

        if (!targetEvidenceId) {
            return 0;
        }

        const currentCase = CaseManager.getCurrent();
        const findings = currentCase
            ? FindingManager.getByCase(currentCase.id)
            : FindingManager.getAll();

        return findings
            .filter(finding => (finding.evidenceIds || []).includes(targetEvidenceId))
            .length;
    }

    static getActiveEvidenceForFlow() {
        return EvidenceManager.get() || {};
    }

    static createFindingFromSelectedEvidence() {
        const evidence = EvidenceManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!evidence) {
            Notification.warning(LanguageManager.t("EvidenceSelectFirstWarning"));
            return;
        }

        if (!evidence.caseId) {
            Notification.warning(LanguageManager.t("EvidenceNotLinkedCaseWarning"));
            return;
        }

        if (currentCase && currentCase.id !== evidence.caseId) {
            Notification.warning(LanguageManager.t("EvidenceBelongsOtherCaseWarning"));
            return;
        }

        const actionState = WorkspaceActionGovernanceManager.getActionState(evidence, {
            requireContent: true,
            blockedReason: LanguageManager.t("EvidenceBlockedActionReason"),
            contentRequiredReason: LanguageManager.t("EvidenceContentRequiredBeforeFindingReason")
        });

        if (!actionState.downstreamAllowed) {
            Notification.warning(LanguageManager.t("EvidenceDownstreamActionBlockedNotification"));
            return;
        }

        const isPattayaEvidence = String(evidence.sourceQuestionId || "").startsWith("TH-PATTAYA-");
        const isAvailabilityCheckOnly = evidence.sourcePolicy === "availability_check_only";

        const findingTitle = evidence.sourceQuestion
            ? `Finding Draft: ${evidence.sourceQuestion}`
            : `Finding Draft from ${evidence.title || evidence.id}`;

        const descriptionParts = [
            evidence.description || "Finding prepared from selected evidence.",
            "",
            "Finding status:",
            "Draft finding created from selected evidence.",
            "Expert review required before assessment, recommendation or decision use."
        ];

        if (isAvailabilityCheckOnly) {
            descriptionParts.push("");
            descriptionParts.push("Review boundary:");
            descriptionParts.push("Document availability only. No legal, financial, technical or governance document review has been performed.");
        }

        if (isPattayaEvidence) {
            descriptionParts.push("");
            descriptionParts.push("Thailand / Pattaya context:");
            descriptionParts.push("Field review context retained for downstream assessment.");
        }

        if (evidence.sourceQuestionId || evidence.sourceQuestion) {
            descriptionParts.push("");
            descriptionParts.push("Inspection scope trace:");
            descriptionParts.push(`${LanguageManager.t("FinalQuestionIdLabel")}: ${evidence.sourceQuestionId || LanguageManager.t("FinalNotLinked")}`);
            descriptionParts.push(`${LanguageManager.t("FinalQuestionLabel")}: ${evidence.sourceQuestion || LanguageManager.t("FinalNotLinked")}`);
            descriptionParts.push(`Required evidence: ${(evidence.sourceRequiredEvidence || []).join(", ") || "None"}`);
            descriptionParts.push(`Required evidence raw: ${evidence.sourceRequiredEvidenceRaw || "None"}`);
            descriptionParts.push(`Source policy: ${evidence.sourcePolicy || "None"}`);
            descriptionParts.push(`${LanguageManager.t("FinalScopeIdLabel")}: ${evidence.scopeId || LanguageManager.t("FinalNotLinked")}`);
        }

        const hasEvidenceMetadataTrace = Boolean(
            evidence.fileName ||
            evidence.fileType ||
            evidence.fileReference ||
            evidence.captureMethod ||
            evidence.locationLabel ||
            evidence.inspectionArea ||
            evidence.measurementValue !== null && evidence.measurementValue !== undefined ||
            evidence.measurementUnit ||
            evidence.reviewStatus
        );

        if (hasEvidenceMetadataTrace) {
            descriptionParts.push("");
            descriptionParts.push("Evidence metadata trace:");
            descriptionParts.push(`File name: ${evidence.fileName || "None"}`);
            descriptionParts.push(`File type: ${evidence.fileType || "None"}`);
            descriptionParts.push(`File reference: ${evidence.fileReference || "None"}`);
            descriptionParts.push(`Capture method: ${evidence.captureMethod || "None"}`);
            descriptionParts.push(`Location label: ${evidence.locationLabel || "None"}`);
            descriptionParts.push(`Inspection area: ${evidence.inspectionArea || "None"}`);
            descriptionParts.push(`Measurement: ${this.formatMeasurement(evidence)}`);
            descriptionParts.push(`Evidence review status: ${evidence.reviewStatus || "None"}`);
            descriptionParts.push(`Expert review required: ${evidence.expertReviewRequired === false ? "No" : "Yes"}`);
        }

        const finding = FindingManager.create({
            caseId: evidence.caseId,
            buildingId: evidence.buildingId || currentCase?.buildingId || null,
            inspectionId: evidence.inspectionId || currentCase?.inspectionId || null,

            evidenceIds: [evidence.id],
            sourceEvidenceIds: [evidence.id],

            title: findingTitle,
            description: descriptionParts.join("\n"),
            category: evidence.sourceCategory || evidence.category || evidence.evidenceType || evidence.type || "General",
            buildingSystem: evidence.sourceModule || evidence.buildingSystem || "",
            location: evidence.locationLabel || evidence.location || "",
            inspectionArea: evidence.inspectionArea || "",

            sourceFileName: evidence.fileName || "",
            sourceFileType: evidence.fileType || "",
            sourceFileReference: evidence.fileReference || "",
            sourceCaptureMethod: evidence.captureMethod || "",
            sourceLocationLabel: evidence.locationLabel || "",
            sourceInspectionArea: evidence.inspectionArea || "",
            sourceMeasurementValue: evidence.measurementValue ?? null,
            sourceMeasurementUnit: evidence.measurementUnit || "",
            sourceReviewStatus: evidence.reviewStatus || "",
            sourceExpertReviewRequired: evidence.expertReviewRequired !== undefined
                ? evidence.expertReviewRequired
                : true,

            severity: isAvailabilityCheckOnly ? "Unrated" : "Medium",
            priority: isAvailabilityCheckOnly ? "Medium" : "High",
            confidence: isAvailabilityCheckOnly ? 50 : 60,

            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,

            source: evidence.sourceType === "inspection-scope"
                ? "Inspection Scope Evidence"
                : "Evidence Review",

            sourceQuestionId: evidence.sourceQuestionId || "",
            sourceQuestion: evidence.sourceQuestion || "",
            sourceModule: evidence.sourceModule || "",
            sourceCategory: evidence.sourceCategory || "",
            sourcePolicy: evidence.sourcePolicy || "",
            sourceRequiredEvidenceRaw: evidence.sourceRequiredEvidenceRaw || "",

            profile: isPattayaEvidence ? "pattaya" : "",
            country: isPattayaEvidence ? "TH" : "",
            region: isPattayaEvidence ? "Pattaya / Chonburi" : "",

            createdBy: "System",
            updatedBy: "System"
        });

        FindingManager.set(finding);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                findingIds: [...new Set([...(activeCaseForSync.findingIds || []), finding.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedEvidence = EvidenceManager.update({
            ...evidence,
            findingIds: [...new Set([...(evidence.findingIds || []), finding.id])],
            linkedFindingId: finding.id,
            hasFinding: true,
            updatedAt: new Date().toISOString()
        });

        EvidenceManager.set(updatedEvidence);

        Notification.success(LanguageManager.t("EvidenceFindingDraftCreated"));
        window.location.hash = "findings";
    }

    static editSelectedEvidence() {

        const evidence = EvidenceManager.get();

        if (!evidence) {

            Notification.info(LanguageManager.t("EvidenceSelectBeforeEditing"));

            return;

        }

        const actionState = WorkspaceActionGovernanceManager.getActionState(evidence);

        if (!actionState.editAllowed) {

            Notification.warning(LanguageManager.t("EvidenceEditBlockedNotification"));

            return;

        }

        FormDialog.open({

            title: LanguageManager.t("EvidenceEditTitle"),

            submitLabel: LanguageManager.t("EvidenceSaveAction"),

            values: {

                title: evidence.title || "",

                description: evidence.description || "",

                evidenceType: evidence.evidenceType || evidence.type || "Photo",

                status: evidence.status || "Open",

                fileName: evidence.fileName || "",

                fileType: evidence.fileType || "",

                fileReference: evidence.fileReference || "",

                captureMethod: evidence.captureMethod || "manual",

                locationLabel: evidence.locationLabel || evidence.location || "",

                inspectionArea: evidence.inspectionArea || "",

                measurementValue: evidence.measurementValue ?? "",

                measurementUnit: evidence.measurementUnit || "",

                reviewStatus: evidence.reviewStatus || "Needs review"

            },

            fields: [

                {

                    id: "title",

                    label: LanguageManager.t("EvidenceTitleField")

                },

                {

                    id: "description",

                    label: LanguageManager.t("EvidenceDescriptionField")

                },

                {

                    id: "evidenceType",

                    label: LanguageManager.t("EvidenceTypeField"),

                    type: "select",

                    options: ["Photo", "Document", "Note", "Inspection Reference", "Other"]

                },

                {

                    id: "status",

                    label: LanguageManager.t("CaseStatusLabel"),

                    type: "select",

                    options: ["Open", "Captured", "Linked", "Reviewed", "Blocked"]

                },

                {

                    id: "fileName",

                    label: LanguageManager.t("EvidenceFileNameField")

                },

                {

                    id: "fileType",

                    label: LanguageManager.t("EvidenceFileTypeField"),

                    type: "select",

                    options: ["image", "document", "note", "measurement", "reference"]

                },

                {

                    id: "fileReference",

                    label: LanguageManager.t("EvidenceFileReferenceField")

                },

                {

                    id: "captureMethod",

                    label: LanguageManager.t("EvidenceCaptureMethodField"),

                    type: "select",

                    options: ["manual", "field-photo", "document-upload", "measurement-entry", "inspection-reference"]

                },

                {

                    id: "locationLabel",

                    label: LanguageManager.t("EvidenceLocationLabelField")

                },

                {

                    id: "inspectionArea",

                    label: LanguageManager.t("EvidenceInspectionAreaField")

                },

                {

                    id: "measurementValue",

                    label: LanguageManager.t("EvidenceMeasurementValueField"),

                    type: "number"

                },

                {

                    id: "measurementUnit",

                    label: LanguageManager.t("EvidenceMeasurementUnitField")

                },

                {

                    id: "reviewStatus",

                    label: LanguageManager.t("EvidenceReviewStatusField"),

                    type: "select",

                    options: ["Needs review", "In review", "Reviewed", "Requires expert check"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                const updated = EvidenceManager.update({

                    ...evidence,

                    title: values.title,

                    description: values.description || "",

                    evidenceType: values.evidenceType || "Photo",

                    type: this.normalizeEvidenceType(values.evidenceType || "Photo"),

                    status: values.status || "Open",

                    fileName: values.fileName || "",

                    fileType: values.fileType || "",

                    fileReference: values.fileReference || "",

                    captureMethod: values.captureMethod || "manual",

                    locationLabel: values.locationLabel || "",

                    inspectionArea: values.inspectionArea || "",

                    measurementValue: this.parseOptionalNumber(values.measurementValue),

                    measurementUnit: values.measurementUnit || "",

                    reviewStatus: values.reviewStatus || "Needs review",

                    expertReviewRequired: evidence.expertReviewRequired !== undefined
                        ? evidence.expertReviewRequired
                        : true,

                    updatedAt: new Date().toISOString()

                });

                EvidenceManager.set(updated);

                dialog.remove();

                Notification.success(LanguageManager.t("EvidenceUpdatedNotification"));

                this.refresh();

            }

        });

    }


    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleEvidence() {

        const currentCase = CaseManager.getCurrent();

        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();

        if (!currentCase) {

            Notification.info(LanguageManager.t("EvidenceOpenCaseFirst"));

            return;

        }

        FormDialog.open({

            title: LanguageManager.t("EvidenceNewTitle"),

            submitLabel: LanguageManager.t("EvidenceCreateAction"),

            values: {

                title: "",

                description: "",

                evidenceType: "Photo",

                status: "Open",

                fileName: "",

                fileType: "image",

                fileReference: "",

                captureMethod: "manual",

                locationLabel: "",

                inspectionArea: "",

                measurementValue: "",

                measurementUnit: "",

                reviewStatus: "Needs review"

            },

            fields: [

                {

                    id: "title",

                    label: LanguageManager.t("EvidenceTitleField")

                },

                {

                    id: "description",

                    label: LanguageManager.t("EvidenceDescriptionField")

                },

                {

                    id: "evidenceType",

                    label: LanguageManager.t("EvidenceTypeField"),

                    type: "select",

                    options: ["Photo", "Document", "Note", "Inspection Reference", "Other"]

                },

                {

                    id: "status",

                    label: LanguageManager.t("CaseStatusLabel"),

                    type: "select",

                    options: ["Open", "Captured", "Linked", "Reviewed", "Blocked"]

                },

                {

                    id: "fileName",

                    label: LanguageManager.t("EvidenceFileNameField")

                },

                {

                    id: "fileType",

                    label: LanguageManager.t("EvidenceFileTypeField"),

                    type: "select",

                    options: ["image", "document", "note", "measurement", "reference"]

                },

                {

                    id: "fileReference",

                    label: LanguageManager.t("EvidenceFileReferenceField")

                },

                {

                    id: "captureMethod",

                    label: LanguageManager.t("EvidenceCaptureMethodField"),

                    type: "select",

                    options: ["manual", "field-photo", "document-upload", "measurement-entry", "inspection-reference"]

                },

                {

                    id: "locationLabel",

                    label: LanguageManager.t("EvidenceLocationLabelField")

                },

                {

                    id: "inspectionArea",

                    label: LanguageManager.t("EvidenceInspectionAreaField")

                },

                {

                    id: "measurementValue",

                    label: LanguageManager.t("EvidenceMeasurementValueField"),

                    type: "number"

                },

                {

                    id: "measurementUnit",

                    label: LanguageManager.t("EvidenceMeasurementUnitField")

                },

                {

                    id: "reviewStatus",

                    label: LanguageManager.t("EvidenceReviewStatusField"),

                    type: "select",

                    options: ["Needs review", "In review", "Reviewed", "Requires expert check"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                const evidence = EvidenceManager.create({

                    caseId: currentCase.id,

                    buildingId: currentCase.buildingId || currentBuilding?.id || null,

                    inspectionId: currentCase.inspectionId || currentInspection?.id || null,

                    title: values.title,

                    description: values.description || "",

                    evidenceType: values.evidenceType || "Photo",

                    type: this.normalizeEvidenceType(values.evidenceType || "Photo"),

                    status: values.status || "Open",

                    fileName: values.fileName || "",

                    fileType: values.fileType || "",

                    fileReference: values.fileReference || "",

                    captureMethod: values.captureMethod || "manual",

                    locationLabel: values.locationLabel || "",

                    inspectionArea: values.inspectionArea || "",

                    measurementValue: this.parseOptionalNumber(values.measurementValue),

                    measurementUnit: values.measurementUnit || "",

                    reviewStatus: values.reviewStatus || "Needs review",

                    expertReviewRequired: true

                });

                EvidenceManager.set(evidence);

                dialog.remove();

                Notification.success(LanguageManager.t("EvidenceCreatedNotification"));

                this.refresh();

            }

        });

    }


    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} ${LanguageManager.t("EvidencePendingFeatureSuffix")}`);
    }

    static getEvidenceIntelligence(evidence = {}) {
        evidence = evidence || {};
        const hasIdentity = Boolean(evidence.title || evidence.name);
        const hasType = Boolean(evidence.type || evidence.category);
        const hasSource = Boolean(
            evidence.source ||
            evidence.inspectionId ||
            evidence.buildingId ||
            evidence.caseId
        );
        const hasContent = Boolean(
            evidence.description ||
            evidence.note ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl
        );
        const hasFindingLink = Boolean(
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding
        );
        const isReviewed = Boolean(evidence.reviewed || evidence.status === "reviewed");

        const checks = [
            hasIdentity,
            hasType,
            hasSource,
            hasContent,
            hasFindingLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals: hasContent ? 1 : 0,
            downstreamSignals: hasFindingLink ? 1 : 0,
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.7,
                primary: 10,
                downstream: 10,
                output: 10
            }
        });

        let qualitySignal = {
            label: LanguageManager.t("EvidenceLowQuality"),
            description: LanguageManager.t("EvidenceLowQualityDescription"),
            tone: "draft"
        };

        if (hasIdentity && hasType && hasSource && hasContent && hasFindingLink) {
            qualitySignal = {
                label: LanguageManager.t("EvidenceStrongQuality"),
                description: LanguageManager.t("EvidenceStrongQualityDescription"),
                tone: "ready"
            };
        } else if (hasIdentity && hasType && hasContent) {
            qualitySignal = {
                label: LanguageManager.t("EvidenceDevelopingQuality"),
                description: LanguageManager.t("EvidenceDevelopingQualityDescription"),
                tone: "active"
            };
        }

        const nextAction = hasFindingLink
            ? {
                label: LanguageManager.t("EvidenceReviewLinkedFindingAction"),
                description: LanguageManager.t("EvidenceReviewLinkedFindingDescription"),
                tone: "ready"
            }
            : hasContent
                ? {
                    label: LanguageManager.t("EvidenceCreateOrLinkFinding"),
                    description: LanguageManager.t("EvidenceCreateOrLinkFindingDescription"),
                    tone: "active"
                }
                : {
                    label: LanguageManager.t("EvidenceCaptureContent"),
                    description: LanguageManager.t("EvidenceCaptureContentDescription"),
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            qualitySignal,
            nextAction,
            label: readinessPercent >= 100
                ? LanguageManager.t("EvidenceIntelligenceComplete")
                : readinessPercent >= 50
                    ? LanguageManager.t("EvidenceIntelligenceDeveloping")
                    : LanguageManager.t("EvidenceIntelligenceEarly")
        };
    }

    static renderEvidenceIntelligenceSnapshot(evidence = {}) {
        evidence = evidence || {};
        const intelligence = this.getEvidenceIntelligence(evidence);

        return `
            <section class="evidence-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("EvidenceIntelligenceLabel")}">
                <div class="evidence-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="evidence-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("EvidenceIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} ${LanguageManager.t("EvidenceChecksCompleted")}</p>
                    </div>
                    <span class="evidence-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="evidence-intelligence__grid intelligence-snapshot__grid">
                    <article class="evidence-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("EvidenceFindingReadiness")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>${LanguageManager.t("EvidenceFindingReadinessDescription")}</p>
                    </article>

                    <article class="evidence-intelligence__card intelligence-snapshot__card evidence-intelligence__card--${intelligence.qualitySignal.tone} intelligence-snapshot__card--${intelligence.qualitySignal.tone}">
                        <span>${LanguageManager.t("EvidenceQualitySignalLabel")}</span>
                        <strong>${intelligence.qualitySignal.label}</strong>
                        <p>${intelligence.qualitySignal.description}</p>
                    </article>

                    <article class="evidence-intelligence__card intelligence-snapshot__card evidence-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("EvidenceNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createEvidenceIntelligenceSnapshot(evidence = EvidenceManager.get()) {
        if (!evidence || !evidence.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderEvidenceIntelligenceSnapshot(evidence);
        return container;
    }

}
