import ReportManager from "../../core/ReportManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

export default class ReportPage {

    static outputSteps = [
        {
            key: "decision",
            label: "Decision",
            description: "Governance decision confirmed"
        },
        {
            key: "report",
            label: "Report",
            description: "Final report output prepared"
        }
    ];
        const fragment = document.createDocumentFragment();
        const reports = this.getReports();
        const activeReport = ReportManager.get();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMetrics(reports));
        if (activeReport) {
            fragment.appendChild(this.createFinalOutputState(activeReport));
        }
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(reports, activeReport));

        return fragment;
    }

    static createHeader() {
        return SectionHeader.create({
            eyebrow: "Report Workspace",
            title: "Reports",
            description: "Generate professional Technical Due Diligence reports, executive summaries, and Building Intelligence documents.",
            actions: [
                {
                    id: "new-report",
                    label: "+ New Report",
                    onClick: () => this.createSampleReport()
                }
            ]
        });
    }

    static createMetrics(reports = this.getReports()) {
        const draftCount = reports.filter(item => item.status === "Draft").length;
        const approvedCount = reports.filter(item => item.status === "Approved").length;
        const archivedCount = reports.filter(item => item.status === "Archived").length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Reports", reports.length));
        grid.appendChild(MetricCard.create("Drafts", draftCount));
        grid.appendChild(MetricCard.create("Approved", approvedCount));
        grid.appendChild(MetricCard.create("Archived", archivedCount));

        return grid;
    }

    static getOutputState(report = {}) {
        const hasDecisionLink =
            Boolean(report.decisionId) ||
            Boolean(report.linkedDecisionId) ||
            Boolean(report.decision) ||
            Boolean(report.hasDecision);

        const isFinalized =
            Boolean(report.finalized) ||
            Boolean(report.approved) ||
            report.status === "final" ||
            report.status === "finalized" ||
            report.status === "approved";

        return {
            decision: hasDecisionLink ? "complete" : "next",
            report: isFinalized ? "complete" : "active"
        };
    }

    static renderFinalOutputState(report = {}) {
        const outputState = this.getOutputState(report);

        return `
            <section class="workspace-flow" aria-label="Final output state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Final Output</span>
                    <strong>Decision → Report</strong>
                </div>

                <div class="workspace-flow__steps">
                    ${this.outputSteps.map((step) => `
                        <div class="workspace-flow__step workspace-flow__step--${outputState[step.key]}">
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

    static createFinalOutputState(report = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderFinalOutputState(report);
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
                id: "generate-report",
                label: "Generate Report",
                onClick: () => this.createSampleReport()
            },
            {
                id: "export-pdf",
                label: "Export PDF",
                onClick: () => this.showPendingFeature("PDF export")
            }
        ]));

        return wrapper;
    }

    static createMainLayout(reports = this.getReports(), activeReport = ReportManager.get()) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(reports));
        layout.appendChild(this.createDetailPanel(activeReport, reports));

        return layout;
    }

    static createContent(reports = this.getReports()) {
        if (!reports.length) {
            return EmptyState.create({
                eyebrow: "Report Workspace",
                title: "No reports available",
                description: "Reports will compile evidence, findings, assessments, recommendations, and decisions into a professional output.",
                actionLabel: "+ New Report",
                onAction: () => this.createSampleReport()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        reports.forEach(report => {
            list.appendChild(this.createReportRow(report));
        });

        return list;
    }

    static createReportRow(report) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            ReportManager.set(report);
            this.refresh();
        });

        const title = document.createElement("strong");
        title.textContent = report.title || report.id || "Report Item";

        const meta = document.createElement("span");
        meta.textContent = `${report.reportType || "Technical Due Diligence"} · ${report.version || "1.0.0"}`;

        const badge = StatusBadge.create(report.status || "Draft", "warning");

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeReport = ReportManager.get(), reports = this.getReports()) {
        if (!activeReport) {
            return DetailPanel.create("Report Context", [
                { label: "Reports", value: String(reports.length) },
                { label: "Selected Report", value: "Not selected" },
                { label: "Executive Summary", value: reports.length ? "Available in draft" : "Pending" },
                { label: "Next Step", value: "Create or select a report" }
            ]);
        }

        return DetailPanel.create("Report Context", [
            { label: "Selected Report", value: activeReport.title || activeReport.id },
            { label: "Report Status", value: activeReport.status || "Draft" },
            { label: "Report Type", value: activeReport.reportType || "Technical Due Diligence" },
            { label: "Export Format", value: "PDF pending" }
        ]);
    }

    static getReports() {
        return ReportManager.getAll();
    }

    static createSampleReport() {
        const report = ReportManager.create({
            caseId: "demo-case",
            buildingId: "demo-building",
            inspectionId: "demo-inspection",
            title: "Sample Building Intelligence Report",
            reportType: "Technical Due Diligence",
            version: "1.0.0",
            executiveSummary: "Initial report record created from the workspace.",
            scope: "Demo technical due diligence scope.",
            methodology: "Evidence-based workflow review.",
            status: "Draft"
        });

        ReportManager.set(report);
        Notification.success("Report created.");
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