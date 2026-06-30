import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import Notification from "../components/Notification.js";

export default class AssessmentPage {

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
            eyebrow: "Assessment Workspace",
            title: "Assessments",
            description: "Evaluate findings, determine condition, estimate remaining useful life, assess technical risk, and prepare CAPEX planning.",
            actions: [
                {
                    id: "new-assessment",
                    label: "+ New Assessment",
                    onClick: () => this.showPendingFeature("Assessment creation")
                }
            ]
        });
    }

    static createMetrics() {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Assessments", "0"));
        grid.appendChild(MetricCard.create("Risk Items", "Pending"));
        grid.appendChild(MetricCard.create("RUL", "Pending"));
        grid.appendChild(MetricCard.create("CAPEX", "Pending"));

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
                id: "risk-model",
                label: "Risk Model",
                onClick: () => this.showPendingFeature("Risk model")
            },
            {
                id: "capex-model",
                label: "CAPEX Model",
                onClick: () => this.showPendingFeature("CAPEX model")
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
            eyebrow: "Assessment Workspace",
            title: "No assessments available",
            description: "Assessment records will translate findings into condition, risk, remaining useful life, and CAPEX logic.",
            actionLabel: "+ New Assessment",
            onAction: () => this.showPendingFeature("Assessment creation")
        });
    }

    static createDetailPanel() {
        return DetailPanel.create("Assessment Context", [
            { label: "Condition", value: "Not assessed" },
            { label: "Technical Risk", value: "Pending" },
            { label: "Remaining Useful Life", value: "Pending" },
            { label: "Next Step", value: "Create AssessmentManager" }
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