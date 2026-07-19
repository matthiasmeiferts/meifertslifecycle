# Expert Intelligence Architecture

## Purpose and Scope

The Expert Intelligence layer provides deterministic hypothesis support for inspection findings. It is implemented without external AI calls, UI dependencies, or side effects. The layer currently covers building-fabric, envelope, MEP, fire protection, and vertical transportation domains.

## Architecture Flow

1. `ExpertReasoningEngine.analyze(input)` clones the caller input.
2. `KnowledgeDomainRouter.resolve(input)` returns applicable domain identifiers in deterministic precedence order.
3. The engine evaluates routed domains in order and returns the first provider result that maps to a reasoning contract.
4. Most domains map provider knowledge through `KnowledgeReasoningMapper.map({ knowledge, input })`.
5. If routed providers return no mapped result, the engine falls back to the existing legacy reasoning path.

## Provider Contract

Each knowledge provider exposes:

```js
ProviderName.getKnowledge(input)
```

The stable empty-result contract is:

```js
{
    domain: "<domain-id>",
    hypotheses: []
}
```

Provider output hypotheses use stable object fields such as `id`, `cause`, `classification`, indicator arrays, verification arrays, consequence arrays, recommended actions, and relevance fields. Some legacy domains include additional fields such as `structuralRelevance`.

Providers are expected to:

- handle empty and incomplete input safely;
- clone caller input before processing;
- return deterministic results with stable ordering;
- return fresh arrays and objects;
- avoid mutating caller input;
- use conservative wording;
- include false-positive guards and metadata-only guards where applicable.

## Router Responsibility

`KnowledgeDomainRouter` performs deterministic domain discovery only. It does not map, score confidence, diagnose, or aggregate provider output. Matchers should use explicit evidence gates and avoid routing on metadata alone.

## Engine Responsibility

`ExpertReasoningEngine` owns provider dispatch and final public reasoning shape. It preserves the single-provider principle by returning the first non-null mapped provider result in routed precedence order.

## Mapper Boundary

`KnowledgeReasoningMapper` is the shared mapping boundary for most provider-backed domains. It clones input and hypotheses, ranks hypotheses deterministically, maps the primary hypothesis and alternatives, and produces the stable public reasoning result.

Concrete corrosion, basement waterproofing, moisture, and crack reasoning include domain-specific engine mapping or ranking logic while preserving the public result shape.

## Deterministic Single-Provider Principle

The architecture intentionally does not aggregate multiple provider outputs. Multiple domains can be routed, but only the first mapped provider result is returned. This keeps results deterministic and avoids mixed-domain conclusions.

## Current Domain Precedence

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

## Evidence-Gating Principle

Domain matchers should require domain component evidence plus observable condition evidence where the domain is component-specific. Metadata-only input, document-only input, records-only input, advertisements, and general descriptive text should not route unless an observed condition is present.

## Overlap-Handling Principle

Overlap is resolved by explicit precedence, not by aggregation. Tests should document intended overlaps. Examples include:

- concrete corrosion before crack where reinforced concrete spalling and rust are present;
- basement waterproofing before moisture where below-grade evidence exists;
- fire protection before windows/doors for fire-specific door evidence;
- vertical transportation before electrical/windows for elevator buttons and lift landing doors;
- sanitary before moisture where sanitary component leakage is explicit;
- drainage/rainwater before roof-envelope/moisture for rainwater collection and discharge components.

## Wording and Safety Guardrails

User-facing hypothesis, limitation, verification, consequence, and recommendation strings must remain conservative. They should avoid confirmed diagnosis, confirmed hazard, legal or regulatory conclusions, compliance or non-compliance conclusions, certification or approval validity, mandatory repair or replacement language, and safety or functionality guarantees.

Internal detection vocabulary and tests may contain guarded terms, but generated provider output should not assert those concepts.

## Test Requirements for New Providers

New domains should add:

- focused provider tests for empty input, incomplete input, positive evidence, false positives, deterministic output, stable ordering, input immutability, fresh output arrays, public contract shape, and forbidden wording;
- reasoning integration tests for engine dispatch, mapped output, unchanged public API, single-provider behaviour, no aggregation, deterministic output, input immutability, empty-provider fallback where applicable, and forbidden output wording;
- router tests for positive routing, false positives, metadata-only input, overlap precedence, deterministic routing, and existing-domain regressions.

## Current Provider Inventory

| Provider | Domain | Public method | Provider test | Reasoning integration test |
| --- | --- | --- | --- | --- |
| `BalconiesTerracesKnowledgeProvider` | `balconies-terraces` | `getKnowledge(input)` | `tests/balconies-terraces-knowledge-provider-test.js` | `tests/balconies-terraces-reasoning-integration-test.js` |
| `BasementWaterproofingKnowledgeProvider` | `basement-waterproofing` | `getKnowledge(input)` | `tests/basement-waterproofing-knowledge-provider-test.js` | `tests/basement-waterproofing-reasoning-integration-test.js` |
| `ConcreteCorrosionKnowledgeProvider` | `concrete-corrosion` | `getKnowledge(input)` | `tests/concrete-corrosion-knowledge-provider-test.js` | `tests/concrete-corrosion-reasoning-integration-test.js` |
| `CrackKnowledgeProvider` | `cracks` | `getKnowledge(input)` | `tests/crack-knowledge-provider-test.js` | `tests/crack-reasoning-integration-test.js` |
| `DrainageRainwaterKnowledgeProvider` | `drainage-rainwater` | `getKnowledge(input)` | `tests/drainage-rainwater-knowledge-provider-test.js` | `tests/drainage-rainwater-reasoning-integration-test.js` |
| `ElectricalSystemsKnowledgeProvider` | `electrical-systems` | `getKnowledge(input)` | `tests/electrical-systems-knowledge-provider-test.js` | `tests/electrical-systems-reasoning-integration-test.js` |
| `FacadeWallSystemsKnowledgeProvider` | `facade-wall-systems` | `getKnowledge(input)` | `tests/facade-wall-systems-knowledge-provider-test.js` | `tests/facade-wall-systems-reasoning-integration-test.js` |
| `FireProtectionSystemsKnowledgeProvider` | `fire-protection-systems` | `getKnowledge(input)` | `tests/fire-protection-systems-knowledge-provider-test.js` | `tests/fire-protection-systems-reasoning-integration-test.js` |
| `HvacSystemsKnowledgeProvider` | `hvac-systems` | `getKnowledge(input)` | `tests/hvac-systems-knowledge-provider-test.js` | `tests/hvac-systems-reasoning-integration-test.js` |
| `MoistureKnowledgeProvider` | `moisture` | `getKnowledge(input)` | `tests/moisture-knowledge-provider-test.js` | `tests/moisture-reasoning-integration-test.js` |
| `RoofEnvelopeKnowledgeProvider` | `roof-envelope` | `getKnowledge(input)` | `tests/roof-envelope-knowledge-provider-test.js` | `tests/roof-envelope-reasoning-integration-test.js` |
| `SanitarySystemsKnowledgeProvider` | `sanitary-systems` | `getKnowledge(input)` | `tests/sanitary-systems-knowledge-provider-test.js` | `tests/sanitary-systems-reasoning-integration-test.js` |
| `VerticalTransportationSystemsKnowledgeProvider` | `vertical-transportation-systems` | `getKnowledge(input)` | `tests/vertical-transportation-systems-knowledge-provider-test.js` | `tests/vertical-transportation-systems-reasoning-integration-test.js` |
| `WindowsDoorsKnowledgeProvider` | `windows-doors` | `getKnowledge(input)` | `tests/windows-doors-knowledge-provider-test.js` | `tests/windows-doors-reasoning-integration-test.js` |

## Checklist for Adding a Future Domain

1. Add a provider with the stable empty contract and deterministic hypothesis ranking.
2. Add focused provider tests before engine/router integration.
3. Wire the provider into `ExpertReasoningEngine` through the existing dispatch loop.
4. Add router matcher and precedence only where justified by overlap behaviour.
5. Extend `tests/knowledge-domain-router-test.js` with positives, negatives, overlaps, and regressions.
6. Add reasoning integration tests for dispatch, public result shape, determinism, immutability, and no aggregation.
7. Run focused tests, provider suite, reasoning integration suite, router test, engine test, full JavaScript suite, and `git diff --check`.
8. Update this document if the architecture or provider inventory changes.

## Known Technical Debt

- `CrackKnowledgeProvider` returns provider domain `cracks`, while the router and engine domain key is `crack`. This is covered by existing tests and is not currently blocking, but it is the main domain identifier inconsistency.
- Older provider tests vary in depth. Recent domains have stronger explicit coverage for fresh arrays, public contract shape, single-provider behaviour, no aggregation, and forbidden wording.
- Router matchers intentionally duplicate component and issue vocabulary across providers. This keeps routing local and explicit, but future domains should watch for drift between provider relevance gates and router gates.