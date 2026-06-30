export default class BuildingPage {

    static render() {
        const section = document.createElement("section");
        section.className = "hero-card";

        section.innerHTML = `
            <p class="eyebrow">Building Workspace</p>
            <h2>Buildings</h2>
            <p>Manage building data, address information, asset profile, and technical baseline.</p>
        `;

        return section;
    }

}