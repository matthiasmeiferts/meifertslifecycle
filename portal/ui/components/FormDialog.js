import ModalDialog from "./ModalDialog.js";

export default class FormDialog {

    static open({
        title = "Form",
        fields = [],
        values = {},
        submitLabel = "Save",
        onSubmit = null
    } = {}) {
        const body = document.createElement("div");
        body.className = "modal-body";

        fields.forEach(field => {
            const label = document.createElement("label");
            label.textContent = field.label;

            const input = field.type === "select"
                ? this.createSelect(field, values[field.id])
                : this.createInput(field, values[field.id]);

            label.appendChild(input);
            body.appendChild(label);
        });

        const footer = document.createElement("div");
        footer.className = "modal-footer";

        const cancel = document.createElement("button");
        cancel.className = "button";
        cancel.type = "button";
        cancel.textContent = "Cancel";

        const save = document.createElement("button");
        save.className = "button";
        save.type = "button";
        save.textContent = submitLabel;

        footer.appendChild(cancel);
        footer.appendChild(save);
        body.appendChild(footer);

        const dialog = ModalDialog.create(title, body);
        document.body.appendChild(dialog);

        cancel.onclick = () => dialog.remove();

        save.onclick = () => {
            const result = {};

            fields.forEach(field => {
                const element = body.querySelector(`[name="${field.id}"]`);
                result[field.id] = element ? element.value : "";
            });

            if (typeof onSubmit === "function") {
                onSubmit(result, dialog);
            }
        };

        return dialog;
    }

    static createInput(field, value = "") {
        const input = document.createElement("input");

        input.name = field.id;
        input.type = field.type || "text";
        input.value = value || "";
        input.placeholder = field.placeholder || "";

        return input;
    }

    static createSelect(field, value = "") {
        const select = document.createElement("select");
        select.name = field.id;

        (field.options || []).forEach(option => {
            const item = document.createElement("option");
            item.value = option;
            item.textContent = option;

            if (option === value) {
                item.selected = true;
            }

            select.appendChild(item);
        });

        return select;
    }

}