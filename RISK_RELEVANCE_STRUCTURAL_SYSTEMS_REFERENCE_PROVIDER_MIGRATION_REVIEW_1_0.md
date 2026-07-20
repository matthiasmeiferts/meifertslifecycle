# Risk Relevance Structural Systems Reference Provider Migration Review 1.0

## Review Purpose

This document records the independent Foundation 1.5 Sprint I-3T implementation review of the Sprint I-3S Structural Systems Risk Relevance source-version migration.

Review constraints observed:

- No productive implementation change.
- No change to I-3S files.
- No test change.
- No correction.
- No architecture change.
- No staging, commit, tag, or push.

Review target: verify whether Sprint I-3S correctly migrates exactly one reference provider, Structural Systems, from unversioned legacy Risk Relevance source values to explicit source-owned `riskRelevanceVersion` transport without changing Risk Relevance value semantics, mapper ownership, engine/router behavior, public contracts, score/priority/severity boundaries, or unselected providers.

## Repository Baseline

Pre-review Git gate result:

```text
Branch: foundation-release-1.0
HEAD: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Tag on HEAD: foundation-1.5-risk-relevance-interpretation-1.0-2026-07-20
origin/foundation-release-1.0: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Remote refs/heads/foundation-release-1.0: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Staged changes: none
Whitespace check: passed
```

Initial status:

```text
 M portal/core/knowledge/StructuralSystemsKnowledgeProvider.js
 M portal/core/reasoning/KnowledgeReasoningMapper.js
 M tests/structural-systems-knowledge-provider-test.js
 M tests/structural-systems-reasoning-integration-test.js
?? FOUNDATION_1_5_NEXT_ARCHITECTURE_MILESTONE_DECISION_1_0.md
?? RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md
```

The same hard Git gate was repeated immediately before creating this review document. The branch, HEAD, tag, remote branch, unstaged changes, untracked files, whitespace check, and empty staged diff remained unchanged.

## Reviewed Architecture

Reviewed architecture and prior review material:

- `FOUNDATION_1_5_NEXT_ARCHITECTURE_MILESTONE_DECISION_1_0.md`
- `RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_INTERPRETATION_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_INTERPRETATION_IMPLEMENTATION_REVIEW_1_0.md`

Binding review baseline:

- Selected migration architecture is Option A: provider emits `riskRelevanceVersion`; transport copies only if source emitted it.
- Selected reference provider is Structural Systems.
- `riskRelevance` values remain unchanged legacy source values.
- `riskRelevanceVersion` belongs to the same source element as `riskRelevance`.
- Mapper, engine, router, Internal Model, and Interpretation Model must not invent source versions.
- Registry owns supported source version and classification authority.
- Internal Model and Interpretation Model were already ready and are not authorized for I-3S changes.
- Router, first-success behavior, public contracts, UI, reports, export, persistence, score, priority, severity, recommendation, decision, CAPEX, RUL, valuation, and safety-certification behavior are out of scope.

## Reviewed Implementation Files

Reviewed productive files:

- `portal/core/knowledge/StructuralSystemsKnowledgeProvider.js`
- `portal/core/reasoning/KnowledgeReasoningMapper.js`
- `portal/core/risk/RiskRelevanceGovernanceRegistry.js`
- `portal/core/risk/BuildingRiskInternalModel.js`
- `portal/core/risk/BuildingRiskInterpretationModel.js`
- `portal/core/ExpertReasoningEngine.js`
- `portal/core/reasoning/KnowledgeDomainRouter.js`

Diff review showed only two productive files modified by I-3S:

```text
portal/core/knowledge/StructuralSystemsKnowledgeProvider.js: 3 insertions
portal/core/reasoning/KnowledgeReasoningMapper.js: 25 insertions, 2 deletions
```

## Reviewed Test Files

Reviewed test files:

- `tests/structural-systems-knowledge-provider-test.js`
- `tests/structural-systems-reasoning-integration-test.js`
- `tests/risk-relevance-governance-registry-test.js`
- `tests/building-risk-internal-model-test.js`
- `tests/building-risk-interpretation-model-test.js`
- `tests/expert-reasoning-engine-test.js`
- `tests/knowledge-domain-router-test.js`

Diff review showed only two test files modified by I-3S:

```text
tests/structural-systems-knowledge-provider-test.js: 34 insertions
tests/structural-systems-reasoning-integration-test.js: 79 insertions
```

## Git Scope Review

Diff commands executed:

```text
git diff --stat
git diff --numstat
git diff --name-status
git diff -- portal/core/knowledge/StructuralSystemsKnowledgeProvider.js portal/core/reasoning/KnowledgeReasoningMapper.js tests/structural-systems-knowledge-provider-test.js tests/structural-systems-reasoning-integration-test.js
```

Result:

```text
4 files changed, 141 insertions(+), 2 deletions(-)
M portal/core/knowledge/StructuralSystemsKnowledgeProvider.js
M portal/core/reasoning/KnowledgeReasoningMapper.js
M tests/structural-systems-knowledge-provider-test.js
M tests/structural-systems-reasoning-integration-test.js
```

The I-3S scope matches the allowed file set. No Registry, Internal Model, Interpretation Model, Engine, Router, UI, report, export, score, public API, persistence, non-selected provider, or non-selected provider test file is modified.

## Provider Source Ownership Review

Result: passed.

Structural Systems imports only `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` from the Registry and emits:

```text
riskRelevance: entry.riskRelevance
riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION
```

The field is emitted in `toHypothesis(...)`, the same provider source output object that already carries `riskRelevance`. The source value remains `high` for all current Structural hypotheses. The provider does not emit a contract-level default version and does not alter hypothesis matching, ranking, guardrails, CAPEX relevance, valuation relevance, or public top-level shape.

Empty Structural results remain:

```text
{ domain: "structural-systems", hypotheses: [] }
```

No empty result receives version metadata.

## Registry Import Review

Result: passed with architectural tension noted.

The Structural provider imports the supported source-version scalar from `RiskRelevanceGovernanceRegistry.js`. Earlier readiness architecture discouraged broad provider Registry dependency, while the I-3S reference migration requirement explicitly used the Registry source version as the authoritative source. The reviewed import is narrow, scalar, and read-only.

The provider does not import classifiers, definitions, value states, version states, or interpretation logic. It does not validate, canonicalize, or classify Risk Relevance values.

## Import Cycle Review

Result: passed.

Observed import graph:

```text
StructuralSystemsKnowledgeProvider.js -> RiskRelevanceGovernanceRegistry.js
BuildingRiskInternalModel.js -> RiskRelevanceGovernanceRegistry.js
BuildingRiskInterpretationModel.js -> RiskRelevanceGovernanceRegistry.js
ExpertReasoningEngine.js -> StructuralSystemsKnowledgeProvider.js and KnowledgeReasoningMapper.js and KnowledgeDomainRouter.js
RiskRelevanceGovernanceRegistry.js -> no local imports
```

Because the Registry imports nothing, the Structural provider import does not create an import cycle. Module import check passed:

```text
MODULE_IMPORT_OK
```

## Mapper Transport Review

Result: passed for I-3S target behavior.

`KnowledgeReasoningMapper.js` now builds `mappedHypothesis`, copies existing hypothesis fields as before, and then conditionally copies `riskRelevanceVersion` only when the source hypothesis exposes an own data descriptor for that field.

Confirmed mapper properties:

- No Registry import.
- No default source version.
- No source-version inference from `riskRelevance`, domain, provider, router, confidence, evidence, or language.
- No canonicalization of lowercase legacy values.
- Unsupported source-version strings are transported as source data.
- Missing version remains absent in the mapped hypothesis.

## Own Property Review

Result: passed with non-blocking edge observation.

The mapper helper uses own data descriptors and therefore avoids inherited properties and accessor descriptors at the final mapping boundary. A source value such as `riskRelevanceVersion: "risk-relevance-2.0"` is transported; an absent version is not created.

Independent exploratory probing also showed that the mapper's pre-existing `cloneArray(...)` JSON clone drops own properties whose value is `undefined` before `mapHypothesis(...)` runs. The resulting mapped hypothesis has no `riskRelevanceVersion` field and the Internal Model classifies the version as `UNKNOWN_VERSION` due to absence rather than own `undefined` presence.

This is not blocking for I-3S because the selected Structural provider emits the exact supported string value, not `undefined`; no supported/default version is invented; and the downstream interpretation remains non-interpretable for the artificial own-undefined case. It should remain visible for future mapper hardening if future providers intentionally emit null-like version fields as own data.

## Missing Version Review

Result: passed.

A source hypothesis without `riskRelevanceVersion` remains without `riskRelevanceVersion` after mapper transport. The Internal Model classifies the resulting Risk Relevance entry as `UNKNOWN_VERSION`. The Interpretation Model keeps `LEGACY_SUPPORTED + UNKNOWN_VERSION` as `NOT_INTERPRETED` with reason `RR_NOT_ELIGIBLE_LEGACY_UNKNOWN_VERSION`.

No missing-version default was found in the provider, mapper, engine, router, Internal Model, or Interpretation Model.

## Unsupported Version Review

Result: passed.

An unsupported source version such as `risk-relevance-2.0` is transported by the mapper without validation or rewriting. The Internal Model classifies it as `VERSION_UNSUPPORTED`. The Interpretation Model keeps unsupported-version entries `NOT_INTERPRETED`.

No unsupported version is canonicalized, repaired, downgraded to missing, or converted into a supported version.

## Version Without Risk Relevance Review

Result: passed for no-interpretation and no-public-effect boundary, with non-blocking edge observation.

Architecture requires the provider to emit `riskRelevanceVersion` on the same source element that carries `riskRelevance`; Structural Systems does so. An artificial mapper probe with a version field but no source `riskRelevance` did not become interpretable. It produced no eligible Risk Relevance interpretation and no public/score/priority/severity effect.

The probe also showed a pre-existing mapper behavior: `mapHypothesis(...)` always assigns `riskRelevance: hypothesis.riskRelevance`, so a source object missing `riskRelevance` can become a mapped object with own `riskRelevance: undefined`. This predates I-3S and does not affect the selected Structural provider path, where `riskRelevance` is always emitted with `high`.

## Engine Boundary Review

Result: passed.

`ExpertReasoningEngine.js` is unchanged by I-3S. The Structural path remains:

```text
buildStructuralSystemsReasoning(source)
-> StructuralSystemsKnowledgeProvider.getKnowledge(...)
-> KnowledgeReasoningMapper.map(...)
```

The engine does not create, overwrite, validate, canonicalize, remove, or interpret `riskRelevanceVersion`. First-success behavior and public top-level keys remain unchanged.

## Internal Model Review

Result: passed.

`BuildingRiskInternalModel.js` is unchanged by I-3S. It already reads `riskRelevanceVersion` from the same hypothesis source element as `riskRelevance`, preserves raw version, classifies version independently, and stores `versionPresent`, `rawVersion`, `versionState`, and `governanceVersion` in `riskRelevanceEntries`.

Confirmed states:

- Supported Structural provider version: `VERSION_SUPPORTED`.
- Missing source version: `UNKNOWN_VERSION`.
- Own undefined/null-like source version in direct Internal Model tests: `UNKNOWN_VERSION`.
- Unsupported source version: `VERSION_UNSUPPORTED`.

The Internal Model does not create concern categories, scores, public fields, priority, severity, red flags, recommendations, or decisions from Risk Relevance.

## Interpretation Review

Result: passed.

`BuildingRiskInterpretationModel.js` is unchanged by I-3S. It consumes only preserved `riskRelevanceEntries` and computes eligibility internally under Option B.

Confirmed behavior:

- `LEGACY_SUPPORTED + VERSION_SUPPORTED` is interpreted internally.
- `LEGACY_SUPPORTED + UNKNOWN_VERSION` remains `NOT_INTERPRETED`.
- Unsupported versions remain `NOT_INTERPRETED`.
- Missing values remain `NOT_INTERPRETED`.
- Raw `riskRelevance` is not a concern-category source.
- Risk Relevance interpretation does not create `riskDrivers`, concern categories, public decisions, recommendations, scores, priority, or severity.

The Structural I-3S path activates internal Risk Relevance interpretation eligibility for Structural source entries only because the provider explicitly emits the supported source version.

## Router and First-Success Review

Result: passed.

`KnowledgeDomainRouter.js` is unchanged by I-3S. `DOMAIN_PRECEDENCE` remains with `structural-systems` first. Routing predicates are unchanged.

Existing and new focused checks confirm:

- Structural overlap with Crack still resolves Structural first where applicable.
- Structural overlap with Concrete Corrosion still resolves Structural first where explicit structural relevance is present.
- Basement and other non-structural cases retain their prior routing.
- First-success engine behavior remains unchanged.

## Public Contract Review

Result: passed.

The Expert Reasoning public top-level contract keys remain:

```text
primaryHypothesis
alternativeHypotheses
supportingEvidence
missingEvidence
requiredVerification
potentialConsequences
confidence
```

No top-level public `riskRelevanceVersion`, candidate-domain list, secondary-domain list, UI field, report field, export field, API field, persistence field, or score contract is introduced.

The provider contract remains `{ domain, hypotheses }`; the new version field is only on emitted Structural hypotheses next to source `riskRelevance`.

## Score Priority Severity Boundary

Result: passed.

No I-3S diff line adds score, priority, severity, criticality, review priority, risk class, result classification, red flag, blocking flag, recommendation, decision, CAPEX effect, RUL effect, valuation effect, acquisition advice, safety confirmation, or technical diagnosis behavior.

Focused tests and independent probes confirmed forbidden fields are absent from provider output, expert reasoning top-level output, Internal Model Risk Relevance entries, and Interpretation Model Risk Relevance interpretation entries.

## Test Quality Review

Result: passed.

The I-3S tests are focused and contract-relevant:

- Provider test proves every emitted Structural hypothesis with `riskRelevance` also carries the Registry supported source version.
- Provider test proves empty Structural result remains without version metadata.
- Provider test strengthens no score/priority/severity field assertions.
- Integration test proves Structural provider output reaches Expert Reasoning with unchanged `riskRelevance` and supported version.
- Integration test proves Provider -> Mapper -> Engine -> Internal Model -> Interpretation flow results in `LEGACY_SUPPORTED + VERSION_SUPPORTED` and internal `INTERPRETED` state.
- Integration test proves mapper missing-version, unsupported-version, and canonical-like value transport behavior.
- Existing router and first-success tests remain intact.

Test coupling is acceptable because version value, reason code, and public contract keys are architectural contracts in this sprint.

## Independent Probe Results

Two independent inline ESM probe passes were run without creating or modifying probe files.

Exploratory probe pass:

```text
PROBE_SUMMARY passed=13 failed=2
```

The two exploratory failures were classified as non-blocking mapper edge observations:

- Own `riskRelevanceVersion: undefined` is dropped by the mapper's pre-existing JSON clone before the own-data-property helper can copy it. It does not create a supported/default version and remains `UNKNOWN_VERSION` downstream.
- Artificial version-without-`riskRelevance` remains not interpreted; the mapper's pre-existing object literal creates own `riskRelevance: undefined`, but no eligible interpretation or public effect is produced.

Classified I-3S boundary probe pass:

```text
PROBE_SUMMARY passed=15 failed=0
```

Covered probe areas:

1. Provider source version on all emitted Structural hypotheses.
2. Provider no-match empty output.
3. Mapper supported version transport.
4. Mapper missing-version non-default behavior.
5. Mapper own-undefined no supported/default version behavior.
6. Mapper unsupported version transport.
7. Version without Risk Relevance remains not interpreted.
8. Full Structural path through Provider, Mapper, Engine, Internal Model, and Interpretation Model.
9. Legacy no-version path remains `UNKNOWN_VERSION` and `NOT_INTERPRETED`.
10. Unsupported value/version path remains `NOT_INTERPRETED`.
11. Determinism.
12. Input immutability.
13. Router and first-success.
14. Forbidden public/score/priority/severity fields.
15. Other providers unchanged, sampled with Moisture and Roof Envelope.

## Focused Test Results

Focused tests executed successfully:

```text
StructuralSystemsKnowledgeProvider tests completed successfully.
StructuralSystems reasoning integration tests completed successfully.
RiskRelevanceGovernanceRegistry tests completed successfully. Passed: 27
BuildingRiskInternalModel tests completed successfully.
BuildingRiskInterpretationModel tests completed successfully.
ExpertReasoningEngine tests completed successfully.
KnowledgeDomainRouter tests completed successfully.
```

## Full Test Suite Result

Complete JavaScript suite command:

```sh
for test_file in tests/*.js; do
  node "$test_file" >/dev/null || {
    printf 'FAILED %s\n' "$test_file"
    exit 1
  }
done

printf 'ALL_JS_TESTS_PASSED\n'
```

Result:

```text
ALL_JS_TESTS_PASSED
```

## Hygiene Review

Hygiene checks passed:

- `git diff --check`: no whitespace errors.
- `git diff --cached --name-status`: no staged files.
- Module import check: `MODULE_IMPORT_OK`.
- Added-line scan in the four I-3S files found no `/Users/`, `/home/`, `C:\Users\`, password/passwd/secret/credential/API/private-key tokens, `console.log(`, `debugger`, `TODO`, `FIXME`, `TBD`, `PLACEHOLDER`, or no-newline marker.
- EOF byte checks for the four I-3S files all returned `0a`.

EOF checks:

```text
portal/core/knowledge/StructuralSystemsKnowledgeProvider.js: 0a
portal/core/reasoning/KnowledgeReasoningMapper.js: 0a
tests/structural-systems-knowledge-provider-test.js: 0a
tests/structural-systems-reasoning-integration-test.js: 0a
```

## Findings

No blocking findings were identified.

I-3S correctly implements the controlled Structural Systems reference-provider Risk Relevance version migration within the authorized file set. The implementation preserves existing `riskRelevance` values, emits the supported source version explicitly at the provider source element, transports only source-owned mapper data, avoids missing-version defaults, avoids canonicalization/validation in transport, leaves Engine and Router unchanged, and creates no public/score/priority/severity/decision effect.

## Blocking Findings

None.

## Non-Blocking Findings

NB-1: Mapper own-undefined edge behavior.

The mapper's existing JSON clone drops own `riskRelevanceVersion: undefined` before final own-data-property transport. Downstream state remains `UNKNOWN_VERSION` and non-interpretable, and the selected Structural provider emits the exact supported string, so this is not blocking for I-3S. Future provider migrations may choose to harden mapper cloning if null-like own source metadata must be audit-distinguished from absence at the mapper boundary.

NB-2: Mapper version-without-value artificial edge behavior.

The mapper still assigns `riskRelevance: hypothesis.riskRelevance` even when an artificial source hypothesis has no own `riskRelevance`. This predates I-3S and is outside the selected Structural provider path, where every emitted version is next to `riskRelevance: "high"`. The artificial case remains not interpreted and creates no public effect.

## Remaining Risks

- All unselected providers remain legacy and unversioned until future provider-specific migration sprints.
- Some future providers use custom engine/coordinator/renderer paths and will need provider-specific transport review before migration.
- The narrow Structural provider Registry constant import is acceptable for I-3S, but future migrations should keep imports scalar and avoid importing classification or interpretation logic into providers.
- The two non-blocking mapper edge observations should be considered when later migrations require stronger null-like source metadata distinction.

## Final Recommendation

FOUNDATION 1.5 SPRINT I-3S IMPLEMENTATION APPROVED
