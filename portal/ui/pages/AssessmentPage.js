export default class AssessmentPage {

    static render() {

        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Assessment Workspace</p>

            <h2>Assessments</h2>

            <p>
                Evaluate findings, determine condition, estimate remaining useful life,
                assess technical risk and prepare CAPEX planning.
            </p>
        `;

        return section;

    }

}