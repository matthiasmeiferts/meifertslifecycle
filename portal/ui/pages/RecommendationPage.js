import RecommendationManager from "../../core/RecommendationManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import DecisionManager from "../../core/DecisionManager.js";
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

export default class RecommendationPage {

    static statusLabels = {
        draft: LanguageManager.t("RecommendationStatusDraft"),
        recommended: LanguageManager.t("RecommendationStatusRecommended"),
        decided: LanguageManager.t("RecommendationStatusDecided"),
        reviewed: LanguageManager.t("RecommendationStatusReviewed"),
        blocked: LanguageManager.t("RecommendationStatusBlocked")
    };

    static formatRecommendationValue(value) {
        const map = {
            Low: LanguageManager.t("AssessmentOptionLow"),
            Medium: LanguageManager.t("AssessmentOptionMedium"),
            High: LanguageManager.t("AssessmentOptionHigh"),
            Critical: LanguageManager.t("AssessmentOptionCritical"),
            Immediate: LanguageManager.t("RecommendationOptionImmediate"),
            "Short Term": LanguageManager.t("RecommendationOptionShortTerm"),
            "Medium Term": LanguageManager.t("RecommendationOptionMediumTerm"),
            "Long Term": LanguageManager.t("RecommendationOptionLongTerm"),
            Planned: LanguageManager.t("RecommendationOptionPlanned"),
            Draft: LanguageManager.t("RecommendationStatusDraft"),
            Recommended: LanguageManager.t("RecommendationStatusRecommended"),
            Decided: LanguageManager.t("RecommendationStatusDecided"),
            Reviewed: LanguageManager.t("RecommendationStatusReviewed"),
            Blocked: LanguageManager.t("RecommendationStatusBlocked")
        };

        return map[value] || value;
    }

    static render() {
        const fragment = document.createDocumentFragment();
        const recommendations = this.getRecommendations();
        const activeRecommendation = RecommendationManager.get();

        fragment.appendChild(this.createHeader());
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "recommendations"));
        fragment.appendChild(this.createMetrics(recommendations));
        fragment.appendChild(this.createFlowIndicator(activeRecommendation));
        fragment.appendChild(this.createNextActionPanel(activeRecommendation));
        fragment.appendChild(this.createCompletionPanel(activeRecommendation));

        if (activeRecommendation) {
            fragment.appendChild(this.createRecommendationIntelligenceSnapshot(activeRecommendation));
        }

        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(recommendations, activeRecommendation));

        return fragment;
    }

    static getFlowState(recommendation = {}) {
        recommendation = recommendation || {};

        const hasDecisionLink =
            Boolean(recommendation.decisionId) ||
            Boolean(recommendation.linkedDecisionId) ||
            Boolean(recommendation.decision) ||
            Boolean(recommendation.hasDecision) ||
            recommendation.status === "decided";

        return {
            recommendation: "active",
            decision: hasDecisionLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(recommendation = {}) {
        recommendation = recommendation || {};
        const flowState = this.getFlowState(recommendation);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">${LanguageManager.t("RecommendationActiveFlowLabel")}</span>
                    <strong>${LanguageManager.t("RecommendationToDecisionLabel")}</strong>
                </div>

                <div class="workspace-flow__steps">
                    <div class="workspace-flow__step workspace-flow__step--${flowState.recommendation}">
                        <span class="workspace-flow__dot"></span>
                        <div>
                            <strong>${LanguageManager.t("RecommendationWorkflowStepTitle")}</strong>
                            <p>${LanguageManager.t("RecommendationWorkflowActionRecommended")}</p>
                        </div>
                    </div>

                    <div class="workspace-flow__step workspace-flow__step--${flowState.decision}">
                        <span class="workspace-flow__dot"></span>
                        <div>
                            <strong>${LanguageManager.t("WorkflowStepDecision")}</strong>
                            <p>${LanguageManager.t("RecommendationWorkflowDecisionDerived")}</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createFlowIndicator(recommendation = {}) {
        const container = document.createElement("section");
        container.innerHTML = this.renderActiveFlowIndicator(recommendation);
        return container;
    }

    static createHeader() {
        return SectionHeader.create({
            eyebrow: LanguageManager.t("RecommendationWorkspaceTitle"),
            title: LanguageManager.t("RecommendationTitlePlural"),
            description: LanguageManager.t("RecommendationHeaderDescription"),
            actions: [
                {
                    id: "new-recommendation",
                    label: LanguageManager.t("RecommendationNewAction"),
                    onClick: () => this.createSampleRecommendation()
                }
            ]
        });
    }

    static createMetrics(recommendations = this.getRecommendations()) {
        const highPriorityCount = recommendations.filter(item => item.priority === "High" || item.priority === "Critical").length;
        const acceptedCount = recommendations.filter(item => item.status === "Accepted").length;
        const immediateCount = recommendations.filter(item => item.timeframe === "Immediate").length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create(LanguageManager.t("RecommendationTotalMetric"), recommendations.length));
        grid.appendChild(MetricCard.create(LanguageManager.t("RecommendationHighPriorityMetric"), highPriorityCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("RecommendationImmediateMetric"), immediateCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("RecommendationLinkedDecisionsMetric"), this.countDecisionsLinkedToRecommendation()));

        return grid;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        const activeRecommendation = RecommendationManager.get();
        const downstreamActionState = WorkspaceActionGovernanceManager.getActionState(activeRecommendation || {}, {
            requireContent: true,
            blockedReason: LanguageManager.t("RecommendationBlockedActionReason"),
            contentRequiredReason: LanguageManager.t("RecommendationContentRequiredBeforeDecisionReason")
        });
        const createDecisionDisabled = !activeRecommendation || !downstreamActionState.downstreamAllowed;

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("RecommendationRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-recommendation",
                label: LanguageManager.t("RecommendationCloseAction"),
                onClick: () => {
                    RecommendationManager.clear();
                    this.refresh();
                }
            },
            {
                id: "prioritize",
                label: LanguageManager.t("RecommendationCreateAction"),
                onClick: () => this.createSampleRecommendation()
            },
            {
                id: "create-decision",
                label: LanguageManager.t("RecommendationCreateDecisionAction"),
                disabled: createDecisionDisabled,
                title: createDecisionDisabled ? downstreamActionState.reason : "",
                onClick: () => this.createDecisionFromSelectedRecommendation()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(recommendations = this.getRecommendations(), activeRecommendation = RecommendationManager.get()) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(recommendations));
        layout.appendChild(this.createDetailPanel(activeRecommendation, recommendations));

        return layout;
    }

    static createContent(recommendations = this.getRecommendations()) {
        if (!recommendations.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("RecommendationWorkspaceTitle"),
                title: LanguageManager.t("RecommendationEmptyTitle"),
                description: LanguageManager.t("RecommendationEmptyDescription"),
                actionLabel: LanguageManager.t("RecommendationNewAction"),
                onAction: () => this.createSampleRecommendation()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        recommendations.forEach(recommendation => {
            list.appendChild(this.createRecommendationRow(recommendation));
        });

        return list;
    }

    static getRecommendationStatus(recommendation = {}) {
        recommendation = recommendation || {};
        if (recommendation.blocked || recommendation.status === "blocked") {
            return "blocked";
        }

        if (recommendation.reviewed || recommendation.status === "reviewed") {
            return "reviewed";
        }

        if (
            recommendation.decisionId ||
            recommendation.linkedDecisionId ||
            recommendation.decision ||
            recommendation.hasDecision ||
            recommendation.status === "decided"
        ) {
            return "decided";
        }

        if (
            recommendation.recommended ||
            recommendation.title ||
            recommendation.name ||
            recommendation.action ||
            recommendation.recommendation ||
            recommendation.priority ||
            recommendation.status === "recommended"
        ) {
            return "recommended";
        }

        return "draft";
    }

    static renderRecommendationStatusBadge(recommendation = {}) {
        recommendation = recommendation || {};
        const status = this.getRecommendationStatus(recommendation);
        const label = this.statusLabels[status] || LanguageManager.t("RecommendationStatusDraft");

        return `
            <span class="evidence-status evidence-status--${status}">
                ${label}
            </span>
        `;
    }

    static getNextAction(recommendation = {}) {
        recommendation = recommendation || {};
        const status = this.getRecommendationStatus
            ? this.getRecommendationStatus(recommendation)
            : "draft";

        if (status === "blocked") {
            return {
                label: LanguageManager.t("RecommendationResolveBlockerAction"),
                description: LanguageManager.t("RecommendationResolveBlockerDescription"),
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: LanguageManager.t("RecommendationCreateConfirmDecisionAction"),
                description: LanguageManager.t("RecommendationCreateConfirmDecisionDescription"),
                tone: "ready"
            };
        }

        if (status === "decided") {
            return {
                label: LanguageManager.t("RecommendationReviewLinkedDecision"),
                description: LanguageManager.t("RecommendationAlreadyLinkedDecisionDescription"),
                tone: "linked"
            };
        }

        if (status === "recommended") {
            return {
                label: LanguageManager.t("RecommendationPrepareDecisionAction"),
                description: LanguageManager.t("RecommendationPrepareDecisionDescription"),
                tone: "active"
            };
        }

        return {
            label: LanguageManager.t("RecommendationDefineRecommendationAction"),
            description: LanguageManager.t("RecommendationDefineRecommendationDescription"),
            tone: "draft"
        };
    }

    static renderNextActionPanel(recommendation = {}) {
        recommendation = recommendation || {};
        const action = this.getNextAction(recommendation);

        return `
            <section class="next-action next-action--${action.tone}" aria-label="Next action">
                <div>
                    <span class="next-action__eyebrow">${LanguageManager.t("RecommendationNextActionHeading")}</span>
                    <strong>${action.label}</strong>
                    <p>${action.description}</p>
                </div>
            </section>
        `;
    }

    static createNextActionPanel(recommendation = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(recommendation);
        return container;
    }

    static getCompletionState(recommendation = {}) {
        recommendation = recommendation || {};
        const hasTitle = Boolean(recommendation.title || recommendation.name);
        const hasAction = Boolean(recommendation.action || recommendation.recommendation || recommendation.description);
        const hasPriority = Boolean(recommendation.priority || recommendation.urgency);
        const hasCost = Boolean(recommendation.costEstimate || recommendation.capex || recommendation.budget);
        const hasAssessmentLink = Boolean(
            recommendation.assessmentId ||
            recommendation.linkedAssessmentId ||
            recommendation.assessment ||
            recommendation.hasAssessment
        );
        const hasDecisionLink = Boolean(
            recommendation.decisionId ||
            recommendation.linkedDecisionId ||
            recommendation.decision ||
            recommendation.hasDecision
        );

        const checks = [
            {
                key: "identity",
                label: LanguageManager.t("RecommendationIdentifiedCheck"),
                complete: hasTitle
            },
            {
                key: "action",
                label: LanguageManager.t("RecommendationActionDefinedCheck"),
                complete: hasAction
            },
            {
                key: "priority",
                label: LanguageManager.t("RecommendationPriorityDefined"),
                complete: hasPriority
            },
            {
                key: "cost",
                label: LanguageManager.t("RecommendationCostLogicCapturedCheck"),
                complete: hasCost
            },
            {
                key: "assessment",
                label: LanguageManager.t("RecommendationAssessmentLinked"),
                complete: hasAssessmentLink
            },
            {
                key: "decision",
                label: LanguageManager.t("RecommendationDecisionConnection"),
                complete: hasDecisionLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForDecision: hasTitle && hasAction && hasPriority,
            isComplete: completed === total
        };
    }

    static renderCompletionPanel(recommendation = {}) {
        recommendation = recommendation || {};
        const completion = this.getCompletionState(recommendation);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForDecision
            ? LanguageManager.t("RecommendationReadyForDecision")
            : "Needs more recommendation data";

        return `
            <section class="completion-panel" aria-label="Recommendation completion">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">${LanguageManager.t("RecommendationCompletionLabel")}</span>
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

    static createCompletionPanel(recommendation = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(recommendation);
        return container;
    }

    static createRecommendationRow(recommendation) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            RecommendationManager.set(recommendation);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = recommendation.title || recommendation.id || LanguageManager.t("RecommendationItemFallback");

        const meta = document.createElement("span");
        meta.textContent = `${this.formatRecommendationValue(recommendation.priority || "Medium")} · ${this.formatRecommendationValue(recommendation.timeframe || "Short Term")}`;

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderRecommendationStatusBadge(recommendation);

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusContainer);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        const actionState = WorkspaceActionGovernanceManager.getActionState(recommendation);

        [
            ["open", LanguageManager.t("RecommendationOpenAction"), actionState.openAllowed],
            ["edit", LanguageManager.t("RecommendationEditAction"), actionState.editAllowed],
            ["delete", LanguageManager.t("RecommendationDeleteAction"), actionState.deleteAllowed]
        ].forEach(([action, label, isAllowed]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = isAllowed ? "button" : "button secondary";
            button.textContent = isAllowed ? label : `${label} · ${LanguageManager.t("RecommendationActionLockedLabel")}`;
            button.disabled = !isAllowed;
            button.title = isAllowed ? "" : actionState.reason;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (!isAllowed) {
                    Notification.warning(LanguageManager.t("RecommendationActionBlockedNotification"));
                    return;
                }

                if (action === "open") {
                    RecommendationManager.set(recommendation);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    RecommendationManager.set(recommendation);
                    this.editSelectedRecommendation();
                    return;
                }

                if (action === "delete") {
                    this.deleteRecommendation(recommendation);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static createDetailPanel(activeRecommendation = RecommendationManager.get(), recommendations = this.getRecommendations()) {
        if (!activeRecommendation) {
            return DetailPanel.create(LanguageManager.t("RecommendationContextTitle"), [
                { label: LanguageManager.t("RecommendationTotalMetric"), value: String(recommendations.length) },
                { label: LanguageManager.t("RecommendationSelectedLabel"), value: LanguageManager.t("RecommendationNotSelected") },
                { label: LanguageManager.t("RecommendationWorkspaceStatusLabel"), value: LanguageManager.t("RecommendationNoSelection") },
                { label: LanguageManager.t("RecommendationDecisionRelevanceLabel"), value: recommendations.length ? LanguageManager.t("RecommendationInReview") : LanguageManager.t("RecommendationPending") },
                { label: LanguageManager.t("FinalNextStepLabel"), value: LanguageManager.t("FinalCreateOrSelectRecommendation") }
            ]);
        }

        const statusLabel = this.statusLabels[this.getRecommendationStatus(activeRecommendation)] || LanguageManager.t("RecommendationStatusDraft");

        return DetailPanel.create(LanguageManager.t("RecommendationContextTitle"), [
            { label: LanguageManager.t("RecommendationSelectedLabel"), value: activeRecommendation.title || activeRecommendation.id },
            { label: LanguageManager.t("RecommendationWorkspaceStatusLabel"), value: statusLabel },
            ...ReviewAuditTrailFields.create(activeRecommendation),
            { label: LanguageManager.t("RecommendationSafetyBoundariesLabel"), value: DetailPanel.createBoundaryBadges(activeRecommendation) },
            { label: LanguageManager.t("RecommendationSourceLabel"), value: activeRecommendation.source || LanguageManager.t("RecommendationAssessmentReviewSource") },
            { label: LanguageManager.t("RecommendationCaseIdLabel"), value: activeRecommendation.caseId || LanguageManager.t("RecommendationNotLinked") },
            { label: LanguageManager.t("RecommendationBuildingIdLabel"), value: activeRecommendation.buildingId || LanguageManager.t("RecommendationNotLinked") },
            { label: LanguageManager.t("RecommendationInspectionIdLabel"), value: activeRecommendation.inspectionId || LanguageManager.t("RecommendationNotLinked") },
            { label: LanguageManager.t("RecommendationAssessmentIdsLabel"), value: (activeRecommendation.assessmentIds || []).join(", ") || LanguageManager.t("RecommendationNone") },
            { label: LanguageManager.t("RecommendationFindingIdsLabel"), value: (activeRecommendation.findingIds || []).join(", ") || LanguageManager.t("RecommendationNone") },
            { label: LanguageManager.t("RecommendationEvidenceIdsLabel"), value: (activeRecommendation.evidenceIds || []).join(", ") || LanguageManager.t("RecommendationNone") },
            { label: LanguageManager.t("RecommendationBuildingSystemLabel"), value: activeRecommendation.buildingSystem || LanguageManager.t("RecommendationNotLinked") },
            { label: LanguageManager.t("RecommendationRiskScoreLabel"), value: String(activeRecommendation.riskScore || 0) },
            { label: LanguageManager.t("RecommendationPriorityLabel"), value: this.formatRecommendationValue(activeRecommendation.priority || "Medium") },
            { label: LanguageManager.t("RecommendationTimeframeLabel"), value: this.formatRecommendationValue(activeRecommendation.timeframe || "Short Term") },
            { label: LanguageManager.t("RecommendationDecisionImpactLabel"), value: this.formatRecommendationValue(activeRecommendation.decisionImpact || "Medium") },
            { label: LanguageManager.t("RecommendationDescriptionField"), value: activeRecommendation.description || LanguageManager.t("RecommendationNoDescription") },
            { label: LanguageManager.t("RecommendationDecisionIdsLabel"), value: (activeRecommendation.decisionIds || []).join(", ") || LanguageManager.t("RecommendationNone") },
            { label: LanguageManager.t("RecommendationLinkedDecisionsMetric"), value: String(this.countDecisionsLinkedToRecommendation(activeRecommendation.id)) }
        ]);
    }

    static countDecisionsLinkedToRecommendation(recommendationId = null) {
        const targetRecommendationId = recommendationId || RecommendationManager.get()?.id;

        if (!targetRecommendationId) {
            return 0;
        }

        return DecisionManager.getAll()
            .filter(decision => (decision.recommendationIds || []).includes(targetRecommendationId))
            .length;
    }

    static formatSourceMeasurement(recommendation = {}) {
        if (
            recommendation.sourceMeasurementValue === null ||
            recommendation.sourceMeasurementValue === undefined ||
            recommendation.sourceMeasurementValue === ""
        ) {
            return "None";
        }

        return `${recommendation.sourceMeasurementValue}${recommendation.sourceMeasurementUnit ? " " + recommendation.sourceMeasurementUnit : ""}`;
    }

    static createDecisionFromSelectedRecommendation() {
        const recommendation = RecommendationManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!recommendation) {
            Notification.warning(LanguageManager.t("RecommendationSelectRecommendationFirstWarning"));
            return;
        }

        if (!recommendation.caseId) {
            Notification.warning(LanguageManager.t("RecommendationNotLinkedToCaseWarning"));
            return;
        }

        if (currentCase && currentCase.id !== recommendation.caseId) {
            Notification.warning(LanguageManager.t("RecommendationBelongsToAnotherCaseWarning"));
            return;
        }

        const actionState = WorkspaceActionGovernanceManager.getActionState(recommendation, {
            requireContent: true,
            blockedReason: LanguageManager.t("RecommendationBlockedActionReason"),
            contentRequiredReason: LanguageManager.t("RecommendationContentRequiredBeforeDecisionReason")
        });

        if (!actionState.downstreamAllowed) {
            Notification.warning(LanguageManager.t("RecommendationDownstreamActionBlockedNotification"));
            return;
        }

        const isPattayaRecommendation =
            recommendation.profile === "pattaya" ||
            String(recommendation.sourceQuestionId || "").startsWith("TH-PATTAYA-");

        const isAvailabilityCheckOnly = recommendation.sourcePolicy === "availability_check_only";

        const resolvedFindingIds = (recommendation.findingIds || []).length
            ? recommendation.findingIds
            : (recommendation.assessmentIds || [])
                .flatMap(id => AssessmentManager.load(id)?.findingIds || []);

        const riskScore = recommendation.riskScore || 0;

        const decisionTitle = recommendation.title
            ? `${LanguageManager.t("RecommendationDecisionDraftPrefix")}: ${recommendation.title}`
            : `${LanguageManager.t("RecommendationDecisionDraftFrom")} ${recommendation.id}`;

        const decisionType = "Monitor";
        const riskLevel = isAvailabilityCheckOnly
            ? "Low"
            : (recommendation.decisionImpact || recommendation.priority || "Medium");

        const rationale = [
            recommendation.action || recommendation.description || "",
            "",
            LanguageManager.t("RecommendationDecisionBoundaryLabel"),
            LanguageManager.t("RecommendationDecisionSupportDraftOnly"),
            "No automatic Go/No-Go decision.",
            "No automatic purchase recommendation.",
            "Expert review required before any formal decision."
        ].filter(Boolean).join("\n");

        const descriptionParts = [
            recommendation.description || LanguageManager.t("RecommendationDecisionPreparedFromSelected"),
            "",
            LanguageManager.t("RecommendationDecisionStatusLabel"),
            LanguageManager.t("RecommendationDraftDecisionCreatedLine"),
            "Expert review required before approval, closure or report use.",
            LanguageManager.t("RecommendationNoAutomaticDecisionGoNoGoLine")
        ];

        if (isAvailabilityCheckOnly) {
            descriptionParts.push("");
            descriptionParts.push("Review boundary:");
            descriptionParts.push("Document availability only. No legal, financial, technical or governance document review has been performed.");
            descriptionParts.push("This decision draft may only preserve document availability context. It must not be used as validation of document content.");
        }

        if (isPattayaRecommendation) {
            descriptionParts.push("");
            descriptionParts.push("Thailand / Pattaya context:");
            descriptionParts.push("Field review context retained for decision support and reporting.");
        }

        descriptionParts.push("");
        descriptionParts.push("Recommendation trace:");
        descriptionParts.push(`Recommendation ID: ${recommendation.id}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationSourceTraceLabel")}: ${recommendation.source || LanguageManager.t("RecommendationAssessmentReviewSource")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationAssessmentIdsLabel")}: ${(recommendation.assessmentIds || []).join(", ") || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationFindingIdsLabel")}: ${([...new Set(resolvedFindingIds)]).join(", ") || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationEvidenceIdsLabel")}: ${(recommendation.evidenceIds || []).join(", ") || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationSourceAssessmentIdsTraceLabel")}: ${(recommendation.sourceAssessmentIds || []).join(", ") || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationSourceFindingIdsTraceLabel")}: ${(recommendation.sourceFindingIds || []).join(", ") || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationSourceEvidenceIdsTraceLabel")}: ${(recommendation.sourceEvidenceIds || []).join(", ") || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationSourcePolicyTraceLabel")}: ${recommendation.sourcePolicy || LanguageManager.t("RecommendationNone")}`);
        descriptionParts.push(`Risk score: ${riskScore}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationDecisionImpactTraceLabel")}: ${this.formatRecommendationValue(recommendation.decisionImpact || "Medium")}`);
        descriptionParts.push(`${LanguageManager.t("RecommendationNoAutomaticDecisionTraceLabel")}: ${recommendation.noAutomaticDecision === false ? LanguageManager.t("RecommendationNo") : LanguageManager.t("RecommendationYes")}`);
        descriptionParts.push(`Expert review required: ${recommendation.expertReviewRequired === false ? "No" : "Yes"}`);

        const hasEvidenceMetadataTrace = Boolean(
            recommendation.sourceFileName ||
            recommendation.sourceFileType ||
            recommendation.sourceFileReference ||
            recommendation.sourceCaptureMethod ||
            recommendation.sourceLocationLabel ||
            recommendation.sourceInspectionArea ||
            recommendation.sourceMeasurementValue !== null && recommendation.sourceMeasurementValue !== undefined ||
            recommendation.sourceMeasurementUnit ||
            recommendation.sourceReviewStatus
        );

        if (hasEvidenceMetadataTrace) {
            descriptionParts.push("");
            descriptionParts.push("Evidence metadata trace:");
            descriptionParts.push(`File name: ${recommendation.sourceFileName || "None"}`);
            descriptionParts.push(`File type: ${recommendation.sourceFileType || "None"}`);
            descriptionParts.push(`File reference: ${recommendation.sourceFileReference || "None"}`);
            descriptionParts.push(`Capture method: ${recommendation.sourceCaptureMethod || "None"}`);
            descriptionParts.push(`Location label: ${recommendation.sourceLocationLabel || "None"}`);
            descriptionParts.push(`Inspection area: ${recommendation.sourceInspectionArea || "None"}`);
            descriptionParts.push(`Measurement: ${this.formatSourceMeasurement(recommendation)}`);
            descriptionParts.push(`Evidence review status: ${recommendation.sourceReviewStatus || "None"}`);
            descriptionParts.push(`Expert review required: ${recommendation.sourceExpertReviewRequired === false ? "No" : "Yes"}`);
        }

        const decision = DecisionManager.create({
            caseId: recommendation.caseId,
            buildingId: recommendation.buildingId || currentCase?.buildingId || null,
            inspectionId: recommendation.inspectionId || currentCase?.inspectionId || null,

            recommendationId: recommendation.id,
            recommendationIds: [recommendation.id],
            assessmentIds: recommendation.assessmentIds || [],
            findingIds: [...new Set(resolvedFindingIds)],
            evidenceIds: recommendation.evidenceIds || [],

            sourceRecommendationIds: [recommendation.id],
            sourceAssessmentIds: recommendation.sourceAssessmentIds || recommendation.assessmentIds || [],
            sourceFindingIds: recommendation.sourceFindingIds || [...new Set(resolvedFindingIds)],
            sourceEvidenceIds: recommendation.sourceEvidenceIds || recommendation.evidenceIds || [],

            title: decisionTitle,
            description: descriptionParts.join("\n"),
            decisionType,
            rationale,
            source: recommendation.source || "Recommendation Review",
            buildingSystem: recommendation.buildingSystem || "",
            riskScore,
            decisionImpact: recommendation.decisionImpact || "Medium",
            riskLevel,
            confidence: isAvailabilityCheckOnly ? 50 : 60,
            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,
            noAutomaticDecision: true,
            decisionSupportOnly: true,

            sourceQuestionId: recommendation.sourceQuestionId || "",
            sourceQuestion: recommendation.sourceQuestion || "",
            sourceModule: recommendation.sourceModule || "",
            sourceCategory: recommendation.sourceCategory || "",
            sourcePolicy: recommendation.sourcePolicy || "",
            sourceRequiredEvidenceRaw: recommendation.sourceRequiredEvidenceRaw || "",

            sourceFileName: recommendation.sourceFileName || "",
            sourceFileType: recommendation.sourceFileType || "",
            sourceFileReference: recommendation.sourceFileReference || "",
            sourceCaptureMethod: recommendation.sourceCaptureMethod || "",
            sourceLocationLabel: recommendation.sourceLocationLabel || "",
            sourceInspectionArea: recommendation.sourceInspectionArea || "",
            sourceMeasurementValue: recommendation.sourceMeasurementValue ?? null,
            sourceMeasurementUnit: recommendation.sourceMeasurementUnit || "",
            sourceReviewStatus: recommendation.sourceReviewStatus || "",
            sourceExpertReviewRequired: recommendation.sourceExpertReviewRequired !== undefined
                ? recommendation.sourceExpertReviewRequired
                : true,

            profile: isPattayaRecommendation ? "pattaya" : "",
            country: isPattayaRecommendation ? "TH" : "",
            region: isPattayaRecommendation ? "Pattaya / Chonburi" : "",

            createdBy: "System",
            updatedBy: "System"
        });

        DecisionManager.set(decision);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                decisionIds: [...new Set([...(activeCaseForSync.decisionIds || []), decision.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedRecommendation = RecommendationManager.update({
            ...recommendation,
            decisionIds: [...new Set([...(recommendation.decisionIds || []), decision.id])],
            linkedDecisionId: decision.id,
            hasDecision: true,
            updatedAt: new Date().toISOString()
        });

        RecommendationManager.set(updatedRecommendation);

        Notification.success(LanguageManager.t("RecommendationDecisionDraftCreated"));
        window.location.hash = "decisions";
    }

    static getRecommendations() {
        const currentCase = CaseManager.getCurrent();

        if (currentCase) {
            return RecommendationManager.getByCase(currentCase.id);
        }

        return RecommendationManager.getAll();
    }

    static createSampleRecommendation() {

        const currentCase = CaseManager.getCurrent();

        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();

        const activeAssessment = AssessmentManager.get();

        if (!currentCase) {

            Notification.info(LanguageManager.t("RecommendationOpenCaseFirst"));

            return;

        }

        FormDialog.open({

            title: LanguageManager.t("RecommendationNewTitle"),

            submitLabel: LanguageManager.t("RecommendationCreateAction"),

            values: {

                title: "",

                description: "",

                action: "",

                priority: activeAssessment?.priority || "Medium",

                timeframe: "Short Term",

                estimatedCost: 0,

                currency: "EUR",

                responsible: "Owner",

                decisionImpact: activeAssessment?.riskScore >= 60 ? "High" : "Medium",

                status: "Draft"

            },

            fields: [

                {

                    id: "title",

                    label: LanguageManager.t("RecommendationTitleField")

                },

                {

                    id: "description",

                    label: LanguageManager.t("RecommendationDescriptionField")

                },

                {

                    id: "action",

                    label: LanguageManager.t("RecommendationActionField")

                },

                {

                    id: "priority",

                    label: LanguageManager.t("RecommendationPriorityLabel"),

                    type: "select",

                    options: [
                          { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                          { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                          { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                          { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                      ]

                },

                {

                    id: "timeframe",

                    label: LanguageManager.t("RecommendationTimeframeLabel"),

                    type: "select",

                    options: [
                          { value: "Immediate", label: LanguageManager.t("RecommendationOptionImmediate") },
                          { value: "Short Term", label: LanguageManager.t("RecommendationOptionShortTerm") },
                          { value: "Medium Term", label: LanguageManager.t("RecommendationOptionMediumTerm") },
                          { value: "Long Term", label: LanguageManager.t("RecommendationOptionLongTerm") }
                      ]

                },

                {

                    id: "estimatedCost",

                    label: LanguageManager.t("RecommendationEstimatedCostLabel"),

                    type: "number"

                },

                {

                    id: "currency",

                    label: LanguageManager.t("RecommendationCurrencyLabel"),

                    type: "select",

                    options: ["EUR", "THB", "USD"]

                },

                {

                    id: "responsible",

                    label: LanguageManager.t("RecommendationResponsibleLabel")

                },

                {

                    id: "decisionImpact",

                    label: LanguageManager.t("RecommendationDecisionImpactLabel"),

                    type: "select",

                    options: [
                          { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                          { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                          { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                          { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                      ]

                },

                {

                    id: "status",

                    label: LanguageManager.t("CaseStatusLabel"),

                    type: "select",

                    options: [
                          { value: "Draft", label: LanguageManager.t("RecommendationStatusDraft") },
                          { value: "Recommended", label: LanguageManager.t("RecommendationStatusRecommended") },
                          { value: "Decided", label: LanguageManager.t("RecommendationStatusDecided") },
                          { value: "Reviewed", label: LanguageManager.t("RecommendationStatusReviewed") },
                          { value: "Blocked", label: LanguageManager.t("RecommendationStatusBlocked") }
                      ]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                if (!activeAssessment) {
            Notification.info(LanguageManager.t("RecommendationSelectAssessmentBeforeCreating"));
            return;
        }

        const recommendation = RecommendationManager.create({

                    caseId: activeAssessment?.caseId || currentCase.id,

                    buildingId: activeAssessment?.buildingId || currentBuilding?.id || null,

                    inspectionId: activeAssessment?.inspectionId || currentInspection?.id || null,

                    assessmentIds: activeAssessment ? [activeAssessment.id] : [],

                    title: values.title,

                    description: values.description || "",

                    action: values.action || "",

                    priority: values.priority || "Medium",

                    timeframe: values.timeframe || "Short Term",

                    estimatedCost: Number(values.estimatedCost || 0),

                    currency: values.currency || "EUR",

                    responsible: values.responsible || "Owner",

                    decisionImpact: values.decisionImpact || "Medium",

                    status: values.status || "Draft"

                });

                RecommendationManager.set(recommendation);

                dialog.remove();

                Notification.success(LanguageManager.t("RecommendationCreatedNotification"));

                this.refresh();

            }

        });

    }


    static editSelectedRecommendation() {
        const recommendation = RecommendationManager.get();

        if (!recommendation) {
            Notification.info(LanguageManager.t("RecommendationSelectBeforeEditing"));
            return;
        }

        const actionState = WorkspaceActionGovernanceManager.getActionState(recommendation);

        if (!actionState.editAllowed) {
            Notification.warning(LanguageManager.t("RecommendationEditBlockedNotification"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("RecommendationEditTitle"),
            submitLabel: LanguageManager.t("RecommendationSaveAction"),
            values: {
                title: recommendation.title || "",
                description: recommendation.description || "",
                action: recommendation.action || "",
                priority: recommendation.priority || "Medium",
                timeframe: recommendation.timeframe || "Short Term",
                estimatedCost: recommendation.estimatedCost || 0,
                currency: recommendation.currency || "EUR",
                responsible: recommendation.responsible || "Owner",
                decisionImpact: recommendation.decisionImpact || "Medium",
                status: recommendation.status || "Draft"
            },
            fields: [
                { id: "title", label: LanguageManager.t("RecommendationTitleField") },
                { id: "description", label: LanguageManager.t("RecommendationDescriptionField") },
                { id: "action", label: LanguageManager.t("RecommendationActionField") },
                {
                    id: "priority",
                    label: LanguageManager.t("RecommendationPriorityLabel"),
                    type: "select",
                    options: [
                          { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                          { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                          { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                          { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                      ]
                },
                {
                    id: "timeframe",
                    label: LanguageManager.t("RecommendationTimeframeLabel"),
                    type: "select",
                    options: [
                          { value: "Immediate", label: LanguageManager.t("RecommendationOptionImmediate") },
                          { value: "Short Term", label: LanguageManager.t("RecommendationOptionShortTerm") },
                          { value: "Medium Term", label: LanguageManager.t("RecommendationOptionMediumTerm") },
                          { value: "Long Term", label: LanguageManager.t("RecommendationOptionLongTerm") }
                      ]
                },
                { id: "estimatedCost", label: LanguageManager.t("RecommendationEstimatedCostLabel"), type: "number" },
                {
                    id: "currency",
                    label: LanguageManager.t("RecommendationCurrencyLabel"),
                    type: "select",
                    options: ["EUR", "THB", "USD"]
                },
                { id: "responsible", label: LanguageManager.t("RecommendationResponsibleLabel") },
                {
                    id: "decisionImpact",
                    label: LanguageManager.t("RecommendationDecisionImpactLabel"),
                    type: "select",
                    options: [
                          { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                          { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                          { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                          { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                      ]
                },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: [
                          { value: "Draft", label: LanguageManager.t("RecommendationStatusDraft") },
                          { value: "Recommended", label: LanguageManager.t("RecommendationStatusRecommended") },
                          { value: "Decided", label: LanguageManager.t("RecommendationStatusDecided") },
                          { value: "Reviewed", label: LanguageManager.t("RecommendationStatusReviewed") },
                          { value: "Blocked", label: LanguageManager.t("RecommendationStatusBlocked") }
                      ]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = RecommendationManager.update({
                    ...recommendation,
                    title: values.title,
                    description: values.description || "",
                    action: values.action || "",
                    priority: values.priority || "Medium",
                    timeframe: values.timeframe || "Short Term",
                    estimatedCost: Number(values.estimatedCost || 0),
                    currency: values.currency || "EUR",
                    responsible: values.responsible || "Owner",
                    decisionImpact: values.decisionImpact || "Medium",
                    status: values.status || "Draft",
                    updatedAt: new Date().toISOString()
                });

                RecommendationManager.set(updated);
                dialog.remove();
                Notification.success(LanguageManager.t("RecommendationUpdatedNotification"));
                this.refresh();
            }
        });
    }

    static deleteRecommendation(item) {
        const actionState = WorkspaceActionGovernanceManager.getActionState(item);

        if (!actionState.deleteAllowed) {
            Notification.warning(LanguageManager.t("RecommendationDeleteBlockedNotification"));
            return;
        }

        if (!window.confirm(`${LanguageManager.t("RecommendationDeleteConfirmPrefix")} "${item.title || item.id}"?`)) {
            return;
        }

        RecommendationManager.delete(item.id);

        if (RecommendationManager.get()?.id === item.id) {
            RecommendationManager.clear();
        }

        Notification.success(LanguageManager.t("RecommendationDeletedNotification"));
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} ${LanguageManager.t("RecommendationPendingFeatureSuffix")}`);
    }

    static getRecommendationIntelligence(recommendation = {}) {
        recommendation = recommendation || {};
        const hasIdentity = Boolean(recommendation.title || recommendation.name);
        const hasAction = Boolean(recommendation.action || recommendation.recommendation || recommendation.description);
        const hasPriority = Boolean(recommendation.priority || recommendation.urgency);
        const hasCost = Boolean(recommendation.costEstimate || recommendation.capex || recommendation.budget);
        const hasAssessmentLink = Boolean(
            recommendation.assessmentId ||
            recommendation.linkedAssessmentId ||
            recommendation.assessment ||
            recommendation.hasAssessment
        );
        const hasDecisionLink = Boolean(
            recommendation.decisionId ||
            recommendation.linkedDecisionId ||
            recommendation.decision ||
            recommendation.hasDecision
        );
        const isReviewed = Boolean(recommendation.reviewed || recommendation.status === "reviewed");

        const checks = [
            hasIdentity,
            hasAction,
            hasPriority,
            hasCost,
            hasAssessmentLink,
            hasDecisionLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals:
                (hasAction ? 1 : 0) +
                (hasPriority ? 1 : 0),
            downstreamSignals:
                (hasAssessmentLink ? 1 : 0) +
                (hasDecisionLink ? 1 : 0),
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.64,
                primary: 9,
                downstream: 9,
                output: 6
            }
        });

        let actionLogicSignal = {
            label: LanguageManager.t("RecommendationLowActionLogic"),
            description: LanguageManager.t("RecommendationLowActionLogicDescription"),
            tone: "draft"
        };

        if (hasAction && hasPriority && hasAssessmentLink && hasDecisionLink) {
            actionLogicSignal = {
                label: LanguageManager.t("RecommendationStrongActionLogic"),
                description: LanguageManager.t("RecommendationStrongActionLogicDescription"),
                tone: "ready"
            };
        } else if (hasAction && hasPriority) {
            actionLogicSignal = {
                label: LanguageManager.t("RecommendationDevelopingActionLogic"),
                description: LanguageManager.t("RecommendationDevelopingActionLogicDescription"),
                tone: "active"
            };
        }

        const nextAction = hasDecisionLink
            ? {
                label: LanguageManager.t("RecommendationReviewLinkedDecision"),
                description: LanguageManager.t("RecommendationReviewLinkedDecisionDescription"),
                tone: "ready"
            }
            : hasAction && hasPriority
                ? {
                    label: LanguageManager.t("RecommendationCreateOrLinkDecision"),
                    description: LanguageManager.t("RecommendationCreateOrLinkDecisionDescription"),
                    tone: "active"
                }
                : {
                    label: LanguageManager.t("RecommendationDefineRecommendedAction"),
                    description: LanguageManager.t("RecommendationDefineRecommendedActionDescription"),
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            actionLogicSignal,
            nextAction,
            label: readinessPercent >= 100
                ? LanguageManager.t("RecommendationIntelligenceComplete")
                : readinessPercent >= 50
                    ? LanguageManager.t("RecommendationIntelligenceDeveloping")
                    : LanguageManager.t("RecommendationIntelligenceEarly")
        };
    }

    static renderRecommendationIntelligenceSnapshot(recommendation = {}) {
        recommendation = recommendation || {};
        const intelligence = this.getRecommendationIntelligence(recommendation);

        return `
            <section class="recommendation-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("RecommendationIntelligenceLabel")}">
                <div class="recommendation-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="recommendation-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("RecommendationIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} ${LanguageManager.t("RecommendationChecksCompleted")}</p>
                    </div>
                    <span class="recommendation-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="recommendation-intelligence__grid intelligence-snapshot__grid">
                    <article class="recommendation-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("RecommendationDecisionReadiness")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>${LanguageManager.t("RecommendationDecisionReadinessCardDescription")}</p>
                    </article>

                    <article class="recommendation-intelligence__card intelligence-snapshot__card recommendation-intelligence__card--${intelligence.actionLogicSignal.tone} intelligence-snapshot__card--${intelligence.actionLogicSignal.tone}">
                        <span>${LanguageManager.t("RecommendationActionLogicSignalLabel")}</span>
                        <strong>${intelligence.actionLogicSignal.label}</strong>
                        <p>${intelligence.actionLogicSignal.description}</p>
                    </article>

                    <article class="recommendation-intelligence__card intelligence-snapshot__card recommendation-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("RecommendationNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createRecommendationIntelligenceSnapshot(recommendation = RecommendationManager.get()) {
        if (!recommendation || !recommendation.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderRecommendationIntelligenceSnapshot(recommendation);
        return container;
    }

}
