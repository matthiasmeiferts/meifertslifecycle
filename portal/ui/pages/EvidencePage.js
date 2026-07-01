import WorkspaceRouter from "../../router/WorkspaceRouter.js";
import WorkspaceController from "../../controllers/WorkspaceController.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import FindingManager from "../../core/FindingManager.js";
import SectionHeader from "../components/SectionHeader.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";

export default class EvidencePage {

    static flowSteps = [
        {
            key: "evidence",
            label: "Evidence",
            description: "Inspection evidence captured"
        },
        {
            key: "finding",
            label: "Finding",
            description: "Technical finding derived"
        }
    ];

    static statusLabels = {
        draft: "Draft",
        captured: "Captured",
        linked: "Linked",
        reviewed: "Reviewed",
        blocked: "Blocked"
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const activeEvidence = EvidenceManager.get();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createFlowIndicator(activeEvidence));
        fragment.appendChild(this.createNextActionPanel(activeEvidence));
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        return fragment;
    }

    static getEvidenceStatus(evidence = {}) {
        if (evidence.blocked || evidence.status === "blocked") {
            return "blocked";
        }

        if (evidence.reviewed || evidence.status === "reviewed") {
            return "reviewed";
        }

        if (
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding ||
            evidence.status === "linked"
        ) {
            return "linked";
        }

        if (
            evidence.captured ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl ||
            evidence.status === "captured"
        ) {
            return "captured";
        }

        return "draft";
    }

    static getNextAction(evidence = {}) {
        const status = this.getEvidenceStatus
            ? this.getEvidenceStatus(evidence)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This evidence cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm finding",
                description: "Evidence is reviewed and ready to support a technical finding.",
                tone: "ready"
            };
        }

        if (status === "linked") {
            return {
                label: "Review linked finding",
                description: "This evidence is already connected to a finding. Check completeness before assessment.",
                tone: "linked"
            };
        }

        if (status === "captured") {
            return {
                label: "Review evidence",
                description: "Captured evidence should be checked before it is linked to a finding.",
                tone: "active"
            };
        }

        return {
            label: "Capture evidence",
            description: "Add a photo, document, note or inspection reference to start the workflow.",
            tone: "draft"
        };
    }

    static getFlowState(evidence = {}) {
        const hasFindingLink =
            Boolean(evidence.findingId) ||
            Boolean(evidence.linkedFindingId) ||
            Boolean(evidence.finding) ||
            Boolean(evidence.hasFinding);

        return {
            evidence: "active",
            finding: hasFindingLink ? "complete" : "next"
        };
    }

    static renderEvidenceStatusBadge(evidence = {}) {
        const status = this.getEvidenceStatus(evidence);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static renderNextActionPanel(evidence = {}) {
        const action = this.getNextAction(evidence);

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

    static renderActiveFlowIndicator(evidence = {}) {
        const flowState = this.getFlowState(evidence);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>Evidence → Finding</strong>
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

    static createFlowIndicator(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(evidence);
        return container;
    }

    static createNextActionPanel(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(evidence);
        return container;
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
        grid.appendChild(MetricCard.create("Linked Findings", this.countFindingsLinkedToEvidence()));
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
                id: "create-finding",
                label: "Create Finding",
                onClick: () => this.createFindingFromSelectedEvidence()
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
        meta.textContent = `${item.evidenceType || item.type || "Evidence"}`;

        const statusContainer = document.createElement("div");
        statusContainer.innerHTML = this.renderEvidenceStatusBadge(item);
        const statusBadge = statusContainer.firstChild;

        row.appendChild(title);
        row.appendChild(meta);
        row.appendChild(statusBadge);

        return row;
    }

    static createDetailPanel(activeEvidence = EvidenceManager.get(), evidenceItems = this.getEvidenceItems()) {
        if (!activeEvidence) {
            return DetailPanel.create("Evidence Context", [
                { label: "Evidence Items", value: String(evidenceItems.length) },
                { label: "Selected Evidence", value: "Not selected" },
                { label: "Evidence Status", value: evidenceItems.length ? "In Review" : "Not started" },
                { label: "Workspace Status", value: "—" },
                { label: "Next Step", value: "Create or select evidence" }
            ]);
        }

        const statusLabel = this.statusLabels[this.getEvidenceStatus(activeEvidence)] || "Draft";

        return DetailPanel.create("Evidence Context", [
            { label: "Selected Evidence", value: activeEvidence.title || activeEvidence.id },
            { label: "Workspace Status", value: statusLabel },
            { label: "Case ID", value: activeEvidence.caseId || "Not linked" },
            { label: "Linked Findings", value: String(this.countFindingsLinkedToEvidence(activeEvidence.id)) }
        ]);
    }

    static getEvidenceItems() {
        return WorkspaceController.safeValue(
            () => EvidenceManager.getAll(),
            []
        );
    }

    static countFindingsLinkedToEvidence(evidenceId = null) {
        const targetEvidenceId = evidenceId || EvidenceManager.get()?.id;

        if (!targetEvidenceId) {
            return 0;
        }

        return FindingManager.getAll()
            .filter(finding => (finding.evidenceIds || []).includes(targetEvidenceId))
            .length;
    }

    static getActiveEvidenceForFlow() {
        return EvidenceManager.get() || {};
    }

    static createFindingFromSelectedEvidence() {
        const evidence = EvidenceManager.get();

        if (!evidence) {
            Notification.warning("Select evidence first.");
            return;
        }

        const finding = FindingManager.create({
            caseId: evidence.caseId,
            buildingId: evidence.buildingId,
            inspectionId: evidence.inspectionId,
            evidenceIds: [evidence.id],
            title: `Finding from ${evidence.title || evidence.id}`,
            description: evidence.description || "Finding generated from selected evidence.",
            category: evidence.evidenceType || evidence.type || "General",
            severity: "Medium",
            status: "Open"
        });

        FindingManager.set(finding);
        Notification.success("Finding created from selected evidence.");
        WorkspaceRouter.navigate("findings");
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
