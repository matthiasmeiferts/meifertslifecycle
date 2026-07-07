export default class ActionBar {

    static create(actions = []) {
        const bar = document.createElement("div");
        bar.className = "action-bar";

        actions.forEach(action => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = this.getButtonClass(action);
            button.dataset.action = action.id || "";
            button.textContent = action.label || "";
            button.disabled = action.disabled === true;

            if (action.title) {
                button.title = action.title;
            }

            if (action.ariaLabel) {
                button.setAttribute("aria-label", action.ariaLabel);
            }

            if (button.disabled) {
                button.setAttribute("aria-disabled", "true");
            }

            if (!button.disabled && typeof action.onClick === "function") {
                button.addEventListener("click", action.onClick);
            }

            bar.appendChild(button);
        });

        return bar;
    }

    static getButtonClass(action = {}) {
        if (action.className) {
            return action.className;
        }

        if (action.secondary === true || action.variant === "secondary") {
            return "button secondary";
        }

        if (action.disabled === true) {
            return "button secondary";
        }

        return "button";
    }

}
