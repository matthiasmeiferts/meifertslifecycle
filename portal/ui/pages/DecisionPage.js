export default class DecisionPage {

    static render() {

        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Decision Workspace</p>

            <h2>Decisions</h2>

            <p>
                Record expert decisions, document reasoning,
                confidence and approval for complete traceability.
            </p>
        `;

        return section;

    }

}