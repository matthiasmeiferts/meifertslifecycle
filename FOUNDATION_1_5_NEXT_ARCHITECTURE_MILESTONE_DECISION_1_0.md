# Foundation 1.5 Next Architecture Milestone Decision 1.0

## Repository State

Sprint: Foundation 1.5 Sprint I-3Q Next Architecture Milestone Determination Gate.

Gate type: repository audit, architecture audit, roadmap gate, and scope decision only.

No productive implementation, test change, commit, tag, push, staging, reset, restore, checkout, or stash action was performed.

Hard Git gate result:

```text
Branch: foundation-release-1.0
HEAD: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Origin branch: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Tag on HEAD: foundation-1.5-risk-relevance-interpretation-1.0-2026-07-20
Working tree before this document: clean
Staged diff before this document: empty
Whitespace check before this document: passed
```

Repository inventory confirmed the current Foundation 1.5 sequence:

```text
f249f61 Foundation 1.5: define risk relevance governance architecture
77e5099 Foundation 1.5: define risk relevance implementation readiness architecture
088d9b8 Foundation 1.5: add risk relevance governance registry
59f0732 Foundation 1.5: preserve risk relevance governance in internal model
8e0a133 Foundation 1.5: define risk relevance interpretation readiness architecture
28d67ad Foundation 1.5: implement risk relevance interpretation
```

## Completed Foundation Baseline

Completed Foundation 1.5 Risk Relevance baseline:

- Governance architecture is defined for a source-bound, qualitative, internal, non-numeric `riskRelevance` signal.
- Governance Registry is implemented in `portal/core/risk/RiskRelevanceGovernanceRegistry.js`.
- Internal Model preservation is implemented in `portal/core/risk/BuildingRiskInternalModel.js`.
- `domainAssessment.riskRelevanceEntries[]` is produced for primary and alternative hypotheses.
- Risk Relevance interpretation is implemented in `portal/core/risk/BuildingRiskInterpretationModel.js`.
- `domainInterpretation.riskRelevanceInterpretations[]` is additive, frozen, source-bound, and internal.
- Raw `riskRelevance` no longer creates concern categories.
- `UNKNOWN_VERSION` is never interpreted.
- Legacy fallback applies only when `riskRelevanceEntries` is not an own property.
- The implementation review approved the Risk Relevance Interpretation Implementation 1.0 milestone.

Open Foundation 1.5 architecture baseline:

- Existing providers still emit unversioned legacy `riskRelevance` values.
- No current provider emits `riskRelevanceVersion`.
- Real provider-origin entries therefore remain `UNKNOWN_VERSION` until provider migration.
- `riskRelevanceInterpretations` has no productive consumer outside the interpretation output and audit context.
- `riskCategory` and `riskConcern` remain legacy explicit concern surfaces in the Interpretation Model.
- No Building Risk Score productive implementation exists.
- No public presentation, export, report, API, or persistence contract for Risk Relevance exists.

## Reviewed Architecture Documents

Fully reviewed documents:

- `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_INTERPRETATION_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md`
- `RISK_RELEVANCE_INTERPRETATION_IMPLEMENTATION_REVIEW_1_0.md`
- `ENGINE_GOVERNANCE_REVIEW.md`
- `BUILDING_RISK_SCORE_ARCHITECTURE_1_0.md`
- `BUILDING_RISK_SCORE_PUBLIC_CONTRACT_1_0.md`
- `BUILDING_RISK_SCORE_ARCHITECTURE_TEST_MATRIX_1_0.md`
- `BUILDING_RISK_SCORE_INTERNAL_DOMAIN_MODEL_1_0.md`
- `BUILDING_RISK_SCORE_INTERNAL_MODEL_READINESS_1_0.md`
- `BUILDING_RISK_INTERPRETATION_ARCHITECTURE_1_0.md`

Fully reviewed code and test surfaces:

- `portal/core/risk/RiskRelevanceGovernanceRegistry.js`
- `portal/core/risk/BuildingRiskInternalModel.js`
- `portal/core/risk/BuildingRiskInterpretationModel.js`
- `tests/risk-relevance-governance-registry-test.js`
- `tests/building-risk-internal-model-test.js`
- `tests/building-risk-interpretation-model-test.js`

Additional checked surfaces:

- `portal/core/knowledge/*KnowledgeProvider.js`
- `portal/core/reasoning/KnowledgeReasoningMapper.js`
- `portal/core/ExpertReasoningEngine.js`
- `portal/core/LanguageManager.js`
- `portal/core/ReportOutputGovernanceManager.js`
- `portal/core/ReportAssemblyEngine.js`
- `portal/core/DraftWorkspaceManager.js`

## Current Risk-Relevance Architecture

Risk Relevance currently has four separated layers:

1. Provider source fields: current Knowledge Providers emit hypothesis-level `riskRelevance` values, mostly `low`, `medium`, or `high`.
2. Registry classification: `RiskRelevanceGovernanceRegistry.js` classifies raw value and source version into canonical value, value state, version state, and governance version.
3. Internal Model preservation: `BuildingRiskInternalModel.js` creates `riskRelevanceEntries` as source-bound preservation entries and keeps `interpretationEligible: false` as a preservation marker.
4. Interpretation output: `BuildingRiskInterpretationModel.js` computes interpretation eligibility from preserved fields and emits `riskRelevanceInterpretations` as internal audit-visible material.

Binding rules verified in code and tests:

- Registry owns canonical values, supported legacy mapping, unsupported legacy detection, value states, version states, and governance definition.
- Internal Model preserves raw values and source versions without creating concern categories, scores, priorities, public fields, red flags, recommendations, or decisions.
- Interpretation Model reads only `riskRelevanceEntries` for Risk Relevance interpretation.
- Raw `riskRelevance` is removed from `CATEGORY_SOURCE_FIELDS`.
- `concernCategory`, `riskCategory`, and `riskConcern` remain explicit concern-category inputs outside Risk Relevance.
- `LEGACY_SUPPORTED + VERSION_SUPPORTED` can be interpreted.
- `LEGACY_SUPPORTED + UNKNOWN_VERSION` is not interpreted.
- `CANONICAL + UNKNOWN_VERSION` is not interpreted.
- Unsupported governance versions are not interpreted.

## Current Consumers and Integration Points

Current productive consumers of `riskRelevanceEntries`:

- `BuildingRiskInterpretationModel.js` consumes `domainAssessment.riskRelevanceEntries`.

Current productive consumers of `riskRelevanceInterpretations`:

- `BuildingRiskInterpretationModel.js` includes them in `domainInterpretations`.
- `BuildingRiskInterpretationModel.js` includes their references in `auditContext.riskRelevanceInterpretationReferences`.

No productive consumer was found in:

- Building Risk Score productive code.
- Public contract rendering.
- UI or presentation components.
- Report assembly.
- Export preparation, export authorization, or report export package workflow.
- API or persistence modules.

Current transport points for raw provider `riskRelevance`:

- Knowledge Providers emit `riskRelevance` on hypotheses.
- `ExpertReasoningEngine.js` and provider mapping paths transport that field into ExpertReasoningContracts.
- Internal Model classification consumes the transported field.

Current version integration point:

- `BuildingRiskInternalModel.js` can preserve `riskRelevanceVersion` when present.
- No provider currently emits it.

## Open Architecture Questions

Risk Relevance Consumer Integration:

- No public or internal consumer contract exists beyond the interpretation output itself.
- No approved public view model exists.
- No export or presentation preparation gate exists.
- Direct public exposure remains forbidden.

Building Risk Score Integration:

- Score architecture and public contract documents exist.
- Productive Building Risk Score implementation was not found.
- Risk Relevance is explicitly non-numeric and cannot be weighted, averaged, or converted into score behavior.
- The current score documents allow public relevance fields conceptually, but Risk Relevance governance forbids direct public exposure without a separate versioned public contract decision.

Risk Interpretation Aggregation:

- Expert Intelligence remains router multi-candidate plus engine first-success public contract output.
- Building Risk Internal Model accepts bounded multi-contract inputs.
- Building Risk Interpretation combines domain interpretations by highest explicit concern without averaging or domain priority.
- Foundation 1.5 Risk Relevance does not create concern categories and does not participate in overall concern aggregation.

Presentation or Export Contract:

- Existing export and report workflows are governance gates for reports and draft packages.
- They do not consume `riskRelevanceInterpretations`.
- Public output of internal audit fields would violate current Risk Relevance governance.

Legacy Migration:

- All listed current providers remain legacy or unversioned for Risk Relevance.
- Provider migration order is defined in the readiness architecture.
- A provider migration policy and readiness matrix is not yet stored as an approved separate milestone.

Governance Registry Evolution:

- No Registry expansion is needed for the next step.
- Existing constants and state sets cover the current provider-version migration need.
- Adding new canonical values or reason codes is not justified now.

Risk Category and Risk Concern Legacy Surfaces:

- `riskCategory` and `riskConcern` remain explicit concern aliases in `BuildingRiskInterpretationModel.js`.
- They are not Risk Relevance inputs after the interpretation implementation.
- Changing them would risk altering existing interpretation behavior and requires separate legacy concern-surface governance.

## Candidate A

Candidate: Foundation 1.5 Sprint I-3R Risk Relevance Consumer Integration Readiness Architecture.

Status: CONDITIONALLY READY.

Fachliches Ziel:

- Define how internal `riskRelevanceInterpretations` may later be consumed by Building Risk Score, export preparation, presentation, report, or audit views.

Existing architecture foundation:

- Risk Relevance interpretation output exists and is source-bound.
- Score and Public Contract architecture documents exist.
- Export and report governance modules exist.

Affected files for a future architecture sprint:

- A new architecture document only.

Affected public contracts:

- Potentially Building Risk Score Public Contract, but only as a future decision target.

Dependencies:

- Provider-version migration policy should be clarified first because current provider-origin values remain `UNKNOWN_VERSION` and not interpreted.
- Public wording and view-model boundaries remain undefined.

Risks:

- Premature consumer integration could expose internal audit fields.
- Score or presentation could accidentally turn relevance into priority, severity, or score.

Necessary preparation:

- Decide which interpreted states are consumer-eligible.
- Decide whether public output remains forbidden until provider versioning exists.
- Define a view-model boundary before any UI or export work.

Test need:

- Future tests must prove no public field leak, no score input, no export inclusion, and no UI presentation without contract.

Possible scope size:

- Medium architecture scope.

Suitability as next Foundation 1.5 sprint:

- Useful, but not the best immediate next step because provider-origin Risk Relevance is still unversioned and therefore mostly audit-only.

## Candidate B

Candidate: Foundation 1.5 Sprint I-3R Legacy Risk Relevance Provider Version Migration Readiness Architecture.

Status: READY.

Fachliches Ziel:

- Define the provider migration policy for adding `riskRelevanceVersion` next to existing legacy provider `riskRelevance` values without changing provider meaning, concern categories, score behavior, public contracts, router behavior, or engine behavior.

Existing architecture foundation:

- Governance architecture defines source-element versioning.
- Implementation readiness architecture defines provider migration phases and deterministic provider order.
- Registry supports `risk-relevance-1.0` source version.
- Internal Model already preserves `riskRelevanceVersion` when present.
- Interpretation Model already interprets `LEGACY_SUPPORTED + VERSION_SUPPORTED` and rejects `UNKNOWN_VERSION`.

Affected files for the selected architecture sprint:

- `RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md` only.

Affected public contracts:

- None in the architecture sprint.
- A later implementation must preserve ExpertReasoningContract shape additively by adding source-element `riskRelevanceVersion` only.

Dependencies:

- Existing Registry, Internal Model, and Interpretation Model must remain unchanged.
- Provider migration must not require consumer integration.
- Provider migration must not change values from legacy lowercase to canonical uppercase in the same phase.

Risks:

- Adding versions could make currently audit-only legacy provider relevance interpretable.
- That is intended only if the migration policy proves that the version marker is a source-governance marker, not a new concern or priority.
- Provider tests must prevent accidental value rewrites, routing changes, or public surface changes.

Necessary preparation:

- Confirm provider list and migration order.
- Define exact allowed provider files for phase 1 implementation.
- Define exact forbidden files.
- Define test matrix for provider output, integration transport, Internal Model version state, Interpretation Model interpreted path, and no public exposure.
- Define rollback-free review and commit gates.

Test need:

- Provider-specific tests must verify `riskRelevanceVersion` is emitted next to existing `riskRelevance` values.
- Integration tests must verify engine and mapper transport without changing first-success behavior.
- Internal Model tests must verify `VERSION_SUPPORTED` for migrated provider hypotheses.
- Interpretation Model tests must verify existing no-concern guardrails remain intact.
- Full JavaScript suite must pass.

Possible scope size:

- Small to medium architecture scope.

Suitability as next Foundation 1.5 sprint:

- Strong. It is the smallest architecture milestone that unlocks real provider-origin interpreted relevance while preserving every public and score boundary.

## Candidate C

Candidate: Foundation 1.5 Sprint I-3R Building Risk Score and Risk Relevance Boundary Architecture.

Status: CONDITIONALLY READY.

Fachliches Ziel:

- Define the boundary between internal Risk Relevance interpretation and future Building Risk Score rendering.

Existing architecture foundation:

- Building Risk Score architecture, public contract, test matrix, internal domain model, and internal model readiness documents exist.
- Building Risk Interpretation architecture exists.
- Risk Relevance interpretation output exists.

Affected files for a future architecture sprint:

- A new architecture document only.

Affected public contracts:

- Potentially Building Risk Score Public Contract, but only after a specific public contract decision.

Dependencies:

- Provider-version migration readiness should precede this to avoid designing a score boundary around mostly non-interpreted relevance entries.
- Public contract naming and field mapping remain separate.

Risks:

- Score language could imply numeric scoring or review priority.
- Risk Relevance could be accidentally treated as weight, rank, or threshold.
- Public contract work may become too broad for the next closed Foundation 1.5 sprint.

Necessary preparation:

- Establish provider-version migration readiness first.
- Define whether Risk Relevance remains internal-only for the whole Foundation 1.5 line.

Test need:

- Future boundary tests must prove no formula, weighting, averaging, public field leak, or priority derivation.

Possible scope size:

- Medium to large architecture scope.

Suitability as next Foundation 1.5 sprint:

- Suitable after provider-version migration readiness, not before it.

## Candidate Comparison

Candidate statuses:

```text
Candidate A: Risk Relevance Consumer Integration Readiness Architecture - CONDITIONALLY READY
Candidate B: Legacy Risk Relevance Provider Version Migration Readiness Architecture - READY
Candidate C: Building Risk Score and Risk Relevance Boundary Architecture - CONDITIONALLY READY
```

Rejected immediate implementation candidates:

- Public Presentation Contract implementation: NOT READY because no public view model exists and public exposure is forbidden.
- Export integration implementation: NOT READY because export modules do not have a Risk Relevance preparation contract and internal audit fields must not leak.
- Building Risk Score implementation: NOT READY because no productive score implementation is approved and score formulas or priority mapping remain forbidden.
- Registry evolution implementation: NOT READY because no missing Registry capability was found for the next step.
- Risk Category or Risk Concern legacy-surface implementation: CONDITIONALLY READY only as a future separate governance topic because changing these aliases may alter existing interpretation behavior.

Decision rationale:

- Candidate B is the only next sprint that directly addresses a current blocking architectural fact: all current providers remain unversioned while interpretation requires supported source version for actual interpretation.
- Candidate B is architecture-only and can be kept narrow.
- Candidate B does not expose internal output publicly.
- Candidate B does not require Registry, Internal Model, or Interpretation Model changes.
- Candidate B sets the precondition for later Consumer Integration and Score Boundary work.

## Dependency Analysis

Candidate B dependencies:

1. Fachliches Ziel: approve a version-marker migration plan for existing provider `riskRelevance` values.
2. Existing architecture foundation: Registry supports source version, Internal Model preserves it, Interpretation Model consumes it.
3. Affected files: architecture document only in the selected sprint; later implementation would touch selected provider files and provider/integration tests after review.
4. Affected public contracts: none in the selected architecture sprint.
5. Dependencies: existing Risk Relevance Interpretation Implementation 1.0 must remain intact.
6. Risks: version markers can activate interpretation; guardrails must prove no concern, score, priority, or public output is created.
7. Necessary preparation: provider inventory, migration order, allowed files, forbidden files, test matrix, review gate.
8. Test need: provider tests, integration tests, risk-layer focused tests, full suite.
9. Scope size: small to medium.
10. Suitability: READY as the next Foundation 1.5 architecture sprint.

Candidate A dependencies:

1. Fachliches Ziel: define consumer boundaries.
2. Existing architecture foundation: additive internal output exists.
3. Affected files: new architecture document only.
4. Affected public contracts: possible future public contract boundary.
5. Dependencies: provider version readiness and public wording.
6. Risks: internal audit leakage.
7. Necessary preparation: consumer eligibility matrix.
8. Test need: no public leak, no score, no export.
9. Scope size: medium.
10. Suitability: CONDITIONALLY READY after Candidate B.

Candidate C dependencies:

1. Fachliches Ziel: define Score boundary.
2. Existing architecture foundation: Score documents exist.
3. Affected files: new architecture document only.
4. Affected public contracts: possible future Building Risk Score public contract.
5. Dependencies: provider version readiness and consumer policy.
6. Risks: score-like misuse.
7. Necessary preparation: non-numeric relevance policy for Score.
8. Test need: no weighting, no formula, no priority.
9. Scope size: medium to large.
10. Suitability: CONDITIONALLY READY after Candidate B and probably after Candidate A.

## Public Contract Impact

The selected next milestone has expected public API impact: none.

Risk Relevance remains internal.

The selected architecture sprint must not authorize:

- public Risk Relevance fields,
- UI display of `riskRelevanceInterpretations`,
- export of Risk Relevance audit fields,
- report rendering of Risk Relevance audit fields,
- Building Risk Score field additions,
- review priority,
- score formulas,
- acquisition, valuation, CAPEX, RUL, or safety conclusions.

Later provider version implementation may add `riskRelevanceVersion` to ExpertReasoningContract hypothesis payloads, but only after architecture review approves it as additive source metadata.

## Governance Risks

Central risks:

- Current provider values are legacy and unversioned.
- Interpreting unversioned legacy values would violate the `UNKNOWN_VERSION` rule.
- Adding source versions can make legacy-supported values interpretable, so migration must be explicitly governed.
- `riskCategory` and `riskConcern` remain legacy explicit concern surfaces outside Risk Relevance.
- Public Score and Presentation documents are not implementation authorization.
- Export and report workflows must not receive internal audit fields by accident.
- Registry changes are unnecessary and should be forbidden in the next sprint.

Risk controls for the selected milestone:

- Architecture-only sprint.
- No code or tests changed.
- Provider value migration to canonical uppercase values remains a later separate phase.
- No concern-category mapping from Risk Relevance.
- No score or priority behavior.
- No public exposure.

## Test Baseline

Focused tests executed:

```sh
node tests/risk-relevance-governance-registry-test.js
node tests/building-risk-internal-model-test.js
node tests/building-risk-interpretation-model-test.js
```

Focused test result:

```text
RiskRelevanceGovernanceRegistry tests completed successfully. Passed: 27
BuildingRiskInternalModel tests completed successfully.
BuildingRiskInterpretationModel tests completed successfully.
```

Complete JavaScript suite executed:

```sh
for test_file in tests/*.js; do
  node "$test_file" >/dev/null || {
    printf 'FAILED %s\n' "$test_file"
    exit 1
  }
done

printf 'ALL_JS_TESTS_PASSED\n'
```

Complete suite result:

```text
ALL_JS_TESTS_PASSED
```

## Recommended Next Milestone

Recommended next milestone:

```text
FOUNDATION 1.5 SPRINT I-3R
LEGACY RISK RELEVANCE PROVIDER VERSION MIGRATION READINESS ARCHITECTURE
```

Sprint identifier:

```text
I-3R
```

Precise goal:

Define the architecture, migration order, allowed implementation scope, forbidden scope, test matrix, review gate, and commit gate for adding `riskRelevanceVersion` to existing provider-emitted legacy `riskRelevance` values without changing provider meaning or public output.

Recommended architecture document for Sprint I-3R:

```text
RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md
```

Allowed files in Sprint I-3R:

```text
RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md
```

Forbidden files in Sprint I-3R:

```text
portal/core/risk/RiskRelevanceGovernanceRegistry.js
portal/core/risk/BuildingRiskInternalModel.js
portal/core/risk/BuildingRiskInterpretationModel.js
portal/core/knowledge/*KnowledgeProvider.js
portal/core/reasoning/KnowledgeReasoningMapper.js
portal/core/ExpertReasoningEngine.js
tests/*.js
UI files
report files
export files
score/public-contract implementation files
existing architecture documents
```

Expected public API impact:

```text
None.
```

Commit rule:

```text
No implementation commit is allowed until the I-3R architecture document has passed an independent review gate.
```

## Rejected or Deferred Milestones

Deferred after I-3R:

- Risk Relevance Consumer Integration Readiness Architecture.
- Building Risk Score and Risk Relevance Boundary Architecture.
- Risk Relevance Public Presentation Contract Architecture.
- Risk Relevance Export Preparation Gate Architecture.
- Legacy Risk Relevance Provider Canonical Value Migration Architecture.
- Risk Category and Risk Concern Legacy Surface Governance Architecture.

Rejected for immediate next sprint:

- Any productive Provider migration implementation.
- Any Building Risk Score implementation.
- Any UI, export, report, API, or persistence integration.
- Any Registry expansion.
- Any change to raw concern-category aliases.

## Required Implementation Scope

For selected Sprint I-3R itself:

- No productive implementation.
- No test implementation.
- No existing file modification.
- Create only `RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md`.

For a later implementation sprint after I-3R review approval, the maximum candidate scope should be:

- Add `riskRelevanceVersion: "risk-relevance-1.0"` next to existing provider `riskRelevance` fields.
- Keep existing legacy values unchanged in phase 1.
- Update provider tests and integration tests only as authorized by the approved architecture.
- Run risk-layer focused tests and full JavaScript suite.

## Required Test Scope

Sprint I-3R test scope:

- No test files changed.
- Run focused Risk Relevance baseline tests.
- Run the full JavaScript suite.
- Verify Git scope contains only the new architecture document.

Later provider-version implementation test scope, to be specified in I-3R:

- Provider tests for exact `riskRelevanceVersion` emission.
- Reasoning integration tests proving transport through ExpertReasoningContract.
- Internal Model tests proving `VERSION_SUPPORTED` when migrated source versions exist.
- Interpretation Model tests proving interpreted Risk Relevance remains non-concern, non-score, non-priority, non-public, and source-bound.
- Regression tests proving provider values stay legacy lowercase in phase 1.
- Full JavaScript suite.

## Preconditions

Preconditions for Sprint I-3R:

- Branch remains `foundation-release-1.0`.
- HEAD remains at or descends from `28d67adbe1d0777428ce4c2f4a6cf57db2912b83`.
- Working tree is clean before starting.
- Current Foundation 1.5 Risk Relevance tests pass.
- No code implementation is attempted in the architecture sprint.

Preconditions for a later provider-version implementation sprint:

- I-3R architecture document approved by independent review.
- Exact provider list and order approved.
- Exact file scope approved.
- Exact tests approved.
- Commit gate defined separately.

## Non-Goals

Sprint I-3R must not:

- implement provider changes,
- change provider values to canonical uppercase values,
- change Registry constants,
- change Internal Model behavior,
- change Interpretation Model behavior,
- change engine or router behavior,
- change mapper behavior,
- change public contracts,
- change UI, report, export, API, or persistence behavior,
- introduce score, weighting, formula, priority, diagnosis, recommendation, decision, valuation, acquisition, CAPEX, RUL, or safety behavior,
- alter `riskCategory` or `riskConcern` legacy surfaces.

## Final Decision

Final decision:

```text
FOUNDATION 1.5 SPRINT I-3R
LEGACY RISK RELEVANCE PROVIDER VERSION MIGRATION READINESS ARCHITECTURE
```

This is an Architecture-Readiness sprint, not an implementation sprint.

Decision basis:

- The Risk Relevance interpretation layer is implemented and approved.
- The only current source gap that prevents real provider-origin interpretation is missing provider source version metadata.
- The Registry, Internal Model, and Interpretation Model already contain the required technical receiving surfaces.
- A narrow architecture sprint can define provider version migration without touching code.
- Consumer integration, public presentation, export, and score boundary work should wait until provider version migration is architecturally governed.

Done criteria for I-3R:

- Provider migration architecture document exists.
- Provider inventory is verified against current repository state.
- Migration phase 1 is defined as version-marker only.
- Canonical value migration is explicitly deferred.
- Allowed and forbidden files are listed.
- Provider order is confirmed or corrected.
- Test matrix is complete.
- No Registry, Internal Model, Interpretation Model, Provider, Engine, Router, Mapper, UI, Export, Report, API, Persistence, Score, or Test file is changed.
- Focused Risk Relevance tests pass.
- Full JavaScript suite passes.
- Git status contains only the I-3R architecture document.

Readiness status:

```text
FOUNDATION 1.5 SPRINT I-3Q NEXT ARCHITECTURE MILESTONE DETERMINATION GATE COMPLETE
NEXT FOUNDATION 1.5 ARCHITECTURE MILESTONE SELECTED
READY FOR THE SELECTED ARCHITECTURE READINESS SPRINT
NOT READY FOR IMPLEMENTATION OR COMMIT
```
