import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import WorkspaceController from "../../controllers/WorkspaceController.js";
import FindingManager from "../../core/FindingManager.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
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

export default class FindingPage {

    static flowSteps = [
        {
            key: "finding",
            label: "Finding",
            description: "Technical finding identified"
        },
        {
            key: "assessment",
            label: "Assessment",
            description: "Risk assessment derived"
        }
    ];

    static statusLabels = {
        draft: "Draft",
        identified: "Identified",
        assessed: "Assessed",
        reviewed: "Reviewed",
        blocked: "Blocked"
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const activeFinding = FindingManager.get();

        fragment.appendChild(this.createHeader(activeFinding));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "findings"));
        const findingOverview = document.createElement("section");
        findingOverview.className = "finding-polish-stack";
        findingOverview.appendChild(this.createFlowIndicator(activeFinding));
        findingOverview.appendChild(this.createNextActionPanel(activeFinding));
        findingOverview.appendChild(this.createCompletionPanel(activeFinding));

        fragment.appendChild(findingOverview);
        fragment.appendChild(this.createFindingIntelligenceSnapshot(activeFinding));
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        return fragment;
    }

    static getFlowState(finding = {}) {
        finding = finding || {};

        const hasAssessmentLink =
            Boolean(finding.assessmentId) ||
            Boolean(finding.linkedAssessmentId) ||
            Boolean(finding.assessment) ||
            Boolean(finding.hasAssessment);

        return {
            finding: "active",
            assessment: hasAssessmentLink ? "complete" : "next"
        };
    }

    static renderActiveFlowIndicator(finding = {}) {
        finding = finding || {};
        const flowState = this.getFlowState(finding);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>Finding → Assessment</strong>
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

    static createFlowIndicator(finding = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(finding);
        return container;
    }

    static getFindingStatus(finding = {}) {
        finding = finding || {};
        if (finding.blocked || finding.status === "blocked") {
            return "blocked";
        }

        if (finding.reviewed || finding.status === "reviewed") {
            return "reviewed";
        }

        if (
            finding.assessmentId ||
            finding.linkedAssessmentId ||
            finding.assessment ||
            finding.hasAssessment ||
            finding.status === "assessed"
        ) {
            return "assessed";
        }

        if (
            finding.identified ||
            finding.title ||
            finding.name ||
            finding.description ||
            finding.severity ||
            finding.priority ||
            finding.status === "identified"
        ) {
            return "identified";
        }

        return "draft";
    }

    static renderFindingStatusBadge(finding = {}) {
        finding = finding || {};
        const status = this.getFindingStatus(finding);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static getNextAction(finding = {}) {
        finding = finding || {};
        const status = this.getFindingStatus
            ? this.getFindingStatus(finding)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This finding cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm assessment",
                description: "Finding is reviewed and ready to support a technical assessment.",
                tone: "ready"
            };
        }

        if (status === "assessed") {
            return {
                label: "Review linked assessment",
                description: "This finding is already connected to an assessment. Check risk logic and completeness.",
                tone: "linked"
            };
        }

        if (status === "identified") {
            return {
                label: "Assess finding",
                description: "The finding is identified and should now be assessed for severity, probability and risk impact.",
                tone: "active"
            };
        }

        return {
            label: "Identify finding",
            description: "Add a clear technical finding before moving into assessment.",
            tone: "draft"
        };
    }

    static renderNextActionPanel(finding = {}) {
        finding = finding || {};
        const action = this.getNextAction(finding);

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

    static createNextActionPanel(finding = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(finding);
        return container;
    }

    static getCompletionState(finding = {}) {
        finding = finding || {};
        const hasTitle = Boolean(finding.title || finding.name);
        const hasCategory = Boolean(finding.category || finding.type);
        const hasSeverity = Boolean(finding.severity || finding.priority || finding.riskLevel);
        const hasDescription = Boolean(finding.description || finding.summary || finding.note);
        const hasEvidenceLink = Boolean(
            finding.evidenceId ||
            finding.linkedEvidenceId ||
            finding.evidence ||
            finding.evidenceIds ||
            finding.hasEvidence
        );
        const hasAssessmentLink = Boolean(
            finding.assessmentId ||
            finding.linkedAssessmentId ||
            finding.assessment ||
            finding.hasAssessment
        );

        const checks = [
            {
                key: "identity",
                label: "Finding identified",
                complete: hasTitle
            },
            {
                key: "classification",
                label: "Finding classified",
                complete: hasCategory
            },
            {
                key: "severity",
                label: "Severity defined",
                complete: hasSeverity
            },
            {
                key: "description",
                label: "Description captured",
                complete: hasDescription
            },
            {
                key: "evidence",
                label: "Evidence linked",
                complete: hasEvidenceLink
            },
            {
                key: "assessment",
                label: "Assessment connection",
                complete: hasAssessmentLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForAssessment: hasTitle && hasCategory && hasSeverity && hasDescription,
            isComplete: completed === total
        };
    }

    static renderCompletionPanel(finding = {}) {
        finding = finding || {};
        const completion = this.getCompletionState(finding);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForAssessment
            ? "Ready for Assessment"
            : "Needs more finding data";

        return `
            <section class="completion-panel" aria-label="Finding completion">
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

    static createCompletionPanel(finding = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(finding);
        return container;
    }

    static createHeader(activeFinding = null) {
        const summary = WorkspaceController.getActiveCaseSummary();

        return SectionHeader.create({
            eyebrow: "Finding Workspace",
            title: "Technical Findings",
            description: activeFinding
                ? `Active finding: ${activeFinding.title || activeFinding.id}`
                : `${summary.title} · Convert verified evidence into structured findings.`,
            actions: [
                {
                    id: "new-finding",
                    label: "+ New Finding",
                    onClick: () => this.createSampleFinding()
                }
            ]
        });
    }

    static createMetrics() {
        const findings = this.getFindings();
        const findingCount = findings.length;
        const criticalCount = findings.filter(item => item.severity === "Critical").length;
        const reviewedCount = findings.filter(item => item.status === "Reviewed").length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Findings", findingCount));
        grid.appendChild(MetricCard.create("Critical", criticalCount));
        grid.appendChild(MetricCard.create("Open", findingCount - reviewedCount));
        grid.appendChild(MetricCard.create("Linked Assessments", this.countAssessmentsLinkedToFinding()));

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
                id: "close-finding",
                label: "Close Finding",
                onClick: () => {
                    FindingManager.clear();
                    this.refresh();
                }
            },
            {
                id: "link-evidence",
                label: "Link Evidence",
                onClick: () => this.createSampleFinding()
            },
            {
                id: "create-assessment",
                label: "Create Assessment",
                onClick: () => this.createAssessmentFromSelectedFinding()
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const findings = this.getFindings();
        const activeFinding = FindingManager.get();

        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(findings));
        layout.appendChild(this.createDetailPanel(activeFinding, findings));

        return layout;
    }

    static createContent(findings = this.getFindings()) {
        if (!findings.length) {
            return EmptyState.create({
                eyebrow: "Finding Workspace",
                title: "No findings available",
                description: "Select verified evidence and document the technical observation to begin the finding chain.",
                actionLabel: "+ New Finding",
                onAction: () => this.createSampleFinding()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        findings.forEach(finding => {
            list.appendChild(this.createFindingRow(finding));
        });

        return list;
    }

    static createFindingRow(finding) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            FindingManager.set(finding);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = finding.title || finding.id || "Finding Item";

        const meta = document.createElement("span");
        meta.textContent = [
            finding.category || "General",
            finding.severity || "Medium",
            finding.source || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("span");
        statusContainer.innerHTML = this.renderFindingStatusBadge(finding);

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
                    FindingManager.set(finding);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    FindingManager.set(finding);
                    this.editSelectedFinding();
                    return;
                }

                if (action === "delete") {
                    this.deleteFinding(finding);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static createDetailPanel(activeFinding = FindingManager.get(), findings = this.getFindings()) {
        if (!activeFinding) {
            return DetailPanel.create("Finding Context", [
                { label: "Findings", value: String(findings.length) },
                { label: "Selected Finding", value: "Not selected" },
                { label: "Finding Status", value: findings.length ? "In Review" : "Not started" },
                { label: "Workspace Status", value: "—" },
                { label: "Next Step", value: "Create or select a finding" }
            ]);
        }

        const statusLabel = this.statusLabels[this.getFindingStatus(activeFinding)] || "Draft";

        return DetailPanel.create("Finding Context", [
            { label: "Selected Finding", value: activeFinding.title || activeFinding.id },
            { label: "Workspace Status", value: statusLabel },
            { label: "Source", value: activeFinding.source || "Expert Review" },
            { label: "Case ID", value: activeFinding.caseId || "Not linked" },
            { label: "Building ID", value: activeFinding.buildingId || "Not linked" },
            { label: "Inspection ID", value: activeFinding.inspectionId || "Not linked" },
            { label: "Evidence IDs", value: (activeFinding.evidenceIds || []).join(", ") || "None" },
            { label: "Category", value: activeFinding.category || "General" },
            { label: "Building System", value: activeFinding.buildingSystem || "Not linked" },
            { label: "Severity", value: activeFinding.severity || "Normal" },
            { label: "Description", value: activeFinding.description || "No description" },
            { label: "Assessment IDs", value: (activeFinding.assessmentIds || []).join(", ") || "None" },
            { label: "Linked Assessments", value: String(this.countAssessmentsLinkedToFinding(activeFinding.id)) }
        ]);
    }

    static getFindings() {
        const currentCase = CaseManager.getCurrent();

        return WorkspaceController.safeValue(
            () => currentCase
                ? FindingManager.getByCase(currentCase.id)
                : FindingManager.getAll(),
            []
        );
    }

    static countAssessmentsLinkedToFinding(findingId = null) {
        const targetFindingId = findingId || FindingManager.get()?.id;

        if (!targetFindingId) {
            return 0;
        }

        const currentCase = CaseManager.getCurrent();
        const assessments = currentCase
            ? AssessmentManager.getByCase(currentCase.id)
            : AssessmentManager.getAll();

        return assessments
            .filter(assessment => (assessment.findingIds || []).includes(targetFindingId))
            .length;
    }

    static createAssessmentFromSelectedFinding() {
        const finding = FindingManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!finding) {
            Notification.warning("Select a finding first.");
            return;
        }

        if (!finding.caseId) {
            Notification.warning("Selected finding is not linked to a case.");
            return;
        }

        if (currentCase && currentCase.id !== finding.caseId) {
            Notification.warning("Selected finding belongs to another case.");
            return;
        }

        const severity = finding.severity || "Medium";
        const probability = finding.probability || "Medium";
        const consequence = "Medium";

        const assessment = AssessmentManager.create({
            caseId: finding.caseId,
            buildingId: finding.buildingId,
            inspectionId: finding.inspectionId,
            findingIds: [finding.id],
            evidenceIds: finding.evidenceIds || [],
            title: `Assessment from ${finding.title || finding.id}`,
            description: [
                finding.description || "Assessment generated from selected finding.",
                "",
                "Finding trace:",
                `Finding ID: ${finding.id}`,
                `Finding source: ${finding.source || "Expert Review"}`,
                `Evidence IDs: ${(finding.evidenceIds || []).join(", ") || "None"}`
            ].join("\n"),
            category: finding.category || "General",
            source: finding.source || "Finding Review",
            buildingSystem: finding.buildingSystem || "",
            severity,
            probability,
            consequence,
            riskScore: AssessmentManager.calculateRiskScore(severity, probability, consequence),
            priority: finding.priority || "Medium",
            status: "Draft"
        });

        AssessmentManager.set(assessment);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                assessmentIds: [...new Set([...(activeCaseForSync.assessmentIds || []), assessment.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedFinding = FindingManager.update({
            ...finding,
            assessmentIds: [...new Set([...(finding.assessmentIds || []), assessment.id])],
            updatedAt: new Date().toISOString()
        });

        FindingManager.set(updatedFinding);

        Notification.success("Assessment created from selected finding.");
        WorkspaceRouter.navigate("assessments");
    }

    static editSelectedFinding() {
        const finding = FindingManager.get();

        if (!finding) {
            Notification.info("Select a finding before editing.");
            return;
        }

        FormDialog.open({
            title: "Edit Finding",
            submitLabel: "Save Finding",
            values: {
                title: finding.title || "",
                description: finding.description || "",
                category: finding.category || "General",
                severity: finding.severity || "Medium",
                status: finding.status || "Open"
            },
            fields: [
                { id: "title", label: "Finding title" },
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
                    id: "status",
                    label: "Status",
                    type: "select",
                    options: ["Open", "Identified", "Assessed", "Reviewed", "Blocked"]
                }
            ],
            onSubmit: (values, dialog) => {
                if (!values.title) return;

                const updated = FindingManager.update({
                    ...finding,
                    title: values.title,
                    description: values.description || "",
                    category: values.category || "General",
                    severity: values.severity || "Medium",
                    status: values.status || "Open",
                    updatedAt: new Date().toISOString()
                });

                FindingManager.set(updated);
                dialog.remove();
                Notification.success("Finding updated.");
                this.refresh();
            }
        });
    }

    static deleteFinding(item) {
        if (!window.confirm(`Delete finding "${item.title || item.id}"?`)) {
            return;
        }

        FindingManager.delete(item.id);

        if (FindingManager.get()?.id === item.id) {
            FindingManager.clear();
        }

        Notification.success("Finding deleted.");
        this.refresh();
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleFinding() {

        const currentCase = CaseManager.getCurrent();

        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();

        const activeEvidence = EvidenceManager.get();

        if (!currentCase) {

            Notification.info("Open a case before creating a finding.");

            return;

        }

        FormDialog.open({

            title: "New Finding",

            submitLabel: "Create Finding",

            values: {

                title: "",

                description: "",

                category: "General",

                severity: "Medium",

                status: "Open"

            },

            fields: [

                {

                    id: "title",

                    label: "Finding title"

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

                    id: "status",

                    label: "Status",

                    type: "select",

                    options: ["Open", "Identified", "Assessed", "Reviewed", "Blocked"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                if (!activeEvidence) {
            Notification.info("Select evidence before creating a finding.");
            return;
        }

        const finding = FindingManager.create({

                    caseId: activeEvidence?.caseId || currentCase.id,

                    buildingId: activeEvidence?.buildingId || currentBuilding?.id || null,

                    inspectionId: activeEvidence?.inspectionId || currentInspection?.id || null,

                    evidenceIds: activeEvidence ? [activeEvidence.id] : [],

                    title: values.title,

                    description: values.description || "",

                    category: values.category || "General",

                    severity: values.severity || "Medium",

                    status: values.status || "Open"

                });

                FindingManager.set(finding);

                dialog.remove();

                Notification.success("Finding created.");

                this.refresh();

            }

        });

    }


    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

    static getFindingIntelligence(finding = {}) {
        finding = finding || {};
        const hasIdentity = Boolean(finding.title || finding.name);
        const hasCategory = Boolean(finding.category || finding.type);
        const hasSeverity = Boolean(finding.severity || finding.priority || finding.riskLevel);
        const hasDescription = Boolean(finding.description || finding.summary || finding.note);
        const hasEvidenceLink = Boolean(
            finding.evidenceId ||
            finding.linkedEvidenceId ||
            finding.evidence ||
            finding.evidenceIds ||
            finding.hasEvidence
        );
        const hasAssessmentLink = Boolean(
            finding.assessmentId ||
            finding.linkedAssessmentId ||
            finding.assessment ||
            finding.hasAssessment
        );
        const isReviewed = Boolean(finding.reviewed || finding.status === "reviewed");

        const checks = [
            hasIdentity,
            hasCategory,
            hasSeverity,
            hasDescription,
            hasEvidenceLink,
            hasAssessmentLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals: hasSeverity ? 1 : 0,
            downstreamSignals:
                (hasEvidenceLink ? 1 : 0) +
                (hasAssessmentLink ? 1 : 0),
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.66,
                primary: 10,
                downstream: 9,
                output: 6
            }
        });

        let severitySignal = {
            label: "Low severity signal",
            description: "Finding severity is still unclear. Define severity, probability or risk level before assessment.",
            tone: "draft"
        };

        if (hasSeverity && hasEvidenceLink && hasAssessmentLink) {
            severitySignal = {
                label: "Strong severity signal",
                description: "Finding has severity context, evidence support and downstream assessment connection.",
                tone: "ready"
            };
        } else if (hasSeverity && hasDescription) {
            severitySignal = {
                label: "Developing severity signal",
                description: "Finding has useful severity context but may still need evidence or assessment linkage.",
                tone: "active"
            };
        }

        const nextAction = hasAssessmentLink
            ? {
                label: "Review linked assessment",
                description: "Finding is connected to an assessment. Review whether risk logic reflects the finding accurately.",
                tone: "ready"
            }
            : hasSeverity && hasDescription
                ? {
                    label: "Create or link assessment",
                    description: "Finding is sufficiently described. Connect it to a technical assessment.",
                    tone: "active"
                }
                : {
                    label: "Define finding severity",
                    description: "Add severity, description and evidence context before moving toward assessment.",
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            severitySignal,
            nextAction,
            label: readinessPercent >= 100
                ? "Finding intelligence complete"
                : readinessPercent >= 50
                    ? "Finding intelligence developing"
                    : "Finding intelligence early"
        };
    }

    static renderFindingIntelligenceSnapshot(finding = {}) {
        finding = finding || {};
        const intelligence = this.getFindingIntelligence(finding);

        return `
            <section class="finding-intelligence intelligence-snapshot" aria-label="Finding intelligence snapshot">
                <div class="finding-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="finding-intelligence__eyebrow intelligence-snapshot__eyebrow">Finding Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} finding intelligence checks completed</p>
                    </div>
                    <span class="finding-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="finding-intelligence__grid intelligence-snapshot__grid">
                    <article class="finding-intelligence__card intelligence-snapshot__card">
                        <span>Assessment Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, classification, severity, description, evidence link, assessment link and review state.</p>
                    </article>

                    <article class="finding-intelligence__card intelligence-snapshot__card finding-intelligence__card--${intelligence.severitySignal.tone} intelligence-snapshot__card--${intelligence.severitySignal.tone}">
                        <span>Severity Signal</span>
                        <strong>${intelligence.severitySignal.label}</strong>
                        <p>${intelligence.severitySignal.description}</p>
                    </article>

                    <article class="finding-intelligence__card intelligence-snapshot__card finding-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Finding Action</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createFindingIntelligenceSnapshot(finding = FindingManager.get()) {
        if (!finding || !finding.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderFindingIntelligenceSnapshot(finding);
        return container;
    }

}