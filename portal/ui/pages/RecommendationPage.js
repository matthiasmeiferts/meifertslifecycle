import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import RecommendationManager from "../../core/RecommendationManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import DecisionManager from "../../core/DecisionManager.js";
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

export default class RecommendationPage {

    static statusLabels = {
        draft: "Draft",
        recommended: "Recommended",
        decided: "Decided",
        reviewed: "Reviewed",
        blocked: "Blocked"
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const recommendations = this.getRecommendations();
        const activeRecommendation = RecommendationManager.get();

        fragment.appendChild(this.createHeader());
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "recommendations"));
        fragment.appendChild(this.createMetrics(recommendations));
        fragment.appendChild(this.createFlowIndicator(activeRecommendation));
        fragment.appendChild(this.createNextActionPanel(activeRecommendation));
        fragment.appendChild(this.createCompletionPanel(activeRecommendation));

        if (activeRecommendation) {
            fragment.appendChild(this.createRecommendationIntelligenceSnapshot(activeRecommendation));
        }

        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(recommendations, activeRecommendation));

        return fragment;
    }

    static getFlowState(recommendation = {}) {
        recommendation = recommendation || {};

        const hasDecisionLink =
            Boolean(recommendation.decisionId) ||
            Boolean(recommendation.linkedDecisionId) ||
            Boolean(recommendation.decision) ||
            Boolean(recommendation.hasDecision) ||
            recommendation.status === "decided";

        return {
            recommendation: "active",
            decision: hasDecisionLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(recommendation = {}) {
        recommendation = recommendation || {};
        const flowState = this.getFlowState(recommendation);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>Recommendation → Decision</strong>
                </div>

                <div class="workspace-flow__steps">
                    <div class="workspace-flow__step workspace-flow__step--${flowState.recommendation}">
                        <span class="workspace-flow__dot"></span>
                        <div>
                            <strong>Recommendation</strong>
                            <p>Technical action recommended</p>
                        </div>
                    </div>

                    <div class="workspace-flow__step workspace-flow__step--${flowState.decision}">
                        <span class="workspace-flow__dot"></span>
                        <div>
                            <strong>Decision</strong>
                            <p>Governance decision derived</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    static createFlowIndicator(recommendation = {}) {
        const container = document.createElement("section");
        container.innerHTML = this.renderActiveFlowIndicator(recommendation);
        return container;
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
                id: "close-recommendation",
                label: "Close Recommendation",
                onClick: () => {
                    RecommendationManager.clear();
                    this.refresh();
                }
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

    static getRecommendationStatus(recommendation = {}) {
        recommendation = recommendation || {};
        if (recommendation.blocked || recommendation.status === "blocked") {
            return "blocked";
        }

        if (recommendation.reviewed || recommendation.status === "reviewed") {
            return "reviewed";
        }

        if (
            recommendation.decisionId ||
            recommendation.linkedDecisionId ||
            recommendation.decision ||
            recommendation.hasDecision ||
            recommendation.status === "decided"
        ) {
            return "decided";
        }

        if (
            recommendation.recommended ||
            recommendation.title ||
            recommendation.name ||
            recommendation.action ||
            recommendation.recommendation ||
            recommendation.priority ||
            recommendation.status === "recommended"
        ) {
            return "recommended";
        }

        return "draft";
    }

    static renderRecommendationStatusBadge(recommendation = {}) {
        recommendation = recommendation || {};
        const status = this.getRecommendationStatus(recommendation);
        const label = this.statusLabels[status] || "Draft";

        return `
            <span class="evidence-status evidence-status--${status}">
                ${label}
            </span>
        `;
    }

    static getNextAction(recommendation = {}) {
        recommendation = recommendation || {};
        const status = this.getRecommendationStatus
            ? this.getRecommendationStatus(recommendation)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This recommendation cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm decision",
                description: "Recommendation is reviewed and ready to support a governance decision.",
                tone: "ready"
            };
        }

        if (status === "decided") {
            return {
                label: "Review linked decision",
                description: "This recommendation is already connected to a decision. Check governance logic and completeness.",
                tone: "linked"
            };
        }

        if (status === "recommended") {
            return {
                label: "Prepare decision",
                description: "The recommendation is complete enough to move into decision review.",
                tone: "active"
            };
        }

        return {
            label: "Define recommendation",
            description: "Add a clear action, priority or recommendation before moving into decision.",
            tone: "draft"
        };
    }

    static renderNextActionPanel(recommendation = {}) {
        recommendation = recommendation || {};
        const action = this.getNextAction(recommendation);

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

    static createNextActionPanel(recommendation = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(recommendation);
        return container;
    }

    static getCompletionState(recommendation = {}) {
        recommendation = recommendation || {};
        const hasTitle = Boolean(recommendation.title || recommendation.name);
        const hasAction = Boolean(recommendation.action || recommendation.recommendation || recommendation.description);
        const hasPriority = Boolean(recommendation.priority || recommendation.urgency);
        const hasCost = Boolean(recommendation.costEstimate || recommendation.capex || recommendation.budget);
        const hasAssessmentLink = Boolean(
            recommendation.assessmentId ||
            recommendation.linkedAssessmentId ||
            recommendation.assessment ||
            recommendation.hasAssessment
        );
        const hasDecisionLink = Boolean(
            recommendation.decisionId ||
            recommendation.linkedDecisionId ||
            recommendation.decision ||
            recommendation.hasDecision
        );

        const checks = [
            {
                key: "identity",
                label: "Recommendation identified",
                complete: hasTitle
            },
            {
                key: "action",
                label: "Action defined",
                complete: hasAction
            },
            {
                key: "priority",
                label: "Priority defined",
                complete: hasPriority
            },
            {
                key: "cost",
                label: "Cost logic captured",
                complete: hasCost
            },
            {
                key: "assessment",
                label: "Assessment linked",
                complete: hasAssessmentLink
            },
            {
                key: "decision",
                label: "Decision connection",
                complete: hasDecisionLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForDecision: hasTitle && hasAction && hasPriority,
            isComplete: completed === total
        };
    }

    static renderCompletionPanel(recommendation = {}) {
        recommendation = recommendation || {};
        const completion = this.getCompletionState(recommendation);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForDecision
            ? "Ready for Decision"
            : "Needs more recommendation data";

        return `
            <section class="completion-panel" aria-label="Recommendation completion">
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

    static createCompletionPanel(recommendation = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(recommendation);
        return container;
    }

    static createRecommendationRow(recommendation) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            RecommendationManager.set(recommendation);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = recommendation.title || recommendation.id || "Recommendation Item";

        const meta = document.createElement("span");
        meta.textContent = `${recommendation.priority || "Medium"} · ${recommendation.timeframe || "Short Term"}`;

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderRecommendationStatusBadge(recommendation);

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
                    RecommendationManager.set(recommendation);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    RecommendationManager.set(recommendation);
                    this.editSelectedRecommendation();
                    return;
                }

                if (action === "delete") {
                    this.deleteRecommendation(recommendation);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static createDetailPanel(activeRecommendation = RecommendationManager.get(), recommendations = this.getRecommendations()) {
        if (!activeRecommendation) {
            return DetailPanel.create("Recommendation Context", [
                { label: "Recommendations", value: String(recommendations.length) },
                { label: "Selected Recommendation", value: "Not selected" },
                { label: "Workspace Status", value: "No selection" },
                { label: "Decision Relevance", value: recommendations.length ? "In Review" : "Pending" },
                { label: "Next Step", value: "Create or select a recommendation" }
            ]);
        }

        const statusLabel = this.statusLabels[this.getRecommendationStatus(activeRecommendation)] || "Draft";

        return DetailPanel.create("Recommendation Context", [
            { label: "Selected Recommendation", value: activeRecommendation.title || activeRecommendation.id },
            { label: "Workspace Status", value: statusLabel },
            { label: "Source", value: activeRecommendation.source || "Assessment Review" },
            { label: "Case ID", value: activeRecommendation.caseId || "Not linked" },
            { label: "Building ID", value: activeRecommendation.buildingId || "Not linked" },
            { label: "Inspection ID", value: activeRecommendation.inspectionId || "Not linked" },
            { label: "Assessment IDs", value: (activeRecommendation.assessmentIds || []).join(", ") || "None" },
            { label: "Finding IDs", value: (activeRecommendation.findingIds || []).join(", ") || "None" },
            { label: "Evidence IDs", value: (activeRecommendation.evidenceIds || []).join(", ") || "None" },
            { label: "Building System", value: activeRecommendation.buildingSystem || "Not linked" },
            { label: "Risk Score", value: String(activeRecommendation.riskScore || 0) },
            { label: "Priority", value: activeRecommendation.priority || "Medium" },
            { label: "Timeframe", value: activeRecommendation.timeframe || "Short Term" },
            { label: "Decision Impact", value: activeRecommendation.decisionImpact || "Medium" },
            { label: "Description", value: activeRecommendation.description || "No description" },
            { label: "Decision IDs", value: (activeRecommendation.decisionIds || []).join(", ") || "None" },
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
        const currentCase = CaseManager.getCurrent();

        if (!recommendation) {
            Notification.warning("Select a recommendation first.");
            return;
        }

        if (!recommendation.caseId) {
            Notification.warning("Selected recommendation is not linked to a case.");
            return;
        }

        if (currentCase && currentCase.id !== recommendation.caseId) {
            Notification.warning("Selected recommendation belongs to another case.");
            return;
        }

        const resolvedFindingIds = (recommendation.findingIds || []).length
            ? recommendation.findingIds
            : (recommendation.assessmentIds || [])
                .flatMap(id => AssessmentManager.load(id)?.findingIds || []);

        const decision = DecisionManager.create({
            caseId: recommendation.caseId,
            buildingId: recommendation.buildingId || currentCase?.buildingId || null,
            inspectionId: recommendation.inspectionId || currentCase?.inspectionId || null,
            recommendationIds: [recommendation.id],
            assessmentIds: recommendation.assessmentIds || [],
            findingIds: [...new Set(resolvedFindingIds)],
            evidenceIds: recommendation.evidenceIds || [],
            title: `Decision from ${recommendation.title || recommendation.id}`,
            description: [
                recommendation.description || "Decision generated from selected recommendation.",
                "",
                "Recommendation trace:",
                `Recommendation ID: ${recommendation.id}`,
                `Recommendation source: ${recommendation.source || "Assessment Review"}`,
                `Assessment IDs: ${(recommendation.assessmentIds || []).join(", ") || "None"}`,
                `Finding IDs: ${([...new Set(resolvedFindingIds)]).join(", ") || "None"}`,
                `Evidence IDs: ${(recommendation.evidenceIds || []).join(", ") || "None"}`,
                `Risk score: ${recommendation.riskScore || 0}`,
                `Decision impact: ${recommendation.decisionImpact || "Medium"}`
            ].join("\n"),
            decisionType: "Monitor",
            rationale: recommendation.action || recommendation.description || "",
            source: recommendation.source || "Recommendation Review",
            buildingSystem: recommendation.buildingSystem || "",
            riskScore: recommendation.riskScore || 0,
            decisionImpact: recommendation.decisionImpact || "Medium",
            riskLevel: recommendation.decisionImpact || recommendation.priority || "Medium",
            confidence: 70,
            status: "Draft"
        });

        DecisionManager.set(decision);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                decisionIds: [...new Set([...(activeCaseForSync.decisionIds || []), decision.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedRecommendation = RecommendationManager.update({
            ...recommendation,
            decisionIds: [...new Set([...(recommendation.decisionIds || []), decision.id])],
            updatedAt: new Date().toISOString()
        });

        RecommendationManager.set(updatedRecommendation);

        Notification.success("Decision created from selected recommendation.");
        WorkspaceRouter.navigate("decisions");
    }

    static getRecommendations() {
        const currentCase = CaseManager.getCurrent();

        if (currentCase) {
            return RecommendationManager.getByCase(currentCase.id);
        }

        return RecommendationManager.getAll();
    }

    static createSampleRecommendation() {

        const currentCase = CaseManager.getCurrent();

        const currentBuilding = BuildingManager.get();

        const currentInspection = InspectionManager.get();

        const activeAssessment = AssessmentManager.get();

        if (!currentCase) {

            Notification.info("Open a case before creating a recommendation.");

            return;

        }

        FormDialog.open({

            title: "New Recommendation",

            submitLabel: "Create Recommendation",

            values: {

                title: "",

                description: "",

                action: "",

                priority: activeAssessment?.priority || "Medium",

                timeframe: "Short Term",

                estimatedCost: 0,

                currency: "EUR",

                responsible: "Owner",

                decisionImpact: activeAssessment?.riskScore >= 60 ? "High" : "Medium",

                status: "Draft"

            },

            fields: [

                {

                    id: "title",

                    label: "Recommendation title"

                },

                {

                    id: "description",

                    label: "Description"

                },

                {

                    id: "action",

                    label: "Recommended action"

                },

                {

                    id: "priority",

                    label: "Priority",

                    type: "select",

                    options: ["Low", "Medium", "High", "Critical"]

                },

                {

                    id: "timeframe",

                    label: "Timeframe",

                    type: "select",

                    options: ["Immediate", "Short Term", "Medium Term", "Long Term"]

                },

                {

                    id: "estimatedCost",

                    label: "Estimated cost",

                    type: "number"

                },

                {

                    id: "currency",

                    label: "Currency",

                    type: "select",

                    options: ["EUR", "THB", "USD"]

                },

                {

                    id: "responsible",

                    label: "Responsible"

                },

                {

                    id: "decisionImpact",

                    label: "Decision impact",

                    type: "select",

                    options: ["Low", "Medium", "High", "Critical"]

                },

                {

                    id: "status",

                    label: "Status",

                    type: "select",

                    options: ["Draft", "Recommended", "Decided", "Reviewed", "Blocked"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                if (!activeAssessment) {
            Notification.info("Select an assessment before creating a recommendation.");
            return;
        }

        const recommendation = RecommendationManager.create({

                    caseId: activeAssessment?.caseId || currentCase.id,

                    buildingId: activeAssessment?.buildingId || currentBuilding?.id || null,

                    inspectionId: activeAssessment?.inspectionId || currentInspection?.id || null,

                    assessmentIds: activeAssessment ? [activeAssessment.id] : [],

                    title: values.title,

                    description: values.description || "",

                    action: values.action || "",

                    priority: values.priority || "Medium",

                    timeframe: values.timeframe || "Short Term",

                    estimatedCost: Number(values.estimatedCost || 0),

                    currency: values.currency || "EUR",

                    responsible: values.responsible || "Owner",

                    decisionImpact: values.decisionImpact || "Medium",

                    status: values.status || "Draft"

                });

                RecommendationManager.set(recommendation);

                dialog.remove();

                Notification.success("Recommendation created.");

                this.refresh();

            }

        });

    }


    static editSelectedRecommendation() {
        const recommendation = RecommendationManager.get();

        if (!recommendation) {
            Notification.info("Select a recommendation before editing.");
            return;
        }

        FormDialog.open({
            title: "Edit Recommendation",
            submitLabel: "Save Recommendation",
            values: {
                title: recommendation.title || "",
                description: recommendation.description || "",
                action: recommendation.action || "",
                priority: recommendation.priority || "Medium",
                timeframe: recommendation.timeframe || "Short Term",
                estimatedCost: recommendation.estimatedCost || 0,
                currency: recommendation.currency || "EUR",
                responsible: recommendation.responsible || "Owner",
                decisionImpact: recommendation.decisionImpact || "Medium",
                status: recommendation.status || "Draft"
            },
            fields: [
                { id: "title", label: "Recommendation title" },
                { id: "description", label: "Description" },
                { id: "action", label: "Recommended action" },
                {
                    id: "priority",
                    label: "Priority",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "timeframe",
                    label: "Timeframe",
                    type: "select",
                    options: ["Immediate", "Short Term", "Medium Term", "Long Term"]
                },
                { id: "estimatedCost", label: "Estimated cost", type: "number" },
                {
                    id: "currency",
                    label: "Currency",
                    type: "select",
                    options: ["EUR", "THB", "USD"]
                },
                { id: "responsible", label: "Responsible" },
                {
                    id: "decisionImpact",
                    label: "Decision impact",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Draft", "Recommended", "Decided", "Reviewed", "Blocked"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = RecommendationManager.update({
                    ...recommendation,
                    title: values.title,
                    description: values.description || "",
                    action: values.action || "",
                    priority: values.priority || "Medium",
                    timeframe: values.timeframe || "Short Term",
                    estimatedCost: Number(values.estimatedCost || 0),
                    currency: values.currency || "EUR",
                    responsible: values.responsible || "Owner",
                    decisionImpact: values.decisionImpact || "Medium",
                    status: values.status || "Draft",
                    updatedAt: new Date().toISOString()
                });

                RecommendationManager.set(updated);
                dialog.remove();
                Notification.success("Recommendation updated.");
                this.refresh();
            }
        });
    }

    static deleteRecommendation(item) {
        if (!window.confirm(`Delete recommendation "${item.title || item.id}"?`)) {
            return;
        }

        RecommendationManager.delete(item.id);

        if (RecommendationManager.get()?.id === item.id) {
            RecommendationManager.clear();
        }

        Notification.success("Recommendation deleted.");
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

    static getRecommendationIntelligence(recommendation = {}) {
        recommendation = recommendation || {};
        const hasIdentity = Boolean(recommendation.title || recommendation.name);
        const hasAction = Boolean(recommendation.action || recommendation.recommendation || recommendation.description);
        const hasPriority = Boolean(recommendation.priority || recommendation.urgency);
        const hasCost = Boolean(recommendation.costEstimate || recommendation.capex || recommendation.budget);
        const hasAssessmentLink = Boolean(
            recommendation.assessmentId ||
            recommendation.linkedAssessmentId ||
            recommendation.assessment ||
            recommendation.hasAssessment
        );
        const hasDecisionLink = Boolean(
            recommendation.decisionId ||
            recommendation.linkedDecisionId ||
            recommendation.decision ||
            recommendation.hasDecision
        );
        const isReviewed = Boolean(recommendation.reviewed || recommendation.status === "reviewed");

        const checks = [
            hasIdentity,
            hasAction,
            hasPriority,
            hasCost,
            hasAssessmentLink,
            hasDecisionLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals:
                (hasAction ? 1 : 0) +
                (hasPriority ? 1 : 0),
            downstreamSignals:
                (hasAssessmentLink ? 1 : 0) +
                (hasDecisionLink ? 1 : 0),
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.64,
                primary: 9,
                downstream: 9,
                output: 6
            }
        });

        let actionLogicSignal = {
            label: "Low action logic",
            description: "Recommendation logic is still incomplete. Define action, priority and assessment context.",
            tone: "draft"
        };

        if (hasAction && hasPriority && hasAssessmentLink && hasDecisionLink) {
            actionLogicSignal = {
                label: "Strong action logic",
                description: "Recommendation has clear action logic and is connected to downstream decision workflow.",
                tone: "ready"
            };
        } else if (hasAction && hasPriority) {
            actionLogicSignal = {
                label: "Developing action logic",
                description: "Recommendation has usable action logic but may still need cost, assessment or decision linkage.",
                tone: "active"
            };
        }

        const nextAction = hasDecisionLink
            ? {
                label: "Review linked decision",
                description: "Recommendation is connected to a decision. Review whether governance logic reflects the recommendation.",
                tone: "ready"
            }
            : hasAction && hasPriority
                ? {
                    label: "Create or link decision",
                    description: "Recommendation is complete enough to move into decision review.",
                    tone: "active"
                }
                : {
                    label: "Define recommended action",
                    description: "Add a clear action and priority before moving toward decision.",
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            actionLogicSignal,
            nextAction,
            label: readinessPercent >= 100
                ? "Recommendation intelligence complete"
                : readinessPercent >= 50
                    ? "Recommendation intelligence developing"
                    : "Recommendation intelligence early"
        };
    }

    static renderRecommendationIntelligenceSnapshot(recommendation = {}) {
        recommendation = recommendation || {};
        const intelligence = this.getRecommendationIntelligence(recommendation);

        return `
            <section class="recommendation-intelligence intelligence-snapshot" aria-label="Recommendation intelligence snapshot">
                <div class="recommendation-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="recommendation-intelligence__eyebrow intelligence-snapshot__eyebrow">Recommendation Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} recommendation intelligence checks completed</p>
                    </div>
                    <span class="recommendation-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="recommendation-intelligence__grid intelligence-snapshot__grid">
                    <article class="recommendation-intelligence__card intelligence-snapshot__card">
                        <span>Decision Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, action, priority, cost logic, assessment link, decision link and review state.</p>
                    </article>

                    <article class="recommendation-intelligence__card intelligence-snapshot__card recommendation-intelligence__card--${intelligence.actionLogicSignal.tone} intelligence-snapshot__card--${intelligence.actionLogicSignal.tone}">
                        <span>Action Logic Signal</span>
                        <strong>${intelligence.actionLogicSignal.label}</strong>
                        <p>${intelligence.actionLogicSignal.description}</p>
                    </article>

                    <article class="recommendation-intelligence__card intelligence-snapshot__card recommendation-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Recommendation Action</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createRecommendationIntelligenceSnapshot(recommendation = RecommendationManager.get()) {
        if (!recommendation || !recommendation.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderRecommendationIntelligenceSnapshot(recommendation);
        return container;
    }

}