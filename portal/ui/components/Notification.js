export default class Notification {

    static types = ["success", "error", "warning", "info"];

    static success(message = "", options = {}) {
        this.show(message, "success", options);
    }

    static warning(message = "", options = {}) {
        this.show(message, "warning", options);
    }

    static error(message = "", options = {}) {
        this.show(message, "error", options);
    }

    static info(message = "", options = {}) {
        this.show(message, "info", options);
    }

    static show(message = "", type = "info", options = {}) {

        const notificationType = this.types.includes(type) ? type : "info";
        const container = this.getContainer();

        const notification = document.createElement("div");
        notification.className = `notification notification-${notificationType}`;

        const messageElement = document.createElement("span");
        messageElement.className = "notification-message";
        messageElement.textContent = message;

        const closeButton = document.createElement("button");
        closeButton.className = "notification-close";
        closeButton.type = "button";
        closeButton.setAttribute("aria-label", "Close notification");
        closeButton.textContent = "×";

        notification.appendChild(messageElement);
        notification.appendChild(closeButton);
        container.appendChild(notification);

        const removeNotification = () => {
            notification.classList.remove("visible");

            setTimeout(() => {
                notification.remove();
            }, 250);
        };

        closeButton.addEventListener("click", removeNotification);

        requestAnimationFrame(() => {
            notification.classList.add("visible");
        });

        const autoHide = options.autoHide !== false;
        const defaultDuration = notificationType === "error" ? 6000 : 3500;
        const duration = Number.isFinite(options.duration) ? options.duration : defaultDuration;

        if (autoHide) {
            setTimeout(removeNotification, duration);
        }

    }

    static clear() {
        const container = document.querySelector(".notification-container");

        if (!container) {
            return;
        }

        container.innerHTML = "";
    }

    static getContainer() {
        let container = document.querySelector(".notification-container");

        if (!container) {
            container = document.createElement("div");
            container.className = "notification-container";
            document.body.appendChild(container);
        }

        return container;
    }

}