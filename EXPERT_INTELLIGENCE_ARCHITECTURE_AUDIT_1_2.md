# Expert Intelligence Architecture Audit 1.2-A

Date: 2026-07-20
Branch: `foundation-release-1.0`
Audited HEAD: `4dec9c6` (`Foundation 1.3-C.2: Add persisted governance integration test`)
Tag at HEAD: `foundation-1.3-final-release-2026-07-20`
Scope: existing Expert Intelligence architecture only; no implementation changes.

## 1. Executive Summary

The Expert Intelligence layer is operational and covered by provider, router, reasoning integration, terminology, renderer, language and engine tests. The current architecture deliberately resolves one public reasoning contract from an ordered set of possible domains: `KnowledgeDomainRouter.resolve(...)` can return multiple candidates, while `ExpertReasoningEngine.analyze(...)` returns the first successful contract.

No P0 runtime defect was confirmed during this audit. The complete JavaScript suite passed, and the working tree was clean before this audit file was created.

The main confirmed architectural issue is a Domain-ID inconsistency for cracks: `CrackKnowledgeProvider` returns provider domain `cracks`, while router and engine use canonical route key `crack`. Current behavior is not broken because `buildCrackReasoning(...)` does not depend on `knowledge.domain`, and tests explicitly expect both shapes in their respective layers. It is nevertheless a P1 consistency risk before introducing `structural-systems`, because structural and crack workflows are likely to overlap.

## 2. Repository and Git State

Commands executed before creating this audit file:

```sh
pwd
git branch --show-current
git log -1 --oneline --decorate
git tag --points-at HEAD
git status --short
git diff --check
```

Observed output:

```text
<repository-root>
foundation-release-1.0
4dec9c6 (HEAD -> foundation-release-1.0, tag: foundation-1.3-final-release-2026-07-20, origin/foundation-release-1.0) Foundation 1.3-C.2: Add persisted governance integration test
foundation-1.3-final-release-2026-07-20
```

`git status --short` produced no file output before this audit file was created. `git diff --check` produced no output.

Interpretation:

- Branch confirmed: `foundation-release-1.0`.
- HEAD confirmed: `4dec9c6`.
- Tag confirmed at HEAD: `foundation-1.3-final-release-2026-07-20`.
- Working tree was clean before creating `EXPERT_INTELLIGENCE_ARCHITECTURE_AUDIT_1_2.md`.
- No commit, tag or push was performed during this audit.

## 3. Expert Intelligence Inventory

Production provider files found under `portal/core/knowledge`:

```text
BalconiesTerracesKnowledgeProvider.js
BasementWaterproofingKnowledgeProvider.js
ConcreteCorrosionKnowledgeProvider.js
CrackKnowledgeProvider.js
DrainageRainwaterKnowledgeProvider.js
ElectricalSystemsKnowledgeProvider.js
FacadeWallSystemsKnowledgeProvider.js
FireProtectionSystemsKnowledgeProvider.js
HvacSystemsKnowledgeProvider.js
MoistureKnowledgeProvider.js
RoofEnvelopeKnowledgeProvider.js
SanitarySystemsKnowledgeProvider.js
VerticalTransportationSystemsKnowledgeProvider.js
WindowsDoorsKnowledgeProvider.js
```

Core reasoning files reviewed:

- `portal/core/ExpertReasoningEngine.js`
- `portal/core/reasoning/KnowledgeDomainRouter.js`
- `portal/core/reasoning/KnowledgeReasoningMapper.js`
- `portal/core/reasoning/ExpertIntelligenceLanguage.js`
- `portal/core/reasoning/ExpertIntelligenceReasoningRenderer.js`
- `portal/core/reasoning/ExpertIntelligenceTerminologyRegistry.js`
- `portal/core/reasoning/ExpertIntelligenceBilingualResources.js`

Adapter files found:

```text
ElectricalSystemsReasoningCoordinator.js
ElectricalSystemsTerminologyAdapter.js
SanitarySystemsReasoningCoordinator.js
SanitarySystemsTerminologyAdapter.js
WindowsDoorsReasoningCoordinator.js
WindowsDoorsTerminologyAdapter.js
```

Bilingual resource files found:

```text
electricalSystemsBilingualResources.js
sanitarySystemsBilingualResources.js
windowsDoorsBilingualResources.js
```

Relevant test inventory includes provider tests, reasoning integration tests, terminology-adapter tests, language, renderer, terminology-registry, router and engine tests. The executed single-test list is recorded in section 22.

## 4. Canonical Domain Inventory

Router precedence in `portal/core/reasoning/KnowledgeDomainRouter.js` defines these route IDs in order:

```text
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

Evidence:

- `DOMAIN_PRECEDENCE` starts at `portal/core/reasoning/KnowledgeDomainRouter.js:11`.
- Router pushes these IDs through `domains.push(...)` at `KnowledgeDomainRouter.js:41`, `:45`, `:49`, `:53`, `:57`, `:61`, `:65`, `:69`, `:73`, `:77`, `:81`, `:85`, `:89`, `:93`.
- Final ordering is enforced by `return DOMAIN_PRECEDENCE.filter((domain) => domains.includes(domain));` at `KnowledgeDomainRouter.js:96`.

Provider domain literals found by `grep -RIn --include='*KnowledgeProvider.js' -E 'domain:[[:space:]]*"' portal/core/knowledge`:

```text
balconies-terraces
basement-waterproofing
concrete-corrosion
cracks
drainage-rainwater
electrical-systems
facade-wall-systems
fire-protection-systems
hvac-systems
moisture
roof-envelope
sanitary-systems
vertical-transportation-systems
windows-doors
```

The only provider/router naming mismatch found is `cracks` versus `crack`.

## 5. Domain-ID Consistency Review

Confirmed consistent Domain IDs:

- `concrete-corrosion`: provider, router and engine all use `concrete-corrosion`.
- `basement-waterproofing`: provider, router and engine all use `basement-waterproofing`.
- `balconies-terraces`: provider, router and engine all use `balconies-terraces`.
- `drainage-rainwater`: provider, router and engine all use `drainage-rainwater`.
- `fire-protection-systems`: provider, router and engine all use `fire-protection-systems`.
- `vertical-transportation-systems`: provider, router and engine all use `vertical-transportation-systems`.
- `sanitary-systems`: provider, router, engine, terminology registry and bilingual resources use `sanitary-systems`.
- `hvac-systems`: provider, router and engine all use `hvac-systems`.
- `electrical-systems`: provider, router, engine, terminology registry and bilingual resources use `electrical-systems`.
- `windows-doors`: provider, router, engine, terminology registry and bilingual resources use `windows-doors`.
- `facade-wall-systems`: provider, router and engine all use `facade-wall-systems`.
- `roof-envelope`: provider, router and engine all use `roof-envelope`.
- `moisture`: provider, router and engine all use `moisture`.

Crack review:

- `portal/core/knowledge/CrackKnowledgeProvider.js:11` defines the empty contract domain as `cracks`.
- `portal/core/knowledge/CrackKnowledgeProvider.js:463` returns provider domain `cracks`.
- `portal/core/reasoning/KnowledgeDomainRouter.js:25` includes route ID `crack` in `DOMAIN_PRECEDENCE`.
- `portal/core/reasoning/KnowledgeDomainRouter.js:93` pushes `crack`.
- `portal/core/ExpertReasoningEngine.js:199` dispatches `domain === "crack"` to `buildCrackReasoning(source)`.
- `tests/crack-knowledge-provider-test.js:39` expects provider domain `cracks`.
- `tests/knowledge-domain-router-test.js:399` expects router output `["crack"]` for crack-only routing.

Runtime probe:

```text
crack-provider={"domains":["crack"],"primaryId":"differential-settlement","primaryCause":"differential settlement","confidence":0.67}
crackProviderDomain=cracks
```

Assessment:

- Confirmed mismatch: yes.
- Current behavior broken: no confirmed runtime failure. Engine crack mapping ignores `knowledge.domain` and maps provider hypotheses directly in `buildCrackReasoning(...)`.
- Canonical route ID: `crack`, because router precedence and engine dispatch use `crack`.
- Provider contract ID: `cracks`, currently preserved by provider tests.
- Affected files if normalized later: `CrackKnowledgeProvider.js`, `tests/crack-knowledge-provider-test.js`, possibly any docs/tests relying on provider-domain literal `cracks`.
- Priority: P1, because it is a confirmed contract inconsistency that may confuse future structural-domain integration, even though no current behavior failure was confirmed.

## 6. Router Behaviour

`KnowledgeDomainRouter.resolve(input)` normalizes `finding`, `building` and `measurements`, evaluates every domain predicate independently, pushes all matching route IDs, then returns them sorted by `DOMAIN_PRECEDENCE`.

Evidence:

- Normalization: `KnowledgeDomainRouter.js:101` returns cloned `finding`, `building`, `measurements`.
- Independent domain pushes: `KnowledgeDomainRouter.js:41` through `:93`.
- Precedence reorder: `KnowledgeDomainRouter.js:96`.

The router can return multiple domains. Evidence from tests:

- `tests/knowledge-domain-router-test.js:224`: `['facade-wall-systems', 'crack']`.
- `tests/knowledge-domain-router-test.js:257`: `['windows-doors', 'facade-wall-systems', 'roof-envelope', 'moisture']`.
- `tests/knowledge-domain-router-test.js:642`: `['electrical-systems', 'moisture']`.
- `tests/knowledge-domain-router-test.js:1865`: large overlap including concrete, basement, fire, vertical transportation, sanitary, electrical, windows/doors, facade, roof, moisture and crack.

Runtime probe for a deliberate overlap:

```text
multi-overlap={"domains":["concrete-corrosion","basement-waterproofing","fire-protection-systems","vertical-transportation-systems","sanitary-systems","electrical-systems","windows-doors","facade-wall-systems","roof-envelope","moisture","crack"],"primaryId":"concrete-spalling","primaryCause":"concrete spalling","confidence":1}
```

Assessment: multi-candidate routing is confirmed and tested.

## 7. Engine Dispatch Behaviour

`ExpertReasoningEngine.analyze(...)` loops over router candidates and dispatches via a chained conditional. It returns immediately when a builder returns a truthy contract.

Evidence:

- Router result consumed as `const domains = KnowledgeDomainRouter.resolve(source);` in `ExpertReasoningEngine.js:170`.
- Dispatch chain from `ExpertReasoningEngine.js:173` through `:200`.
- First successful contract returned at `ExpertReasoningEngine.js:203`.
- Known-domain null fallback at `ExpertReasoningEngine.js:208-209`.
- No-domain fallback at `ExpertReasoningEngine.js:212`.

Runtime evidence:

```text
multi-overlap domains=[concrete-corrosion, basement-waterproofing, fire-protection-systems, vertical-transportation-systems, sanitary-systems, electrical-systems, windows-doors, facade-wall-systems, roof-envelope, moisture, crack]
engine primary=concrete-spalling
```

The engine used the first successful domain contract (`concrete-corrosion`) and did not aggregate later candidates.

Assessment:

- Single-contract behavior is confirmed.
- Later domains are not merged into public reasoning output once an earlier domain succeeds.
- This is an architectural decision, not a bug by itself.
- Priority: INFO, with P1 implications for Structural Systems if structural findings should supersede or coexist with crack/concrete/basement domains.

## 8. Single-Domain and Multi-Candidate Analysis

Single-domain examples are covered by many tests, including:

- `tests/knowledge-domain-router-test.js:399`: crack-only routing returns `['crack']`.
- `tests/knowledge-domain-router-test.js:432`: windows/doors-only routing returns `['windows-doors']`.
- `tests/knowledge-domain-router-test.js:492`: HVAC routing returns `['hvac-systems']`.
- `tests/knowledge-domain-router-test.js:537`: electrical routing returns `['electrical-systems']`.

Multi-candidate examples include:

- `tests/knowledge-domain-router-test.js:224`: facade plus crack.
- `tests/knowledge-domain-router-test.js:257`: windows/doors plus facade plus roof plus moisture.
- `tests/knowledge-domain-router-test.js:642`: electrical plus moisture.
- `tests/knowledge-domain-router-test.js:1414`: basement plus moisture plus crack.
- `tests/knowledge-domain-router-test.js:1546`: concrete plus crack.

Engine behavior for multi-candidate input is first-success only. Tests validate router ordering broadly, but there is no explicit public contract asserting that discarded later domains are reported, merged or exposed. Current architecture intentionally does not expose discarded candidates.

Assessment: INFO for current behavior; P1 governance decision before `structural-systems` because structural findings may overlap with concrete-corrosion, basement-waterproofing, facade-wall-systems, moisture and crack.

## 9. Domain Precedence Governance

`DOMAIN_PRECEDENCE` is not merely cosmetic. Because the engine returns the first successful domain contract, precedence controls which domain owns ambiguous findings.

Current precedence places likely structural-adjacent domains in this order:

1. `concrete-corrosion`
2. `basement-waterproofing`
3. `balconies-terraces`
4. `drainage-rainwater`
5. `fire-protection-systems`
6. `vertical-transportation-systems`
7. `sanitary-systems`
8. `hvac-systems`
9. `electrical-systems`
10. `windows-doors`
11. `facade-wall-systems`
12. `roof-envelope`
13. `moisture`
14. `crack`

Governance implication:

- A future `structural-systems` domain must be deliberately placed relative to `concrete-corrosion`, `basement-waterproofing`, `balconies-terraces`, `facade-wall-systems`, `moisture` and `crack`.
- If placed too late, structural findings may be consumed by concrete, basement, facade or crack builders first.
- If placed too early, it may steal specialized domain ownership from existing providers.

Priority: P1 decision required before implementation, not a current runtime blocker.

## 10. Provider and Builder Contract Review

Provider contract pattern:

- Providers return `{ domain, hypotheses }`.
- Hypotheses expose stable IDs, cause/classification, indicator arrays, verification/consequence/action arrays and relevance fields.
- Provider tests validate stable output and immutability per domain.

Builder patterns:

- Generic provider/mapper domains use `KnowledgeReasoningMapper.map({ knowledge, input })`, e.g. HVAC, roof, drainage, fire, vertical transportation, facade.
- Moisture and crack use custom builders with custom scoring/mapping.
- Concrete and basement use custom mapping wrappers around `KnowledgeReasoningMapper`.
- Windows/doors, sanitary and electrical use terminology adapters, coordinators and bilingual renderer.

Evidence:

- `buildHvacSystemsReasoning(...)` uses provider plus mapper at `ExpertReasoningEngine.js:465-478`.
- `buildElectricalSystemsReasoning(...)` uses adapter/coordinator/renderer at `ExpertReasoningEngine.js:482-504`.
- `buildSanitarySystemsReasoning(...)` uses adapter/coordinator/renderer at `ExpertReasoningEngine.js:508-530`.
- `buildWindowsDoorsReasoning(...)` uses adapter/coordinator/renderer at `ExpertReasoningEngine.js:405-427`.
- `buildCrackReasoning(...)` custom maps provider hypotheses at `ExpertReasoningEngine.js:336-385`.

Confirmed issue: `CrackKnowledgeProvider` provider-domain literal is `cracks` while builder route is `crack`. No current behavior failure confirmed.

## 11. KnowledgeReasoningMapper Boundary

`KnowledgeReasoningMapper` is a generic boundary for mapping provider knowledge into the public reasoning contract.

Evidence:

- Entry point: `KnowledgeReasoningMapper.js:19`.
- Returns `null` when no hypotheses exist: `KnowledgeReasoningMapper.js:24`.
- Returns `null` when no scored match exists: `KnowledgeReasoningMapper.js:41`.
- Public contract fields returned at `KnowledgeReasoningMapper.js:48-57`.
- Missing evidence appends `No supporting indicators matched the available knowledge.` at `KnowledgeReasoningMapper.js:82-83`.
- Hypothesis status set to `hypothesis` at `KnowledgeReasoningMapper.js:113`.

Important boundary behavior:

- Mapper scores by matching provider `supportingIndicators` against normalized technical input.
- Mapper does not understand bilingual terminology.
- Mapper does not use `knowledge.domain` to route or validate domain identity.
- This explains why German-only bilingual domains require adapters/coordinators before rendering.

Assessment: boundary is consistent and intentionally generic. Priority: INFO.

## 12. Public Reasoning Contract Review

The public reasoning contract consistently exposes:

```text
primaryHypothesis
alternativeHypotheses
supportingEvidence
missingEvidence
requiredVerification
potentialConsequences
confidence
```

Mapped hypothesis fields include:

```text
id
label
cause
classification
structuralRelevance
supportingIndicators
contradictingIndicators
requiredVerification
potentialConsequences
recommendedActions
riskRelevance
capexRelevance
valuationRelevance
status
```

Evidence:

- Generic mapper returns public contract at `KnowledgeReasoningMapper.js:48-57`.
- Hypothesis mapping fields at `KnowledgeReasoningMapper.js:98-113`.
- Engine tests validate stable public shape in `tests/expert-reasoning-engine-test.js` and domain-specific integration tests.

Known variation:

- Legacy fallback returns the same top-level fields, but `primaryHypothesis` is scenario-template based and may not include provider-specific ID/relevance fields.
- This is currently expected by legacy tests and not a confirmed bug.

## 13. Language and Bilingual Architecture

Supported languages:

- `ExpertIntelligenceLanguage.js:1` defines `['en', 'de']`.
- `ExpertIntelligenceLanguage.js:2` defines default `en`.
- Unsupported or non-string language options normalize to English at `ExpertIntelligenceLanguage.js:10-17`.

Bilingual domains currently registered:

- `windows-doors`
- `sanitary-systems`
- `electrical-systems`

Evidence:

- Bilingual resource imports at `ExpertIntelligenceBilingualResources.js:1-3`.
- Resource registry entries at `ExpertIntelligenceBilingualResources.js:6-8`.
- Terminology registry entries in `ExpertIntelligenceTerminologyRegistry.js` for the same three domains.
- Engine passes `language` only for `electrical-systems`, `sanitary-systems` and `windows-doors` at `ExpertReasoningEngine.js:183-192`.

Bilingual rendering behavior:

- Renderer normalizes language at `ExpertIntelligenceReasoningRenderer.js:7`.
- Renderer resolves cause, label, classification, indicators, verification, consequences and recommended actions through bilingual resources at `ExpertIntelligenceReasoningRenderer.js:51-102`.
- Evidence entries are translated only when matching the original English indicator index at `ExpertIntelligenceReasoningRenderer.js:113-124`.
- Missing resources fall back to provider text via `ExpertIntelligenceBilingualResources.resolveHypothesisField(...)` at `ExpertIntelligenceBilingualResources.js:17-25`.

Assessment:

- Bilingual integration is explicit, not generic plugin-based.
- Domains without adapter/resource registration are currently English/provider-native only. That is a current architecture decision, not a confirmed accidental omission.
- Priority: INFO now; P2 if broader bilingual coverage is desired later.

## 14. Legacy Fallback Review

Legacy fallback remains reachable in two cases:

1. No router domains: `ExpertReasoningEngine.js:212` calls `analyzeLegacy(source)`.
2. Router found domains but all builders returned `null`: `ExpertReasoningEngine.js:208-209` calls `analyzeLegacy()` with no source.

Runtime evidence:

```text
unknown-domain-fallback={"domains":[],"primaryId":null,"primaryCause":"Insufficient information for a specific expert hypothesis","confidence":12}
known-domain-null-fallback={"domains":["crack"],"primaryId":null,"primaryCause":"Insufficient information for a specific expert hypothesis","confidence":0}
```

Assessment:

- Fallback is reachable and consistent with current tests.
- The known-domain null fallback intentionally drops source context by calling `analyzeLegacy()` without `source`; this produces the stable empty legacy contract. This is an architecture choice visible in code, not a confirmed defect.
- Priority: INFO; possible P2 improvement if future UX should preserve context for recognized-but-unmapped domains.

## 15. Test Coverage Review

Coverage observed:

- Every provider has a `*knowledge-provider-test.js`.
- Every listed domain has a `*reasoning-integration-test.js`.
- Bilingual domains have terminology-adapter tests: windows/doors, sanitary, electrical.
- Shared language, renderer, terminology-registry, router and engine tests exist.

Important test coverage examples:

- Router single-domain and overlap behavior in `tests/knowledge-domain-router-test.js`.
- Engine compatibility and language behavior in `tests/expert-reasoning-engine-test.js`.
- Bilingual renderer behavior in `tests/expert-intelligence-renderer-test.js`.
- Terminology registry component/issue/signal contracts in `tests/expert-intelligence-terminology-registry-test.js`.

Coverage gap before Structural Systems:

- There is no `structural-systems` provider, router predicate, precedence position, terminology adapter, coordinator, bilingual resources or tests yet. This is expected because Structural Systems has not been implemented.
- There is no explicit test that asserts later router candidates are intentionally discarded by engine first-success behavior. Current tests imply this through integration outcomes but do not name the governance decision directly.

Priority: P1 to define Structural Systems precedence and first-success expectations before implementation.

## 16. Structural Systems Readiness

Likely overlaps for future `structural-systems`:

- `crack`: widening, displacement, load-bearing and settlement language.
- `concrete-corrosion`: spalling, reinforcement corrosion, concrete cover and structural deterioration.
- `basement-waterproofing`: foundation, retaining wall, basement wall, below-grade water ingress.
- `balconies-terraces`: balcony slab, cantilever slab, railing anchor, wall connection.
- `facade-wall-systems`: facade cracks, cladding anchors, render detachment, external wall issues.
- `roof-envelope`: roof structural penetrations are less direct but roof/facade/water ingress overlaps exist.
- `moisture`: moisture is often secondary evidence for structural symptoms.

Required architecture decisions before implementation:

- Canonical Domain ID: likely `structural-systems`; must be consistent across provider, router, engine, tests and optional resources.
- Precedence position: must be explicitly decided relative to `concrete-corrosion`, `basement-waterproofing`, `facade-wall-systems`, `moisture` and `crack`.
- Scope boundary: distinguish structural system hypotheses from material-specific concrete corrosion and visual crack hypotheses.
- Multi-domain visibility: decide whether Structural Systems should consume overlaps or whether secondary candidate domains should be preserved somewhere.
- Contract style: decide whether Structural Systems uses generic mapper, custom builder or bilingual adapter/coordinator/resource path.

Readiness assessment: architecture can support a new domain, but precedence and overlap governance must be settled first.

## 17. Confirmed Findings

P0: none confirmed.

P1: Crack Domain-ID inconsistency.

- Evidence: `CrackKnowledgeProvider.js:11` and `:463` use `cracks`; router and engine use `crack` at `KnowledgeDomainRouter.js:25`, `:93` and `ExpertReasoningEngine.js:199`.
- Current behavior: no confirmed runtime defect; crack integration tests passed.
- Risk: future structural-domain or generic tooling may assume provider `domain` equals router/engine domain.

P1: Structural Systems precedence decision is required before implementation.

- Evidence: router can return multiple domains, and engine returns the first successful contract.
- Runtime evidence: multi-overlap input returned many domains but engine selected `concrete-spalling` from `concrete-corrosion`.
- Risk: Structural Systems could be shadowed by existing domains or could unintentionally shadow them.

P2: Engine dispatch chain has maintainability risk as domains increase.

- Evidence: chained dispatch from `ExpertReasoningEngine.js:173-200` and domain builders below.
- Current behavior: tests pass; no runtime defect confirmed.
- Risk: adding more domains increases chance of missed language propagation or dispatch mismatch.

INFO: Bilingual architecture is intentionally explicit for three domains.

- Evidence: only `windows-doors`, `sanitary-systems`, `electrical-systems` are registered in resources and terminology registry.
- Current behavior: tests pass; fallback to provider text exists.

## 18. Unconfirmed Risks

These are not confirmed defects:

- Future Structural Systems may require multi-domain output or secondary candidate reporting. Current architecture intentionally returns a single contract.
- Non-bilingual domains may eventually need German resources. Current architecture supports fallback and does not imply all domains must be bilingual now.
- Known-domain null fallback drops source context when all candidate builders return null. Tests currently expect stable fallback behavior.
- Crack provider domain `cracks` may be harmless for current consumers because the engine's crack builder ignores `knowledge.domain`.

## 19. Technical-Debt Candidates

P1:

- Normalize or explicitly document crack route/provider naming before Structural Systems work.
- Define Structural Systems precedence and overlap rules before implementation.

P2:

- Consider replacing chained engine dispatch with an explicit dispatch table once domain count grows further. No change recommended during this audit.
- Consider an explicit test naming the first-success/domain-discarding engine behavior as governance.
- Consider documenting which domains are intentionally bilingual versus provider-native English.

INFO:

- Generic mapper boundary is stable and should remain domain-neutral.
- Domain-specific bilingual adapters/coordinators are deliberate and preserve technical input separation.

## 20. Recommended Priority Classification

P0: none.

P1:

1. Crack `cracks` provider-domain versus `crack` router/engine route ID.
2. Structural Systems precedence and overlap governance before implementation.

P2:

1. Engine dispatch maintainability as domain count grows.
2. Explicit test/documentation for first-success behavior.
3. Broader bilingual-resource roadmap for currently provider-native domains, if product scope requires it.

INFO:

1. Router multi-candidate behavior is intentional and tested.
2. Engine single-contract behavior is intentional and deterministic.
3. Bilingual support is explicit for windows/doors, sanitary and electrical.
4. Legacy fallback remains reachable.

## 21. Blockers Before Structural Systems

No P0 blocker was confirmed.

Architectural blockers to decide before implementation, classified P1:

- Decide whether canonical Structural Systems Domain ID will be `structural-systems` and enforce consistency across provider, router, engine and tests.
- Decide where Structural Systems belongs in `DOMAIN_PRECEDENCE`.
- Decide whether Structural Systems should outrank or defer to `concrete-corrosion`, `basement-waterproofing`, `facade-wall-systems`, `moisture` and `crack`.
- Decide whether current first-success single-contract behavior is acceptable for structural overlaps or whether reporting needs secondary candidate visibility.
- Resolve or explicitly document the `crack`/`cracks` mismatch before adding another structural-adjacent domain.

## 22. Commands and Test Results

Repository state commands:

```sh
pwd
git branch --show-current
git log -1 --oneline --decorate
git tag --points-at HEAD
git status --short
git diff --check
```

Result: branch `foundation-release-1.0`, HEAD `4dec9c6`, tag `foundation-1.3-final-release-2026-07-20`, clean working tree before audit file, `git diff --check` passed.

Relevant Expert Intelligence tests executed:

```text
PASSED tests/moisture-knowledge-provider-test.js
PASSED tests/moisture-reasoning-integration-test.js
PASSED tests/crack-knowledge-provider-test.js
PASSED tests/crack-reasoning-integration-test.js
PASSED tests/roof-envelope-knowledge-provider-test.js
PASSED tests/roof-envelope-reasoning-integration-test.js
PASSED tests/concrete-corrosion-knowledge-provider-test.js
PASSED tests/concrete-corrosion-reasoning-integration-test.js
PASSED tests/basement-waterproofing-knowledge-provider-test.js
PASSED tests/basement-waterproofing-reasoning-integration-test.js
PASSED tests/balconies-terraces-knowledge-provider-test.js
PASSED tests/balconies-terraces-reasoning-integration-test.js
PASSED tests/drainage-rainwater-knowledge-provider-test.js
PASSED tests/drainage-rainwater-reasoning-integration-test.js
PASSED tests/hvac-systems-knowledge-provider-test.js
PASSED tests/hvac-systems-reasoning-integration-test.js
PASSED tests/electrical-systems-knowledge-provider-test.js
PASSED tests/electrical-systems-reasoning-integration-test.js
PASSED tests/electrical-systems-terminology-adapter-test.js
PASSED tests/sanitary-systems-knowledge-provider-test.js
PASSED tests/sanitary-systems-reasoning-integration-test.js
PASSED tests/sanitary-systems-terminology-adapter-test.js
PASSED tests/fire-protection-systems-knowledge-provider-test.js
PASSED tests/fire-protection-systems-reasoning-integration-test.js
PASSED tests/vertical-transportation-systems-knowledge-provider-test.js
PASSED tests/vertical-transportation-systems-reasoning-integration-test.js
PASSED tests/windows-doors-knowledge-provider-test.js
PASSED tests/windows-doors-reasoning-integration-test.js
PASSED tests/windows-doors-terminology-adapter-test.js
PASSED tests/facade-wall-systems-knowledge-provider-test.js
PASSED tests/facade-wall-systems-reasoning-integration-test.js
PASSED tests/expert-intelligence-language-test.js
PASSED tests/expert-intelligence-renderer-test.js
PASSED tests/expert-intelligence-terminology-registry-test.js
PASSED tests/knowledge-domain-router-test.js
PASSED tests/expert-reasoning-engine-test.js
```

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

## 23. Final Recommendation

Recommendation: proceed to Technical-Debt Review before Structural Systems Blueprint.

Reasoning:

- No P0 runtime defect was confirmed.
- Tests pass across relevant Expert Intelligence tests and the complete JavaScript suite.
- The architecture is stable enough for review, but Structural Systems should not be implemented until P1 governance decisions are made.

Next recommended step:

1. Technical-Debt Review should classify and decide the crack `cracks` versus `crack` naming issue.
2. Structural Systems Blueprint should explicitly define precedence, overlap ownership and contract style before any provider code is written.

Final audit status:

**EXPERT INTELLIGENCE ARCHITECTURE AUDIT 1.2-A COMPLETE**
