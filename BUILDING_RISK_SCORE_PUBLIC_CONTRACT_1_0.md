# Building Risk Score™ Public Contract 1.0

## Foundation 1.4 / Sprint I-1B

This document defines the future public Building Risk Score™ Contract architecture for the MEIFERTS Building Lifecycle System™.

It is a contract architecture paper only. It does not define implementation, calculations, formulas, weightings, scoring algorithms, UI, reports, persistence, APIs, JSON Schema, or database models.

## 1. Contract Scope

The Building Risk Score™ public contract is the future output boundary of a deterministic risk interpretation layer.

The contract must work exclusively on existing ExpertReasoningContracts. It must never work directly on raw findings, raw building data, raw measurements, provider internals, router logic, keywords, images, UI state, reports, or market data.

The contract must remain provider-independent. A new Knowledge Provider may add new domain expertise, but it must not require a change to the Building Risk Score™ public contract when its output is exposed through the stable ExpertReasoningContract boundary.

## 2. Mandatory Contract Information

Every future Building Risk Score™ result must always provide the following public information.

### Contract Identity

Mandatory fields:

- `contractName`
- `contractVersion`
- `contractStatus`
- `generatedFrom`

Purpose:

These fields identify that the result is a Building Risk Score™ contract, which version of the public contract was used, whether the result is valid or unknown, and that the source boundary is ExpertReasoningContracts.

### Overall Result

Mandatory fields:

- `riskClass`
- `riskSummary`
- `resultClassification`

Allowed classification values:

- `P0`
- `P1`
- `P2`
- `INFO`
- `UNKNOWN`

Purpose:

These fields expose the public result category and a concise interpretation. They do not expose or imply a formula, weighting, valuation, purchase recommendation, or safety guarantee.

### Explainability

Mandatory field:

- `explainability`

The explainability structure must always include:

- `primaryRiskDrivers`
- `secondaryRiskDrivers`
- `positiveIndicators`
- `missingEvidence`
- `unknowns`
- `redFlags`
- `recommendations`

Each section may be empty, but the section itself must exist.

### Confidence

Mandatory field:

- `confidence`

Purpose:

This field exposes public confidence interpretation for the Building Risk Score™ result. It does not define calculation and must not be treated as risk.

### Source Traceability

Mandatory field:

- `sourceContracts`

Purpose:

This field records which ExpertReasoningContracts were used as source inputs. It must support auditability without exposing provider internals or raw data.

### Limitations

Mandatory field:

- `limitations`

Purpose:

This field records the professional boundary of the result. It must preserve the rule that the Building Risk Score™ does not replace expert review, structural assessment, valuation, acquisition advice, reporting, or safety certification.

## 3. Optional Contract Information

Optional fields may be added only when they can be derived from ExpertReasoningContracts without accessing forbidden inputs.

Optional information may include:

- `domainSummaries`
- `assumptionNotes`
- `reviewPriority`
- `followUpGroups`
- `positiveIndicatorSummary`
- `uncertaintySummary`
- `contractExtensions`

Optional fields must not be required for baseline interpretation.

Optional fields must not change the meaning of mandatory fields.

Optional fields must not expose provider internals, router decisions, keywords, raw observations, images, market data, CAPEX calculations, RUL estimates, or report content.

## 4. Explainability Structure

The public contract must represent explainability as structured sections, not as an opaque summary.

Each explainability item should follow the same conceptual item structure:

- `id`
- `classification`
- `title`
- `description`
- `sourceContractReferences`
- `evidenceReferences`
- `certaintyState`

This is a conceptual structure only. It is not a JSON Schema.

### Primary Risk Drivers

`primaryRiskDrivers` represents the most important contract-level risk reasons.

Allowed basis:

- primary hypotheses
- public hypothesis classifications
- public relevance fields
- potential consequences
- required verification
- missing evidence
- red flags derived from public contract content

Forbidden basis:

- provider keywords
- router order
- raw finding text
- images
- private provider scoring

### Secondary Risk Drivers

`secondaryRiskDrivers` represents relevant but non-primary risk reasons.

Allowed basis:

- alternative hypotheses
- secondary consequence patterns
- unresolved verification needs
- supporting evidence from non-primary contract sections

Secondary drivers must not override primary drivers unless a future contract version explicitly defines that rule.

### Positive Indicators

`positiveIndicators` represents stabilizing or lower-concern contract signals.

Positive indicators may reflect:

- low-risk public classifications
- low relevance fields
- clear supporting evidence for a minor condition
- absence of missing evidence for a narrow reasoned issue
- verification guidance that points to routine follow-up rather than urgent escalation

Positive indicators must never be represented as proof that no defect exists.

### Missing Evidence

`missingEvidence` represents absent, incomplete, contradicting, or unresolved evidence that limits interpretation.

Missing evidence must remain visible even when the overall result is not unknown.

### Unknowns

`unknowns` represents areas where the Building Risk Score™ cannot make a reliable public interpretation from the available ExpertReasoningContracts.

Unknowns are valid contract results and must not be treated as system failure.

### Red Flags

`redFlags` represents public contract signals that require attention before relying on the result.

Red flags may indicate urgency, safety-sensitive uncertainty, specialist verification needs, severe consequence language, high relevance fields, or unresolved missing evidence.

A red flag is not a diagnosis, certification, valuation, or purchase recommendation.

### Recommendations

`recommendations` represents next-action guidance derived from public contract fields.

Allowed basis:

- `requiredVerification`
- public `recommendedActions`
- missing evidence
- red flags
- limitations

Recommendations must not invent new professional instructions outside the ExpertReasoningContract boundary.

## 5. Confidence Contract

The public confidence contract must describe confidence as interpretation reliability, not risk.

Mandatory confidence structure:

- `level`
- `summary`
- `basis`
- `limitations`

Allowed confidence levels:

- `high`
- `medium`
- `low`
- `unknown`

The contract must not define how confidence is calculated.

The contract must not expose formula inputs, weights, coefficients, or hidden scoring components.

The contract must preserve these rules:

- high confidence can coexist with low risk
- high confidence can coexist with high risk
- low confidence can coexist with high risk
- unknown confidence can coexist with any risk classification
- confidence must never be used as a substitute for risk classification

## 6. Missing Evidence Representation

Missing evidence must be represented as first-class contract information.

Each missing evidence item should conceptually include:

- `id`
- `classification`
- `description`
- `sourceContractReferences`
- `affectedInterpretation`
- `recommendedVerificationReference`

Missing evidence may contribute to `UNKNOWN`, `P0`, `P1`, `P2`, or `INFO` classifications depending on public contract interpretation.

Missing evidence must not be hidden inside confidence text alone.

## 7. Positive Indicators Representation

Positive indicators must be represented cautiously and explicitly.

Each positive indicator should conceptually include:

- `id`
- `description`
- `sourceContractReferences`
- `supportingEvidenceReferences`
- `limitation`

Positive indicators may reduce concern within a documented evidence boundary, but they must not certify absence of risk.

The public contract must distinguish between:

- a confirmed positive indicator within available evidence
- a missing negative finding
- an unknown condition

Only confirmed points from ExpertReasoningContracts may be represented as positive indicators.

## 8. Red Flag Representation

Red flags must be represented as structured public contract items.

Each red flag should conceptually include:

- `id`
- `classification`
- `description`
- `sourceContractReferences`
- `triggeringPublicContractFields`
- `requiredFollowUp`
- `limitation`

Allowed classifications:

- `P0`
- `P1`
- `P2`
- `INFO`

Only confirmed points may receive these classifications.

A red flag classification is a review priority classification. It is not a final technical diagnosis.

Red flags must not be derived from provider keywords, router internals, raw images, or raw inspection text.

## 9. Unknown Representation

Unknown must be represented explicitly.

Unknown may apply to the whole Building Risk Score™ result or to a section of the explainability structure.

A whole-result unknown should include:

- `riskClass: "UNKNOWN"`
- an unknown confidence level
- missing evidence entries
- limitations
- source contract references

Section-level unknowns should appear in the `unknowns` explainability section.

Unknown must be used when the available ExpertReasoningContracts do not support a confirmed P0, P1, P2, or INFO interpretation.

Unknown must not be coerced into a lower-risk category merely to produce a complete-looking result.

## 10. Classification Contract

The public contract uses the following classification vocabulary only for confirmed points:

- `P0`
- `P1`
- `P2`
- `INFO`

Conceptual meaning:

- `P0`: highest review priority within the public contract boundary
- `P1`: elevated review priority within the public contract boundary
- `P2`: monitored or normal review priority within the public contract boundary
- `INFO`: informational point without priority escalation within the public contract boundary

`UNKNOWN` is not a confirmed priority. It is the result of insufficient contract evidence.

The contract does not define thresholds, formulas, weights, or scoring algorithms for assigning these classifications.

## 11. Versioning

The Building Risk Score™ public contract must be versioned from the beginning.

Versioning principles:

- every result must expose `contractVersion`
- new optional fields may be added in minor versions
- mandatory fields may not be removed without a major version
- classification vocabulary changes require explicit version review
- meaning of existing fields must remain stable within the same major version
- consumers must be able to ignore unknown optional fields safely

Versioning must support future extension without breaking existing consumers.

## 12. Backward Compatibility

New Knowledge Providers must not break the Building Risk Score™ public contract.

Compatibility strategy:

- the score consumes ExpertReasoningContracts only
- provider-specific fields are optional unless normalized into public score fields
- absence of optional relevance fields must not invalidate the score contract
- unknown or unsupported provider-specific fields must be ignored by default
- new providers must not require public contract shape changes
- future provider-specific interpretation must be added through optional extension areas or versioned policy, not by changing mandatory fields

The Building Risk Score™ must remain stable even as Expert Intelligence domains expand.

## 13. Auditability

The public contract must be fully auditable at the architecture level.

Auditability requires:

- source contract references
- evidence references
- missing evidence references
- confidence basis
- limitation statements
- classification provenance
- deterministic result interpretation
- explicit unknown representation
- stable contract version

Auditability must not require access to raw findings, raw measurements, images, provider keywords, router internals, private scoring details, or database records.

The audit trail must explain which public ExpertReasoningContract elements supported each public Building Risk Score™ item.

## 14. Non-Scope

The following are not part of this public contract architecture:

- score formula
- weightings
- remaining useful life
- CAPEX calculation
- valuation logic
- reports
- dashboard
- acquisition recommendation
- persistence
- APIs
- JSON Schema
- database model
- provider implementation
- router implementation
- image interpretation
- keyword interpretation
- UI presentation

## 15. Open Decisions for Sprint I-1C

The following decisions remain open:

- exact field names for implementation
- whether the result accepts one or multiple source contracts
- source reference identity format
- evidence reference identity format
- policy for mapping contract content into P0, P1, P2, INFO, or UNKNOWN
- whether domain summaries should become optional or mandatory
- whether review priority and risk class remain separate fields
- how contract extensions are registered
- how architecture tests express backward compatibility

These decisions should be resolved before productive implementation begins.

## 16. Recommendation for Sprint I-1C

Sprint I-1C should define the architecture test matrix for this public contract.

Recommended Sprint I-1C scope:

- validate mandatory contract sections
- validate forbidden input rejection at architecture level
- validate unknown representation
- validate confidence-risk separation
- validate provider independence
- validate backward compatibility rules
- validate auditability references
- validate non-scope guardrails

Sprint I-1C should not implement score calculations, formulas, weightings, CAPEX, RUL, dashboards, reports, persistence, APIs, JSON Schema, or database models.

## 17. Conclusion

The Building Risk Score™ public contract must be stable, explainable, auditable, provider-independent, and strictly bounded by ExpertReasoningContracts.

The contract may classify confirmed public contract points as P0, P1, P2, or INFO, and it must preserve UNKNOWN when evidence is insufficient.

This document completes Foundation 1.4 Sprint I-1B as contract architecture only.
