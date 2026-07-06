import WorkspaceController from "../../controllers/WorkspaceController.js";
import EvidenceManager from "../../core/EvidenceManager.js";
import CaseManager from "../../core/CaseManager.js";
import BuildingManager from "../../core/BuildingManager.js";
import InspectionManager from "../../core/InspectionManager.js";
import FindingManager from "../../core/FindingManager.js";
import IntelligenceEngine from "../../core/IntelligenceEngine.js";
import SectionHeader from "../components/SectionHeader.js";
import WorkflowContextBanner from "../components/WorkflowContextBanner.js";
import WorkflowProgressPanel from "../components/WorkflowProgressPanel.js";
import ActionBar from "../components/ActionBar.js";
import EmptyState from "../components/EmptyState.js";
import DetailPanel from "../components/DetailPanel.js";
import MetricCard from "../components/MetricCard.js";
import StatusBadge from "../components/StatusBadge.js";
import Notification from "../components/Notification.js";
import FormDialog from "../components/FormDialog.js";

export default class EvidencePage {

    static flowSteps = [
        {
            key: "evidence",
            label: "Evidence",
            description: "Inspection evidence captured"
        },
        {
            key: "finding",
            label: "Finding",
            description: "Technical finding derived"
        }
    ];

    static statusLabels = {
        draft: "Draft",
        captured: "Captured",
        linked: "Linked",
        reviewed: "Reviewed",
        blocked: "Blocked"
    };

    static render() {
        const fragment = document.createDocumentFragment();
        const activeEvidence = EvidenceManager.get();

        fragment.appendChild(this.createHeader(activeEvidence));
        const currentCase = CaseManager.getCurrent();
        fragment.appendChild(WorkflowContextBanner.create(currentCase));
        fragment.appendChild(WorkflowProgressPanel.create(currentCase, "evidence"));
        const evidenceOverview = document.createElement("section");
        evidenceOverview.className = "evidence-polish-stack";
        evidenceOverview.appendChild(this.createFlowIndicator(activeEvidence));
        evidenceOverview.appendChild(this.createNextActionPanel(activeEvidence));
        evidenceOverview.appendChild(this.createCompletionPanel(activeEvidence));

        fragment.appendChild(evidenceOverview);
        fragment.appendChild(this.createEvidenceIntelligenceSnapshot(activeEvidence));
        fragment.appendChild(this.createMetrics());
        fragment.appendChild(this.createToolbar());
        fragment.appendChild(this.createMainLayout());

        this.scrollToRequestedTarget();

        return fragment;
    }

    static getEvidenceStatus(evidence = {}) {
        evidence = evidence || {};
        if (evidence.blocked || evidence.status === "blocked") {
            return "blocked";
        }

        if (evidence.reviewed || evidence.status === "reviewed") {
            return "reviewed";
        }

        if (
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding ||
            evidence.status === "linked"
        ) {
            return "linked";
        }

        if (
            evidence.captured ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl ||
            evidence.status === "captured"
        ) {
            return "captured";
        }

        return "draft";
    }

    static getNextAction(evidence = {}) {
        const status = this.getEvidenceStatus
            ? this.getEvidenceStatus(evidence)
            : "draft";

        if (status === "blocked") {
            return {
                label: "Resolve blocker",
                description: "This evidence cannot move forward until the blocker is cleared.",
                tone: "blocked"
            };
        }

        if (status === "reviewed") {
            return {
                label: "Create or confirm finding",
                description: "Evidence is reviewed and ready to support a technical finding.",
                tone: "ready"
            };
        }

        if (status === "linked") {
            return {
                label: "Review linked finding",
                description: "This evidence is already connected to a finding. Check completeness before assessment.",
                tone: "linked"
            };
        }

        if (status === "captured") {
            return {
                label: "Review evidence",
                description: "Captured evidence should be checked before it is linked to a finding.",
                tone: "active"
            };
        }

        return {
            label: "Capture evidence",
            description: "Add a photo, document, note or inspection reference to start the workflow.",
            tone: "draft"
        };
    }

    static getCompletionState(evidence = {}) {
        evidence = evidence || {};
        const hasTitle = Boolean(evidence.title || evidence.name);
        const hasType = Boolean(evidence.type || evidence.category);
        const hasSource = Boolean(
            evidence.source ||
            evidence.inspectionId ||
            evidence.buildingId ||
            evidence.caseId
        );
        const hasContent = Boolean(
            evidence.description ||
            evidence.note ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl
        );
        const hasFindingLink = Boolean(
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding
        );

        const checks = [
            {
                key: "identity",
                label: "Evidence identified",
                complete: hasTitle
            },
            {
                key: "classification",
                label: "Evidence classified",
                complete: hasType
            },
            {
                key: "source",
                label: "Source linked",
                complete: hasSource
            },
            {
                key: "content",
                label: "Content captured",
                complete: hasContent
            },
            {
                key: "finding",
                label: "Finding connection",
                complete: hasFindingLink
            }
        ];

        const completed = checks.filter((check) => check.complete).length;
        const total = checks.length;

        return {
            checks,
            completed,
            total,
            ratio: total > 0 ? completed / total : 0,
            isReadyForFinding: hasTitle && hasType && hasContent,
            isComplete: completed === total
        };
    }

    static getFlowState(evidence = {}) {
        evidence = evidence || {};
        const hasFindingLink =
            Boolean(evidence.findingId) ||
            Boolean(evidence.linkedFindingId) ||
            Boolean(evidence.finding) ||
            Boolean(evidence.hasFinding);

        return {
            evidence: "active",
            finding: hasFindingLink ? "complete" : "next"
        };
    }

    static renderEvidenceStatusBadge(evidence = {}) {
        evidence = evidence || {};
        const status = this.getEvidenceStatus(evidence);
        const label = this.statusLabels[status] || "Draft";

        return `<span class="evidence-status evidence-status--${status}">${label}</span>`;
    }

    static renderCompletionPanel(evidence = {}) {
        evidence = evidence || {};
        const completion = this.getCompletionState(evidence);
        const percent = Math.round(completion.ratio * 100);
        const readinessLabel = completion.isReadyForFinding
            ? "Ready for Finding"
            : "Needs more evidence data";

        return `
            <section class="completion-panel" aria-label="Evidence completion">
                <div class="completion-panel__header">
                    <div>
                        <span class="completion-panel__eyebrow">Completion</span>
                        <strong>${readinessLabel}</strong>
                    </div>
                    <span class="completion-panel__score">${percent}%</span>
                </div>

                <div class="completion-panel__bar" aria-hidden="true">
                    <div class="completion-panel__bar-fill" style="width: ${percent}%"></div>
                </div>

                <div class="completion-panel__checks">
                    ${completion.checks.map((check) => `
                        <div class="completion-panel__check ${check.complete ? "is-complete" : "is-open"}">
                            <span class="completion-panel__check-marker"></span>
                            <span>${check.label}</span>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    static renderNextActionPanel(evidence = {}) {
        const action = this.getNextAction(evidence);

        return `
            <section class="next-action next-action--${action.tone}" aria-label="Next action">
                <div>
                    <span class="next-action__eyebrow">Next Action</span>
                    <strong>${action.label}</strong>
                    <p>${action.description}</p>
                </div>
            </section>
        `;
    }

    static renderActiveFlowIndicator(evidence = {}) {
        evidence = evidence || {};
        const flowState = this.getFlowState(evidence);

        return `
            <section class="workspace-flow" aria-label="Active workflow state">
                <div class="workspace-flow__header">
                    <span class="workspace-flow__eyebrow">Active Flow</span>
                    <strong>Evidence → Finding</strong>
                </div>

                <div class="workspace-flow__steps">
                    ${this.flowSteps.map((step) => `
                        <div class="workspace-flow__step workspace-flow__step--${flowState[step.key]}">
                            <div class="workspace-flow__marker"></div>
                            <div>
                                <strong>${step.label}</strong>
                                <span>${step.description}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </section>
        `;
    }

    static createFlowIndicator(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderActiveFlowIndicator(evidence);
        return container;
    }

    static createNextActionPanel(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderNextActionPanel(evidence);
        return container;
    }

    static createCompletionPanel(evidence = {}) {
        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderCompletionPanel(evidence);
        return container;
    }

    static createHeader(activeEvidence = null) {
        const summary = WorkspaceController.getActiveCaseSummary();

        return SectionHeader.create({
            eyebrow: "Evidence Workspace",
            title: "Evidence Collection",
            description: activeEvidence
                ? `Active evidence: ${activeEvidence.title || activeEvidence.id}`
                : `${summary.title} · Capture, classify, and prepare evidence for findings.`,
            actions: [
                {
                    id: "new-evidence",
                    label: "+ New Evidence",
                    onClick: () => this.createSampleEvidence()
                }
            ]
        });
    }

    static createMetrics() {
        const evidenceItems = this.getEvidenceItems();
        const evidenceCount = evidenceItems.length;

        const grid = document.createElement("section");
        grid.className = "metrics-grid";

        grid.appendChild(MetricCard.create("Total Evidence", evidenceCount));
        grid.appendChild(MetricCard.create("Selected", EvidenceManager.get() ? "1" : "0"));
        grid.appendChild(MetricCard.create("Linked Findings", this.countFindingsLinkedToEvidence()));
        grid.appendChild(MetricCard.create("Review Status", "Open"));

        return grid;
    }

    static createToolbar() {
        const wrapper = document.createElement("section");
        wrapper.className = "workflow-card";

        wrapper.appendChild(ActionBar.create([
            {
                id: "refresh",
                label: "Refresh",
                onClick: () => this.refresh()
            },
            {
                id: "close-evidence",
                label: "Close Evidence",
                onClick: () => {
                    EvidenceManager.clear();
                    this.refresh();
                }
            },
            {
                id: "upload-evidence",
                label: "Upload",
                onClick: () => this.createSampleEvidence()
            },
            {
                id: "create-finding",
                label: "Create Finding",
                onClick: () => this.createFindingFromSelectedEvidence()
            }
        ]));

        return wrapper;
    }

    static createMainLayout() {
        const evidenceItems = this.getEvidenceItems();
        const activeEvidence = EvidenceManager.get();

        const layout = document.createElement("section");
        layout.className = "case-workspace-layout";

        layout.appendChild(this.createContent(evidenceItems));
        layout.appendChild(this.createDetailPanel(activeEvidence, evidenceItems));

        return layout;
    }

    static createContent(evidenceItems = this.getEvidenceItems()) {
        if (!evidenceItems.length) {
            return EmptyState.create({
                eyebrow: "Evidence Workspace",
                title: "No evidence available",
                description: "Add photos, documents, inspection notes, or technical records to begin the evidence chain.",
                actionLabel: "+ New Evidence",
                onAction: () => this.createSampleEvidence()
            });
        }

        const list = document.createElement("section");
        list.id = "evidence-list";
        list.className = "workflow-card evidence-list";

        evidenceItems.forEach(item => {
            list.appendChild(this.createEvidenceRow(item));
        });

        return list;
    }

    static createEvidenceRow(item) {
        const row = document.createElement("article");
        row.className = "evidence-row";
        row.addEventListener("click", () => {
            EvidenceManager.set(item);
            this.refresh();
        });

        const content = document.createElement("button");
        content.type = "button";
        content.className = "evidence-row__content";

        const title = document.createElement("strong");
        title.textContent = item.title || item.name || item.id || "Evidence Item";

        const meta = document.createElement("span");
        meta.textContent = [
            item.evidenceType || item.type || "Evidence",
            item.source || item.sourceType || ""
        ].filter(Boolean).join(" · ");

        const statusContainer = document.createElement("div");
        statusContainer.innerHTML = this.renderEvidenceStatusBadge(item);
        const statusBadge = statusContainer.firstChild;

        content.appendChild(title);
        content.appendChild(meta);
        content.appendChild(statusBadge);

        const actions = document.createElement("div");
        actions.className = "evidence-row__actions";

        [
            ["open", "Open"],
            ["edit", "Edit"],
            ["delete", "Delete"]
        ].forEach(([action, label]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button";
            button.textContent = label;

            button.addEventListener("click", event => {
                event.stopPropagation();

                if (action === "open") {
                    EvidenceManager.set(item);
                    this.refresh();
                    return;
                }

                if (action === "edit") {
                    EvidenceManager.set(item);
                    this.editSelectedEvidence();
                    return;
                }

                if (action === "delete") {
                    this.deleteEvidence(item);
                }
            });

            actions.appendChild(button);
        });

        row.appendChild(content);
        row.appendChild(actions);

        return row;
    }

    static deleteEvidence(item) {
        if (!window.confirm(`Delete evidence "${item.title || item.id}"?`)) {
            return;
        }

        EvidenceManager.delete(item.id);

        if (EvidenceManager.get()?.id === item.id) {
            EvidenceManager.clear();
        }

        Notification.success("Evidence deleted.");
        this.refresh();
    }

    static createDetailPanel(activeEvidence = EvidenceManager.get(), evidenceItems = this.getEvidenceItems()) {
        if (!activeEvidence) {
            return DetailPanel.create("Evidence Context", [
                { label: "Evidence Items", value: String(evidenceItems.length) },
                { label: "Selected Evidence", value: "Not selected" },
                { label: "Evidence Status", value: evidenceItems.length ? "In Review" : "Not started" },
                { label: "Workspace Status", value: "—" },
                { label: "Next Step", value: "Create or select evidence" }
            ]);
        }

        const statusLabel = this.statusLabels[this.getEvidenceStatus(activeEvidence)] || "Draft";

        return DetailPanel.create("Evidence Context", [
            { label: "Selected Evidence", value: activeEvidence.title || activeEvidence.id },
            { label: "Workspace Status", value: statusLabel },
            { label: "Case ID", value: activeEvidence.caseId || "Not linked" },
            { label: "Building ID", value: activeEvidence.buildingId || "Not linked" },
            { label: "Inspection ID", value: activeEvidence.inspectionId || "Not linked" },
            { label: "Source", value: activeEvidence.source || activeEvidence.sourceType || "Manual Evidence" },
            { label: "Question ID", value: activeEvidence.sourceQuestionId || "Not linked" },
            { label: "Question", value: activeEvidence.sourceQuestion || "Not linked" },
            { label: "Required Evidence", value: (activeEvidence.sourceRequiredEvidence || []).join(", ") || "None" },
            { label: "Scope ID", value: activeEvidence.scopeId || "Not linked" },
            { label: "Finding IDs", value: (activeEvidence.findingIds || []).join(", ") || "None" },
            { label: "Linked Findings", value: String(this.countFindingsLinkedToEvidence(activeEvidence.id)) }
        ]);
    }

    static scrollToRequestedTarget() {
        if (sessionStorage.getItem("workspaceScrollTarget") !== "evidence-list") {
            return;
        }

        sessionStorage.removeItem("workspaceScrollTarget");

        window.setTimeout(() => {
            document.getElementById("evidence-list")?.scrollIntoView({
                block: "start",
                behavior: "smooth"
            });
        }, 80);
    }

    static getEvidenceItems() {
        const currentCase = CaseManager.getCurrent();

        return WorkspaceController.safeValue(
            () => currentCase
                ? EvidenceManager.getByCase(currentCase.id)
                : EvidenceManager.getAll(),
            []
        );
    }

    static countFindingsLinkedToEvidence(evidenceId = null) {
        const targetEvidenceId = evidenceId || EvidenceManager.get()?.id;

        if (!targetEvidenceId) {
            return 0;
        }

        const currentCase = CaseManager.getCurrent();
        const findings = currentCase
            ? FindingManager.getByCase(currentCase.id)
            : FindingManager.getAll();

        return findings
            .filter(finding => (finding.evidenceIds || []).includes(targetEvidenceId))
            .length;
    }

    static getActiveEvidenceForFlow() {
        return EvidenceManager.get() || {};
    }

    static createFindingFromSelectedEvidence() {
        const evidence = EvidenceManager.get();
        const currentCase = CaseManager.getCurrent();

        if (!evidence) {
            Notification.warning("Select evidence first.");
            return;
        }

        if (!evidence.caseId) {
            Notification.warning("Selected evidence is not linked to a case.");
            return;
        }

        if (currentCase && currentCase.id !== evidence.caseId) {
            Notification.warning("Selected evidence belongs to another case.");
            return;
        }

        const isPattayaEvidence = String(evidence.sourceQuestionId || "").startsWith("TH-PATTAYA-");
        const isAvailabilityCheckOnly = evidence.sourcePolicy === "availability_check_only";

        const findingTitle = evidence.sourceQuestion
            ? `Finding Draft: ${evidence.sourceQuestion}`
            : `Finding Draft from ${evidence.title || evidence.id}`;

        const descriptionParts = [
            evidence.description || "Finding prepared from selected evidence.",
            "",
            "Finding status:",
            "Draft finding created from selected evidence.",
            "Expert review required before assessment, recommendation or decision use."
        ];

        if (isAvailabilityCheckOnly) {
            descriptionParts.push("");
            descriptionParts.push("Review boundary:");
            descriptionParts.push("Document availability only. No legal, financial, technical or governance document review has been performed.");
        }

        if (isPattayaEvidence) {
            descriptionParts.push("");
            descriptionParts.push("Thailand / Pattaya context:");
            descriptionParts.push("Field review context retained for downstream assessment.");
        }

        if (evidence.sourceQuestionId || evidence.sourceQuestion) {
            descriptionParts.push("");
            descriptionParts.push("Inspection scope trace:");
            descriptionParts.push(`Question ID: ${evidence.sourceQuestionId || "Not linked"}`);
            descriptionParts.push(`Question: ${evidence.sourceQuestion || "Not linked"}`);
            descriptionParts.push(`Required evidence: ${(evidence.sourceRequiredEvidence || []).join(", ") || "None"}`);
            descriptionParts.push(`Required evidence raw: ${evidence.sourceRequiredEvidenceRaw || "None"}`);
            descriptionParts.push(`Source policy: ${evidence.sourcePolicy || "None"}`);
            descriptionParts.push(`Scope ID: ${evidence.scopeId || "Not linked"}`);
        }

        const finding = FindingManager.create({
            caseId: evidence.caseId,
            buildingId: evidence.buildingId || currentCase?.buildingId || null,
            inspectionId: evidence.inspectionId || currentCase?.inspectionId || null,

            evidenceIds: [evidence.id],
            sourceEvidenceIds: [evidence.id],

            title: findingTitle,
            description: descriptionParts.join("\n"),
            category: evidence.sourceCategory || evidence.category || evidence.evidenceType || evidence.type || "General",
            buildingSystem: evidence.sourceModule || evidence.buildingSystem || "",
            location: evidence.location || "",

            severity: isAvailabilityCheckOnly ? "Unrated" : "Medium",
            priority: isAvailabilityCheckOnly ? "Medium" : "High",
            confidence: isAvailabilityCheckOnly ? 50 : 60,

            status: "Draft",
            reviewStatus: "Draft",
            expertReviewRequired: true,

            source: evidence.sourceType === "inspection-scope"
                ? "Inspection Scope Evidence"
                : "Evidence Review",

            sourceQuestionId: evidence.sourceQuestionId || "",
            sourceQuestion: evidence.sourceQuestion || "",
            sourceModule: evidence.sourceModule || "",
            sourceCategory: evidence.sourceCategory || "",
            sourcePolicy: evidence.sourcePolicy || "",
            sourceRequiredEvidenceRaw: evidence.sourceRequiredEvidenceRaw || "",

            profile: isPattayaEvidence ? "pattaya" : "",
            country: isPattayaEvidence ? "TH" : "",
            region: isPattayaEvidence ? "Pattaya / Chonburi" : "",

            createdBy: "System",
            updatedBy: "System"
        });

        FindingManager.set(finding);

        const activeCaseForSync = CaseManager.getCurrent();
        if (activeCaseForSync) {
            CaseManager.setCurrent({
                ...activeCaseForSync,
                findingIds: [...new Set([...(activeCaseForSync.findingIds || []), finding.id])],
                updatedAt: new Date().toISOString()
            });
            CaseManager.save();
        }

        const updatedEvidence = EvidenceManager.update({
            ...evidence,
            findingIds: [...new Set([...(evidence.findingIds || []), finding.id])],
            linkedFindingId: finding.id,
            hasFinding: true,
            updatedAt: new Date().toISOString()
        });

        EvidenceManager.set(updatedEvidence);

        Notification.success("Finding draft created. Expert review required.");
        window.location.hash = "findings";
    }

    static editSelectedEvidence() {

        const evidence = EvidenceManager.get();

        if (!evidence) {

            Notification.info("Select evidence before editing.");

            return;

        }

        FormDialog.open({

            title: "Edit Evidence",

            submitLabel: "Save Evidence",

            values: {

                title: evidence.title || "",

                description: evidence.description || "",

                evidenceType: evidence.evidenceType || evidence.type || "Photo",

                status: evidence.status || "Open"

            },

            fields: [

                {

                    id: "title",

                    label: "Evidence title"

                },

                {

                    id: "description",

                    label: "Description"

                },

                {

                    id: "evidenceType",

                    label: "Evidence type",

                    type: "select",

                    options: ["Photo", "Document", "Note", "Inspection Reference", "Other"]

                },

                {

                    id: "status",

                    label: "Status",

                    type: "select",

                    options: ["Open", "Captured", "Linked", "Reviewed", "Blocked"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                const updated = EvidenceManager.update({

                    ...evidence,

                    title: values.title,

                    description: values.description || "",

                    evidenceType: values.evidenceType || "Photo",

                    status: values.status || "Open",

                    updatedAt: new Date().toISOString()

                });

                EvidenceManager.set(updated);

                dialog.remove();

                Notification.success("Evidence updated.");

                this.refresh();

            }

        });

    }


    static refresh() {
        const container = document.getElementById("workspace-page");

        if (!container) return;

        container.innerHTML = "";
        container.appendChild(this.render());
    }

    static createSampleEvidence() {

        const currentCase = CaseManager.getCurrent();

        const currentBuilding = currentCase?.buildingId
            ? BuildingManager.load(currentCase.buildingId)
            : BuildingManager.get();

        const currentInspection = currentCase?.inspectionId
            ? InspectionManager.load(currentCase.inspectionId)
            : InspectionManager.get();

        if (!currentCase) {

            Notification.info("Open a case before creating evidence.");

            return;

        }

        FormDialog.open({

            title: "New Evidence",

            submitLabel: "Create Evidence",

            values: {

                title: "",

                description: "",

                evidenceType: "Photo",

                status: "Open"

            },

            fields: [

                {

                    id: "title",

                    label: "Evidence title"

                },

                {

                    id: "description",

                    label: "Description"

                },

                {

                    id: "evidenceType",

                    label: "Evidence type",

                    type: "select",

                    options: ["Photo", "Document", "Note", "Inspection Reference", "Other"]

                },

                {

                    id: "status",

                    label: "Status",

                    type: "select",

                    options: ["Open", "Captured", "Linked", "Reviewed", "Blocked"]

                }

            ],

            onSubmit: (values, dialog) => {

                if (!values.title) return;

                const evidence = EvidenceManager.create({

                    caseId: currentCase.id,

                    buildingId: currentCase.buildingId || currentBuilding?.id || null,

                    inspectionId: currentCase.inspectionId || currentInspection?.id || null,

                    title: values.title,

                    description: values.description || "",

                    evidenceType: values.evidenceType || "Photo",

                    status: values.status || "Open"

                });

                EvidenceManager.set(evidence);

                dialog.remove();

                Notification.success("Evidence created.");

                this.refresh();

            }

        });

    }


    static showPendingFeature(feature = "This feature") {
        Notification.info(`${feature} is reserved for a later workspace release.`);
    }

    static getEvidenceIntelligence(evidence = {}) {
        evidence = evidence || {};
        const hasIdentity = Boolean(evidence.title || evidence.name);
        const hasType = Boolean(evidence.type || evidence.category);
        const hasSource = Boolean(
            evidence.source ||
            evidence.inspectionId ||
            evidence.buildingId ||
            evidence.caseId
        );
        const hasContent = Boolean(
            evidence.description ||
            evidence.note ||
            evidence.fileName ||
            evidence.imageUrl ||
            evidence.documentUrl ||
            evidence.photoUrl
        );
        const hasFindingLink = Boolean(
            evidence.findingId ||
            evidence.linkedFindingId ||
            evidence.finding ||
            evidence.hasFinding
        );
        const isReviewed = Boolean(evidence.reviewed || evidence.status === "reviewed");

        const checks = [
            hasIdentity,
            hasType,
            hasSource,
            hasContent,
            hasFindingLink,
            isReviewed
        ];

        const readiness = IntelligenceEngine.getReadinessFromChecks(checks);
        const completed = readiness.completed;
        const total = readiness.total;
        const readinessPercent = readiness.percent;

        const confidenceScore = IntelligenceEngine.getConfidenceScore({
            readinessPercent,
            primarySignals: hasContent ? 1 : 0,
            downstreamSignals: hasFindingLink ? 1 : 0,
            outputSignals: isReviewed ? 1 : 0,
            weights: {
                readiness: 0.7,
                primary: 10,
                downstream: 10,
                output: 10
            }
        });

        let qualitySignal = {
            label: "Low evidence quality",
            description: "Evidence is still incomplete. Add content, source and classification before deriving a finding.",
            tone: "draft"
        };

        if (hasIdentity && hasType && hasSource && hasContent && hasFindingLink) {
            qualitySignal = {
                label: "Strong evidence quality",
                description: "Evidence is well structured and connected to the downstream finding workflow.",
                tone: "ready"
            };
        } else if (hasIdentity && hasType && hasContent) {
            qualitySignal = {
                label: "Developing evidence quality",
                description: "Evidence has useful substance, but source or finding linkage may still be missing.",
                tone: "active"
            };
        }

        const nextAction = hasFindingLink
            ? {
                label: "Review linked finding",
                description: "Evidence is connected to a finding. Review whether the finding reflects the evidence accurately.",
                tone: "ready"
            }
            : hasContent
                ? {
                    label: "Create or link finding",
                    description: "Evidence content is available. Connect it to a technical finding.",
                    tone: "active"
                }
                : {
                    label: "Capture evidence content",
                    description: "Add a note, document, photo or description before moving toward finding creation.",
                    tone: "draft"
                };

        return {
            completed,
            total,
            readinessPercent,
            confidenceScore,
            qualitySignal,
            nextAction,
            label: readinessPercent >= 100
                ? "Evidence intelligence complete"
                : readinessPercent >= 50
                    ? "Evidence intelligence developing"
                    : "Evidence intelligence early"
        };
    }

    static renderEvidenceIntelligenceSnapshot(evidence = {}) {
        evidence = evidence || {};
        const intelligence = this.getEvidenceIntelligence(evidence);

        return `
            <section class="evidence-intelligence intelligence-snapshot" aria-label="Evidence intelligence snapshot">
                <div class="evidence-intelligence__header intelligence-snapshot__header">
                    <div>
                        <span class="evidence-intelligence__eyebrow intelligence-snapshot__eyebrow">Evidence Intelligence</span>
                        <strong>${intelligence.label}</strong>
                        <p>${intelligence.completed}/${intelligence.total} evidence intelligence checks completed</p>
                    </div>
                    <span class="evidence-intelligence__score intelligence-snapshot__score">${intelligence.confidenceScore}%</span>
                </div>

                <div class="evidence-intelligence__grid intelligence-snapshot__grid">
                    <article class="evidence-intelligence__card intelligence-snapshot__card">
                        <span>Finding Readiness</span>
                        <strong>${intelligence.readinessPercent}%</strong>
                        <p>Readiness based on identity, classification, source, content, finding link and review state.</p>
                    </article>

                    <article class="evidence-intelligence__card intelligence-snapshot__card evidence-intelligence__card--${intelligence.qualitySignal.tone} intelligence-snapshot__card--${intelligence.qualitySignal.tone}">
                        <span>Evidence Quality Signal</span>
                        <strong>${intelligence.qualitySignal.label}</strong>
                        <p>${intelligence.qualitySignal.description}</p>
                    </article>

                    <article class="evidence-intelligence__card intelligence-snapshot__card evidence-intelligence__card--${intelligence.nextAction.tone} intelligence-snapshot__card--${intelligence.nextAction.tone}">
                        <span>Next Evidence Action</span>
                        <strong>${intelligence.nextAction.label}</strong>
                        <p>${intelligence.nextAction.description}</p>
                    </article>
                </div>
            </section>
        `;
    }

    static createEvidenceIntelligenceSnapshot(evidence = EvidenceManager.get()) {
        if (!evidence || !evidence.id) {
            return document.createElement("section");
        }

        const container = document.createElement("section");
        container.className = "workflow-card";
        container.innerHTML = this.renderEvidenceIntelligenceSnapshot(evidence);
        return container;
    }

}
