import CaseManager from "../../core/CaseManager.js";
import SectionHeader from "../components/SectionHeader.js";
import SearchBar from "../components/SearchBar.js";
import ActionBar from "../components/ActionBar.js";
import WorkspaceTable from "../components/WorkspaceTable.js";
import EmptyState from "../components/EmptyState.js";
import StatusBadge from "../components/StatusBadge.js";
import DetailPanel from "../components/DetailPanel.js";

export default class CasePage {

    static searchQuery = "";

    static render() {
        const fragment = document.createDocumentFragment();

        fragment.appendChild(this.createHeader());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        setTimeout(() => this.bindActions(), 0);

        return fragment;
    }

    static createHeader() {
        const current = CaseManager.getCurrent();

        return SectionHeader.create({
            eyebrow: "Case Workspace",
            title: "Cases",
            description: current
                ? `Active case: ${current.title}`
                : "Create or manage Technical Property Review cases.",
            actions: [
                {
                    id: "new-case",
                    label: "+ New Case",
                    onClick: () => this.createCase()
                }
            ]
        });
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(
            SearchBar.create({
                placeholder: "Search cases...",
                onSearch: value => {
                    this.searchQuery = value.toLowerCase();
                    this.refresh();
                }
            })
        );

        wrapper.appendChild(
            ActionBar.create([
                {
                    id: "refresh",
                    label: "Refresh",
                    onClick: () => this.refresh()
                },
                {
                    id: "close-case",
                    label: "Close Case",
                    onClick: () => {
                        CaseManager.close();
                        this.refresh();
                    }
                }
            ])
        );

        return wrapper;
    }

    static createMainLayout() {
        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent());
        layout.appendChild(this.createDetailPanel());

        return layout;
    }

    static createContent() {
        const cases = this.getFilteredCases();

        if (!cases.length) {
            return EmptyState.create({
                eyebrow: "Case Workspace",
                title: "No cases available",
                description: "Create your first case to begin the Building Intelligence workflow.",
                actionLabel: "+ New Case",
                onAction: () => this.createCase()
            });
        }

        return WorkspaceTable.create({
            columns: [
                {
                    key: "title",
                    label: "Case"
                },
                {
                    key: "type",
                    label: "Type"
                },
                {
                    key: "status",
                    label: "Status",
                    render: row =>
                        StatusBadge.create(row.status || "Draft", "warning")
                },
                {
                    key: "progress",
                    label: "Progress",
                    render: row => `${row.progress || 0}%`
                },
                {
                    key: "updatedAt",
                    label: "Updated",
                    render: row => this.formatDate(row.updatedAt)
                },
                {
                    key: "actions",
                    label: "Actions",
                    render: row => this.createActionButtons(row)
                }
            ],
            rows: cases,
            onRowClick: row => this.openCase(row)
        });
    }

    static createDetailPanel() {
        const current = CaseManager.getCurrent();

        if (!current) {
            return DetailPanel.create("No Case Selected", [
                {
                    label: "Status",
                    value: "No active case"
                },
                {
                    label: "Next Step",
                    value: "Create or open a case"
                }
            ]);
        }

        return DetailPanel.create(current.title, [
            {
                label: "Status",
                value: current.status || "Draft"
            },
            {
                label: "Type",
                value: current.type || "Technical Property Review"
            },
            {
                label: "Progress",
                value: `${current.progress || 0}%`
            },
            {
                label: "Building",
                value: current.buildingId || "Not linked"
            },
            {
                label: "Inspection",
                value: current.inspectionId || "Not linked"
            },
            {
                label: "Evidence",
                value: current.evidenceIds?.length || 0
            },
            {
                label: "Findings",
                value: current.findingIds?.length || 0
            },
            {
                label: "Updated",
                value: this.formatDate(current.updatedAt)
            }
        ]);
    }

    static createActionButtons(row) {
        const wrapper = document.createElement("div");
        wrapper.className = "table-actions";

        [
            ["open", "Open"],
            ["edit", "Edit"],
            ["delete", "Delete"]
        ].forEach(([action, label]) => {

            const button = document.createElement("button");

            button.className = "button";
            button.type = "button";
            button.textContent = label;

            button.dataset.caseAction = action;
            button.dataset.id = row.id;

            button.setAttribute("data-stop-row-click", "true");

            wrapper.appendChild(button);

        });

        return wrapper;
    }

    static bindActions() {
        document
            .querySelectorAll("[data-case-action]")
            .forEach(button => {

                button.addEventListener("click", event => {

                    event.stopPropagation();

                    const action = button.dataset.caseAction;
                    const id = button.dataset.id;

                    const item = CaseManager.load(id);

                    if (!item) return;

                    switch (action) {

                        case "open":
                            this.openCase(item);
                            break;

                        case "edit":
                            this.editCase(item);
                            break;

                        case "delete":
                            this.deleteCase(item);
                            break;

                    }

                });

            });
    }

    static getFilteredCases() {

        const cases = CaseManager.getAll();

        if (!this.searchQuery) return cases;

        return cases.filter(item => {

            const text = `
                ${item.title || ""}
                ${item.type || ""}
                ${item.status || ""}
            `.toLowerCase();

            return text.includes(this.searchQuery);

        });

    }

    static createCase() {

        const title = window.prompt("Case title:");

        if (!title) return;

        CaseManager.create({
            id: `case-${Date.now()}`,
            title,
            type: "Technical Property Review",
            status: "Draft",
            progress: 0
        });

        this.refresh();

    }

    static openCase(caseData) {

        CaseManager.setCurrent(caseData);

        this.refresh();

    }

    static editCase(caseData) {

        const title = window.prompt(
            "Edit case title:",
            caseData.title
        );

        if (!title) return;

        CaseManager.open({
            ...caseData,
            title,
            updatedAt: new Date().toISOString()
        });

        this.refresh();

    }

    static deleteCase(caseData) {

        if (
            !window.confirm(
                `Delete case "${caseData.title}"?`
            )
        ) {
            return;
        }

        CaseManager.delete(caseData.id);

        this.refresh();

    }

    static refresh() {

        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";

        container.appendChild(this.render());

    }

    static formatDate(value) {

        if (!value) return "—";

        return new Date(value).toLocaleDateString();

    }

}