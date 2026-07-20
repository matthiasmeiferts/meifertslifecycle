# Building Risk Score™ Internal Model Readiness Decisions 1.0

## Foundation 1.4 / Sprint I-2A

This document resolves the P1 readiness decisions for the future Building Risk Score™ internal domain model.

It is an architecture decision paper only. It does not define implementation, executable tests, scoring logic, formulas, weightings, APIs, JSON Schemas, database models, persistence, UI, reports, or productive Building Risk Score™ code.

## 1. Decision Scope

The decisions in this document apply to the internal domain model that sits between:

- incoming `ExpertReasoningContracts`
- the future Building Risk Score™ Public Contract

The internal model remains a preservation and preparation layer. It does not calculate risk, calculate confidence, average confidence, produce final professional judgments, or resolve technical conflicts.

Priority: `P0`

## 2. Source Contract Reference Convention

Decision: `ACCEPTED`

Priority: `P0`

### Purpose

A Source Contract Reference uniquely identifies each incoming `ExpertReasoningContract` within one assessment context.

It exists to support auditability, deterministic internal referencing, conflict registration, and later public traceability without requiring provider internals or personal data.

### Pflichtbestandteile

A Source Contract Reference must contain conceptually:

- assessment-local source position
- stable source reference value
- source contract completeness state
- source contract version state
- source origin state: provided, derived, or legacy-derived

These are conceptual components only. No final technical ID implementation is defined.

### Erlaubte Herkunft

The reference may be:

- übernommen from an existing public source identifier if such an identifier is available in the input boundary
- deterministically derived from assessment-local ordering when no external source reference exists
- deterministically assigned as a legacy-derived reference for acceptable legacy fallback contracts

Allowed source material is limited to public `ExpertReasoningContract` information and assessment-local ordering.

### Verbotene Inhalte

A Source Contract Reference must not contain:

- provider class names
- router candidate order
- provider keywords
- raw finding text
- raw building data
- raw measurements
- image filenames
- names of persons
- email addresses
- client identifiers not already approved as public assessment references
- market data
- scoring interpretation
- risk classification

### Stabilitätsanforderungen

The same ordered set of source contracts in the same assessment context must produce the same source references.

When an external source reference is available, it should be preserved as the preferred audit anchor.

When no external source reference exists, an assessment-local deterministic reference is sufficient and must not imply factual content.

### Verhalten bei fehlender externer Referenz

Missing external references do not make a contract invalid.

The internal model must create a deterministic assessment-local reference and mark the reference origin as derived.

For legacy contracts, the internal model must create a deterministic reference and mark the reference origin as legacy-derived where inferable.

## 3. Evidence Reference Convention

Decision: `ACCEPTED`

Priority: `P0`

### Referenzgrenze

An Evidence Reference identifies a single public evidence element within one source `ExpertReasoningContract`.

Evidence elements may come from public contract areas such as:

- `supportingEvidence`
- `missingEvidence`
- hypothesis-level supporting indicators where exposed publicly
- hypothesis-level contradicting indicators where exposed publicly
- `requiredVerification`
- `potentialConsequences`
- public `recommendedActions` where exposed

Evidence Reference does not identify raw evidence outside the `ExpertReasoningContract` boundary.

### Beziehung zum Source Contract

Every Evidence Reference must point to exactly one Source Contract Reference.

Evidence references must be unique within their source contract.

The same evidence text appearing in two different source contracts receives two distinct source-bound references.

### Stabilität

Evidence references must be deterministic for identical source contract content.

Stable ordering must be based on source contract section, source position within that section, and deterministic duplicate handling.

No image filename, provider class, keyword, or router path may be used as the reference basis.

### Verhalten bei Duplikaten

Duplicate evidence entries inside the same source contract may be deduplicated for internal processing only when they are textually identical and section-equivalent.

Deduplication must preserve all original positions as audit aliases or duplicate references.

Duplicate entries across different source contracts must not be collapsed into one evidence reference.

### Verhalten bei fehlenden IDs

Missing external evidence IDs are expected and acceptable.

The internal model must create deterministic assessment-local evidence references from public contract section and position.

Missing evidence IDs must not cause invalid contract state.

### Umgang mit Evidence-Gruppen

Evidence groups are optional.

When grouping is used, it may group evidence by public contract section or internal object role. Grouping must not reinterpret evidence meaning and must not create new professional conclusions.

## 4. Internal Model Version Convention

Decision: `ACCEPTED`

Priority: `P0`

### Versionierungsgrundsatz

The internal domain model has its own version independent from:

- ExpertReasoningContract versions
- Building Risk Score™ Public Contract versions
- provider versions
- application release versions

The initial internal model version is conceptually `brs-internal-model-1.0`.

This is a naming convention decision, not an implementation constant.

### Major/Minor-Prinzip

The internal model uses a major/minor convention.

Major version changes are required for breaking architectural changes.

Minor version changes are allowed for additive, backward-compatible model extensions.

Patch-level or build metadata is not required for the architecture decision.

### Additive Änderungen

Additive changes may include:

- new optional internal object metadata
- new optional audit annotations
- new optional conflict descriptors
- new optional domain metadata
- new optional extension areas

Additive changes must not alter the meaning of existing mandatory concepts.

### Breaking Changes

Breaking changes include:

- removing core internal object categories
- changing source reference semantics
- changing evidence reference semantics
- merging Unknown and Missing Evidence
- coupling confidence to risk
- making Domain Summary mandatory without a major version decision
- introducing provider-specific mandatory fields
- exposing raw data as required model input

### Unbekannte Felder

Unknown fields in future source contracts or internal extensions may be ignored or preserved as reference-only extension material if they do not change mandatory meaning.

Unknown fields must not create hidden risk interpretation.

### Legacy-Lesbarkeit

Older ExpertReasoningContracts remain acceptable when they satisfy the minimum contract basis defined by the internal domain model.

Legacy contracts must be marked through completeness and version state, not upgraded silently.

### Beziehung zu ExpertReasoningContract-Versionen

ExpertReasoningContract version state is source metadata.

The internal model must preserve it where available, but it does not inherit that version as its own model version.

### Beziehung zum Public Contract

The future Building Risk Score™ Public Contract version is an output target.

The internal model may reference a public contract target version but must not be versioned by it.

## 5. Contract Completeness States

Decision: `ACCEPTED`

Priority: `P0`

Foundation 1.4 uses the following completeness states:

- `COMPLETE`
- `INCOMPLETE`
- `LEGACY`
- `UNKNOWN_COMPLETENESS`
- `INVALID`
- `NOT_ASSESSED`

The originally proposed `UNKNOWN` state is renamed to `UNKNOWN_COMPLETENESS` to prevent confusion with public Unknown outcomes.

### COMPLETE

Meaning:

The source contract exposes the minimum stable ExpertReasoningContract basis and has no required contract-area absence that limits internal preparation.

Entry condition:

The contract includes usable public structures for hypothesis, alternatives, supporting evidence, missing evidence, required verification, potential consequences, and confidence or explicit confidence state.

Allowed processing:

Full internal preparation and referencing.

Audit impact:

Marked as complete source material.

Boundary to Missing Evidence:

A COMPLETE contract may still contain missing evidence as domain content.

Boundary to Unknown:

A COMPLETE contract may still support an Unknown interpretation later.

Boundary to Not Applicable:

Completeness does not mean every possible domain is applicable.

### INCOMPLETE

Meaning:

The source contract is structurally usable but lacks one or more expected public areas or optional public details needed for full preparation.

Entry condition:

The contract satisfies the minimum basis but has absent or incomplete expected public sections.

Allowed processing:

Partial internal preparation with explicit missing contract-area markers.

Audit impact:

Consumers must see that the source was incomplete.

Boundary to Missing Evidence:

Incomplete means contract-shape or contract-content absence. Missing Evidence means the source contract itself identifies evidence gaps.

Boundary to Unknown:

Incomplete may contribute to Unknown, but it is not itself Unknown.

Boundary to Not Applicable:

Incomplete means expected contract information is absent. Not Applicable means the topic is outside the assessed scope.

### LEGACY

Meaning:

The contract is older or fallback-derived but still acceptable because it exposes the minimum stable contract basis.

Entry condition:

A legacy or fallback output exposes usable ExpertReasoningContract keys but lacks current provider-native richness, version metadata, or optional relevance fields.

Allowed processing:

Reduced-detail preparation with legacy marker.

Audit impact:

Audit must identify it as legacy or fallback-derived where inferable.

Boundary to Missing Evidence:

Legacy absence of modern fields is not automatically Missing Evidence.

Boundary to Unknown:

Legacy is not automatically Unknown.

Boundary to Not Applicable:

Legacy does not imply that unavailable domains were not applicable.

### UNKNOWN_COMPLETENESS

Meaning:

The internal model cannot determine whether the contract is complete, incomplete, or legacy from available public information, but the input is not clearly invalid.

Entry condition:

The contract appears structurally plausible but lacks enough metadata or shape clarity to classify completeness confidently.

Allowed processing:

Conservative reference preservation only, with unknown completeness marker.

Audit impact:

Audit must disclose unknown completeness.

Boundary to Missing Evidence:

Unknown completeness is metadata uncertainty, not evidence absence.

Boundary to Unknown:

Unknown completeness is not a public Unknown risk outcome.

Boundary to Not Applicable:

Unknown completeness does not mean a domain or topic is not applicable.

### INVALID

Meaning:

The input does not satisfy the minimum ExpertReasoningContract basis or is a forbidden input type.

Entry condition:

The input is raw data, provider internals, router data, images, keywords, or lacks the minimum public contract boundary.

Allowed processing:

No risk signal, positive indicator, red flag, recommendation, or confidence context may be created.

Audit impact:

Invalid input may be recorded as rejected source material if architecture later allows invalid-source auditing.

Boundary to Missing Evidence:

Invalid input is not Missing Evidence.

Boundary to Unknown:

Invalid is not Unknown.

Boundary to Not Applicable:

Invalid means the source is not acceptable; it does not describe assessment scope.

### NOT_ASSESSED

Meaning:

A topic, domain, or expected area was not assessed by the available source contracts.

Entry condition:

The source contract set contains no public contract material for a topic or domain area under review.

Allowed processing:

May create internal not-assessed state or unknown item depending on future public contract policy.

Audit impact:

Audit must distinguish not assessed from no risk.

Boundary to Missing Evidence:

Not Assessed means no contract assessment exists. Missing Evidence means a contract identifies evidence gaps.

Boundary to Unknown:

Not Assessed may lead to Unknown but is not identical to Unknown.

Boundary to Not Applicable:

Not Assessed means not evaluated. Not Applicable means outside scope.

## 6. Conflict Type Taxonomy

Decision: `ACCEPTED`

Priority: `P0`

Foundation 1.4 confirms the following minimal provider-independent conflict types:

- `POSITIVE_VS_RISK`
- `EVIDENCE_CONTRADICTION`
- `DOMAIN_OVERLAP`
- `CONFIDENCE_DIVERGENCE`
- `RECOMMENDATION_DIVERGENCE`
- `STATUS_CONFLICT`
- `VERSION_CONFLICT`

All confirmed conflict types are preservation and audit categories only. They do not resolve conflicts.

### POSITIVE_VS_RISK

Meaning:

One source contract contains a positive or stabilizing signal while another source contract contains a risk-relevant signal for a related assessment area.

Minimum condition:

At least two source contracts or distinguishable source statements are involved.

Boundary:

This is not proof that one statement is wrong.

Allowed reaction:

Preserve both statements, create conflict reference, and link relevant source contracts.

Forbidden automatic resolution:

Do not choose the positive or risk statement as winner.

### EVIDENCE_CONTRADICTION

Meaning:

Public evidence, missing evidence, or contradicting indicators point in incompatible directions.

Minimum condition:

At least two distinguishable public contract statements conflict or limit each other.

Boundary:

This is not a technical diagnosis.

Allowed reaction:

Preserve both statements and mark the conflict as unresolved.

Forbidden automatic resolution:

Do not reinterpret evidence to remove contradiction.

### DOMAIN_OVERLAP

Meaning:

Several source contracts or domains refer to the same component group, building area, or issue context from different domain perspectives.

Minimum condition:

At least two source contracts are related by public domain, hypothesis, evidence, consequence, or recommendation content.

Boundary:

Overlap is not necessarily contradiction.

Allowed reaction:

Preserve relationship and cross-references.

Forbidden automatic resolution:

Do not merge domains into one domain and do not select a governing provider.

### CONFIDENCE_DIVERGENCE

Meaning:

Confidence values or confidence availability states differ across related source contracts.

Minimum condition:

At least two related source contracts expose distinct confidence values or states.

Boundary:

Different confidence does not mean different risk.

Allowed reaction:

Keep confidence contexts separate and register divergence.

Forbidden automatic resolution:

Do not average confidence and do not convert confidence divergence into risk.

### RECOMMENDATION_DIVERGENCE

Meaning:

Source contracts expose different required verification or recommended actions for a related issue context.

Minimum condition:

At least two recommendations or verification requirements differ materially within a related assessment area.

Boundary:

Different recommendations do not imply one recommendation is invalid.

Allowed reaction:

Preserve each recommendation with source references.

Forbidden automatic resolution:

Do not create a new combined recommendation unless it is explicitly source-preserving and non-generative in a later architecture decision.

### STATUS_CONFLICT

Meaning:

Public hypothesis status or completeness state differs across related source contracts in a way that affects interpretation readiness.

Minimum condition:

At least two related source statements have materially different status or completeness state.

Boundary:

Status conflict is not a risk classification.

Allowed reaction:

Preserve statuses and expose audit limitation.

Forbidden automatic resolution:

Do not upgrade lower-detail sources to higher-detail status.

### VERSION_CONFLICT

Meaning:

Related source contracts use different contract versions or unknown version states that may affect interpretation compatibility.

Minimum condition:

At least two related source contracts have different known versions or known/unknown version mismatch.

Boundary:

Version conflict is compatibility information, not technical risk.

Allowed reaction:

Preserve version states and mark compatibility limitation.

Forbidden automatic resolution:

Do not migrate, reinterpret, or normalize semantics silently.

### Later-Only Conflict Types

Deferred conflict types:

- portfolio-level conflict
- temporal trend conflict
- user-review override conflict
- external-report conflict

Decision: `DEFERRED`

Reason:

These require persistence, timeline, user review workflow, or report integration decisions that are outside Foundation 1.4 I-2A.

Impact on implementation readiness:

No blocker for internal model implementation.

### Rejected Conflict Types

Rejected conflict types:

- provider-priority conflict
- keyword conflict
- router-precedence conflict

Decision: `REJECTED`

Reason:

The Building Risk Score™ internal model must not know provider internals, keywords, or router logic.

Impact on implementation readiness:

No blocker.

## 7. Domain Summary Policy

Decision: `ACCEPTED`

Policy: `OPTIONAL`

Priority: `P1`

### Bewertung

Explainability:

Optional domain summaries may improve navigation across multiple contracts, but they must never replace individual source references.

Auditability:

Domain summaries are acceptable only when every statement remains traceable to source contracts.

Informationsverlust:

Mandatory summaries risk hiding individual evidence and conflicts. Therefore summaries are not mandatory.

Provider Independence:

Domain summaries must be based on public contract semantics, not provider internals.

Backward Compatibility:

Contracts without domain summaries remain valid.

Multi-Contract Input:

Optional summaries help organize multiple contracts but must not collapse conflicting statements.

Unknown Domains:

Unknown domains may receive an unknown-domain summary state but must not force a new domain model field.

Legacy Contracts:

Legacy contracts may contribute to summaries only through public contract content and must remain marked as legacy where inferable.

### Zweck

A Domain Summary may provide non-generative grouping of source contract material by known, unknown, or unavailable domain state.

### Zulässige Inhalte

Allowed content:

- source contract references
- count of source contracts by domain state
- referenced hypothesis groups
- referenced evidence groups
- referenced missing evidence groups
- referenced recommendations
- explicit unknown-domain state
- explicit legacy contribution marker

### Verbotene Neuinterpretationen

Domain summaries must not contain:

- generated professional summaries
- new diagnoses
- new risk classes
- new priorities
- provider-specific fields
- router precedence
- keyword interpretation
- confidence aggregation
- hidden conflict resolution

### Verhalten bei fehlender Summary

Missing Domain Summary does not make a source contract invalid and does not block internal model validity.

### Verhältnis zu Einzelbefunden

Individual source contract references and evidence references remain authoritative. Domain Summary is only a navigational and organizational layer.

## 8. Fixture Principles

Decision: `ACCEPTED`

Priority: `P1`

No executable test data or JSON examples are defined.

### Complete Contract Fixture

Purpose:

Represents a current, fully usable ExpertReasoningContract.

Necessary characteristics:

- primary hypothesis present
- alternative hypotheses present or explicitly empty
- supporting evidence present or explicitly empty
- missing evidence present or explicitly empty
- required verification present or explicitly empty
- potential consequences present or explicitly empty
- confidence present or explicit confidence state
- optional relevance and recommendation fields may be present

Expected architecture reaction:

Classify as `COMPLETE`, create source references, evidence references, confidence context, and audit context.

Forbidden interpretation:

Do not calculate risk or change confidence.

### Incomplete Contract Fixture

Purpose:

Represents a structurally usable but incomplete source contract.

Necessary characteristics:

- minimum contract basis exists
- one or more expected public sections are missing, blank, or partial
- source is not a forbidden raw input

Expected architecture reaction:

Classify as `INCOMPLETE`, preserve usable content, mark missing contract areas.

Forbidden interpretation:

Do not treat incomplete as low risk, high risk, invalid, or public Unknown automatically.

### Legacy Contract Fixture

Purpose:

Represents an older or fallback-derived contract that remains acceptable.

Necessary characteristics:

- stable ExpertReasoningContract boundary exists
- modern optional fields may be absent
- version may be absent or older
- provider-native richness may be unavailable

Expected architecture reaction:

Classify as `LEGACY`, preserve reduced-detail source content, mark legacy state.

Forbidden interpretation:

Do not invent modern provider fields or mark legacy automatically as incomplete.

### Conflicting Contracts Fixture

Purpose:

Represents at least two source contracts with visible tension.

Necessary characteristics:

- two or more distinguishable source contracts or statements
- conflict fits one confirmed conflict type
- all source statements remain independently referenceable

Expected architecture reaction:

Create conflict reference, preserve all involved statements, avoid automatic resolution.

Forbidden interpretation:

Do not choose a winner, average confidence, merge contradictory statements, or generate a new diagnosis.

### Unknown Contract Outcome Fixture

Purpose:

Represents a source contract or source set that supports an unknown outcome.

Necessary characteristics:

- acceptable ExpertReasoningContract source exists
- public contract content does not support a confirmed interpretation
- missing evidence, incomplete source material, or unresolved conflict explains the unknown state

Expected architecture reaction:

Preserve unknown state separately from invalid and missing evidence.

Forbidden interpretation:

Do not coerce unknown into P2, INFO, low risk, or invalid.

## 9. Readiness Invariants

Decision: `ACCEPTED`

Priority: `P0`

The following invariants are binding:

- every Evidence Reference points to exactly one Source Contract Reference
- every Conflict Reference points to at least two distinguishable statements or sources
- completeness state changes neither risk nor confidence
- Unknown is not Invalid
- Legacy is not automatically Incomplete
- missing Domain Summary does not invalidate a contract because Domain Summary is optional
- identical input produces identical references and states
- unknown domains remain processable when source contracts are valid
- provider-specific fields are not required by the internal model
- raw data cannot be used to repair an incomplete contract
- confidence values remain source-bound and are not averaged
- missing external source references do not invalidate a contract
- missing external evidence IDs do not invalidate a contract
- conflicts remain unresolved unless later professional workflow provides explicit source material

## 10. Decision Protocol

### Source Contract Reference Convention

Decision: `ACCEPTED`

Implementation impact:

Ready for internal model implementation.

### Evidence Reference Convention

Decision: `ACCEPTED`

Implementation impact:

Ready for internal model implementation.

### Internal Model Version Convention

Decision: `ACCEPTED`

Implementation impact:

Ready for internal model implementation.

### Contract Completeness States

Decision: `ACCEPTED`

Confirmed states:

- `COMPLETE`
- `INCOMPLETE`
- `LEGACY`
- `UNKNOWN_COMPLETENESS`
- `INVALID`
- `NOT_ASSESSED`

Implementation impact:

Ready for internal model implementation.

### Conflict Type Taxonomy

Decision: `ACCEPTED`

Confirmed Foundation 1.4 conflict types:

- `POSITIVE_VS_RISK`
- `EVIDENCE_CONTRADICTION`
- `DOMAIN_OVERLAP`
- `CONFIDENCE_DIVERGENCE`
- `RECOMMENDATION_DIVERGENCE`
- `STATUS_CONFLICT`
- `VERSION_CONFLICT`

Deferred later-only conflict types:

- portfolio-level conflict
- temporal trend conflict
- user-review override conflict
- external-report conflict

Rejected conflict types:

- provider-priority conflict
- keyword conflict
- router-precedence conflict

Implementation impact:

Ready for internal model implementation.

### Domain Summary Policy

Decision: `ACCEPTED`

Policy: `OPTIONAL`

Implementation impact:

Ready for internal model implementation.

### Fixture Principles

Decision: `ACCEPTED`

Implementation impact:

Ready for architecture-test specification in a later sprint.

## 11. Implementation Readiness

Decision: `READY FOR INTERNAL MODEL IMPLEMENTATION`

Priority: `P0`

Rationale:

All six previously open P1 readiness decisions have been resolved as accepted architecture decisions. Deferred later-only conflict types do not block Foundation 1.4 internal model implementation because they depend on future persistence, timeline, user review, or report integration scopes.

Remaining non-blocking follow-up:

- translate accepted architecture decisions into implementation tasks
- define executable architecture tests later
- preserve no-score, no-formula, no-weighting boundaries during implementation

## 12. Non-Scope Confirmation

This readiness decision does not approve:

- scoring logic
- scoring formulas
- weightings
- CAPEX
- RUL
- market valuation
- acquisition recommendation
- APIs
- JSON Schemas
- database models
- persistence
- UI
- reports
- productive public score output

Priority: `P0`

## 13. Recommendation for Next Sprint

The next sprint should begin the internal model implementation slice only if it remains limited to:

- source contract references
- evidence references
- internal model version marker
- completeness state representation
- conflict type representation
- optional domain summary representation
- deterministic preservation and audit references

The next sprint must not implement scoring, risk calculation, confidence calculation, formulas, weightings, CAPEX, RUL, public reports, APIs, persistence, database models, UI, or acquisition recommendations.

## 14. Conclusion

Foundation 1.4 Sprint I-2A resolves the internal model readiness decisions.

The internal model is now architecturally ready for implementation, with strict boundaries: preserve and prepare ExpertReasoningContracts, maintain auditability and determinism, keep conflicts visible, and avoid all score calculation or professional-decision behavior.
