export default class ActionBar {

    static create(actions = []) {
        const bar = document.createElement("div");
        bar.className = "action-bar";

        bar.innerHTML = actions.map(action => `
            <button class="button" type="button" data-action="${action.id}">
                ${action.label}
            </button>
        `).join("");

        actions.forEach(action => {
            const button = bar.querySelector(`[data-action="${action.id}"]`);

            if (button && typeof action.onClick === "function") {
                button.addEventListener("click", action.onClick);
            }
        });

        return bar;
    }

}