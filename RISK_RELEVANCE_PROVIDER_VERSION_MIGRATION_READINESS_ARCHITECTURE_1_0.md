# Risk Relevance Provider Version Migration Readiness Architecture 1.0

## Document Purpose

This document defines the binding architecture and implementation readiness for a later migration of existing Knowledge Providers from unversioned legacy `riskRelevance` source values to versioned, governance-compatible Risk Relevance source elements.

This is Foundation 1.5 Sprint I-3R architecture readiness only.

This document does not implement provider changes, mapper changes, engine changes, router changes, Internal Model changes, Interpretation Model changes, tests, public contracts, UI, reports, export behavior, score behavior, staging, commit, tag, or push.

The only file created by this sprint is:

```text
RISK_RELEVANCE_PROVIDER_VERSION_MIGRATION_READINESS_ARCHITECTURE_1_0.md
```

## Repository Baseline

Repository gate for this sprint was refreshed before this document was created.

```text
Branch: foundation-release-1.0
HEAD: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Origin branch: 28d67adbe1d0777428ce4c2f4a6cf57db2912b83
Tag on HEAD: foundation-1.5-risk-relevance-interpretation-1.0-2026-07-20
Initial untracked file before this document: FOUNDATION_1_5_NEXT_ARCHITECTURE_MILESTONE_DECISION_1_0.md
Staged diff: empty
Whitespace check: passed
```

The prior I-3Q decision selected this sprint as:

```text
FOUNDATION 1.5 SPRINT I-3R
LEGACY RISK RELEVANCE PROVIDER VERSION MIGRATION READINESS ARCHITECTURE
```

## Completed Risk-Relevance Foundation

The current Foundation 1.5 Risk Relevance baseline is already implemented and reviewed for the registry, Internal Model preservation, and Interpretation Model interpretation boundary.

Completed facts:

- `riskRelevance` is a source-bound, qualitative, internal, non-numeric signal.
- Canonical values are `LOW_RELEVANCE`, `MODERATE_RELEVANCE`, and `HIGH_RELEVANCE`.
- Supported source version is `risk-relevance-1.0`.
- Governance version is `risk-relevance-governance-1.0`.
- Supported legacy values are `low`, `medium`, `moderate`, and `high`.
- Productive provider runtime values currently observed are `low`, `medium`, and `high`.
- `RiskRelevanceGovernanceRegistry.js` classifies values and versions.
- `BuildingRiskInternalModel.js` preserves `riskRelevanceEntries` and already preserves `riskRelevanceVersion` when a source element provides it.
- `BuildingRiskInterpretationModel.js` consumes only preserved `riskRelevanceEntries` for Risk Relevance interpretation.
- Raw `riskRelevance` no longer creates concern categories.
- `UNKNOWN_VERSION` is never interpreted.
- `riskRelevanceInterpretations` is internal, additive, source-bound, frozen, and audit-visible.

## Current Provider Landscape

The current repository contains fifteen productive Knowledge Providers that emit hypothesis-level `riskRelevance` source values.

No productive Knowledge Provider currently emits `riskRelevanceVersion`.

No productive provider, mapper, engine adapter, reasoning coordinator, or renderer currently transports `riskRelevanceVersion` from provider output into an Expert Reasoning Contract.

Risk Relevance source entries originating from current providers therefore classify as:

```text
valueState: LEGACY_SUPPORTED
versionState: UNKNOWN_VERSION
interpretationState: NOT_INTERPRETED
```

That state is intentional and must remain true until a provider source element explicitly emits the supported source version and the transport path preserves it.

## Provider Inventory

Current Risk-Relevance-emitting provider inventory:

| # | Provider | Domain ID | File | Current values | Version field present |
| ---: | --- | --- | --- | --- | --- |
| 1 | Structural Systems | `structural-systems` | `portal/core/knowledge/StructuralSystemsKnowledgeProvider.js` | `high` | No |
| 2 | Concrete Corrosion | `concrete-corrosion` | `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` | `medium`, `high` | No |
| 3 | Basement Waterproofing | `basement-waterproofing` | `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` | `medium`, `high` | No |
| 4 | Balconies Terraces | `balconies-terraces` | `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` | `medium`, `high` | No |
| 5 | Drainage Rainwater | `drainage-rainwater` | `portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js` | `medium`, `high` | No |
| 6 | Fire Protection Systems | `fire-protection-systems` | `portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js` | `medium`, `high` | No |
| 7 | Vertical Transportation Systems | `vertical-transportation-systems` | `portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js` | `medium`, `high` | No |
| 8 | Sanitary Systems | `sanitary-systems` | `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` | `low`, `medium`, `high` | No |
| 9 | HVAC Systems | `hvac-systems` | `portal/core/knowledge/HvacSystemsKnowledgeProvider.js` | `low`, `medium`, `high` | No |
| 10 | Electrical Systems | `electrical-systems` | `portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js` | `low`, `medium`, `high` | No |
| 11 | Windows Doors | `windows-doors` | `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` | `low`, `medium`, `high` | No |
| 12 | Facade Wall Systems | `facade-wall-systems` | `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` | `low`, `medium`, `high` | No |
| 13 | Roof Envelope | `roof-envelope` | `portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js` | `medium`, `high` | No |
| 14 | Moisture | `moisture` | `portal/core/knowledge/MoistureKnowledgeProvider.js` | `medium`, `high` | No |
| 15 | Crack | `crack` | `portal/core/knowledge/CrackKnowledgeProvider.js` | `low`, `medium`, `high` | No |

No NOT APPLICABLE productive provider was found in the audited provider set. Every listed productive Knowledge Provider emits `riskRelevance` on hypotheses.

## Current Data Flow

Current data flow:

```text
Knowledge Provider hypothesis
-> provider-specific or shared reasoning transport
-> ExpertReasoningContract primaryHypothesis / alternativeHypotheses
-> BuildingRiskInternalModel riskRelevanceEntries
-> BuildingRiskInterpretationModel riskRelevanceInterpretations
```

Current transport surfaces:

- `KnowledgeReasoningMapper.js` maps many providers and currently copies `riskRelevance` only.
- `ElectricalSystemsReasoningCoordinator.js`, `SanitarySystemsReasoningCoordinator.js`, and `WindowsDoorsReasoningCoordinator.js` currently copy `riskRelevance` only.
- `ExpertReasoningEngine.js` contains special direct mapping paths for Moisture, Crack, Concrete Corrosion, and Basement Waterproofing.
- `KnowledgeDomainRouter.js` resolves domains and precedence only.

Current receiving surfaces:

- `BuildingRiskInternalModel.js` already reads `riskRelevanceVersion` from the same hypothesis element as `riskRelevance`.
- `BuildingRiskInterpretationModel.js` already interprets only entries with supported value and supported version state.

## Current Versioning Gap

The blocking gap is not in the Registry, Internal Model, or Interpretation Model.

The gap is source and transport:

1. Providers emit legacy lowercase `riskRelevance` values.
2. Providers do not emit `riskRelevanceVersion` next to `riskRelevance`.
3. Transport paths do not currently preserve `riskRelevanceVersion` into the Expert Reasoning Contract.
4. Internal Model entries therefore receive `UNKNOWN_VERSION` for provider-origin data.
5. Interpretation Model correctly keeps those entries `NOT_INTERPRETED`.

## Source Ownership

`riskRelevanceVersion` is source metadata.

It must belong to the same source element that carries `riskRelevance`, normally a provider hypothesis.

Rules:

- A provider may emit `riskRelevanceVersion` only for the same hypothesis object that emits `riskRelevance`.
- A mapper, reasoning coordinator, renderer, or engine path may transport `riskRelevanceVersion` only when the source hypothesis already has it.
- A mapper, reasoning coordinator, renderer, engine path, router, Internal Model, or Interpretation Model must not invent a missing provider version.
- A contract-level default version is not authorized for I-3S because the current migration is one source element at a time.

## Supported Source Version

The only supported source version for the later phase-1 provider migration is:

```text
risk-relevance-1.0
```

The field name is:

```text
riskRelevanceVersion
```

The supported source version must be emitted exactly as a string value.

Unsupported future strings such as `risk-relevance-2.0`, missing versions, empty strings, `null`, `undefined`, objects, arrays, booleans, and numbers remain non-interpretable through existing Registry behavior.

## Existing Value Compatibility

Provider migration phase 1 must not change provider values.

Phase 1 compatibility target:

```text
riskRelevance: "high"
riskRelevanceVersion: "risk-relevance-1.0"
```

Equivalent phase-1 target for existing `medium` and `low` provider values:

```text
riskRelevance: "medium"
riskRelevanceVersion: "risk-relevance-1.0"

riskRelevance: "low"
riskRelevanceVersion: "risk-relevance-1.0"
```

The Registry already maps those legacy values to canonical values when the supported source version is present:

| Legacy value | Canonical value |
| --- | --- |
| `low` | `LOW_RELEVANCE` |
| `medium` | `MODERATE_RELEVANCE` |
| `moderate` | `MODERATE_RELEVANCE` |
| `high` | `HIGH_RELEVANCE` |

Canonical uppercase provider value migration is explicitly deferred to a later architecture and implementation sequence.

## Migration Location Options

| Option | Location | Assessment | Decision |
| --- | --- | --- | --- |
| A | Provider emits `riskRelevanceVersion` next to `riskRelevance`; transport copies only if present. | Correct source ownership. Activates interpretation only for explicitly migrated source elements. | Accepted target architecture. |
| B | Shared mapper adds default version when `riskRelevance` exists. | Invents source metadata outside provider ownership and makes unversioned sources appear versioned. | Rejected. |
| C | ExpertReasoningEngine adds default version for provider contracts. | Engine would convert legacy source output into governed source output without provider evidence. | Rejected. |
| D | Central provider helper wraps all provider hypotheses with a version. | Could be valid only if invoked inside each provider at the source element, but not needed for the first reference sprint. It risks mass migration by helper rollout. | Deferred, not selected. |
| E | Hybrid provider plus mapper/engine fallback. | Valid only for explicit source transport, invalid if fallback adds missing versions. Too broad for reference sprint. | Rejected for I-3S. |

## Selected Migration Architecture

Selected architecture: Option A.

Later provider migration must be source-direct and transport-only:

```text
Provider source element emits riskRelevanceVersion
Transport layer preserves riskRelevanceVersion if and only if source emitted it
Internal Model classifies preserved version
Interpretation Model interprets only supported value plus supported version
```

For the first implementation sprint, the selected reference path is Structural Systems:

```text
StructuralSystemsKnowledgeProvider.js
-> KnowledgeReasoningMapper.js
-> ExpertReasoningEngine.js first-success output
-> BuildingRiskInternalModel.js
-> BuildingRiskInterpretationModel.js
```

The later implementation must add source version emission in the provider and transport preservation in the mapper. It must not change the Registry, Internal Model, Interpretation Model, Router, public contract, UI, reports, export, score, or persistence.

## Rejected Alternatives

Rejected immediate alternatives:

- Mapper-default migration for all `riskRelevance` fields.
- Engine-default migration for all provider outputs.
- Contract-level source version default.
- Mass provider migration.
- Canonical uppercase provider value migration.
- Risk Relevance consumer integration.
- Building Risk Score integration.
- Public presentation, report, export, API, or persistence exposure.
- Any change that treats high relevance as severity, criticality, priority, score, red flag, recommendation, acquisition advice, valuation effect, CAPEX effect, RUL effect, safety confirmation, or technical diagnosis.

## Provider Migration Matrix

| # | File | Domain ID | Provider name | Current Risk-Relevance value | Possible values | Emission location | Direct or indirect emission | Mapper involvement | Engine involvement | Current versioning status | Current Internal-Model effect | Current Interpretation effect | Required later change | Needed tests | Migration risk | Recommended migration group |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `StructuralSystemsKnowledgeProvider.js` | `structural-systems` | `StructuralSystemsKnowledgeProvider` | `high` | `high` | `h(...)` source entries, `toHypothesis(...)` copies `entry.riskRelevance` | Indirect through provider helper, direct on emitted hypothesis | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Dispatch path `buildStructuralSystemsReasoning(...)`; no version logic | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Add provider source version and mapper transport copy | Provider test, reasoning integration, mapper transport assertion through Internal Model and Interpretation Model | Low-medium; first-success structural precedence already tested | Group 1 reference |
| 2 | `ConcreteCorrosionKnowledgeProvider.js` | `concrete-corrosion` | `ConcreteCorrosionKnowledgeProvider` | `medium`, `high` | `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | Shared mapper in custom mapping path; fallback explicit map copies `riskRelevance` only | Custom `buildConcreteCorrosionReasoning(...)` and `mapConcreteHypothesis(...)` | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper and custom fallback transport | Provider test, reasoning integration, custom fallback transport probe | Medium; custom concrete mapping input and fallback path | Group 2 |
| 3 | `BasementWaterproofingKnowledgeProvider.js` | `basement-waterproofing` | `BasementWaterproofingKnowledgeProvider` | `medium`, `high` | `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | Shared mapper in custom mapping path; fallback explicit map copies `riskRelevance` only | Custom `buildBasementWaterproofingReasoning(...)` and `mapBasementHypothesis(...)` | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper and custom fallback transport | Provider test, reasoning integration, fallback transport probe | Medium; custom cause normalization and mapping wrapper | Group 3 |
| 4 | `BalconiesTerracesKnowledgeProvider.js` | `balconies-terraces` | `BalconiesTerracesKnowledgeProvider` | `medium`, `high` | `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Low-medium; many static entries | Group 4 |
| 5 | `DrainageRainwaterKnowledgeProvider.js` | `drainage-rainwater` | `DrainageRainwaterKnowledgeProvider` | `medium`, `high` | `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Low-medium; large provider and overlap-heavy routing | Group 5 |
| 6 | `FireProtectionSystemsKnowledgeProvider.js` | `fire-protection-systems` | `FireProtectionSystemsKnowledgeProvider` | `medium`, `high` | `medium`, `high` | `h(...)` source entries, `toHypothesis(...)` copies `entry.riskRelevance` | Indirect through provider helper | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Medium; life-safety wording must remain non-priority and non-certifying | Group 6 |
| 7 | `VerticalTransportationSystemsKnowledgeProvider.js` | `vertical-transportation-systems` | `VerticalTransportationSystemsKnowledgeProvider` | `medium`, `high` | `medium`, `high` | `h(...)` source entries, `toHypothesis(...)` copies `entry.riskRelevance` | Indirect through provider helper | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Low-medium; specialized domain, stable tests | Group 7 |
| 8 | `SanitarySystemsKnowledgeProvider.js` | `sanitary-systems` | `SanitarySystemsKnowledgeProvider` | `low`, `medium`, `high` | `low`, `medium`, `high` | `h(...)` source entries, `toHypothesis(...)` copies `entry.riskRelevance` | Indirect through provider helper | `SanitarySystemsReasoningCoordinator` currently copies `riskRelevance` only | Adapter plus coordinator plus renderer dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus coordinator/renderer transport preservation if needed | Provider, coordinator/integration, language rendering parity tests | Medium; adapter/rendering path must not lose version | Group 8 |
| 9 | `HvacSystemsKnowledgeProvider.js` | `hvac-systems` | `HvacSystemsKnowledgeProvider` | `low`, `medium`, `high` | `low`, `medium`, `high` | `h(...)` source entries, `toHypothesis(...)` copies `entry.riskRelevance` | Indirect through provider helper | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Low-medium; broad provider but normal mapper path | Group 9 |
| 10 | `ElectricalSystemsKnowledgeProvider.js` | `electrical-systems` | `ElectricalSystemsKnowledgeProvider` | `low`, `medium`, `high` | `low`, `medium`, `high` | `h(...)` source entries, `toHypothesis(...)` copies `entry.riskRelevance` | Indirect through provider helper | `ElectricalSystemsReasoningCoordinator` currently copies `riskRelevance` only | Adapter plus coordinator plus renderer dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus coordinator/renderer transport preservation if needed | Provider, coordinator/integration, language rendering parity tests | Medium; adapter/rendering path must not lose version | Group 10 |
| 11 | `WindowsDoorsKnowledgeProvider.js` | `windows-doors` | `WindowsDoorsKnowledgeProvider` | `low`, `medium`, `high` | `low`, `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | `WindowsDoorsReasoningCoordinator` currently copies `riskRelevance` only | Adapter plus coordinator plus renderer dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus coordinator/renderer transport preservation if needed | Provider, integration, German/English parity tests | Medium; bilingual adapter/rendering path | Group 11 |
| 12 | `FacadeWallSystemsKnowledgeProvider.js` | `facade-wall-systems` | `FacadeWallSystemsKnowledgeProvider` | `low`, `medium`, `high` | `low`, `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Low-medium; facade/crack/moisture overlaps | Group 12 |
| 13 | `RoofEnvelopeKnowledgeProvider.js` | `roof-envelope` | `RoofEnvelopeKnowledgeProvider` | `medium`, `high` | `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | `KnowledgeReasoningMapper` currently copies `riskRelevance` only | Normal mapper dispatch | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus mapper transport copy | Provider and integration tests | Low-medium; roof/moisture/drainage overlap tests needed | Group 13 |
| 14 | `MoistureKnowledgeProvider.js` | `moisture` | `MoistureKnowledgeProvider` | `medium`, `high` | `medium`, `high` | Static hypothesis entries and `item.riskRelevance` copy | Mixed static plus provider output copy | No shared mapper; engine currently clones provider hypotheses | Custom `buildMoistureReasoning(...)` clones primary and alternatives | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version; engine clone path should preserve automatically but must be tested | Provider, integration, Internal Model transport test | Low-medium; custom engine path but clone preserves fields | Group 14 |
| 15 | `CrackKnowledgeProvider.js` | `crack` | `CrackKnowledgeProvider` | `low`, `medium`, `high` | `low`, `medium`, `high` | Static hypothesis entries and `entry.riskRelevance` copy | Mixed static plus helper output | No shared mapper; engine explicit map copies `riskRelevance` only | Custom `mapCrackHypothesis(...)` | Unversioned legacy | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | `NOT_INTERPRETED` | Provider source version plus custom engine map transport copy | Provider, integration, structuralRelevance separation tests | Medium-high; structural overlap and separate `structuralRelevance` scale | Group 15 |

## Migration Groups

Binding phase-1 migration order:

1. Structural Systems.
2. Concrete Corrosion.
3. Basement Waterproofing.
4. Balconies Terraces.
5. Drainage Rainwater.
6. Fire Protection Systems.
7. Vertical Transportation Systems.
8. Sanitary Systems.
9. HVAC Systems.
10. Electrical Systems.
11. Windows Doors.
12. Facade Wall Systems.
13. Roof Envelope.
14. Moisture.
15. Crack.

This order is migration governance only. It is not relevance priority, risk priority, score priority, review priority, domain superiority, or public-contract order.

## Selected Reference Provider

Selected reference provider for the later implementation sprint:

```text
Structural Systems
```

Selected reference provider file:

```text
portal/core/knowledge/StructuralSystemsKnowledgeProvider.js
```

Selected reference transport file:

```text
portal/core/reasoning/KnowledgeReasoningMapper.js
```

Selected reference tests for later I-3S:

```text
tests/structural-systems-knowledge-provider-test.js
tests/structural-systems-reasoning-integration-test.js
tests/building-risk-internal-model-test.js, only if a new source-to-entry integration fixture is required
tests/building-risk-interpretation-model-test.js, only if a new end-to-end supported-version fixture is required
```

## Reference Provider Rationale

Structural Systems is selected because:

- It is first in current router precedence and first in the approved migration order.
- It has a clear provider-local helper shape: `h(...)` source entries and `toHypothesis(...)` emitted hypotheses.
- Current provider runtime `riskRelevance` value is a single legacy value: `high`.
- Dedicated provider tests exist.
- Dedicated reasoning integration tests exist.
- Existing integration tests already prove first-success behavior against Crack, Concrete Corrosion, and Basement Waterproofing overlaps.
- The provider is fachlich important but still narrow enough for a single-reference migration.
- It exercises the common shared mapper transport problem without involving bilingual adapters or multiple custom fallback mappers.

Reference-provider risk:

- Structural domain language can be confused with safety, load-capacity, or review-priority language. Later implementation tests must prove that adding the source version creates only Risk Relevance interpretation eligibility and no safety, diagnosis, score, priority, red flag, recommendation, or public result.

## Required Implementation Files

Sprint I-3R itself has no implementation files.

For later Sprint I-3S, the expected allowed implementation files are limited to:

```text
portal/core/knowledge/StructuralSystemsKnowledgeProvider.js
portal/core/reasoning/KnowledgeReasoningMapper.js
tests/structural-systems-knowledge-provider-test.js
tests/structural-systems-reasoning-integration-test.js
```

Risk-layer tests may be touched in I-3S only if the implementation adds a narrowly scoped end-to-end fixture proving provider-origin `VERSION_SUPPORTED` behavior through the already implemented Internal Model and Interpretation Model. Such a touch is optional and requires explicit review approval.

## Forbidden Implementation Files

Sprint I-3R forbids changing every file except this document.

Later Sprint I-3S must still forbid:

```text
portal/core/risk/RiskRelevanceGovernanceRegistry.js
portal/core/risk/BuildingRiskInternalModel.js
portal/core/risk/BuildingRiskInterpretationModel.js
portal/core/reasoning/KnowledgeDomainRouter.js
portal/core/ExpertReasoningEngine.js, unless a selected provider requires a custom engine transport path in a later non-Structural migration
UI files
report files
export files
score implementation files
public-contract implementation files
API files
persistence files
all non-selected provider files
all non-selected provider tests
existing architecture documents
```

## Mapper Contract

The mapper contract for provider version migration is transport-only.

Allowed mapper behavior in later I-3S:

- Copy `riskRelevanceVersion` from a source hypothesis to the mapped hypothesis only when the source hypothesis has its own version field.
- Preserve `riskRelevance` exactly as before.
- Preserve existing Expert Reasoning Contract top-level keys.
- Avoid defaults, inference, normalization, classification, interpretation, or validation.

Forbidden mapper behavior:

- Add `riskRelevanceVersion` when the provider did not emit it.
- Use provider class, domain ID, router order, keyword score, `riskRelevance` value, confidence, completeness, evidence count, or language to choose a source version.
- Import the Risk Relevance Governance Registry.
- Convert legacy lowercase values to canonical uppercase values.

## Expert Reasoning Engine Contract

The Expert Reasoning Engine remains a first-success dispatcher and public contract producer.

For Structural Systems I-3S:

- No engine change is required because Structural Systems reaches the public contract through `KnowledgeReasoningMapper`.
- Engine dispatch, first-success behavior, legacy fallback, language handling, and public top-level contract keys must remain unchanged.

For later non-Structural migrations:

- Engine custom mapping paths may be touched only when the selected provider's current engine path would otherwise drop a source-emitted `riskRelevanceVersion`.
- Any such change must be transport-only and provider-specific.

## Internal Model Contract

The Internal Model is already ready for provider-version migration.

Binding behavior:

- It reads `riskRelevanceVersion` from the same hypothesis source element as `riskRelevance`.
- It preserves raw value and raw version.
- It classifies supported version as `VERSION_SUPPORTED`.
- It classifies missing version as `UNKNOWN_VERSION`.
- It must not invent source versions.
- It must not create concern categories, scores, public fields, priority, red flags, recommendations, or decisions.

No Internal Model implementation change is authorized by I-3R or expected for Structural Systems I-3S.

## Interpretation Contract

The Interpretation Model is already ready for provider-version migration.

Binding behavior:

- It consumes only `domainAssessment.riskRelevanceEntries`.
- It interprets `CANONICAL + VERSION_SUPPORTED`.
- It interprets `LEGACY_SUPPORTED + VERSION_SUPPORTED`.
- It does not interpret `UNKNOWN_VERSION`.
- It does not interpret unsupported versions.
- It does not read raw provider `riskRelevance` as a concern source.
- It emits `riskRelevanceInterpretations` only as internal audit-visible interpretation material.

No Interpretation Model implementation change is authorized by I-3R or expected for Structural Systems I-3S.

## Router and First-Success Boundary

Router and first-success behavior must remain unchanged.

Current Structural Systems baseline:

- `KnowledgeDomainRouter.js` includes `structural-systems` as the first `DOMAIN_PRECEDENCE` entry.
- `ExpertReasoningEngine.js` dispatches `structural-systems` through `buildStructuralSystemsReasoning(...)`.
- Current tests prove Structural Systems first-success behavior against Crack, Concrete Corrosion, and Basement Waterproofing overlaps.

Provider version migration must not change routing predicates, domain precedence, first-success behavior, candidate-domain exposure, aggregation behavior, fallback behavior, or public contract shape.

## Legacy Compatibility

Legacy compatibility for phase 1 is mandatory.

Rules:

- Existing provider `riskRelevance` values remain lowercase legacy values.
- Existing `riskRelevance` string assertions remain valid and should be extended, not replaced, by version assertions.
- Existing provider matching, ranking, first-success behavior, confidence behavior, and public contract keys must remain valid.
- Existing unselected providers remain unversioned and therefore continue to produce `UNKNOWN_VERSION` entries.
- A migrated provider may become interpretable only because it explicitly emits the supported source version and the transport path preserves it.

## Historical Data Boundary

Historical or existing persisted Expert Reasoning Contracts without `riskRelevanceVersion` remain unversioned.

They must continue to classify as `UNKNOWN_VERSION` and remain `NOT_INTERPRETED` for Risk Relevance interpretation.

No batch migration, historical replay, persistence mutation, defaulting, or backfill is authorized.

## Public Contract Impact

Expected public contract impact for I-3R:

```text
None.
```

Expected public contract impact for Structural Systems I-3S:

```text
No new public top-level contract field.
Additive source-element metadata may appear only inside mapped hypotheses if approved by review.
No UI, report, export, score, API, persistence, public Building Risk Score, review priority, safety, valuation, CAPEX, RUL, acquisition, recommendation, or decision output.
```

The later version field is source metadata for internal governance and must not be marketed or rendered as a public result.

## Test Architecture

I-3R baseline tests executed:

```text
node tests/risk-relevance-governance-registry-test.js
node tests/building-risk-internal-model-test.js
node tests/building-risk-interpretation-model-test.js
node tests/structural-systems-knowledge-provider-test.js
node tests/structural-systems-reasoning-integration-test.js
node tests/expert-reasoning-engine-test.js
node tests/knowledge-domain-router-test.js
for test_file in tests/*.js; do node "$test_file" >/dev/null || exit 1; done
```

I-3R baseline result:

```text
RiskRelevanceGovernanceRegistry tests completed successfully. Passed: 27
BuildingRiskInternalModel tests completed successfully.
BuildingRiskInterpretationModel tests completed successfully.
StructuralSystemsKnowledgeProvider tests completed successfully.
StructuralSystems reasoning integration tests completed successfully.
ExpertReasoningEngine tests completed successfully.
KnowledgeDomainRouter tests completed successfully.
ALL_JS_TESTS_PASSED
```

Required later I-3S test architecture:

- Provider test proves every emitted Structural Systems hypothesis that carries `riskRelevance` also carries `riskRelevanceVersion: "risk-relevance-1.0"`.
- Provider test proves `riskRelevance` values remain legacy lowercase `high` in phase 1.
- Provider test proves no safety, capacity, diagnosis, severity, score, priority, or public result field is introduced.
- Integration test proves mapped `primaryHypothesis` and `alternativeHypotheses` preserve `riskRelevanceVersion`.
- Integration test proves Engine public top-level keys remain unchanged.
- Internal Model or integration probe proves migrated Structural Systems entries classify as `VERSION_SUPPORTED`.
- Interpretation probe proves `LEGACY_SUPPORTED + VERSION_SUPPORTED` can become `INTERPRETED` without creating concern categories.
- Regression tests prove unselected providers remain unversioned unless explicitly migrated.
- Full JavaScript suite must pass.

## Implementation Sprint Sequence

Recommended next sprint sequence:

```text
Foundation 1.5 Sprint I-3S
Reference Provider Version Migration Implementation
```

Scope:

- Migrate exactly one provider: Structural Systems.
- Add `riskRelevanceVersion: "risk-relevance-1.0"` next to existing Structural Systems `riskRelevance` source values.
- Preserve existing `riskRelevance: "high"` values.
- Update `KnowledgeReasoningMapper.js` to transport an own source `riskRelevanceVersion` field without inventing it.
- Update only selected focused tests.
- No mass migration.
- No commit before review.

```text
Foundation 1.5 Sprint I-3T
Reference Provider Version Migration Review
```

Scope:

- Independent review of I-3S implementation.
- Executable provider, mapper, engine, Internal Model, Interpretation Model, and full-suite probes.
- No productive implementation change except a review document if required by the sprint gate.
- No commit before full approval.

```text
Foundation 1.5 Sprint I-3U
Reference Provider Migration Commit Gate
```

Scope:

- Commit only after I-3T approval.
- Commit exactly approved implementation/test/review files.
- No tag or push unless separately authorized.

## Review Requirements

I-3T review must verify:

- Provider source ownership is preserved.
- `riskRelevanceVersion` is emitted by the selected provider source element.
- Mapper copies only source-present `riskRelevanceVersion`.
- Mapper does not import Registry and does not invent versions.
- Existing `riskRelevance` values remain unchanged.
- No unselected provider receives `riskRelevanceVersion`.
- Structural Systems routing and first-success tests remain valid.
- Internal Model receives `VERSION_SUPPORTED` only for the migrated provider path.
- Interpretation Model produces internal Risk Relevance interpretation without concern-category, score, priority, public, red flag, recommendation, decision, valuation, CAPEX, RUL, acquisition, or safety effects.
- Full JavaScript suite passes.

## Commit Gate Requirements

I-3U commit gate must verify:

- Correct branch and expected HEAD lineage.
- No unrelated working tree changes.
- Exact changed-file list matches approved I-3S/I-3T scope.
- No staged diff before gate staging.
- `git diff --check` passes.
- Focused provider, integration, Risk Relevance, Internal Model, Interpretation Model, Engine, and Router tests pass as required.
- Complete `tests/*.js` loop passes.
- No forbidden public, score, UI, report, export, API, persistence, debug artifact, sensitive-token, or unfinished-marker tokens are introduced.
- Commit message is fixed by the gate.
- No tag or push unless separately authorized.

## Risks

Known risks:

- Adding supported source versions activates interpretation for migrated provider-origin entries.
- Mapper or coordinator paths can accidentally drop the new version field.
- Mapper or engine defaulting would violate source ownership.
- Structural Systems language can be mistaken for safety, load capacity, priority, or diagnosis.
- Some later providers use custom engine or adapter paths and require provider-specific transport review.
- Provider canonical uppercase value migration remains separate and must not be mixed into phase 1.
- Unselected providers remain `UNKNOWN_VERSION`; mixed interpreted and non-interpreted provider states are expected during staged migration.

Risk controls:

- Single reference provider only.
- Provider-direct version field only.
- Transport-only mapper change only where source field exists.
- Existing Risk-layer receiving code unchanged.
- Focused executable tests plus full suite.
- Independent review before commit.

## Non-Goals

This sprint and the later reference implementation must not:

- migrate more than one provider,
- migrate provider values to canonical uppercase values,
- add mapper or engine default versions,
- change Registry behavior,
- change Internal Model behavior,
- change Interpretation Model behavior,
- change router precedence,
- change first-success behavior,
- change public contract top-level keys,
- add Building Risk Score behavior,
- expose Risk Relevance in UI, reports, exports, APIs, or persistence,
- create review priority,
- create severity, criticality, score, red flag, recommendation, decision, diagnosis, valuation, CAPEX, RUL, acquisition, or safety behavior,
- alter `riskCategory` or `riskConcern` legacy concern surfaces.

## Readiness Decision

Readiness decision:

```text
READY FOR SINGLE REFERENCE PROVIDER VERSION MIGRATION IMPLEMENTATION
```

Reason:

- The Registry already supports the source version.
- The Internal Model already preserves source-element versions.
- The Interpretation Model already interprets only supported value plus supported version entries.
- The current repository baseline and tests are green.
- The provider landscape, transport paths, migration order, selected reference provider, required files, forbidden files, and review gates are defined.
- The selected next implementation can be kept to a single provider plus transport-only mapper preservation.

Final I-3R status:

```text
FOUNDATION 1.5 SPRINT I-3R ARCHITECTURE READINESS COMPLETE
READY FOR I-3S REFERENCE PROVIDER VERSION MIGRATION IMPLEMENTATION
NOT READY FOR MASS PROVIDER MIGRATION
NOT READY FOR CANONICAL PROVIDER VALUE MIGRATION
NOT READY FOR PUBLIC CONSUMER INTEGRATION
NO COMMIT AUTHORIZED BY THIS DOCUMENT
```
