#!/usr/bin/env bash
set -euo pipefail

echo "Running Foundation 1.1 release validation suite..."
echo

syntax_files=(
  portal/core/EvidenceToFindingDraftBuilder.js
  portal/core/EvidenceManager.js
  portal/core/FindingManager.js
  portal/core/AssessmentManager.js
  portal/core/RecommendationManager.js
  portal/core/DecisionManager.js
  portal/core/ReportManager.js
  portal/core/ReviewQueueManager.js
  portal/core/WorkflowValidationGateManager.js
  portal/ui/pages/EvidencePage.js
  portal/ui/pages/DashboardPage.js
  portal/ui/pages/DecisionPage.js
  portal/ui/pages/ReportPage.js
)

traceability_tests=(
  tests/evidence-upload-metadata-model-test.js
  tests/evidence-to-finding-draft-builder-test.js
  tests/evidence-to-finding-bridge-metadata-test.js
  tests/evidence-to-finding-multiple-evidence-test.js
  tests/evidence-to-finding-multiple-evidence-persistence-test.js
  tests/finding-to-assessment-metadata-trace-test.js
  tests/assessment-to-recommendation-metadata-trace-test.js
  tests/recommendation-to-decision-metadata-trace-test.js
  tests/decision-to-report-metadata-trace-test.js
)

governance_tests=(
  tests/review-queue-manager-test.js
  tests/workflow-validation-gate-manager-test.js
  tests/expert-review-browser-smoke-test.js
  tests/expert-review-browser-regression-safety-test.js
  tests/expert-review-export-workflow-browser-flow-test.js
  tests/expert-review-release-lock-test.js
  tests/immutability-audit-test.js
)

echo "Checking required files..."

for file in \
  "${syntax_files[@]}" \
  "${traceability_tests[@]}" \
  "${governance_tests[@]}"
do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

echo "Required files found."
echo

echo "Running syntax checks..."

for file in "${syntax_files[@]}"; do
  node --check "$file"
done

for file in "${traceability_tests[@]}" "${governance_tests[@]}"; do
  node --check "$file"
done

echo
echo "Syntax checks passed."
echo

echo "Running evidence-to-report traceability tests..."

for test_file in "${traceability_tests[@]}"; do
  node "$test_file"
done

echo
echo "Evidence-to-report traceability tests passed."
echo

echo "Running governance, browser and release safety tests..."

for test_file in "${governance_tests[@]}"; do
  node "$test_file"
done

echo
echo "Governance, browser and release safety tests passed."
echo
echo "Foundation 1.1 release validation suite passed."
