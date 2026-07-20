# Building Risk Score™ Internal Domain Model 1.0

## Foundation 1.4 / Sprint I-1D

This document defines the internal domain model architecture for the future Building Risk Score™.

It is an architecture paper only. It does not define implementation, scoring logic, formulas, weightings, APIs, JSON Schemas, database models, UI, reports, persistence, or productive code.

## 1. Position in the Architecture

The internal Building Risk Score™ domain model sits between:

- source `ExpertReasoningContracts`
- the future Building Risk Score™ Public Contract

Its purpose is to prepare, preserve, reference, separate, and normalize contract-level information before public score contract rendering.

It must not know provider internals, router logic, keyword lists, raw inspection findings, raw building objects, raw measurements, images, reports, UI state, market data, or persistence state.

Priority: `P0`

## 2. Responsibility of the Internal Domain Model

The internal domain model is responsible for:

- accepting valid `ExpertReasoningContracts` as its only source input
- preserving source contract content needed for auditability
- creating stable internal references to source contracts and contract elements
- separating hypotheses, evidence, missing evidence, unknowns, recommendations, confidence context, and guardrails
- preparing explainability inputs for the future public contract
- preserving conflicts instead of resolving them
- normalizing technical shape without changing expert meaning
- supporting deterministic ordering, deduplication, and reference formation
- remaining provider-independent and domain-independent

Priority: `P0`

The internal domain model is not responsible for:

- calculating risk
- calculating confidence
- averaging confidence
- converting confidence into risk
- inventing recommendations
- reinterpreting evidence professionally
- creating new diagnoses
- creating new risk classes
- creating new review priorities without source basis
- determining provider order
- making routing decisions
- resolving technical conflicts between contracts
- replacing professional judgment

Priority: `P0`

## 3. Input Boundary

The internal domain model accepts only valid `ExpertReasoningContracts`.

Allowed source contract areas are:

- `primaryHypothesis`
- `alternativeHypotheses`
- `supportingEvidence`
- `missingEvidence`
- `requiredVerification`
- `potentialConsequences`
- `confidence`

Allowed public hypothesis information includes:

- hypothesis identity where present
- label, cause, category, or rationale where present
- classification where present
- structural relevance where present
- risk relevance where present
- capex relevance where present
- valuation relevance where present
- supporting indicators where present
- contradicting indicators where present
- required verification where present
- potential consequences where present
- recommended actions where present
- status where present

Priority: `P0`

Optional source contract information may include:

- domain metadata if later exposed through the public ExpertReasoningContract boundary
- contract version if later exposed
- language metadata if later exposed
- source identifiers if later exposed
- extension fields explicitly marked as public contract extensions

Priority: `P1`

Forbidden inputs include:

- provider knowledge payloads
- provider `keywords`
- provider-private scoring or ranking values
- router candidate lists
- router precedence
- raw finding text
- raw building data
- raw measurements
- images
- UI state
- report content
- database records
- market data

Priority: `P0`

## 4. Unvollständige Contracts, Legacy Fallbacks, and Invalid Inputs

Incomplete contracts must not be silently upgraded into complete risk interpretations.

A contract is minimally acceptable when it exposes the stable ExpertReasoningContract boundary sufficiently to identify:

- a primary hypothesis or fallback hypothesis representation
- alternative hypotheses as an array or explicit empty state
- supporting evidence as an array or explicit empty state
- missing evidence as an array or explicit empty state
- required verification as an array or explicit empty state
- potential consequences as an array or explicit empty state
- confidence as a public value or explicit unknown state

Priority: `P0`

Legacy fallback contracts are acceptable source contracts if they expose the stable public ExpertReasoningContract keys. They must be marked internally as fallback-derived or reduced-detail sources when that can be inferred from the public contract shape.

Priority: `P1`

Invalid inputs must be rejected architecturally or represented as invalid source material. They must not create risk signals, positive indicators, red flags, recommendations, or confidence context.

Priority: `P0`

Missing fields must be handled as missing contract evidence, not as low risk, not as positive evidence, and not as zero confidence unless the source contract explicitly states that meaning.

Priority: `P0`

No validation implementation is defined in this document.

## 5. Single-Contract vs. Multi-Contract Decision

### Variant A: Single ExpertReasoningContract per Score Result

Strengths:

- simpler traceability
- simple deterministic ordering
- direct compatibility with current First-Success governance
- narrow audit boundary

Weaknesses:

- insufficient for building-level risk interpretation
- cannot represent several independent findings in one building case
- weak portfolio readiness
- weak red flag visibility across domains
- weak positive-indicator handling across multiple reasoned findings
- encourages repeated isolated score outputs instead of one case-level risk view

### Variant B: Multiple ExpertReasoningContracts per Building or Assessment Case

Strengths:

- better fit for building-level decision intelligence
- supports multiple findings and domains without changing ExpertReasoningEngine governance
- preserves First-Success per individual source contract
- allows case-level explainability while maintaining source references
- supports auditability across several reasoned findings
- supports future portfolio-level rollups without changing source contract semantics
- allows conflicting contracts to remain visible side by side

Weaknesses:

- requires strict source reference governance
- requires deterministic ordering rules
- requires conflict preservation rules
- requires clear handling of duplicate or overlapping evidence
- requires explicit distinction between case-level preparation and risk calculation

### Foundation 1.4 Decision

Foundation 1.4 should adopt Variant B: multiple `ExpertReasoningContracts` per building or assessment case.

This is not a hybrid model. The internal domain model accepts a bounded set of source `ExpertReasoningContracts` for one assessment context. Each source contract remains the result of existing Single-Provider / First-Success Expert Intelligence governance. The Building Risk Score™ must not aggregate providers inside the ExpertReasoningEngine and must not change router behavior.

Priority: `P0`

Rationale:

A building risk view is not credible if limited to one finding contract. A professional building or due diligence case usually contains several findings, domains, uncertainties, and verification needs. Multi-contract input gives the score layer enough evidence breadth while preserving the existing First-Success governance at the ExpertReasoningContract level.

## 6. Internal Core Objects

The following conceptual internal objects are necessary. They are not final field names and not JSON structures.

### Assessment Context

Purpose:

Defines the bounded assessment case for which source contracts are prepared.

Mandatory information:

- internal model version
- assessment boundary
- source contract collection
- deterministic ordering basis

Optional information:

- future public contract version target
- conceptual creation timestamp
- assessment label or case reference if already public

Forbidden information:

- raw inspection data
- market data
- database-only persistence identifiers
- UI state
- formulas or weights

Relationships:

Owns source contract references, domain assessments, audit context, and conflict register.

Priority: `P0`

### Source Contract Reference

Purpose:

Provides a stable internal reference to each source ExpertReasoningContract.

Mandatory information:

- stable internal source reference
- source contract position in deterministic order
- available contract version or unknown version state
- source contract completeness state

Optional information:

- public domain identifier if exposed by source contract
- fallback-derived marker
- language marker if exposed by source contract

Forbidden information:

- router candidate path
- provider internals
- keyword hits
- raw input payload

Relationships:

Referenced by all internal objects derived from a source contract.

Priority: `P0`

### Domain Assessment

Purpose:

Groups source contract information by public domain or unknown domain state where such information is available.

Mandatory information:

- domain state: known, unknown, or unavailable
- source contract references
- hypothesis references
- evidence references
- missing evidence references

Optional information:

- optional domain summary
- optional domain metadata if later exposed publicly

Forbidden information:

- provider-specific fields
- router precedence
- provider keyword lists
- domain-specific custom structures that change the core model

Relationships:

Contains references to risk signals, positive indicators, unknown items, missing evidence items, red flag candidates, and recommendations.

Priority: `P1`

### Hypothesis Reference

Purpose:

Preserves primary and alternative hypotheses from source contracts without reinterpreting them.

Mandatory information:

- source contract reference
- hypothesis role: primary or alternative
- hypothesis public label or cause where present
- public classification where present
- hypothesis status where present

Optional information:

- public relevance fields
- public rationale
- public category
- public structural relevance

Forbidden information:

- provider ranking score
- provider private hypothesis object
- inferred diagnosis not present in source contract

Relationships:

May be referenced by risk signals, positive indicators, unknown items, red flags, and recommendations.

Priority: `P0`

### Evidence Reference

Purpose:

Preserves supporting evidence and supporting indicators from source contracts.

Mandatory information:

- source contract reference
- evidence text or public evidence token
- relation to primary or alternative hypothesis where available

Optional information:

- evidence group
- duplicate relation to another evidence reference

Forbidden information:

- raw images
- raw measurement interpretation not present in the contract
- keyword match internals

Relationships:

Supports risk signals, positive indicators, confidence context, and audit context.

Priority: `P0`

### Missing Evidence Item

Purpose:

Represents evidence gaps, contradictions, or missing verification from source contracts.

Mandatory information:

- source contract reference
- missing evidence description
- affected hypothesis or contract section where available

Optional information:

- recommended verification reference
- contradiction marker when explicitly represented by the source contract

Forbidden information:

- invented missing evidence
- automatic risk classification based only on absence

Relationships:

Feeds unknown items, audit context, recommendations, and public missing evidence preparation.

Priority: `P0`

### Unknown Item

Purpose:

Represents areas that cannot be interpreted reliably from available contracts.

Mandatory information:

- source contract reference or assessment-level reference
- unknown reason category
- relation to missing evidence, incomplete contract, or unresolved conflict

Optional information:

- limitation reference
- confidence context reference

Forbidden information:

- coerced low-risk interpretation
- hidden fallback to raw data

Relationships:

Feeds public unknowns and limitations.

Priority: `P0`

### Risk Signal

Purpose:

Carries source-contract signals that may later support public risk drivers.

Mandatory information:

- source contract reference
- hypothesis reference or consequence reference
- source basis from public contract fields
- unclassified signal state

Optional information:

- public relevance field reference
- consequence reference
- verification reference

Forbidden information:

- calculated risk
- weighted risk
- new risk class
- new diagnosis
- router priority

Relationships:

May be used later by public contract rendering as primary or secondary risk driver input.

Priority: `P0`

### Positive Indicator

Purpose:

Carries stabilizing or lower-concern source-contract signals without certifying absence of risk.

Mandatory information:

- source contract reference
- public source basis
- limitation statement

Optional information:

- supporting evidence reference
- low relevance field reference

Forbidden information:

- guarantee of no defect
- guarantee of safety
- inferred absence of risk from missing findings

Relationships:

Feeds public positive indicators.

Priority: `P1`

### Red Flag Item

Purpose:

Carries source-contract signals that may require later review-priority attention.

Mandatory information:

- source contract reference
- public triggering basis
- required follow-up or verification reference where present
- unresolved status

Optional information:

- severity-sensitive language reference if present in public contract
- specialist verification reference

Forbidden information:

- final diagnosis
- safety certification
- acquisition recommendation
- market valuation implication

Relationships:

Feeds public red flags and recommendations.

Priority: `P0`

### Recommendation Reference

Purpose:

Preserves recommendations and required verification without inventing new actions.

Mandatory information:

- source contract reference
- source field: required verification or recommended action
- recommendation text or public token

Optional information:

- relation to missing evidence
- relation to red flag item
- relation to hypothesis reference

Forbidden information:

- new recommendation not present in source contract
- legal, valuation, purchase, or safety conclusion

Relationships:

Feeds public recommendations.

Priority: `P1`

### Confidence Context

Purpose:

Transports confidence from source contracts without recalculation, averaging, or conversion into risk.

Mandatory information:

- source contract reference
- source confidence value or unknown confidence state
- confidence availability state

Optional information:

- confidence limitation reference
- source evidence count reference if exposed publicly

Forbidden information:

- recalculated confidence
- averaged confidence
- confidence-derived risk
- risk-derived confidence

Relationships:

Feeds public confidence interpretation and audit context.

Priority: `P0`

### Conflict Register

Purpose:

Preserves contradictions and tensions between source contracts without resolving them.

Mandatory information:

- source contract references involved
- conflict type
- affected internal objects
- unresolved status

Optional information:

- public limitation reference
- unknown item reference
- recommendation reference

Forbidden information:

- expert resolution not present in source contracts
- automatic winner selection
- averaging of confidence or risk signals

Relationships:

Feeds unknowns, missing evidence, red flags, recommendations, and audit context.

Priority: `P1`

### Audit Context

Purpose:

Preserves internal traceability from source contracts through internal transformation into public contract preparation.

Mandatory information:

- internal model version
- source contract references
- transformation step references
- evidence references
- missing evidence references
- confidence context references

Optional information:

- conceptual timestamp
- public contract version target

Forbidden information:

- persistence implementation details
- database schema
- raw provider internals

Relationships:

Referenced by all objects that contribute to the future public contract.

Priority: `P0`

## 7. Information Preservation Policy

The internal model applies four preservation categories.

### Preserve

Information that must remain available in the internal model:

- primary hypothesis
- alternative hypotheses
- supporting evidence
- missing evidence
- required verification
- potential consequences
- recommendations exposed in public hypotheses
- confidence source value or unknown confidence state
- public relevance fields where present
- hypothesis status where present
- guardrail and limitation statements
- source contract references
- internal model version

Priority: `P0`

### Normalize

Information that may be technically normalized without changing meaning:

- empty arrays and absent arrays into explicit empty states
- blank text into explicit missing state
- deterministic ordering of source contracts and internal references
- duplicate identical text entries into shared references
- known public fields into stable internal categories
- legacy fallback markers when inferable from public contract shape

Priority: `P1`

### Reference Only

Information that should be referenced but not copied into interpreted internal fields:

- full source contract payload
- public hypothesis text when only needed for audit
- public consequence text when not used as a signal
- public verification text when not used as recommendation input
- contract version when exposed externally later

Priority: `P1`

### Exclude

Information that must not enter the internal model:

- provider internals
- provider keywords
- router internals
- raw findings
- raw building data
- raw measurements
- images
- market data
- UI state
- report content
- database persistence details
- formulas
- weights

Priority: `P0`

## 8. Normalization Boundary

Allowed normalization:

- stable internal categories for object roles
- deterministic sorting
- stable reference formation
- deduplication of identical entries
- explicit empty states
- explicit unknown states
- explicit invalid source states
- separation of conflicting statements

Priority: `P1`

Forbidden normalization:

- fachliche Neuinterpretation
- new diagnoses
- new risk classes
- new priorities without source basis
- confidence recalculation
- confidence averaging
- confidence-to-risk conversion
- merging contradictory statements without conflict marking
- converting missing evidence into risk
- converting missing evidence into positive evidence

Priority: `P0`

## 9. Domain Independence

The internal model must remain provider- and domain-independent.

Architecture rules:

- unknown domain IDs must be accepted as unknown domain states when the source contract remains valid
- new domains must not require new core object types
- future domain metadata must be optional
- domain summaries must remain optional unless a future major public contract version changes this rule
- provider-specific special fields are forbidden in the core model
- public relevance fields may be referenced generically, not hard-coded by provider

Priority: `P0`

Extension principle:

New domain-specific knowledge belongs in Knowledge Providers and ExpertReasoningContracts. The Building Risk Score™ internal model consumes only public contract semantics.

Priority: `P0`

## 10. Conflict Handling

The internal model may identify and preserve conflicts. It must not resolve them professionally.

Examples of conflicts:

- one source contract exposes a positive indicator while another exposes a risk hypothesis for the same assessment context
- several domains refer to the same component group differently
- confidence values differ between source contracts
- one contract indicates missing evidence while another exposes supporting evidence for a related point
- one contract requires specialist verification while another appears routine

Allowed conflict behavior:

- make conflicts visible
- reference all involved source contracts
- preserve each statement separately
- create unknown items where interpretation is limited
- create recommendations only from source verification or recommended action fields

Forbidden conflict behavior:

- choose a professional winner
- average confidence values
- collapse conflict into a single conclusion
- reinterpret evidence to remove contradiction
- create a diagnosis that no source contract contains

Priority: `P0`

## 11. Unknown and Missing Evidence State Model

The following states must remain separate.

### Unknown

Meaning:

The internal model cannot support a reliable interpretation from available ExpertReasoningContracts.

Must not mean:

- low risk
- no defect
- system failure
- missing evidence only

Priority: `P0`

### Missing Evidence

Meaning:

A source contract identifies absent, incomplete, or contradicting evidence that limits interpretation.

Must not mean:

- automatic risk
- automatic unknown
- positive evidence

Priority: `P0`

### Not Applicable

Meaning:

A concept is outside the scope of a source contract or assessment context.

Must not mean:

- not assessed
- safe
- no risk

Priority: `P1`

### Not Assessed

Meaning:

The source contracts do not assess a topic.

Must not mean:

- no finding
- no risk
- positive indicator

Priority: `P1`

### Contradictory Evidence

Meaning:

Public contract elements conflict or point in different directions.

Must not mean:

- resolved conflict
- averaged truth
- final professional decision

Priority: `P0`

## 12. Confidence Context

Confidence remains independent from risk.

Internal rules:

- source confidence is transported unchanged
- missing confidence is represented as unknown confidence state
- multiple confidence values remain separate by source contract
- confidence must not be averaged
- confidence must not be recalculated
- confidence must not determine risk class
- low confidence must not be interpreted as low risk
- high confidence must not be interpreted as high risk
- red flag status must not be inferred from confidence alone

Priority: `P0`

The internal model may reference confidence as part of auditability and explanation reliability. It must not use confidence as a scoring input in this architecture phase.

Priority: `P1`

## 13. Review Priority vs. Risk vs. Confidence vs. Red Flag

Foundation 1.4 decision:

Review Priority, Risk Class, Confidence, and Red Flag Status are separate concepts.

Priority: `P0`

Definitions:

- Review Priority: future prioritization of professional review attention.
- Risk Class: future public risk interpretation category.
- Confidence: source or public interpretation reliability, not risk.
- Red Flag Status: structured attention marker based on source contract content.

Architecture rules:

- Review Priority must not be synonymous with Risk Class.
- Risk Class must not be synonymous with Confidence.
- Red Flag Status must not be synonymous with Risk Class.
- Confidence must not create Red Flag Status by itself.
- Red Flag Status must not certify technical danger.
- Review Priority must not become a purchase recommendation.

Priority: `P0`

No calculation logic is defined.

## 14. Auditability Requirements

The internal model must preserve enough origin information to make every later public contract item traceable.

Required provenance:

- source contract reference
- domain state or domain reference where available
- source contract version where available
- internal model version
- evidence references
- missing evidence references
- hypothesis references
- confidence context references
- transformation step reference
- conflict reference where applicable
- conceptual timestamp if later introduced

Priority: `P0`

Auditability must not require forbidden inputs such as raw data, provider internals, router internals, keyword lists, images, persistence records, or UI state.

Priority: `P0`

## 15. Determinism Invariants

Identical source ExpertReasoningContracts must produce an identical internal domain model.

Required invariants:

- source contracts use deterministic ordering
- internal references are formed deterministically
- duplicate identical entries are deduplicated deterministically
- conflicting entries are ordered deterministically and not collapsed
- empty arrays normalize to explicit empty states
- missing fields normalize to explicit missing or unknown states
- unknown domain IDs normalize to stable unknown domain states
- unsupported optional fields are ignored deterministically
- no runtime state changes output
- conceptual timestamps, if later introduced, must not affect domain interpretation

Priority: `P0`

## 16. Backward Compatibility

Older ExpertReasoningContract versions may be accepted when they expose the minimal stable contract basis.

Minimum acceptable basis:

- primary hypothesis or fallback hypothesis representation
- alternative hypotheses as available or explicit empty state
- supporting evidence as available or explicit empty state
- missing evidence as available or explicit empty state
- required verification as available or explicit empty state
- potential consequences as available or explicit empty state
- confidence value or unknown confidence state

Priority: `P0`

Additive extensions:

Unknown public fields may be ignored or preserved as reference-only extension material if they do not change mandatory interpretation.

Priority: `P1`

Deprecated fields:

Deprecated public fields may be preserved as source references but must not become mandatory internal model fields.

Priority: `P1`

Legacy fallbacks:

Legacy fallback contracts may be accepted as reduced-detail sources. They must not be upgraded into provider-native detail, and missing provider-level fields must not be invented.

Priority: `P0`

No migration implementation is defined.

## 17. Public Contract Boundary

The internal model may later supply the public Building Risk Score™ contract with:

- source contract references
- internal model version
- public contract version target
- primary risk driver inputs
- secondary risk driver inputs
- positive indicator inputs
- missing evidence inputs
- unknown inputs
- red flag inputs
- recommendation inputs
- confidence context inputs
- limitation inputs
- audit references
- conflict references where relevant

Priority: `P0`

Internal details that must never become public contract obligations:

- raw internal object storage shape
- provider-specific normalization decisions
- internal deduplication mechanics
- internal sort keys
- internal conflict detection mechanics
- transformation implementation details
- private extension handling
- any formula, weight, or score calculation placeholder
- router or provider internals

Priority: `P0`

The public contract describes the result. It must not expose internal transformation machinery as the product surface.

Priority: `P0`

## 18. Non-Scope Guardrails

The internal domain model must never:

- assess structural statics
- create new technical diagnoses
- derive market values
- create acquisition recommendations
- calculate CAPEX
- calculate RUL
- create safety guarantees
- calculate score values
- contain weightings
- replace expert review
- replace technical due diligence reports
- produce public reports
- define UI behavior
- define persistence behavior

Priority: `P0`

## 19. Prioritized Architecture Decisions

### P0 Decisions

- The internal model accepts only ExpertReasoningContracts.
- Foundation 1.4 adopts bounded Multi-Contract input per assessment context.
- The model sits between source contracts and public score contract rendering.
- It preserves information and references; it does not calculate risk.
- It transports confidence unchanged and separately from risk.
- It preserves conflicts without resolving them.
- It keeps Unknown, Missing Evidence, Not Applicable, Not Assessed, and Contradictory Evidence separate.
- It remains provider-independent and router-independent.
- It never uses raw data, provider internals, keywords, images, or router logic.
- It preserves auditability without requiring forbidden inputs.
- It preserves professional non-scope guardrails.

### P1 Decisions

- Exact source reference identity convention remains to be specified.
- Exact evidence reference identity convention remains to be specified.
- Exact internal model version naming remains to be specified.
- Exact contract completeness states remain to be specified.
- Exact conflict type taxonomy remains to be specified.
- Exact domain summary policy remains to be specified.

### P2 Decisions

- Optional domain metadata registration may be considered later.
- Optional extension registry may be considered later.
- Optional public display grouping may be considered later outside this internal model.

### INFO Decisions

- This document defines conceptual objects only.
- No field names are final.
- No JSON structure is defined.
- No implementation is defined.

## 20. Implementation Readiness Decision

Decision: only suitable after P1 decisions.

Rationale:

The internal domain model architecture is coherent and suitable as the conceptual foundation. Productive implementation should not begin until the P1 decisions for source references, evidence references, model version naming, completeness states, conflict taxonomy, and domain summary policy are resolved.

This is not a rejection of the architecture. It is a governance boundary before implementation.

## 21. Recommendation for Sprint I-2A

Sprint I-2A should resolve the P1 implementation-readiness decisions without implementing productive score logic.

Recommended Sprint I-2A scope:

- define source contract reference convention
- define evidence reference convention
- define internal model version convention
- define contract completeness states
- define conflict type taxonomy
- define domain summary policy
- define fixture examples for complete, incomplete, legacy, conflicting, and unknown source contracts

Sprint I-2A should not implement score calculations, scoring formulas, weightings, CAPEX, RUL, acquisition recommendations, APIs, JSON Schemas, database models, UI, reports, persistence, or productive Building Risk Score™ code.

## 22. Conclusion

The Building Risk Score™ internal domain model must be a preservation and preparation layer, not a calculation layer.

It must accept bounded sets of ExpertReasoningContracts, preserve all relevant contract-level information, keep conflicts visible, maintain confidence-risk separation, and prepare traceable internal objects for future public contract rendering.

Foundation 1.4 Sprint I-1D is complete as internal domain model architecture only.
