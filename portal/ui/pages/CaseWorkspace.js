export default class CaseWorkspace {

    static create(caseSummary = {}) {

        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Case Workspace</p>

            <h2>${caseSummary.title || "No active case"}</h2>

            <p>${caseSummary.subtitle || "Create or open a case to begin."}</p>

            <div class="metrics-grid" style="margin-top:24px;">

                <div class="metric-card">
                    <span>Client</span>
                    <strong>${caseSummary.client || "-"}</strong>
                </div>

                <div class="metric-card">
                    <span>Building</span>
                    <strong>${caseSummary.building || "-"}</strong>
                </div>

                <div class="metric-card">
                    <span>Status</span>
                    <strong>${caseSummary.status || "Draft"}</strong>
                </div>

                <div class="metric-card">
                    <span>Progress</span>
                    <strong>${caseSummary.progress || "0%"}</strong>
                </div>

            </div>
        `;

        return section;
    }

}