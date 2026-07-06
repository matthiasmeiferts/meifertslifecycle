import DecisionManager from "../../core/DecisionManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import ReportManager from "../../core/ReportManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
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
            label: "Decision",
            description: "Governance decision confirmed"
        },
        {
            key: "report",
            label: "Report",
            description: "Report output prepared"
        }
    ];

    static statusLabels = {
        draft: "Draft",
        decided: "Decided",
        reported: "Reported",
        reviewed: "Reviewed",
        blocked: "Blocked"
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
            eyebrow: "Decision Workspace",
            title: "Decisions",
            description: "Record expert decisions, document reasoning, confidence, approval status, and traceability.",
            actions: [
                {
                    id: "new-decision",
                    label: "+ New Decision",
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

        grid.appendChild(MetricCard.create("Decisions", decisions.length));
        grid.appendChild(MetricCard.create("Pending", pendingCount));
        grid.appendChild(MetricCard.create("Approved", approvedCount));
        grid.appendChild(MetricCard.create("Linked Reports", this.countReportsLinkedToDecision()));

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
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>Decision → Report</strong>
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
        const label = this.statusLabels[status] || "Draft";

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
                label: "Review linked report",
                description: "This decision is already connected to a report. Check final output completeness.",
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
                    <span class="next-action__eyebrow">Next Action</span>
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
                label: "Decision identified",
                complete: hasTitle
            },
            {
                key: "decision",
                label: "Decision outcome defined",
                complete: hasDecision
            },
            {
                key: "owner",
                label: "Decision owner defined",
                complete: hasDecisionMaker
            },
            {
                key: "date",
                label: "Decision date captured",
                complete: hasDate
            },
            {
                key: "recommendation",
                label: "Recommendation linked",
                complete: hasRecommendationLink
            },
            {
                key: "report",
                label: "Report connection",
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
            ? "Ready for Report"
            : "Needs more decision data";

        return `
            <section class="completion-panel" aria-label="Decision completion">
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
                label: "Refresh",
                onClick: () => this.refresh()
            },
            {
                id: "close-decision",
                label: "Close Decision",
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
                label: "Create Report",
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
                eyebrow: "Decision Workspace",
                title: "No decisions available",
                description: "Decisions will connect recommendations, expert reasoning, confidence, approval, and report traceability.",
                actionLabel: "+ New Decision",
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
            decision.decisionType || "Monitor",
            decision.riskLevel || "Medium",
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
            ["open", "Open"],
            ["edit", "Edit"],
            ["delete", "Delete"]
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
            return DetailPanel.create("Decision Context", [
                { label: "Decisions", value: String(decisions.length) },
                { label: "Selected Decision", value: "Not selected" },
                { label: "Workspace Status", value: "No selection" },
                { label: "Approval", value: decisions.length ? "In Review" : "Pending" },
                { label: "Next Step", value: "Create or select a decision" }
            ]);
        }

        const statusLabel = this.statusLabels[this.getDecisionStatus(activeDecision)] || "Draft";

        return DetailPanel.create("Decision Context", [
            { label: "Selected Decision", value: activeDecision.title || activeDecision.id },
            { label: "Workspace Status", value: statusLabel },
            { label: "Safety Boundaries", value: DetailPanel.createBoundaryBadges(activeDecision) },
            { label: "Source", value: activeDecision.source || "Recommendation Review" },
            { label: "Case ID", value: activeDecision.caseId || "Not linked" },
            { label: "Building ID", value: activeDecision.buildingId || "Not linked" },
            { label: "Inspection ID", value: activeDecision.inspectionId || "Not linked" },
            { label: "Recommendation IDs", value: (activeDecision.recommendationIds || []).join(", ") || "None" },
            { label: "Assessment IDs", value: (activeDecision.assessmentIds || []).join(", ") || "None" },
            { label: "Finding IDs", value: (activeDecision.findingIds || []).join(", ") || "None" },
            { label: "Evidence IDs", value: (activeDecision.evidenceIds || []).join(", ") || "None" },
            { label: "Building System", value: activeDecision.buildingSystem || "Not linked" },
            { label: "Risk Score", value: String(activeDecision.riskScore || 0) },
            { label: "Decision Impact", value: activeDecision.decisionImpact || "Medium" },
            { label: "Decision Type", value: activeDecision.decisionType || "Monitor" },
            { label: "Risk Level", value: activeDecision.riskLevel || "Medium" },
            { label: "Confidence", value: activeDecision.confidence !== null && activeDecision.confidence !== undefined ? `${activeDecision.confidence}%` : "Not set" },
            { label: "Rationale", value: activeDecision.rationale || "No rationale" },
            { label: "Description", value: activeDecision.description || "No description" },
            { label: "Report IDs", value: (activeDecision.reportIds || []).join(", ") || "None" },
            { label: "Linked Reports", value: String(this.countReportsLinkedToDecision(activeDecision.id)) }
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
            Notification.warning("Select a decision first.");
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
            ? `Report Draft: ${decision.title}`
            : `Report Draft from ${decision.id}`;

        const executiveSummaryParts = [
            decision.description || "Report draft prepared from selected decision.",
            "",
            "Report status:",
            "Draft report preparation record created from selected decision.",
            "Expert review required before final report, opinion, issue or delivery.",
            "No automatic final report, expert opinion, purchase recommendation or Go/No-Go result is created by this action."
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
        executiveSummaryParts.push(`Decision source: ${decision.source || "Recommendation Review"}`);
        executiveSummaryParts.push(`Recommendation IDs: ${(decision.recommendationIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Assessment IDs: ${(decision.assessmentIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Finding IDs: ${([...new Set(resolvedFindingIds)]).join(", ") || "None"}`);
        executiveSummaryParts.push(`Evidence IDs: ${(decision.evidenceIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Source Recommendation IDs: ${(decision.sourceRecommendationIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Source Assessment IDs: ${(decision.sourceAssessmentIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Source Finding IDs: ${(decision.sourceFindingIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Source Evidence IDs: ${(decision.sourceEvidenceIds || []).join(", ") || "None"}`);
        executiveSummaryParts.push(`Source policy: ${decision.sourcePolicy || "None"}`);
        executiveSummaryParts.push(`Risk score: ${riskScore}`);
        executiveSummaryParts.push(`Decision impact: ${decision.decisionImpact || "Medium"}`);
        executiveSummaryParts.push(`Decision support only: ${decision.decisionSupportOnly === false ? "No" : "Yes"}`);
        executiveSummaryParts.push(`No automatic decision: ${decision.noAutomaticDecision === false ? "No" : "Yes"}`);
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
                ? "Report preparation based on document availability context only."
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

        Notification.success("Report draft created. Expert review required. No final report created.");
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
            Notification.info("Open a case or recommendation before creating a decision.");
            return;
        }

        FormDialog.open({
            title: "New Decision",
            submitLabel: "Create Decision",
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
                    label: "Decision title"
                },
                {
                    id: "description",
                    label: "Description"
                },
                {
                    id: "decisionType",
                    label: "Decision type",
                    type: "select",
                    options: ["Monitor"]
                },
                {
                    id: "rationale",
                    label: "Decision rationale"
                },
                {
                    id: "riskLevel",
                    label: "Risk level",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "confidence",
                    label: "Confidence",
                    type: "number"
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Draft", "Approved", "Rejected", "Deferred", "Blocked"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                if (!activeRecommendation) {
            Notification.info("Select a recommendation before creating a decision.");
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
                Notification.success("Decision created.");
                this.refresh();
            }
        });
    }

    static editSelectedDecision() {
        const decision = DecisionManager.get();

        if (!decision) {
            Notification.info("Select a decision before editing.");
            return;
        }

        FormDialog.open({
            title: "Edit Decision",
            submitLabel: "Save Decision",
            values: {
                title: decision.title || "",
                description: decision.description || "",
                decisionType: decision.decisionType || "Monitor",
                rationale: decision.rationale || "",
                riskLevel: decision.riskLevel || "Medium",
                confidence: decision.confidence || 0,
                status: decision.status || "Draft"
            },
            fields: [
                { id: "title", label: "Decision title" },
                { id: "description", label: "Description" },
                {
                    id: "decisionType",
                    label: "Decision type",
                    type: "select",
                    options: ["Monitor"]
                },
                { id: "rationale", label: "Decision rationale" },
                {
                    id: "riskLevel",
                    label: "Risk level",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                { id: "confidence", label: "Confidence", type: "number" },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Draft", "Approved", "Rejected", "Deferred", "Blocked"]
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
                Notification.success("Decision updated.");
                this.refresh();
            }
        });
    }

    static deleteDecision(item) {
        if (!window.confirm(`Delete decision "${item.title || item.id}"?`)) {
            return;
        }

        DecisionManager.delete(item.id);

        if (DecisionManager.get()?.id === item.id) {
            DecisionManager.clear();
        }

        Notification.success("Decision deleted.");
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} is reserved for a later workspace release.`);
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
            label: "Low governance signal",
            description: "Decision logic is still incomplete. Define outcome, owner and recommendation context.",
            tone: "draft"
        };

        if (hasDecision && hasDecisionMaker && hasRecommendationLink && hasReportLink) {
            governanceSignal = {
                label: "Strong governance signal",
                description: "Decision has clear governance context and is connected to final report output.",
                tone: "ready"
            };
        } else if (hasDecision && hasDecisionMaker) {
            governanceSignal = {
                label: "Developing governance signal",
                description: "Decision has usable governance context but may still need recommendation or report linkage.",
                tone: "active"
            };
        }

        const nextAction = hasReportLink
            ? {
                label: "Review linked report",
                description: "Decision is connected to a report. Review whether the final output reflects the decision accurately.",
                tone: "ready"
            }
            : hasDecision && hasDecisionMaker
                ? {
                    label: "Create or link report",
                    description: "Decision is complete enough to move into report preparation.",
                    tone: "active"
                }
                : {
                    label: "Confirm decision logic",
                    description: "Add decision outcome and decision owner before moving toward report output.",
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
                ? "Decision intelligence complete"
                : readinessPercent >= 50
                    ? "Decision intelligence developing"
                    : "Decision intelligence early"
        };
    }

    static renderDecisionIntelligenceSnapshot(decision = {}) {
        decision = decision || {};
        const intelligence = this.getDecisionIntelligence(decision);

        return `
            <section class="decision-intelligence intelligence-snapshot" aria-label="Decision intelligence snapshot">
                <div class="decision-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="decision-intelligence__eyebrow intelligence-snapshot__eyebrow">Decision Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} decision intelligence checks completed</p>
                    </div>
                    <span class="decision-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="decision-intelligence__grid intelligence-snapshot__grid">
                    <article class="decision-intelligence__card intelligence-snapshot__card">
                        <span>Report Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, decision outcome, owner, date, recommendation link, report link and review state.</p>
                    </article>

                    <article class="decision-intelligence__card intelligence-snapshot__card decision-intelligence__card--${intelligence.governanceSignal.tone} intelligence-snapshot__card--${intelligence.governanceSignal.tone}">
                        <span>Governance Signal</span>
                        <strong>${intelligence.governanceSignal.label}</strong>
                        <p>${intelligence.governanceSignal.description}</p>
                    </article>

                    <article class="decision-intelligence__card intelligence-snapshot__card decision-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Decision Action</span>
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
