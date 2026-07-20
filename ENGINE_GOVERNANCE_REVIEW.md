# Technical Debt Review 1.2 - Engine Governance

Date: 2026-07-20
Branch: `foundation-release-1.0`
Foundation release: 1.3
Audited HEAD: `4dec9c6` (`Foundation 1.3-C.2: Add persisted governance integration test`)
Scope: `KnowledgeDomainRouter` and `ExpertReasoningEngine` governance only.

No production architecture changes, refactorings, commits, tags or pushes were performed for this review.

## Executive Summary

The current Expert Intelligence architecture is a deterministic single-provider / first-success model.

`KnowledgeDomainRouter.resolve(input)` can return multiple applicable domains. It evaluates every domain predicate independently, collects all matches, and returns them in the explicit `DOMAIN_PRECEDENCE` order.

`ExpertReasoningEngine.analyze(input, options)` then processes the ordered domains one by one and returns the first truthy reasoning contract. Once a contract is returned, later router candidates are not processed further and are not aggregated into the public result.

This means `DOMAIN_PRECEDENCE` has direct fachliche governance meaning. It is not only a technical sorting list. It determines which domain gets the first opportunity to produce the public `ExpertReasoningContract` whenever multiple domains match the same input.

Recommendation for Foundation 1.x: keep the current single-provider / first-success architecture as the binding model. Before introducing `structural-systems`, make a precedence decision for where it belongs and document the expected overlap behavior. No deeper engine architecture change is required for Foundation 1.x unless the product explicitly requires multi-domain public output.

## Router Contract

Reviewed file: `portal/core/reasoning/KnowledgeDomainRouter.js`.

Entry point:

- `KnowledgeDomainRouter.resolve(input = {})` starts at line 36.
- It accepts an analysis input object.
- It normalizes and clones `finding`, `building`, and `measurements` via `normalizeInput(input)` at lines 101-109.
- It does not consume `options`, `language`, UI state, external APIs, AI output, or persistence.

Processed input surfaces:

- `input.finding`
- `input.building`
- `input.measurements`

The router contract explicitly states routing-only behavior in the file header:

- It resolves applicable reasoning domains from inspection input using stable deterministic precedence.
- It performs no mapping, confidence calculation, or diagnosis.

Recognized routed domains:

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

Predicate map:

- `isMoistureFinding(...)` starts at line 111.
- `isCrackFinding(...)` starts at line 130.
- `isDrainageRainwaterFinding(...)` starts at line 160.
- `isSanitarySystemsFinding(...)` starts at line 294.
- `isFireProtectionSystemsFinding(...)` starts at line 417.
- `isVerticalTransportationSystemsFinding(...)` starts at line 522.
- `isHvacSystemsFinding(...)` starts at line 665.
- `isElectricalSystemsFinding(...)` starts at line 798.
- `isRoofEnvelopeFinding(...)` starts at line 901.
- `isBalconiesTerracesFinding(...)` starts at line 1012.
- `isConcreteCorrosionFinding(...)` starts at line 1129.
- `isWindowsDoorsFinding(...)` starts at line 1184.
- `isFacadeWallSystemsFinding(...)` starts at line 1304.
- `isBasementWaterproofingFinding(...)` starts at line 1436.

Multi-domain recognition:

- Multiple domains can be recognized for the same input.
- `resolve(...)` initializes `const domains = []` at line 38.
- Each domain is checked with an independent `if` block at lines 40-93.
- There is no `else if` chain and no early return while evaluating predicates.

Ordering guarantee:

- The final return is `DOMAIN_PRECEDENCE.filter((domain) => domains.includes(domain));` at line 96.
- Therefore, output ordering is guaranteed by `DOMAIN_PRECEDENCE`, not by the physical order in which predicates are declared later in the file.

Confirmed router contract:

- Input: cloned `finding`, `building`, `measurements`.
- Output: `string[]` of applicable Domain IDs.
- Output order: deterministic `DOMAIN_PRECEDENCE` order.
- Multi-domain output: supported and tested.
- Public reasoning contract: not produced by router.

## Engine Contract

Reviewed file: `portal/core/ExpertReasoningEngine.js`.

Entry point:

- `ExpertReasoningEngine.analyze(input = {}, options = {})` starts at line 166.
- It clones `input` into `source` at line 167.
- It normalizes `options.language` at line 168.
- It resolves router domains with `KnowledgeDomainRouter.resolve(source)` at line 170.

Domain processing:

- The engine loops over domains with `for (const domain of domains)` at line 172.
- It uses a chained conditional dispatch at lines 173-200.
- Each recognized Domain ID is mapped to exactly one builder function.

Dispatch map:

| Domain ID | Engine branch | Builder |
| --- | --- | --- |
| `concrete-corrosion` | line 173 | `buildConcreteCorrosionReasoning(source)` |
| `basement-waterproofing` | line 175 | `buildBasementWaterproofingReasoning(source)` |
| `balconies-terraces` | line 177 | `buildBalconiesTerracesReasoning(source)` |
| `drainage-rainwater` | line 179 | `buildDrainageRainwaterReasoning(source)` |
| `hvac-systems` | line 181 | `buildHvacSystemsReasoning(source)` |
| `electrical-systems` | line 183 | `buildElectricalSystemsReasoning(source, { language })` |
| `sanitary-systems` | line 185 | `buildSanitarySystemsReasoning(source, { language })` |
| `fire-protection-systems` | line 187 | `buildFireProtectionSystemsReasoning(source)` |
| `vertical-transportation-systems` | line 189 | `buildVerticalTransportationSystemsReasoning(source)` |
| `windows-doors` | line 191 | `buildWindowsDoorsReasoning(source, { language })` |
| `facade-wall-systems` | line 193 | `buildFacadeWallSystemsReasoning(source)` |
| `roof-envelope` | line 195 | `buildRoofEnvelopeReasoning(source)` |
| `moisture` | line 197 | `buildMoistureReasoning(source)` |
| `crack` | line 199 | `buildCrackReasoning(source)` |

Contract return:

- The engine returns immediately when a builder returns a truthy contract: `if (contract) { return contract; }` at lines 203-205.
- Because of that immediate return, later domains are not processed once an earlier domain succeeds.

Legacy fallback:

- If domains were recognized but all builders returned null, `analyzeLegacy()` is called without source at lines 208-209.
- If no domains were recognized, `analyzeLegacy(source)` is called at line 212.
- `analyzeLegacy(input = {})` starts at line 215.

Confirmed engine contract:

- Input: analysis input plus optional language.
- Router result: ordered Domain ID list.
- Processing model: sequential first-success dispatch.
- Output: exactly one public reasoning contract.
- Aggregation: none.
- Legacy: still reachable.

## First-Success Behaviour

First-success is explicitly implemented.

Evidence:

- The router can produce multiple candidates.
- The engine iterates through candidates in order.
- `if (contract) { return contract; }` returns immediately at lines 203-205.

The behavior is not accidental in practice, because the control flow has a direct early return. However, there is no named constant or policy object called `FIRST_SUCCESS`; the policy is implemented directly in the loop.

Result:

- First matching domain that also returns a truthy contract owns the public result.
- Later candidates are neither rendered, merged, nor exposed through a secondary field.
- If an earlier candidate returns null, the next candidate can still be tried.
- If all candidates return null, legacy fallback remains reachable.

Runtime probe performed during this review:

```json
{
  "multiDomains": [
    "concrete-corrosion",
    "basement-waterproofing",
    "fire-protection-systems",
    "vertical-transportation-systems",
    "sanitary-systems",
    "electrical-systems",
    "facade-wall-systems",
    "roof-envelope",
    "moisture",
    "crack"
  ],
  "multiPrimaryId": "moisture-accelerated-deterioration",
  "multiPrimaryCause": "moisture-accelerated deterioration",
  "knownNullDomains": ["crack"],
  "knownNullPrimaryId": null,
  "knownNullConfidence": 0,
  "unknownDomains": [],
  "unknownPrimaryId": null,
  "publicKeys": [
    "primaryHypothesis",
    "alternativeHypotheses",
    "supportingEvidence",
    "missingEvidence",
    "requiredVerification",
    "potentialConsequences",
    "confidence"
  ]
}
```

Interpretation:

- Router returned multiple domains.
- Engine returned one public contract.
- Public keys stayed stable.
- Known-domain null fallback and no-domain fallback remained reachable.

## Multi-Candidate Behaviour

Can the router return multiple domains?

Yes.

Confirmed by code:

- Independent router `if` blocks collect all matching domains.
- Final return orders the collected set by `DOMAIN_PRECEDENCE`.

Confirmed by tests in `tests/knowledge-domain-router-test.js`:

- Line 56: `balconies-terraces`, `windows-doors`, `roof-envelope`, `moisture`.
- Line 224: `facade-wall-systems`, `crack`.
- Line 257: `windows-doors`, `facade-wall-systems`, `roof-envelope`, `moisture`.
- Line 642: `electrical-systems`, `moisture`.
- Line 733: `fire-protection-systems`, `moisture`.
- Line 942: `vertical-transportation-systems`, `windows-doors`.
- Line 1414: `basement-waterproofing`, `moisture`, `crack`.
- Line 1546: `concrete-corrosion`, `crack`.
- Line 1865: a broad precedence test across many domains.
- Line 2201: drainage and structural-adjacent overlap.
- Line 2322: windows/moisture/crack/concrete precedence overlap.

How does the engine behave?

- It processes router candidates in returned order.
- It returns the first truthy builder contract.
- It does not continue after a truthy contract.

Are further domains discarded?

- Yes, from the public reasoning output perspective.
- They are not included in the returned public contract.
- There is no `secondaryDomains`, `candidateDomains`, `domainTrace`, or aggregation field.

Does aggregation exist?

- No aggregation exists in `ExpertReasoningEngine.analyze(...)`.
- Alternative hypotheses inside one contract come from the selected builder/provider path, not from other router domains.

Does prioritization exist?

- Yes. Prioritization is implemented by `DOMAIN_PRECEDENCE` in the router and by first-success return in the engine.

Does a corresponding test exist?

- Router multi-candidate and precedence behavior is heavily tested.
- Engine public contract shape and deterministic behavior are tested in `tests/expert-reasoning-engine-test.js`.
- There is no dedicated engine test named for first-success or asserting that later router domains are intentionally not processed after an earlier successful contract.

Assessment:

- Router side: sufficiently tested.
- Engine first-success governance: implemented and indirectly covered, but not explicitly named by a focused test.

## DOMAIN_PRECEDENCE Governance

`DOMAIN_PRECEDENCE` is defined at `portal/core/reasoning/KnowledgeDomainRouter.js:11-26`:

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

Does it have fachliche meaning?

Yes.

Reason:

- Router output order is determined by this list.
- Engine consumes router output in order.
- Engine returns first successful contract.
- Therefore, `DOMAIN_PRECEDENCE` can determine the public expert contract for overlapping inputs.

Does it have technical meaning?

Yes.

Reason:

- It is the deterministic sort order for routed domains.
- It stabilizes test expectations and engine dispatch order.

Does it determine the later Expert Contract?

Yes, when more than one domain matches and an earlier domain returns a truthy contract.

Per-domain governance assessment:

| Position | Domain | Current position assessment | Structural Systems overlap risk |
| ---: | --- | --- | --- |
| 1 | `concrete-corrosion` | Plausible as high-specificity material deterioration with potential structural relevance; early position lets concrete distress own concrete/rust/spalling overlaps. | High. Structural Systems could overlap with spalling, reinforcement distress, concrete cover and load-bearing concrete symptoms. |
| 2 | `basement-waterproofing` | Plausible because below-grade water ingress and retaining-wall/foundation contexts are specific and often need domain ownership before generic moisture/crack. | High. Structural Systems may overlap with foundation walls, retaining walls, settlement and basement cracks. |
| 3 | `balconies-terraces` | Plausible because balcony/terrace assemblies have specific envelope, drainage, waterproofing and concrete interfaces. | Medium to high. Structural Systems may overlap with cantilever slabs, balcony slabs, anchors and load-bearing balcony deterioration. |
| 4 | `drainage-rainwater` | Plausible before generic moisture because drainage defects can cause moisture but have a distinct system-level cause. | Medium. Structural Systems may overlap indirectly where drainage drives foundation movement or structural deterioration. |
| 5 | `fire-protection-systems` | Plausible as life-safety domain with specific system governance and high priority over generic door/window/electrical wording. | Low to medium. Structural fire separation/compartmentation can overlap structurally, but current domain is systems-oriented. |
| 6 | `vertical-transportation-systems` | Plausible as a specialized building system that should outrank generic door/electrical wording for elevator/escalator contexts. | Low. Structural overlap mostly around shafts/supports, not current routing core. |
| 7 | `sanitary-systems` | Plausible before generic moisture because visible sanitary leaks should remain sanitary-owned when mapped. | Low to medium. Structural overlap is indirect through leakage damage. |
| 8 | `hvac-systems` | Plausible before electrical/moisture for HVAC-specific heating, ventilation, cooling and condensate issues. | Low to medium. Structural overlap is indirect through penetrations, condensation, corrosion or plant supports. |
| 9 | `electrical-systems` | Plausible for electrical safety and system defects before windows/envelope/moisture. | Low. Structural overlap normally indirect. |
| 10 | `windows-doors` | Plausible before facade/roof/moisture/crack because opening assemblies are specific and often overlap with leakage, facade and crack symptoms. | Medium. Structural Systems may overlap at lintels, openings, load transfer, distortion and connection movement. |
| 11 | `facade-wall-systems` | Plausible before roof/moisture/crack because facade assemblies can explain exterior wall cracks, cladding, render and sealant symptoms. | High. Structural Systems may overlap with external wall movement, facade cracking, anchors and load-bearing wall context. |
| 12 | `roof-envelope` | Plausible before generic moisture because roof-envelope defects are specific causes of water ingress. | Medium. Structural Systems may overlap where roof structure or load-bearing roof elements are implicated. |
| 13 | `moisture` | Plausible as a broad cross-cutting secondary domain after more specific systems/envelope domains. | Medium. Moisture can be evidence or consequence of structural defects, but should usually not own structural primary logic. |
| 14 | `crack` | Plausible as broad generic crack domain after more specific material/envelope/system domains. | Very high. Structural Systems will likely overlap with crack most directly; `crack` is currently the generic fallback for crack-like symptoms. |

Governance conclusion:

- `DOMAIN_PRECEDENCE` is both technical and fachliche governance.
- Its current order encodes a preference for specific material/system/envelope domains before broad `moisture` and `crack` domains.
- This is compatible with Foundation 1.x single-provider behavior.

## Public Contract Stability

The public `ExpertReasoningContract` remains stable regardless of the number of router candidates.

Observed public keys from runtime probe:

```text
primaryHypothesis
alternativeHypotheses
supportingEvidence
missingEvidence
requiredVerification
potentialConsequences
confidence
```

Evidence in `tests/expert-reasoning-engine-test.js`:

- `valid contract and deterministic output` starts at line 16.
- It checks `primaryHypothesis`, `alternativeHypotheses`, `supportingEvidence`, `missingEvidence`, `requiredVerification`, `potentialConsequences`, and numeric `confidence`.
- `empty input returns stable contract` starts at line 104.
- `multiple hypotheses are returned` starts at line 122, but these are hypotheses inside one selected contract, not cross-domain aggregation.
- Language tests confirm no `language` field leaks into public output at lines 310, 337 and 365.

Conclusion:

- Public output remains exactly one contract.
- More router candidates do not add public fields.
- The architecture does not expose all candidate domains in the public contract.

## Legacy Compatibility

Legacy compatibility remains reachable.

Code evidence:

- Known-domain path with no builder contract: `if (domains.length > 0) { return this.analyzeLegacy(); }` at lines 208-209.
- No-domain path: `return this.analyzeLegacy(source);` at line 212.
- Legacy implementation starts at line 215.

Behavioral distinction:

- If domains were recognized but no builder returns a contract, legacy is called without source. This produces a stable fallback contract.
- If no domains were recognized, legacy receives source and can use the original input context.

Runtime probe evidence:

- `knownNullDomains`: `["crack"]`
- `knownNullPrimaryId`: `null`
- `knownNullConfidence`: `0`
- `unknownDomains`: `[]`
- `unknownPrimaryId`: `null`

Assessment:

- Legacy compatibility remains part of the engine contract.
- No change is recommended for Foundation 1.x.

## Structural Systems Readiness

No Structural Systems provider was developed or changed during this review.

If `structural-systems` is introduced, the first fachliche collision is with `crack` because cracks are the most direct current structural symptom surface. However, the first operational precedence collision may be with earlier high-specificity domains, especially `concrete-corrosion` and `basement-waterproofing`, depending on where `structural-systems` is inserted.

Most relevant overlap domains:

1. `crack`: direct overlap with structural distress, settlement, widening, displacement, load-bearing and opening-related movement.
2. `concrete-corrosion`: direct overlap with reinforced concrete deterioration, spalling, reinforcement corrosion and structural capacity concerns.
3. `basement-waterproofing`: overlap with foundation walls, retaining walls, basement cracks, seepage and substructure movement.
4. `facade-wall-systems`: overlap with external wall cracking, anchors, render/cladding distress and load-bearing wall context.
5. `moisture`: cross-cutting evidence or consequence that may accompany structural defects.
6. `balconies-terraces`: overlap with cantilever slabs, slab edges, anchors, concrete defects and water ingress.

Does the existing first-success model suffice?

Yes for Foundation 1.x, if the intended product behavior remains one public expert reasoning contract per input. In that case, `structural-systems` only needs a deliberate and tested position in `DOMAIN_PRECEDENCE` plus a clear scope boundary against existing structural-adjacent domains.

When would deeper architecture changes be required?

- If the product requires a public multi-domain contract.
- If users must see all candidate domains and their separate hypotheses.
- If Structural Systems must combine evidence from concrete, crack, basement, facade and moisture providers into one aggregated result.
- If later domains must still execute for traceability after an earlier domain succeeds.

Foundation 1.x recommendation:

- Do not change the engine architecture.
- Add `structural-systems` only after a precedence decision.
- Treat precedence placement as an architecture decision, not a mechanical registration step.

## Confirmed Architecture Decisions

1. Router resolves multiple applicable domains.

Evidence: independent `if` blocks in `KnowledgeDomainRouter.resolve(...)` and many multi-domain router tests.

2. Router output order is guaranteed by `DOMAIN_PRECEDENCE`.

Evidence: final return at `KnowledgeDomainRouter.js:96`.

3. Engine uses first-success dispatch.

Evidence: loop over domains and immediate `return contract` at `ExpertReasoningEngine.js:203-205`.

4. Engine returns one public reasoning contract.

Evidence: no aggregation path exists; public contract keys remain stable in engine tests and runtime probe.

5. Legacy fallback remains reachable.

Evidence: `ExpertReasoningEngine.js:208-212`.

6. `DOMAIN_PRECEDENCE` is fachliche governance.

Evidence: it determines which domain is tried first and can therefore determine the public expert contract.

## Confirmed Technical Debt

### P0

None confirmed.

No current runtime defect, release-blocking behavior, or public contract break was confirmed in this review.

### P1

None confirmed for immediate correction before accepting Foundation 1.x engine governance.

The engine/router model is internally coherent. Structural Systems still requires a precedence decision before implementation, but that is a future architecture decision, not a current engine defect.

### P2

1. Missing explicit engine first-success governance test.

Evidence:

- Router precedence and multi-candidate behavior are tested extensively.
- Engine tests validate public contract shape, determinism, fallback and language behavior.
- No focused engine test explicitly names or asserts that later router domains are not processed after an earlier successful contract.

Impact:

- Current behavior is implemented clearly and indirectly covered.
- A future test would make the governance rule harder to change accidentally.

2. Engine dispatch maintainability as domains grow.

Evidence:

- Dispatch is implemented as a chained conditional from `ExpertReasoningEngine.js:173-200`.
- This is functional and readable enough for the current domain count, but adding more domains increases the risk of registration omissions or language propagation inconsistency.

Impact:

- No refactor recommended now.
- Track as future maintainability debt after Foundation 1.x or when additional domains are added.

### INFO

1. `DOMAIN_PRECEDENCE` is both technical order and domain ownership policy.

2. Public contract remains single-contract regardless of router candidate count.

3. Legacy fallback is still compatible with the current model.

4. Structural Systems can fit the current model if it is explicitly positioned in precedence and scoped against existing domains.

## Potential Future Improvements

These are not recommended as current implementation work:

1. Add a focused engine governance test that proves first-success behavior with a multi-domain input.
2. Add a short architecture note that `DOMAIN_PRECEDENCE` is domain ownership policy for overlaps.
3. Consider a dispatch table in a later refactor if domain count grows further.
4. Consider optional internal trace/debug reporting of candidate domains only if product diagnostics need it. Do not add it to the public contract by default.
5. Before Structural Systems, document its precedence position and overlap ownership against `concrete-corrosion`, `basement-waterproofing`, `facade-wall-systems`, `moisture`, and `crack`.

## Recommendation

Should the current single-provider model remain binding for Foundation 1.x?

Yes.

Reasoning:

- Router and engine behavior are deterministic and internally coherent.
- Multi-domain recognition is already supported at the router level.
- Public reasoning output intentionally remains a single expert contract.
- Existing tests cover router precedence heavily and engine public contract stability sufficiently for current Foundation 1.x behavior.
- No P0 or P1 engine-governance defect was confirmed.

Recommendation for Structural Systems:

- Proceed with the current first-success architecture.
- Do not implement aggregation for Foundation 1.x.
- Before any provider work, decide where `structural-systems` belongs in `DOMAIN_PRECEDENCE`.
- The key decision is whether `structural-systems` should outrank `concrete-corrosion` and `basement-waterproofing`, or whether it should sit later as a broader structural fallback before `crack`.
- If the product later requires parallel domain reasoning, treat that as a Foundation 2.x architecture change, not as a prerequisite for Structural Systems under Foundation 1.x.
