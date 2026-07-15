import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ReportExportPreparationPackagePreview from "../portal/ui/components/ReportExportPreparationPackagePreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ReportExportPreparationPackagePreview);

assert.ok(
    pageSource.includes(
        'import ReportExportPreparationPackagePreview from "../components/ReportExportPreparationPackagePreview.js";'
    )
);

const createCallCount = (
    pageSource.match(/ReportExportPreparationPackagePreview\.create\(/g) || []
).length;

assert.equal(createCallCount, 1);

assert.equal(
    pageSource.includes("renderReportExportPreparationPackagePanel"),
    false
);

assert.ok(
    pageSource.includes(
        "preparationPackageContainer.replaceChildren("
    )
);

assert.equal(
    pageSource.includes(
        "ReportExportPreparationPackagePreview.create(currentReportExportPreparationPackage).addEventListener"
    ),
    false
);

console.log(
    "Report export preparation package QuestionCatalogPage integration test passed"
);
console.log("Preparation package component import: present");
console.log("Preparation package component render count:", createCallCount);
console.log("Legacy preparation package renderer present: false");
console.log("Preparation package actions added: false");
