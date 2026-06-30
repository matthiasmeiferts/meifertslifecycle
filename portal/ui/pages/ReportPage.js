import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import Notification from "../components/Notification.js";

export default class ReportPage {

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

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
                    onClick: () => this.showPendingFeature("Report creation")
                }
            ]
        });
    }

    static createMetrics() {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Reports", "0"));
        grid.appendChild(MetricCard.create("Drafts", "0"));
        grid.appendChild(MetricCard.create("Ready", "0"));
        grid.appendChild(MetricCard.create("Published", "0"));

        return grid;
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
                onClick: () => this.showPendingFeature("Report generation")
            },
            {
                id: "export-pdf",
                label: "Export PDF",
                onClick: () => this.showPendingFeature("PDF export")
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent());
        layout.appendChild(this.createDetailPanel());

        return layout;
    }

    static createContent() {
        return EmptyState.create({
            eyebrow: "Report Workspace",
            title: "No reports available",
            description: "Reports will compile evidence, findings, assessments, recommendations, and decisions into a professional output.",
            actionLabel: "+ New Report",
            onAction: () => this.showPendingFeature("Report creation")
        });
    }

    static createDetailPanel() {
        return DetailPanel.create("Report Context", [
            { label: "Report Status", value: "Not started" },
            { label: "Executive Summary", value: "Pending" },
            { label: "Export Format", value: "PDF pending" },
            { label: "Next Step", value: "Create ReportManager" }
        ]);
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