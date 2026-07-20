# Building Risk Interpretation Architecture 1.0

## Foundation 1.4 / Sprint I-2C

This document defines the architecture of the future Building Risk Interpretation layer.

It is an architecture paper only. It does not define implementation, executable tests, formulas, numerical weightings, score values, APIs, JSON Schemas, UI, reports, persistence, or productive Building Risk Score™ output.

## 1. Architectural Position

The Building Risk Interpretation layer sits after `BuildingRiskInternalModel` and before any future public Building Risk Score™ contract rendering.

Its only allowed input is the deterministic result of `BuildingRiskInternalModel`.

It must not directly access:

- raw inspection data
- raw measurements
- images
- keywords
- router logic
- provider internals
- provider instances
- UI state
- reports
- persistence records
- market data

Priority: `P0`

## 2. Purpose

The Risk Interpretation layer prepares a controlled, explainable interpretation of risk-relevant signals from the internal model.

It supports future professional decision intelligence by organizing:

- risk-relevant source signals
- evidence sufficiency
- positive indicators
- missing evidence
- unknowns
- red flags
- recommendations
- unresolved conflicts
- audit references
- interpretation limitations

Priority: `P0`

The layer prepares later decisions about what should be reviewed, explained, escalated, or left unknown.

It does not make final technical, legal, financial, valuation, acquisition, safety, or engineering decisions.

It must never:

- replace structural engineering assessment
- confirm a technical diagnosis
- determine market value
- recommend purchase or sale
- guarantee safety
- certify load-bearing capacity
- certify absence of defects
- replace a professional report

Priority: `P0`

## 3. Risk Signal Model

A Risk Signal is a source-bound, audit-referenced indication that may become relevant to a future risk interpretation.

A Risk Signal is not a score, not a diagnosis, not a public risk class, and not a professional conclusion.

Priority: `P0`

Conceptual signal types:

- observed condition
- supported hypothesis
- potential consequence
- red flag
- recommendation
- missing evidence
- unknown
- contradictory evidence

Priority: `P1`

Elements that may generate Risk Signals:

- source hypotheses preserved by the internal model
- supporting evidence references
- potential consequences
- existing red flags preserved from source contracts
- required verification and recommendations
- missing evidence items
- unknown items
- conflict references
- completeness states where they limit interpretability

Priority: `P0`

Elements that must never automatically generate Risk:

- missing evidence alone
- unknown completeness alone
- invalid input alone
- not assessed state alone
- low confidence alone
- high confidence alone
- domain presence alone
- source contract order alone
- provider identity
- router order
- keyword presence
- positive indicators

Priority: `P0`

Elements that indicate uncertainty or review need rather than automatic Risk:

- missing evidence
- unknowns
- incomplete contracts
- legacy contracts
- confidence divergence
- recommendation divergence
- version conflict
- contradictory evidence
- not assessed state

Priority: `P0`

## 4. Risk vs. Confidence vs. Review Priority vs. Completeness vs. Red Flag

The following concepts must remain separate.

Risk:

A future interpretation of concern based on source-bound internal model elements. Risk is not calculated in this architecture paper.

Confidence:

A source-bound or interpretation-bound reliability concept. It must not be recalculated, averaged, or converted into risk by the interpretation layer unless a future architecture explicitly defines a non-scoring rule.

Review Priority:

A future workflow-oriented attention concept. It is not identical to Risk.

Completeness:

A source contract readiness state. It is not a risk class and not confidence.

Red Flag Status:

A structured attention marker preserved or governed by source-bound evidence. It is not a numerical score and not proof of unsafe condition.

Priority: `P0`

Binding decisions:

- high Review Priority is not automatically high Risk
- low Confidence is not automatically low Risk or high Risk
- Missing Evidence is not automatically Risk
- Red Flag is not a numerical score
- Completeness is not a risk class
- invalid input is not Unknown
- not assessed is not Low Risk
- positive indicators do not erase Risk Signals

Priority: `P0`

## 5. Risk Interpretation Categories

The future interpretation layer may use conceptual categories to organize outcomes. These are architecture categories, not final public field names.

Confirmed categories:

- `NO_CONFIRMED_RISK_INTERPRETATION`
- `LOW_CONCERN`
- `MODERATE_CONCERN`
- `ELEVATED_CONCERN`
- `CRITICAL_CONCERN`
- `UNKNOWN`
- `NOT_ASSESSED`

Priority: `P1`

Category intent:

`NO_CONFIRMED_RISK_INTERPRETATION`:

Use when the internal model contains no supported risk interpretation, while still preserving evidence, limitations, and missing evidence.

`LOW_CONCERN`:

Use only where source-bound internal model elements support a low-concern interpretation. It must not mean no defect, safe, or guaranteed acceptable.

`MODERATE_CONCERN`:

Use where source-bound elements indicate material follow-up or review relevance without critical escalation.

`ELEVATED_CONCERN`:

Use where source-bound elements indicate heightened concern, significant verification need, or consequential uncertainty.

`CRITICAL_CONCERN`:

Use only where source-bound elements support critical concern language or urgent review need. It must not certify danger or structural unsafety.

`UNKNOWN`:

Use where the internal model cannot support a confirmed interpretation.

`NOT_ASSESSED`:

Use where the internal model indicates no applicable assessment source was provided.

Priority: `P1`

Rejected categories for Foundation 1.4:

- `SAFE`
- `NO_RISK`
- `PASS`
- `FAIL`
- `BUY`
- `DO_NOT_BUY`
- `STRUCTURALLY_SAFE`
- `MARKET_VALUE_IMPACT`

Priority: `P0`

Internal vs. public use:

For Foundation 1.4, these categories should remain internal architecture categories until the future Public Contract mapping is explicitly governed.

Priority: `P1`

Language restraint:

The interpretation layer must avoid exaggerated or final professional wording. It should use concern and review-oriented language, not diagnosis, certification, or guarantee language.

Priority: `P0`

## 6. Evidence Sufficiency

Evidence Sufficiency describes whether a future interpretation is sufficiently supported by internal model references. It is not Confidence.

Confirmed sufficiency states:

- `SUPPORTED`
- `PROVISIONALLY_SUPPORTED`
- `INSUFFICIENTLY_SUPPORTED`
- `CONTRADICTED`
- `UNKNOWN`

Priority: `P1`

`SUPPORTED`:

The interpretation is backed by source-bound hypotheses and evidence references without unresolved contradiction that blocks interpretation.

`PROVISIONALLY_SUPPORTED`:

The interpretation has source-bound support but remains limited by missing evidence, incomplete contracts, legacy detail, or unresolved review need.

`INSUFFICIENTLY_SUPPORTED`:

The internal model contains relevant material but not enough source-bound support for a confirmed interpretation.

`CONTRADICTED`:

The internal model contains conflict references or contradictory evidence that prevents a clean interpretation.

`UNKNOWN`:

The internal model cannot establish sufficiency.

Priority: `P1`

Binding rule:

Confidence may be referenced as context, but it must not substitute for Evidence Sufficiency.

Priority: `P0`

## 7. Positive Indicators

Positive indicators may be used to make interpretation more balanced and explainable.

They may:

- qualify a concern
- show stabilizing source-bound observations
- reveal tension with risk-relevant hypotheses
- improve explainability
- support a lower-concern interpretation when evidence is sufficient

Priority: `P1`

They must not:

- automatically neutralize Risk
- overwrite Red Flags
- replace Missing Evidence
- prove absence of defects
- confirm technical safety
- suppress critical source-bound findings

Priority: `P0`

Positive indicators must remain source-referenced and bounded by limitations.

Priority: `P0`

## 8. Missing Evidence and Unknown

Missing Evidence must not automatically create Risk.

Missing Evidence may increase review need, limit Evidence Sufficiency, create Unknown, or require explanation.

Priority: `P0`

Unknown is a valid outcome and must not be represented as Low Risk.

Priority: `P0`

Not Assessed remains separate from Unknown.

Priority: `P0`

Invalid remains separate from Unknown.

Priority: `P0`

The interpretation layer must preserve the distinction between:

- missing evidence
- incomplete contract
- unknown outcome
- not assessed source set
- invalid source input
- contradictory evidence

Priority: `P0`

## 9. Red Flags

Red Flags are structured source-bound attention markers. They are not scores, not diagnoses, not safety conclusions, and not purchase recommendations.

Priority: `P0`

For Foundation 1.4, the Risk Interpretation layer should preserve existing Red Flags and may expose them as interpretation drivers.

It should not freely invent new Red Flags.

Decision: `PRESERVE_ONLY_FOR_FOUNDATION_1_4`

Priority: `P0`

Rationale:

The current internal model preserves source Red Flags but does not establish a governed derivation policy for new Red Flags. Deriving new Red Flags would require explicit governance over terminology, consequence language, domain metadata, and review priority. That is outside this sprint.

Red Flag rules:

- existing Red Flags from source contracts remain visible
- Red Flags must retain audit references
- positive indicators must not overwrite Red Flags
- Red Flags must not trigger automatic safety conclusions
- Red Flags must not resolve conflict priority
- Red Flags must not become a numerical score

Priority: `P0`

Future derivation:

A later sprint may define governed Red Flag derivation from internal model elements, but only with architecture tests and non-scope guardrails.

Priority: `P2`

## 10. Conflict Handling

The Risk Interpretation layer may use internal model conflicts as uncertainty, review, or explanation factors.

It may:

- make conflicts visible
- reference conflict records
- preserve all source positions
- explain why interpretation is limited
- mark evidence sufficiency as contradicted or provisional
- defer interpretation when conflicts block confidence in the conclusion

Priority: `P0`

It must not:

- silently resolve conflicts
- average conflicting values
- use provider priority
- use router order
- choose a winner without source-bound governance
- mark a conflict as resolved without explicit evidence
- convert conflict into automatic Risk

Priority: `P0`

## 11. Multi-Domain Interpretation

The interpretation layer must handle multiple Domain Assessments without simple averaging or equal weighting.

Priority: `P0`

Rules:

- no simple mean across domains
- no implicit equal weighting
- no domain priority without governance
- no suppression of critical individual findings
- no automatic domain hierarchy from provider or router order
- no cross-domain diagnosis
- each Domain Assessment remains independently auditable
- overall interpretation must disclose its source drivers

Priority: `P0`

A future overall interpretation may summarize multiple domain-level interpretations, but it must expose which source-bound drivers shaped the result.

Priority: `P1`

## 12. Domain Independence

New domains must be integrable without changing the interpretation architecture.

The layer must not depend on:

- fixed provider lists
- provider classes
- provider-specific field names
- keywords
- router output
- domain-specific special cases

Priority: `P0`

Unknown domain IDs remain processable if the internal model is valid.

Priority: `P0`

Future domain metadata may be allowed only if governed as optional, public, provider-independent metadata.

Governance required for future domain metadata:

- source must be internal-model-visible or public-contract-visible
- metadata must be optional
- metadata must not introduce provider special cases
- metadata must not create hidden weighting
- unknown metadata must be safely ignorable
- metadata semantics must be versioned

Priority: `P1`

## 13. Determinism

Identical Internal Model input must produce identical Risk Interpretation output.

Determinism invariants:

- stable ordering of interpreted source drivers
- stable category assignment for identical input
- stable conflict handling
- stable Missing Evidence treatment
- stable Unknown treatment
- stable Positive Indicator treatment
- stable Red Flag treatment
- stable Recommendation treatment
- stable Audit Reference preservation
- no dependence on current time
- no random identifiers
- no user-session state
- no provider runtime state
- no router runtime state

Priority: `P0`

Unknown fields may be ignored or preserved only in deterministic ways.

Priority: `P0`

## 14. Explainability

Every future Risk Interpretation must explain itself using referencable Internal Model elements.

It must be able to explain:

- primary risk drivers
- supporting evidence
- positive indicators
- missing evidence
- unknowns
- conflicts
- red flags
- recommendations
- interpretation limitations
- source contract references

Priority: `P0`

Explainability must come from:

- Domain Assessments
- Hypothesis References
- Evidence References
- Missing Evidence
- Unknowns
- Conflict References
- Red Flags
- Recommendations
- Confidence Context
- Completeness States
- Guardrails
- Audit Context

Priority: `P0`

It must not produce a generative free technical diagnosis.

Priority: `P0`

## 15. Monotonicity and Stability

Additional evidence may change interpretation, but only in an explainable, source-bound way.

Priority: `P1`

Allowed changes:

- stronger source-bound support changes concern category
- new Missing Evidence changes sufficiency or unknown state
- new Conflict Reference limits interpretation
- new Red Flag preserved from source increases attention visibility
- new positive indicator qualifies interpretation with source reference

Priority: `P1`

Forbidden changes:

- random category jumps
- changes caused only by input order when source references and content are equivalent
- changes caused only by unknown additive fields
- changes caused only by new provider class name
- changes caused only by router changes
- changes caused by keywords not present in Internal Model
- changes caused by time, session, or environment

Priority: `P0`

## 16. Guardrails

The Risk Interpretation layer must never:

- confirm load-bearing capacity
- confirm safety
- confirm absence of damage
- determine market value
- calculate CAPEX
- calculate RUL
- recommend purchase or sale
- guarantee insurability
- replace a technical due diligence report
- replace a structural engineering assessment
- create a legal opinion
- create a final expert diagnosis

Priority: `P0`

## 17. Architecture Test Goals

Future architecture tests must guarantee:

- Risk and Confidence remain separate
- Confidence does not calculate Risk
- Missing Evidence does not automatically create Risk
- Unknown is not Low Risk
- Not Assessed remains separate from Unknown
- Invalid remains separate from Unknown
- Red Flags remain visible
- Positive Indicators do not overwrite Red Flags
- conflicts remain auditable
- identical input produces identical interpretation
- new domains do not break architecture
- unknown domains remain processable
- no Provider dependency exists
- no Router dependency exists
- no Keyword dependency exists
- no simple averaging across domains
- no implicit equal weighting across domains
- no Public Contract change is introduced by interpretation internals
- no UI, Report, API, persistence, CAPEX, RUL, or acquisition recommendation behavior appears

Priority: `P0`

No tests are implemented by this document.

## 18. Open Decisions

### Internal Risk Categories

Decision: `ACCEPTED_FOR_INTERNAL_ARCHITECTURE`

Priority: `P1`

The conceptual categories listed in this document are suitable for internal modeling. Final public names remain open.

### Review Priority Model

Decision: `DEFERRED`

Priority: `P1`

Reason:

Review Priority requires workflow governance and must not be conflated with Risk. It should be defined after the interpretation category model is stable.

### Evidence Sufficiency States

Decision: `ACCEPTED_FOR_INTERNAL_ARCHITECTURE`

Priority: `P1`

The sufficiency states are suitable as architecture concepts. Implementation rules remain future scope.

### Red Flag Handling

Decision: `ACCEPTED_PRESERVE_ONLY_FOR_FOUNDATION_1_4`

Priority: `P0`

Existing Red Flags may be preserved and exposed. New Red Flag derivation is deferred.

### Multi-Domain Governance

Decision: `PARTIALLY_ACCEPTED`

Priority: `P1`

Accepted:

- no averaging
- no equal weighting
- no provider/router priority
- source drivers must remain visible

Deferred:

- exact future overall interpretation policy across multiple Domain Assessments

### Domain Metadata Registry

Decision: `DEFERRED`

Priority: `P2`

Reason:

Domain metadata can be useful later, but only as optional, versioned, provider-independent metadata.

### Public vs. Internal Classification

Decision: `DEFERRED`

Priority: `P1`

Reason:

Internal categories can be modeled now. Public names and mapping require Public Contract governance.

### Future Numerical Score Capability

Decision: `DEFERRED`

Priority: `P2`

Reason:

Numerical scoring remains outside Foundation 1.4. The architecture must not include formulas, weightings, score values, or thresholds.

## 19. Implementation Readiness

Decision: `READY FOR RISK INTERPRETATION MODELING`

Priority: `P0`

Rationale:

The input boundary is now stable because `BuildingRiskInternalModel` provides deterministic preservation of source contracts, domain assessments, evidence references, completeness states, conflicts, red flags, recommendations, unknowns, and confidence context.

The future modeling work is ready only for non-scoring interpretation modeling. It is not ready for numeric scoring, review-priority workflow, public contract rendering, UI, reports, persistence, CAPEX, RUL, acquisition recommendation, or APIs.

## 20. Recommendation for Next Sprint

The next sprint should define the first non-scoring Risk Interpretation Model architecture or implementation slice, limited to:

- consuming `BuildingRiskInternalModel` output
- preserving audit references
- assigning internal conceptual categories only where source-bound evidence supports them
- preserving Unknown, Missing Evidence, Red Flags, Positive Indicators, and Conflicts separately
- proving determinism
- maintaining no-score and no-public-contract boundaries

It should not implement formulas, weightings, score values, CAPEX, RUL, Review Priority workflow, UI, reports, persistence, APIs, JSON Schemas, market valuation, or acquisition recommendation.

## 21. Conclusion

The Building Risk Interpretation layer must be an explainable, deterministic, source-bound interpretation layer over the internal model.

It may organize risk-relevant signals, sufficiency, uncertainty, positive indicators, red flags, recommendations, and conflicts. It must not calculate a score, confirm a diagnosis, certify safety, determine value, or replace expert review.

Foundation 1.4 Sprint I-2C is complete as Risk Interpretation Architecture only.
