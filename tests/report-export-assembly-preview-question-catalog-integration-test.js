import assert from "node:assert/strict";
import fs from "node:fs";
import QuestionCatalogPage from "../portal/ui/pages/QuestionCatalogPage.js";
import ReportExportAssemblyPreview from "../portal/ui/components/ReportExportAssemblyPreview.js";

const pagePath = new URL(
    "../portal/ui/pages/QuestionCatalogPage.js",
    import.meta.url
);

const pageSource = fs.readFileSync(pagePath, "utf8");

assert.ok(QuestionCatalogPage);
assert.ok(ReportExportAssemblyPreview);

assert.ok(
    pageSource.includes(
        'import ReportExportAssemblyPreview from "../components/ReportExportAssemblyPreview.js";'
    )
);

assert.ok(
    pageSource.includes(
        "DraftWorkspaceManager.createReportExportAssemblyPreview("
    )
);

assert.ok(
    pageSource.includes(
        'document.querySelector("[data-report-export-assembly-preview]")'
    )
);

assert.ok(
    pageSource.includes(
        '"<div data-report-export-assembly-preview></div>"'
    )
);

assert.ok(
    pageSource.includes(
        "ReportExportAssemblyPreview.create(assemblyPreviewModel)"
    )
);

assert.ok(
    pageSource.includes(
        "assemblyPreviewContainer.replaceChildren("
    )
);

assert.equal(
    pageSource.includes(
        'data-report-export-assembly-preview-action'
    ),
    false
);

assert.equal(
    pageSource.includes(
        'ReportExportAssemblyPreview.create(assemblyPreviewModel).addEventListener'
    ),
    false
);

console.log(
    "Report export assembly preview QuestionCatalogPage integration test passed"
);
console.log(
    "Assembly preview component import: present"
);
console.log(
    "Assembly preview model transition: present"
);
console.log(
    "Assembly preview isolated container: present"
);
console.log(
    "Assembly preview actions added: false"
);
