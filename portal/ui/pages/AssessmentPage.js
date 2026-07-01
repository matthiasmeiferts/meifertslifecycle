import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

export default class AssessmentPage {

    static flowSteps = [
        {
            key: "assessment",
            label: "Assessment",
            description: "Risk assessment defined"
        },
        {
            key: "recommendation",
            label: "Recommendation",
            description: "Action recommendation derived"
        }
    ];

    static statusLabels = {
        draft: "Draft",
        assessed: "Assessed",
        recommended: "Recommended",
        reviewed: "Reviewed",
        blocked: "Blocked"
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const assessments = this.getAssessments();
        const activeAssessment = AssessmentManager.get();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createFlowIndicator(activeAssessment));
        fragment.appendChild(this.createMetrics(assessments));
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(assessments, activeAssessment));

        return fragment;
    }

    static getFlowState(assessment = {}) {
        const hasRecommendationLink =
            Boolean(assessment.recommendationId) ||
            Boolean(assessment.linkedRecommendationId) ||
            Boolean(assessment.recommendation) ||
            Boolean(assessment.hasRecommendation);

        return {
            assessment: "active",
            recommendation: hasRecommendationLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(assessment = {}) {
        const flowState = this.getFlowState(assessment);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>Assessment → Recommendation</strong>
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

    static createFlowIndicator(assessment = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(assessment);
        return container;
    }

    static getAssessmentStatus(assessment = {}) {
        if (assessment.blocked || assessment.status === "blocked") {
            return "blocked";
        }

        if (assessment.reviewed || assessment.status === "reviewed") {
            return "reviewed";
        }

        if (
            assessment.recommendationId ||
            assessment.linkedRecommendationId ||
            assessment.recommendation ||
            assessment.hasRecommendation ||
            assessment.status === "recommended"
        ) {
            return "recommended";
        }

        if (
            assessment.assessed ||
            assessment.riskLevel ||
            assessment.riskScore ||
            assessment.severity ||
            assessment.probability ||
            assessment.impact ||
            assessment.status === "assessed"
        ) {
            return "assessed";
        }

        return "draft";
    }

    static renderAssessmentStatusBadge(assessment = {}) {
        const status = this.getAssessmentStatus(assessment);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
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
                    onClick: () => this.createSampleAssessment()
                }
            ]
        });
    }

    static createMetrics(assessments = this.getAssessments()) {
        const highRiskCount = assessments.filter(item => item.severity === "High" || item.severity === "Critical").length;
        const acceptedCount = assessments.filter(item => item.status === "Accepted").length;
        const highestRisk = assessments.length
            ? Math.max(...assessments.map(item => item.riskScore || 0))
            : 0;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Assessments", assessments.length));
        grid.appendChild(MetricCard.create("High Risk", highRiskCount));
        grid.appendChild(MetricCard.create("Accepted", acceptedCount));
        grid.appendChild(MetricCard.create("Linked Recommendations", this.countRecommendationsLinkedToAssessment()));

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
                onClick: () => this.createSampleAssessment()
            },
            {
                id: "create-recommendation",
                label: "Create Recommendation",
                onClick: () => this.createRecommendationFromSelectedAssessment()
            }
        ]));

        return wrapper;
    }

    static createMainLayout(assessments = this.getAssessments(), activeAssessment = AssessmentManager.get()) {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(assessments));
        layout.appendChild(this.createDetailPanel(activeAssessment, assessments));

        return layout;
    }

    static createContent(assessments = this.getAssessments()) {
        if (!assessments.length) {
            return EmptyState.create({
                eyebrow: "Assessment Workspace",
                title: "No assessments available",
                description: "Assessment records will translate findings into condition, risk, remaining useful life, and CAPEX logic.",
                actionLabel: "+ New Assessment",
                onAction: () => this.createSampleAssessment()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        assessments.forEach(assessment => {
            list.appendChild(this.createAssessmentRow(assessment));
        });

        return list;
    }

    static createAssessmentRow(assessment) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            AssessmentManager.set(assessment);
            this.refresh();
        });

        const title = document.createElement("strong");
        title.textContent = assessment.title || assessment.id || "Assessment Item";

        const meta = document.createElement("span");
        meta.textContent = `${assessment.severity || "Unrated"} · Risk ${assessment.riskScore || 0}`;

        const statusContainer = document.createElement("div");
        statusContainer.innerHTML = this.renderAssessmentStatusBadge(assessment);
        const statusBadge = statusContainer.firstChild;

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(statusBadge);

        return row;
    }

    static createDetailPanel(activeAssessment = AssessmentManager.get(), assessments = this.getAssessments()) {
        if (!activeAssessment) {
            return DetailPanel.create("Assessment Context", [
                { label: "Assessments", value: String(assessments.length) },
                { label: "Selected Assessment", value: "Not selected" },
                { label: "Technical Risk", value: assessments.length ? "In Review" : "Pending" },
                { label: "Workspace Status", value: "—" },
                { label: "Next Step", value: "Create or select an assessment" }
            ]);
        }

        const statusLabel = this.statusLabels[this.getAssessmentStatus(activeAssessment)] || "Draft";

        return DetailPanel.create("Assessment Context", [
            { label: "Selected Assessment", value: activeAssessment.title || activeAssessment.id },
            { label: "Workspace Status", value: statusLabel },
            { label: "Severity", value: activeAssessment.severity || "Unrated" },
            { label: "Risk Score", value: String(activeAssessment.riskScore || 0) },
            { label: "Linked Recommendations", value: String(this.countRecommendationsLinkedToAssessment(activeAssessment.id)) }
        ]);
    }

    static countRecommendationsLinkedToAssessment(assessmentId = null) {
        const targetAssessmentId = assessmentId || AssessmentManager.get()?.id;

        if (!targetAssessmentId) {
            return 0;
        }

        return RecommendationManager.getAll()
            .filter(recommendation => (recommendation.assessmentIds || []).includes(targetAssessmentId))
            .length;
    }

    static createRecommendationFromSelectedAssessment() {
        const assessment = AssessmentManager.get();

        if (!assessment) {
            Notification.warning("Select an assessment first.");
            return;
        }

        const recommendation = RecommendationManager.create({
            caseId: assessment.caseId,
            buildingId: assessment.buildingId,
            inspectionId: assessment.inspectionId,
            assessmentIds: [assessment.id],
            findingIds: assessment.findingIds || [],
            title: `Recommendation from ${assessment.title || assessment.id}`,
            description: assessment.description || "Recommendation generated from selected assessment.",
            action: "Review and implement corrective action.",
            priority: assessment.priority || "Medium",
            timeframe: (assessment.riskScore || 0) >= 60 ? "Immediate"
                : (assessment.riskScore || 0) >= 30 ? "Short Term"
                : "Planned",
            estimatedCost: 0,
            currency: "EUR",
            responsible: "Owner",
            decisionImpact: (assessment.riskScore || 0) >= 60 ? "High" : "Medium",
            status: "Draft"
        });

        RecommendationManager.set(recommendation);
        Notification.success("Recommendation created from selected assessment.");
        WorkspaceRouter.navigate("recommendations");
    }

    static getAssessments() {
        return AssessmentManager.getAll();
    }

    static createSampleAssessment() {
        const severity = "Medium";
        const probability = "Medium";
        const consequence = "Medium";

        const assessment = AssessmentManager.create({
            caseId: "demo-case",
            buildingId: "demo-building",
            inspectionId: "demo-inspection",
            title: "Sample Assessment",
            description: "Initial assessment record created from the workspace.",
            category: "General",
            severity,
            probability,
            consequence,
            riskScore: AssessmentManager.calculateRiskScore(severity, probability, consequence),
            priority: "Medium",
            status: "Draft"
        });

        AssessmentManager.set(assessment);
        Notification.success("Assessment created.");
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