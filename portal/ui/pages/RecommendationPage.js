import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import Notification from "../components/Notification.js";

export default class RecommendationPage {

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
            eyebrow: "Recommendation Workspace",
            title: "Recommendations",
            description: "Develop technical recommendations, define priorities, estimate CAPEX, and prepare expert decision support.",
            actions: [
                {
                    id: "new-recommendation",
                    label: "+ New Recommendation",
                    onClick: () => this.showPendingFeature("Recommendation creation")
                }
            ]
        });
    }

    static createMetrics() {
        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Recommendations", "0"));
        grid.appendChild(MetricCard.create("High Priority", "Pending"));
        grid.appendChild(MetricCard.create("CAPEX Range", "Pending"));
        grid.appendChild(MetricCard.create("Decision Ready", "No"));

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
                id: "prioritize",
                label: "Prioritize",
                onClick: () => this.showPendingFeature("Recommendation prioritization")
            },
            {
                id: "capex-review",
                label: "CAPEX Review",
                onClick: () => this.showPendingFeature("CAPEX review")
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
            eyebrow: "Recommendation Workspace",
            title: "No recommendations available",
            description: "Recommendations will translate assessment results into prioritized technical actions and decision support.",
            actionLabel: "+ New Recommendation",
            onAction: () => this.showPendingFeature("Recommendation creation")
        });
    }

    static createDetailPanel() {
        return DetailPanel.create("Recommendation Context", [
            { label: "Priority", value: "Not defined" },
            { label: "CAPEX Impact", value: "Pending" },
            { label: "Decision Relevance", value: "Pending" },
            { label: "Next Step", value: "Create RecommendationManager" }
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