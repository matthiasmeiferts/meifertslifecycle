import EmptyState from "./EmptyState.js";

export default class WorkspaceTable {

    static create({
        columns = [],
        rows = [],
        emptyTitle = "No records yet",
        emptyDescription = "Create your first record to begin.",
        onRowClick = null
    } = {}) {
        if (!rows.length) {
            return EmptyState.create({
                eyebrow: "Table",
                title: emptyTitle,
                description: emptyDescription
            });
        }

        const wrapper = document.createElement("section");
        wrapper.className = "table-card";

        const table = document.createElement("table");
        table.className = "workspace-table";

        table.appendChild(this.createHead(columns));
        table.appendChild(this.createBody(columns, rows, onRowClick));

        wrapper.appendChild(table);

        return wrapper;
    }

    static createHead(columns) {
        const thead = document.createElement("thead");
        const tr = document.createElement("tr");

        columns.forEach(column => {
            const th = document.createElement("th");
            th.textContent = column.label || column.key || "";
            tr.appendChild(th);
        });

        thead.appendChild(tr);

        return thead;
    }

    static createBody(columns, rows, onRowClick) {
        const tbody = document.createElement("tbody");

        rows.forEach(row => {
            const tr = document.createElement("tr");

            if (typeof onRowClick === "function") {
                tr.addEventListener("click", () => onRowClick(row));
            }

            columns.forEach(column => {
                const td = document.createElement("td");
                const content = this.renderCell(row, column);

                if (content instanceof Node) {
                    td.appendChild(content);
                } else {
                    td.innerHTML = String(content ?? "");
                }

                td.querySelectorAll("[data-stop-row-click]").forEach(element => {
                    element.addEventListener("click", event => {
                        event.stopPropagation();
                    });
                });

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        return tbody;
    }

    static renderCell(row, column) {
        if (typeof column.render === "function") {
            return column.render(row);
        }

        return row[column.key] ?? "";
    }

}