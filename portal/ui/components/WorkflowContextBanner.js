export default class WorkflowContextBanner {

    static create(currentCase = null) {
        const wrapper = document.createElement("section");
        wrapper.className = currentCase
            ? "workflow-context-banner"
            : "workflow-context-banner workflow-context-banner--empty";

        const eyebrow = document.createElement("span");
        eyebrow.className = "workflow-context-banner__eyebrow";
        eyebrow.textContent = "Workflow Context";

        const title = document.createElement("strong");
        title.textContent = currentCase
            ? `Active case: ${currentCase.title || "Untitled case"}`
            : "No active case selected";

        const meta = document.createElement("p");

        if (currentCase) {
            const building = currentCase.buildingId || "No building linked";
            const inspection = currentCase.inspectionId || "No inspection linked";
            meta.textContent = `Building: ${building} · Inspection: ${inspection}`;
        } else {
            meta.textContent = "Open a case first to keep evidence, findings and decisions connected.";
        }

        wrapper.appendChild(eyebrow);
        wrapper.appendChild(title);
        wrapper.appendChild(meta);

        return wrapper;
    }

}
