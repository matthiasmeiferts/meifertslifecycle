import WorkspaceController from "../../controllers/WorkspaceController.js";
import FindingManager from "../../core/FindingManager.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";

export default class FindingPage {

    static render() {

        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHero());
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createFindingWorkspace());

        return fragment;

    }

    static createHero() {

        const summary = WorkspaceController.getActiveCaseSummary();

        const hero = document.createElement("section");
        hero.className = "hero-card";

        hero.innerHTML = `
            <p class="eyebrow">Finding Workspace</p>
            <h2>Technical Findings</h2>
            <p>${summary.title} · Convert verified evidence into structured findings.</p>
        `;

        hero.appendChild(
            StatusBadge.create("Evidence → Finding", "success")
        );

        return hero;

    }

    static createMetrics() {

        const findings = WorkspaceController.safeValue(
            () => FindingManager.count()
        );

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Findings", findings));
        grid.appendChild(MetricCard.create("Critical", "0"));
        grid.appendChild(MetricCard.create("Open", findings));
        grid.appendChild(MetricCard.create("Reviewed", "0"));

        return grid;

    }

    static createFindingWorkspace() {

        const section = document.createElement("section");
        section.className = "workflow-card";

        section.innerHTML = `
            <div class="section-header">
                <div>
                    <p class="eyebrow">Finding Queue</p>
                    <h2>Current Findings</h2>
                </div>
            </div>

            <div id="finding-list"></div>
        `;

        const list = section.querySelector("#finding-list");

        const findings = WorkspaceController.safeValue(
            () => FindingManager.getAll(),
            []
        );

        if (!findings.length) {

            list.innerHTML = `
                <div class="empty-state">
                    <p class="eyebrow">No Findings</p>
                    <h2>Create your first finding.</h2>
                    <p>Select evidence and document the technical observation.</p>
                </div>
            `;

        } else {

            findings.forEach(finding => {

                const row = document.createElement("div");
                row.className = "evidence-row";

                row.innerHTML = `
                    <strong>${finding.title || finding.id}</strong>
                    <span>${finding.severity || "Normal"}</span>
                `;

                list.appendChild(row);

            });

        }

        return section;

    }

}