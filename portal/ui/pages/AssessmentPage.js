import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import FindingManager from "../../core/FindingManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import RecommendationManager from "../../core/RecommendationManager.js";
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

        fragment.appendChild(this.createHeader(activeAssessment));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "assessments"));
        const assessmentOverview = document.createElement("section");
        assessmentOverview.className = "assessment-polish-stack";
        assessmentOverview.appendChild(this.createFlowIndicator(activeAssessment));
        assessmentOverview.appendChild(this.createNextActionPanel(activeAssessment));

        fragment.appendChild(assessmentOverview);
        fragment.appendChild(this.createAssessmentIntelligenceSnapshot(activeAssessment));
        fragment.appendChild(this.createMetrics(assessments));
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout(assessments, activeAssessment));

        return fragment;
    }

    static getFlowState(assessment = {}) {
        assessment = assessment || {};
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
        assessment = assessment || {};
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
        assessment = assessment || {};
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
        assessment = assessment || {};
        const status = this.getAssessmentStatus(assessment);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static getNextAction(assessment = {}) {
        assessment = assessment || {};
        const status = this.getAssessmentStatus
            ? this.getAssessmentStatus(assessment)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This assessment cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm recommendation",
                description: "Assessment is reviewed and ready to support an action recommendation.",
                tone: "ready"
            };
        }

        if (status === "recommended") {
            return {
                label: "Review linked recommendation",
                description: "This assessment is already connected to a recommendation. Check action logic and completeness.",
                tone: "linked"
            };
        }

        if (status === "assessed") {
            return {
                label: "Create recommendation",
                description: "The assessment is complete enough to derive a recommended action.",
                tone: "active"
            };
        }

        return {
            label: "Complete assessment",
            description: "Define risk level, severity, probability or impact before creating a recommendation.",
            tone: "draft"
        };
    }

    static renderNextActionPanel(assessment = {}) {
        assessment = assessment || {};
        const action = this.getNextAction(assessment);

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

    static createNextActionPanel(assessment = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(assessment);
        return container;
    }

    static createHeader(activeAssessment = null) {
        return SectionHeader.create({
            eyebrow: "Assessment Workspace",
            title: "Assessments",
            description: activeAssessment
                ? `Active assessment: ${activeAssessment.title || activeAssessment.id}`
                : "Evaluate findings, determine condition, estimate remaining useful life, assess technical risk, and prepare CAPEX planning.",
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
                id: "close-assessment",
                label: "Close Assessment",
                onClick: () => {
                    AssessmentManager.clear();
                    this.refresh();
                }
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
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            AssessmentManager.set(assessment);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = assessment.title || assessment.id || "Assessment Item";

        const meta = document.createElement("span");
        meta.textContent = [
            assessment.category || "General",
            `Risk ${assessment.riskScore || 0}`,
            assessment.source || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderAssessmentStatusBadge(assessment);

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
                    AssessmentManager.set(assessment);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    AssessmentManager.set(assessment);
                    this.editSelectedAssessment();
                    return;
                }

                if (action === "delete") {
                    this.deleteAssessment(assessment);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

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
            { label: "Source", value: activeAssessment.source || "Assessment Review" },
            { label: "Case ID", value: activeAssessment.caseId || "Not linked" },
            { label: "Building ID", value: activeAssessment.buildingId || "Not linked" },
            { label: "Inspection ID", value: activeAssessment.inspectionId || "Not linked" },
            { label: "Finding IDs", value: (activeAssessment.findingIds || []).join(", ") || "None" },
            { label: "Evidence IDs", value: (activeAssessment.evidenceIds || []).join(", ") || "None" },
            { label: "Category", value: activeAssessment.category || "General" },
            { label: "Building System", value: activeAssessment.buildingSystem || "Not linked" },
            { label: "Severity", value: activeAssessment.severity || "Unrated" },
            { label: "Probability", value: activeAssessment.probability || "Unrated" },
            { label: "Consequence", value: activeAssessment.consequence || "Unrated" },
            { label: "Risk Score", value: String(activeAssessment.riskScore || 0) },
            { label: "Description", value: activeAssessment.description || "No description" },
            { label: "Recommendation IDs", value: (activeAssessment.recommendationIds || []).join(", ") || "None" },
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
        const currentCase = CaseManager.getCurrent();

        if (!assessment) {
            Notification.warning("Select an assessment first.");
            return;
        }

        if (!assessment.caseId) {
            Notification.warning("Selected assessment is not linked to a case.");
            return;
        }

        if (currentCase && currentCase.id !== assessment.caseId) {
            Notification.warning("Selected assessment belongs to another case.");
            return;
        }

        const recommendation = RecommendationManager.create({
            caseId: assessment.caseId,
            buildingId: assessment.buildingId || currentCase?.buildingId || null,
            inspectionId: assessment.inspectionId || currentCase?.inspectionId || null,
            assessmentIds: [assessment.id],
            findingIds: assessment.findingIds || [],
            evidenceIds: assessment.evidenceIds || [],
            title: `Recommendation from ${assessment.title || assessment.id}`,
            description: [
                assessment.description || "Recommendation generated from selected assessment.",
                "",
                "Assessment trace:",
                `Assessment ID: ${assessment.id}`,
                `Assessment source: ${assessment.source || "Assessment Review"}`,
                `Finding IDs: ${(assessment.findingIds || []).join(", ") || "None"}`,
                `Evidence IDs: ${(assessment.evidenceIds || []).join(", ") || "None"}`,
                `Risk score: ${assessment.riskScore || 0}`
            ].join("\n"),
            action: "Review and implement corrective action.",
            source: assessment.source || "Assessment Review",
            buildingSystem: assessment.buildingSystem || "",
            riskScore: assessment.riskScore || 0,
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

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                recommendationIds: [...new Set([...(activeCaseForSync.recommendationIds || []), recommendation.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedAssessment = AssessmentManager.update({
            ...assessment,
            recommendationIds: [...new Set([...(assessment.recommendationIds || []), recommendation.id])],
            updatedAt: new Date().toISOString()
        });

        AssessmentManager.set(updatedAssessment);

        Notification.success("Recommendation created from selected assessment.");
        WorkspaceRouter.navigate("recommendations");
    }

    static getAssessments() {
        const currentCase = CaseManager.getCurrent();

        if (currentCase) {
            return AssessmentManager.getByCase(currentCase.id);
        }

        return AssessmentManager.getAll();
    }

    static createSampleAssessment() {
        const currentCase = CaseManager.getCurrent();
        const currentBuilding = BuildingManager.get();
        const currentInspection = InspectionManager.get();
        const activeFinding = FindingManager.get();

        if (!currentCase) {
            Notification.info("Open a case before creating an assessment.");
            return;
        }

        FormDialog.open({
            title: "New Assessment",
            submitLabel: "Create Assessment",
            values: {
                title: "",
                description: "",
                category: activeFinding?.category || "General",
                severity: activeFinding?.severity || "Medium",
                probability: "Medium",
                consequence: "Medium",
                priority: "Medium",
                status: "Draft"
            },
            fields: [
                {
                    id: "title",
                    label: "Assessment title"
                },
                {
                    id: "description",
                    label: "Description"
                },
                {
                    id: "category",
                    label: "Category",
                    type: "select",
                    options: ["General", "Envelope", "Roof", "Structure", "MEP", "Moisture", "Fire Safety", "Other"]
                },
                {
                    id: "severity",
                    label: "Severity",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "probability",
                    label: "Probability",
                    type: "select",
                    options: ["Low", "Medium", "High"]
                },
                {
                    id: "consequence",
                    label: "Consequence",
                    type: "select",
                    options: ["Low", "Medium", "High"]
                },
                {
                    id: "priority",
                    label: "Priority",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Draft", "Assessed", "Recommended", "Reviewed", "Blocked"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                if (!activeFinding) {
            Notification.info("Select a finding before creating an assessment.");
            return;
        }

        const assessment = AssessmentManager.create({
                    caseId: activeFinding?.caseId || currentCase.id,
                    buildingId: activeFinding?.buildingId || currentBuilding?.id || null,
                    inspectionId: activeFinding?.inspectionId || currentInspection?.id || null,
                    findingIds: activeFinding ? [activeFinding.id] : [],
                    title: values.title,
                    description: values.description || "",
                    category: values.category || "General",
                    severity: values.severity || "Medium",
                    probability: values.probability || "Medium",
                    consequence: values.consequence || "Medium",
                    riskScore: AssessmentManager.calculateRiskScore(
                        values.severity || "Medium",
                        values.probability || "Medium",
                        values.consequence || "Medium"
                    ),
                    priority: values.priority || "Medium",
                    status: values.status || "Draft"
                });

                AssessmentManager.set(assessment);
                dialog.remove();
                Notification.success("Assessment created.");
                this.refresh();
            }
        });
    }

    static editSelectedAssessment() {
        const assessment = AssessmentManager.get();

        if (!assessment) {
            Notification.info("Select an assessment before editing.");
            return;
        }

        FormDialog.open({
            title: "Edit Assessment",
            submitLabel: "Save Assessment",
            values: {
                title: assessment.title || "",
                description: assessment.description || "",
                category: assessment.category || "General",
                severity: assessment.severity || "Medium",
                probability: assessment.probability || "Medium",
                consequence: assessment.consequence || "Medium",
                priority: assessment.priority || "Medium",
                status: assessment.status || "Draft"
            },
            fields: [
                { id: "title", label: "Assessment title" },
                { id: "description", label: "Description" },
                {
                    id: "category",
                    label: "Category",
                    type: "select",
                    options: ["General", "Envelope", "Roof", "Structure", "MEP", "Moisture", "Fire Safety", "Other"]
                },
                {
                    id: "severity",
                    label: "Severity",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "probability",
                    label: "Probability",
                    type: "select",
                    options: ["Low", "Medium", "High"]
                },
                {
                    id: "consequence",
                    label: "Consequence",
                    type: "select",
                    options: ["Low", "Medium", "High"]
                },
                {
                    id: "priority",
                    label: "Priority",
                    type: "select",
                    options: ["Low", "Medium", "High", "Critical"]
                },
                {
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Draft", "Assessed", "Recommended", "Reviewed", "Blocked"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = AssessmentManager.update({
                    ...assessment,
                    title: values.title,
                    description: values.description || "",
                    category: values.category || "General",
                    severity: values.severity || "Medium",
                    probability: values.probability || "Medium",
                    consequence: values.consequence || "Medium",
                    riskScore: AssessmentManager.calculateRiskScore(
                        values.severity || "Medium",
                        values.probability || "Medium",
                        values.consequence || "Medium"
                    ),
                    priority: values.priority || "Medium",
                    status: values.status || "Draft",
                    updatedAt: new Date().toISOString()
                });

                AssessmentManager.set(updated);
                dialog.remove();
                Notification.success("Assessment updated.");
                this.refresh();
            }
        });
    }

    static deleteAssessment(item) {
        if (!window.confirm(`Delete assessment "${item.title || item.id}"?`)) {
            return;
        }

        AssessmentManager.delete(item.id);

        if (AssessmentManager.get()?.id === item.id) {
            AssessmentManager.clear();
        }

        Notification.success("Assessment deleted.");
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

    static getAssessmentIntelligence(assessment = {}) {
        assessment = assessment || {};
        const hasIdentity = Boolean(assessment.title || assessment.name);
        const hasRiskLevel = Boolean(assessment.riskLevel || assessment.riskScore);
        const hasSeverity = Boolean(assessment.severity);
        const hasProbability = Boolean(assessment.probability);
        const hasImpact = Boolean(assessment.impact);
        const hasFindingLink = Boolean(
            assessment.findingId ||
            assessment.linkedFindingId ||
            assessment.finding ||
            assessment.hasFinding
        );
        const hasRecommendationLink = Boolean(
            assessment.recommendationId ||
            assessment.linkedRecommendationId ||
            assessment.recommendation ||
            assessment.hasRecommendation
        );
        const isReviewed = Boolean(assessment.reviewed || assessment.status === "reviewed");

        const checks = [
            hasIdentity,
            hasRiskLevel,
            hasSeverity,
            hasProbability,
            hasImpact,
            hasFindingLink,
            hasRecommendationLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals:
                (hasRiskLevel ? 1 : 0) +
                (hasSeverity && hasProbability && hasImpact ? 1 : 0),
            downstreamSignals: hasRecommendationLink ? 1 : 0,
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.62,
                primary: 11,
                downstream: 10,
                output: 6
            }
        });

        let riskLogicSignal = {
            label: "Low risk logic",
            description: "Assessment risk logic is still incomplete. Define risk level, severity, probability and impact.",
            tone: "draft"
        };

        if (hasRiskLevel && hasSeverity && hasProbability && hasImpact && hasRecommendationLink) {
            riskLogicSignal = {
                label: "Strong risk logic",
                description: "Assessment contains complete risk logic and is connected to downstream recommendation.",
                tone: "ready"
            };
        } else if (hasRiskLevel && (hasSeverity || hasProbability || hasImpact)) {
            riskLogicSignal = {
                label: "Developing risk logic",
                description: "Assessment contains useful risk context but still needs complete risk parameters or recommendation linkage.",
                tone: "active"
            };
        }

        const nextAction = hasRecommendationLink
            ? {
                label: "Review linked recommendation",
                description: "Assessment is connected to a recommendation. Review whether action logic reflects the risk assessment.",
                tone: "ready"
            }
            : hasRiskLevel && hasSeverity && hasProbability && hasImpact
                ? {
                    label: "Create or link recommendation",
                    description: "Risk logic is complete enough to derive a recommended action.",
                    tone: "active"
                }
                : {
                    label: "Complete risk logic",
                    description: "Define risk level, severity, probability and impact before creating a recommendation.",
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            riskLogicSignal,
            nextAction,
            label: readinessPercent >= 100
                ? "Assessment intelligence complete"
                : readinessPercent >= 50
                    ? "Assessment intelligence developing"
                    : "Assessment intelligence early"
        };
    }

    static renderAssessmentIntelligenceSnapshot(assessment = {}) {
        assessment = assessment || {};
        const intelligence = this.getAssessmentIntelligence(assessment);

        return `
            <section class="assessment-intelligence intelligence-snapshot" aria-label="Assessment intelligence snapshot">
                <div class="assessment-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="assessment-intelligence__eyebrow intelligence-snapshot__eyebrow">Assessment Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} assessment intelligence checks completed</p>
                    </div>
                    <span class="assessment-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="assessment-intelligence__grid intelligence-snapshot__grid">
                    <article class="assessment-intelligence__card intelligence-snapshot__card">
                        <span>Recommendation Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, risk logic, finding link, recommendation link and review state.</p>
                    </article>

                    <article class="assessment-intelligence__card intelligence-snapshot__card assessment-intelligence__card--${intelligence.riskLogicSignal.tone} intelligence-snapshot__card--${intelligence.riskLogicSignal.tone}">
                        <span>Risk Logic Signal</span>
                        <strong>${intelligence.riskLogicSignal.label}</strong>
                        <p>${intelligence.riskLogicSignal.description}</p>
                    </article>

                    <article class="assessment-intelligence__card intelligence-snapshot__card assessment-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Assessment Action</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createAssessmentIntelligenceSnapshot(assessment = AssessmentManager.get()) {
        if (!assessment || !assessment.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderAssessmentIntelligenceSnapshot(assessment);
        return container;
    }

}