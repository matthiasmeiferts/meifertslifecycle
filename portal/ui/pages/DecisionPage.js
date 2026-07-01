import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import DecisionManager from "../../core/DecisionManager.js";
import ReportManager from "../../core/ReportManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
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
            fragment.appendChild(this.createNextActionPanel(activeDecision));
            fragment.appendChild(this.createCompletionPanel(activeDecision));
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

    static getNextAction(decision = {}) {
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

    static getDecisionIntelligence(decision = {}) {
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
        const intelligence = this.getDecisionIntelligence(decision);

        return `
            <section class="decision-intelligence" aria-label="Decision intelligence snapshot">
                <div class="decision-intelligence__header">
                    <div>
                        <span class="decision-intelligence__eyebrow">Decision Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} decision intelligence checks completed</p>
                    </div>
                    <span class="decision-intelligence__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="decision-intelligence__grid">
                    <article class="decision-intelligence__card">
                        <span>Report Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, decision outcome, owner, date, recommendation link, report link and review state.</p>
                    </article>

                    <article class="decision-intelligence__card decision-intelligence__card--${intelligence.governanceSignal.tone}">
                        <span>Governance Signal</span>
                        <strong>${intelligence.governanceSignal.label}</strong>
                        <p>${intelligence.governanceSignal.description}</p>
                    </article>

                    <article class="decision-intelligence__card decision-intelligence__card--${intelligence.nextAction.tone}">
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