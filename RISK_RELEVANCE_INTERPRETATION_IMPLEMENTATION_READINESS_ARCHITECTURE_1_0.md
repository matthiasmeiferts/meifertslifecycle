# Risk Relevance Interpretation Implementation Readiness Architecture 1.0

## 1. Purpose

This document defines the implementation-readiness architecture for Foundation 1.5 Risk Relevance interpretation after the Governance Registry and Internal Model preservation work.

It is an architecture document only. It authorizes no productive code change, no test change, no provider change, no router change, no engine change, no UI change, no public contract change, no report change, no persistence change, no tag, and no commit.

The purpose is to decide how preserved `riskRelevanceEntries` may later be interpreted without reviving direct raw alias behavior, without creating scores or priorities, and without converting source relevance into concern categories by accident.

## 2. Current Foundation State

Foundation 1.5 currently has:

- A committed Risk-layer governance registry at `portal/core/risk/RiskRelevanceGovernanceRegistry.js`.
- A committed Internal Model preservation implementation at `portal/core/risk/BuildingRiskInternalModel.js`.
- `domainAssessment.riskRelevanceEntries[]` produced for primary and alternative hypotheses.
- Entry fields for source reference, source element reference, raw value, canonical value, value state, raw source version, version state, governance version, and `interpretationEligible`.
- `interpretationEligible: false` in every preservation entry as the preservation-phase marker.
- No productive consumer of `riskRelevanceEntries` outside the Internal Model.
- Existing `BuildingRiskInterpretationModel` still directly treats raw `riskRelevance` as an alias for concern-category extraction.

Current readiness remains:

- `RISK RELEVANCE GOVERNANCE REGISTRY SAVED`
- `RISK RELEVANCE INTERNAL MODEL PRESERVATION SAVED`
- `NOT READY FOR RISK RELEVANCE INTERPRETATION IMPLEMENTATION COMMIT`

## 3. Scope

This architecture covers only future internal interpretation of preserved Risk Relevance entries.

It defines:

- The exclusive source of truth for interpretation.
- The migration boundary away from raw alias interpretation.
- Eligibility rules for preserved entries.
- Value-state, version-state, and combined eligibility matrices.
- The additive interpretation output contract.
- Interpretation states and deterministic reason codes.
- Legacy, unknown, invalid, missing, and version handling.
- Hypothesis binding and reference strategy.
- Mutability and auditability decisions.
- Failure semantics.
- Backward compatibility and fallback policy.
- Implementation, review, commit, and test gates for later sprints.

## 4. Non-Goals

This architecture does not authorize:

- Provider migration.
- Router behavior changes.
- Engine selection changes.
- Domain precedence changes.
- Building Risk Score changes.
- Review priority.
- Severity or criticality mapping.
- Concern-category mapping from Risk Relevance.
- Red Flag derivation.
- Blocking decisions.
- Recommendations.
- Decisions.
- Public contract exposure.
- UI, API, report, or persistence output.
- CAPEX, RUL, valuation, acquisition, or safety conclusions.

## 5. Existing Architecture Findings

The fully read baseline files establish these findings:

- `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md` defines `riskRelevance` as source-bound, qualitative, internal, non-numeric, and separate from `concernCategory`.
- `RISK_RELEVANCE_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md` requires registry ownership, Internal Model preservation, and a later separate interpretation architecture before interpretation implementation.
- `RiskRelevanceGovernanceRegistry.js` owns canonical values, supported legacy mappings, unsupported legacy detection, value states, version states, and governance definition.
- `BuildingRiskInternalModel.js` consumes the registry via named imports and creates `riskRelevanceEntries` without creating interpretation output.
- `BuildingRiskInterpretationModel.js` currently contains the old alias behavior through `CATEGORY_SOURCE_FIELDS` and `EXPLICIT_CATEGORY_VALUES`.
- `riskRelevanceEntries` is not consumed by any productive JavaScript file outside the Internal Model.
- Productive `riskCategory`, `riskConcern`, `concernCategory`, and `riskDrivers` logic in the Building Risk core is concentrated in `BuildingRiskInterpretationModel.js`; `InspectionQuestionCatalog.js` uses `riskCategory` for inspection catalog grouping and is outside this interpretation source model.

## 6. Current Interpretation Alias Analysis

Current `BuildingRiskInterpretationModel` behavior:

- `CATEGORY_SOURCE_FIELDS` includes `riskCategory`, `concernCategory`, `riskConcern`, and `riskRelevance`.
- `getExplicitCategory(value)` reads each `CATEGORY_SOURCE_FIELDS` property directly from the object being inspected.
- `getExplicitCategory(value)` also recurses into `value.value` and `value.hypothesis`.
- Since Internal Model hypothesis wrappers contain `hypothesis: { ...riskRelevance }`, the Interpretation Model currently reads `hypothesis.riskRelevance` directly.
- `EXPLICIT_CATEGORY_VALUES` maps `LOW`, `MODERATE`, `HIGH`, `CRITICAL`, `SAFETY_RELEVANT`, and `SAFETY_CRITICAL` to concern categories.
- Tests currently prove that raw `riskRelevance: "low"` and `riskRelevance: "critical"` can affect interpreted concern categories.

Existing aliases and consumers:

| Surface | Current role | Future boundary |
| --- | --- | --- |
| Provider `riskRelevance` | Source hypothesis field emitted by knowledge providers. | Producer only; not interpreted directly. |
| Reasoning adapters and `KnowledgeReasoningMapper` | Transport `riskRelevance` into contracts. | Transport only; no interpretation. |
| `ExpertReasoningEngine` | Transports selected hypothesis fields. | Transport only; no interpretation. |
| `BuildingRiskInternalModel` hypotheses | Preserve source hypothesis content. | Must not be the interpretation source for Risk Relevance. |
| `BuildingRiskInternalModel` `riskRelevanceEntries` | Governance-classified preservation entries. | Exclusive interpretation source after migration. |
| `BuildingRiskInterpretationModel` raw alias logic | Current migration risk. | Must be disabled for models with preservation entries. |
| `riskCategory` | Current explicit concern source in Interpretation Model; unrelated catalog field elsewhere. | May remain for existing explicit concern behavior, but not a Risk Relevance alias. |
| `concernCategory` | Canonical explicit interpretation outcome source. | May remain existing explicit source. |
| `riskConcern` | Existing legacy explicit source alias. | May remain existing explicit source, but not Risk Relevance. |
| `riskDrivers` | Current interpreted source-bound concern drivers. | Must not be populated from raw Risk Relevance. |

Conclusion: yes, `BuildingRiskInterpretationModel` currently reads `hypothesis.riskRelevance` directly. Existing alias fields for concern extraction are `riskCategory`, `concernCategory`, `riskConcern`, and `riskRelevance`. Preservation entries are not yet unintentionally consumed. Existing risk-driver and concern logic exists only in the interpretation layer and must not be changed outside the later authorized implementation sprint.

Alias migration decision:

- `riskCategory`, `concernCategory`, and `riskConcern` remain existing explicit concern aliases in the implementation sprint.
- `riskRelevance` MUST be removed from direct category-source extraction.
- Removing `riskRelevance` from `CATEGORY_SOURCE_FIELDS` is the required code-level boundary for the current implementation shape.
- After removal, the existing recursion through `value.value` and `value.hypothesis` MUST NOT reintroduce Risk Relevance interpretation, because those recursive reads still use `CATEGORY_SOURCE_FIELDS`.
- Tests that currently assert raw `riskRelevance` creates `LOW_CONCERN`, `MODERATE_CONCERN`, `ELEVATED_CONCERN`, or `CRITICAL_CONCERN` MUST be changed to assert the new non-alias behavior.

## 7. Source-of-Truth Decision

Decision: after the migration boundary, Risk Relevance interpretation MUST be based exclusively on `domainAssessment.riskRelevanceEntries`.

The following are forbidden as Risk Relevance interpretation inputs:

- `hypothesis.riskRelevance`
- `rawValue`
- Provider fields read directly from source hypotheses
- Free strings
- `riskCategory`
- `riskConcern`
- `concernCategory`
- `structuralRelevance`
- `severity`
- `criticality`
- Router, engine, provider, UI, report, API, or persistence state

Migration boundary:

- When a domain assessment exposes `riskRelevanceEntries` as an array, the Interpretation Model MUST NOT read raw `riskRelevance` from hypotheses, evidence values, red flags, consequences, or nested source elements.
- Raw `riskRelevance` alias logic MUST NOT silently continue in parallel with entry-based interpretation.
- A fallback may exist only for legacy Internal Model inputs that do not expose `riskRelevanceEntries` at all, and that fallback MUST NOT derive concern categories from raw Risk Relevance.

## 8. Interpretation Responsibility Boundary

Risk Relevance interpretation belongs inside the Building Risk interpretation layer and only after the Internal Model has produced governance-classified preservation entries.

Responsibilities:

- Registry: classify raw value and source version; expose canonical values, states, and governance definition.
- Internal Model: preserve source-bound entries only; keep `interpretationEligible` as the preserved entry marker produced by the preservation implementation.
- Interpretation Model: consume only `riskRelevanceEntries`, compute interpretation eligibility from preserved fields, produce additive `riskRelevanceInterpretations`, and avoid raw source aliasing.
- Tests: prove source-of-truth, eligibility, non-derivation, fallback, and compatibility rules.

Non-responsibilities:

- Providers MUST NOT decide interpretation eligibility.
- Router MUST NOT decide interpretation eligibility.
- Engine MUST NOT decide interpretation eligibility.
- UI, reports, public contracts, and persistence MUST NOT consume Risk Relevance interpretation in Foundation 1.5.

## 9. Eligibility Model

Decision for `interpretationEligible`: Option B is accepted.

Eligibility MUST be computed exclusively in the Interpretation Model from existing preservation fields. The Internal Model MUST NOT update `interpretationEligible` to a derived true or false value in the Risk Relevance interpretation implementation sprint.

`interpretationEligible` remains a preserved technical marker on each entry. Under the current preservation implementation it is statically `false`. Under Option B it MUST NOT be treated as the authoritative interpretation gate, because doing so would require an Internal Model change before any interpretation can occur. The Interpretation Model MUST compute its own eligibility from preserved registry fields and may copy the preserved `interpretationEligible` value only for audit diagnostics.

Rationale:

- Eligibility is an interpretation concern, not preservation. Moving derived eligibility into the Internal Model would make the Internal Model an interpretation-preparation layer.
- The current entry already preserves all fields needed for deterministic eligibility: `valueState`, `versionState`, `canonicalValue`, `governanceVersion`, `versionPresent`, `rawVersion`, and `interpretationEligible`.
- Computing eligibility in the Interpretation Model avoids changing JavaScript preservation code and keeps the implementation sprint scope isolated.
- Drift is prevented by deriving eligibility from the preserved registry states and by forbidding local value or legacy mapping tables.
- Option C is rejected because it would require Internal Model changes, would blur the preservation boundary, and would create a second ownership surface for interpretation readiness.
- Option A is rejected as a permanent rule because a static `false` can only preserve the current non-interpretation state and cannot implement interpretation.

Eligibility base rule:

An entry is interpretable only when all conditions are true:

- Entry exists.
- `valueState` is `CANONICAL` or `LEGACY_SUPPORTED`.
- `canonicalValue` is present.
- `governanceVersion` equals the supported governance version.
- `versionState` is one of the specifically allowed version states for the value-state class.

The preserved `interpretationEligible` field is not part of the eligibility equation in Foundation 1.5 Sprint I-3N. It remains visible for audit as `preservedInterpretationEligible` if copied into interpretation output.

Governance-version authority:

- The Interpretation Model MUST obtain the supported governance version from the Risk Relevance Governance Registry definition, not from a local hardcoded string.
- The expected authority is `getRiskRelevanceGovernanceDefinition().governanceVersion`.
- An entry with missing `governanceVersion` MUST NOT be interpreted.
- An entry with unsupported `governanceVersion` MUST NOT be interpreted.
- A future registry governance version requires explicit registry support and interpretation tests before it can become eligible.

`UNKNOWN_VERSION` decision:

- `UNKNOWN_VERSION` is never interpretable in Foundation 1.5 Risk Relevance interpretation.
- `CANONICAL + UNKNOWN_VERSION` is NOT interpretable.
- `LEGACY_SUPPORTED + UNKNOWN_VERSION` is NOT interpretable.
- Reason: accepting unversioned legacy values for interpretation would prefer historical provider output over versioned canonical output and would require a separate migration policy version that does not exist.
- `VERSION_UNSUPPORTED` is never interpretable.

The implementation may still create `NOT_INTERPRETED` audit entries for `UNKNOWN_VERSION` cases.

## 10. Value-State Matrix

| Value State | Canonical Value Expected | Interpretation Allowed | Audit Entry Required | Reason Code | Notes |
| --- | --- | --- | --- | --- | --- |
| `CANONICAL` | Yes | Conditional on supported source version and eligibility flag | Yes | `RR_VALUE_CANONICAL` | Canonical value alone is not enough when version is unknown or unsupported. |
| `LEGACY_SUPPORTED` | Yes | Conditional on supported source version only | Yes | `RR_VALUE_LEGACY_SUPPORTED` | Legacy origin must remain visible and must not appear as original canonical provider output. |
| `LEGACY_UNSUPPORTED` | No | No | Yes | `RR_VALUE_LEGACY_UNSUPPORTED` | Must not be silently mapped or upgraded. |
| `UNKNOWN_VALUE` | No | No | Yes | `RR_VALUE_UNKNOWN` | Present but semantically empty or unknown. |
| `INVALID_VALUE` | No | No | Yes | `RR_VALUE_INVALID` | Present but invalid type or malformed structure. |
| `NOT_PRESENT` | No | No | Yes | `RR_VALUE_NOT_PRESENT` | Field absent; absence must not become low relevance. |

## 11. Version-State Matrix

| Version State | Interpretation Allowed | Audit Entry Required | Reason Code | Notes |
| --- | --- | --- | --- | --- |
| `VERSION_SUPPORTED` | Yes, if value state and eligibility also allow it | Yes | `RR_VERSION_SUPPORTED` | Normal supported path. |
| `UNKNOWN_VERSION` | No | Yes | `RR_VERSION_UNKNOWN` | Missing or null-like source version is audit-only for every value state. |
| `VERSION_UNSUPPORTED` | No | Yes | `RR_VERSION_UNSUPPORTED` | Must not interpret, must not create `VERSION_CONFLICT` in this architecture. |

## 12. Combined Eligibility Matrix

| Value State | Version State | Computed Eligibility | Interpretation Allowed | Audit Entry Required | Reason Code |
| --- | --- | --- | --- | --- | --- |
| `CANONICAL` | `VERSION_SUPPORTED` | `true` | Yes | Yes | `RR_ELIGIBLE_CANONICAL_SUPPORTED_VERSION` |
| `CANONICAL` | `UNKNOWN_VERSION` | `false` | No | Yes | `RR_NOT_ELIGIBLE_CANONICAL_UNKNOWN_VERSION` |
| `CANONICAL` | `VERSION_UNSUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNSUPPORTED_VERSION` |
| `LEGACY_SUPPORTED` | `VERSION_SUPPORTED` | `true` | Yes | Yes | `RR_ELIGIBLE_LEGACY_SUPPORTED_VERSION` |
| `LEGACY_SUPPORTED` | `UNKNOWN_VERSION` | `false` | No | Yes | `RR_NOT_ELIGIBLE_LEGACY_UNKNOWN_VERSION` |
| `LEGACY_SUPPORTED` | `VERSION_UNSUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_LEGACY_UNSUPPORTED_VERSION` |
| `LEGACY_UNSUPPORTED` | `VERSION_SUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE` |
| `LEGACY_UNSUPPORTED` | `UNKNOWN_VERSION` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE` |
| `LEGACY_UNSUPPORTED` | `VERSION_UNSUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNSUPPORTED_VALUE_AND_VERSION` |
| `UNKNOWN_VALUE` | `VERSION_SUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNKNOWN_VALUE` |
| `UNKNOWN_VALUE` | `UNKNOWN_VERSION` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNKNOWN_VALUE` |
| `UNKNOWN_VALUE` | `VERSION_UNSUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_UNKNOWN_VALUE_UNSUPPORTED_VERSION` |
| `INVALID_VALUE` | `VERSION_SUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_INVALID_VALUE` |
| `INVALID_VALUE` | `UNKNOWN_VERSION` | `false` | No | Yes | `RR_NOT_ELIGIBLE_INVALID_VALUE` |
| `INVALID_VALUE` | `VERSION_UNSUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_INVALID_VALUE_UNSUPPORTED_VERSION` |
| `NOT_PRESENT` | `VERSION_SUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_NOT_PRESENT` |
| `NOT_PRESENT` | `UNKNOWN_VERSION` | `false` | No | Yes | `RR_NOT_ELIGIBLE_NOT_PRESENT` |
| `NOT_PRESENT` | `VERSION_UNSUPPORTED` | `false` | No | Yes | `RR_NOT_ELIGIBLE_NOT_PRESENT` |

## 13. Legacy Handling

`LEGACY_SUPPORTED`:

- Is normalized to `canonicalValue` by the registry when the registry classifies it as supported legacy.
- Is interpreted only when the combined matrix allows it.
- MUST retain `valueState: LEGACY_SUPPORTED` in audit output.
- MUST NOT appear as if the provider originally emitted canonical uppercase values.
- MUST NOT require a new mapping table in the Interpretation Model.

`LEGACY_UNSUPPORTED`:

- MUST NOT be interpreted.
- MUST NOT be silently mapped to a canonical value.
- MUST produce a deterministic audit interpretation entry with reason `RR_VALUE_LEGACY_UNSUPPORTED` or a more specific combined reason.

The Registry remains the only authority for legacy classification. The Interpretation Model may consume registry states and canonical values from preservation entries, but it MUST NOT define its own legacy value mapping.

## 14. Unknown, Invalid and Missing Handling

`NOT_PRESENT`, `UNKNOWN_VALUE`, and `INVALID_VALUE` are distinct and MUST NOT collapse.

Definitions:

- `NOT_PRESENT`: the source element did not carry a `riskRelevance` field.
- `UNKNOWN_VALUE`: the source element carried `riskRelevance`, but the value was semantically empty or unknown.
- `INVALID_VALUE`: the source element carried `riskRelevance`, but the type or structure was invalid.

Decision: the Interpretation Model MUST create an additive audit entry for each preserved Risk Relevance entry, including not-present, unknown, invalid, and unsupported cases, provided the domain assessment exposes `riskRelevanceEntries`.

These audit entries MUST use non-interpreted states and reason codes. They MUST NOT create fachliche relevance, risk drivers, concern categories, score, priority, severity, red flag, blocking status, recommendation, or decision.

## 15. Interpretation Output Contract

The minimal additive output location is:

```text
domainInterpretation.riskRelevanceInterpretations[]
```

This collection MUST be present on each interpreted domain when the source domain assessment exposes `riskRelevanceEntries`. It MAY be an empty array only when the source domain assessment has no entries.

Each entry MUST bind to:

- The source `riskRelevanceEntryReference`.
- The source element reference.
- The source element type.
- The source contract reference through the entry source reference.
- The interpreted domain reference.

The output is internal interpretation material only. It is not a public contract and not a risk driver.

## 16. Field Classification Matrix

| Field | Required / Optional / Forbidden | Source | Mutable | Audit Purpose | Interpretation Meaning |
| --- | --- | --- | --- | --- | --- |
| `riskRelevanceInterpretationReference` | REQUIRED | Deterministic Interpretation Model reference | No | Identifies the interpretation entry | None by itself |
| `sourceRiskRelevanceEntryReference` | REQUIRED | `entry.riskRelevanceEntryReference` | No | Binds to preservation entry | None by itself |
| `sourceReference` | REQUIRED | `entry.sourceReference` | No | Binds to source contract | None by itself |
| `sourceElementReference` | REQUIRED | `entry.sourceElementReference` | No | Binds to primary or alternative hypothesis | None by itself |
| `sourceElementType` | REQUIRED | `entry.sourceElementType` | No | Distinguishes primary and alternative hypotheses | None by itself |
| `sourceElementIndex` | OPTIONAL | Deterministically parsed only when safe | No | Convenience audit sorting | None by itself |
| `sourceHypothesisId` | OPTIONAL | Matching preserved hypothesis when available | No | Human traceability | None by itself |
| `canonicalValue` | REQUIRED | `entry.canonicalValue` | No | Shows normalized value or null | Relevance level only when interpreted |
| `valueState` | REQUIRED | `entry.valueState` | No | Shows registry value classification | Technical state |
| `versionState` | REQUIRED | `entry.versionState` | No | Shows source-version classification | Technical state |
| `interpretationState` | REQUIRED | Interpretation Model derived state | No | Shows whether entry was interpreted or audit-only | Controlled state only |
| `interpretationReason` | REQUIRED | Combined eligibility matrix | No | Deterministic reason code | Machine-readable explanation |
| `governanceVersion` | REQUIRED | `entry.governanceVersion` | No | Confirms governing registry version | Compatibility gate |
| `sourceRiskRelevanceVersion` | REQUIRED | `entry.rawVersion` | No | Preserves source Risk Relevance version value or null/undefined | Version audit only |
| `auditVisibility` | REQUIRED | Interpretation Model rule | No | Marks the entry as audit-visible internal material | Audit marker only |
| `preservedInterpretationEligible` | OPTIONAL | `entry.interpretationEligible` | No | Shows legacy preservation marker when present | No eligibility authority under Option B |
| `relevanceLevel` | OPTIONAL | `canonicalValue` copied when interpreted | No | Neutral relevance summary | LOW, MODERATE, or HIGH relevance only |
| `reviewAttentionIndicator` | OPTIONAL | `canonicalValue` copied through controlled mapping | No | Neutral review context | Must not be priority |
| `sourceVersion` | FORBIDDEN | N/A | N/A | Avoids ambiguous alias for `entry.rawVersion` | Forbidden |
| `auditRequired` | FORBIDDEN | N/A | N/A | Avoids confusion with workflow audit obligation | Forbidden |
| `rawValue` | FORBIDDEN | N/A | N/A | Raw is preserved only in Internal Model | No direct interpretation |
| `riskCategory` | FORBIDDEN | N/A | N/A | Prevent concern mapping | Forbidden |
| `concernCategory` | FORBIDDEN | N/A | N/A | Prevent concern mapping | Forbidden |
| `riskConcern` | FORBIDDEN | N/A | N/A | Prevent concern mapping | Forbidden |
| `score` | FORBIDDEN | N/A | N/A | Prevent numeric use | Forbidden |
| `priority` | FORBIDDEN | N/A | N/A | Prevent review-priority use | Forbidden |
| `severity` | FORBIDDEN | N/A | N/A | Prevent severity mapping | Forbidden |
| `criticality` | FORBIDDEN | N/A | N/A | Prevent criticality mapping | Forbidden |
| `redFlag` | FORBIDDEN | N/A | N/A | Prevent Red Flag derivation | Forbidden |
| `blocking` | FORBIDDEN | N/A | N/A | Prevent workflow blocking | Forbidden |
| `recommendation` | FORBIDDEN | N/A | N/A | Prevent recommendation generation | Forbidden |
| `decision` | FORBIDDEN | N/A | N/A | Prevent decision generation | Forbidden |

## 17. Interpretation State Model

The closed interpretation-state set for Risk Relevance interpretation is intentionally small:

- `INTERPRETED`
- `NOT_INTERPRETED`

State rules:

- `INTERPRETED` means the entry passed all eligibility gates and produced a neutral relevance interpretation.
- `NOT_INTERPRETED` means the entry is audit-visible but did not produce a neutral relevance interpretation.

All detailed explanation MUST live in `interpretationReason`, not in additional state names. This prevents a parallel state system that duplicates registry states such as `UNKNOWN_VALUE`, `INVALID_VALUE`, `NOT_PRESENT`, `VERSION_UNSUPPORTED`, or `UNKNOWN_VERSION`.

Reason codes remain machine-readable and deterministic. They may reference preserved registry states without redefining them.

## 18. Hypothesis Binding

Every Risk Relevance interpretation entry MUST remain source-bound.

Binding rules:

- Primary hypothesis entries bind through `sourceElementReference`, for example `source:hypothesis:001`.
- Alternative hypothesis entries bind through their stable source order, for example `source:hypothesis:002` and later.
- Missing hypothesis IDs do not block binding.
- Duplicate hypothesis IDs do not collapse entries.
- Source order remains deterministic and auditable.
- `sourceReference` is required.
- No interpretation may be identified only by `canonicalValue`.

## 19. Reference Strategy

`riskRelevanceInterpretationReference` MUST be deterministic and must include the source preservation entry reference.

Required format:

```text
${sourceRiskRelevanceEntryReference}:interpretation
```

If duplicate references ever occur because of invalid upstream data, the implementation MUST suffix a deterministic position marker and preserve the original source reference in `sourceRiskRelevanceEntryReference`.

The Interpretation Model MUST NOT use provider class names, router candidate order, keyword matches, local file paths, timestamps, random values, or free prose as references.

## 20. Mutability and Auditability

Decisions:

- Risk Relevance interpretation entries MUST be frozen.
- `riskRelevanceInterpretations` collection MUST be frozen.
- Raw value references MUST NOT be copied into interpretation output.
- Provider object references MUST NOT be copied into interpretation output.
- Interpretation output may copy scalar `canonicalValue`, `valueState`, `versionState`, `governanceVersion`, and `sourceRiskRelevanceVersion` from preservation entries.
- `canonicalValue` is copied as an immutable scalar, not used as an object reference.
- Drift is prevented by using stable preservation references and excluding raw object references from interpretation entries.

This is a stronger immutability rule for the new Risk Relevance interpretation collection only. It is not a silent freeze of existing Interpretation Model collections.

## 21. Failure Semantics

The later implementation MUST obey these failure rules:

- Unknown values do not throw.
- Invalid values do not throw.
- Unsupported values do not throw.
- Unsupported versions do not throw.
- Unsupported governance versions do not throw.
- A single invalid entry does not fail the whole domain interpretation.
- No silent fallback mapping is allowed.
- No canonical value may be invented.
- No interpretation is allowed for `VERSION_UNSUPPORTED`.
- Reason codes must be deterministic.
- Existing non-Risk-Relevance interpretation must continue when Risk Relevance entries are malformed.

Structurally defective entry handling:

- If an entry has a usable `riskRelevanceEntryReference` or `sourceElementReference`, the Interpretation Model MUST create a `NOT_INTERPRETED` audit entry with reason `RR_NOT_ELIGIBLE_MALFORMED_ENTRY`.
- If an entry has no stable reference at all, the Interpretation Model MUST skip that entry and add a deterministic domain limitation with reason `RR_SKIPPED_MALFORMED_ENTRY_WITHOUT_REFERENCE`.
- The implementation MUST NOT invent source references for malformed entries.
- A malformed entry MUST NOT activate legacy fallback when `riskRelevanceEntries` exists on the domain assessment.

## 22. Backward Compatibility

The data-contract migration MUST be additive.

Existing fields and consumers must not be silently removed. Existing domain interpretation fields, risk drivers, red flags, recommendations, conflicts, confidence context, completeness context, guardrails, and limitations must remain structurally compatible unless a separate architecture approves a broader change.

However, additive data-contract compatibility does not mean zero behavior change. Removing raw `riskRelevance` from category alias extraction is an intentional behavior change because the current behavior is governance-incompatible.

Expected behavior changes:

- Raw `riskRelevance: "low"` no longer creates `LOW_CONCERN`.
- Raw `riskRelevance: "moderate"` no longer creates `MODERATE_CONCERN`.
- Raw `riskRelevance: "high"` no longer creates `ELEVATED_CONCERN`.
- Raw `riskRelevance: "critical"`, `"safety_relevant"`, or `"safety_critical"` no longer creates `CRITICAL_CONCERN`.
- Explicit `concernCategory`, `riskCategory`, and `riskConcern` remain existing explicit concern surfaces unless a future architecture narrows them.

Compatibility rule:

- If `domainAssessment.riskRelevanceEntries` exists, only those entries may drive Risk Relevance interpretation.
- Existing raw `riskRelevance` alias behavior must be disabled for that domain assessment.
- Existing explicit `concernCategory`, `riskCategory`, and `riskConcern` behavior may continue as non-Risk-Relevance explicit concern behavior, but `riskRelevance` must be removed from the direct category-source list.

## 23. Legacy Fallback Decision

Decision: a legacy fallback is allowed only for Internal Model inputs that do not expose `riskRelevanceEntries` at all.

Fallback constraints:

- It applies only when `Object.hasOwn(domainAssessment, "riskRelevanceEntries") === false`.
- It MUST NOT interpret raw `riskRelevance` into concern categories.
- It MAY emit an empty `riskRelevanceInterpretations` collection.
- It MAY emit a domain limitation such as `Risk Relevance preservation entries are not available on this Internal Model input.`
- It MUST be explicitly tested.
- It MUST NOT run when `riskRelevanceEntries` is present, even if the collection is empty.
- It MUST NOT run for malformed entries, unsupported versions, unsupported governance versions, `NOT_PRESENT`, `UNKNOWN_VALUE`, `INVALID_VALUE`, or non-eligible entries.

No dual-source interpretation is permitted.

## 24. Consumer Boundary

Risk Relevance interpretation MUST NOT influence:

- Providers.
- Router.
- Engine order.
- Domain precedence.
- Building Risk Score.
- Export authorization.
- Report blocking.
- UI decisions.
- CAPEX recommendations.
- Diagnoses.
- Public contracts.
- Persistence.

It is internal, source-bound, auditable interpretation material only.

Existing consumers that must not be modified in the implementation sprint unless a separate gate authorizes them:

- Knowledge Providers.
- Reasoning adapters.
- `KnowledgeReasoningMapper`.
- `ExpertReasoningEngine` transport logic, except if a separate non-Risk-Relevance bug is approved.
- `KnowledgeDomainRouter`.
- UI pages and components.
- Report, recommendation, decision, and inspection catalog modules.
- Public contract or export modules.

## 25. Explicitly Forbidden Interpretations

| Derivation | Status | Reason |
| --- | --- | --- |
| Risk Relevance -> Severity | FORBIDDEN | Relevance is not damage seriousness or issue intensity. |
| Risk Relevance -> Probability | FORBIDDEN | Relevance is not likelihood. |
| Risk Relevance -> Criticality | FORBIDDEN | `HIGH_RELEVANCE` is not criticality. |
| Risk Relevance -> Score | FORBIDDEN | Governance forbids numeric mapping, weighting, and formulas. |
| Risk Relevance -> Priority | FORBIDDEN | Review attention is not workflow priority. |
| Risk Relevance -> Red Flag | FORBIDDEN | Red Flag governance is separate. |
| Risk Relevance -> Blocking | FORBIDDEN | Relevance cannot block reports, exports, or interpretation. |
| Risk Relevance -> Recommendation | FORBIDDEN | Relevance cannot create actions. |
| Risk Relevance -> Decision | FORBIDDEN | Relevance cannot make professional or transaction decisions. |
| Risk Relevance -> Confirmed Diagnosis | FORBIDDEN | Relevance is source context, not diagnostic confirmation. |
| Risk Relevance -> Concern Category | FORBIDDEN | Concern categories remain explicit structured interpretation outcomes, not Risk Relevance derivations. |
| Risk Relevance -> Risk Class | FORBIDDEN | Public or internal risk class requires separate architecture. |

## 26. Migration Strategy

The migration must occur in this order:

1. Remove `riskRelevance` from direct category-source extraction for domain assessments that expose `riskRelevanceEntries`.
2. Compute Risk Relevance interpretation eligibility inside the Interpretation Model from preserved fields.
3. Add `domainInterpretation.riskRelevanceInterpretations[]` as an additive internal collection.
4. Produce frozen interpretation entries from preservation entries only.
5. Freeze the new `riskRelevanceInterpretations` collection.
6. Preserve existing explicit concern behavior for `concernCategory`, `riskCategory`, and `riskConcern` where already supported.
7. Add regression tests proving raw `riskRelevance` no longer creates concern categories.
8. Keep provider outputs unchanged.
9. Keep router and engine behavior unchanged.

## 27. Implementation Scope

The next implementation sprint after this architecture review should be:

`Risk Relevance Interpretation Implementation`

Expected allowed files:

- `portal/core/risk/BuildingRiskInterpretationModel.js`
- `tests/building-risk-interpretation-model-test.js`

Optional only if a confirmed implementation blocker appears:

- None.

The Internal Model MUST NOT be changed in the implementation sprint under Option B. Registry changes are not needed because the current registry already owns the needed state model and governance definition. Provider, router, engine, UI, report, API, persistence, public contract, and documentation changes are out of scope for the implementation sprint.

## 28. Test Strategy

Tests must prove that Risk Relevance interpretation is source-bound, additive, deterministic, and non-derivative.

The implementation sprint must include:

- Focused Interpretation Model tests for `riskRelevanceInterpretations` output.
- Focused Interpretation Model tests for computed eligibility from preservation fields.
- Regression tests that raw `riskRelevance` aliases no longer create concern categories when preservation entries are present.
- Regression tests that existing explicit `concernCategory` behavior remains intact.
- Boundary tests for no score, no priority, no severity, no concern mapping, no red flag, no blocking, no recommendation, and no decision.

## 29. Required Unit-Test Matrix

| # | Required Test | Expected Result |
| --- | --- | --- |
| 1 | Collection vorhanden | `riskRelevanceInterpretations` exists additively. |
| 2 | Primary-Hypothesis-Bindung | Entry binds to primary source element reference. |
| 3 | Alternative-Hypothesis-Bindung | Entry binds to alternative source element reference. |
| 4 | Fehlende Hypothesen-ID | Stable reference still binds. |
| 5 | Doppelte Hypothesen-ID | Entries remain distinct by source element reference. |
| 6 | Stabile Quellreihenfolge | Output order follows preservation order. |
| 7 | `CANONICAL + VERSION_SUPPORTED` | Interpreted. |
| 8 | `CANONICAL + UNKNOWN_VERSION` | Audit-only, not interpreted. |
| 9 | `CANONICAL + VERSION_UNSUPPORTED` | Audit-only, not interpreted. |
| 10 | `LEGACY_SUPPORTED + VERSION_SUPPORTED` | Interpreted with legacy audit visible. |
| 11 | `LEGACY_SUPPORTED + UNKNOWN_VERSION` | Audit-only, not interpreted. |
| 12 | `LEGACY_SUPPORTED + VERSION_UNSUPPORTED` | Audit-only, not interpreted. |
| 13 | `LEGACY_UNSUPPORTED` | Audit-only, reason unsupported value. |
| 14 | `UNKNOWN_VALUE` | Audit-only, reason unknown value. |
| 15 | `INVALID_VALUE` | Audit-only, reason invalid value. |
| 16 | `NOT_PRESENT` | Audit-only, reason not present. |
| 17 | Fehlender `canonicalValue` | Not interpreted. |
| 18 | Fehlende `governanceVersion` | Not interpreted. |
| 19 | Unsupported `governanceVersion` | Not interpreted. |
| 20 | `interpretationEligible: false` | Does not control computed eligibility under Option B; remains audit-visible. |
| 21 | Raw Value wird nicht direkt interpretiert | No raw alias use. |
| 22 | Getter wird nicht ausgefuehrt | No getter execution. |
| 23 | Zyklischer Raw Value beeinflusst Interpretation nicht | No throw, no raw use. |
| 24 | Symbol/BigInt beeinflussen Interpretation nicht | No throw, no raw use. |
| 25 | Keine Registry-Duplikation | No local legacy mapping table in Interpretation Model. |
| 26 | Keine lokalen State-Mappings | Uses preserved registry states. |
| 27 | Kein Score | No score fields. |
| 28 | Keine Priority | No priority fields. |
| 29 | Kein Severity Mapping | No severity fields or derivation. |
| 30 | Kein Concern Mapping | No concern category from Risk Relevance. |
| 31 | Kein Red Flag Mapping | No red flag from Risk Relevance. |
| 32 | Kein Blocking | No blocking field or effect. |
| 33 | Keine Empfehlung | No recommendation from Risk Relevance. |
| 34 | Keine Entscheidung | No decision from Risk Relevance. |
| 35 | Bestehende Interpretation bleibt rueckwaertskompatibel | Existing explicit concern behavior remains. |
| 36 | Neues Feld bleibt additiv | Existing output shape preserved. |
| 37 | Interpretationseintrag ist gefroren | Each entry is frozen. |
| 38 | Collection-Freeze gemaess Architekturentscheidung | New `riskRelevanceInterpretations` collection is frozen. |
| 39 | Ungueltiger Einzelentry bricht Gesamtergebnis nicht | Domain interpretation continues. |
| 40 | Legacy-Fallback gemaess Architekturentscheidung | Only for models without preservation collection. |
| 41 | Leere `riskRelevanceEntries` Collection | Source-of-truth boundary active; no fallback. |
| 42 | Fehlende `riskRelevanceEntries` Collection | Legacy fallback limitation only; no raw concern mapping. |
| 43 | Unsupported `governanceVersion` | `NOT_INTERPRETED` with deterministic reason. |
| 44 | Malformed Entry mit Referenz | Audit entry preserved as `NOT_INTERPRETED`. |
| 45 | Malformed Entry ohne Referenz | Entry skipped with deterministic domain limitation. |
| 46 | Mehrfachentries | Each entry is handled independently and source order is preserved. |

## 30. Required Regression Tests

Regression tests must prove:

- `riskRelevance: "low"` alone no longer creates `LOW_CONCERN` when `riskRelevanceEntries` exists.
- `riskRelevance: "moderate"` alone no longer creates `MODERATE_CONCERN` when `riskRelevanceEntries` exists.
- `riskRelevance: "high"` alone no longer creates `ELEVATED_CONCERN` when `riskRelevanceEntries` exists.
- `riskRelevance: "critical"` no longer creates `CRITICAL_CONCERN`.
- `riskRelevance: "safety_relevant"` no longer creates `CRITICAL_CONCERN`.
- `riskRelevance: "safety_critical"` no longer creates `CRITICAL_CONCERN`.
- Explicit `concernCategory` still creates the existing supported concern category.
- Existing Red Flag preservation remains visible without new Risk Relevance red flags.
- Existing recommendations remain preserved without new Risk Relevance recommendations.
- Existing overall category aggregation remains based on explicit concern drivers only.
- `riskRelevanceEntries` does not appear in public contract, UI, report, API, or persistence output.

## 31. Implementation Sequence

Foundation 1.5 sprint sequence:

Completed architecture sequence:

- Foundation 1.5 Sprint I-3L: `Risk Relevance Interpretation Implementation Readiness Architecture`.
- Status: completed and reviewed, not committed.
- Foundation 1.5 Sprint I-3M: `Risk Relevance Interpretation Implementation Readiness Architecture Review`.
- Status: completed, not committed.

Architecture storage gate:

- `Risk Relevance Interpretation Readiness Architecture Commit Gate`.
- This storage gate has no Foundation sprint number.
- It MUST NOT be named Sprint I-3N, Sprint I-3O, or Sprint I-3P.

Implementation sequence:

1. Foundation 1.5 Sprint I-3N: `Risk Relevance Interpretation Implementation`.
2. Foundation 1.5 Sprint I-3O: `Risk Relevance Interpretation Implementation Review`.
3. Foundation 1.5 Sprint I-3P: `Risk Relevance Interpretation Implementation Commit Gate`.

Sprint I-3N sequence:

1. Add failing tests for eligibility derivation and raw alias deactivation.
2. Remove raw `riskRelevance` from direct category extraction for models with preservation entries.
3. Add computed Risk Relevance eligibility inside the Interpretation Model.
4. Add `riskRelevanceInterpretations` output from entries only.
5. Freeze interpretation entries and the new collection.
6. Add and pass boundary tests.
7. Run focused Risk Relevance, Internal Model, and Interpretation Model tests.
8. Run the full JavaScript test-file loop in `tests`.

No implementation is authorized in Sprint I-3M. Sprint I-3M is the architecture review gate only.

## 32. Review Gate

Sprint I-3O must verify:

- Source of truth is exclusively `riskRelevanceEntries`.
- Raw `riskRelevance` alias interpretation is disabled at the migration boundary.
- No dual-source interpretation exists.
- `interpretationEligible` follows Option B and remains audit-visible rather than authoritative.
- `UNKNOWN_VERSION` is never interpreted.
- No local registry duplicate mapping exists.
- No score, priority, severity, concern mapping, red flag, blocking, recommendation, decision, provider, router, engine, UI, report, API, persistence, or public contract behavior is introduced.
- All required unit and regression tests exist.

## 33. Commit Gate

Sprint I-3P must commit only the approved implementation and tests after:

- Clean branch and expected HEAD verification.
- Exact changed-file scope verification.
- `git diff --check` and `git diff --cached --check`.
- Focused tests for registry, Internal Model, and Interpretation Model.
- Complete JavaScript test-file loop in `tests`.
- Staged diff review proving no unauthorized files and no forbidden derivations.
- Commit message fixed by the sprint gate.
- No tag unless separately authorized.

## 34. Risks and Open Questions

Open P0: none.

Open P1: none for architecture readiness.

Open P2:

- Existing tests currently prove direct raw alias behavior; the implementation sprint must update those tests to the new migration boundary.
- Existing explicit `riskCategory` and `riskConcern` aliases remain outside Risk Relevance interpretation and may need future independent governance.
- Provider values remain legacy and unversioned until later provider migration.

Resolved architecture questions:

- Source of truth: `domainAssessment.riskRelevanceEntries` only.
- `UNKNOWN_VERSION`: never interpreted in Foundation 1.5 Risk Relevance interpretation.
- Legacy fallback: only for models without `riskRelevanceEntries`, and never as concern mapping.
- Mutability: frozen entries and frozen new `riskRelevanceInterpretations` collection.
- Raw values: forbidden in interpretation output.
- Concern mapping: forbidden from Risk Relevance.

## 35. Final Readiness Decision

This architecture is ready for implementation review because all core decisions are closed:

- Interpretation source of truth is exclusive.
- Eligibility is deterministic.
- `interpretationEligible` is not authoritative under Option B; eligibility is computed in the Interpretation Model from preserved fields.
- `UNKNOWN_VERSION` handling is explicit.
- Legacy handling is registry-owned.
- Unknown, invalid, missing, and unsupported states are distinct.
- Output contract is additive and internal.
- Forbidden derivations are explicit.
- Hypothesis binding is stable.
- Failure semantics are non-throwing and source-bound.
- Backward compatibility has a clear migration boundary and fallback rule.
- Implementation scope and test matrix are defined.

Final status:

`READY FOR RISK RELEVANCE INTERPRETATION IMPLEMENTATION READINESS ARCHITECTURE COMMIT`

`READY FOR RISK RELEVANCE INTERPRETATION IMPLEMENTATION`

`NOT READY FOR RISK RELEVANCE INTERPRETATION IMPLEMENTATION COMMIT`

`RISK RELEVANCE INTERPRETATION IMPLEMENTATION READINESS ARCHITECTURE REVIEWED - NOT COMMITTED`
