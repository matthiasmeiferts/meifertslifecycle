# Building Risk Score™ Architecture Test Matrix 1.0

## Foundation 1.4 / Sprint I-1C

This document defines the architecture test matrix for the future Building Risk Score™.

It defines what must be permanently guaranteed by future architecture tests. It does not define how tests are implemented.

This document does not introduce productive code, executable tests, JSON Schemas, APIs, formulas, weightings, calculations, reports, UI, persistence, or database models.

## 1. Test Matrix Scope

The Building Risk Score™ must remain a deterministic, explainable, auditable, provider-independent interpretation layer over ExpertReasoningContracts.

The architecture tests must protect the public contract and the architectural boundaries defined in:

- `BUILDING_RISK_SCORE_ARCHITECTURE_1_0.md`
- `BUILDING_RISK_SCORE_PUBLIC_CONTRACT_1_0.md`

The tests must validate architectural guarantees only. They must not validate numeric score calculations, weighting behavior, market valuation, CAPEX, remaining useful life, dashboards, reports, persistence, APIs, or UI.

## 2. Priority Classification

Architecture rules are classified as:

- `P0`: Contract or guardrail violation that invalidates the Building Risk Score™ architecture.
- `P1`: High-priority architecture degradation that may compromise explainability, auditability, or professional use.
- `P2`: Medium-priority compatibility or extension concern.
- `INFO`: Documentation, traceability, or interpretive clarity requirement.

Only confirmed architecture rules may be classified as `P0`, `P1`, `P2`, or `INFO`.

## 3. Contract Stability

### BRS-CT-001 Mandatory Public Contract Fields Remain Stable

Priority: `P0`

Guarantee:

Every future Building Risk Score™ result must continue to expose the mandatory public contract areas:

- contract identity
- overall result
- explainability
- confidence
- source traceability
- limitations

Breaking any mandatory public contract area is forbidden.

### BRS-CT-002 Mandatory Explainability Sections Remain Stable

Priority: `P0`

Guarantee:

The public explainability structure must always include:

- primary risk drivers
- secondary risk drivers
- positive indicators
- missing evidence
- unknowns
- red flags
- recommendations

Each section may be empty, but the section must exist.

### BRS-CT-003 Classification Vocabulary Remains Controlled

Priority: `P0`

Guarantee:

Confirmed public points may only use the approved classification vocabulary:

- `P0`
- `P1`
- `P2`
- `INFO`

`UNKNOWN` must remain available for insufficient evidence and must not be treated as a confirmed priority.

### BRS-CT-004 Optional Extensions Must Be Additive

Priority: `P1`

Guarantee:

Optional contract extensions may be added only when they do not alter the meaning of mandatory fields and can be ignored safely by existing consumers.

### BRS-CT-005 Breaking Changes Are Forbidden Without Version Boundary

Priority: `P0`

Guarantee:

The following are forbidden within the same major contract version:

- removing mandatory fields
- renaming mandatory fields
- changing mandatory field semantics
- changing classification meaning
- making optional fields mandatory
- changing `UNKNOWN` semantics
- coupling confidence to risk

## 4. Provider Independence

### BRS-PI-001 New Providers Do Not Change the Score Contract

Priority: `P0`

Guarantee:

Adding a new Knowledge Provider must not require any change to the Building Risk Score™ public contract.

### BRS-PI-002 Provider Internals Do Not Leak Into the Contract

Priority: `P0`

Guarantee:

Provider-private details must never appear as required Building Risk Score™ contract elements.

Forbidden dependencies include:

- provider keyword lists
- provider ranking internals
- provider private scoring details
- provider-specific object shapes outside the ExpertReasoningContract boundary

### BRS-PI-003 Router Changes Do Not Change the Contract

Priority: `P0`

Guarantee:

Changes to domain routing, router precedence, or router candidate lists must not alter the Building Risk Score™ public contract shape.

### BRS-PI-004 Provider Output Variation Is Handled Through Public Contracts

Priority: `P1`

Guarantee:

When providers expose different optional hypothesis fields, the Building Risk Score™ must remain valid as long as the source input is an ExpertReasoningContract.

Absence of optional provider-derived fields must not break the public score contract.

## 5. Input Validation

### BRS-IV-001 Only ExpertReasoningContracts Are Accepted

Priority: `P0`

Guarantee:

The Building Risk Score™ must accept only ExpertReasoningContracts as source inputs.

### BRS-IV-002 Raw Data Inputs Are Forbidden

Priority: `P0`

Guarantee:

The Building Risk Score™ must not accept or interpret:

- images
- keywords
- raw findings
- raw building data
- raw measurements
- router information
- provider-internal objects
- UI state
- report text
- market data

### BRS-IV-003 Forbidden Inputs Cannot Be Used as Fallbacks

Priority: `P0`

Guarantee:

If ExpertReasoningContracts are insufficient, the Building Risk Score™ must not bypass the contract boundary by falling back to raw data, provider internals, router details, keywords, or images.

### BRS-IV-004 Invalid Input Produces No Hidden Interpretation

Priority: `P1`

Guarantee:

Invalid or forbidden input must not produce an apparently valid risk interpretation.

## 6. Confidence Separation

### BRS-CS-001 Confidence Never Replaces Risk

Priority: `P0`

Guarantee:

Confidence must never be used as the risk classification, risk class, review priority, red flag classification, or risk driver classification.

### BRS-CS-002 Confidence Never Alters Risk Meaning

Priority: `P0`

Guarantee:

Changing confidence interpretation must not change the semantic meaning of `P0`, `P1`, `P2`, `INFO`, or `UNKNOWN`.

### BRS-CS-003 Risk Never Calculates Confidence

Priority: `P0`

Guarantee:

Risk classification must not be treated as confidence and must not imply evidence reliability.

### BRS-CS-004 Confidence Remains Explainable but Non-Formulaic

Priority: `P1`

Guarantee:

The public confidence contract must expose interpretation reliability, basis, and limitations without exposing or requiring formulas, weights, coefficients, or hidden calculations.

## 7. Explainability

### BRS-EX-001 Every Result Remains Explainable

Priority: `P0`

Guarantee:

Every Building Risk Score™ result must expose explainability sections sufficient to understand why the result exists within the public contract boundary.

### BRS-EX-002 Primary Risk Drivers Are Traceable

Priority: `P0`

Guarantee:

Primary risk drivers must trace back to public ExpertReasoningContract elements.

They must not derive from provider keywords, router order, raw findings, images, or private scoring details.

### BRS-EX-003 Secondary Risk Drivers Are Traceable

Priority: `P1`

Guarantee:

Secondary risk drivers must be explainable through public contract evidence, alternative hypotheses, required verification, missing evidence, or potential consequences.

### BRS-EX-004 Positive Indicators Are Bounded

Priority: `P1`

Guarantee:

Positive indicators must be represented as bounded evidence-based points and must never certify that no risk or defect exists.

### BRS-EX-005 Missing Evidence Is Visible

Priority: `P0`

Guarantee:

Missing evidence must remain visible as an explainability section and must not be hidden in confidence text or summary wording.

### BRS-EX-006 Unknown Is Visible

Priority: `P0`

Guarantee:

Unknowns must be represented explicitly whenever the available ExpertReasoningContracts do not support a confirmed interpretation.

### BRS-EX-007 Red Flags Are Review Signals Only

Priority: `P0`

Guarantee:

Red flags must be represented as review-priority signals, not as final diagnoses, safety certifications, valuations, or acquisition recommendations.

### BRS-EX-008 Recommendations Stay Within Contract Boundary

Priority: `P1`

Guarantee:

Recommendations must derive from public ExpertReasoningContract fields such as required verification, recommended actions, missing evidence, red flags, or limitations.

They must not invent unsupported professional instructions.

## 8. Unknown Handling

### BRS-UH-001 Unknown Is a Valid Result

Priority: `P0`

Guarantee:

`UNKNOWN` must be accepted as a valid Building Risk Score™ result when the source ExpertReasoningContracts do not support a confirmed P0, P1, P2, or INFO interpretation.

### BRS-UH-002 Unknown Is Not Failure

Priority: `P0`

Guarantee:

Unknown must not be treated as system failure, low risk, or informational success.

### BRS-UH-003 Unknown Must Not Be Coerced

Priority: `P0`

Guarantee:

Unknown must not be coerced into P2 or INFO merely to produce a complete-looking result.

### BRS-UH-004 Unknown Carries Explanation

Priority: `P1`

Guarantee:

Unknown results must expose missing evidence, limitations, source contract references, and confidence interpretation.

## 9. Missing Evidence

### BRS-ME-001 Missing Evidence Does Not Automatically Create Risk

Priority: `P0`

Guarantee:

Missing evidence alone must never automatically create P0, P1, or P2 risk classification.

### BRS-ME-002 Missing Evidence Is Never Ignored

Priority: `P0`

Guarantee:

Missing evidence from source ExpertReasoningContracts must remain represented in the Building Risk Score™ contract.

### BRS-ME-003 Missing Evidence Can Limit Interpretation

Priority: `P1`

Guarantee:

Missing evidence may limit confidence, generate unknowns, or require recommendations, but it must remain distinguishable from confirmed risk.

### BRS-ME-004 Missing Evidence Is Auditable

Priority: `P1`

Guarantee:

Every missing evidence item must remain traceable to source contract references or public contract limitations.

## 10. Auditability

### BRS-AU-001 Source Contracts Are Referenced

Priority: `P0`

Guarantee:

Every Building Risk Score™ result must reference the ExpertReasoningContracts used as source inputs.

### BRS-AU-002 Explainability Items Are Traceable

Priority: `P0`

Guarantee:

Every primary risk driver, secondary risk driver, positive indicator, missing evidence item, unknown, red flag, and recommendation must be traceable to public contract inputs or limitations.

### BRS-AU-003 Classification Provenance Is Preserved

Priority: `P1`

Guarantee:

The contract must make it possible to understand why a public point is classified as P0, P1, P2, INFO, or UNKNOWN without accessing provider internals.

### BRS-AU-004 Audit Does Not Require Forbidden Inputs

Priority: `P0`

Guarantee:

Auditability must not require access to raw findings, raw measurements, images, provider keywords, router internals, private scoring details, database records, UI state, or reports.

## 11. Determinism

### BRS-DE-001 Identical Input Produces Identical Output

Priority: `P0`

Guarantee:

The same ExpertReasoningContracts must always produce the same Building Risk Score™ contract output.

### BRS-DE-002 Output Does Not Depend on Runtime State

Priority: `P0`

Guarantee:

The Building Risk Score™ result must not depend on random values, timestamps, external services, UI state, environment state, hidden mutable state, or execution order outside the provided source contracts.

### BRS-DE-003 Optional Field Ordering Is Stable

Priority: `P2`

Guarantee:

Where the public contract exposes ordered lists, the ordering must remain deterministic for identical input.

## 12. Extensibility

### BRS-EXN-001 New Domains Do Not Break Existing Contracts

Priority: `P0`

Guarantee:

Adding a new Expert Intelligence domain must not break the Building Risk Score™ public contract.

### BRS-EXN-002 Optional Extensions Preserve Baseline Meaning

Priority: `P1`

Guarantee:

Future optional extension areas must preserve the meaning of mandatory fields and existing classifications.

### BRS-EXN-003 Unknown Optional Fields Are Ignorable

Priority: `P1`

Guarantee:

Consumers must be able to ignore unknown optional fields without changing baseline interpretation.

### BRS-EXN-004 Missing Optional Provider Fields Do Not Break the Score

Priority: `P1`

Guarantee:

The Building Risk Score™ must remain contract-valid when a provider does not expose optional relevance fields, as long as the source input remains a valid ExpertReasoningContract.

## 13. Non-Scope Guardrails

### BRS-NS-001 Does Not Replace Structural Engineering

Priority: `P0`

Guarantee:

The Building Risk Score™ must never state or imply that it replaces structural engineering assessment or static verification.

### BRS-NS-002 Does Not Replace Professional Reports

Priority: `P0`

Guarantee:

The Building Risk Score™ must never state or imply that it replaces a technical due diligence report, survey report, expert opinion, or professional inspection report.

### BRS-NS-003 Does Not Determine Market Value

Priority: `P0`

Guarantee:

The Building Risk Score™ must never determine market value, purchase price, valuation outcome, or financial valuation.

### BRS-NS-004 Does Not Recommend Acquisition

Priority: `P0`

Guarantee:

The Building Risk Score™ must never recommend purchase, sale, acquisition, rejection, go/no-go, or investment decision.

### BRS-NS-005 Does Not Guarantee Safety

Priority: `P0`

Guarantee:

The Building Risk Score™ must never certify or guarantee safety, load-bearing capacity, code compliance, insurability, absence of defects, or future performance.

### BRS-NS-006 Does Not Introduce Non-Scope Artifacts

Priority: `P1`

Guarantee:

Architecture tests must protect against accidental introduction of score formulas, weightings, RUL, CAPEX calculation, dashboards, reports, persistence, APIs, JSON Schemas, database models, or UI obligations.

## 14. Contract Isolation

### BRS-CI-001 Router Changes Cannot Change Public Contract Shape

Priority: `P0`

Guarantee:

Changes to router implementation, router precedence, router signals, or router candidate behavior must not change Building Risk Score™ mandatory fields or classification vocabulary.

### BRS-CI-002 Provider Changes Cannot Change Public Contract Shape

Priority: `P0`

Guarantee:

Changes inside Knowledge Providers must not change Building Risk Score™ mandatory fields or classification vocabulary.

### BRS-CI-003 Keyword List Changes Cannot Change Public Contract Shape

Priority: `P0`

Guarantee:

Changes to keywords, signal terms, or provider matching lists must not change the Building Risk Score™ public contract shape.

### BRS-CI-004 Confidence Logic Changes Cannot Change Risk Contract Shape

Priority: `P0`

Guarantee:

Future changes to confidence interpretation or confidence internals must not change risk classification vocabulary, risk driver structure, red flag structure, missing evidence structure, or limitations.

### BRS-CI-005 Internal Implementation Changes Remain Behind the Contract Boundary

Priority: `P1`

Guarantee:

Internal implementation changes must remain invisible to consumers unless introduced through versioned, additive, optional contract extension.

## 15. Summary of P0 Guarantees

The following P0 guarantees are mandatory for the future Building Risk Score™ architecture:

- mandatory public contract fields remain stable
- mandatory explainability sections remain stable
- classification vocabulary remains controlled
- breaking changes are forbidden without version boundary
- provider additions do not change the score contract
- provider internals do not leak into the contract
- router changes do not change the contract
- only ExpertReasoningContracts are accepted
- forbidden inputs are rejected architecturally
- forbidden inputs cannot be used as fallbacks
- confidence never replaces or changes risk
- risk never calculates confidence
- every result remains explainable
- primary risk drivers are traceable
- missing evidence remains visible
- unknown remains visible and valid
- red flags remain review signals only
- missing evidence does not automatically create risk
- missing evidence is never ignored
- source contracts are referenced
- explainability items are traceable
- audit does not require forbidden inputs
- identical input produces identical output
- runtime state does not affect output
- new domains do not break existing contracts
- non-scope professional guardrails are preserved
- router, provider, keyword, and confidence changes cannot change public contract shape

## 16. Open Decisions for Sprint I-1D

The following decisions remain open:

- exact future executable architecture test format
- exact fixture strategy for ExpertReasoningContracts
- exact source contract reference identity convention
- exact evidence reference identity convention
- exact P0/P1/P2/INFO assignment policy
- exact handling of multiple source contracts
- exact compatibility test baseline for future versions
- exact extension registry policy

These decisions should be resolved before productive Building Risk Score™ implementation begins.

## 17. Recommendation for Sprint I-1D

Sprint I-1D should define architecture test specifications and fixture principles for the public contract without implementing productive score logic.

Recommended Sprint I-1D scope:

- define contract fixture categories
- define forbidden input fixture categories
- define compatibility baseline expectations
- define audit traceability fixture expectations
- define unknown-handling fixture expectations
- define non-scope guardrail fixture expectations

Sprint I-1D should not implement scoring formulas, weightings, calculations, CAPEX, RUL, reports, dashboards, APIs, JSON Schemas, persistence, database models, or UI.

## 18. Conclusion

This matrix defines the architectural guarantees that future Building Risk Score™ tests must preserve.

It keeps the score contract stable, provider-independent, input-bounded, confidence-separated, explainable, auditable, deterministic, extensible, and protected by professional non-scope guardrails.

Foundation 1.4 Sprint I-1C is complete as architecture test matrix only.
