# ARCHITECTURE_DECISIONS.md

## 1. Purpose and Authority

This document records the binding architectural decisions that explain why
the MEIFERTS Building Lifecycle System is structured as it is.

`AGENTS.md` remains the repository operating constitution. It governs how
agents analyze, change, test, review, document, and report work.

Implementation and tests remain the source of truth for current behavior.
This document explains why the protected boundaries in that implementation
exist.

An Accepted decision remains binding until an explicitly approved architecture
change supersedes or deprecates it. A code change alone does not change an
Accepted decision.

Historical decisions remain bounded to the repository state and context they
describe. They MUST NOT be rewritten to imply approval of later states.

This initial decision set records current architecture at adoption commit
`32318f1fbf859066f60491cc8f82e3931969e1e2`. It does not assign an earlier
adoption date where repository evidence supports only an implementation or
Foundation 1.x adoption context.

All decisions in this initial set are Accepted. Future Superseded or Deprecated
records must retain their historical status and identify the replacing or
retiring decision.

## 2. Decision Record Format

Each decision uses the following fields:

- **Decision ID:** Stable identifier in the form `ADR-NNN`.
- **Title:** Concise name of the protected architecture decision.
- **Status:** `Accepted`, `Superseded`, or `Deprecated`.
- **Adoption Context:** Supported date, commit, release, or implementation
  context; no date is inferred without evidence.
- **Context:** The architectural problem or responsibility boundary.
- **Decision:** The binding architecture choice.
- **Rationale:** Why the choice exists.
- **Consequences:** Operational and structural effects of the choice.
- **Protected Boundary:** Behavior that ordinary implementation work may not
  cross.
- **Change Conditions:** What requires explicit architecture approval.
- **Related Implementation:** Verified implementation references.
- **Related Tests:** Existing tests relevant to the recorded behavior.
- **Related Documentation:** Accepted or descriptive repository records that
  provide additional context.

Status interpretation:

- **Accepted:** Current binding decision.
- **Superseded:** Historical decision replaced by an identified later decision.
- **Deprecated:** Historical decision retained for auditability but no longer
  approved for new implementation.

## 3. Foundational Decisions

### ADR-001: Deterministic Expert Intelligence

- **Decision ID:** ADR-001
- **Status:** Accepted
- **Adoption Context:** Established by the Expert Intelligence implementation
  and adopted as part of the Foundation 1.x architecture.

**Context:** Expert reasoning must be repeatable, explainable, testable, and
auditable from structured inspection input and repository-owned knowledge.

**Decision:** The Expert Intelligence core is deterministic. The same supported
input and options produce the same output. Explicit repository rules and
Knowledge Provider content govern reasoning. Probabilistic or generative AI
output does not replace deterministic core reasoning.

**Rationale:** Determinism permits stable hypothesis selection, reproducible
tests, inspectable evidence, controlled fallbacks, and professional review of
the reasoning basis.

**Consequences:** Ordering and tie-breaking remain explicit. Inputs remain
immutable where required. New reasoning behavior requires deterministic rules
and regression coverage.

**Protected Boundary:** External or generative AI MUST NOT become the
authoritative reasoning source inside the deterministic core without an
explicitly approved architecture change.

**Change Conditions:** A nondeterministic reasoning authority, external model
dependency, or probabilistic replacement for repository rules requires a new
or superseding architecture decision.

**Related Implementation:** `portal/core/ExpertReasoningEngine.js`;
`portal/core/reasoning/KnowledgeReasoningMapper.js`;
`portal/core/knowledge/`.

**Related Tests:** `tests/expert-reasoning-engine-test.js` verifies deterministic
output and input immutability; provider and reasoning integration tests verify
domain-level deterministic behavior.

**Related Documentation:** `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`;
`EXPERT_INTELLIGENCE_ARCHITECTURE_AUDIT_1_2.md`.

### ADR-002: Knowledge Providers Own Domain Expertise

- **Decision ID:** ADR-002
- **Status:** Accepted
- **Adoption Context:** Established across the implemented Expert Intelligence
  provider domains and adopted as part of the Foundation 1.x architecture.

**Context:** Domain hypotheses, indicators, verification needs, consequences,
and conservative technical wording require explicit ownership.

**Decision:** Domain-specific expert knowledge belongs to Knowledge Providers
in `portal/core/knowledge/`. Providers own conservative hypotheses and domain
indicators. Generic UI, report, routing, mapping, and orchestration layers do
not invent domain expertise.

**Rationale:** Provider ownership keeps technical knowledge local, reviewable,
deterministic, and independently testable while preventing domain semantics
from spreading across generic layers.

**Consequences:** Provider changes require focused provider and reasoning
integration tests. Other layers consume provider knowledge through established
contracts.

**Protected Boundary:** Domain knowledge MUST NOT be duplicated or silently
introduced outside the owning provider.

**Change Conditions:** Moving domain ownership, creating a new domain knowledge
authority, or embedding provider knowledge in another layer requires explicit
architecture approval.

**Related Implementation:** The 15 `*KnowledgeProvider.js` modules in
`portal/core/knowledge/`; provider imports in
`portal/core/ExpertReasoningEngine.js`.

**Related Tests:** The corresponding `tests/*-knowledge-provider-test.js` and
`tests/*-reasoning-integration-test.js` files for each implemented domain.

**Related Documentation:** `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`;
`DOMAIN_GOVERNANCE_REVIEW.md`.

### ADR-003: Deterministic Multi-Domain Discovery with Explicit Precedence

- **Decision ID:** ADR-003
- **Status:** Accepted
- **Adoption Context:** Established by the implemented Knowledge Domain Router
  and accepted Foundation 1.x engine governance.

**Context:** One observation may match several technical domains, so domain
discovery and evaluation order must be explicit without becoming a diagnosis.

**Decision:** `KnowledgeDomainRouter` may identify multiple applicable domains.
It returns them in an explicit deterministic precedence order. Precedence
defines evaluation order only; it is not severity, certainty, diagnosis, Risk
Relevance, or risk ranking.

**Rationale:** Explicit precedence makes domain overlap predictable, testable,
and explainable while allowing all applicable candidates to be discovered.

**Consequences:** Router predicates require positive, negative, metadata-only,
false-positive, overlap, determinism, and immutability coverage as applicable.
This decision does not authorize provider-result aggregation.

**Protected Boundary:** Router precedence MUST NOT be changed incidentally or
interpreted as an expert conclusion.

**Change Conditions:** Changing precedence, changing routing semantics, or
turning router order into technical ranking requires explicit architecture
approval and updated overlap tests.

**Related Implementation:** `portal/core/reasoning/KnowledgeDomainRouter.js`.

**Related Tests:** `tests/knowledge-domain-router-test.js` verifies stable
precedence, overlaps, metadata-only exclusions, deterministic output, and input
immutability.

**Related Documentation:** `ENGINE_GOVERNANCE_REVIEW.md`;
`DOMAIN_GOVERNANCE_REVIEW.md`; `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`.

### ADR-004: First-Success Reasoning Orchestration

- **Decision ID:** ADR-004
- **Status:** Accepted
- **Adoption Context:** Accepted for Foundation 1.x engine governance and
implemented in `ExpertReasoningEngine.analyze`.

**Context:** The router can return several candidates, but the public reasoning
contract represents one provider-backed result for an input.

**Decision:** `ExpertReasoningEngine` evaluates routed domains in precedence
order. The first provider path that produces a valid reasoning contract
determines the public result. Later candidates do not alter that successful
result. Provider results are not aggregated.

**Rationale:** First-success orchestration preserves a stable output shape,
deterministic resolution, explainable provider ownership, compatibility with
the existing public contract, and protection from uncontrolled cross-domain
synthesis.

**Consequences:** Multi-domain discovery remains internal to evaluation.
Fallback behavior applies when routed providers do not produce a mapped
contract. Public output remains single-provider.

**Protected Boundary:** Multi-provider aggregation, consensus, blending,
voting, cross-provider scoring, or synthesis requires a separate explicit
architecture decision.

**Change Conditions:** Any public multi-provider result or altered selection
model requires architecture approval, contract review, and new regression
coverage.

**Related Implementation:** `portal/core/ExpertReasoningEngine.js`;
`portal/core/reasoning/KnowledgeDomainRouter.js`.

**Related Tests:** `tests/expert-reasoning-engine-test.js` and the domain
`tests/*-reasoning-integration-test.js` suites verify engine dispatch, stable
contract behavior, and domain integration.

**Related Documentation:** `ENGINE_GOVERNANCE_REVIEW.md`;
`docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`.

### ADR-005: Evidence Before Interpretation

- **Decision ID:** ADR-005
- **Status:** Accepted
- **Adoption Context:** Established across Expert Intelligence, workflow
traceability, and Building Risk architecture.

**Context:** Professional reasoning must distinguish observations and evidence
from hypotheses, missing information, and downstream interpretation.

**Decision:** Structured observations and evidence precede hypothesis selection
and interpretation. Metadata alone is not automatically technical evidence.
Missing evidence remains visible. Interpretation does not create evidence, and
hypotheses remain hypotheses.

**Rationale:** The separation prevents unsupported technical conclusions and
keeps the reasoning basis traceable for professional review.

**Consequences:** Providers and routers use evidence gates. Reasoning contracts
expose supporting and missing evidence where defined. Risk models consume
structured source content rather than manufacturing observations.

**Protected Boundary:** No layer may generate a technical conclusion from
absent or unsupported evidence.

**Change Conditions:** Treating metadata, absence, confidence, completeness, or
generated text as technical evidence requires an explicit architecture change.

**Related Implementation:** `portal/core/reasoning/KnowledgeDomainRouter.js`;
`portal/core/reasoning/KnowledgeReasoningMapper.js`;
`portal/core/risk/BuildingRiskInternalModel.js`.

**Related Tests:** `tests/knowledge-domain-router-test.js` covers metadata-only
exclusions; provider tests cover evidence gates; `tests/expert-reasoning-engine-test.js`
checks reasoning evidence and missing-evidence behavior.

**Related Documentation:** `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`;
`BUILDING_RISK_INTERPRETATION_ARCHITECTURE_1_0.md`.

### ADR-006: Provider-to-Reasoning Mapping Is a Governed Boundary

- **Decision ID:** ADR-006
- **Status:** Accepted
- **Adoption Context:** Established by the shared reasoning mapper and
domain-specific engine mapping paths.

**Context:** Provider knowledge must be converted into one stable public
reasoning contract without transferring domain ownership into generic mapping.

**Decision:** `KnowledgeReasoningMapper` performs governed indicator matching,
deterministic scoring, stable tie-breaking, primary and alternative hypothesis
mapping, evidence and missing-evidence mapping, verification, consequences,
and confidence mapping. It does not route domains or interpret Risk Relevance.
Domain-specific mapping paths preserve the same public boundary.

**Rationale:** A defined mapping boundary keeps public output consistent while
allowing providers to retain domain knowledge ownership.

**Consequences:** Mapper and domain-specific path changes require public-shape,
determinism, immutability, fallback, and provider-integration review.

**Protected Boundary:** Mapping changes MUST NOT silently change public
reasoning contracts or move domain ownership into the mapper.

**Change Conditions:** Changing mapped field meaning, selection semantics,
confidence mapping, or mapper responsibility requires explicit architecture
and public-contract approval.

**Related Implementation:** `portal/core/reasoning/KnowledgeReasoningMapper.js`;
domain builder paths in `portal/core/ExpertReasoningEngine.js`.

**Related Tests:** `tests/expert-reasoning-engine-test.js` and domain
`tests/*-reasoning-integration-test.js` files verify mapped result shape and
behavior; `tests/public-api-contract-test.js` covers public entry contracts.

**Related Documentation:** `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`;
`EXPERT_INTELLIGENCE_ARCHITECTURE_AUDIT_1_2.md`.

### ADR-007: Risk Relevance Uses a Closed Governance Vocabulary

- **Decision ID:** ADR-007
- **Status:** Accepted
- **Adoption Context:** Implemented in Foundation 1.5 Risk Relevance governance.

**Context:** Provider-originated Risk Relevance needs one versioned vocabulary
and explicit handling for canonical, legacy, unsupported, unknown, invalid,
and absent values.

**Decision:** `RiskRelevanceGovernanceRegistry` owns canonical values, value
states, version states, supported legacy handling, the governance version, and
the supported source version. Providers use the shared source-version
authority. Distinct states remain distinguishable.

**Rationale:** One closed registry prevents semantic drift and makes source
value eligibility deterministic and auditable.

**Consequences:** Providers transport versioned source metadata. Consumers use
registry classification rather than local aliases or free-text interpretation.

**Protected Boundary:** No provider, engine, coordinator, renderer, report, or
UI may create a competing Risk Relevance vocabulary or version authority.

**Change Conditions:** Adding values, changing legacy mapping, or changing
version eligibility requires explicit governance and architecture approval.

**Related Implementation:** `portal/core/risk/RiskRelevanceGovernanceRegistry.js`;
Risk Relevance fields in `portal/core/knowledge/*KnowledgeProvider.js`.

**Related Tests:** `tests/risk-relevance-governance-registry-test.js` verifies
the closed value set, value states, version states, legacy mapping, invalid
handling, and immutable governance definitions.

**Related Documentation:** `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`;
`RISK_RELEVANCE_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md`.

### ADR-008: Risk Relevance Is Not a Building Risk Score

- **Decision ID:** ADR-008
- **Status:** Accepted
- **Adoption Context:** Accepted by Risk Relevance governance and implemented
by the Foundation 1.5 internal and interpretation models.

**Context:** A qualitative relevance signal can be mistaken for a score,
priority, financial result, safety conclusion, or professional decision.

**Decision:** Risk Relevance is a source-bound qualitative relevance signal
governed by the registry. It is not a Building Risk Score, CAPEX, valuation,
acquisition advice, confidence, completeness, severity, structural safety, or
review priority.

**Rationale:** Keeping relevance separate preserves source meaning and prevents
an internal qualitative field from becoming an unsupported decision output.

**Consequences:** Risk Relevance remains non-numeric and independently
auditable. Interpretation is governed and does not authorize scoring or advice.

**Protected Boundary:** Risk Relevance MUST NOT be numerically aggregated or
converted into a decision recommendation without a separately approved
architecture.

**Change Conditions:** Any score, weighting, CAPEX, valuation, priority, or
decision derivation requires a distinct approved architecture and contract.

**Related Implementation:** `portal/core/risk/RiskRelevanceGovernanceRegistry.js`;
`portal/core/risk/BuildingRiskInternalModel.js`;
`portal/core/risk/BuildingRiskInterpretationModel.js`.

**Related Tests:** `tests/risk-relevance-governance-registry-test.js`;
`tests/building-risk-internal-model-test.js` verifies no public score contract;
`tests/building-risk-interpretation-model-test.js` verifies prohibited output
boundaries and governed interpretation.

**Related Documentation:** `RISK_RELEVANCE_GOVERNANCE_ARCHITECTURE_1_0.md`;
`BUILDING_RISK_SCORE_ARCHITECTURE_1_0.md`.

### ADR-009: BuildingRiskInternalModel Preserves and Prepares

- **Decision ID:** ADR-009
- **Status:** Accepted
- **Adoption Context:** Implemented as the Foundation 1.4/1.5 Building Risk
internal preservation boundary.

**Context:** One or more Expert Reasoning contracts require normalized,
traceable internal preparation without interpretation or scoring.

**Decision:** `BuildingRiskInternalModel` deterministically normalizes supported
input and preserves source order, source references, evidence references,
completeness, invalid states, conflicts, Risk Relevance entries, and audit
context. It preserves conflicts rather than silently resolving them. It does
not interpret or score.

**Rationale:** Preservation and preparation provide a stable auditable source
for downstream interpretation without collapsing uncertainty or provenance.

**Consequences:** Invalid, legacy, incomplete, unknown, and conflict states
remain explicit. Source ordering and references remain available downstream.

**Protected Boundary:** The Internal Model MUST NOT diagnose, resolve conflicts,
calculate a Building Risk Score, aggregate confidence, create CAPEX, or produce
acquisition advice.

**Change Conditions:** Adding interpretation, resolution, scoring, financial
calculation, provider dispatch, UI, report, or persistence responsibility
requires explicit architecture approval.

**Related Implementation:** `portal/core/risk/BuildingRiskInternalModel.js`.

**Related Tests:** `tests/building-risk-internal-model-test.js` verifies input
forms, order, references, completeness, invalid sources, conflicts, Risk
Relevance preservation, non-derivation, and absence of a score contract.

**Related Documentation:** `BUILDING_RISK_SCORE_INTERNAL_DOMAIN_MODEL_1_0.md`;
`BUILDING_RISK_SCORE_INTERNAL_MODEL_READINESS_1_0.md`.

### ADR-010: BuildingRiskInterpretationModel Interprets but Does Not Generate Knowledge

- **Decision ID:** ADR-010
- **Status:** Accepted
- **Adoption Context:** Implemented in the Foundation 1.4/1.5 Building Risk
interpretation architecture.

**Context:** Governed internal source material requires deterministic
interpretation without provider calls, invented evidence, or public authority.

**Decision:** `BuildingRiskInterpretationModel` consumes only the governed
Internal Model. It evaluates eligibility and interprets source-bound governed
Risk Relevance entries while preserving limitations, conflicts, references,
and audit metadata. It does not call providers, manufacture evidence or expert
knowledge, produce public output, or create persistence authority.

**Rationale:** Keeping interpretation downstream of preservation separates
source truth from derived internal meaning and keeps governance auditable.

**Consequences:** Unsupported models and ineligible values do not become
confirmed interpretations. Conflicts and limitations remain visible.

**Protected Boundary:** Interpretation MUST remain downstream of preservation
and MUST NOT bypass governance value or version states.

**Change Conditions:** Provider access, free-text knowledge generation, public
contract output, persistence, or bypass of eligibility and governance states
requires explicit architecture approval.

**Related Implementation:** `portal/core/risk/BuildingRiskInterpretationModel.js`;
`portal/core/risk/RiskRelevanceGovernanceRegistry.js`.

**Related Tests:** `tests/building-risk-interpretation-model-test.js` verifies
supported input, eligibility, source binding, conflicts, limitations,
non-derivation, audit references, and forbidden output fields.

**Related Documentation:** `BUILDING_RISK_INTERPRETATION_ARCHITECTURE_1_0.md`;
`RISK_RELEVANCE_INTERPRETATION_IMPLEMENTATION_READINESS_ARCHITECTURE_1_0.md`.

### ADR-011: Stable Public Contracts

- **Decision ID:** ADR-011
- **Status:** Accepted
- **Adoption Context:** Established by the public API contract, deterministic
pipeline, and Expert Intelligence integration.

**Context:** Workspace, pipeline, reasoning, and report consumers rely on
stable result shapes and semantics.

**Decision:** Public result shapes, field meanings, ordering, fallback behavior,
and language behavior are stable contracts. Internal metadata does not leak
without explicit inclusion. Renaming, removing, retyping, or repurposing fields
requires explicit approval. Additive changes require compatibility assessment.

**Rationale:** Stable contracts preserve interoperability, deterministic tests,
traceability, and controlled evolution across repository layers.

**Consequences:** Internal implementation work must preserve observable
contracts unless contract evolution is explicitly approved and tested.

**Protected Boundary:** Internal refactoring does not authorize silent public
API changes.

**Change Conditions:** Approved contract evolution must define compatibility,
consumer impact, migration, fallback, language, and regression requirements.

**Related Implementation:** `portal/core/model/CanonicalDataModel.js`;
`portal/core/ExpertReasoningEngine.js`; `portal/core/InspectionPipelineEngine.js`;
`portal/core/ReportAssemblyEngine.js`.

**Related Tests:** `tests/public-api-contract-test.js` verifies public entry
points and contract behavior; `tests/pipeline-integrity-validator-test.js` and
`tests/expert-reasoning-engine-test.js` cover applicable stable boundaries.

**Related Documentation:** `docs/EXPERT_INTELLIGENCE_ARCHITECTURE.md`;
`ENGINE_GOVERNANCE_REVIEW.md`.

### ADR-012: Human Expert Responsibility Remains Final

- **Decision ID:** ADR-012
- **Status:** Accepted
- **Adoption Context:** Established by the professional workspace, review,
finalization, export governance, and Foundation release boundary.

**Context:** MBLS produces hypotheses, interpretations, previews, and governed
workflow outputs for professional use, but those artifacts are not themselves
final professional judgment.

**Decision:** MBLS supports professional decision-making and does not replace
the responsible expert. Hypotheses, interpretations, previews, and generated
outputs do not automatically become final professional conclusions. Review,
acceptance, release, and external use remain governed human actions.

**Rationale:** The architecture separates technical assistance and workflow
automation from professional responsibility and authorization.

**Consequences:** Review and approval states remain explicit. Automated output
uses conservative wording and cannot claim professional authority.

**Protected Boundary:** No automated layer may claim final professional
approval, certification, valuation, legal conclusion, or guaranteed safety.

**Change Conditions:** Any automatic final professional conclusion or external
authorization requires explicit architecture approval and a separately defined
professional governance basis.

**Related Implementation:** `portal/core/ReviewQueueManager.js`;
`portal/core/ReviewResolutionManager.js`;
`portal/core/WorkflowValidationGateManager.js`;
`portal/core/ReportFinalizationLockManager.js`.

**Related Tests:** `tests/expert-review-model-test.js`;
`tests/workflow-validation-gate-manager-test.js`;
`tests/finalization-gate-model-test.js`; applicable release-lock tests.

**Related Documentation:** `RELEASE_NOTES_FOUNDATION_1.0.md`;
`docs/releases/foundation-release-audit-4dec9c6-2026-07-20.md`.

### ADR-013: Reports Are Governed Outputs

- **Decision ID:** ADR-013
- **Status:** Accepted
- **Adoption Context:** Established by report assembly, review, finalization,
export preparation, authorization, and output governance milestones.

**Context:** A report can be drafted, previewed, assembled, and rendered before
it is reviewed, finalized, authorized, or suitable for external use.

**Decision:** Report preparation is a controlled downstream process. Draft,
reviewed, final, authorized, prepared, and externally usable states remain
distinct where implemented. Previews do not bypass review or authorization.
Report output preserves source traceability and does not silently elevate
hypotheses.

**Rationale:** State separation prevents technical rendering capability from
being mistaken for professional or external-use authorization.

**Consequences:** Report actions remain subject to review, finalization, lock,
preparation, authorization, and output governance. Trace metadata remains
available through report assembly.

**Protected Boundary:** Rendering or export capability MUST NOT be interpreted
as authorization.

**Change Conditions:** Collapsing report states, bypassing gates, or treating a
preview or export as approval requires explicit architecture approval.

**Related Implementation:** `portal/core/ReportAssemblyEngine.js`;
`portal/core/ReportOutputGovernanceManager.js`;
`portal/core/ReportFinalizationLockManager.js`; export and finalization models
and preview components under `portal/`.

**Related Tests:** `tests/report-assembly-engine-test.js`;
`tests/report-output-governance-manager-test.js`;
`tests/finalization-gate-model-test.js`;
`tests/export-authorization-gate-model-test.js`; applicable transition,
release-lock, and preview-component tests.

**Related Documentation:** `docs/releases/foundation-1.3-f-report-governance-consolidation.md`;
the Foundation 2.5 through 3.2 release records in `docs/releases/`.

### ADR-014: Historical Release Records Are Commit-Bound

- **Decision ID:** ADR-014
- **Status:** Accepted
- **Adoption Context:** Established by release documentation practice and the
recovered historical audit archived at commit `b8fc246`.

**Context:** Branch names and repository contents advance, while a release
audit describes a specific repository state and validation context.

**Decision:** Historical release records describe a defined state and identify
their commit, date, and scope where available. Approval of one commit is not
approval of later repository states. Historical records are not rewritten to
describe current behavior.

**Rationale:** Commit-bounded records preserve temporal accuracy, validation
provenance, and an auditable distinction between historical and current state.

**Consequences:** Historical test counts and approval statements retain their
original scope. Current readiness requires current evidence.

**Protected Boundary:** Documentation history MUST remain auditable and
temporally accurate.

**Change Conditions:** Correcting a historical record requires preserved
provenance, explicit correction scope, and no implication that unverified later
states were approved.

**Related Implementation:** Git commit and tag history; no runtime module owns
this documentation boundary.

**Related Tests:** No executable test proves historical validation events. Git
history can verify committed content, ancestry, tags, and tree contents but not
an unrecorded historical command execution.

**Related Documentation:** `docs/releases/foundation-release-audit-4dec9c6-2026-07-20.md`;
other commit- or milestone-bounded records in `docs/releases/`.

## 4. Cross-Decision Consistency

The Accepted decisions form the following bounded flow:

`Evidence -> Domain Discovery -> Provider Knowledge -> First-Success Mapping -> Internal Preservation -> Governed Interpretation -> Human Review -> Governed Report Output`

- ADR-003 discovers multiple candidates but does not aggregate them.
- ADR-004 selects the first successful provider-backed contract and remains
  single-provider.
- ADR-007 defines Risk Relevance vocabulary and version authority.
- ADR-008 prevents Risk Relevance from becoming a Building Risk Score or
  decision recommendation.
- ADR-009 preserves and prepares source material but does not interpret.
- ADR-010 interprets eligible governed material but does not generate expert
  knowledge.
- ADR-011 permits explicitly approved contract evolution but prohibits silent
  contract change.
- ADR-012 preserves final human professional responsibility.
- ADR-013 keeps rendering and export capability separate from authorization.
- ADR-014 preserves the temporal boundary of release evidence.

No decision in this record authorizes multi-provider aggregation, a Building
Risk Score, automatic professional approval, or bypass of report governance.

## 5. Decision Maintenance

An Accepted decision may change only through explicit architecture approval. The replacing record must identify whether the earlier decision is Superseded
or Deprecated and must preserve the earlier record for auditability.

Implementation inventories and paths in this document must be updated when an
approved architecture change modifies them. Such maintenance must not rewrite
the historical reason or status of an earlier decision.

If implementation and this document diverge without an approved decision, the divergence is not implicit architecture approval. The implementation, tests,
Git history, `AGENTS.md`, and applicable accepted records must be reviewed and the conflict explicitly resolved.
