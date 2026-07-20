# Risk Relevance Implementation Readiness Architecture 1.0

## 1. Document Status

This document is an architecture-only implementation readiness specification for Foundation 1.5 Sprint I-3D.

It defines the technical target architecture for implementing governed `riskRelevance` handling after the approved governance architecture in `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`.

This document contains no productive implementation, no executable test, no provider change, no router change, no engine change, no Internal Model change, no Interpretation Model change, no public contract change, no UI behavior, no API behavior, no report behavior, and no persistence behavior.

## 2. Scope

This architecture covers only internal `riskRelevance` governance readiness.

It defines:

- Governance Registry architecture.
- Canonical Relevance values.
- Value-state model.
- Version transport.
- Legacy detection.
- Legacy mapping boundaries.
- Invalid and unknown handling.
- Internal Model representation.
- Interpretation Model input control.
- Conflict types.
- Multi-contract behavior.
- Multi-domain behavior.
- Provider migration architecture.
- Test architecture.
- Implementation sequence.

## 3. Non-Scope

This architecture MUST NOT define or authorize:

- Public risk scoring.
- Score formulas.
- Weighted aggregation.
- Review priority.
- Public risk class.
- Public risk summary.
- Public result classification.
- CAPEX calculation.
- RUL calculation.
- Transaction recommendation.
- Professional final decision.
- UI exposure.
- Report exposure.
- API exposure.
- Persistence exposure.

## 4. Governing Baseline

The governing architecture is `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`.

The following decisions are binding:

- `riskRelevance` is an independent, source-bound, qualitative internal source signal.
- `concernCategory` is the canonical internal interpretation outcome.
- `riskRelevance` alone MUST NOT create a Concern Category.
- Canonical `riskRelevance` values are `LOW_RELEVANCE`, `MODERATE_RELEVANCE`, and `HIGH_RELEVANCE`.
- `UNKNOWN_RELEVANCE` MUST NOT be a canonical fachlicher value.
- Unknown relevance is represented by value state `UNKNOWN_VALUE`.
- `riskRelevanceVersion` is transported on the source element that carries `riskRelevance`.

## 5. Repository Baseline Matrix

| Area | Current fact | Target consequence |
| --- | --- | --- |
| Providers | 15 Knowledge Providers emit hypothesis-level `riskRelevance` strings. | Registry MUST classify source-element values, not provider files. |
| Provider values | Runtime provider values are `low`, `medium`, and `high`. | These values require supported legacy mapping during migration. |
| Provider versioning | Providers do not emit `riskRelevanceVersion`. | Missing element version MUST be represented, not silently invented. |
| Engine | `ExpertReasoningEngine` transports provider hypotheses into Expert Reasoning Contracts. | Engine MUST NOT validate or interpret relevance. |
| Router | `KnowledgeDomainRouter` orders domains and can return multiple domains. | Router precedence MUST NOT alter relevance value state. |
| Internal Model | `BuildingRiskInternalModel` clones raw hypotheses and preserves `riskRelevance` only inside raw source structures. | Internal Model needs explicit relevance entries in a future implementation. |
| Interpretation Model | `BuildingRiskInterpretationModel` currently includes `riskRelevance` in category source fields. | Interpretation input control must remove direct relevance-to-concern mapping before relevance interpretation. |
| Tests | Current tests assert string transport and legacy direct alias behavior. | Future tests must separate preservation from interpretation. |
| Conflicts | Existing conflict taxonomy has no relevance-specific conflicts. | Relevance conflict types must be added only to internal conflict register. |

## 6. Provider Inventory

The baseline analysis covers these provider files:

- `StructuralSystemsKnowledgeProvider.js`
- `SanitarySystemsKnowledgeProvider.js`
- `ElectricalSystemsKnowledgeProvider.js`
- `MoistureKnowledgeProvider.js`
- `BasementWaterproofingKnowledgeProvider.js`
- `WindowsDoorsKnowledgeProvider.js`
- `VerticalTransportationSystemsKnowledgeProvider.js`
- `FireProtectionSystemsKnowledgeProvider.js`
- `DrainageRainwaterKnowledgeProvider.js`
- `ConcreteCorrosionKnowledgeProvider.js`
- `HvacSystemsKnowledgeProvider.js`
- `BalconiesTerracesKnowledgeProvider.js`
- `RoofEnvelopeKnowledgeProvider.js`
- `FacadeWallSystemsKnowledgeProvider.js`
- `CrackKnowledgeProvider.js`

All listed providers transport `riskRelevance` as a source hypothesis field. None transports `riskRelevanceVersion` in the current baseline.

## 7. Current Producer-Consumer Chain

The current chain is:

1. Knowledge Provider produces hypothesis fields, including `riskRelevance`.
2. Expert Reasoning mapper or engine adapter transports hypothesis fields into an Expert Reasoning Contract.
3. `BuildingRiskInternalModel` preserves cloned hypothesis data.
4. `BuildingRiskInterpretationModel` currently reads `riskRelevance` as a category source field.

The target architecture keeps steps 1 and 2 transport-only. Governance classification belongs in the Building Risk risk layer.

## 8. Implementation Problem Statement

The repository is not implementation-ready for interpretation because the current Interpretation Model can derive Concern Categories directly from `riskRelevance` aliases.

The repository can become implementation-ready for registry and Internal Model preservation if this document fixes:

- registry ownership,
- canonical values,
- value states,
- version transport,
- legacy mapping,
- invalid handling,
- conflict taxonomy,
- source-bound internal representation,
- tests for preservation without interpretation.

## 9. Registry Architecture Alternatives

| Option | Description | Decision |
| --- | --- | --- |
| A | Independent Risk-layer registry module. | Accepted. |
| B | Constants embedded in `BuildingRiskInternalModel`. | Rejected. It couples governance to one model implementation. |
| C | Constants embedded in `ExpertReasoningEngine`. | Rejected. Engine is a transport and dispatch layer. |
| D | Provider-local definitions. | Rejected. Provider-local governance would duplicate rules and break cross-domain consistency. |
| E | Global platform governance registry. | Rejected for this sprint. The scope is risk relevance only. |

## 10. Registry Architecture Decision

The implementation MUST introduce an independent Risk-layer Governance Registry.

The target module name is:

`portal/core/risk/RiskRelevanceGovernanceRegistry.js`

The registry MUST be imported by Building Risk risk-layer code only. Providers, router, engine, UI, reports, APIs, and persistence code MUST NOT import it in Foundation 1.5.

The registry MUST expose a narrow pure-function API. Implementation names may vary only if they preserve these boundaries:

```text
classifyRiskRelevance(sourceElement, context) -> RiskRelevanceEntry
classifyRiskRelevanceValue(rawValue) -> { rawValue, canonicalValue, valueState }
classifyRiskRelevanceVersion(rawVersion) -> { rawVersion, versionState, governanceVersion }
isRiskRelevanceConflictCandidate(entry) -> boolean
buildRiskRelevanceConflict(entries, scope) -> ConflictDescriptor | null
```

The API MUST return structured result objects and MUST NOT throw for ordinary source data states such as missing, unknown, unsupported legacy, unsupported version, or invalid value type. Throwing is allowed only for programmer errors inside the registry implementation itself, not for source contract content.

## 11. Registry Responsibilities

The registry MUST define:

- Canonical values.
- Supported legacy values.
- Unsupported legacy values.
- Value states.
- Supported governance version identifiers.
- Source-field names.
- Deterministic classification rules.
- Deterministic normalization rules.
- Deterministic conflict classification helpers.

The registry MUST also define the returned entry shape and the allowed conflict descriptor shape. These shapes are internal data contracts for `BuildingRiskInternalModel` and MUST be covered by tests before the Internal Model imports the registry.

## 12. Registry Non-Responsibilities

The registry MUST NOT:

- Create Concern Categories.
- Create risk scores.
- Create review priority.
- Read provider internals.
- Read router precedence.
- Read UI state.
- Read reports.
- Read persistence state.
- Mutate source contracts.
- Produce public contract fields.

## 13. Canonical Values

The canonical value set is closed:

- `LOW_RELEVANCE`
- `MODERATE_RELEVANCE`
- `HIGH_RELEVANCE`

No other canonical value is allowed in Foundation 1.5.

## 14. Rejected Canonical Values

The following values MUST NOT become canonical `riskRelevance` values:

- `UNKNOWN_RELEVANCE`
- `CRITICAL_RELEVANCE`
- `VERY_HIGH_RELEVANCE`
- `NOT_RELEVANT`
- `NOT_ASSESSED`
- `NOT_APPLICABLE`
- `SAFETY_RELEVANT`
- `SAFETY_CRITICAL`

`very high` remains observed `structuralRelevance` vocabulary in Crack knowledge. It MUST NOT be mapped to canonical `riskRelevance`.

## 15. Canonical Value Semantics

`LOW_RELEVANCE` means the source element carries low internal relevance for later risk interpretation context.

`MODERATE_RELEVANCE` means the source element carries moderate internal relevance for later risk interpretation context.

`HIGH_RELEVANCE` means the source element carries high internal relevance for later risk interpretation context.

These values do not express likelihood, severity, confidence, safety status, review priority, score, or public risk class.

## 16. State Model

The closed `valueState` set is:

- `CANONICAL`
- `LEGACY_SUPPORTED`
- `LEGACY_UNSUPPORTED`
- `UNKNOWN_VALUE`
- `INVALID_VALUE`
- `NOT_PRESENT`

The closed `versionState` set is:

- `VERSION_SUPPORTED`
- `UNKNOWN_VERSION`
- `VERSION_UNSUPPORTED`

State values describe technical handling state. They are not fachliche Relevance values.

The implementation MUST treat `valueState` and `versionState` as independent axes. A missing version MUST NOT change a valid value into an invalid value, and an invalid value MUST NOT hide an unsupported version.

Minimum required state-combination matrix:

| Raw value condition | Raw version condition | valueState | versionState | canonicalValue | interpretationEligible |
| --- | --- | --- | --- | --- | --- |
| canonical value | supported version | `CANONICAL` | `VERSION_SUPPORTED` | canonical value | `false` in Foundation 1.5 |
| canonical value | missing version | `CANONICAL` | `UNKNOWN_VERSION` | canonical value | `false` |
| canonical value | unsupported version | `CANONICAL` | `VERSION_UNSUPPORTED` | canonical value | `false` |
| supported legacy value | missing version | `LEGACY_SUPPORTED` | `UNKNOWN_VERSION` | mapped canonical value | `false` |
| supported legacy value | supported version | `LEGACY_SUPPORTED` | `VERSION_SUPPORTED` | mapped canonical value | `false` |
| recognized unsupported legacy value | any version state | `LEGACY_UNSUPPORTED` | resolved independently | `null` | `false` |
| explicit unknown token | any version state | `UNKNOWN_VALUE` | resolved independently | `null` | `false` |
| malformed or unsupported typed value | any version state | `INVALID_VALUE` | resolved independently | `null` | `false` |
| absent `riskRelevance` field | absent version | `NOT_PRESENT` | `UNKNOWN_VERSION` | `null` | `false` |

`LEGACY_MISSING_VERSION` MUST NOT be introduced as a separate state in Foundation 1.5. It is represented by the combination `valueState: LEGACY_SUPPORTED` and `versionState: UNKNOWN_VERSION`.

## 17. Value-State Semantics

`CANONICAL` means a raw value equals one of the canonical values.

`LEGACY_SUPPORTED` means a raw legacy value has an approved deterministic mapping.

`LEGACY_UNSUPPORTED` means a raw legacy value is recognized but not accepted for mapping.

`UNKNOWN_VALUE` means the source explicitly conveys unknown relevance or a null-like unknown token.

`INVALID_VALUE` means the source value has an unsupported type or malformed structure.

`NOT_PRESENT` means the source element does not carry `riskRelevance`.

`VERSION_SUPPORTED` means the source element carries an accepted `riskRelevanceVersion`.

`UNKNOWN_VERSION` means the source element does not carry `riskRelevanceVersion`.

`VERSION_UNSUPPORTED` means the source element carries an unsupported `riskRelevanceVersion`.

`UNKNOWN_VERSION` includes both missing source-element version and null-like version values. It MUST NOT mean that the value itself is unknown.

## 18. Version Model

The registry MUST define the first governance version as:

`risk-relevance-governance-1.0`

The source field name is:

`riskRelevanceVersion`

The version belongs to the same source element as `riskRelevance`.

## 19. Version Transport Rules

For future provider migration, each hypothesis that carries `riskRelevance` MUST carry `riskRelevanceVersion` next to it.

The Internal Model MUST preserve both fields as source-bound evidence. It MUST NOT inject a provider version into source hypotheses that did not carry one.

If a source hypothesis lacks `riskRelevanceVersion`, the classified relevance entry MUST set `versionState` to `UNKNOWN_VERSION`.

If a source hypothesis carries an unsupported `riskRelevanceVersion`, the classified relevance entry MUST set `versionState` to `VERSION_UNSUPPORTED`.

The `valueState` MUST continue to describe only the raw relevance value. A valid legacy value with missing version is therefore `valueState: LEGACY_SUPPORTED` and `versionState: UNKNOWN_VERSION`.

## 20. Version Compatibility Rules

The registry MUST accept only explicitly supported governance versions.

Unsupported versions MUST be preserved with raw version text.

Unsupported versions MUST NOT be silently treated as canonical.

Version handling MUST be deterministic and order-independent.

## 21. Legacy Detection

Legacy detection MUST run before invalid rejection for string values.

The registry MUST trim ASCII whitespace and compare case-insensitively for legacy string values.

The registry MUST NOT infer legacy meaning from prose, classification text, cause text, consequence text, severity fields, confidence fields, or structural relevance fields.

## 22. Supported Legacy Mapping

Supported legacy mappings are:

| Raw value | Canonical value | Reason |
| --- | --- | --- |
| `low` | `LOW_RELEVANCE` | Current provider runtime value. |
| `medium` | `MODERATE_RELEVANCE` | Current provider runtime value. |
| `moderate` | `MODERATE_RELEVANCE` | Approved governance legacy alias; not a current provider runtime value. |
| `high` | `HIGH_RELEVANCE` | Current provider runtime value. |

These mappings are migration support. Providers MUST migrate to canonical values in a later implementation step.

No additional test-only alias may be promoted to supported legacy mapping unless it is explicitly approved by the governance architecture. Current tests that use `critical`, `safety_relevant`, or `safety_critical` are compatibility hazards, not supported relevance mappings.

## 23. Unsupported Legacy Boundaries

The following values MUST be recognized as unsupported for `riskRelevance`:

- `critical`
- `safety_relevant`
- `safety-critical`
- `safety_critical`
- `very high`
- `very_high`
- `unknown`
- `not assessed`
- `not_assessed`
- `not applicable`
- `not_applicable`

Unsupported legacy values MUST NOT map to a Concern Category.

## 24. Unknown Handling

Unknown handling MUST use value state, not canonical value.

The raw values `unknown`, `UNKNOWN`, `null`, and empty strings MUST NOT become `UNKNOWN_RELEVANCE`.

If the source explicitly conveys unknown relevance, the relevance entry MUST preserve the raw value and set `valueState` to `UNKNOWN_VALUE`.

## 25. Invalid Handling

Invalid handling MUST preserve raw input type information.

Arrays, objects, booleans, numbers, malformed strings, and unsupported symbolic strings MUST NOT be coerced into canonical relevance.

Invalid values MUST NOT block Internal Model construction. They MUST be preserved as internal audit data.

Validation pipeline order MUST be:

1. Detect source-field presence on the exact source element.
2. Preserve raw value and raw version without mutation.
3. Classify version state independently.
4. Classify string canonical values by exact canonical tokens.
5. Classify supported legacy strings by trimmed, case-insensitive token match.
6. Classify recognized unsupported legacy strings.
7. Classify explicit unknown and null-like values.
8. Classify malformed strings and non-string values as invalid unless explicitly handled above.
9. Emit a structured relevance entry for every source element checked.
10. Emit conflict candidates without throwing.

The registry MUST be total for source data: every input value, including `undefined`, `null`, object, array, boolean, number, empty string, and unknown string, MUST produce a deterministic classification result.

## 26. Non-Productive Pseudostructure

The following structure is non-productive architecture guidance and MUST NOT be treated as implemented code:

```text
RiskRelevanceEntry = {
  sourceReference,
  sourceElementReference,
  sourceElementType,
  sourceField,
  rawValue,
  canonicalValue,
  valueState,
  rawVersion,
  versionState,
  governanceVersion,
  interpretationEligible,
  conflictReferences
}
```

`domainId` and `hypothesisId` MAY be copied as convenience metadata only if already available on the enclosing Internal Model element. They MUST NOT be the primary binding mechanism. The primary binding MUST be `sourceReference` plus `sourceElementReference`, because relevance is source-element bound and may later appear outside hypotheses.

## 27. Internal Model Representation

The Internal Model MUST represent relevance as explicit source-bound entries.

The target location is a new internal collection on the prepared source contract or domain assessment. The collection name MUST be `riskRelevanceEntries` in implementation.

Each entry MUST link to the source contract reference and source hypothesis reference.

The source hypothesis reference MUST use the same deterministic reference convention as existing Internal Model element references. It MUST be stable under repeated builds and MUST not include provider class names, router candidate order, keyword matches, local file paths, or raw prose snippets.

Each entry MUST preserve raw value, canonical value when available, value state, version state, and governance version.

## 28. Internal Model Binding Rules

The Internal Model MUST bind relevance entries to the source element that carried the field.

If the value came from `primaryHypothesis`, the entry MUST reference that hypothesis source.

If the value came from `alternativeHypotheses`, the entry MUST reference the specific alternative hypothesis source.

If the value came from a red flag or consequence in future data, the entry MUST reference that exact source element and MUST NOT be lifted to the whole contract without the source reference.

## 29. Internal Model Non-Interpretation Rule

The Internal Model MUST NOT convert `riskRelevance` into:

- `riskCategory`
- `concernCategory`
- `riskConcern`
- risk score
- review priority
- public risk class

The Internal Model may classify relevance value state only.

## 30. Interpretation Model Input Control

Before any relevance interpretation can be implemented, the Interpretation Model MUST stop treating raw `riskRelevance` as an explicit category source field.

Target rule:

- `concernCategory`, `riskCategory`, and `riskConcern` may remain explicit category fields.
- `riskRelevance` MUST be removed from direct category source extraction.
- Relevance entries may be read only as supporting internal context after a separate interpretation architecture approves that behavior.

## 31. Alias Migration Rule

Current Interpretation Model aliases `low`, `moderate`, `high`, `critical`, `safety_relevant`, and `safety_critical` can create Concern Categories.

This behavior is a migration risk.

The future implementation MUST add tests that prove:

- `riskRelevance: "low"` does not create `LOW_CONCERN` by itself.
- `riskRelevance: "moderate"` does not create `MODERATE_CONCERN` by itself.
- `riskRelevance: "high"` does not create `ELEVATED_CONCERN` by itself.
- `riskRelevance: "critical"` does not create `CRITICAL_CONCERN`.
- explicit `concernCategory` still creates the governed Concern Category.

## 32. Interpretation Eligibility Flag

Each relevance entry MUST include an `interpretationEligible` flag or equivalent state.

For Foundation 1.5 registry and Internal Model implementation, `interpretationEligible` MUST be `false` for all relevance entries.

No implementation in this sprint may set it to `true`.

## 33. Conflict Taxonomy

The Internal Model conflict register MUST add relevance-specific conflict types only as internal conflicts.

Target conflict types are:

- `RISK_RELEVANCE_VALUE_CONFLICT`
- `RISK_RELEVANCE_VERSION_CONFLICT`
- `RISK_RELEVANCE_LEGACY_UNSUPPORTED`
- `RISK_RELEVANCE_INVALID_VALUE`
- `RISK_RELEVANCE_UNKNOWN_VALUE`
- `RISK_RELEVANCE_ALIAS_CONFLICT`

These conflicts MUST NOT block Internal Model construction.

## 34. Conflict Semantics

`RISK_RELEVANCE_VALUE_CONFLICT` means multiple relevance entries for the same source scope produce different canonical values.

`RISK_RELEVANCE_VERSION_CONFLICT` means entries in one source scope use incompatible relevance governance versions.

`RISK_RELEVANCE_LEGACY_UNSUPPORTED` means a recognized unsupported legacy value is present.

`RISK_RELEVANCE_INVALID_VALUE` means a malformed or unsupported typed value is present.

`RISK_RELEVANCE_UNKNOWN_VALUE` means the source explicitly conveys unknown relevance.

`RISK_RELEVANCE_ALIAS_CONFLICT` means a raw `riskRelevance` token overlaps with current or historical interpretation aliases that could create a Concern Category outside governed relevance handling, for example `critical`, `safety_relevant`, or `safety_critical`.

`RISK_RELEVANCE_VALUE_CONFLICT` is limited to entries that share the same source scope and produce different canonical values. It MUST NOT compare unrelated source contracts merely because they belong to the same domain.

## 35. Conflict Effects

Relevance conflicts MUST:

- be preserved in the Internal Model conflict register,
- be source-referenced,
- be deterministic,
- not create Concern Categories,
- not create score fields,
- not create review priority,
- not block non-relevance Internal Model processing.

## 36. Multi-Contract Behavior

Each source contract MUST be classified independently.

The Internal Model MUST NOT average, rank, or collapse relevance across contracts.

If two contracts carry conflicting relevance values for the same domain, the conflict MUST be represented as an internal conflict only.

Same-domain differences across different source contracts are not automatically conflicts. They become relevance conflicts only when the implementation can identify the same source element, same externally supplied source reference, or same governed comparison scope. Otherwise they are parallel source-bound observations.

Source contract order MUST NOT change canonical classification results.

## 37. Multi-Domain Behavior

Router multi-domain behavior and engine first-success behavior remain outside the registry.

If multiple contracts from multiple domains are later supplied to the Internal Model, relevance entries MUST remain domain-bound and source-bound.

Domain precedence MUST NOT change value state.

Domain overlap conflicts MUST remain separate from relevance conflicts.

## 38. Provider Migration Architecture

Provider migration has two provider-local phases:

1. Add `riskRelevanceVersion` next to existing legacy `riskRelevance` values.
2. Replace legacy values with canonical values.

Phase 1 MUST preserve current provider outputs except for the added version field.

Phase 2 MUST be covered by provider-specific tests and integration tests.

Neither phase is authorized by this document as a productive code change.

Provider migration MUST occur only after registry and Internal Model relevance-entry tests pass. Provider migration MUST NOT be used to make the registry implementation pass by changing source facts first.

## 39. Provider Migration Order

The provider migration order MUST be deterministic:

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

This order follows current router precedence for migration planning only. It MUST NOT define relevance priority.

## 40. Registry Test Architecture

Registry tests MUST cover:

- canonical value acceptance,
- supported legacy mapping,
- unsupported legacy rejection,
- unknown value state,
- invalid value state,
- not-present state,
- unknown version state,
- supported version acceptance,
- immutability of source input,
- deterministic output across repeated calls.

## 41. Internal Model Test Architecture

Internal Model tests MUST cover:

- relevance entries are created from source hypotheses,
- raw values are preserved,
- canonical values are populated only for canonical and supported legacy values,
- value states are preserved,
- version states are preserved,
- relevance conflicts are source-referenced,
- invalid relevance does not block Internal Model construction,
- no public score, review priority, or risk class is created.

## 42. Interpretation Model Test Architecture

Interpretation Model tests MUST cover the migration away from raw relevance aliasing.

Required tests:

- raw `riskRelevance` alone creates no concern,
- relevance entries with `interpretationEligible: false` create no concern,
- explicit `concernCategory` still creates concern,
- unsupported legacy relevance does not create critical concern,
- missing evidence remains non-risk-generating,
- completeness remains separate from professional unknown.

## 43. Provider Test Architecture

Provider tests MUST cover:

- `riskRelevance` remains present during migration,
- `riskRelevanceVersion` is added only in the authorized provider migration sprint,
- canonical values replace legacy values only after registry support exists,
- provider output stays deterministic,
- provider input stays immutable.

## 44. Integration Test Architecture

Integration tests MUST cover:

- provider to Expert Reasoning transport preserves relevance fields,
- engine first-success behavior remains unchanged,
- router precedence remains unchanged,
- Internal Model relevance entries are source-bound,
- Interpretation Model does not read raw relevance as Concern Category source,
- no public contract fields are introduced.

## 45. Implementation Sequence

The implementation sequence MUST be gated, not a single uninterrupted sprint:

1. Add Risk-layer Governance Registry.
2. Add registry unit tests.
3. Add Internal Model relevance-entry construction.
4. Add Internal Model relevance tests.
5. Add relevance conflict classification.
6. Add conflict tests.
7. Stop and review Registry/Internal Model results.
8. In a separate Interpretation input-control sprint, remove raw `riskRelevance` category extraction.
9. Add Interpretation Model alias migration tests in that separate sprint.
10. Stop and review interpretation lock results.
11. In a provider migration sprint, add provider `riskRelevanceVersion` fields.
12. Add provider version tests.
13. Stop and review provider-version migration results.
14. In a later provider value migration sprint, migrate provider values to canonical values.
15. Add integration tests for provider-to-internal preservation.

Steps 1 through 6 are the maximum scope that can be considered ready from this document. Steps 8 through 15 are intentionally sequenced here for dependency visibility but are not implementation-ready without their own sprint gate and review approval.

## 46. Compatibility Strategy

Compatibility MUST be maintained by registry-supported legacy mapping, not by preserving direct Interpretation Model aliasing.

Legacy provider values must continue to classify internally while providers migrate.

Unsupported legacy values must remain visible for audit and conflict handling.

Adding `riskRelevanceEntries` to the Internal Model MUST be additive. Existing `domainAssessments`, `hypotheses`, `sourceContracts`, `conflicts`, and `auditContext` shapes MUST remain backward compatible unless a separate Internal Model version decision is approved. If the collection is placed on `domainAssessment`, it MUST be present as an array, including an empty array when no entries exist, to keep downstream validation deterministic.

## 47. Determinism and Mutation Safety

All registry and Internal Model relevance handling MUST be deterministic.

The implementation MUST NOT mutate input contracts, hypotheses, arrays, or nested source objects.

Repeated classification of the same source input MUST produce the same output.

## 48. Public Boundary

No relevance entry, value state, conflict, or version field may be exposed through a public Building Risk Score contract in Foundation 1.5.

The future public contract terms `riskClass`, `riskSummary`, and `resultClassification` remain out of scope.

## 49. Review Priority Boundary

`riskRelevance` MUST NOT create or influence `reviewPriority` in Foundation 1.5.

Any future review-priority architecture must be separate and must not treat relevance as a score or escalation formula.

## 50. Score Boundary

`riskRelevance` MUST NOT be numeric.

`riskRelevance` MUST NOT be weighted.

`riskRelevance` MUST NOT be averaged.

`riskRelevance` MUST NOT be used in a formula.

## 51. Readiness Decisions

`READY FOR RISK RELEVANCE REGISTRY IMPLEMENTATION`

Reason: registry ownership, values, states, versioning, legacy mapping, invalid handling, pure-function API, non-throwing error behavior, state-combination matrix, and tests are fully defined for a Risk-layer implementation.

`READY FOR RISK RELEVANCE INTERNAL MODEL PRESERVATION IMPLEMENTATION`

Reason: source-bound relevance entry structure, source-element references, additive output compatibility, conflict behavior, multi-contract behavior, and mutation boundaries are fully defined.

`NOT READY FOR RISK RELEVANCE INTERPRETATION IMPLEMENTATION`

Reason: current Interpretation Model direct alias behavior must first be removed and validated. Relevance-to-concern interpretation requires a separate approved interpretation architecture.

## 52. Final Architecture Decision

Foundation 1.5 may implement the Risk-layer Governance Registry and Internal Model preservation architecture after review approval of this document.

Foundation 1.5 MUST NOT implement relevance-derived Concern Categories.

Foundation 1.5 MUST NOT expose `riskRelevance` publicly.

Final status:

`READY FOR RISK RELEVANCE IMPLEMENTATION READINESS REVIEW`