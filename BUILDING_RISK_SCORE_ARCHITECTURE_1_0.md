# Building Risk Score™ Architecture 1.0

## Foundation 1.4 / Sprint I-1A

This document defines the first architecture discovery for the Building Risk Score™ within the MEIFERTS Building Lifecycle System™.

It is an architecture paper only. It does not define productive code, mathematical formulas, weightings, scoring algorithms, UI reports, valuation logic, or implementation tasks.

## 1. Purpose

The Building Risk Score™ is intended to support expert decision intelligence for buildings by synthesizing already reasoned expert findings into a controlled risk-oriented view.

The future score should support questions such as:

- Which expert reasoning outputs indicate material building risk?
- Which findings require professional verification before a decision can be made?
- Which uncertainty or evidence gaps prevent reliable risk interpretation?
- Which domains contribute the strongest risk-relevant signals?
- Which positive or low-risk findings reduce concern within the documented evidence boundary?
- Which recommendations should be prioritized for expert follow-up?

The Building Risk Score™ must not make final professional decisions. It must not decide whether a building is safe, structurally adequate, marketable, insurable, purchase-worthy, or legally compliant.

The intended professional decision support is a risk-orientation layer. It informs expert review. It does not replace expert review.

## 2. Existing Expert Intelligence Architecture

The current Expert Intelligence architecture is deterministic and contract-driven.

The main reasoning flow is:

1. `KnowledgeDomainRouter.resolve(input)` inspects the available finding, building context, and measurements.
2. The router returns an ordered list of applicable domains according to `DOMAIN_PRECEDENCE`.
3. `ExpertReasoningEngine.analyze(input, options)` processes candidate domains sequentially.
4. The first domain that produces a successful reasoning contract wins.
5. No multi-domain aggregation is performed by the Expert Reasoning Engine.
6. If no provider produces a contract, the legacy fallback remains reachable.

Current domain providers include building fabric, structural, services, envelope, moisture, crack, concrete durability, basement, facade, roof, drainage, balconies, fire protection, vertical transportation, windows and doors, sanitary systems, electrical systems, and HVAC systems.

Most current providers expose deterministic provider knowledge in the form:

- `domain`
- `hypotheses`

Provider hypotheses typically contain:

- `id`
- `cause`
- `classification`
- `keywords`
- `supportingIndicators` or provider-native equivalent indicators
- `contradictingIndicators` or provider-native equivalent contradictions
- `requiredVerification`
- `potentialConsequences`
- `recommendedActions`
- `riskRelevance`
- `capexRelevance`
- `valuationRelevance`
- domain-specific relevance fields where applicable, such as `structuralRelevance`

The shared `KnowledgeReasoningMapper` maps provider knowledge into the stable public Expert Reasoning Contract for most newer providers.

## 3. Architecture Principles

### Evidence before Conclusion

The Building Risk Score™ must be derived only from expert reasoning outputs that expose evidence, missing evidence, verification needs, consequences, and confidence.

The score must not infer risk directly from raw inspection text when no expert reasoning contract has been produced.

### Explainability before Automation

The score must remain explainable before it becomes automated. Every later risk interpretation must be traceable to expert reasoning contract elements.

A risk-oriented result without traceable evidence, missing evidence, and recommended follow-up is invalid for this architecture.

### Confidence is not Risk

Confidence describes how well the available evidence supports the selected expert hypothesis.

Risk describes the potential relevance or consequence of the reasoned condition.

A high-confidence low-risk condition and a low-confidence high-risk condition are both valid outcomes. The architecture must never merge confidence and risk into the same concept.

### Unknown is a Valid Result

Unknown, insufficient evidence, incomplete verification, and missing information are valid architectural outcomes.

The Building Risk Score™ must be able to state that risk cannot be reliably interpreted from the available ExpertReasoningContracts.

### Determinism

The same ExpertReasoningContracts must produce the same Building Risk Score™ interpretation.

No external AI provider, randomization, time-dependent behavior, or hidden mutable state may be required for score interpretation.

### Auditability

Every future score result must be auditable back to the input ExpertReasoningContracts and their evidence elements.

Auditability requires stable inputs, stable output categories, retained uncertainty, and clear separation between source evidence and interpretation.

### Stable Public Contracts

The Building Risk Score™ must consume stable public contracts only.

It must not depend on private provider internals, router implementation details, domain keyword lists, or raw inspection payloads.

## 4. Input Layer

The Building Risk Score™ works exclusively on ExpertReasoningContracts.

It does not work directly on raw findings, raw building metadata, raw measurements, free text, router candidates, provider knowledge payloads, keyword matches, or provider-private hypothesis data.

### Allowed Inputs

Allowed inputs are one or more already produced ExpertReasoningContracts containing the stable public keys:

- `primaryHypothesis`
- `alternativeHypotheses`
- `supportingEvidence`
- `missingEvidence`
- `requiredVerification`
- `potentialConsequences`
- `confidence`

The score may use the public hypothesis payloads exposed through those contracts, including fields that are already present on mapped hypotheses, such as:

- `id`
- `label`
- `cause`
- `classification`
- `structuralRelevance` where present
- `supportingIndicators`
- `contradictingIndicators`
- `requiredVerification`
- `potentialConsequences`
- `recommendedActions`
- `riskRelevance`
- `capexRelevance`
- `valuationRelevance`
- `status`

### Forbidden Inputs

Forbidden inputs include:

- raw inspection findings
- raw building objects
- raw measurement arrays
- router domain candidates
- provider `keywords`
- provider-private scoring internals
- language adapter internals
- terminology registry internals
- UI state
- report text
- valuation data not already reasoned through an ExpertReasoningContract
- market-price data
- user preference data

This restriction protects the score from bypassing expert reasoning and prevents hidden inference from unvalidated raw text.

## 5. Information Already Reliably Available

The current architecture already provides reliable information for a later Building Risk Score™ at the ExpertReasoningContract boundary.

Available information includes:

- the selected primary expert hypothesis
- alternative hypotheses retained for uncertainty and competing explanations
- supporting evidence matched from the available input
- missing or contradicting evidence
- required verification steps
- potential consequences
- recommended actions where mapped from provider hypotheses
- qualitative relevance fields such as risk, capex, valuation, and structural relevance where present
- deterministic confidence as evidence support for the selected hypothesis
- stable hypothesis status for mapped provider outputs
- legacy fallback outputs for insufficiently mapped conditions

The score can safely consume these concepts because they are already normalized by the Expert Reasoning Engine and mapper layer.

The score cannot safely consume provider keyword lists, router precedence side effects, or raw observations because those are not public score inputs.

## 6. Explainability Requirements

The future Building Risk Score™ must explain its interpretation in professional terms.

It must be able to expose:

- most important risk drivers
- positive findings or low-concern findings
- uncertainties
- missing evidence
- red flags
- recommendations

### Risk Drivers

Risk drivers must be traceable to public contract elements such as primary hypothesis classification, risk relevance, structural relevance, potential consequences, and required verification.

### Positive Findings

Positive findings must be represented cautiously. The absence of a severe hypothesis is not proof of absence of risk.

Positive findings may include low-relevance classifications, stable evidence, low consequence language, or verification already pointing away from major concern.

### Uncertainties

Uncertainty must come from alternative hypotheses, missing evidence, contradicting indicators, low evidence support, or required verification that remains unresolved.

### Missing Evidence

Missing evidence must remain visible as a first-class explanation element. It must not be hidden by a numeric or categorical score output.

### Red Flags

Red flags must be conceptually based on public contract content such as structural relevance, high risk relevance, urgent verification language, severe consequence language, unresolved specialist review, or safety-sensitive domains.

No red flag may be treated as a final diagnosis.

### Recommendations

Recommendations must be derived from `requiredVerification` and `recommendedActions` already exposed by the reasoning contract.

The score must not invent professional recommendations outside the reasoned contract boundary.

## 7. Confidence Concept

Confidence is a measure of evidence support for the reasoned hypothesis. It is not a measure of risk.

Factors that conceptually increase confidence include:

- multiple supporting evidence elements
- specific matched indicators rather than generic wording
- consistent finding category, location, description, and observations
- relevant measurements or documented context
- limited contradiction from missing or opposing evidence
- provider output with stable hypothesis status
- agreement between primary hypothesis and exposed supporting evidence

Factors that conceptually decrease confidence include:

- sparse supporting evidence
- broad or generic finding descriptions
- missing verification data
- unresolved alternative hypotheses
- contradicting indicators
- reliance on legacy fallback reasoning
- unclear location or building context
- no measurements where measurements would normally be expected

Risk and confidence must never be coupled.

Examples of valid conceptual states include:

- high risk with low confidence because the potential consequence is serious but evidence is incomplete
- low risk with high confidence because evidence clearly supports a minor condition
- high risk with high confidence because evidence strongly supports a serious hypothesis
- unknown risk because the contract exposes insufficient evidence

## 8. Extensibility

The Building Risk Score™ must be provider-agnostic.

New Knowledge Providers must be integrable without changing the score architecture, provided their reasoning output reaches the stable ExpertReasoningContract boundary.

This means the score must depend on contract semantics, not domain-specific implementation details.

A future provider should become score-compatible when it exposes reasoned hypotheses through the existing engine and mapper pattern, including evidence, missing evidence, verification, consequences, recommendations, confidence, and qualitative relevance fields where appropriate.

The score must not require new switch statements for every provider domain. Domain-specific interpretation may be added as optional policy later, but the base architecture must operate on contract-level concepts.

## 9. Conceptual Public Contract

No API is defined in this document.

Conceptually, a future Building Risk Score™ result should expose:

- overall risk interpretation category
- key risk drivers
- positive or stabilizing findings
- uncertainty summary
- missing evidence summary
- red flag summary
- recommended next actions
- confidence interpretation
- source contract references
- audit trail metadata
- limitation statement

This conceptual contract must remain explainable, deterministic, and auditable.

It must not expose hidden calculations, provider internals, raw keyword matches, or unsupported professional conclusions.

## 10. Guardrails

The Building Risk Score™ must never:

- replace structural engineering assessment
- replace a professional building survey or technical due diligence report
- certify structural safety
- certify load-bearing capacity
- determine market value
- determine purchase price
- guarantee purchase suitability
- guarantee insurability
- guarantee code compliance
- guarantee absence of defects
- produce a final expert opinion without professional review
- convert uncertainty into certainty
- hide missing evidence behind a simplified output

The score is a decision intelligence layer, not a professional judgment substitute.

## 11. Test Strategy

Sprint I-1B should define architecture tests before implementation.

The test strategy should focus on contract behavior, not scoring mathematics.

Required architecture tests should include:

- accepts only ExpertReasoningContracts as valid input
- rejects raw finding, building, measurement, provider, router, and UI inputs
- preserves stable public contract dependency
- produces deterministic output for identical contract input
- preserves unknown as a valid result
- keeps confidence separate from risk interpretation
- exposes missing evidence explicitly
- exposes required verification explicitly
- exposes red flags without diagnosis
- preserves audit references to source contracts
- remains provider-agnostic when a new domain provider is added
- does not require changes to existing Knowledge Providers
- does not modify ExpertReasoningEngine behavior
- does not modify KnowledgeReasoningMapper behavior
- does not introduce multi-domain aggregation into ExpertReasoningEngine
- does not expose forbidden public claims such as safety guarantees, valuation, or purchase recommendation

No implementation tests, formulas, weights, or scoring algorithms are defined in this architecture paper.

## 12. Open Architecture Decisions

The following decisions remain intentionally open for Sprint I-1B:

- exact future public contract shape
- naming of risk interpretation categories
- whether score input accepts a single contract or a bounded set of contracts
- source reference format for auditability
- representation of positive findings
- representation of red flags
- handling of legacy fallback contracts
- policy for domains that do not expose all qualitative relevance fields
- distinction between user-facing summary and internal audit trail
- persistence boundary for score results

These decisions should be resolved before any productive Building Risk Score™ code is implemented.

## 13. Architecture Recommendation for Sprint I-1B

Sprint I-1B should remain architecture-first.

Recommended next step:

Define the conceptual Building Risk Score™ public contract and architecture test matrix without implementing scoring logic.

Sprint I-1B should not introduce formulas, weights, scoring algorithms, reports, valuation logic, or UI. It should define the contract boundary, validation rules, forbidden inputs, explainability obligations, and guardrail tests.

## 14. Conclusion

The existing Foundation 1.3 Expert Intelligence architecture is suitable as the input foundation for a future Building Risk Score™.

The reliable boundary is the ExpertReasoningContract, not raw inspection data and not provider internals.

The Building Risk Score™ should be designed as a deterministic, explainable, auditable interpretation layer over existing expert reasoning outputs.

Foundation 1.4 Sprint I-1A should therefore close with architecture discovery only. Productive implementation should wait until Sprint I-1B defines the future public contract and architecture tests.
