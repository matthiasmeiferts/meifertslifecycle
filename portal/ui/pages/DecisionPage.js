import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

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
        fragment.appendChild(this.createMetrics(decisions));
        if (activeDecision) {
            fragment.appendChild(this.createFlowIndicator(activeDecision));
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
        const status = this.getDecisionStatus(decision);
        const label = this.statusLabels[status] || "Draft";

        return `
            <span class="evidence-status evidence-status--${status}">
                ${label}
            </span>
        `;
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
        const row = document.createElement("button");
        row.type = "button";
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            DecisionManager.set(decision);
            this.refresh();
        });

        const title = document.createElement("strong");
        title.textContent = decision.title || decision.id || "Decision Item";

        const meta = document.createElement("span");
        meta.textContent = `${decision.decisionType || "Monitor"} · ${decision.riskLevel || "Medium"}`;

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderDecisionStatusBadge(decision);

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(statusContainer);

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
            { label: "Decision Type", value: activeDecision.decisionType || "Monitor" },
            { label: "Risk Level", value: activeDecision.riskLevel || "Medium" },
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

        if (!decision) {
            Notification.warning("Select a decision first.");
            return;
        }

        const report = ReportManager.create({
            caseId: decision.caseId,
            buildingId: decision.buildingId,
            inspectionId: decision.inspectionId,
            decisionIds: [decision.id],
            recommendationIds: decision.recommendationIds || [],
            assessmentIds: decision.assessmentIds || [],
            findingIds: decision.findingIds || [],
            title: `Report from ${decision.title || decision.id}`,
            reportType: "Technical Due Diligence",
            version: "1.0.0",
            executiveSummary: decision.description || "Report generated from selected decision.",
            scope: "Decision-based technical due diligence report.",
            methodology: "Evidence-first workflow chain review.",
            decisions: [decision],
            status: "Draft"
        });

        ReportManager.set(report);
        Notification.success("Report created from selected decision.");
        WorkspaceRouter.navigate("reports");
    }

    static getDecisions() {
        return DecisionManager.getAll();
    }

    static createSampleDecision() {
        const decision = DecisionManager.create({
            caseId: "demo-case",
            buildingId: "demo-building",
            inspectionId: "demo-inspection",
            title: "Sample Decision",
            description: "Initial decision record created from the workspace.",
            decisionType: "Monitor",
            rationale: "Review technical risk and recommendation chain before final approval.",
            riskLevel: "Medium",
            confidence: 70,
            status: "Draft"
        });

        DecisionManager.set(decision);
        Notification.success("Decision created.");
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

}