export default class InspectionPage {

    static render() {
        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Inspection Workspace</p>
            <h2>Inspections</h2>
            <p>Plan, document, and manage technical inspections linked to buildings, cases, and evidence.</p>
        `;

        return section;
    }

}