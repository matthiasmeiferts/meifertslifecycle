import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import WorkspaceController from "../../controllers/WorkspaceController.js";
import FindingManager from "../../core/FindingManager.js";
import AssessmentManager from "../../core/AssessmentManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

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

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createFlowIndicator(activeFinding));
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        return fragment;
    }

    static getFlowState(finding = {}) {
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
        const status = this.getFindingStatus(finding);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static createHeader() {
        const summary = WorkspaceController.getActiveCaseSummary();

        return SectionHeader.create({
            eyebrow: "Finding Workspace",
            title: "Technical Findings",
            description: `${summary.title} · Convert verified evidence into structured findings.`,
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
        const row = document.createElement("button");
        row.type = "button";
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            FindingManager.set(finding);
            this.refresh();
        });

        const title = document.createElement("strong");
        title.textContent = finding.title || finding.name || finding.id || "Finding Item";

        const meta = document.createElement("span");
        meta.textContent = `${finding.severity || "Normal"}`;

        const statusContainer = document.createElement("div");
        statusContainer.innerHTML = this.renderFindingStatusBadge(finding);
        const statusBadge = statusContainer.firstChild;

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(statusBadge);

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
            { label: "Severity", value: activeFinding.severity || "Normal" },
            { label: "Linked Assessments", value: String(this.countAssessmentsLinkedToFinding(activeFinding.id)) }
        ]);
    }

    static getFindings() {
        return WorkspaceController.safeValue(
            () => FindingManager.getAll(),
            []
        );
    }

    static countAssessmentsLinkedToFinding(findingId = null) {
        const targetFindingId = findingId || FindingManager.get()?.id;

        if (!targetFindingId) {
            return 0;
        }

        return AssessmentManager.getAll()
            .filter(assessment => (assessment.findingIds || []).includes(targetFindingId))
            .length;
    }

    static createAssessmentFromSelectedFinding() {
        const finding = FindingManager.get();

        if (!finding) {
            Notification.warning("Select a finding first.");
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
            description: finding.description || "Assessment generated from selected finding.",
            category: finding.category || "General",
            severity,
            probability,
            consequence,
            riskScore: AssessmentManager.calculateRiskScore(severity, probability, consequence),
            priority: finding.priority || "Medium",
            status: "Draft"
        });

        AssessmentManager.set(assessment);
        Notification.success("Assessment created from selected finding.");
        WorkspaceRouter.navigate("assessments");
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleFinding() {
        const finding = FindingManager.create({
            caseId: "demo-case",
            buildingId: "demo-building",
            inspectionId: "demo-inspection",
            title: "Sample Finding",
            description: "Initial finding record created from the workspace.",
            category: "General",
            severity: "Medium",
            status: "Open"
        });

        FindingManager.set(finding);
        Notification.success("Finding created.");
        this.refresh();
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

}