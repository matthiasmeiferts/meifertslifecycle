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

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        return fragment;
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
        meta.textContent = `${finding.severity || "Normal"} · ${finding.status || "Open"}`;

        const badge = StatusBadge.create(finding.status || "Open", "warning");

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeFinding = FindingManager.get(), findings = this.getFindings()) {
        if (!activeFinding) {
            return DetailPanel.create("Finding Context", [
                { label: "Findings", value: String(findings.length) },
                { label: "Selected Finding", value: "Not selected" },
                { label: "Finding Status", value: findings.length ? "In Review" : "Not started" },
                { label: "Next Step", value: "Create or select a finding" }
            ]);
        }

        return DetailPanel.create("Finding Context", [
            { label: "Selected Finding", value: activeFinding.title || activeFinding.id },
            { label: "Severity", value: activeFinding.severity || "Normal" },
            { label: "Status", value: activeFinding.status || "Open" },
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
        this.refresh();
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