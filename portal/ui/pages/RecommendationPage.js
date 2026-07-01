import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import DecisionManager from "../../core/DecisionManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

export default class RecommendationPage {

    static render() {
        const fragment = document.createDocumentFragment();
        const recommendations = this.getRecommendations();
        const activeRecommendation = RecommendationManager.get();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMetrics(recommendations));
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(recommendations, activeRecommendation));

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

        grid.appendChild(MetricCard.create("Recommendations", recommendations.length));
        grid.appendChild(MetricCard.create("High Priority", highPriorityCount));
        grid.appendChild(MetricCard.create("Immediate", immediateCount));
        grid.appendChild(MetricCard.create("Linked Decisions", this.countDecisionsLinkedToRecommendation()));

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
                onClick: () => this.createSampleRecommendation()
            },
            {
                id: "create-decision",
                label: "Create Decision",
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
                eyebrow: "Recommendation Workspace",
                title: "No recommendations available",
                description: "Recommendations will translate assessment results into prioritized technical actions and decision support.",
                actionLabel: "+ New Recommendation",
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

    static createRecommendationRow(recommendation) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            RecommendationManager.set(recommendation);
            this.refresh();
        });

        const title = document.createElement("strong");
        title.textContent = recommendation.title || recommendation.id || "Recommendation Item";

        const meta = document.createElement("span");
        meta.textContent = `${recommendation.priority || "Medium"} · ${recommendation.timeframe || "Short Term"}`;

        const badge = StatusBadge.create(recommendation.status || "Draft", "warning");

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeRecommendation = RecommendationManager.get(), recommendations = this.getRecommendations()) {
        if (!activeRecommendation) {
            return DetailPanel.create("Recommendation Context", [
                { label: "Recommendations", value: String(recommendations.length) },
                { label: "Selected Recommendation", value: "Not selected" },
                { label: "Decision Relevance", value: recommendations.length ? "In Review" : "Pending" },
                { label: "Next Step", value: "Create or select a recommendation" }
            ]);
        }

        return DetailPanel.create("Recommendation Context", [
            { label: "Selected Recommendation", value: activeRecommendation.title || activeRecommendation.id },
            { label: "Priority", value: activeRecommendation.priority || "Medium" },
            { label: "Timeframe", value: activeRecommendation.timeframe || "Short Term" },
            { label: "Linked Decisions", value: String(this.countDecisionsLinkedToRecommendation(activeRecommendation.id)) }
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

    static createDecisionFromSelectedRecommendation() {
        const recommendation = RecommendationManager.get();

        if (!recommendation) {
            Notification.warning("Select a recommendation first.");
            return;
        }

        const decision = DecisionManager.create({
            caseId: recommendation.caseId,
            buildingId: recommendation.buildingId,
            inspectionId: recommendation.inspectionId,
            recommendationIds: [recommendation.id],
            assessmentIds: recommendation.assessmentIds || [],
            findingIds: recommendation.findingIds || [],
            title: `Decision from ${recommendation.title || recommendation.id}`,
            description: recommendation.description || "Decision generated from selected recommendation.",
            decisionType: "Monitor",
            rationale: recommendation.action || recommendation.description || "",
            riskLevel: recommendation.decisionImpact || recommendation.priority || "Medium",
            confidence: 70,
            status: "Draft"
        });

        DecisionManager.set(decision);
        Notification.success("Decision created from selected recommendation.");
        WorkspaceRouter.navigate("decisions");
    }

    static getRecommendations() {
        return RecommendationManager.getAll();
    }

    static createSampleRecommendation() {
        const recommendation = RecommendationManager.create({
            caseId: "demo-case",
            buildingId: "demo-building",
            inspectionId: "demo-inspection",
            title: "Sample Recommendation",
            description: "Initial recommendation record created from the workspace.",
            action: "Review and implement corrective action.",
            priority: "Medium",
            timeframe: "Short Term",
            estimatedCost: 0,
            currency: "EUR",
            responsible: "Owner",
            decisionImpact: "Medium",
            status: "Draft"
        });

        RecommendationManager.set(recommendation);
        Notification.success("Recommendation created.");
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