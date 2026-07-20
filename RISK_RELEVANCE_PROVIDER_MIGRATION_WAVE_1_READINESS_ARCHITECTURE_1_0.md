# Risk Relevance Provider Migration Wave 1 Readiness Architecture 1.0

## Document Purpose

This document defines the binding architecture and implementation readiness for the first controlled provider migration wave after the completed Structural Systems reference-provider migration.

This is Foundation 1.5 Sprint I-3V architecture readiness only.

This document does not implement provider changes, mapper changes, engine changes, router changes, Internal Model changes, Interpretation Model changes, tests, public contracts, UI, reports, export behavior, score behavior, staging, commit, tag, or push.

The only file created by this sprint is:

```text
RISK_RELEVANCE_PROVIDER_MIGRATION_WAVE_1_READINESS_ARCHITECTURE_1_0.md
```

## Repository Baseline

Repository gate at sprint start:

```text
Branch: foundation-release-1.0
HEAD: 6901ba4560b9c3f8575ea803b3c106a6f311344b
Origin branch: 6901ba4560b9c3f8575ea803b3c106a6f311344b
Tag on HEAD: foundation-1.5-structural-risk-relevance-version-1.0-2026-07-20
Remote dereferenced tag target: 6901ba4560b9c3f8575ea803b3c106a6f311344b
Initial working tree: clean
Initial staged diff: empty
Initial whitespace check: passed
```

Baseline tests executed for this readiness decision:

```text
node tests/structural-systems-knowledge-provider-test.js
node tests/structural-systems-reasoning-integration-test.js
node tests/risk-relevance-governance-registry-test.js
node tests/building-risk-internal-model-test.js
node tests/building-risk-interpretation-model-test.js
node tests/expert-reasoning-engine-test.js
node tests/knowledge-domain-router-test.js
node tests/balconies-terraces-knowledge-provider-test.js
node tests/balconies-terraces-reasoning-integration-test.js
node tests/drainage-rainwater-knowledge-provider-test.js
node tests/drainage-rainwater-reasoning-integration-test.js
node tests/fire-protection-systems-knowledge-provider-test.js
node tests/fire-protection-systems-reasoning-integration-test.js
```

Focused baseline result:

```text
StructuralSystemsKnowledgeProvider tests completed successfully.
StructuralSystems reasoning integration tests completed successfully.
RiskRelevanceGovernanceRegistry tests completed successfully. Passed: 27
BuildingRiskInternalModel tests completed successfully.
BuildingRiskInterpretationModel tests completed successfully.
ExpertReasoningEngine tests completed successfully.
KnowledgeDomainRouter tests completed successfully.
BalconiesTerracesKnowledgeProvider tests completed successfully.
BalconiesTerracesReasoningIntegration tests completed successfully.
DrainageRainwaterKnowledgeProvider tests completed successfully.
DrainageRainwater reasoning integration tests completed successfully.
FireProtectionSystemsKnowledgeProvider tests completed successfully.
FireProtectionSystems reasoning integration tests completed successfully.
```

Complete suite result:

```text
ALL_JS_TESTS_PASSED
```

## Completed Reference Provider Milestone

The Structural Systems reference-provider migration is complete, reviewed, committed, tagged, pushed, and remote-verified.

Completed reference facts:

- `StructuralSystemsKnowledgeProvider.js` emits `riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` next to existing `riskRelevance` on emitted hypotheses.
- Existing Structural source values remain legacy lowercase `high`.
- `KnowledgeReasoningMapper.js` transports `riskRelevanceVersion` only when the source hypothesis owns a data property with that field.
- The mapper does not import the Registry, infer versions, default missing versions, validate versions, or canonicalize legacy values.
- `ExpertReasoningEngine.js` and `KnowledgeDomainRouter.js` remain unchanged by the reference migration.
- `BuildingRiskInternalModel.js` already preserves source-element `riskRelevanceVersion`.
- `BuildingRiskInterpretationModel.js` interprets only preserved `riskRelevanceEntries` with supported value state and supported version state.
- Public, score, priority, severity, decision, recommendation, report, export, UI, API, and persistence boundaries remain closed.

Reference review result:

```text
FOUNDATION 1.5 SPRINT I-3S IMPLEMENTATION APPROVED
```

## Binding Architecture

Wave 1 continues the approved Option A architecture:

```text
Provider source element emits riskRelevanceVersion
Transport layer preserves riskRelevanceVersion if and only if source emitted it
Internal Model classifies preserved value and version
Interpretation Model interprets only supported value plus supported version
```

Wave 1 is a source-version marker migration only. It must not migrate provider values to canonical uppercase values.

Binding rules:

- `riskRelevanceVersion` belongs to the same provider hypothesis object that carries `riskRelevance`.
- The supported source version is `risk-relevance-1.0`.
- The provider may import only `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` from the Registry.
- The provider must not import classifiers, state sets, or interpretation helpers.
- Existing `riskRelevance` values must remain `low`, `medium`, or `high` exactly as currently emitted.
- The already migrated mapper transport path must be reused.
- No new mapper default, engine default, router rule, or contract-level default is authorized.

## Provider Inventory

The repository currently contains fifteen productive Risk-Relevance-emitting Knowledge Providers:

| # | Provider | Domain ID | Productive provider file | Current source version state |
| ---: | --- | --- | --- | --- |
| 1 | Structural Systems | `structural-systems` | `portal/core/knowledge/StructuralSystemsKnowledgeProvider.js` | Versioned, reference migrated |
| 2 | Concrete Corrosion | `concrete-corrosion` | `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` | Unversioned |
| 3 | Basement Waterproofing | `basement-waterproofing` | `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` | Unversioned |
| 4 | Balconies Terraces | `balconies-terraces` | `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` | Unversioned |
| 5 | Drainage Rainwater | `drainage-rainwater` | `portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js` | Unversioned |
| 6 | Fire Protection Systems | `fire-protection-systems` | `portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js` | Unversioned |
| 7 | Vertical Transportation Systems | `vertical-transportation-systems` | `portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js` | Unversioned |
| 8 | Sanitary Systems | `sanitary-systems` | `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` | Unversioned |
| 9 | HVAC Systems | `hvac-systems` | `portal/core/knowledge/HvacSystemsKnowledgeProvider.js` | Unversioned |
| 10 | Electrical Systems | `electrical-systems` | `portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js` | Unversioned |
| 11 | Windows Doors | `windows-doors` | `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` | Unversioned |
| 12 | Facade Wall Systems | `facade-wall-systems` | `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` | Unversioned |
| 13 | Roof Envelope | `roof-envelope` | `portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js` | Unversioned |
| 14 | Moisture | `moisture` | `portal/core/knowledge/MoistureKnowledgeProvider.js` | Unversioned |
| 15 | Crack | `crack` | `portal/core/knowledge/CrackKnowledgeProvider.js` | Unversioned |

No productive Knowledge Provider without `riskRelevance` was found in the audited set.

## Provider Migration Matrix

| # | Provider | Values | Transport path | Current tests | Wave 1 status | Reason |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Structural Systems | `high` | Shared `KnowledgeReasoningMapper` | Provider plus integration | Reference only | Already migrated and serves as baseline. |
| 2 | Concrete Corrosion | `medium`, `high` | Shared mapper plus custom `mapConcreteHypothesis` fallback | Provider plus integration | Excluded from Wave 1 | Fallback object currently copies `riskRelevance` only; provider-specific transport architecture required. |
| 3 | Basement Waterproofing | `medium`, `high` | Shared mapper plus custom `mapBasementHypothesis` fallback | Provider plus integration | Excluded from Wave 1 | Fallback object currently copies `riskRelevance` only; provider-specific transport architecture required. |
| 4 | Balconies Terraces | `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Selected | Homogeneous with reference mapper path; no custom version-dropping path found. |
| 5 | Drainage Rainwater | `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Selected | Homogeneous with reference mapper path; overlap-heavy routing already tested. |
| 6 | Fire Protection Systems | `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Selected | Homogeneous transport; semantic safety/compliance boundary covered by existing tests and must be extended. |
| 7 | Vertical Transportation Systems | `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Deferred | Suitable later shared-mapper candidate, held back by maximum batch size. |
| 8 | Sanitary Systems | `low`, `medium`, `high` | Adapter plus Coordinator plus Renderer | Provider, integration, adapter | Excluded from Wave 1 | Coordinator fallback maps hypotheses manually and drops source versions today. |
| 9 | HVAC Systems | `low`, `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Deferred | Suitable later shared-mapper candidate, held back by batch limit and later order. |
| 10 | Electrical Systems | `low`, `medium`, `high` | Adapter plus Coordinator plus Renderer | Provider, integration, adapter | Excluded from Wave 1 | Coordinator fallback maps hypotheses manually and drops source versions today. |
| 11 | Windows Doors | `low`, `medium`, `high` | Adapter plus Coordinator plus Renderer | Provider, integration, adapter | Excluded from Wave 1 | Coordinator fallback and renderer path require provider-specific transport review. |
| 12 | Facade Wall Systems | `low`, `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Deferred | Suitable later shared-mapper candidate, overlap-heavy and later order. |
| 13 | Roof Envelope | `medium`, `high` | Shared `KnowledgeReasoningMapper` only | Provider plus integration | Deferred | Suitable later shared-mapper candidate, roof/moisture/drainage overlaps need a later batch gate. |
| 14 | Moisture | `medium`, `high` | Custom engine clone path | Provider plus integration | Excluded from Wave 1 | Does not use shared mapper; custom clone path must be reviewed even if JSON clone likely preserves strings. |
| 15 | Crack | `low`, `medium`, `high` | Custom `mapCrackHypothesis` | Provider plus integration | Excluded from Wave 1 | Custom engine map copies `riskRelevance` only and has separate `structuralRelevance` semantics. |

## Current Versioning Landscape

Current productive source-version state:

```text
Versioned providers: 1
Unversioned providers: 14
Supported source version: risk-relevance-1.0
Governance version: risk-relevance-governance-1.0
```

Structural Systems now produces `LEGACY_SUPPORTED + VERSION_SUPPORTED` entries that can be internally interpreted.

All unselected providers still produce `LEGACY_SUPPORTED + UNKNOWN_VERSION` entries and remain `NOT_INTERPRETED` for Risk Relevance interpretation until their source hypotheses explicitly emit the supported source version and the transport path preserves it.

## Shared Mapper Analysis

`KnowledgeReasoningMapper.map(...)` is the only currently approved Wave 1 transport path.

Observed shared mapper behavior:

- It maps provider hypotheses into Expert Reasoning Contract hypotheses.
- It preserves `riskRelevance` exactly as before.
- It copies `riskRelevanceVersion` only when the source hypothesis has an own data descriptor for that field.
- It does not import the Risk Relevance Registry.
- It does not create a default version.
- It does not validate, classify, rewrite, or canonicalize source versions.
- It already passed the Structural reference review and integration tests.

Known mapper edge observations from the Structural review remain non-blocking for Wave 1:

- Own `riskRelevanceVersion: undefined` can be dropped by the existing JSON clone before final mapper transport; downstream remains `UNKNOWN_VERSION`, not supported by default.
- Artificial version-without-value input remains not interpreted and has no public effect.

Wave 1 providers must emit the exact supported string and must always emit it next to an existing `riskRelevance` value. Wave 1 must not rely on null-like source metadata distinctions.

## Engine Path Analysis

Engine dispatch remains first-success over router-resolved domains.

Wave 1 selected providers use these paths:

```text
buildBalconiesTerracesReasoning -> provider -> KnowledgeReasoningMapper.map
buildDrainageRainwaterReasoning -> provider -> KnowledgeReasoningMapper.map
buildFireProtectionSystemsReasoning -> provider -> KnowledgeReasoningMapper.map
```

These paths require no Engine change because the shared mapper already preserves source-owned `riskRelevanceVersion`.

Excluded or deferred paths:

- Concrete Corrosion uses custom `mapConcreteHypothesis(...)`; its fallback object currently copies `riskRelevance` only.
- Basement Waterproofing uses custom `mapBasementHypothesis(...)`; its fallback object currently copies `riskRelevance` only.
- Electrical Systems, Sanitary Systems, and Windows Doors use terminology adapters, reasoning coordinators, and a renderer; coordinator fallback maps currently copy `riskRelevance` only.
- Moisture uses a custom engine clone path outside the shared mapper.
- Crack uses a custom `mapCrackHypothesis(...)` and separate `structuralRelevance` semantics.

## Router and First-Success Analysis

`KnowledgeDomainRouter.js` keeps the following precedence:

```text
structural-systems
concrete-corrosion
basement-waterproofing
balconies-terraces
drainage-rainwater
fire-protection-systems
vertical-transportation-systems
sanitary-systems
hvac-systems
electrical-systems
windows-doors
facade-wall-systems
roof-envelope
moisture
crack
```

Wave 1 must not alter this list, any router predicate, or first-success behavior.

Router implications for selected providers:

- Balconies Terraces has documented overlaps with Concrete Corrosion, Basement Waterproofing, Windows Doors, Roof Envelope, Facade Wall Systems, Moisture, and Crack.
- Drainage Rainwater has documented overlaps with Balconies Terraces, Basement Waterproofing, Windows Doors, Facade Wall Systems, Roof Envelope, and Moisture.
- Fire Protection Systems has documented overlaps with Windows Doors, HVAC, Moisture, and Vertical Transportation in router tests.

Because source-version migration adds only source metadata inside emitted hypotheses, these overlaps must remain behaviorally unchanged.

## Transport and Clone Analysis

Approved transport path for Wave 1:

```text
Provider toHypothesis(...) output
-> KnowledgeReasoningMapper.map(...)
-> ExpertReasoningContract primaryHypothesis / alternativeHypotheses
-> BuildingRiskInternalModel riskRelevanceEntries
-> BuildingRiskInterpretationModel riskRelevanceInterpretations
```

Transport risks:

- Provider object spread or JSON clone can drop `undefined`, Symbol, function, getter, or unsupported values.
- Coordinator fallback maps currently omit `riskRelevanceVersion` and are therefore excluded.
- Custom engine fallback maps currently omit `riskRelevanceVersion` and are therefore excluded.
- Renderer clone paths may preserve string fields but are outside the reference path and therefore excluded for Wave 1.

Wave 1 control:

- Emit the exact string constant in the provider hypothesis object.
- Do not add version fields to empty provider results.
- Test provider output directly before mapping.
- Test Expert Reasoning output after mapping.
- Test Internal Model entries for `VERSION_SUPPORTED`.
- Test Interpretation Model entries for internal `INTERPRETED` state and no concern, score, priority, or public effect.

## Homogeneity Criteria

A provider is homogeneous enough for Wave 1 only if all criteria are true:

- It emits hypothesis-level `riskRelevance` values directly through provider output.
- It uses supported legacy values only: `low`, `medium`, or `high`.
- It reaches Expert Reasoning through `KnowledgeReasoningMapper.map(...)` without a custom fallback object that could drop fields.
- It does not depend on a terminology adapter, reasoning coordinator fallback, or renderer to preserve source metadata.
- It has focused provider tests and reasoning integration tests.
- Its router overlaps are already covered by existing tests.
- The future implementation can be limited to provider files and selected provider/integration tests.
- No Registry, Internal Model, Interpretation Model, Engine, Router, UI, report, export, API, persistence, or score change is needed.

## Wave 1 Candidate Assessment

Candidate results:

| Candidate | Assessment | Decision |
| --- | --- | --- |
| Concrete Corrosion | Early migration-order provider, but custom fallback mapping would need a provider-specific engine transport change if mapper scoring returns null. | Exclude from Wave 1. |
| Basement Waterproofing | Early migration-order provider, but custom fallback mapping would need a provider-specific engine transport change if mapper scoring returns null. | Exclude from Wave 1. |
| Balconies Terraces | Standard shared mapper path, supported legacy values, direct source emission, strong provider and integration tests. | Select. |
| Drainage Rainwater | Standard shared mapper path, supported legacy values, direct source emission, strong overlap and false-positive tests. | Select. |
| Fire Protection Systems | Standard shared mapper path, supported legacy values, direct source emission, strong safety/compliance boundary tests. | Select with explicit boundary tests. |
| Vertical Transportation Systems | Standard shared mapper path and likely suitable, but held to keep Wave 1 at three providers and avoid widening after Fire. | Defer. |
| HVAC Systems | Standard shared mapper path and likely suitable, but later in migration order. | Defer. |
| Facade Wall Systems | Standard shared mapper path and likely suitable, but overlap-heavy and later in order. | Defer. |
| Roof Envelope | Standard shared mapper path and likely suitable, but overlap-heavy and later in order. | Defer. |

## Selected Wave 1 Providers

Wave 1 provider set:

```text
Balconies Terraces
Drainage Rainwater
Fire Protection Systems
```

Selected provider files for future implementation:

```text
portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js
portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js
portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js
```

Selected test files for future implementation:

```text
tests/balconies-terraces-knowledge-provider-test.js
tests/balconies-terraces-reasoning-integration-test.js
tests/drainage-rainwater-knowledge-provider-test.js
tests/drainage-rainwater-reasoning-integration-test.js
tests/fire-protection-systems-knowledge-provider-test.js
tests/fire-protection-systems-reasoning-integration-test.js
```

## Excluded Providers

Excluded from Wave 1 because their current transport path is not the pure reference shared-mapper path:

- Concrete Corrosion.
- Basement Waterproofing.
- Electrical Systems.
- Sanitary Systems.
- Windows Doors.
- Moisture.
- Crack.

Exclusion is not a rejection of migration. It means each requires provider-specific transport architecture or a later implementation gate before source versions can be safely introduced.

## Deferred Providers

Deferred but likely suitable for later shared-mapper waves:

- Vertical Transportation Systems.
- HVAC Systems.
- Facade Wall Systems.
- Roof Envelope.

Deferred because Wave 1 maximum batch size is capped at three providers and the selected set already exercises two overlap-heavy exterior-water paths plus one safety-sensitive systems path.

## Maximum Batch Size

Maximum Wave 1 batch size:

```text
3 providers
```

Reason:

- One reference provider already proved the pattern.
- Three selected providers are enough to validate repeated shared-mapper migration without creating a mass migration.
- The batch exercises distinct domain semantics and router overlaps while keeping the allowed file set inspectable.
- Larger batches would blur review accountability and increase the chance of silent public or first-success drift.

## Selected Implementation Strategy

The future implementation sprint must migrate the selected providers in one controlled shared-mapper wave.

Implementation strategy:

1. Add a narrow scalar Registry import in each selected provider:
   `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION`.
2. Add `riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` next to `riskRelevance: entry.riskRelevance` in each selected provider's `toHypothesis(...)` output.
3. Do not change any existing `riskRelevance` value.
4. Do not change the mapper, engine, router, risk core, public contract, UI, report, export, API, persistence, or score code.
5. Extend only selected provider and integration tests.
6. Run the focused baseline, selected provider tests, selected integration tests, and complete suite.

## Source Ownership Contract

Source ownership remains provider-local.

Rules:

- Only the selected provider source element may emit its own `riskRelevanceVersion`.
- The mapper, engine, router, Internal Model, and Interpretation Model must not invent a missing source version.
- Empty provider results must remain `{ domain, hypotheses: [] }` without source-version metadata.
- Unselected providers must remain unversioned.

## Provider Contract

Provider contract for Wave 1 implementation:

- Preserve existing provider domain IDs.
- Preserve existing hypothesis IDs, ordering, matching, and ranking.
- Preserve existing `riskRelevance` values exactly.
- Add `riskRelevanceVersion` only on emitted hypotheses that already carry `riskRelevance`.
- Add no score, priority, severity, criticality, diagnosis, decision, recommendation, public result, compliance conclusion, safety conclusion, CAPEX effect, RUL effect, valuation effect, or acquisition advice.

## Mapper Contract

No mapper file change is authorized for Wave 1 implementation.

The existing mapper contract remains:

- Copy source-owned `riskRelevanceVersion` only when present as an own data property.
- Preserve source values without validation or canonicalization.
- Do not import the Registry.
- Do not default missing versions.
- Do not infer from domain, provider, router order, confidence, evidence, or text.

## Engine Contract

No Engine file change is authorized for Wave 1 implementation.

The Engine must remain a first-success dispatcher. It must not create, remove, reorder, validate, interpret, canonicalize, or default Risk Relevance source versions.

## Internal Model Contract

No Internal Model file change is authorized for Wave 1 implementation.

The existing Internal Model must continue to:

- preserve source-bound `riskRelevanceEntries`,
- classify supported source versions as `VERSION_SUPPORTED`,
- classify missing versions as `UNKNOWN_VERSION`,
- classify unsupported versions as `VERSION_UNSUPPORTED`,
- avoid concern categories, public fields, scores, priorities, red flags, recommendations, and decisions.

## Interpretation Contract

No Interpretation Model file change is authorized for Wave 1 implementation.

The existing Interpretation Model must continue to:

- consume only preserved `riskRelevanceEntries`,
- interpret `LEGACY_SUPPORTED + VERSION_SUPPORTED` internally,
- never interpret `UNKNOWN_VERSION`,
- never treat raw provider `riskRelevance` as a concern source,
- produce only internal audit-visible `riskRelevanceInterpretations`.

## Public Contract Boundary

Wave 1 has no public API or public contract impact.

Forbidden public behavior:

- no public `riskRelevanceVersion` top-level field,
- no UI display,
- no report rendering,
- no export inclusion,
- no API exposure,
- no persistence migration,
- no public Building Risk Score field,
- no public risk class or public summary change.

## Score Priority Severity Boundary

Risk Relevance remains non-numeric and internal.

Wave 1 must not create or influence:

- score,
- formula,
- weight,
- priority,
- review priority,
- severity,
- criticality,
- red flag,
- blocking status,
- recommendation,
- decision,
- diagnosis,
- valuation,
- CAPEX,
- RUL,
- acquisition advice,
- safety or compliance conclusion.

## Provider-Specific Test Architecture

Each selected provider test must be extended to prove:

- every emitted hypothesis with `riskRelevance` also carries `riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION`,
- existing `riskRelevance` values remain lowercase legacy values,
- empty and irrelevant provider outputs remain without version metadata,
- existing deterministic ordering and input immutability remain intact,
- no score, priority, severity, criticality, diagnosis, decision, recommendation, compliance mandate, or safety conclusion is introduced.

Each selected integration test must be extended to prove:

- Expert Reasoning primary and alternative hypotheses preserve `riskRelevanceVersion`,
- public top-level contract keys remain unchanged,
- router ordering and first-success behavior remain unchanged,
- Internal Model entries for selected provider output classify as `VERSION_SUPPORTED`,
- Interpretation Model entries can reach internal `INTERPRETED` state for `LEGACY_SUPPORTED + VERSION_SUPPORTED`,
- Risk Relevance interpretation creates no concern category, score, priority, severity, red flag, recommendation, decision, public output, safety conclusion, or compliance conclusion.

## Regression Architecture

Required future regression tests:

- Structural Systems remains versioned and unchanged.
- Concrete Corrosion and Basement Waterproofing remain unversioned in Wave 1.
- All non-selected providers remain `UNKNOWN_VERSION` when their source output has no version.
- Shared mapper missing-version and unsupported-version behavior remains unchanged.
- Router precedence remains unchanged for overlaps involving selected providers.
- Full JavaScript suite passes.

## Allowed Future Implementation Files

Allowed files for the future Wave 1 implementation sprint:

```text
portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js
portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js
portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js
tests/balconies-terraces-knowledge-provider-test.js
tests/balconies-terraces-reasoning-integration-test.js
tests/drainage-rainwater-knowledge-provider-test.js
tests/drainage-rainwater-reasoning-integration-test.js
tests/fire-protection-systems-knowledge-provider-test.js
tests/fire-protection-systems-reasoning-integration-test.js
```

Risk-layer tests may be executed but must not be changed unless a later sprint gate explicitly expands scope.

## Forbidden Future Implementation Files

Forbidden files for the future Wave 1 implementation sprint:

```text
portal/core/risk/RiskRelevanceGovernanceRegistry.js
portal/core/risk/BuildingRiskInternalModel.js
portal/core/risk/BuildingRiskInterpretationModel.js
portal/core/reasoning/KnowledgeReasoningMapper.js
portal/core/ExpertReasoningEngine.js
portal/core/reasoning/KnowledgeDomainRouter.js
portal/core/reasoning/adapters/*
portal/core/reasoning/ExpertIntelligenceReasoningRenderer.js
all non-selected provider files
all non-selected provider tests
UI files
report files
export files
API files
persistence files
score implementation files
public-contract implementation files
existing architecture documents
```

## Implementation Sprint Sequence

Recommended sequence:

```text
Foundation 1.5 Sprint I-3W
Provider Migration Wave 1 Implementation
```

Scope:

- Migrate exactly the three selected providers.
- Add source-owned `riskRelevanceVersion` in selected providers only.
- Update selected provider and integration tests only.
- No mapper, engine, router, risk core, public, UI, report, export, API, persistence, score, or documentation change.
- No commit before independent review.

```text
Foundation 1.5 Sprint I-3X
Provider Migration Wave 1 Implementation Review
```

Scope:

- Independent review of I-3W implementation.
- Verify source ownership, mapper transport, selected-only scope, no public or score effects, router behavior, Internal Model state, Interpretation Model state, and full suite.
- No productive implementation change except a review document if required by the sprint gate.

```text
Foundation 1.5 Sprint I-3Y
Provider Migration Wave 1 Commit Gate
```

Scope:

- Commit only after I-3X approval.
- Commit exactly approved implementation, test, architecture, and review files.
- No tag or push unless separately authorized.

## Review Requirements

The Wave 1 review must verify:

- only selected providers emit new source versions,
- selected provider values remain legacy lowercase values,
- no unselected provider emits `riskRelevanceVersion`,
- shared mapper behavior is unchanged and source-owned transport works,
- Engine and Router behavior are unchanged,
- Internal Model entries for selected providers classify as `VERSION_SUPPORTED`,
- unselected providers remain `UNKNOWN_VERSION`,
- Interpretation Model produces only internal audit-visible Risk Relevance interpretation,
- public top-level contract keys remain unchanged,
- no score, priority, severity, red flag, recommendation, decision, diagnosis, safety, compliance, valuation, CAPEX, RUL, acquisition, UI, report, export, API, or persistence behavior is introduced,
- focused tests and full suite pass.

## Commit Gate Requirements

The Wave 1 commit gate must verify:

- correct branch and expected HEAD lineage,
- no unrelated working tree changes,
- exact changed-file list matches approved scope,
- no staged diff before gate staging,
- `git diff --check` passes,
- focused selected provider tests pass,
- focused selected integration tests pass,
- Risk Relevance Registry, Internal Model, Interpretation Model, Engine, Router, and Structural reference tests pass,
- complete `tests/*.js` loop passes,
- forbidden-token scan passes,
- EOF checks pass,
- commit message is fixed by the gate,
- no tag or push unless separately authorized.

## Risks

Known risks:

- Adding supported source versions activates internal Risk Relevance interpretation for selected provider-origin entries.
- Balconies Terraces and Drainage Rainwater have overlap-heavy router behavior.
- Fire Protection Systems has safety and compliance wording that must remain cautious, non-public, and non-mandatory.
- Mixed migrated and unversioned provider states are expected during staged migration.
- Custom-path providers remain unversioned and require later provider-specific architecture.
- Mapper JSON clone edge behavior around `undefined` remains known and non-blocking because Wave 1 emits exact supported strings.

Risk controls:

- Maximum three providers.
- Shared mapper path only.
- Provider source version only.
- No mapper or engine changes.
- Selected-only tests plus risk-layer and router regression tests.
- Independent review before commit.

## Non-Goals

Wave 1 readiness and future implementation must not:

- migrate provider values to canonical uppercase values,
- migrate Concrete Corrosion or Basement Waterproofing,
- migrate adapter/coordinator/renderer providers,
- migrate custom engine providers,
- change mapper behavior,
- change engine behavior,
- change router behavior,
- change Registry behavior,
- change Internal Model behavior,
- change Interpretation Model behavior,
- change public contracts,
- expose Risk Relevance in UI, reports, exports, APIs, or persistence,
- create score, weighting, formulas, priority, severity, criticality, red flags, recommendations, decisions, diagnoses, valuation effects, CAPEX effects, RUL effects, acquisition advice, safety conclusions, or compliance conclusions.

## Readiness Decision

Readiness decision:

```text
READY FOR PROVIDER MIGRATION WAVE 1 IMPLEMENTATION
```

Reason:

- The Structural Systems reference migration is complete, reviewed, committed, tagged, pushed, and remote-verified.
- The repository baseline is clean and synchronized.
- Focused baseline tests and complete JavaScript suite pass.
- A safe homogeneous group of three providers exists after excluding custom transport paths.
- The selected providers use the already approved shared mapper path and require no mapper, engine, router, Registry, Internal Model, Interpretation Model, public, score, UI, report, export, API, or persistence changes.
- The allowed and forbidden file scopes are defined.
- Provider-specific and regression test architecture is defined.

Final I-3V status:

```text
FOUNDATION 1.5 SPRINT I-3V ARCHITECTURE READINESS COMPLETE
READY FOR I-3W PROVIDER MIGRATION WAVE 1 IMPLEMENTATION
NOT READY FOR CUSTOM-PATH PROVIDER MIGRATION
NOT READY FOR MASS PROVIDER MIGRATION
NOT READY FOR CANONICAL PROVIDER VALUE MIGRATION
NOT READY FOR PUBLIC CONSUMER INTEGRATION
NO COMMIT AUTHORIZED BY THIS DOCUMENT
```
