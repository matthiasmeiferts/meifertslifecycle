# Risk Relevance Remaining Provider Finalization Architecture 1.0

## Document Purpose

This document defines the binding finalization architecture for the complete Risk-Relevance source-version migration of all remaining productive Knowledge Providers after the completed Structural Systems reference migration and the completed Wave 1 provider migration.

This is Foundation 1.5 Sprint I-4A architecture only.

This document does not implement provider changes, mapper changes, coordinator changes, adapter changes, renderer changes, engine changes, router changes, Internal Model changes, Interpretation Model changes, tests, public contracts, UI, reports, export behavior, score behavior, staging, commit, tag, push, reset, restore, checkout, stash, clean, rebase, or merge.

The only file created by this sprint is:

```text
RISK_RELEVANCE_REMAINING_PROVIDER_FINALIZATION_ARCHITECTURE_1_0.md
```

## Repository Baseline

Repository gate at sprint start:

```text
Branch: foundation-release-1.0
HEAD: 85ed4f443ef88e32971f9174b237cdfc7451be68
Origin branch: 85ed4f443ef88e32971f9174b237cdfc7451be68
Tag on HEAD: foundation-1.5-risk-relevance-provider-wave-1-1.0-2026-07-20
Remote annotated tag object: 75718554f600b67ccac77cae05176c5f4141cfee
Remote dereferenced tag target: 85ed4f443ef88e32971f9174b237cdfc7451be68
Initial working tree: clean
Initial staged diff: empty
Initial whitespace check: passed
```

Repository source inventory was derived from the productive provider files under `portal/core/knowledge`, the Engine dispatcher, the Router, the shared mapper, the risk governance models, and the adapter/coordinator/renderer files under `portal/core/reasoning`.

## Architecture Baseline

The binding architecture remains Option A:

```text
Provider source element emits riskRelevanceVersion
Transport layer preserves riskRelevanceVersion if and only if source emitted it
Internal Model classifies preserved value and version
Interpretation Model interprets only supported value plus supported version
```

The supported source version is:

```text
risk-relevance-1.0
```

The governance version is:

```text
risk-relevance-governance-1.0
```

Canonical values remain `LOW_RELEVANCE`, `MODERATE_RELEVANCE`, and `HIGH_RELEVANCE`. Existing productive provider source values remain supported legacy lowercase values: `low`, `medium`, `moderate`, and `high`.

No provider value migration to canonical uppercase values is authorized by this finalization architecture.

## Current Migration State

Current productive source-version state:

```text
Productive providers: 15
Providers with riskRelevance: 15
Versioned providers: 4
Unversioned providers: 11
Providers without riskRelevance: 0
```

Completed versioned providers:

- Structural Systems.
- Balconies Terraces.
- Drainage Rainwater.
- Fire Protection Systems.

Remaining unversioned providers:

- Basement Waterproofing.
- Concrete Corrosion.
- Crack.
- Electrical Systems.
- Facade Wall Systems.
- HVAC Systems.
- Moisture.
- Roof Envelope.
- Sanitary Systems.
- Vertical Transportation Systems.
- Windows Doors.

## Complete Provider Inventory

| # | Provider | Domain ID | Productive provider file | Engine entrypoint | Router mapping | Emits `riskRelevance` | Emits `riskRelevanceVersion` | Provider tests | Integration tests | Migration state |
| ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Balconies Terraces | `balconies-terraces` | `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` | `buildBalconiesTerracesReasoning` | Present | Yes | Yes | Present | Present | Complete |
| 2 | Basement Waterproofing | `basement-waterproofing` | `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` | `buildBasementWaterproofingReasoning` | Present | Yes | No | Present | Present | Required |
| 3 | Concrete Corrosion | `concrete-corrosion` | `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` | `buildConcreteCorrosionReasoning` | Present | Yes | No | Present | Present | Required |
| 4 | Crack | `crack` | `portal/core/knowledge/CrackKnowledgeProvider.js` | `buildCrackReasoning` | Present | Yes | No | Present | Present | Required |
| 5 | Drainage Rainwater | `drainage-rainwater` | `portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js` | `buildDrainageRainwaterReasoning` | Present | Yes | Yes | Present | Present | Complete |
| 6 | Electrical Systems | `electrical-systems` | `portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js` | `buildElectricalSystemsReasoning` | Present | Yes | No | Present | Present | Required |
| 7 | Facade Wall Systems | `facade-wall-systems` | `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` | `buildFacadeWallSystemsReasoning` | Present | Yes | No | Present | Present | Required |
| 8 | Fire Protection Systems | `fire-protection-systems` | `portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js` | `buildFireProtectionSystemsReasoning` | Present | Yes | Yes | Present | Present | Complete |
| 9 | HVAC Systems | `hvac-systems` | `portal/core/knowledge/HvacSystemsKnowledgeProvider.js` | `buildHvacSystemsReasoning` | Present | Yes | No | Present | Present | Required |
| 10 | Moisture | `moisture` | `portal/core/knowledge/MoistureKnowledgeProvider.js` | `buildMoistureReasoning` | Present | Yes | No | Present | Present | Required |
| 11 | Roof Envelope | `roof-envelope` | `portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js` | `buildRoofEnvelopeReasoning` | Present | Yes | No | Present | Present | Required |
| 12 | Sanitary Systems | `sanitary-systems` | `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` | `buildSanitarySystemsReasoning` | Present | Yes | No | Present | Present | Required |
| 13 | Structural Systems | `structural-systems` | `portal/core/knowledge/StructuralSystemsKnowledgeProvider.js` | `buildStructuralSystemsReasoning` | Present | Yes | Yes | Present | Present | Complete |
| 14 | Vertical Transportation Systems | `vertical-transportation-systems` | `portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js` | `buildVerticalTransportationSystemsReasoning` | Present | Yes | No | Present | Present | Required |
| 15 | Windows Doors | `windows-doors` | `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` | `buildWindowsDoorsReasoning` | Present | Yes | No | Present | Present | Required |

## Versioned Providers

| Provider | Version source | Transport path | Completion basis |
| --- | --- | --- | --- |
| Structural Systems | `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` | Shared `KnowledgeReasoningMapper` | Reference provider migration complete. |
| Balconies Terraces | `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` | Shared `KnowledgeReasoningMapper` | Wave 1 migration complete. |
| Drainage Rainwater | `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` | Shared `KnowledgeReasoningMapper` | Wave 1 migration complete. |
| Fire Protection Systems | `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` | Shared `KnowledgeReasoningMapper` | Wave 1 migration complete. |

## Unversioned Providers

| Provider | Domain ID | Transport class | Migration requirement |
| --- | --- | --- | --- |
| Vertical Transportation Systems | `vertical-transportation-systems` | Shared mapper | Add provider source version and extend tests. |
| HVAC Systems | `hvac-systems` | Shared mapper | Add provider source version and extend tests. |
| Facade Wall Systems | `facade-wall-systems` | Shared mapper | Add provider source version and extend tests. |
| Roof Envelope | `roof-envelope` | Shared mapper | Add provider source version and extend tests. |
| Concrete Corrosion | `concrete-corrosion` | Shared mapper plus custom Engine fallback | Add provider source version and preserve it in fallback. |
| Basement Waterproofing | `basement-waterproofing` | Shared mapper plus custom Engine fallback | Add provider source version and preserve it in fallback. |
| Electrical Systems | `electrical-systems` | Adapter plus Coordinator plus Renderer | Add provider source version and preserve it in Coordinator fallback. |
| Sanitary Systems | `sanitary-systems` | Adapter plus Coordinator plus Renderer | Add provider source version and preserve it in Coordinator fallback. |
| Windows Doors | `windows-doors` | Adapter plus Coordinator plus Renderer | Add provider source version and preserve it in Coordinator fallback. |
| Moisture | `moisture` | Custom Engine clone path | Add provider source version and verify clone preservation. |
| Crack | `crack` | Custom Engine map path | Add provider source version and preserve it in custom map. |

## Providers Without Risk Relevance

None found in the productive Knowledge Provider inventory.

## Transport Path Inventory

| Transport path | Providers | Source-version state | Architecture finding |
| --- | --- | --- | --- |
| Shared `KnowledgeReasoningMapper` only | Structural Systems, Balconies Terraces, Drainage Rainwater, Fire Protection Systems, Vertical Transportation Systems, HVAC Systems, Facade Wall Systems, Roof Envelope | Four complete, four remaining | Existing mapper preserves own `riskRelevanceVersion`; remaining providers can migrate without shared transport changes. |
| Shared mapper plus Engine fallback | Concrete Corrosion, Basement Waterproofing | Remaining | Shared mapper subpath preserves versions, but fallback objects currently copy `riskRelevance` only. |
| Adapter plus Coordinator plus Renderer | Electrical Systems, Sanitary Systems, Windows Doors | Remaining | Coordinator fallback objects currently copy `riskRelevance` only; renderer JSON clone preserves string fields after fallback is repaired. |
| Custom Engine clone path | Moisture | Remaining | Engine uses `cloneValue` for primary and alternatives; string versions are expected to be preserved but require focused tests. |
| Custom Engine map path | Crack | Remaining | `mapCrackHypothesis` currently copies `riskRelevance` only and must preserve source version explicitly. |

## Shared Mapper Providers

Shared mapper providers are providers whose Engine entrypoint sends provider knowledge directly through `KnowledgeReasoningMapper.map(...)` without custom fallback reconstruction, adapter coordination, or renderer translation.

Complete shared mapper providers:

- Structural Systems.
- Balconies Terraces.
- Drainage Rainwater.
- Fire Protection Systems.

Remaining shared mapper providers:

- Vertical Transportation Systems.
- HVAC Systems.
- Facade Wall Systems.
- Roof Envelope.

Architecture decision: remaining shared mapper providers are Class A and belong in Wave 2.

## Coordinator Providers

Coordinator providers use a terminology adapter, provider knowledge, a reasoning coordinator, and then the shared renderer:

- Electrical Systems.
- Sanitary Systems.
- Windows Doors.

The coordinator primary path first tries `KnowledgeReasoningMapper.map(...)`. When canonical terminology signals require deterministic fallback ordering and the mapped primary does not match the first canonical signal, each coordinator reconstructs primary and alternative hypotheses with a local `mapHypothesis(...)` function.

Architecture finding: all three coordinator fallback mappers copy `riskRelevance` and omit `riskRelevanceVersion`. These providers require a controlled shared transport repair in the coordinator fallback pattern before or during final migration.

## Adapter Providers

Adapter providers:

- Electrical Systems uses `ElectricalSystemsTerminologyAdapter`.
- Sanitary Systems uses `SanitarySystemsTerminologyAdapter`.
- Windows Doors uses `WindowsDoorsTerminologyAdapter`.

The terminology adapters clone the input and build canonical context. They do not inspect provider hypotheses, do not create `riskRelevance`, do not create `riskRelevanceVersion`, and do not interpret Risk Relevance semantics.

Architecture finding: adapters are not the blocking transport surface. The blocking surface is the coordinator fallback mapper.

## Renderer and Custom Path Providers

Renderer provider group:

- Electrical Systems.
- Sanitary Systems.
- Windows Doors.

The renderer clones the reasoning contract with JSON serialization and then translates selected human-readable fields. It does not explicitly drop `riskRelevanceVersion` from hypothesis objects when the field is a supported string.

Custom Engine path provider group:

- Concrete Corrosion.
- Basement Waterproofing.
- Moisture.
- Crack.

Concrete Corrosion and Basement Waterproofing have mapper-backed subpaths plus fallback objects that omit `riskRelevanceVersion`. Moisture uses direct JSON clone of provider hypotheses. Crack uses a custom mapper that omits `riskRelevanceVersion`.

## Provider Classification Matrix

| Class | Providers | Migration wave | Shared transport change | Reason |
| --- | --- | --- | --- | --- |
| Class A | Vertical Transportation Systems, HVAC Systems, Facade Wall Systems, Roof Envelope | Wave 2 | No | Pure shared mapper path already supports source-owned versions. |
| Class B | Moisture | Final Wave | No shared file change expected | Custom clone path likely preserves string versions; tests must prove it. |
| Class C | Concrete Corrosion, Basement Waterproofing, Crack | Final Wave | Local Engine custom map/fallback repair | Manual Engine maps currently omit source version in fallback/custom paths. |
| Class D | Electrical Systems, Sanitary Systems, Windows Doors | Final Wave | Controlled coordinator fallback repair | Coordinator fallback maps currently omit source version; renderer must be regression-tested. |
| Blocked | None | None | None | No provider is blocked from migration within two implementation waves. |

## Class A Providers

Class A providers are remaining unversioned providers that use only the already approved shared mapper transport path.

Class A provider set:

- Vertical Transportation Systems.
- HVAC Systems.
- Facade Wall Systems.
- Roof Envelope.

Implementation architecture:

1. Import only `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` from the Registry in each provider.
2. Add `riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` next to existing `riskRelevance` on every emitted hypothesis.
3. Preserve all existing lowercase legacy `riskRelevance` values.
4. Extend only the provider and integration tests for the four selected providers.
5. Do not change mapper, engine, router, risk core, public, score, UI, report, export, API, or persistence code.

## Class B Providers

Class B providers are custom-path providers whose current Engine path clones the provider hypothesis objects rather than manually enumerating all semantic fields.

Class B provider set:

- Moisture.

Implementation architecture:

1. Add source-owned version emission in `MoistureKnowledgeProvider.js`.
2. Verify that `buildMoistureReasoning(...)` preserves string `riskRelevanceVersion` in primary and alternative hypotheses through `cloneValue(...)`.
3. Extend provider and integration tests for direct provider output, Engine output, Internal Model state, and Interpretation Model state.
4. Do not introduce a mapper change solely for Moisture.

## Class C Providers

Class C providers are custom Engine path providers that manually reconstruct hypothesis objects and currently omit `riskRelevanceVersion`.

Class C provider set:

- Concrete Corrosion.
- Basement Waterproofing.
- Crack.

Implementation architecture:

1. Add source-owned version emission in each provider.
2. Preserve `riskRelevanceVersion` in `mapConcreteHypothesis(...)` fallback output.
3. Preserve `riskRelevanceVersion` in `mapBasementHypothesis(...)` fallback output.
4. Preserve `riskRelevanceVersion` in `mapCrackHypothesis(...)` output.
5. Keep existing mapper-backed subpaths unchanged except for source-owned provider input.
6. Extend provider and integration tests for normal mapper-compatible inputs and fallback-triggering inputs.

## Class D Providers

Class D providers use adapters, coordinators, and renderer translation.

Class D provider set:

- Electrical Systems.
- Sanitary Systems.
- Windows Doors.

Implementation architecture:

1. Add source-owned version emission in each provider.
2. Preserve `riskRelevanceVersion` in each coordinator fallback `mapHypothesis(...)` output when the source hypothesis owns the field.
3. Do not create coordinator defaults when the provider source does not emit the field.
4. Verify `ExpertIntelligenceReasoningRenderer.render(...)` preserves supported string versions after language rendering.
5. Extend provider, coordinator or adapter-adjacent integration tests, Engine tests, Internal Model checks, Interpretation Model checks, and language rendering regression tests.

## Blocked Providers

No productive provider is blocked.

The remaining migration can close Foundation 1.5 in at most two implementation waves because:

- Four remaining providers use the approved shared mapper path and require provider/test-only changes.
- Seven remaining providers require local, deterministic source-version preservation in known custom or coordinator fallback mappers.
- No remaining provider requires Registry, Internal Model, Interpretation Model, Router, public contract, score, UI, report, export, API, or persistence architecture changes.

## Electrical Systems Analysis

Electrical Systems path:

```text
buildElectricalSystemsReasoning
-> ElectricalSystemsTerminologyAdapter.adapt
-> ElectricalSystemsKnowledgeProvider.getKnowledge
-> ElectricalSystemsReasoningCoordinator.build
-> ExpertIntelligenceReasoningRenderer.render
```

Architecture findings:

- Provider emits `riskRelevance` and currently omits `riskRelevanceVersion`.
- Coordinator first attempts `KnowledgeReasoningMapper.map(...)`.
- Coordinator fallback reconstructs hypothesis objects manually and currently copies `riskRelevance` only.
- Renderer JSON-clones and translates labels, causes, classifications, indicators, verification, consequences, and recommended actions.
- Renderer does not intentionally interpret, default, canonicalize, or drop supported string source versions.

Required final-wave control: add source-owned provider version and preserve the field in coordinator fallback output.

## Sanitary Systems Analysis

Sanitary Systems path:

```text
buildSanitarySystemsReasoning
-> SanitarySystemsTerminologyAdapter.adapt
-> SanitarySystemsKnowledgeProvider.getKnowledge
-> SanitarySystemsReasoningCoordinator.build
-> ExpertIntelligenceReasoningRenderer.render
```

Architecture findings:

- Provider emits `riskRelevance` and currently omits `riskRelevanceVersion`.
- Coordinator first attempts `KnowledgeReasoningMapper.map(...)`.
- Coordinator fallback reconstructs hypothesis objects manually and currently copies `riskRelevance` only.
- Adapter canonical context is routing and terminology support only.
- Renderer must be regression-tested for language rendering preservation.

Required final-wave control: add source-owned provider version and preserve the field in coordinator fallback output.

## Windows and Doors Analysis

Windows Doors path:

```text
buildWindowsDoorsReasoning
-> WindowsDoorsTerminologyAdapter.adapt
-> WindowsDoorsKnowledgeProvider.getKnowledge
-> WindowsDoorsReasoningCoordinator.build
-> ExpertIntelligenceReasoningRenderer.render
```

Architecture findings:

- Provider emits `riskRelevance` and currently omits `riskRelevanceVersion`.
- Coordinator first attempts `KnowledgeReasoningMapper.map(...)`.
- Coordinator fallback reconstructs hypothesis objects manually and currently copies `riskRelevance` only.
- Coordinator also appends verification wording in fallback; source-version preservation must not alter this existing behavior.
- Renderer translates language-dependent fields and must preserve technical metadata.

Required final-wave control: add source-owned provider version and preserve the field in coordinator fallback output.

## Concrete Corrosion Analysis

Concrete Corrosion path:

```text
buildConcreteCorrosionReasoning
-> ConcreteCorrosionKnowledgeProvider.getKnowledge
-> mapConcreteHypothesis
-> KnowledgeReasoningMapper.map or local fallback object
```

Architecture findings:

- Provider emits `riskRelevance` and currently omits `riskRelevanceVersion`.
- `mapConcreteHypothesis(...)` uses the shared mapper when scoring succeeds.
- Its fallback object currently copies `riskRelevance` only.
- Fallback output must preserve source-owned `riskRelevanceVersion` without creating defaults.

Required final-wave control: add provider version and add exact fallback preservation in the custom map.

## Basement Waterproofing Analysis

Basement Waterproofing path:

```text
buildBasementWaterproofingReasoning
-> BasementWaterproofingKnowledgeProvider.getKnowledge
-> mapBasementHypothesis
-> KnowledgeReasoningMapper.map or local fallback object
```

Architecture findings:

- Provider emits `riskRelevance` and currently omits `riskRelevanceVersion`.
- `mapBasementHypothesis(...)` uses the shared mapper when scoring succeeds.
- Its fallback object currently copies `riskRelevance` only.
- Cause-label normalization must remain unchanged by source-version preservation.

Required final-wave control: add provider version and add exact fallback preservation in the custom map.

## Source Ownership Rules

Binding source ownership rules:

- `riskRelevanceVersion` belongs to the same provider hypothesis object that carries `riskRelevance`.
- Only providers emit source versions.
- Providers may import only `RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` from the Registry.
- Providers must not import classifiers, state sets, governance definitions, Internal Model code, or Interpretation Model code.
- Transport code may preserve source-owned versions but must not create semantic versions.
- Internal Model and Interpretation Model remain consumers of preserved source data only.

## Missing Version Behavior

Missing `riskRelevanceVersion` remains `UNKNOWN_VERSION`.

Binding behavior:

- Missing versions are never interpreted.
- Missing versions do not become supported by mapper, engine, router, coordinator, renderer, Internal Model, or Interpretation Model code.
- Mixed migrated and unversioned state is allowed until final migration completes.

## Unsupported Version Behavior

Unsupported source versions remain `VERSION_UNSUPPORTED`.

Binding behavior:

- Unsupported versions are preserved as source data when emitted.
- Unsupported versions are never interpreted.
- Unsupported versions do not create public, score, priority, severity, diagnosis, safety, legal, compliance, recommendation, decision, CAPEX, RUL, valuation, or acquisition semantics.

## Undefined Version Behavior

Own `riskRelevanceVersion: undefined` is not a supported version.

Binding behavior:

- Shared mapper JSON clone behavior may drop own undefined values.
- Dropped undefined values classify downstream as `UNKNOWN_VERSION`.
- This is non-blocking because providers must emit the exact supported source-version string, not undefined.
- No migration wave may rely on null-like own metadata distinctions.

## Shared Transport Decision

Shared transport decision:

```text
FOUNDATION 1.5 REMAINING PROVIDER MIGRATION READY WITH CONTROLLED SHARED TRANSPORT CHANGE
```

Reason:

- The shared `KnowledgeReasoningMapper` is already source-version capable and requires no change for Class A providers.
- Coordinator fallback mappers for Electrical Systems, Sanitary Systems, and Windows Doors represent a repeated shared transport pattern and currently omit `riskRelevanceVersion`.
- Final migration must include a controlled preservation change across those coordinator fallback mappers.
- Custom Engine fallback mappers for Concrete Corrosion, Basement Waterproofing, and Crack require local preservation changes.
- No Registry, Internal Model, Interpretation Model, Router, public contract, score, UI, report, export, API, or persistence change is required.

## Wave 2 Scope

Wave 2 scope is limited to remaining Class A shared mapper providers:

- Vertical Transportation Systems.
- HVAC Systems.
- Facade Wall Systems.
- Roof Envelope.

Allowed implementation files for Wave 2:

```text
portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js
portal/core/knowledge/HvacSystemsKnowledgeProvider.js
portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js
portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js
tests/vertical-transportation-systems-knowledge-provider-test.js
tests/vertical-transportation-systems-reasoning-integration-test.js
tests/hvac-systems-knowledge-provider-test.js
tests/hvac-systems-reasoning-integration-test.js
tests/facade-wall-systems-knowledge-provider-test.js
tests/facade-wall-systems-reasoning-integration-test.js
tests/roof-envelope-knowledge-provider-test.js
tests/roof-envelope-reasoning-integration-test.js
```

Wave 2 must not change mapper, engine, router, coordinator, adapter, renderer, Registry, Internal Model, Interpretation Model, public, score, UI, report, export, API, or persistence files.

## Final Wave Scope

Final Wave scope includes all remaining Class B, Class C, and Class D providers:

- Concrete Corrosion.
- Basement Waterproofing.
- Electrical Systems.
- Sanitary Systems.
- Windows Doors.
- Moisture.
- Crack.

Allowed productive implementation files for Final Wave:

```text
portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js
portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js
portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js
portal/core/knowledge/SanitarySystemsKnowledgeProvider.js
portal/core/knowledge/WindowsDoorsKnowledgeProvider.js
portal/core/knowledge/MoistureKnowledgeProvider.js
portal/core/knowledge/CrackKnowledgeProvider.js
portal/core/ExpertReasoningEngine.js
portal/core/reasoning/adapters/ElectricalSystemsReasoningCoordinator.js
portal/core/reasoning/adapters/SanitarySystemsReasoningCoordinator.js
portal/core/reasoning/adapters/WindowsDoorsReasoningCoordinator.js
```

Allowed test implementation files for Final Wave:

```text
tests/concrete-corrosion-knowledge-provider-test.js
tests/concrete-corrosion-reasoning-integration-test.js
tests/basement-waterproofing-knowledge-provider-test.js
tests/basement-waterproofing-reasoning-integration-test.js
tests/electrical-systems-knowledge-provider-test.js
tests/electrical-systems-reasoning-integration-test.js
tests/sanitary-systems-knowledge-provider-test.js
tests/sanitary-systems-reasoning-integration-test.js
tests/windows-doors-knowledge-provider-test.js
tests/windows-doors-reasoning-integration-test.js
tests/moisture-knowledge-provider-test.js
tests/moisture-reasoning-integration-test.js
tests/crack-knowledge-provider-test.js
tests/crack-reasoning-integration-test.js
tests/expert-reasoning-engine-test.js
```

The Final Wave may execute risk-layer and router regression tests but must not change them unless a later gate explicitly expands scope.

## Explicitly Deferred Scope

The following scope is explicitly deferred beyond Foundation 1.5 provider source-version finalization:

- Provider value migration from legacy lowercase values to canonical uppercase values.
- Public UI exposure of Risk Relevance.
- Report, export, API, and persistence exposure of Risk Relevance.
- Building Risk Score integration.
- Score weighting, priority, severity, criticality, red flags, recommendations, decisions, diagnoses, legal conclusions, safety conclusions, CAPEX derivation, RUL derivation, valuation derivation, and acquisition advice.
- Registry taxonomy expansion.
- Router precedence redesign.
- Mapper hardening for own undefined metadata distinctions.
- Language resource changes unrelated to source-version preservation.

## Foundation 1.5 Definition of Done

Foundation 1.5 provider migration is done only when all conditions are true:

- All 15 productive providers that emit `riskRelevance` also emit `riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` next to the source value.
- All transport paths preserve source-owned versions without defaulting missing versions.
- Internal Model entries for all migrated provider outputs classify as `VERSION_SUPPORTED`.
- Interpretation Model internally interprets only supported value plus supported version entries.
- Missing and unsupported versions remain non-interpretable.
- Existing provider values remain legacy lowercase values.
- Public contract keys remain unchanged.
- Router precedence and first-success behavior remain unchanged.
- No score, priority, severity, diagnosis, recommendation, decision, safety, legal, CAPEX, RUL, valuation, or acquisition semantics are introduced.
- Focused provider, integration, risk-layer, Engine, Router, and full JavaScript suite checks pass.
- Independent review approves the implementation before any commit gate.

## Release Roadmap for Today

Recommended remaining release sequence:

```text
I-4B: Wave 2 Class A shared mapper provider implementation
I-4C: Wave 2 independent review
I-4D: Wave 2 commit, tag, push, and remote verification gate
I-4E: Final Wave Class B/C/D implementation with controlled transport preservation
I-4F: Final Wave independent review
I-4G: Final Foundation 1.5 commit, tag, push, and remote verification gate
```

No commit, tag, push, or staging is authorized by I-4A.

## Test Baseline

Focused baseline command:

```sh
node tests/risk-relevance-governance-registry-test.js
node tests/building-risk-internal-model-test.js
node tests/building-risk-interpretation-model-test.js
node tests/structural-systems-knowledge-provider-test.js
node tests/structural-systems-reasoning-integration-test.js
node tests/balconies-terraces-knowledge-provider-test.js
node tests/balconies-terraces-reasoning-integration-test.js
node tests/drainage-rainwater-knowledge-provider-test.js
node tests/drainage-rainwater-reasoning-integration-test.js
node tests/fire-protection-systems-knowledge-provider-test.js
node tests/fire-protection-systems-reasoning-integration-test.js
node tests/expert-reasoning-engine-test.js
node tests/knowledge-domain-router-test.js
```

Focused baseline result:

```text
RiskRelevanceGovernanceRegistry tests completed successfully. Passed: 27
BuildingRiskInternalModel tests completed successfully.
BuildingRiskInterpretationModel tests completed successfully.
StructuralSystemsKnowledgeProvider tests completed successfully.
StructuralSystems reasoning integration tests completed successfully.
BalconiesTerracesKnowledgeProvider tests completed successfully.
BalconiesTerracesReasoningIntegration tests completed successfully.
DrainageRainwaterKnowledgeProvider tests completed successfully.
DrainageRainwater reasoning integration tests completed successfully.
FireProtectionSystemsKnowledgeProvider tests completed successfully.
FireProtectionSystems reasoning integration tests completed successfully.
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

Full suite result:

```text
ALL_JS_TESTS_PASSED
```

## Risks

Remaining risks:

- Mixed migrated and unversioned provider state remains until both implementation waves complete.
- Class D coordinator fallback paths currently drop source versions and must be changed carefully.
- Class C custom Engine maps currently drop source versions in manual fallback output.
- Moisture clone preservation must be proven by tests even though string versions should survive JSON clone.
- Adapter and renderer language paths must preserve technical metadata while translating human-readable fields.
- Additional source-version emission activates internal Risk Relevance interpretation for migrated entries.
- The known shared mapper own-undefined edge remains non-blocking but visible.

Risk controls:

- Close remaining work in two implementation waves.
- Keep Wave 2 pure shared mapper and provider/test-only.
- Keep Final Wave transport changes limited to known manual preservation surfaces.
- Do not alter Registry, Internal Model, Interpretation Model, Router, public, score, UI, report, export, API, or persistence code.
- Require provider, integration, Engine, risk-layer, router, language-rendering, fallback, and full-suite validation.

## Blocking Findings

None.

No productive provider is blocked from migration within the two-wave finalization architecture.

## Architecture Decision

Architecture decision:

```text
FOUNDATION 1.5 REMAINING PROVIDER MIGRATION READY WITH CONTROLLED SHARED TRANSPORT CHANGE
```

Binding scope:

- Wave 2 migrates the four remaining pure shared mapper providers.
- Final Wave migrates the seven custom, coordinator, adapter, renderer, and clone-path providers.
- Coordinator fallback preservation is the only repeated shared transport pattern requiring controlled change.
- Custom Engine fallback preservation is local to known provider paths.
- No provider is blocked.

## Readiness Decision

Readiness decision:

```text
FOUNDATION 1.5 SPRINT I-4A ARCHITECTURE FINALIZATION COMPLETE
READY FOR I-4B WAVE 2 CLASS A PROVIDER IMPLEMENTATION
READY FOR FINAL WAVE AFTER WAVE 2 REVIEW AND COMMIT GATE
READY WITH CONTROLLED COORDINATOR FALLBACK TRANSPORT PRESERVATION
NOT READY FOR PUBLIC CONSUMER INTEGRATION
NOT READY FOR SCORE OR PRIORITY INTEGRATION
NOT READY FOR CANONICAL PROVIDER VALUE MIGRATION
NO COMMIT AUTHORIZED BY THIS DOCUMENT
```
