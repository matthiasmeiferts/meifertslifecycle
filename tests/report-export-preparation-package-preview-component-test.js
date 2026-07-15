import assert from "node:assert/strict";
import ReportExportPreparationPackagePreview from "../portal/ui/components/ReportExportPreparationPackagePreview.js";

function createMockElement(tagName) {
    return {
        tagName,
        className: "",
        textContent: "",
        dataset: {},
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

const requiredPackage = {
    packageId: "report_export_preparation_package-REP-001",
    packageType: "report_export_preparation_package",
    sourceExportAuthorizationGateId: "export_authorization_gate-REP-001",
    status: "report_export_preparation_required",
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        exportPackagePrepared: true,
        exportFileCreated: false,
        reportExported: false
    }
};

const requiredSnapshot = JSON.stringify(requiredPackage);
const requiredPreview = ReportExportPreparationPackagePreview.create(requiredPackage);

assert.equal(
    requiredPreview.className,
    "report-export-preparation-package-preview is-required"
);

assert.equal(
    requiredPreview.dataset.reportExportPreparationPackageCard,
    ""
);

const requiredHeader = findByClassName(
    requiredPreview,
    "report-export-preparation-package-preview__header"
);

assert.ok(requiredHeader);
assert.equal(requiredHeader.children[1].className, "status-badge default");
assert.equal(
    requiredHeader.children[1].textContent,
    "report_export_preparation_required"
);

const metadata = findByClassName(
    requiredPreview,
    "report-export-preparation-package-preview__meta"
);

assert.ok(metadata);
assert.equal(metadata.children.length, 4);
assert.equal(metadata.children[0].children[0].textContent, "Package ID");
assert.equal(
    metadata.children[0].children[1].textContent,
    "report_export_preparation_package-REP-001"
);
assert.equal(
    metadata.children[3].children[1].textContent,
    "Yes"
);

const safety = findByClassName(
    requiredPreview,
    "report-export-preparation-package-preview__safety"
);

assert.ok(safety);
assert.equal(safety.children[0].textContent, "Safety boundary");

const locks = findByClassName(
    requiredPreview,
    "report-export-preparation-package-preview__locks"
);

assert.ok(locks);
assert.equal(locks.children.length, 5);
assert.equal(locks.children[0].textContent, "Can export: false");
assert.equal(locks.children[1].textContent, "Can create client document: false");
assert.equal(locks.children[2].textContent, "Can finalize workflow: false");
assert.equal(locks.children[3].textContent, "Export file created: false");
assert.equal(locks.children[4].textContent, "Report exported: false");

assert.equal(findAllByTagName(requiredPreview, "button").length, 0);
assert.equal(JSON.stringify(requiredPackage), requiredSnapshot);

const blockedPackage = {
    packageId: null,
    packageType: "report_export_preparation_package",
    sourceExportAuthorizationGateId: null,
    status: "blocked_pending_export_authorization_gate",
    permissions: {
        canExport: false,
        canCreateClientDocument: false,
        canFinalizeWorkflow: false
    },
    safetyBoundary: {
        exportPackagePrepared: false,
        exportFileCreated: false,
        reportExported: false
    }
};

const blockedPreview = ReportExportPreparationPackagePreview.create(blockedPackage);

assert.equal(
    blockedPreview.className,
    "report-export-preparation-package-preview is-blocked"
);

const blockedMetadata = findByClassName(
    blockedPreview,
    "report-export-preparation-package-preview__meta"
);

assert.ok(blockedMetadata);
assert.equal(blockedMetadata.children[0].children[1].textContent, "—");
assert.equal(
    blockedMetadata.children[2].children[1].textContent,
    "not available"
);
assert.equal(blockedMetadata.children[3].children[1].textContent, "No");

assert.equal(findAllByTagName(blockedPreview, "button").length, 0);

console.log("Report export preparation package preview component test passed");
console.log("Required package state:", requiredPreview.className);
console.log("Blocked package state:", blockedPreview.className);
console.log("Safety lock count:", locks.children.length);
