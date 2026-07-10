#!/usr/bin/env bash
set -euo pipefail

echo "Running Foundation 2.8 test suite..."
echo

node --check portal/core/DraftWorkspaceManager.js
node --check portal/ui/pages/QuestionCatalogPage.js

node --check tests/export-preparation-gate-model-test.js
node --check tests/export-preparation-gate-from-internal-review-test.js
node --check tests/export-preparation-gate-browser-preview-test.js
node --check tests/export-preparation-gate-regression-safety-test.js

echo
echo "Syntax checks passed."
echo

node tests/export-preparation-gate-regression-safety-test.js
node tests/export-preparation-gate-browser-preview-test.js
node tests/export-preparation-gate-from-internal-review-test.js
node tests/export-preparation-gate-model-test.js
node tests/internal-finalization-review-release-lock-test.js
node tests/internal-finalization-review-regression-safety-test.js
node tests/finalization-gate-release-lock-test.js
node tests/draft-save-browser-regression-safety-test.js

echo
echo "Foundation 2.8 test suite passed."
