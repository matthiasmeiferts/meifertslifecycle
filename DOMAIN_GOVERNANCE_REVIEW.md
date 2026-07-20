# Domain Governance Review 1.1

Date: 2026-07-20
Branch: `foundation-release-1.0`
Audited HEAD: `4dec9c6` (`Foundation 1.3-C.2: Add persisted governance integration test`)
Scope: Expert Intelligence domain governance only.

No production code, tests, refactorings, commits, tags or pushes were performed for this review.

## Executive Summary

The Expert Intelligence domain model currently contains 14 routed knowledge domains. The router and engine use stable kebab-case technical Domain IDs. Provider contracts use the same Domain ID for 13 of 14 domains.

Confirmed consistent domains:

- `concrete-corrosion`
- `basement-waterproofing`
- `balconies-terraces`
- `drainage-rainwater`
- `fire-protection-systems`
- `vertical-transportation-systems`
- `sanitary-systems`
- `hvac-systems`
- `electrical-systems`
- `windows-doors`
- `facade-wall-systems`
- `roof-envelope`
- `moisture`

Confirmed inconsistent domain:

- Router and engine use `crack`; `CrackKnowledgeProvider` returns provider domain `cracks`.

Assessment:

- `crack` and `cracks` are not separate implemented knowledge domains.
- They represent the same fachliche domain, but two different technical IDs are present in contracts.
- Current functional behavior is not confirmed broken because the router dispatches `crack` and the crack engine builder consumes provider hypotheses without validating `knowledge.domain`.
- A real contract inconsistency exists between provider-level domain identity and router/engine domain identity.
- Before implementing `structural-systems`, normalize or explicitly govern the crack Domain ID, because structural, crack, concrete, basement, facade and moisture findings overlap heavily.

## Domain Inventory

Core router evidence:

- `portal/core/reasoning/KnowledgeDomainRouter.js:11` defines `DOMAIN_PRECEDENCE`.
- `portal/core/reasoning/KnowledgeDomainRouter.js:41-93` pushes routed Domain IDs.
- `portal/core/reasoning/KnowledgeDomainRouter.js:96` returns domains in precedence order.

Core engine evidence:

- `portal/core/ExpertReasoningEngine.js:173-200` dispatches by Domain ID.
- `portal/core/ExpertReasoningEngine.js:203` returns the first successful contract.
- `portal/core/ExpertReasoningEngine.js:289-712` contains domain builder functions.

Generic mapper evidence:

- `portal/core/reasoning/KnowledgeReasoningMapper.js` is used by generic provider-backed builders.
- `moisture`, `crack`, `windows-doors`, `sanitary-systems` and `electrical-systems` do not use the generic mapper directly in their final builder path.

Terminology and bilingual infrastructure evidence:

- `portal/core/reasoning/ExpertIntelligenceTerminologyRegistry.js:271-273` registers only `windows-doors`, `sanitary-systems` and `electrical-systems`.
- `portal/core/reasoning/ExpertIntelligenceBilingualResources.js:6-8` registers only `windows-doors`, `sanitary-systems` and `electrical-systems`.
- Adapter/coordinator files exist only for `windows-doors`, `sanitary-systems` and `electrical-systems` under `portal/core/reasoning/adapters`.
- Bilingual resource files exist only for `windows-doors`, `sanitary-systems` and `electrical-systems` under `portal/core/reasoning/resources`.

| Domain-ID | Provider | Router | Engine | Tests | KnowledgeReasoningMapper | Terminology | Resources | Adapter | Coordinator | Other references | Konsistent |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `concrete-corrosion` | `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` uses `concrete-corrosion` at lines 12 and 452 | `KnowledgeDomainRouter.js` precedence/push at lines 11 and 41 | `ExpertReasoningEngine.js:173-174`, builder at line 677 | `tests/concrete-corrosion-knowledge-provider-test.js`, `tests/concrete-corrosion-reasoning-integration-test.js`, router overlap tests | Used via mapper in concrete builder path | None | None | None | None | Domain appears in overlap tests and router precedence | Ja |
| `basement-waterproofing` | `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` uses `basement-waterproofing` at lines 10 and 626 | `KnowledgeDomainRouter.js` precedence/push at lines 12 and 45 | `ExpertReasoningEngine.js:175-176`, builder at line 585 | `tests/basement-waterproofing-knowledge-provider-test.js`, `tests/basement-waterproofing-reasoning-integration-test.js`, router overlap tests | Used via mapper in basement builder path | None | None | None | None | Domain appears in basement/moisture/crack overlaps | Ja |
| `balconies-terraces` | `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` uses `balconies-terraces` at lines 10 and 701 | `KnowledgeDomainRouter.js` precedence/push at lines 13 and 49 | `ExpertReasoningEngine.js:177-178`, builder at line 431 | `tests/balconies-terraces-knowledge-provider-test.js`, `tests/balconies-terraces-reasoning-integration-test.js`, router overlap tests | Used via mapper in balconies builder path | None | None | None | None | Domain appears in balcony/roof/moisture overlap tests | Ja |
| `drainage-rainwater` | `portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js` uses `drainage-rainwater` at lines 10 and 1065 | `KnowledgeDomainRouter.js` precedence/push at lines 14 and 53 | `ExpertReasoningEngine.js:179-180`, builder at line 448 | `tests/drainage-rainwater-knowledge-provider-test.js`, `tests/drainage-rainwater-reasoning-integration-test.js`, router overlap tests | Used via mapper in drainage builder path | None | None | None | None | Domain appears in drainage/roof/balcony overlap tests | Ja |
| `fire-protection-systems` | `portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js` uses `fire-protection-systems` at lines 11 and 79 | `KnowledgeDomainRouter.js` precedence/push at lines 15 and 57 | `ExpertReasoningEngine.js:187-188`, builder at line 534 | `tests/fire-protection-systems-knowledge-provider-test.js`, `tests/fire-protection-systems-reasoning-integration-test.js`, router overlap tests | Used via mapper in fire builder path | None | None | None | None | Domain appears in fire/vertical/windows overlap tests | Ja |
| `vertical-transportation-systems` | `portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js` uses `vertical-transportation-systems` at lines 12 and 80 | `KnowledgeDomainRouter.js` precedence/push at lines 16 and 61 | `ExpertReasoningEngine.js:189-190`, builder at line 551 | `tests/vertical-transportation-systems-knowledge-provider-test.js`, `tests/vertical-transportation-systems-reasoning-integration-test.js`, router overlap tests | Used via mapper in vertical transportation builder path | None | None | None | None | Domain appears in elevator/lift routing tests | Ja |
| `sanitary-systems` | `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` uses `sanitary-systems` at lines 11 and 80 | `KnowledgeDomainRouter.js` precedence/push at lines 17 and 65; terminology evidence check at line 329 | `ExpertReasoningEngine.js:185-186`, builder at line 508 | `tests/sanitary-systems-knowledge-provider-test.js`, `tests/sanitary-systems-reasoning-integration-test.js`, `tests/sanitary-systems-terminology-adapter-test.js`, router tests | Not direct generic mapper path; adapter/coordinator/renderer path | `ExpertIntelligenceTerminologyRegistry.js:272` | `ExpertIntelligenceBilingualResources.js:7`; `resources/sanitarySystemsBilingualResources.js` | `adapters/SanitarySystemsTerminologyAdapter.js` uses `DOMAIN_ID = "sanitary-systems"` | `adapters/SanitarySystemsReasoningCoordinator.js` | Bilingual renderer path | Ja |
| `hvac-systems` | `portal/core/knowledge/HvacSystemsKnowledgeProvider.js` uses `hvac-systems` at lines 11 and 116 | `KnowledgeDomainRouter.js` precedence/push at lines 18 and 69 | `ExpertReasoningEngine.js:181-182`, builder at line 465 | `tests/hvac-systems-knowledge-provider-test.js`, `tests/hvac-systems-reasoning-integration-test.js`, router tests | Used via mapper in HVAC builder path | None | None | None | None | Domain appears in HVAC/moisture overlap tests | Ja |
| `electrical-systems` | `portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js` uses `electrical-systems` at lines 11 and 81 | `KnowledgeDomainRouter.js` precedence/push at lines 19 and 73; terminology evidence check at line 828 | `ExpertReasoningEngine.js:183-184`, builder at line 482 | `tests/electrical-systems-knowledge-provider-test.js`, `tests/electrical-systems-reasoning-integration-test.js`, `tests/electrical-systems-terminology-adapter-test.js`, router tests | Not direct generic mapper path; adapter/coordinator/renderer path | `ExpertIntelligenceTerminologyRegistry.js:273` | `ExpertIntelligenceBilingualResources.js:8`; `resources/electricalSystemsBilingualResources.js` | `adapters/ElectricalSystemsTerminologyAdapter.js` uses `DOMAIN_ID = "electrical-systems"` | `adapters/ElectricalSystemsReasoningCoordinator.js` | Bilingual renderer path | Ja |
| `windows-doors` | `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` uses `windows-doors` at lines 10 and 645 | `KnowledgeDomainRouter.js` precedence/push at lines 20 and 77; terminology evidence check at line 1215 | `ExpertReasoningEngine.js:191-192`, builder at line 405 | `tests/windows-doors-knowledge-provider-test.js`, `tests/windows-doors-reasoning-integration-test.js`, `tests/windows-doors-terminology-adapter-test.js`, router tests | Not direct generic mapper path; adapter/coordinator/renderer path | `ExpertIntelligenceTerminologyRegistry.js:271` | `ExpertIntelligenceBilingualResources.js:6`; `resources/windowsDoorsBilingualResources.js` | `adapters/WindowsDoorsTerminologyAdapter.js` uses `DOMAIN_ID = "windows-doors"` | `adapters/WindowsDoorsReasoningCoordinator.js` | Bilingual renderer path | Ja |
| `facade-wall-systems` | `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` uses `facade-wall-systems` at lines 11 and 626 | `KnowledgeDomainRouter.js` precedence/push at lines 21 and 81 | `ExpertReasoningEngine.js:193-194`, builder at line 568 | `tests/facade-wall-systems-knowledge-provider-test.js`, `tests/facade-wall-systems-reasoning-integration-test.js`, router overlap tests | Used via mapper in facade builder path | None | None | None | None | Domain appears in facade/crack/window/roof overlap tests | Ja |
| `roof-envelope` | `portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js` uses `roof-envelope` at lines 11 and 446 | `KnowledgeDomainRouter.js` precedence/push at lines 22 and 85 | `ExpertReasoningEngine.js:195-196`, builder at line 388 | `tests/roof-envelope-knowledge-provider-test.js`, `tests/roof-envelope-reasoning-integration-test.js`, router overlap tests | Used via mapper in roof builder path | None | None | None | None | Domain appears in roof/moisture/balcony overlap tests | Ja |
| `moisture` | `portal/core/knowledge/MoistureKnowledgeProvider.js` uses `moisture` at lines 11 and 300 | `KnowledgeDomainRouter.js` precedence/push at lines 23 and 89 | `ExpertReasoningEngine.js:197-198`, builder at line 289 | `tests/moisture-knowledge-provider-test.js`, `tests/moisture-reasoning-integration-test.js`, router overlap tests | Not direct generic mapper path; custom moisture builder | None | None | None | None | Domain appears as secondary overlap in many tests | Ja |
| `crack` / `cracks` | `portal/core/knowledge/CrackKnowledgeProvider.js` uses provider domain `cracks` at lines 11 and 463 | `KnowledgeDomainRouter.js` precedence/push uses `crack` at lines 25 and 93 | `ExpertReasoningEngine.js:199-200`, builder at line 336 uses `crack` route | `tests/crack-knowledge-provider-test.js` expects provider domain `cracks`; `tests/crack-reasoning-integration-test.js` and router tests use `crack` | Not direct generic mapper path; custom crack builder | None | None | None | None | Docs and many routing overlap tests reference crack concepts; only provider contract literal is `cracks` | Nein |

## Per-Domain ID Variant Review

| Domain-ID | Exact same ID everywhere? | Synonyme as technical IDs? | Singular/plural deviation? | Different spelling? | Legacy names? | Dead references? |
| --- | --- | --- | --- | --- | --- | --- |
| `concrete-corrosion` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `basement-waterproofing` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `balconies-terraces` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `drainage-rainwater` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `fire-protection-systems` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `vertical-transportation-systems` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `sanitary-systems` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `hvac-systems` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `electrical-systems` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `windows-doors` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `facade-wall-systems` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `roof-envelope` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `moisture` | Yes | None confirmed | None confirmed | None confirmed | None confirmed | None confirmed |
| `crack` | No | `cracks` exists as provider contract ID | Yes: singular route ID vs plural provider ID | None confirmed beyond singular/plural | `cracks` appears in architecture docs/provider tests as provider domain | No dead runtime reference confirmed |

## crack / cracks Investigation

Repository search scope:

```sh
grep -RIn -E '\bcracks?\b|crack-' . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude=DOMAIN_GOVERNANCE_REVIEW.md \
  --exclude=EXPERT_INTELLIGENCE_ARCHITECTURE_AUDIT_1_2.md
```

Files containing crack/cracks terminology or IDs:

| Count | File |
| ---: | --- |
| 5 | `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md` |
| 17 | `docs/EXPERT_INTELLIGENCE_DOMAIN_COVERAGE_MASTER.md` |
| 2 | `methodology/index.html` |
| 1 | `portal/core/AdaptiveFollowUpQuestionEngine.js` |
| 3 | `portal/core/DamageHypothesisEngine.js` |
| 7 | `portal/core/ExpertReasoningEngine.js` |
| 3 | `portal/core/InspectionQuestionCatalog.js` |
| 3 | `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` |
| 17 | `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` |
| 4 | `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` |
| 75 | `portal/core/knowledge/CrackKnowledgeProvider.js` |
| 11 | `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` |
| 1 | `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` |
| 1 | `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` |
| 11 | `portal/core/reasoning/KnowledgeDomainRouter.js` |
| 1 | `portal/core/reasoning/resources/sanitarySystemsBilingualResources.js` |
| 1 | `portal/core/reasoning/resources/windowsDoorsBilingualResources.js` |
| 1 | `portal/inspection.html` |
| 1 | `portal/library.html` |
| 1 | `tests/assessment-generation-engine-test.js` |
| 6 | `tests/balconies-terraces-reasoning-integration-test.js` |
| 7 | `tests/basement-waterproofing-knowledge-provider-test.js` |
| 14 | `tests/basement-waterproofing-reasoning-integration-test.js` |
| 5 | `tests/concrete-corrosion-reasoning-integration-test.js` |
| 21 | `tests/crack-knowledge-provider-test.js` |
| 13 | `tests/crack-reasoning-integration-test.js` |
| 5 | `tests/drainage-rainwater-reasoning-integration-test.js` |
| 4 | `tests/evidence-decision-engine-test.js` |
| 2 | `tests/expert-reasoning-engine-test.js` |
| 5 | `tests/facade-wall-systems-knowledge-provider-test.js` |
| 12 | `tests/facade-wall-systems-reasoning-integration-test.js` |
| 3 | `tests/follow-up-generation-engine-test.js` |
| 2 | `tests/immutability-audit-test.js` |
| 35 | `tests/knowledge-domain-router-test.js` |
| 5 | `tests/roof-envelope-reasoning-integration-test.js` |
| 1 | `tests/windows-doors-knowledge-provider-test.js` |
| 6 | `tests/windows-doors-reasoning-integration-test.js` |

Technical ID evidence:

- Provider domain ID: `portal/core/knowledge/CrackKnowledgeProvider.js:11` and `:463` use `domain: "cracks"`.
- Provider test expectation: `tests/crack-knowledge-provider-test.js:39` expects `result.domain` to equal `"cracks"`.
- Router canonical route: `portal/core/reasoning/KnowledgeDomainRouter.js:25` includes `"crack"` in precedence and `:93` pushes `"crack"`.
- Router tests: `tests/knowledge-domain-router-test.js:335`, `:399`, `:1328`, `:1414`, `:1546`, `:1865`, `:2201`, `:2322` expect `"crack"` in router output.
- Engine dispatch: `portal/core/ExpertReasoningEngine.js:199-200` dispatches `domain === "crack"` to `buildCrackReasoning(source)`.
- Engine crack builder: `portal/core/ExpertReasoningEngine.js:336` starts `buildCrackReasoning(source = {})`.
- Reasoning integration tests use input category `"crack"` and validate current behavior in `tests/crack-reasoning-integration-test.js`.

Fachliche versus technische meaning:

- `crack` is used as the routed technical domain and also as an input category/defect concept.
- `cracks` is used as the provider-level domain string for the same knowledge provider.
- No separate `CracksKnowledgeProvider`, router predicate, engine builder, terminology registry entry, bilingual resource, adapter or coordinator exists for `cracks`.
- Therefore, `crack` and `cracks` are not two separate fachliche Wissensdomaenen in the implemented architecture. They are two technical identifiers for the same implemented crack knowledge domain.

Contract assessment:

- A provider/router/engine Domain-ID contract inconsistency is confirmed.
- The provider advertises `cracks`; the router and engine route `crack`.
- Current functional failure is not confirmed because the engine reaches crack reasoning through router ID `crack`, calls the crack provider, and maps hypotheses without requiring `knowledge.domain === "crack"`.
- Tests currently encode both sides: provider tests preserve `cracks`, while router and integration tests preserve `crack`.

Affected components if normalized later:

- `portal/core/knowledge/CrackKnowledgeProvider.js`
- `tests/crack-knowledge-provider-test.js`
- `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`
- `docs/EXPERT_INTELLIGENCE_DOMAIN_COVERAGE_MASTER.md`
- Any future tool that validates provider `domain` against router/engine Domain IDs
- Potential release/audit documentation that quotes provider domain `cracks`

Components likely not needing semantic change if provider ID is normalized carefully:

- `portal/core/reasoning/KnowledgeDomainRouter.js`, because it already uses `crack`.
- `portal/core/ExpertReasoningEngine.js`, because it already dispatches `crack`.
- `tests/knowledge-domain-router-test.js`, because it already expects `crack`.
- `tests/crack-reasoning-integration-test.js`, because it uses crack inputs and validates public reasoning behavior rather than provider-domain literal `cracks`.

Existing architecture standard:

- Router Domain IDs are singular or compound kebab-case technical keys.
- Engine dispatch keys match router output exactly.
- Provider `domain` normally matches router/engine ID exactly.
- The standard therefore favors `crack` as canonical for this domain, because it is the existing router/engine key and public routing tests already assert it.

## Confirmed Inconsistencies

1. `crack` versus `cracks` Domain-ID mismatch.

Evidence:

- `portal/core/knowledge/CrackKnowledgeProvider.js:11` uses `domain: "cracks"`.
- `portal/core/knowledge/CrackKnowledgeProvider.js:463` returns `domain: "cracks"`.
- `portal/core/reasoning/KnowledgeDomainRouter.js:25` uses `"crack"` in precedence.
- `portal/core/reasoning/KnowledgeDomainRouter.js:93` pushes `"crack"`.
- `portal/core/ExpertReasoningEngine.js:199` dispatches `domain === "crack"`.
- `tests/crack-knowledge-provider-test.js:39` expects `"cracks"`.
- `tests/knowledge-domain-router-test.js:399` expects `["crack"]`.

No other Domain-ID mismatch was confirmed among routed Expert Intelligence domains.

## Potential Risks

These points are risks, not confirmed current defects:

- A future domain-governance validator could report `CrackKnowledgeProvider` as invalid because its `domain` does not match router/engine `crack`.
- A future `structural-systems` domain could overlap with `crack`, `concrete-corrosion`, `basement-waterproofing`, `facade-wall-systems` and `moisture`, making the existing `crack`/`cracks` ambiguity more expensive to resolve later.
- A future generic UI, registry or documentation generator that reads provider `domain` could expose `cracks` while runtime routing exposes `crack`.
- Historical docs already mention `CrackKnowledgeProvider` with `cracks`, so normalization would require documentation updates to avoid contradictory architecture evidence.

## Canonical Domain Recommendation

Recommended canonical Domain IDs, without performing any rename:

| Knowledge domain | Recommended canonical Domain-ID | Reason |
| --- | --- | --- |
| Concrete corrosion | `concrete-corrosion` | Already consistent across provider, router, engine and tests |
| Basement waterproofing | `basement-waterproofing` | Already consistent across provider, router, engine and tests |
| Balconies and terraces | `balconies-terraces` | Already consistent across provider, router, engine and tests |
| Drainage and rainwater | `drainage-rainwater` | Already consistent across provider, router, engine and tests |
| Fire protection systems | `fire-protection-systems` | Already consistent across provider, router, engine and tests |
| Vertical transportation systems | `vertical-transportation-systems` | Already consistent across provider, router, engine and tests |
| Sanitary systems | `sanitary-systems` | Already consistent and registered in bilingual infrastructure |
| HVAC systems | `hvac-systems` | Already consistent across provider, router, engine and tests |
| Electrical systems | `electrical-systems` | Already consistent and registered in bilingual infrastructure |
| Windows and doors | `windows-doors` | Already consistent and registered in bilingual infrastructure |
| Facade wall systems | `facade-wall-systems` | Already consistent across provider, router, engine and tests |
| Roof envelope | `roof-envelope` | Already consistent across provider, router, engine and tests |
| Moisture | `moisture` | Already consistent across provider, router, engine and tests |
| Crack | `crack` | Router, engine and router tests already use `crack`; provider `cracks` should be treated as the non-canonical legacy/provider literal |

## Technical Debt Classification

### P0

None confirmed.

No current functional break or release-blocking runtime defect was confirmed in this domain-governance review.

### P1

1. Normalize or formally govern `crack` versus `cracks` before `structural-systems` implementation.

Reason:

- Confirmed provider/router/engine Domain-ID inconsistency.
- Structural Systems is expected to overlap with crack, concrete, basement, facade and moisture routing.
- The mismatch is currently contained but is likely to become a governance hazard once another structural-adjacent domain is introduced.

### P2

1. Add explicit domain-governance validation later.

Reason:

- Current consistency was established by repository search and manual matrix review.
- A future non-product validation test could prevent new provider/router/engine Domain-ID drift.
- This is not required before the current review is accepted, but it would reduce recurrence risk.

2. Document which domains intentionally have bilingual terminology infrastructure.

Reason:

- Only `windows-doors`, `sanitary-systems` and `electrical-systems` have terminology registry, resources, adapter and coordinator paths.
- This is currently consistent and not a defect, but explicit documentation would avoid interpreting absent resources as accidental omissions.

### INFO

1. `KnowledgeReasoningMapper` is not a Domain-ID registry.

Reason:

- It maps provider knowledge to public reasoning contracts for generic builder paths.
- It does not validate provider `domain` against router or engine IDs.

2. Router multi-domain output and engine first-success dispatch make Domain-ID precedence a governance surface.

Reason:

- The router can return multiple domains.
- The engine dispatches by ordered Domain ID and returns the first successful public reasoning contract.

## Recommendation

Soll vor Structural Systems eine Domain-Normalisierung durchgefuehrt werden?

Ja.

Begruendung:

- The only confirmed Domain-ID inconsistency is `crack` versus `cracks`.
- `crack` is the canonical ID according to existing router precedence, router output tests and engine dispatch.
- `cracks` is limited to the provider contract, provider tests and historical documentation references.
- Current functionality is not confirmed broken, so this is not a P0 emergency.
- However, Structural Systems will likely overlap with crack-related routing and should not be added on top of a known structural-adjacent Domain-ID ambiguity.

Recommended next step:

1. Perform a small, explicit Technical Debt implementation ticket to normalize the provider contract from `cracks` to `crack`, or formally document `cracks` as an intentional provider-only legacy alias.
2. Run crack provider tests, crack reasoning integration tests, router tests, engine tests and the full JavaScript suite.
3. Only after that, proceed to the Structural Systems Blueprint with a clean canonical Domain-ID baseline.
