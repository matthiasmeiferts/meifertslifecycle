import assert from "node:assert/strict";
import DraftWorkspaceManager from "../portal/core/DraftWorkspaceManager.js";
import ExpertReviewPreview from "../portal/ui/components/ExpertReviewPreview.js";
import FinalizationGatePreview from "../portal/ui/components/FinalizationGatePreview.js";
import InternalFinalizationReviewPreview from "../portal/ui/components/InternalFinalizationReviewPreview.js";
import ExportWorkflowPreviewController from "../portal/ui/controllers/ExportWorkflowPreviewController.js";

function createClassList(element) {
    return {
        add(...names) {
            const current = new Set(element.className.split(" ").filter(Boolean));
            names.forEach(name => current.add(name));
            element.className = [...current].join(" ");
        },
        remove(...names) {
            const current = new Set(element.className.split(" ").filter(Boolean));
            names.forEach(name => current.delete(name));
            element.className = [...current].join(" ");
        },
        contains(name) {
            return element.className.split(" ").includes(name);
        }
    };
}

function createMockElement(tagName) {
    const element = {
        tagName,
        className: "",
        textContent: "",
        type: "",
        disabled: false,
        title: "",
        dataset: {},
        children: [],
        listeners: {},
        scrollCalls: [],
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        replaceChildren(...children) {
            this.children = children;
        },
        addEventListener(eventName, handler) {
            this.listeners[eventName] = handler;
        },
        click() {
            if (!this.disabled && typeof this.listeners.click === "function") {
                this.listeners.click({
                    type: "click",
                    target: this
                });
            }
        },
        scrollIntoView(options = {}) {
            this.scrollCalls.push(options);
        },
        querySelector(selector) {
            return findBySelector(this, selector);
        },
        querySelectorAll(selector) {
            return findAllBySelector(this, selector);
        }
    };

    element.classList = createClassList(element);

    return element;
}

function datasetKeyFromSelector(selector) {
    const match = selector.match(/^\[data-([a-z0-9-]+)\]$/i);

    if (!match) {
        return null;
    }

    return match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function matchesSelector(element, selector) {
    if (selector.startsWith(".")) {
        return element.className.split(" ").includes(selector.slice(1));
    }

    if (selector.startsWith("[data-")) {
        const key = datasetKeyFromSelector(selector);
        return key !== null && Object.hasOwn(element.dataset, key);
    }

    return element.tagName === selector;
}

function findBySelector(element, selector) {
    if (matchesSelector(element, selector)) {
        return element;
    }

    for (const child of element.children) {
        const match = findBySelector(child, selector);

        if (match) {
            return match;
        }
    }

    return null;
}

function findAllBySelector(element, selector, matches = []) {
    if (matchesSelector(element, selector)) {
        matches.push(element);
    }

    element.children.forEach(child => {
        findAllBySelector(child, selector, matches);
    });

    return matches;
}

function createSlot(dataKey) {
    const slot = createMockElement("div");
    slot.dataset[dataKey] = "";
    return slot;
}

function getButtons(slot) {
    return slot.querySelectorAll("button");
}

global.document = {
    createElement: createMockElement
};

global.window = {
    requestAnimationFrame(callback) {
        callback();
    }
};

const workflowNode = createMockElement("div");

const expertReviewNode = createSlot("expertReviewPreview");
const finalizationGateNode = createSlot("finalizationGatePreview");
const internalReviewNode = createSlot("internalFinalizationReviewPreview");
const exportFlowNode = createSlot("exportFlowPreview");
const exportPreparationGateNode = createSlot("exportPreparationGatePreview");
const exportPreparationReviewNode = createSlot("exportPreparationReviewPreview");
const exportAuthorizationGateNode = createSlot("exportAuthorizationGatePreview");
const reportExportPreparationPackageNode = createSlot("reportExportPreparationPackagePreview");
const reportExportAssemblyNode = createSlot("reportExportAssemblyPreview");

[
    expertReviewNode,
    finalizationGateNode,
    internalReviewNode,
    exportFlowNode
].forEach(node => workflowNode.appendChild(node));

[
    exportPreparationGateNode,
    exportPreparationReviewNode,
    exportAuthorizationGateNode,
    reportExportPreparationPackageNode,
    reportExportAssemblyNode
].forEach(node => exportFlowNode.appendChild(node));

const reportDraftSource = {
    draftMode: "report_draft_preview_sandbox_read_only",
    reportPrepared: true,
    reportSection: "conditional_acquisition_note",
    question: {
        questionId: "DE-TDD-06-036"
    },
    decision: {
        route: "conditional_decision"
    },
    report: {
        title: "Browser flow report draft",
        executiveSummary: "Controlled browser flow preview.",
        previewOnly: true,
        persisted: false,
        exported: false
    }
};

const draftRecord = DraftWorkspaceManager.createDraftRecord(
    reportDraftSource,
    {
        createdAt: "2026-07-16T12:00:00.000Z"
    }
);

let currentReview = DraftWorkspaceManager.createExpertReview(
    draftRecord,
    {
        reviewer: "Matthias Meiferts",
        createdAt: "2026-07-16T12:01:00.000Z"
    }
);

let currentGate = null;
let currentInternalReview = null;

const exportWorkflowController = new ExportWorkflowPreviewController({
    exportPreparationGateNode,
    exportPreparationReviewNode,
    exportAuthorizationGateNode,
    reportExportPreparationPackageNode,
    reportExportAssemblyNode,
    reviewer: "Matthias Meiferts",
    now: (() => {
        let index = 0;

        return () => {
            const minute = String(10 + index++).padStart(2, "0");
            return `2026-07-16T12:${minute}:00.000Z`;
        };
    })()
});

const renderInternalReview = () => {
    internalReviewNode.replaceChildren(
        InternalFinalizationReviewPreview.create(
            currentInternalReview,
            {
                onAddNote: () => {
                    currentInternalReview =
                        DraftWorkspaceManager.addInternalFinalizationReviewNote(
                            currentInternalReview,
                            {
                                text: "Internal browser flow note.",
                                author: "Matthias Meiferts",
                                category: "internal-finalization"
                            },
                            {
                                createdAt: "2026-07-16T12:06:00.000Z"
                            }
                        );

                    renderInternalReview();
                },
                onApprove: () => {
                    currentInternalReview =
                        DraftWorkspaceManager.approveInternalFinalizationReview(
                            currentInternalReview,
                            {
                                comment: "Internal browser flow approved.",
                                decidedBy: "Matthias Meiferts"
                            },
                            {
                                updatedAt: "2026-07-16T12:07:00.000Z"
                            }
                        );

                    renderInternalReview();

                    exportWorkflowController.startFromInternalReview(
                        currentInternalReview
                    );
                },
                onReject: () => {
                    currentInternalReview =
                        DraftWorkspaceManager.rejectInternalFinalizationReview(
                            currentInternalReview,
                            {
                                comment: "Internal browser flow rejected.",
                                decidedBy: "Matthias Meiferts"
                            },
                            {
                                updatedAt: "2026-07-16T12:08:00.000Z"
                            }
                        );

                    renderInternalReview();
                }
            }
        )
    );
};

const renderFinalizationGate = () => {
    currentGate = DraftWorkspaceManager.createFinalizationGate(
        currentReview,
        {
            createdAt: "2026-07-16T12:04:00.000Z"
        }
    );

    finalizationGateNode.replaceChildren(
        FinalizationGatePreview.create(currentGate)
    );

    const shouldCreateInternalReview =
        !currentInternalReview
        || currentInternalReview.sourceGateId !== currentGate.gateId
        || currentInternalReview.readiness.finalizationGateReady
            !== currentGate.readiness.expertReviewApproved;

    if (shouldCreateInternalReview) {
        currentInternalReview =
            DraftWorkspaceManager.createInternalFinalizationReview(
                currentGate,
                {
                    reviewer: "Matthias Meiferts",
                    createdAt: "2026-07-16T12:05:00.000Z"
                }
            );
    }

    renderInternalReview();
};

const renderExpertReview = () => {
    expertReviewNode.replaceChildren(
        ExpertReviewPreview.create(
            currentReview,
            {
                onAddNote: () => {
                    currentReview = DraftWorkspaceManager.addExpertReviewNote(
                        currentReview,
                        {
                            text: "Expert browser flow note.",
                            author: "Matthias Meiferts",
                            category: "expert-review"
                        },
                        {
                            createdAt: "2026-07-16T12:02:00.000Z"
                        }
                    );

                    renderExpertReview();
                },
                onApprove: () => {
                    currentReview = DraftWorkspaceManager.approveExpertReview(
                        currentReview,
                        {
                            comment: "Expert browser flow approved.",
                            decidedBy: "Matthias Meiferts"
                        },
                        {
                            updatedAt: "2026-07-16T12:03:00.000Z"
                        }
                    );

                    renderExpertReview();
                },
                onReject: () => {
                    currentReview = DraftWorkspaceManager.rejectExpertReview(
                        currentReview,
                        {
                            comment: "Expert browser flow rejected.",
                            decidedBy: "Matthias Meiferts"
                        },
                        {
                            updatedAt: "2026-07-16T12:03:30.000Z"
                        }
                    );

                    renderExpertReview();
                }
            }
        )
    );

    renderFinalizationGate();
};

renderExpertReview();

assert.equal(
    expertReviewNode.children[0].className,
    "expert-review-preview is-review-required is-note-required"
);

assert.equal(
    finalizationGateNode.children[0].className,
    "finalization-gate-preview is-blocked"
);

assert.equal(
    internalReviewNode.children[0].className,
    "internal-finalization-review-preview is-blocked"
);

let buttons = getButtons(expertReviewNode);

assert.equal(buttons.length, 3);
assert.equal(buttons[0].disabled, false);
assert.equal(buttons[1].disabled, true);
assert.equal(buttons[2].disabled, true);

buttons[0].click();

buttons = getButtons(expertReviewNode);

assert.equal(currentReview.notes.length, 1);
assert.equal(buttons[0].disabled, true);
assert.equal(buttons[1].disabled, false);
assert.equal(buttons[2].disabled, false);

buttons[1].click();

assert.equal(currentReview.status, "approved");
assert.equal(
    finalizationGateNode.children[0].className,
    "finalization-gate-preview is-ready"
);
assert.equal(
    internalReviewNode.children[0].className,
    "internal-finalization-review-preview is-required"
);

buttons = getButtons(internalReviewNode);

assert.equal(buttons.length, 3);
assert.equal(buttons[0].disabled, false);
assert.equal(buttons[1].disabled, true);
assert.equal(buttons[2].disabled, true);

buttons[0].click();

buttons = getButtons(internalReviewNode);

assert.equal(currentInternalReview.notes.length, 1);
assert.equal(buttons[0].disabled, true);
assert.equal(buttons[1].disabled, false);
assert.equal(buttons[2].disabled, false);

buttons[1].click();

assert.equal(currentInternalReview.status, "internally_approved");

assert.equal(exportPreparationGateNode.children.length, 1);
assert.equal(exportPreparationReviewNode.children.length, 1);
assert.equal(exportAuthorizationGateNode.children.length, 1);
assert.equal(reportExportPreparationPackageNode.children.length, 1);
assert.equal(reportExportAssemblyNode.children.length, 1);

const exportStateBeforeNote = exportWorkflowController.getState();

assert.equal(
    exportStateBeforeNote.exportPreparationReview.status,
    "review_required"
);
assert.equal(
    exportStateBeforeNote.exportAuthorizationGate.status,
    "blocked_pending_export_preparation_review"
);

buttons = getButtons(exportPreparationReviewNode);

assert.equal(buttons.length, 3);
assert.equal(buttons[0].disabled, false);
assert.equal(buttons[1].disabled, true);
assert.equal(buttons[2].disabled, true);

buttons[0].click();

buttons = getButtons(exportPreparationReviewNode);

assert.equal(
    exportWorkflowController.getState().exportPreparationReview.notes.length,
    1
);
assert.equal(buttons[0].disabled, true);
assert.equal(buttons[1].disabled, false);
assert.equal(buttons[2].disabled, false);

buttons[1].click();

const finalState = exportWorkflowController.getState();

assert.equal(
    finalState.exportPreparationReview.status,
    "approved"
);
assert.equal(
    finalState.exportAuthorizationGate.status,
    "export_authorization_required"
);

[
    finalState.exportPreparationGate,
    finalState.exportPreparationReview,
    finalState.exportAuthorizationGate,
    finalState.reportExportPreparationPackage,
    finalState.reportExportAssemblyPreview
].forEach(item => {
    assert.equal(item.permissions.canExport, false);
    assert.equal(item.permissions.canCreateClientDocument, false);
    assert.equal(item.permissions.canFinalizeWorkflow, false);
});

assert.ok(
    reportExportAssemblyNode.children[0].className.includes(
        "report-export-assembly-preview"
    )
);

console.log("Expert review export workflow browser flow test passed");
console.log("Expert review status:", currentReview.status);
console.log("Finalization gate status:", currentGate.status);
console.log("Internal review status:", currentInternalReview.status);
console.log(
    "Export preparation review status:",
    finalState.exportPreparationReview.status
);
console.log(
    "Export authorization status:",
    finalState.exportAuthorizationGate.status
);
console.log("All export permissions remain false");
