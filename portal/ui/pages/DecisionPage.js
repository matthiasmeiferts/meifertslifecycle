import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import Notification from "../components/Notification.js";

export default class DecisionPage {

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
            eyebrow: "Decision Workspace",
            title: "Decisions",
            description: "Record expert decisions, document reasoning, confidence, approval status, and traceability.",
            actions: [
                {
                    id: "new-decision",
                    label: "+ New Decision",
                    onClick: () => this.showPendingFeature("Decision creation")
                }
            ]
        });
    }

    static createMetrics() {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Decisions", "0"));
        grid.appendChild(MetricCard.create("Pending", "0"));
        grid.appendChild(MetricCard.create("Approved", "0"));
        grid.appendChild(MetricCard.create("Confidence", "Pending"));

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
                id: "decision-log",
                label: "Decision Log",
                onClick: () => this.showPendingFeature("Decision log")
            },
            {
                id: "approval-flow",
                label: "Approval Flow",
                onClick: () => this.showPendingFeature("Approval flow")
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
            eyebrow: "Decision Workspace",
            title: "No decisions available",
            description: "Decisions will connect recommendations, expert reasoning, confidence, approval, and report traceability.",
            actionLabel: "+ New Decision",
            onAction: () => this.showPendingFeature("Decision creation")
        });
    }

    static createDetailPanel() {
        return DetailPanel.create("Decision Context", [
            { label: "Decision Status", value: "Not started" },
            { label: "Confidence", value: "Pending" },
            { label: "Approval", value: "Pending" },
            { label: "Next Step", value: "Create DecisionManager" }
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