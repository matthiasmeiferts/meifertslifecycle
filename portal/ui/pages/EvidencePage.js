import WorkspaceController from "../../controllers/WorkspaceController.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

export default class EvidencePage {

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
            eyebrow: "Evidence Workspace",
            title: "Evidence Collection",
            description: `${summary.title} · Capture, classify, and prepare evidence for findings.`,
            actions: [
                {
                    id: "new-evidence",
                    label: "+ New Evidence",
                    onClick: () => this.createSampleEvidence()
                }
            ]
        });
    }

    static createMetrics() {
        const evidenceItems = this.getEvidenceItems();
        const evidenceCount = evidenceItems.length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Total Evidence", evidenceCount));
        grid.appendChild(MetricCard.create("Selected", EvidenceManager.get() ? "1" : "0"));
        grid.appendChild(MetricCard.create("Linked Findings", "Pending"));
        grid.appendChild(MetricCard.create("Review Status", "Open"));

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
                id: "upload-evidence",
                label: "Upload",
                onClick: () => this.createSampleEvidence()
            },
            {
                id: "filter-evidence",
                label: "Filter",
                onClick: () => this.showPendingFeature("Evidence filters")
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const evidenceItems = this.getEvidenceItems();
        const activeEvidence = EvidenceManager.get();

        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(evidenceItems));
        layout.appendChild(this.createDetailPanel(activeEvidence, evidenceItems));

        return layout;
    }

    static createContent(evidenceItems = this.getEvidenceItems()) {
        if (!evidenceItems.length) {
            return EmptyState.create({
                eyebrow: "Evidence Workspace",
                title: "No evidence available",
                description: "Add photos, documents, inspection notes, or technical records to begin the evidence chain.",
                actionLabel: "+ New Evidence",
                onAction: () => this.createSampleEvidence()
            });
        }

        const list = document.createElement("section");
        list.className = "workflow-card evidence-list";

        evidenceItems.forEach(item => {
            list.appendChild(this.createEvidenceRow(item));
        });

        return list;
    }

    static createEvidenceRow(item) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            EvidenceManager.set(item);
            this.refresh();
        });

        const title = document.createElement("strong");
        title.textContent = item.title || item.name || item.id || "Evidence Item";

        const meta = document.createElement("span");
        meta.textContent = `${item.evidenceType || item.type || "Evidence"} · ${item.status || "Open"}`;

        const badge = StatusBadge.create(item.status || "Open", "warning");

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(badge);

        return row;
    }

    static createDetailPanel(activeEvidence = EvidenceManager.get(), evidenceItems = this.getEvidenceItems()) {
        if (!activeEvidence) {
            return DetailPanel.create("Evidence Context", [
                { label: "Evidence Items", value: String(evidenceItems.length) },
                { label: "Selected Evidence", value: "Not selected" },
                { label: "Evidence Status", value: evidenceItems.length ? "In Review" : "Not started" },
                { label: "Next Step", value: "Create or select evidence" }
            ]);
        }

        return DetailPanel.create("Evidence Context", [
            { label: "Selected Evidence", value: activeEvidence.title || activeEvidence.id },
            { label: "Evidence Status", value: activeEvidence.status || "Open" },
            { label: "Case ID", value: activeEvidence.caseId || "Not linked" },
            { label: "Next Step", value: "Connect evidence to findings" }
        ]);
    }

    static getEvidenceItems() {
        return WorkspaceController.safeValue(
            () => EvidenceManager.getAll(),
            []
        );
    }

    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleEvidence() {
        const evidence = EvidenceManager.create({
            caseId: "demo-case",
            buildingId: "demo-building",
            inspectionId: "demo-inspection",
            title: "Sample Evidence",
            description: "Initial evidence record created from the workspace.",
            evidenceType: "Photo",
            status: "Open"
        });

        EvidenceManager.set(evidence);
        Notification.success("Evidence created.");
        this.refresh();
    }

    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} will be added in the next foundation step.`);
    }

}
