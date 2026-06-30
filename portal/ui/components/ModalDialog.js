export default class ModalDialog {

    static create(title = "", content = null) {

        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";

        const dialog = document.createElement("div");
        dialog.className = "modal-dialog";

        const header = document.createElement("div");
        header.className = "modal-header";

        const h2 = document.createElement("h2");
        h2.textContent = title;

        const close = document.createElement("button");
        close.className = "button";
        close.textContent = "✕";

        close.onclick = () => overlay.remove();

        header.appendChild(h2);
        header.appendChild(close);

        dialog.appendChild(header);

        if (content) {
            dialog.appendChild(content);
        }

        overlay.appendChild(dialog);

        return overlay;

    }

}