export default class ReportPage {

    static render() {

        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Report Workspace</p>

            <h2>Reports</h2>

            <p>
                Generate professional Technical Due Diligence reports,
                executive summaries and Building Intelligence documents.
            </p>
        `;

        return section;

    }

}