#!/usr/bin/env bash
set -euo pipefail

echo "Running Foundation 1.2 release validation suite..."
echo

base_runner="scripts/run-foundation-1-1-release-tests.sh"

syntax_files=(
  portal/core/ReviewResolutionManager.js
  portal/core/ReviewQueueManager.js
  portal/core/WorkflowValidationGateManager.js
  portal/ui/components/ReviewAuditTrailFields.js
  portal/ui/pages/DashboardPage.js
  portal/ui/pages/EvidencePage.js
  portal/ui/pages/FindingPage.js
  portal/ui/pages/AssessmentPage.js
  portal/ui/pages/RecommendationPage.js
  portal/ui/pages/DecisionPage.js
  portal/ui/pages/ReportPage.js
)

review_tests=(
  tests/review-resolution-manager-test.js
  tests/review-queue-manager-test.js
  tests/workflow-validation-gate-manager-test.js
  tests/expert-review-browser-smoke-test.js
  tests/expert-review-browser-regression-safety-test.js
  tests/expert-review-export-workflow-browser-flow-test.js
  tests/expert-review-release-lock-test.js
)

echo "Checking required files..."

if [[ ! -x "$base_runner" ]]; then
  echo "Missing or non-executable Foundation 1.1 runner: $base_runner" >&2
  exit 1
fi

for file in "${syntax_files[@]}" "${review_tests[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

echo "Required files found."
echo

echo "Running Foundation 1.1 dependency validation..."
"$base_runner"

echo
echo "Foundation 1.1 dependency validation passed."
echo

echo "Running Foundation 1.2 syntax checks..."

for file in "${syntax_files[@]}" "${review_tests[@]}"; do
  node --check "$file"
done

echo
echo "Foundation 1.2 syntax checks passed."
echo

echo "Running review resolution workflow tests..."

for test_file in "${review_tests[@]}"; do
  node "$test_file"
done

echo
echo "Review resolution workflow tests passed."
echo
echo "Foundation 1.2 release validation suite passed."
