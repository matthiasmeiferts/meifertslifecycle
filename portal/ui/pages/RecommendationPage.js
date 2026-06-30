export default class RecommendationPage {

    static render() {

        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Recommendation Workspace</p>

            <h2>Recommendations</h2>

            <p>
                Develop technical recommendations, define priorities,
                estimate CAPEX and prepare expert decision support.
            </p>
        `;

        return section;

    }

}