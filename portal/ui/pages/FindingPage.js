import WorkspaceController from "../../controllers/WorkspaceController.js";
import FindingManager from "../../core/FindingManager.js";
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
                    onClick: () => this.showPendingFeature("Finding creation")
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
        grid.appendChild(MetricCard.create("Reviewed", reviewedCount));

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
                onClick: () => this.showPendingFeature("Evidence linking")
            },
            {
                id: "review-findings",
                label: "Review",
                onClick: () => this.showPendingFeature("Finding review")
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
        const findings = this.getFindings();

        if (!findings.length) {
            return EmptyState.create({
                eyebrow: "Finding Workspace",
                title: "No findings available",
                description: "Select verified evidence and document the technical observation to begin the finding chain.",
                actionLabel: "+ New Finding",
                onAction: () => this.showPendingFeature("Finding creation")
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        findings.forEach(finding => {
            const row = document.createElement("div");
            row.className = "evidence-row";

            const title = document.createElement("strong");
            title.textContent = finding.title || finding.name || finding.id || "Finding Item";

            const meta = document.createElement("span");
            meta.textContent = `${finding.severity || "Normal"} · ${finding.status || "Open"}`;

            const badge = StatusBadge.create(finding.status || "Open", "warning");

            row.appendChild(title);
            row.appendChild(meta);
            row.appendChild(badge);

            list.appendChild(row);
        });

        return list;
    }

    static createDetailPanel() {
        const findings = this.getFindings();

        return DetailPanel.create("Finding Context", [
            { label: "Findings", value: String(findings.length) },
            { label: "Finding Status", value: findings.length ? "In Review" : "Not started" },
            { label: "Next Step", value: "Assess technical relevance and risk" }
        ]);
    }

    static getFindings() {
        return WorkspaceController.safeValue(
            () => FindingManager.getAll(),
            []
        );
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