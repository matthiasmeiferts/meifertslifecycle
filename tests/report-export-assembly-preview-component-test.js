import assert from "node:assert/strict";
import ReportExportAssemblyPreview from "../portal/ui/components/ReportExportAssemblyPreview.js";

function createMockElement(tagName) {
    return {
        tagName,
        className: "",
        textContent: "",
        children: [],
        appendChild(child) {
            this.children.push(child);
            return child;
        }
    };
}

function findByClassName(element, className) {
    if (element.className.split(" ").includes(className)) {
        return element;
    }

    for (const child of element.children) {
        const match = findByClassName(child, className);

        if (match) {
            return match;
        }
    }

    return null;
}

function findAllByTagName(element, tagName, matches = []) {
    if (element.tagName === tagName) {
        matches.push(element);
    }

    element.children.forEach(child => {
        findAllByTagName(child, tagName, matches);
    });

    return matches;
}

global.document = {
    createElement: createMockElement
};

const preparedModel = {
    assemblyId: "report_export_assembly_preview-REP-001",
    assemblyType: "report_export_assembly_preview",
    sourcePackageId: "report_export_preparation_package-REP-001",
    sourceDraftId: "REP-001",
    status: "report_export_assembly_preview_required",
    assemblyPrepared: true,
    assemblySectionCount: 6,
    assemblySections: [
        {
            sectionId: "executive_summary",
            label: "Executive summary",
            sourceDraftId: "REP-001",
            status: "prepared_for_assembly_preview",
            includedInPreview: true
        },
        {
            sectionId: "technical_narrative",
            label: "Technical narrative",
            sourceDraftId: "REP-001",
            status: "prepared_for_assembly_preview",
            includedInPreview: true
        },
        {
            sectionId: "evidence_references",
            label: "Evidence references",
            sourceDraftId: "REP-001",
            status: "prepared_for_assembly_preview",
            includedInPreview: true
        },
        {
            sectionId: "assessment_summary",
            label: "Assessment summary",
            sourceDraftId: "REP-001",
            status: "prepared_for_assembly_preview",
            includedInPreview: true
        },
        {
            sectionId: "recommendation_summary",
            label: "Recommendation summary",
            sourceDraftId: "REP-001",
            status: "prepared_for_assembly_preview",
            includedInPreview: true
        },
        {
            sectionId: "decision_note",
            label: "Decision note",
            sourceDraftId: "REP-001",
            status: "prepared_for_assembly_preview",
            includedInPreview: true
        }
    ],
    governance: {
        requiresExportReadinessReview: true,
        allowsDirectExport: false
    },
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        assemblyPrepared: true,
        exportFileCreated: false,
        reportExported: false,
        clientDocumentCreated: false,
        workflowFinalized: false
    }
};

const preparedSnapshot = JSON.stringify(preparedModel);
const preparedPreview = ReportExportAssemblyPreview.create(preparedModel);

assert.equal(
    preparedPreview.className,
    "hero-card report-export-assembly-preview report-export-assembly-preview--prepared"
);

const preparedHeader = findByClassName(
    preparedPreview,
    "report-export-assembly-preview__header"
);

assert.ok(preparedHeader);
assert.equal(preparedHeader.children[1].className, "status-badge warning");
assert.equal(preparedHeader.children[1].textContent, "Assembly preview prepared");

const preparedSections = findByClassName(
    preparedPreview,
    "report-export-assembly-preview__sections"
);

assert.ok(preparedSections);
assert.equal(preparedSections.children.length, 6);
assert.equal(preparedSections.children[0].tagName, "article");
assert.equal(preparedSections.children[0].children[0].textContent, "Executive summary");
assert.equal(
    preparedSections.children[0].children[1].textContent,
    "prepared_for_assembly_preview"
);
assert.equal(
    preparedSections.children[0].children[2].textContent,
    "Source draft: REP-001"
);

const preparedBoundary = findByClassName(
    preparedPreview,
    "report-export-assembly-preview__boundary"
);

assert.ok(preparedBoundary);
assert.equal(
    preparedBoundary.children[1].textContent,
    "Export, client-document creation and workflow finalization are disabled."
);

assert.equal(findAllByTagName(preparedPreview, "button").length, 0);
assert.equal(JSON.stringify(preparedModel), preparedSnapshot);

const blockedModel = {
    assemblyId: "report_export_assembly_preview-unknown_draft",
    assemblyType: "report_export_assembly_preview",
    sourcePackageId: null,
    sourceDraftId: "unknown_draft",
    status: "blocked_pending_report_export_preparation_package",
    assemblyPrepared: false,
    assemblySectionCount: 0,
    assemblySections: [],
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    }
};

const blockedPreview = ReportExportAssemblyPreview.create(blockedModel);

assert.equal(
    blockedPreview.className,
    "hero-card report-export-assembly-preview report-export-assembly-preview--blocked"
);

const blockedHeader = findByClassName(
    blockedPreview,
    "report-export-assembly-preview__header"
);

assert.ok(blockedHeader);
assert.equal(blockedHeader.children[1].className, "status-badge critical");
assert.equal(blockedHeader.children[1].textContent, "Assembly preview blocked");

assert.equal(
    findByClassName(blockedPreview, "report-export-assembly-preview__sections"),
    null
);

const blockedEmptyState = findByClassName(
    blockedPreview,
    "report-export-assembly-preview__empty"
);

assert.ok(blockedEmptyState);
assert.equal(
    blockedEmptyState.textContent,
    "No assembly sections are available."
);

assert.equal(findAllByTagName(blockedPreview, "button").length, 0);

console.log("Report export assembly preview component test passed");
console.log("Prepared section count:", preparedSections.children.length);
console.log("Blocked empty state:", blockedEmptyState.textContent);
