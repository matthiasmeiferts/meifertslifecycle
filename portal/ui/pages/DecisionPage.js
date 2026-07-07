import DecisionManager from "../../core/DecisionManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import ReportManager from "../../core/ReportManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import LanguageManager from "../../core/LanguageManager.js";
import SectionHeader from "../components/SectionHeader.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import WorkflowProgressPanel from "../components/WorkflowProgressPanel.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";
import FormDialog from "../components/FormDialog.js";

export default class DecisionPage {

    static flowSteps = [
        {
            key: "decision",
            label: LanguageManager.t("DecisionWorkflowStepTitle"),
            description: LanguageManager.t("DecisionWorkflowConfirmed")
        },
        {
            key: "report",
            label: LanguageManager.t("DecisionWorkflowReportTitle"),
            description: LanguageManager.t("DecisionWorkflowReportPrepared")
        }
    ];

    static statusLabels = {
        draft: LanguageManager.t("DecisionStatusDraft"),
        decided: LanguageManager.t("DecisionStatusDecided"),
        reported: LanguageManager.t("DecisionStatusReported"),
        reviewed: LanguageManager.t("DecisionStatusReviewed"),
        blocked: LanguageManager.t("DecisionStatusBlocked")
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const decisions = this.getDecisions();
        const activeDecision = DecisionManager.get();

        fragment.appendChild(this.createHeader());
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "decisions"));
        fragment.appendChild(this.createMetrics(decisions));
        const decisionOverview = document.createElement("section");
        decisionOverview.className = "decision-polish-stack";
        decisionOverview.appendChild(this.createFlowIndicator(activeDecision));
        decisionOverview.appendChild(this.createNextActionPanel(activeDecision));
        decisionOverview.appendChild(this.createCompletionPanel(activeDecision));

        fragment.appendChild(decisionOverview);

        if (activeDecision) {
            fragment.appendChild(this.createDecisionIntelligenceSnapshot(activeDecision));
        }

        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(decisions, activeDecision));

        return fragment;
    }

    static createHeader() {
        return SectionHeader.create({
            eyebrow: LanguageManager.t("DecisionWorkspaceTitle"),
            title: LanguageManager.t("DecisionTitlePlural"),
            description: LanguageManager.t("DecisionHeaderDescription"),
            actions: [
                {
                    id: "new-decision",
                    label: LanguageManager.t("DecisionNewAction"),
                    onClick: () => this.createSampleDecision()
                }
            ]
        });
    }

    static createMetrics(decisions = this.getDecisions()) {
        const pendingCount = decisions.filter(item => item.status === "Draft" || item.status === "Under Review").length;
        const approvedCount = decisions.filter(item => item.status === "Approved").length;
        const averageConfidence = decisions.length
            ? Math.round(decisions.reduce((sum, item) => sum + (item.confidence || 0), 0) / decisions.length)
            : "Pending";

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create(LanguageManager.t("DecisionTotalMetric"), decisions.length));
        grid.appendChild(MetricCard.create(LanguageManager.t("DecisionPendingMetric"), pendingCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("DecisionApprovedMetric"), approvedCount));
        grid.appendChild(MetricCard.create(LanguageManager.t("DecisionLinkedReportsMetric"), this.countReportsLinkedToDecision()));

        return grid;
    }

    static getFlowState(decision = {}) {
        decision = decision || {};
        const hasReportLink =
            Boolean(decision.reportId) ||
            Boolean(decision.linkedReportId) ||
            Boolean(decision.report) ||
            Boolean(decision.hasReport);

        return {
            decision: "active",
            report: hasReportLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(decision = {}) {
        decision = decision || {};
        const flowState = this.getFlowState(decision);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">${LanguageManager.t("DecisionActiveFlowLabel")}</span>
                    <strong>${LanguageManager.t("DecisionToReportLabel")}</strong>
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

    static createFlowIndicator(decision = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(decision);
        return container;
    }

    static getDecisionStatus(decision = {}) {
        decision = decision || {};
        if (decision.blocked || decision.status === "blocked") {
            return "blocked";
        }

        if (decision.reviewed || decision.status === "reviewed") {
            return "reviewed";
        }

        if (
            decision.reportId ||
            decision.linkedReportId ||
            decision.report ||
            decision.hasReport ||
            decision.status === "reported"
        ) {
            return "reported";
        }

        if (
            decision.decided ||
            decision.decision ||
            decision.outcome ||
            decision.approved ||
            decision.rejected ||
            decision.status === "decided"
        ) {
            return "decided";
        }

        return "draft";
    }

    static renderDecisionStatusBadge(decision = {}) {
        decision = decision || {};
        const status = this.getDecisionStatus(decision);
        const label = this.statusLabels[status] || LanguageManager.t("DecisionStatusDraft");

        return `
            <span class="evidence-status evidence-status--${status}">
                ${label}
            </span>
        `;
    }

    static getNextAction(decision = {}) {
        decision = decision || {};
        const status = this.getDecisionStatus
            ? this.getDecisionStatus(decision)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This decision cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm report",
                description: "Decision is reviewed and ready to support the final report output.",
                tone: "ready"
            };
        }

        if (status === "reported") {
            return {
                label: LanguageManager.t("DecisionReviewLinkedReport"),
                description: LanguageManager.t("DecisionAlreadyLinkedReportDescription"),
                tone: "linked"
            };
        }

        if (status === "decided") {
            return {
                label: "Prepare report",
                description: "The decision is complete enough to move into report preparation.",
                tone: "active"
            };
        }

        return {
            label: "Confirm decision",
            description: "Add a clear decision, outcome or approval state before preparing the report.",
            tone: "draft"
        };
    }

    static renderNextActionPanel(decision = {}) {
        decision = decision || {};
        const action = this.getNextAction(decision);

        return `
            <section class="next-action next-action--${action.tone}" aria-label="Next action">
                <div>
                    <span class="next-action__eyebrow">${LanguageManager.t("DecisionNextActionHeading")}</span>
                    <strong>${action.label}</strong>
                    <p>${action.description}</p>
                </div>
            </section>
        `;
    }

    static createNextActionPanel(decision = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(decision);
        return container;
    }

    static getCompletionState(decision = {}) {
        decision = decision || {};
        const hasTitle = Boolean(decision.title || decision.name);
        const hasDecision = Boolean(decision.decision || decision.outcome || decision.approved || decision.rejected);
        const hasDecisionMaker = Boolean(decision.decisionMaker || decision.approvedBy || decision.owner);
        const hasDate = Boolean(decision.decisionDate || decision.approvedAt || decision.date);
        const hasRecommendationLink = Boolean(
            decision.recommendationId ||
            decision.linkedRecommendationId ||
            decision.recommendation ||
            decision.hasRecommendation
        );
        const hasReportLink = Boolean(
            decision.reportId ||
            decision.linkedReportId ||
            decision.report ||
            decision.hasReport
        );

        const checks = [
            {
                key: "identity",
                label: LanguageManager.t("DecisionIdentifiedCheck"),
                complete: hasTitle
            },
            {
                key: "decision",
                label: LanguageManager.t("DecisionOutcomeDefinedCheck"),
                complete: hasDecision
            },
            {
                key: "owner",
                label: LanguageManager.t("DecisionOwnerDefinedCheck"),
                complete: hasDecisionMaker
            },
            {
                key: "date",
                label: LanguageManager.t("DecisionDateCapturedCheck"),
                complete: hasDate
            },
            {
                key: "recommendation",
                label: LanguageManager.t("DecisionRecommendationLinked"),
                complete: hasRecommendationLink
            },
            {
                key: "report",
                label: LanguageManager.t("DecisionReportConnection"),
                complete: hasReportLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForReport: hasDecision && hasDecisionMaker,
            isComplete: completed === total
        };
    }

    static renderCompletionPanel(decision = {}) {
        decision = decision || {};
        const completion = this.getCompletionState(decision);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForReport
            ? LanguageManager.t("DecisionReadyForReport")
            : LanguageManager.t("DecisionNeedsMoreData");

        return `
            <section class="completion-panel" aria-label="Decision completion">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">${LanguageManager.t("DecisionCompletionLabel")}</span>
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

    static createCompletionPanel(decision = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(decision);
        return container;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: LanguageManager.t("DecisionRefreshAction"),
                onClick: () => this.refresh()
            },
            {
                id: "close-decision",
                label: LanguageManager.t("DecisionCloseAction"),
                onClick: () => {
                    DecisionManager.clear();
                    this.refresh();
                }
            },
            {
                id: "decision-log",
                label: "Decision Log",
                onClick: () => this.createSampleDecision()
            },
            {
                id: "create-report",
                label: LanguageManager.t("DecisionCreateReportAction"),
                onClick: () => this.createReportFromSelectedDecision()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(decisions = this.getDecisions(), activeDecision = DecisionManager.get()) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(decisions));
        layout.appendChild(this.createDetailPanel(activeDecision, decisions));

        return layout;
    }

    static createContent(decisions = this.getDecisions()) {
        if (!decisions.length) {
            return EmptyState.create({
                eyebrow: LanguageManager.t("DecisionWorkspaceTitle"),
                title: LanguageManager.t("DecisionEmptyTitle"),
                description: LanguageManager.t("DecisionEmptyDescription"),
                actionLabel: LanguageManager.t("DecisionNewAction"),
                onAction: () => this.createSampleDecision()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        decisions.forEach(decision => {
            list.appendChild(this.createDecisionRow(decision));
        });

        return list;
    }

    static createDecisionRow(decision) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            DecisionManager.set(decision);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = decision.title || decision.id || "Decision Item";

        const meta = document.createElement("span");
        meta.textContent = [
            LanguageManager.t("DecisionOptionMonitor"),
            LanguageManager.t("DecisionOptionMedium"),
            decision.source || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderDecisionStatusBadge(decision);

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusContainer);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        [
            ["open", LanguageManager.t("ReportOpenAction")],
            ["edit", LanguageManager.t("ReportEditAction")],
            ["delete", LanguageManager.t("ReportDeleteAction")]
        ].forEach(([action, label]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button";
            button.textContent = label;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (action === "open") {
                    DecisionManager.set(decision);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    DecisionManager.set(decision);
                    this.editSelectedDecision();
                    return;
                }

                if (action === "delete") {
                    this.deleteDecision(decision);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static createDetailPanel(activeDecision = DecisionManager.get(), decisions = this.getDecisions()) {
        if (!activeDecision) {
            return DetailPanel.create(LanguageManager.t("DecisionContextTitle"), [
                { label: LanguageManager.t("DecisionTotalMetric"), value: String(decisions.length) },
                { label: LanguageManager.t("DecisionSelectedLabel"), value: LanguageManager.t("DecisionNotSelected") },
                { label: LanguageManager.t("DecisionWorkspaceStatusLabel"), value: LanguageManager.t("DecisionNoSelection") },
                { label: "Approval", value: decisions.length ? "In Review" : "Pending" },
                { label: LanguageManager.t("FinalNextStepLabel"), value: LanguageManager.t("FinalCreateOrSelectDecision") }
            ]);
        }

        const statusLabel = this.statusLabels[this.getDecisionStatus(activeDecision)] || LanguageManager.t("DecisionStatusDraft");

        return DetailPanel.create(LanguageManager.t("DecisionContextTitle"), [
            { label: LanguageManager.t("DecisionSelectedLabel"), value: activeDecision.title || activeDecision.id },
            { label: LanguageManager.t("DecisionWorkspaceStatusLabel"), value: statusLabel },
            { label: "Safety Boundaries", value: DetailPanel.createBoundaryBadges(activeDecision) },
            { label: LanguageManager.t("DecisionSourceLabel"), value: activeDecision.source || LanguageManager.t("DecisionRecommendationReviewSource") },
            { label: LanguageManager.t("DecisionCaseIdLabel"), value: activeDecision.caseId || LanguageManager.t("DecisionNotLinked") },
            { label: LanguageManager.t("DecisionBuildingIdLabel"), value: activeDecision.buildingId || LanguageManager.t("DecisionNotLinked") },
            { label: LanguageManager.t("DecisionInspectionIdLabel"), value: activeDecision.inspectionId || LanguageManager.t("DecisionNotLinked") },
            { label: LanguageManager.t("DecisionRecommendationIdsLabel"), value: (activeDecision.recommendationIds || []).join(", ") || LanguageManager.t("DecisionNone") },
            { label: LanguageManager.t("DecisionAssessmentIdsLabel"), value: (activeDecision.assessmentIds || []).join(", ") || LanguageManager.t("DecisionNone") },
            { label: LanguageManager.t("DecisionFindingIdsLabel"), value: (activeDecision.findingIds || []).join(", ") || LanguageManager.t("DecisionNone") },
            { label: LanguageManager.t("DecisionEvidenceIdsLabel"), value: (activeDecision.evidenceIds || []).join(", ") || LanguageManager.t("DecisionNone") },
            { label: LanguageManager.t("DecisionBuildingSystemLabel"), value: activeDecision.buildingSystem || LanguageManager.t("DecisionNotLinked") },
            { label: "Risk Score", value: String(activeDecision.riskScore || 0) },
            { label: "Decision Impact", value: activeDecision.decisionImpact || "Medium" },
            { label: "Decision Type", value: activeDecision.decisionType || "Monitor" },
            { label: "Risk Level", value: activeDecision.riskLevel || "Medium" },
            { label: LanguageManager.t("DecisionConfidenceField"), value: activeDecision.confidence !== null && activeDecision.confidence !== undefined ? `${activeDecision.confidence}%` : "Not set" },
            { label: "Rationale", value: activeDecision.rationale || "No rationale" },
            { label: LanguageManager.t("DecisionDescriptionField"), value: activeDecision.description || "No description" },
            { label: LanguageManager.t("DecisionReportIdsLabel"), value: (activeDecision.reportIds || []).join(", ") || LanguageManager.t("DecisionNone") },
            { label: LanguageManager.t("DecisionLinkedReportsMetric"), value: String(this.countReportsLinkedToDecision(activeDecision.id)) }
        ]);
    }

    static countReportsLinkedToDecision(decisionId = null) {
        const targetDecisionId = decisionId || DecisionManager.get()?.id;

        if (!targetDecisionId) {
            return 0;
        }

        return ReportManager.getAll()
            .filter(report => (report.decisionIds || []).includes(targetDecisionId))
            .length;
    }

    static createReportFromSelectedDecision() {
        const decision = DecisionManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!decision) {
            Notification.warning(LanguageManager.t("DecisionSelectFirstWarning"));
            return;
        }

        if (!decision.caseId) {
            Notification.warning("Selected decision is not linked to a case.");
            return;
        }

        if (currentCase && currentCase.id !== decision.caseId) {
            Notification.warning("Selected decision belongs to another case.");
            return;
        }

        const isPattayaDecision =
            decision.profile === "pattaya" ||
            String(decision.sourceQuestionId || "").startsWith("TH-PATTAYA-");

        const isAvailabilityCheckOnly = decision.sourcePolicy === "availability_check_only";

        const resolvedFindingIds = (decision.findingIds || []).length
            ? decision.findingIds
            : (decision.assessmentIds || [])
                .flatMap(id => AssessmentManager.load(id)?.findingIds || []);

        const riskScore = decision.riskScore || 0;

        const reportTitle = decision.title
            ? `${LanguageManager.t("DecisionReportDraftPrefix")}: ${decision.title}`
            : `${LanguageManager.t("DecisionReportDraftFrom")} ${decision.id}`;

        const executiveSummaryParts = [
            decision.description || LanguageManager.t("DecisionReportPreparedFromSelected"),
            "",
            LanguageManager.t("DecisionReportStatusLabel"),
            LanguageManager.t("DecisionDraftReportCreatedLine"),
            "Expert review required before final report, opinion, issue or delivery.",
            LanguageManager.t("DecisionNoAutomaticFinalReportLine")
        ];

        if (isAvailabilityCheckOnly) {
            executiveSummaryParts.push("");
            executiveSummaryParts.push("Review boundary:");
            executiveSummaryParts.push("Document availability only. No legal, financial, technical or governance document review has been performed.");
            executiveSummaryParts.push("This report draft may only preserve document availability context. It must not present document content as validated.");
        }

        if (isPattayaDecision) {
            executiveSummaryParts.push("");
            executiveSummaryParts.push("Thailand / Pattaya context:");
            executiveSummaryParts.push("Field review context retained for structured report preparation.");
        }

        executiveSummaryParts.push("");
        executiveSummaryParts.push("Decision trace:");
        executiveSummaryParts.push(`Decision ID: ${decision.id}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionSourceTraceLabel")}: ${decision.source || LanguageManager.t("DecisionRecommendationReviewSource")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionRecommendationIdsLabel")}: ${(decision.recommendationIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionAssessmentIdsLabel")}: ${(decision.assessmentIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionFindingIdsLabel")}: ${([...new Set(resolvedFindingIds)]).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionEvidenceIdsLabel")}: ${(decision.evidenceIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionSourceRecommendationIdsTraceLabel")}: ${(decision.sourceRecommendationIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionSourceAssessmentIdsTraceLabel")}: ${(decision.sourceAssessmentIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionSourceFindingIdsTraceLabel")}: ${(decision.sourceFindingIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionSourceEvidenceIdsTraceLabel")}: ${(decision.sourceEvidenceIds || []).join(", ") || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionSourcePolicyTraceLabel")}: ${decision.sourcePolicy || LanguageManager.t("DecisionNone")}`);
        executiveSummaryParts.push(`Risk score: ${riskScore}`);
        executiveSummaryParts.push(`Decision impact: ${decision.decisionImpact || "Medium"}`);
        executiveSummaryParts.push(`Decision support only: ${decision.decisionSupportOnly === false ? "No" : "Yes"}`);
        executiveSummaryParts.push(`${LanguageManager.t("DecisionNoAutomaticDecisionTraceLabel")}: ${decision.noAutomaticDecision === false ? LanguageManager.t("DecisionNo") : LanguageManager.t("DecisionYes")}`);
        executiveSummaryParts.push(`Expert review required: ${decision.expertReviewRequired === false ? "No" : "Yes"}`);
        executiveSummaryParts.push(`Rationale: ${decision.rationale || "No rationale"}`);

        const report = ReportManager.create({
            caseId: decision.caseId,
            buildingId: decision.buildingId || currentCase?.buildingId || null,
            inspectionId: decision.inspectionId || currentCase?.inspectionId || null,

            decisionIds: [decision.id],
            recommendationIds: decision.recommendationIds || [],
            assessmentIds: decision.assessmentIds || [],
            findingIds: [...new Set(resolvedFindingIds)],
            evidenceIds: decision.evidenceIds || [],

            sourceDecisionIds: [decision.id],
            sourceRecommendationIds: decision.sourceRecommendationIds || decision.recommendationIds || [],
            sourceAssessmentIds: decision.sourceAssessmentIds || decision.assessmentIds || [],
            sourceFindingIds: decision.sourceFindingIds || [...new Set(resolvedFindingIds)],
            sourceEvidenceIds: decision.sourceEvidenceIds || decision.evidenceIds || [],

            title: reportTitle,
            sourceTitle: decision.title || decision.id,
            reportType: "Technical Due Diligence",
            version: "1.0.0-draft",

            source: decision.source || "Decision Review",
            buildingSystem: decision.buildingSystem || "",
            riskScore,
            decisionImpact: decision.decisionImpact || "",
            riskLevel: decision.riskLevel || "",

            sourceQuestionId: decision.sourceQuestionId || "",
            sourceQuestion: decision.sourceQuestion || "",
            sourceModule: decision.sourceModule || "",
            sourceCategory: decision.sourceCategory || "",
            sourcePolicy: decision.sourcePolicy || "",
            sourceRequiredEvidenceRaw: decision.sourceRequiredEvidenceRaw || "",

            profile: isPattayaDecision ? "pattaya" : "",
            country: isPattayaDecision ? "TH" : "",
            region: isPattayaDecision ? "Pattaya / Chonburi" : "",

            executiveSummary: executiveSummaryParts.join("\n"),
            scope: isAvailabilityCheckOnly
                ? LanguageManager.t("DecisionReportPreparationDocumentAvailabilityOnly")
                : "Decision-based technical due diligence report preparation.",
            methodology: "Evidence-first workflow chain review. Expert review required before final report use.",

            decisions: [decision],
            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,
            reportPreparationOnly: true,
            noAutomaticFinalReport: true,
            noAutomaticOpinion: true,
            preparedBy: "MEIFERTS Building Intelligence",
            updatedBy: "System"
        });

        ReportManager.set(report);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                reportIds: [...new Set([...(activeCaseForSync.reportIds || []), report.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedDecision = DecisionManager.update({
            ...decision,
            reportIds: [...new Set([...(decision.reportIds || []), report.id])],
            linkedReportId: report.id,
            hasReport: true,
            updatedAt: new Date().toISOString()
        });

        DecisionManager.set(updatedDecision);

        Notification.success(LanguageManager.t("DecisionReportDraftCreated"));
        window.location.hash = "reports";
    }

    static getDecisions() {
        const currentCase = CaseManager.getCurrent();

        if (currentCase) {
            return DecisionManager.getByCase(currentCase.id);
        }

        return DecisionManager.getAll();
    }

    static createSampleDecision() {
        const activeRecommendation = RecommendationManager.get();
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();
        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();

        if (!activeRecommendation && !currentCase) {
            Notification.info(LanguageManager.t("DecisionOpenCaseOrRecommendationFirst"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("DecisionNewTitle"),
            submitLabel: LanguageManager.t("DecisionCreateAction"),
            values: {
                title: activeRecommendation?.title || "",
                description: activeRecommendation?.description || "",
                decisionType: "Monitor",
                rationale: activeRecommendation?.action || activeRecommendation?.description || "",
                riskLevel: activeRecommendation?.decisionImpact || activeRecommendation?.priority || "Medium",
                confidence: 70,
                status: "Draft"
            },
            fields: [
                {
                    id: "title",
                    label: LanguageManager.t("DecisionTitleField")
                },
                {
                    id: "description",
                    label: LanguageManager.t("DecisionDescriptionField")
                },
                {
                    id: "decisionType",
                    label: LanguageManager.t("DecisionTypeField"),
                    type: "select",
                    options: [
                          { value: "Monitor", label: LanguageManager.t("DecisionOptionMonitor") }
                      ]
                },
                {
                    id: "rationale",
                    label: LanguageManager.t("DecisionRationaleField")
                },
                {
                    id: "riskLevel",
                    label: LanguageManager.t("DecisionRiskLevelField"),
                    type: "select",
                    options: [
                          { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                          { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                          { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                          { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                      ]
                },
                {
                    id: "confidence",
                    label: LanguageManager.t("DecisionConfidenceField"),
                    type: "number"
                },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: [
                          { value: "Draft", label: LanguageManager.t("DecisionStatusDraft") },
                          { value: "Approved", label: LanguageManager.t("DecisionStatusApproved") },
                          { value: "Rejected", label: LanguageManager.t("DecisionStatusRejected") },
                          { value: "Deferred", label: LanguageManager.t("DecisionStatusDeferred") },
                          { value: "Blocked", label: LanguageManager.t("DecisionStatusBlocked") }
                      ]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                if (!activeRecommendation) {
            Notification.info(LanguageManager.t("DecisionSelectRecommendationBeforeCreating"));
            return;
        }

        const decision = DecisionManager.create({
                    caseId: activeRecommendation?.caseId || currentCase.id,
                    buildingId: activeRecommendation?.buildingId || currentBuilding?.id || null,
                    inspectionId: activeRecommendation?.inspectionId || currentInspection?.id || null,
                    recommendationId: activeRecommendation?.id || null,
                    recommendationIds: activeRecommendation ? [activeRecommendation.id] : [],
                    assessmentIds: activeRecommendation?.assessmentIds || [],
                    findingIds: activeRecommendation?.findingIds || [],
                    title: values.title,
                    description: values.description || "",
                    decisionType: values.decisionType || "Monitor",
                    rationale: values.rationale || "",
                    riskLevel: values.riskLevel || "Medium",
                    confidence: Number(values.confidence || 0),
                    status: values.status || "Draft"
                });

                DecisionManager.set(decision);
                dialog.remove();
                Notification.success(LanguageManager.t("DecisionCreatedNotification"));
                this.refresh();
            }
        });
    }

    static editSelectedDecision() {
        const decision = DecisionManager.get();

        if (!decision) {
            Notification.info(LanguageManager.t("DecisionSelectBeforeEditing"));
            return;
        }

        FormDialog.open({
            title: LanguageManager.t("DecisionEditTitle"),
            submitLabel: LanguageManager.t("DecisionSaveAction"),
            values: {
                title: decision.title || "",
                description: decision.description || "",
                decisionType: LanguageManager.t("DecisionOptionMonitor"),
                rationale: decision.rationale || "",
                riskLevel: LanguageManager.t("DecisionOptionMedium"),
                confidence: decision.confidence || 0,
                status: decision.status || "Draft"
            },
            fields: [
                { id: "title", label: LanguageManager.t("DecisionTitleField") },
                { id: "description", label: LanguageManager.t("DecisionDescriptionField") },
                {
                    id: "decisionType",
                    label: LanguageManager.t("DecisionTypeField"),
                    type: "select",
                    options: [
                          { value: "Monitor", label: LanguageManager.t("DecisionOptionMonitor") }
                      ]
                },
                { id: "rationale", label: LanguageManager.t("DecisionRationaleField") },
                {
                    id: "riskLevel",
                    label: LanguageManager.t("DecisionRiskLevelField"),
                    type: "select",
                    options: [
                          { value: "Low", label: LanguageManager.t("AssessmentOptionLow") },
                          { value: "Medium", label: LanguageManager.t("AssessmentOptionMedium") },
                          { value: "High", label: LanguageManager.t("AssessmentOptionHigh") },
                          { value: "Critical", label: LanguageManager.t("AssessmentOptionCritical") }
                      ]
                },
                { id: "confidence", label: LanguageManager.t("DecisionConfidenceField"), type: "number" },
                {
                    id: "status",
                    label: LanguageManager.t("CaseStatusLabel"),
                    type: "select",
                    options: [
                          { value: "Draft", label: LanguageManager.t("DecisionStatusDraft") },
                          { value: "Approved", label: LanguageManager.t("DecisionStatusApproved") },
                          { value: "Rejected", label: LanguageManager.t("DecisionStatusRejected") },
                          { value: "Deferred", label: LanguageManager.t("DecisionStatusDeferred") },
                          { value: "Blocked", label: LanguageManager.t("DecisionStatusBlocked") }
                      ]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = DecisionManager.update({
                    ...decision,
                    title: values.title,
                    description: values.description || "",
                    decisionType: values.decisionType || "Monitor",
                    rationale: values.rationale || "",
                    riskLevel: values.riskLevel || "Medium",
                    confidence: Number(values.confidence || 0),
                    status: values.status || "Draft",
                    updatedAt: new Date().toISOString()
                });

                DecisionManager.set(updated);
                dialog.remove();
                Notification.success(LanguageManager.t("DecisionUpdatedNotification"));
                this.refresh();
            }
        });
    }

    static deleteDecision(item) {
        if (!window.confirm(`${LanguageManager.t("DecisionDeleteConfirmPrefix")} "${item.title || item.id}"?`)) {
            return;
        }

        DecisionManager.delete(item.id);

        if (DecisionManager.get()?.id === item.id) {
            DecisionManager.clear();
        }

        Notification.success(LanguageManager.t("DecisionDeletedNotification"));
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} ${LanguageManager.t("DecisionPendingFeatureSuffix")}`);
    }

    static getDecisionIntelligence(decision = {}) {
        decision = decision || {};
        const hasIdentity = Boolean(decision.title || decision.name);
        const hasDecision = Boolean(decision.decision || decision.outcome || decision.approved || decision.rejected);
        const hasDecisionMaker = Boolean(decision.decisionMaker || decision.approvedBy || decision.owner);
        const hasDate = Boolean(decision.decisionDate || decision.approvedAt || decision.date);
        const hasRecommendationLink = Boolean(
            decision.recommendationId ||
            decision.linkedRecommendationId ||
            decision.recommendation ||
            decision.hasRecommendation
        );
        const hasReportLink = Boolean(
            decision.reportId ||
            decision.linkedReportId ||
            decision.report ||
            decision.hasReport
        );
        const isReviewed = Boolean(decision.reviewed || decision.status === "reviewed");

        const checks = [
            hasIdentity,
            hasDecision,
            hasDecisionMaker,
            hasDate,
            hasRecommendationLink,
            hasReportLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals:
                (hasDecision ? 1 : 0) +
                (hasDecisionMaker ? 1 : 0),
            downstreamSignals:
                (hasRecommendationLink ? 1 : 0) +
                (hasReportLink ? 1 : 0),
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.64,
                primary: 10,
                downstream: 8,
                output: 6
            }
        });

        let governanceSignal = {
            label: LanguageManager.t("DecisionLowGovernanceSignal"),
            description: LanguageManager.t("DecisionLowGovernanceSignalDescription"),
            tone: "draft"
        };

        if (hasDecision && hasDecisionMaker && hasRecommendationLink && hasReportLink) {
            governanceSignal = {
                label: LanguageManager.t("DecisionStrongGovernanceSignal"),
                description: LanguageManager.t("DecisionStrongGovernanceSignalDescription"),
                tone: "ready"
            };
        } else if (hasDecision && hasDecisionMaker) {
            governanceSignal = {
                label: LanguageManager.t("DecisionDevelopingGovernanceSignal"),
                description: LanguageManager.t("DecisionDevelopingGovernanceSignalDescription"),
                tone: "active"
            };
        }

        const nextAction = hasReportLink
            ? {
                label: LanguageManager.t("DecisionReviewLinkedReport"),
                description: LanguageManager.t("DecisionReviewLinkedReportDescription"),
                tone: "ready"
            }
            : hasDecision && hasDecisionMaker
                ? {
                    label: LanguageManager.t("DecisionCreateOrLinkReport"),
                    description: LanguageManager.t("DecisionCreateOrLinkReportDescription"),
                    tone: "active"
                }
                : {
                    label: LanguageManager.t("DecisionConfirmDecisionLogic"),
                    description: LanguageManager.t("DecisionConfirmDecisionLogicDescription"),
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            governanceSignal,
            nextAction,
            label: readinessPercent >= 100
                ? LanguageManager.t("DecisionIntelligenceComplete")
                : readinessPercent >= 50
                    ? LanguageManager.t("DecisionIntelligenceDeveloping")
                    : LanguageManager.t("DecisionIntelligenceEarly")
        };
    }

    static renderDecisionIntelligenceSnapshot(decision = {}) {
        decision = decision || {};
        const intelligence = this.getDecisionIntelligence(decision);

        return `
            <section class="decision-intelligence intelligence-snapshot" aria-label="${LanguageManager.t("DecisionIntelligenceLabel")}">
                <div class="decision-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="decision-intelligence__eyebrow intelligence-snapshot__eyebrow">${LanguageManager.t("DecisionIntelligenceLabel")}</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} ${LanguageManager.t("DecisionChecksCompleted")}</p>
                    </div>
                    <span class="decision-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="decision-intelligence__grid intelligence-snapshot__grid">
                    <article class="decision-intelligence__card intelligence-snapshot__card">
                        <span>${LanguageManager.t("DecisionReportReadiness")}</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>${LanguageManager.t("DecisionReportReadinessDescription")}</p>
                    </article>

                    <article class="decision-intelligence__card intelligence-snapshot__card decision-intelligence__card--${intelligence.governanceSignal.tone} intelligence-snapshot__card--${intelligence.governanceSignal.tone}">
                        <span>${LanguageManager.t("DecisionGovernanceSignalLabel")}</span>
                        <strong>${intelligence.governanceSignal.label}</strong>
                        <p>${intelligence.governanceSignal.description}</p>
                    </article>

                    <article class="decision-intelligence__card intelligence-snapshot__card decision-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>${LanguageManager.t("DecisionNextActionLabel")}</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createDecisionIntelligenceSnapshot(decision = DecisionManager.get()) {
        if (!decision || !decision.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderDecisionIntelligenceSnapshot(decision);
        return container;
    }

}
