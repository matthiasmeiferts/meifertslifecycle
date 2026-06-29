import WorkspaceController from "../../controllers/WorkspaceController.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";

export default class EvidencePage {

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHero());
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createEvidenceWorkspace());

        return fragment;
    }

    static createHero() {
        const summary = WorkspaceController.getActiveCaseSummary();

        const hero = document.createElement("section");
        hero.className = "hero-card";

        hero.innerHTML = `
            <p class="eyebrow">Evidence Workspace</p>
            <h2>Evidence Collection</h2>
            <p>${summary.title} · Capture, classify and prepare evidence for findings.</p>
        `;

        hero.appendChild(
            StatusBadge.create("Evidence First", "warning")
        );

        return hero;
    }

    static createMetrics() {
        const evidenceCount = WorkspaceController.safeValue(
            () => EvidenceManager.count()
        );

        const byCase = WorkspaceController.safeValue(
            () => EvidenceManager.getAll().length
        );

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Total Evidence", evidenceCount));
        grid.appendChild(MetricCard.create("Current Set", byCase));
        grid.appendChild(MetricCard.create("Linked Findings", "Pending"));
        grid.appendChild(MetricCard.create("Review Status", "Open"));

        return grid;
    }

    static createEvidenceWorkspace() {
        const wrapper = document.createElement("section");
        wrapper.className = "evidence-workspace";

        wrapper.innerHTML = `
            <div class="evidence-toolbar">
                <button type="button">+ New Evidence</button>
                <button type="button">Upload</button>
                <button type="button">Filter</button>
                <button type="button">Search</button>
            </div>

            <div class="evidence-layout">
                <div class="evidence-list" id="evidence-list"></div>

                <div class="evidence-preview">
                    <p class="eyebrow">Preview</p>
                    <h2>Select Evidence</h2>
                    <p>Choose an evidence item to inspect metadata, tags, severity and linked findings.</p>
                </div>
            </div>
        `;

        const list = wrapper.querySelector("#evidence-list");
        const evidenceItems = WorkspaceController.safeValue(
            () => EvidenceManager.getAll(),
            []
        );

        if (!evidenceItems.length) {
            list.innerHTML = `
                <div class="empty-state">
                    <p class="eyebrow">No Evidence Yet</p>
                    <h2>Start the evidence chain.</h2>
                    <p>Add photos, documents or inspection notes to begin the technical decision workflow.</p>
                </div>
            `;
        } else {
            evidenceItems.forEach(item => {
                const row = document.createElement("div");
                row.className = "evidence-row";

                row.innerHTML = `
                    <strong>${item.title || item.name || item.id}</strong>
                    <span>${item.type || "Evidence"} · ${item.status || "Open"}</span>
                `;

                list.appendChild(row);
            });
        }

        return wrapper;
    }

}