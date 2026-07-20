# Risk Relevance Governance Architecture 1.0

## 1. Document Status

Document: `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`

Foundation: 1.5

Sprint: I-3A

Status: Architecture decision document only.

This document defines governance for `riskRelevance`. It does not implement code, tests, public contracts, APIs, UI, reports, persistence, formulas, weighting, score behavior, review priority, CAPEX, RUL, valuation, acquisition advice, or safety certification.

## 2. Purpose

`riskRelevance` is a structured qualitative source signal that states whether a provider hypothesis is relevant for later internal Building Risk interpretation.

It MUST remain source-bound, provider-independent, domain-independent, deterministic, non-numeric, and auditable.

It MUST NOT be a score, probability, severity, criticality, confidence, completeness state, structural relevance statement, safety statement, purchase recommendation, review priority, valuation statement, or public contract field.

## 3. Scope

This document governs:

- the meaning of `riskRelevance`
- allowed canonical values
- legacy values currently present in the repository
- future provider rules
- future Internal Model preservation rules
- future Interpretation Model usage rules
- conflict rules
- versioning and migration rules
- test governance for later implementation

This document does not change productive files or tests.

## 4. Existing System Context

Foundation 1.4 established the following architecture chain:

```text
ExpertReasoningContract(s)
-> BuildingRiskInternalModel
-> BuildingRiskInterpretationModel
-> future Public Contract
```

`BuildingRiskInternalModel` is a preservation and preparation layer. It consumes ExpertReasoningContracts, preserves source content, creates deterministic references, separates confidence, completeness, conflicts, unknown, invalid and legacy states, and produces no risk class, public contract, score, or review priority.

`BuildingRiskInterpretationModel` consumes only `BuildingRiskInternalModel` output. It currently recognizes explicit structured fields named `riskCategory`, `concernCategory`, `riskConcern`, and `riskRelevance`. It does not use `structuralRelevance`, severity, criticality, status, domain ID, provider class, router position, missing evidence, completeness, or confidence as direct category sources.

The Expert Intelligence layer remains first-success at public reasoning output level. Router precedence is fachliche governance for selecting one public ExpertReasoningContract per source input, but the Building Risk layer MUST NOT use router position, provider class, or domain precedence as risk relevance.

## 5. Repository Findings

### 5.1 Bestandsmatrix

| File | Domain | Field | Used values | Data type | Source | Consumer | Current semantics | Contradictions | Legacy risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` | `balconies-terraces` | `riskRelevance` | `medium`, `high` | string | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative provider relevance | no formal version or closed semantics | low/medium/high are unversioned legacy values |
| `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` | `basement-waterproofing` | `riskRelevance` | `medium`, `high` | string | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative provider relevance | no formal version or closed semantics | unversioned legacy values |
| `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` | `concrete-corrosion` | `riskRelevance` | `medium`, `high` | string | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative durability or material relevance | no formal version or closed semantics | unversioned legacy values |
| `portal/core/knowledge/CrackKnowledgeProvider.js` | `crack` | `riskRelevance` | `low`, `medium`, `high` | string | provider hypotheses | custom crack builder, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative crack relevance | overlaps with `structuralRelevance`; no formal separation in provider data | unversioned legacy values; structural overlap risk |
| `portal/core/knowledge/CrackKnowledgeProvider.js` | `crack` | `structuralRelevance` | `low`, `medium`, `high`, `very high` | string | provider hypotheses | ExpertReasoningContract, Internal Model preservation | structural-context signal | MUST NOT be interpreted as `riskRelevance` | own scale is incompatible with risk relevance |
| `portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js` | `drainage-rainwater` | `riskRelevance` | `medium`, `high` | string | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative drainage relevance | no formal version or closed semantics | unversioned legacy values |
| `portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js` | `electrical-systems` | `riskRelevance` | `low`, `medium`, `high` | string argument to helper | provider hypotheses | provider output, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative systems relevance | low/medium/high may be mistaken for severity | unversioned helper values |
| `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` | `facade-wall-systems` | `riskRelevance` | `low`, `medium`, `high` | string | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative facade relevance | no formal version or closed semantics | unversioned legacy values |
| `portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js` | `fire-protection-systems` | `riskRelevance` | `medium`, `high` | string argument to helper | provider hypotheses | provider output, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative systems relevance | life-safety domain can be confused with review priority | unversioned helper values |
| `portal/core/knowledge/HvacSystemsKnowledgeProvider.js` | `hvac-systems` | `riskRelevance` | `low`, `medium`, `high` | string argument to helper | provider hypotheses | provider output, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative HVAC relevance | low relevance may be confused with low concern | unversioned helper values |
| `portal/core/knowledge/MoistureKnowledgeProvider.js` | `moisture` | `riskRelevance` | `medium`, `high` | string | provider hypotheses | custom moisture builder, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative moisture relevance | missing evidence and moisture evidence can be conflated if not governed | unversioned legacy values |
| `portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js` | `roof-envelope` | `riskRelevance` | `medium`, `high` | string | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative roof-envelope relevance | no formal version or closed semantics | unversioned legacy values |
| `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` | `sanitary-systems` | `riskRelevance` | `low`, `medium`, `high` | string argument to helper | provider hypotheses | provider output, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative systems relevance | low relevance may be confused with low concern | unversioned helper values |
| `portal/core/knowledge/StructuralSystemsKnowledgeProvider.js` | `structural-systems` | `riskRelevance` | `high` | string argument to helper | provider hypotheses | mapper, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative structural-system relevance | structural domain can be confused with structural safety | unversioned helper value |
| `portal/core/knowledge/StructuralSystemsKnowledgeProvider.js` | `structural-systems` | `structuralRelevance` | `high` | string | provider output | ExpertReasoningContract, Internal Model preservation | structural-context signal | MUST NOT be direct category source | separate field requires explicit boundary |
| `portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js` | `vertical-transportation-systems` | `riskRelevance` | `medium`, `high` | string argument to helper | provider hypotheses | provider output, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative systems relevance | no formal version or closed semantics | unversioned helper values |
| `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` | `windows-doors` | `riskRelevance` | `low`, `medium`, `high` | string | provider hypotheses | mapper or bilingual path, ExpertReasoningContract, Internal Model, Interpretation Model | qualitative envelope/opening relevance | low relevance may be confused with low concern | unversioned legacy values |
| `portal/core/risk/BuildingRiskInternalModel.js` | all | `riskRelevance` | preserved inside hypotheses | source value | ExpertReasoningContract | Interpretation Model | preservation only | none in Internal Model | no validation or version state yet |
| `portal/core/risk/BuildingRiskInterpretationModel.js` | all | `riskRelevance` | aliases accepted through `EXPLICIT_CATEGORY_VALUES` | string or object | Internal Model elements | domain and overall interpretation | currently direct explicit category source | accepts broader concern aliases than provider values | must be narrowed by future governance implementation |
| `tests/building-risk-internal-model-test.js` | fixture | `riskRelevance` | `high` | string | test contract | Internal Model test | verifies preservation boundary | none | fixture is unversioned |
| `tests/building-risk-interpretation-model-test.js` | fixture | `riskRelevance` | `low`, `moderate`, `critical` | string | test contract | Interpretation Model test | verifies current direct category mapping | `critical` is not current provider value and collides with Red Flag/review concepts | future migration required |
| `tests/building-risk-interpretation-model-test.js` | fixture | `concernCategory` | `MODERATE_CONCERN`, `ELEVATED_CONCERN` | string | test consequence/red flag | Interpretation Model test | explicit concern category | no provider currently emits it | future canonical interpretation field |
| `portal/core/InspectionQuestionCatalog.js` | inspection catalog | `riskCategory` | `Documentation`, `Water Ingress`, `MEP Systems`, `Fire & Life Safety`, `CAPEX Exposure` | string | adaptive question catalog | inspection workflow, not Building Risk interpretation | catalog grouping, not ExpertReasoningContract risk category | same field name has different meaning | MUST remain out of Building Risk source mapping unless explicitly normalized later |

### 5.2 Current Values

Provider `riskRelevance` values currently present:

- `low`
- `medium`
- `high`

Focused test-only values currently present:

- `moderate`
- `critical`

Provider `structuralRelevance` values currently present:

- `low`
- `medium`
- `high`
- `very high`

Current `concernCategory` fixture values:

- `MODERATE_CONCERN`
- `ELEVATED_CONCERN`

No Knowledge Provider currently emits `concernCategory`, `riskCategory`, or `riskConcern` as Building Risk interpretation fields.

## 6. Problem Statement

The repository uses `riskRelevance` widely, but its meaning is not formally versioned. Existing providers use unversioned lowercase qualitative values. The Interpretation Model currently accepts a broad alias set that maps `riskRelevance` directly to concern categories.

This creates four risks:

1. `riskRelevance` can be mistaken for `concernCategory`.
2. `riskRelevance` can be mistaken for severity, criticality, confidence, or structural relevance.
3. Unrecognized provider values can be silently ignored or misread without audit state.
4. Future public contract or review-priority work can inherit ambiguous internal semantics.

## 7. Terminology

`riskRelevance`: provider-originated qualitative relevance signal for internal risk interpretation.

`concernCategory`: internal interpretation category assigned only by governed interpretation logic.

`riskCategory`: currently ambiguous repository name. It MUST NOT be used as a Building Risk interpretation source unless normalized by a future versioned policy.

`riskConcern`: legacy or extension field name. It MUST NOT be canonical for new providers.

`severity`: issue intensity or condition seriousness in other workflows. It is not risk relevance.

`criticality`: operational or professional urgency concept. It is not risk relevance.

`structuralRelevance`: structural-context relevance. It is not risk relevance and not safety confirmation.

`confidence`: reliability of a source or interpretation. It is not risk relevance.

`completeness`: source contract readiness. It is not risk relevance.

## 8. Architectural Decision

Decision: Option A is accepted.

`riskRelevance` SHALL remain an independent canonical source field.

Rejected alternatives:

- Option B, legacy alias for `concernCategory`, is rejected because it collapses provider source relevance and interpretation outcome.
- Option C, provider-only field normalized by the Internal Model into concern, is rejected because the Internal Model must not create risk categories.
- Option D, full removal, is rejected because all current providers already expose useful qualitative source relevance and removal would create unnecessary migration risk.

Priority rule:

`concernCategory` is the canonical interpretation outcome field. `riskRelevance` is the canonical source relevance field. One MUST NOT be treated as the other without an explicit versioned mapping step in the Interpretation Model.

## 9. Canonical Field Policy

Future Knowledge Providers MAY emit `riskRelevance`.

Knowledge Providers MUST NOT be required to emit `riskRelevance` for a valid ExpertReasoningContract.

When present, `riskRelevance` MUST use the canonical value set in this document or an explicitly marked legacy value.

`riskRelevance` MUST be source-bound to a hypothesis or another explicit source element. It MUST NOT be derived from provider class, router order, domain ID, keyword count, confidence, completeness, missing evidence, or free text heuristics.

## 10. Canonical Value Set

Canonical values for `risk-relevance-governance-1.0`:

- `LOW_RELEVANCE`
- `MODERATE_RELEVANCE`
- `HIGH_RELEVANCE`

Rejected canonical values:

- `CRITICAL_RELEVANCE`
- `NOT_RELEVANT`
- `NOT_ASSESSED`
- `NOT_APPLICABLE`
- `UNKNOWN_RELEVANCE`

Rationale:

- `CRITICAL_RELEVANCE` risks conflation with critical concern, red flags, and review priority.
- `NOT_RELEVANT` risks conflation with `NO_CONFIRMED_RISK_INTERPRETATION`.
- `NOT_ASSESSED` is already represented by source or assessment state.
- `NOT_APPLICABLE` is a scope/applicability state, not relevance.
- `UNKNOWN_RELEVANCE` is rejected as a fachlicher relevance value because unknown is a value state, not a source relevance level.

## 11. Value Semantics

### LOW_RELEVANCE

Definition: the structured source finding has limited relevance for internal Building Risk interpretation, while remaining auditable.

Allowed source: explicit provider hypothesis or versioned source extension.

Forbidden derivations: low severity, high confidence, complete source, absence of missing evidence, non-structural domain, or routine wording.

Relationship to concern: MAY support `LOW_CONCERN` only through governed interpretation logic. It MUST NOT prove no concern.

Example: a cosmetic crack hypothesis with bounded surface-finish consequences.

Counterexample: an incomplete source with no evidence; incompleteness is not low relevance.

### MODERATE_RELEVANCE

Definition: the structured source finding has material relevance for internal Building Risk interpretation and requires visible preservation in interpretation context.

Allowed source: explicit provider hypothesis or versioned source extension.

Forbidden derivations: missing evidence alone, confidence divergence, domain overlap, or provider precedence.

Relationship to concern: MAY support `MODERATE_CONCERN` only through governed interpretation logic.

Example: moisture-related deterioration requiring verification but without explicit high-impact consequence.

Counterexample: a high-confidence minor issue; confidence does not create moderate relevance.

### HIGH_RELEVANCE

Definition: the structured source finding has strong relevance for internal Building Risk interpretation because the reasoned hypothesis, consequence, or verification need is materially significant within the source boundary.

Allowed source: explicit provider hypothesis or versioned source extension.

Forbidden derivations: structural domain name, structural relevance alone, red flag presence alone, safety wording, or criticality wording.

Relationship to concern: MAY support `ELEVATED_CONCERN` only through governed interpretation logic. It MUST NOT create `CRITICAL_CONCERN` by itself.

Example: possible structural alteration requiring verification of load path records.

Counterexample: `structuralRelevance: "high"` without governed `riskRelevance`.

### Unknown Relevance State

Unknown source relevance is represented as value state, not as a canonical fachlicher value.

Allowed state: `UNKNOWN_VALUE`.

Meaning: the source or migration layer cannot classify the raw value under this governance version.

Forbidden derivations: missing field, invalid source, incomplete source, unsupported free text, or absent version.

Relationship to concern: MUST NOT create a concern category. It MAY create an audit limitation or unknown source-relevance state.

Example: a legacy provider value cannot be mapped after version review.

Counterexample: absent `riskRelevance`; absence is `NOT_PRESENT`, not `UNKNOWN_VALUE`.

## 12. Relationship to concernCategory

`concernCategory` describes an internal interpretation outcome.

`riskRelevance` describes source relevance before interpretation.

Both MAY coexist on a source element during migration. When both exist:

- `concernCategory` has precedence as the explicit interpretation category.
- `riskRelevance` remains preserved as source context.
- A mismatch MUST be audit-visible.
- A mismatch MUST NOT be silently resolved.

`riskRelevance` MUST NOT replace `concernCategory`.

`concernCategory` MUST NOT be derived in the Internal Model.

The Interpretation Model MUST NOT derive a concern category from `riskRelevance` alone. A later versioned mapping policy MAY use `riskRelevance` only as one authorized structured source input together with explicitly approved interpretation evidence.

## 13. Relationship to riskCategory

`riskCategory` is not canonical for Building Risk interpretation.

Current repository usage includes inspection catalog grouping values such as `Documentation`, `Water Ingress`, `MEP Systems`, `Fire & Life Safety`, and `CAPEX Exposure`. Those values are not concern categories and MUST NOT be interpreted as Building Risk categories.

Future use of `riskCategory` as an alias requires a major governance decision. Until then, `riskCategory` MUST be treated as legacy or out-of-scope unless a source explicitly identifies it as a versioned Building Risk extension.

## 14. Relationship to riskConcern

`riskConcern` is not canonical for new providers.

If encountered in legacy contracts, it MUST be preserved and marked as legacy source material.

It MUST NOT be used as a free-text concern mapping surface.

It MAY be interpreted only if a future migration registry defines exact allowed values and version state.

## 15. Relationship to Severity

Severity describes intensity, extent, or seriousness in other workflows. `riskRelevance` describes relevance of a structured source finding for internal risk interpretation.

Severity MUST NOT create, raise, lower, or override `riskRelevance`.

`riskRelevance` MUST NOT be used as severity.

## 16. Relationship to Criticality

Criticality describes urgency or critical operational importance. It is not risk relevance.

Criticality MUST NOT create `HIGH_RELEVANCE`.

`HIGH_RELEVANCE` MUST NOT mean criticality.

`CRITICAL_RELEVANCE` is rejected as a canonical value.

## 17. Relationship to Structural Relevance

`structuralRelevance` states whether a hypothesis has structural context or possible structural relevance.

It MUST NOT create `riskRelevance`.

It MUST NOT create a concern category.

It MUST NOT certify structural safety or unsafety.

When `structuralRelevance` and `riskRelevance` coexist, both MUST remain separate in audit context.

## 18. Relationship to Confidence

Confidence answers: how reliable is the source or interpretation?

`riskRelevance` answers: how relevant is the structured source finding for internal Building Risk interpretation?

Rules:

- Confidence MUST NOT change `riskRelevance`.
- `riskRelevance` MUST NOT change confidence.
- Confidence divergence MUST NOT create relevance divergence by itself.
- Low confidence MUST NOT be interpreted as low relevance.
- High confidence MUST NOT be interpreted as high relevance.

## 19. Relationship to Completeness

Completeness answers: how complete is the source contract or assessment material?

Completeness MUST NOT create, raise, lower, or invalidate `riskRelevance` by itself.

Incomplete, legacy, unknown completeness, invalid, and not assessed states MUST remain separate from relevance states.

## 20. Relationship to Missing Evidence

Missing Evidence identifies absent, incomplete, or contradicting source evidence.

Missing Evidence MUST NOT create `riskRelevance`.

Missing Evidence MAY limit evidence sufficiency or produce an unknown interpretation state.

Missing Evidence MUST NOT be used as a substitute for `UNKNOWN_RELEVANCE`.

## 21. Relationship to Red Flags

Foundation policy remains `PRESERVE_ONLY_FOR_FOUNDATION_1_4` until new Red Flag governance is approved.

Rules:

- A Red Flag MUST NOT set `riskRelevance` automatically.
- High relevance MUST NOT create a Red Flag automatically.
- Low relevance MUST NOT neutralize a Red Flag.
- A Red Flag without explicit concern category MUST NOT create `CRITICAL_CONCERN`.
- Red Flags MAY be preserved as source-bound attention markers.

## 22. Provider Governance

Knowledge Providers MAY emit `riskRelevance` as an optional structured hypothesis field.

Providers MUST use only canonical values after migration.

Providers MUST NOT define domain-specific `riskRelevance` values.

Providers MUST NOT emit free-text `riskRelevance`.

Providers MUST NOT derive `riskRelevance` from confidence, completeness, missing evidence, provider class, router position, or domain ID.

Providers MUST NOT emit `CRITICAL_RELEVANCE`.

Providers MAY omit `riskRelevance`; omission is `NOT_PRESENT`.

Providers MUST NOT emit `UNKNOWN_RELEVANCE`. When relevance cannot be classified, providers MAY omit `riskRelevance`; a later value-state layer may represent the condition as `UNKNOWN_VALUE`.

## 23. Internal Model Governance

`BuildingRiskInternalModel` MUST remain a preservation and preparation layer.

Future Internal Model behavior:

- preserve raw `riskRelevance` source value
- preserve source reference and element reference
- record governance version when available
- classify value state as canonical, legacy-supported, legacy-unsupported, unknown, invalid, or not present
- preserve unknown values without interpretation
- avoid concern category creation
- avoid risk upscaling or downscaling
- avoid score, review priority, or public contract output

The Internal Model MAY normalize technical shape. It MUST NOT normalize meaning silently.

## 24. Interpretation Model Governance

`BuildingRiskInterpretationModel` MAY use `riskRelevance` only when all of the following are true:

- the source value is canonical or legacy-supported
- the governance version is known or the legacy mapping is explicitly accepted
- the mapping table is closed and tested
- the source element remains auditable
- no blocking conflict prevents confirmed interpretation

Allowed maximum support boundaries for `risk-relevance-governance-1.0`:

| Source relevance | Maximum derived concern |
| --- | --- |
| `LOW_RELEVANCE` | no concern category from relevance alone; may support at most `LOW_CONCERN` under a later separately approved mapping policy |
| `MODERATE_RELEVANCE` | no concern category from relevance alone; may support at most `MODERATE_CONCERN` under a later separately approved mapping policy |
| `HIGH_RELEVANCE` | no concern category from relevance alone; may support at most `ELEVATED_CONCERN` under a later separately approved mapping policy |
| `UNKNOWN_VALUE` | no concern category |

`riskRelevance` MUST NOT derive `CRITICAL_CONCERN` by itself.

`riskRelevance` MUST NOT derive `LOW_CONCERN`, `MODERATE_CONCERN`, or `ELEVATED_CONCERN` by itself.

Unknown values MUST NOT be interpreted.

Free text MUST NOT be mapped.

Synonym heuristics MUST NOT be used.

Numeric conversion MUST NOT be used.

## 25. Multi-Domain Governance

`riskRelevance` remains domain-local and source-local.

No overall `riskRelevance` value SHALL be produced.

Overall interpretation MAY use concern categories derived from source-bound domain interpretations. It MUST NOT aggregate relevance values directly.

Forbidden multi-domain behavior:

- average relevance
- sum relevance
- weight relevance by domain
- select relevance by provider priority
- select relevance by router priority
- select relevance by source order alone
- convert unknown domains into low relevance

## 26. Conflict Governance

Conflict types involving `riskRelevance`:

- `riskRelevance` versus `concernCategory`
- `riskRelevance` versus `riskCategory`
- `riskRelevance` versus `riskConcern`
- risk relevance divergence between source contracts
- unknown value versus known value
- legacy value versus canonical value
- positive indicator versus high relevance
- red flag versus low relevance
- missing evidence versus high relevance

Conflict behavior:

- value mismatch MUST be preserved and audit-visible.
- unknown value conflict MUST NOT be silently migrated.
- legacy value conflict MUST NOT be silently upgraded.
- positive indicator versus high relevance MUST NOT select a winner.
- red flag versus low relevance MUST NOT neutralize the red flag.
- missing evidence versus high relevance MAY limit evidence sufficiency but MUST NOT erase source relevance.

Conflict effects:

| Conflict | Effect |
| --- | --- |
| `riskRelevance` versus `concernCategory` | interpretation limiting; `concernCategory` remains the explicit concern source, `riskRelevance` remains preserved source context, mismatch is audit-visible |
| `riskRelevance` versus `riskCategory` | audit only unless `riskCategory` is explicitly versioned as Building Risk source material in a later governance decision |
| `riskRelevance` versus `riskConcern` | audit only unless `riskConcern` is explicitly versioned as Building Risk source material in a later governance decision |
| risk relevance divergence between source contracts | non-blocking unless paired with `POSITIVE_VS_RISK` or `EVIDENCE_CONTRADICTION`; may limit interpretation explanation |
| canonical versus legacy-supported value | non-blocking with visible legacy marker |
| legacy-unsupported value versus canonical value | interpretation limiting for the unsupported source; no silent upgrade |
| unknown value versus known value | interpretation limiting for the unknown source; no silent downgrade of the known source |
| unknown version versus known version | interpretation limiting for the unknown-version source; may register `VERSION_CONFLICT` |
| positive indicator versus high relevance | non-blocking unless the same source statements create `POSITIVE_VS_RISK` |
| red flag versus low relevance | audit-visible and non-neutralizing; red flag remains preserved |
| missing evidence versus high relevance | evidence-sufficiency limiting, not relevance-erasing |

Blocking remains limited to conflicts equivalent to `POSITIVE_VS_RISK` or `EVIDENCE_CONTRADICTION` under Foundation 1.4 conflict policy.

Only conflicts equivalent to `POSITIVE_VS_RISK` or `EVIDENCE_CONTRADICTION` MAY block confirmed interpretation under Foundation 1.4 conflict policy. Other conflicts remain audit-visible unless a future governance version changes this rule.

## 27. Versioning

Governance version: `risk-relevance-governance-1.0`.

Operational version carrier decision:

- `riskRelevanceVersion` SHALL belong to the same source element that carries `riskRelevance`, normally a hypothesis or future explicitly versioned source element.
- Contract-level metadata MAY additionally declare a default source-relevance governance version only when every contained `riskRelevance` value uses the same governance version.
- Element-level `riskRelevanceVersion` MUST override contract-level default version when both are present.
- Missing version on current provider values is classified as `LEGACY_SUPPORTED` only for exact legacy-supported values.
- Missing version on future canonical uppercase values is classified as `UNKNOWN_VERSION` and MUST NOT be interpreted until version state is resolved.
- Unknown version is interpretation limiting for that source element and may produce `VERSION_CONFLICT` when mixed with known versions.

Versioning rules:

- The governance version SHALL be independent from ExpertReasoningContract, Internal Model, Interpretation Model, Public Contract, provider, and application versions.
- Future providers MUST expose `riskRelevanceVersion` when emitting canonical values.
- Existing providers without version are legacy sources.
- The Internal Model MUST preserve source version where available.
- The Interpretation Model MUST accept only supported governance versions and explicit legacy mappings.
- Unknown governance versions MUST NOT be interpreted.
- New canonical values require a major governance version.
- New optional metadata may be minor-version compatible.
- Silent migration is forbidden.

## 28. Legacy Handling

Legacy value states:

- `CANONICAL`: canonical uppercase value with supported governance version.
- `LEGACY_SUPPORTED`: current lowercase provider value with accepted mapping.
- `LEGACY_UNSUPPORTED`: known historical or test value that is not accepted for future interpretation.
- `UNKNOWN_VALUE`: source explicitly states unknown relevance.
- `INVALID_VALUE`: non-string, free text, unsupported object, boolean, number, or unsupported string.
- `NOT_PRESENT`: field absent.
- `UNKNOWN_VERSION`: value is syntactically usable but the source relevance governance version is absent or unsupported where a version is required.

Legacy-supported mappings:

| Legacy value | Canonical value |
| --- | --- |
| `low` | `LOW_RELEVANCE` |
| `medium` | `MODERATE_RELEVANCE` |
| `moderate` | `MODERATE_RELEVANCE` |
| `high` | `HIGH_RELEVANCE` |

Legacy-unsupported values:

- `critical`
- `safety_relevant`
- `safety_critical`
- `very high`

These MUST NOT be interpreted as `CRITICAL_CONCERN` through `riskRelevance`. A source requiring critical concern MUST use explicit governed `concernCategory` or future Red Flag governance.

## 29. Migration Strategy

Migration MUST be staged:

1. Add tests that document current legacy values.
2. Add a central governance registry or constant set.
3. Preserve raw values in the Internal Model with value state.
4. Map only canonical and legacy-supported values in the Interpretation Model.
5. Update providers from lowercase legacy values to canonical uppercase values.
6. Add `riskRelevanceVersion` after provider migration policy is approved.
7. Remove direct broad alias mapping only after tests prove compatibility.

No provider migration is authorized by this sprint.

## 30. Public Contract Boundary

`riskRelevance` is internal only.

It MUST NOT be a Public Contract field.

It MUST NOT be rendered directly in UI.

It MUST NOT be exposed through APIs.

It MUST NOT be used as public risk class, public summary, acquisition advice, market value statement, or safety statement.

Future public use requires:

- versioned public contract decision
- explicit user-facing terminology
- tests proving no score, review priority, valuation, acquisition, or safety implication
- traceability to source contracts

## 31. Review Priority Boundary

Review Priority remains Non-Scope.

`riskRelevance` is not Review Priority.

High relevance MUST NOT automatically create high Review Priority.

Future Review Priority MAY require additional factors such as evidence gaps, confidence limitations, red flags, workflow deadlines, professional role, and unresolved verification. Those factors MUST NOT change source `riskRelevance`.

## 32. Score Boundary

`riskRelevance` is not numeric input.

Forbidden behavior:

- ordinal point mapping
- hidden numeric rank
- weights
- formula
- averaging
- multiplication with confidence
- addition with severity
- percentage conversion
- score value output

Any future numerical Building Risk Score must define its own architecture. This document does not authorize it.

## 33. Determinism

Identical source values MUST produce identical relevance state, mapping state, audit state, and interpretation effect.

No runtime time, random value, provider runtime state, router order, environment variable, UI state, persistence state, or external service may affect `riskRelevance` interpretation.

## 34. Explainability

Every accepted `riskRelevance` use MUST explain:

- source contract reference
- source element reference
- raw source value
- canonical or legacy state
- governance version or legacy marker
- mapping result if interpretation uses it
- limitations when unknown, invalid, or unsupported

Explainability MUST remain source-bound and non-generative.

## 35. Error Handling

Invalid `riskRelevance` values MUST NOT crash the Building Risk layer.

Invalid values MUST be preserved as invalid source relevance state where the source contract itself remains valid.

Invalid values MUST NOT produce concern category, risk driver, red flag, review priority, score, or public field.

Invalid source contracts remain governed by the Internal Model invalid-source policy.

## 36. Test Governance

Future tests MUST cover:

- canonical values are accepted
- rejected canonical-like values are not accepted
- every value state is represented
- legacy-supported values are mapped visibly
- legacy values without version are handled as legacy-supported only when exact-match supported
- unknown values are not interpreted
- unknown versions are not interpreted
- free texts are not mapped
- null, undefined, empty string, whitespace string, number, boolean, object, and array values are invalid or not present according to exact input state
- severity is not used as relevance
- criticality is not used as relevance
- structural relevance is not used as risk relevance
- confidence does not create relevance
- completeness does not create relevance
- missing evidence does not create relevance
- red flags do not create relevance
- provider class does not influence relevance
- router position does not influence relevance
- domain ID does not influence relevance
- source order does not change result
- multiple contracts in the same domain remain source-local and do not create an overall relevance value
- legacy remains visible
- input is not mutated
- no public fields are introduced
- no scores are introduced
- no review priority is introduced

## 37. Non-Scope

This sprint does not include:

- productive code changes
- provider changes
- router changes
- engine changes
- Internal Model changes
- Interpretation Model changes
- test changes
- score
- numerical evaluation
- weighting
- formulas
- review priority
- public contract
- UI
- reports
- APIs
- persistence
- CAPEX
- RUL
- acquisition recommendation
- market value effect
- safety confirmation
- load-bearing capacity confirmation

## 38. Risks

Known risks:

- Current Interpretation Model accepts broader aliases than this governance allows for future canonical use.
- Existing providers are unversioned.
- Current provider values are lowercase legacy values.
- Current tests use `critical` as `riskRelevance`, which this governance rejects for future canonical interpretation.
- `riskCategory` exists in inspection catalogs with unrelated semantics.
- `structuralRelevance` has its own scale and can be mistaken for risk relevance.

These risks are not blockers for this architecture document. They MUST be addressed before implementation readiness.

## 39. Deferred Decisions

Deferred:

- exact code location of a future governance registry
- exact internal field name for value state
- exact conflict type name for relevance mismatch
- exact timing for provider migration to canonical uppercase values
- public wording if a future Public Contract exposes a derived concept
- future Review Priority model
- future Score architecture

## 40. Implementation Readiness Criteria

A later implementation sprint is ready only when all criteria are met:

- canonical value constants are approved
- legacy mappings are implemented with tests
- unsupported legacy values are rejected from interpretation with tests
- value-state representation including `UNKNOWN_VERSION` is implemented with tests
- Internal Model preserves raw value, canonical state, and version state
- Interpretation Model maps no `riskRelevance` value to concern by itself and uses only a later separately approved closed mapping policy
- direct broad alias mapping is removed or guarded by versioned policy
- no provider-specific rules are introduced
- no router or domain priority is introduced
- no score, review priority, public contract, UI, API, report, persistence, CAPEX, RUL, valuation, acquisition, or safety behavior is introduced

## 41. Final Architecture Decision

`riskRelevance` remains an independent, source-bound, qualitative, internal field.

The canonical value set is:

- `LOW_RELEVANCE`
- `MODERATE_RELEVANCE`
- `HIGH_RELEVANCE`

Unknown source relevance is represented as value state, not as a canonical relevance value.

Current lowercase provider values are legacy-supported source values. `critical`, `safety_relevant`, `safety_critical`, `very high`, and `UNKNOWN_RELEVANCE` are not canonical `riskRelevance` values.

`concernCategory` is the canonical interpretation outcome field. `riskRelevance` MUST NOT create a concern category by itself and may inform interpretation only as one authorized structured source input under a later separately approved, versioned, tested Interpretation Model mapping policy.

The final status of this architecture document is:

`READY FOR RISK RELEVANCE GOVERNANCE REVIEW`