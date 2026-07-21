# AGENTS.md

## Authority and Scope

This document is the operating constitution for engineering agents working in
the MEIFERTS Building Lifecycle System repository.
These rules apply to the repository root and every directory below it.
Agents MUST follow this document when analyzing, changing, testing, reviewing,
or documenting the repository.
Task-specific user instructions MAY narrow the permitted scope.
Task-specific instructions MUST NOT be interpreted as permission for unrelated
changes.
When a task conflicts with this document, the agent MUST stop and request
explicit direction. Only an explicit higher-authority instruction may
override a mandatory rule in this document.

## 1. Project Mission

The MEIFERTS Building Lifecycle System, abbreviated MBLS, supports structured
technical building inspection, evidence management, expert reasoning,
professional review, decision support, and controlled report preparation.
MBLS MUST preserve an evidence-first professional workflow from inspection
context through findings, assessments, recommendations, decisions, and report
outputs.
The Expert Intelligence layer MUST remain deterministic and explainable.
Expert Intelligence MUST support professional reasoning; it MUST NOT replace
the responsible human expert.
The system MUST NOT present a generated hypothesis as a final expert opinion,
certified valuation, legal conclusion, acquisition decision, or professional
approval.
Final professional judgment, acceptance, release, and external use remain the
responsibility of an authorized human reviewer.

## 2. Core Principles

### 2.1 Explainability

Every derived result MUST have an inspectable basis in structured input,
explicit rules, provider knowledge, or governed transformation logic.
Code that ranks, routes, maps, interprets, blocks, or authorizes output MUST be
readable and testable.
User-facing reasoning SHOULD state hypotheses, supporting evidence, missing
evidence, verification needs, and potential consequences where the public
contract requires them.
Hidden inference mechanisms MUST NOT replace explicit repository logic.

### 2.2 Determinism

The same supported input and options MUST produce the same result.
Ordering rules MUST be explicit and stable.
Tie-breaking MUST be deterministic.
Changes MUST preserve input immutability where the existing contract requires
it.
External AI calls, nondeterministic model output, random selection, and
environment-dependent reasoning MUST NOT replace deterministic core behavior.

### 2.3 Traceability

Information MUST remain traceable across the implemented workflow:

`Inspection -> Evidence -> Finding -> Assessment -> Recommendation -> Decision -> Report`

Source identifiers, evidence references, contract references, conflict
references, and audit metadata MUST be preserved where their contracts define
them.
Transformations MUST NOT silently discard provenance required by downstream
review or governance.

### 2.4 Auditability

Governance decisions and transformations MUST be inspectable after execution.
Invalid, incomplete, legacy, unknown, and conflicting states MUST remain
distinguishable where the architecture defines those states.
Historical release records MUST identify the commit, date, and scope they
describe.
Historical approval MUST NOT be presented as approval of a later repository
state.

### 2.5 Expert Knowledge First

Domain reasoning MUST originate from explicit Knowledge Providers and governed
repository rules.
Agents MUST NOT invent building-technical knowledge to fill a provider gap.
New expert content MUST be based on approved domain knowledge and MUST follow
the existing provider contract.
Generic language generation MUST NOT become a source of expert facts.

### 2.6 Evidence Before Interpretation

Observed and structured evidence MUST precede hypothesis selection and risk
interpretation.
Metadata-only input MUST NOT be treated as observed technical evidence unless
the implemented contract explicitly defines it as evidence.
Missing evidence MUST remain visible and MUST NOT be converted into a positive
technical conclusion.
Interpretation MUST NOT manufacture source evidence.

### 2.7 Stable Public Contracts

Existing public data shapes, field meanings, ordering, fallback behavior, and
language behavior MUST remain stable unless an explicitly approved task changes
the contract.
Additive changes MUST be assessed for compatibility.
Fields MUST NOT be renamed, removed, retyped, or repurposed silently.
Internal metadata MUST NOT leak into public results unless the public contract
explicitly includes it.

## 3. Repository Architecture

This section records the implemented architecture at the time this document
was adopted. Mandatory architectural boundaries remain authoritative.
Implementation inventories, paths, and module details MUST be updated when
an explicitly approved architecture change modifies them.

### 3.1 Layer Boundaries

The repository contains distinct Website, Workspace, Expert Intelligence,
Risk, governance, and Reports responsibilities.
Each layer MUST perform only its implemented responsibility.
A layer MUST NOT assume ownership of routing, knowledge, interpretation,
persistence, rendering, or approval behavior assigned to another layer.
Cross-layer changes MUST preserve the direction and shape of existing data
flows.

### 3.2 Website

The root website and the `de/`, `en/`, `assets/`, research, publication,
methodology, contact, and related public directories provide public
information and entry points.
The Website layer is presentation and positioning infrastructure.
It MUST NOT become the source of Expert Intelligence conclusions.
It MUST NOT expose claims that exceed implemented and professionally reviewed
system capability.
Public wording MUST preserve the boundary between decision support and final
expert judgment.

### 3.3 Workspace

The `portal/` and workspace-facing modules provide the professional operating
environment for cases, buildings, inspections, evidence, findings,
assessments, recommendations, decisions, reviews, settings, and reports.
Managers in `portal/core/` own their defined workflow and data-management
responsibilities.
Workspace controllers, routers, pages, components, and styles MUST consume
core behavior without redefining its domain semantics.
Workspace actions MUST respect validation, review, locking, finalization, and
export governance.
UI availability MUST NOT be treated as proof that a governed action is
authorized.

### 3.4 Knowledge Providers

Knowledge Providers reside in `portal/core/knowledge/`.
They own deterministic, domain-specific hypothesis knowledge.
Each provider exposes `getKnowledge(input)` and returns a domain identifier and
an ordered hypothesis collection.
The stable empty provider result is a domain identifier with an empty
`hypotheses` array.
Providers MUST safely handle empty and incomplete inputs.
Providers MUST NOT mutate caller input.
Providers MUST return fresh output objects and arrays where existing contracts
require them.
Providers MUST use conservative hypothesis wording.
Providers MUST NOT assert a confirmed diagnosis, compliance decision,
certification result, guaranteed safety state, or mandatory professional
conclusion.
The implemented provider domains are:

- Structural Systems;
- Concrete Corrosion;
- Basement Waterproofing;
- Balconies, Loggias, and Terraces;
- Drainage, Rainwater, and Site Water Management;
- Fire Protection Systems;
- Vertical Transportation Systems;
- Sanitary Systems;
- HVAC Systems;
- Electrical Systems;
- Windows and Doors;
- Facade and External Wall Systems;
- Roof Envelope;
- Moisture;
- Cracks.
Agents MUST inspect the applicable provider and its tests before changing
domain behavior.
Domain ownership MUST remain with its provider unless an architecture change
is explicitly approved.

### 3.5 KnowledgeDomainRouter

`portal/core/reasoning/KnowledgeDomainRouter.js` owns deterministic domain
discovery.
The router normalizes supported input, evaluates domain predicates, and
returns all applicable domain identifiers in explicit precedence order.
The router MAY identify more than one domain.
The router MUST NOT map hypotheses, calculate confidence, diagnose a condition,
aggregate provider results, or perform Risk Relevance interpretation.
Routing predicates MUST require the evidence gates implemented for their
domains.
False-positive, negation, metadata-only, and overlap behavior MUST remain
covered by tests.
Router precedence is part of observable reasoning behavior and MUST NOT change
without explicit approval and overlap tests.

### 3.6 ExpertReasoningEngine

`portal/core/ExpertReasoningEngine.js` owns reasoning orchestration, provider
dispatch, fallback behavior, and the final Expert Reasoning result shape.
The engine clones supported input, normalizes language options, requests
ordered domains from `KnowledgeDomainRouter`, and evaluates those domains in
order.
The engine returns the first provider result that produces a reasoning
contract.
The implemented architecture is single-provider and first-success.
The engine MUST NOT aggregate multiple provider outputs into one public
reasoning result.
Later routed candidates MUST NOT alter a result after an earlier provider has
successfully produced the contract.
The legacy fallback path MUST remain stable unless an approved task explicitly
changes it.
The engine MUST remain deterministic and side-effect free.
Language adapters, coordinators, and renderers MUST preserve the public
reasoning contract and MUST NOT leak canonical internal context.

### 3.7 KnowledgeReasoningMapper

`portal/core/reasoning/KnowledgeReasoningMapper.js` is the shared provider-to-
reasoning mapping boundary for most domains.
It owns deterministic indicator matching, hypothesis scoring, tie-breaking,
primary and alternative hypothesis mapping, evidence collection, missing
evidence collection, verification output, consequences, and mapped confidence.
The mapper returns `null` when provider knowledge cannot produce a supported
match.
The mapper MUST preserve the stable public reasoning fields.
The mapper MUST preserve governed provider metadata, including Risk Relevance
source-version metadata where present.
The mapper MUST NOT become a domain router or a Risk Relevance interpreter.
Domain-specific engine mapping paths MUST preserve the same public boundary
and MUST be tested independently.

### 3.8 RiskRelevanceGovernanceRegistry

`portal/core/risk/RiskRelevanceGovernanceRegistry.js` owns the closed Risk
Relevance vocabulary, value states, version states, supported legacy mapping,
and governance definition.
The registry classifies source values and versions; it does not calculate a
risk score.
Providers MUST use the shared supported source-version constant.
Engines, coordinators, and renderers MUST NOT create competing Risk Relevance
version authorities.
Unknown, invalid, unsupported, legacy, and absent states MUST remain explicit.

### 3.9 BuildingRiskInternalModel

`portal/core/risk/BuildingRiskInternalModel.js` is the deterministic
preservation-and-preparation boundary for one or more Expert Reasoning
contracts.
It owns input normalization, source references, domain assessments, evidence
references, completeness classification, invalid-source preservation,
conflict construction, Risk Relevance entry preparation, and audit context.
It MUST preserve source order and source-bound metadata.
It MUST preserve conflicts rather than silently resolve them.
It MUST NOT calculate a Building Risk Score, aggregate confidence, call
Knowledge Providers, inspect router state, render UI, persist records, or
produce acquisition advice.

### 3.10 BuildingRiskInterpretationModel

`portal/core/risk/BuildingRiskInterpretationModel.js` consumes the governed
internal model and produces deterministic internal interpretation output.
It owns eligibility checks, source-bound Risk Relevance interpretation,
conflict-aware interpretation state, limitations, references, and audit
metadata.
It MUST accept only the supported internal model boundary.
It MUST interpret Risk Relevance only from preserved governed entries.
It MUST NOT manufacture provider evidence or bypass value and version states.
It MUST NOT expose a Building Risk Score, review priority, CAPEX result,
remaining useful life, valuation, acquisition advice, public API result, UI
result, report output, or persistence record.

### 3.11 Reports

Report managers, assembly engines, draft previews, review gates, finalization
locks, export-preparation models, authorization gates, and preview components
form the controlled Reports layer.
Reports consume governed workflow information and preserve traceability from
source evidence and decisions.
Draft, reviewed, final, authorized, prepared, and externally usable states
MUST remain distinct where implemented.
A rendered preview MUST NOT bypass review, finalization, authorization, or
export governance.
Report output MUST NOT silently elevate a hypothesis into a final expert
conclusion.

### 3.12 Release Documentation

`docs/releases/` contains milestone, validation, consolidation, and historical
release records.
Release documents MUST identify their scope accurately.
Commit-bound historical records MUST NOT imply approval of later commits.
Agents MUST NOT rewrite historical evidence to describe current state.
New documentation SHOULD link a claim to the applicable implementation,
validation result, commit, or historical boundary.

## 4. Engineering Workflow

### 4.1 Repository Analysis

Before implementation, the agent MUST inspect Git state, applicable
instructions, relevant source files, related tests, and current documentation.
The agent MUST determine whether existing user changes are present.
Unrelated user changes MUST be preserved.

### 4.2 Architecture Review

The agent MUST identify the owning layer and the downstream consumers of the
proposed change.
The agent MUST review existing contracts, ordering, fallback behavior,
language behavior, governance boundaries, and historical decisions relevant
to the task.

### 4.3 Impact Assessment

The agent MUST assess public API impact, provider impact, router overlap,
reasoning output, risk interpretation, workflow governance, persistence,
reports, UI, documentation, and tests as applicable.
The agent MUST identify whether the task changes behavior or only records
existing behavior.

### 4.4 Implementation Plan

For non-trivial work, the agent SHOULD define a bounded implementation and
validation sequence before editing.
The plan MUST remain within the requested scope.
The plan MUST NOT include speculative redesign or unrelated cleanup.

### 4.5 Implementation

The agent MUST make the smallest coherent change that satisfies the approved
objective.
Existing naming, module structure, formatting, and contract conventions SHOULD
be followed.
Domain rules MUST remain explicit and testable.
Input immutability and deterministic output MUST be preserved.

### 4.6 Testing

The agent MUST run validation proportional to the changed behavior.
Focused tests MUST precede broader suites when a narrow failure can provide
faster diagnostic evidence.
The agent MUST inspect failures and MUST NOT report success when required tests
did not pass.

### 4.7 Review

Before completion, the agent MUST review the complete diff.
The review MUST check scope, architecture boundaries, public contracts,
wording, tests, documentation, and Git hygiene.
Generated or recovered documentation MUST be read completely before handoff.

### 4.8 Completion Report

The completion report MUST state what changed, what was validated, what was
not run, and the final Git status.
The report MUST distinguish verified results from assumptions or historical
claims.
The report MUST disclose any remaining blocker or user action.

## 5. Git Governance

Before editing, staging, committing, tagging, or pushing, an agent MUST verify
the current branch.
When a task supplies an expected HEAD, the agent MUST verify the full commit
hash exactly.
Before a gated task, the agent MUST verify staged changes, unstaged tracked
changes, untracked files, and upstream divergence.
If a mandatory Git gate differs from the requested state, the agent MUST stop
without implementing the gated task.
An agent MUST NOT discard, overwrite, stage, or incorporate unrelated changes.
An agent MUST NOT stage files without explicit instruction.
An agent MUST NOT create or amend a commit without explicit instruction.
An agent MUST NOT create, move, or delete a tag without explicit instruction.
An agent MUST NOT push without explicit instruction.
Permission to commit does not imply permission to tag or push.
Permission to stage one path does not imply permission to stage another path.
Destructive Git operations MUST NOT be used unless the user explicitly
requests the exact operation and target.
Commit messages MUST match an explicitly supplied subject exactly.
After a commit, the agent MUST verify the commit subject, parent, file list,
diff integrity, and working-tree state when the task requires them.

## 6. Testing Requirements

### 6.1 Focused Tests

Changed modules MUST be covered by their focused tests.
Provider changes MUST run the provider test and relevant reasoning integration
test.
Router changes MUST run `tests/knowledge-domain-router-test.js` and applicable
overlap regressions.
Engine changes MUST run `tests/expert-reasoning-engine-test.js` and affected
domain integration tests.
Risk governance changes MUST run the registry, internal-model, and
interpretation-model tests as applicable.
Workflow or report changes MUST run their model, transition, regression,
release-lock, and browser/static integration tests as applicable.

### 6.2 Probe Tests

Agents SHOULD use small read-only or temporary probe tests when they clarify a
contract edge case before implementation.
Probe tests MUST NOT replace committed regression coverage for changed
behavior.
Temporary probe artifacts MUST be removed before completion unless the user
explicitly requests them as deliverables.

### 6.3 Full Suite

The repository test files are standalone JavaScript programs executed with
Node.js.
When full regression validation is required, the complete repository test
suite MUST be executed. Under the current repository structure, this means
executing every top-level JavaScript test in `tests/`, unless an explicitly
approved authoritative test runner provides equivalent or broader coverage.
A full-suite report MUST state the command or runner used and the observed
result.
Historical test results MUST NOT be presented as current validation.

Documentation-only changes MAY omit runtime and behavior tests when no
executable code, configuration, generated artifact, or public runtime
contract is affected. The agent MUST still review the complete document,
validate referenced facts where applicable, run `git diff --check`, and
report that runtime tests were not executed.

### 6.4 Test Quality

Tests MUST verify observable contracts rather than private helper names.
Tests for deterministic modules SHOULD cover repeatability, stable ordering,
input immutability, empty input, incomplete input, malformed input, and fresh
output structures as applicable.
Expert Intelligence tests MUST cover positive evidence, false positives,
metadata-only input, conservative wording, domain overlaps, and fallback
behavior as applicable.
Risk tests MUST cover value state, version state, eligibility, source binding,
conflicts, non-derivation, invalid input, and audit references as applicable.

### 6.5 Git Hygiene

`git diff --check` MUST pass before a change is reported ready.
The complete diff MUST be inspected.
The final status MUST be reported.
Tests MUST NOT leave unexplained generated, modified, or untracked artifacts.

### 6.6 Post-Commit Validation

When a commit is requested, the committed file list MUST be verified.
The commit subject MUST be verified.
`git diff --check HEAD^ HEAD` SHOULD be run for the new commit.
The working tree SHOULD be clean after the commit unless the task explicitly
requires remaining changes.

## 7. Expert Intelligence Guardrails

Agents MUST NOT invent expert knowledge.
Agents MUST NOT convert hypotheses into diagnoses.
Agents MUST NOT replace deterministic reasoning with probabilistic AI.
Evidence MUST always precede interpretation.
Provider hypotheses MUST remain hypotheses.
Confidence MUST NOT be presented as certainty.
Missing evidence MUST NOT be treated as supporting evidence.
Router precedence MUST NOT be represented as technical severity or certainty.
The first-success provider result MUST NOT be described as aggregation or
multi-domain consensus.
Alternative hypotheses MUST remain distinguishable from the primary
hypothesis.
Generated wording MUST remain conservative and verification-oriented.
Outputs MUST NOT assert legal compliance, non-compliance, certification,
approval validity, guaranteed functionality, or guaranteed safety.
Professional review MUST remain visible wherever the workflow requires it.
Language translation MUST preserve technical meaning and contract shape.
Terminology adaptation MUST NOT create new technical evidence.

## 8. Risk Relevance Guardrails

Risk Relevance is not a Building Risk Score.
Risk Relevance is not CAPEX.
Risk Relevance is not valuation.
Risk Relevance is not acquisition advice.
Risk Relevance is not confidence, completeness, severity, criticality,
structural safety, or review priority.
Risk Relevance MUST remain a source-bound qualitative relevance signal.
Interpretation MUST respect governance boundaries.
Only governed values and version states MAY participate in Risk Relevance
interpretation.
Legacy values MUST pass through the implemented classification boundary.
Unknown, unsupported, invalid, and absent values MUST NOT be silently promoted
to canonical values.
`concernCategory` and `riskRelevance` MUST NOT be treated as interchangeable.
The Internal Model MUST preserve and classify; it MUST NOT create a score.
The Interpretation Model MUST interpret eligible structured entries; it MUST
NOT derive relevance from free text, domain identity, router order, keyword
count, confidence, or missing evidence.
Conflicts and limitations MUST remain visible.
Risk interpretation MUST NOT directly create public output, report approval,
or persistence authority.

## 9. Forbidden Changes

Agents MUST NOT make silent API changes.
Agents MUST NOT perform unnecessary refactoring.
Agents MUST NOT make architecture changes without explicit approval.
Agents MUST NOT change domain ownership without explicit approval.
Agents MUST NOT expand scope beyond the requested objective.
Agents MUST NOT introduce multi-provider aggregation into the current
single-provider reasoning architecture without explicit approval.
Agents MUST NOT change router precedence as incidental cleanup.
Agents MUST NOT bypass Knowledge Providers with invented domain rules in UI,
reports, or generic engine code.
Agents MUST NOT bypass review, validation, finalization, lock, authorization,
or export gates.
Agents MUST NOT weaken conservative expert wording.
Agents MUST NOT expose internal canonical context through public contracts.
Agents MUST NOT collapse unknown, invalid, unsupported, incomplete, and absent
states into one state when the implementation distinguishes them.
Agents MUST NOT turn Risk Relevance into a score or decision recommendation.
Agents MUST NOT rewrite historical release records to imply current approval.
Agents MUST NOT mix unrelated formatting, cleanup, dependency, or naming work
into a bounded change.
Agents MUST NOT delete backups, historical records, user files, or generated
evidence unless the exact deletion is authorized.
Agents MUST NOT claim tests passed when they were not executed successfully.

## 10. Definition of Done

A task is done only when all applicable conditions below are satisfied.

### 10.1 Architecture

- The implemented architecture is preserved.
- Layer responsibilities remain separated.
- Domain ownership remains unchanged unless explicitly approved.
- Deterministic behavior and ordering are preserved.
- Public contracts and fallback behavior are preserved unless explicitly
  changed.
- Human expert responsibility remains intact.

### 10.2 Implementation

- The requested scope is fully implemented.
- No unrelated changes are included.
- Inputs remain immutable where required.
- Traceability and audit metadata remain intact.
- Expert and Risk Relevance guardrails are satisfied.

### 10.3 Testing

- Required focused tests pass.
- Required integration and regression tests pass.
- Required probe tests are resolved or converted into durable coverage.
- The full suite passes when the task requires it.
- Test results are reported accurately.

### 10.4 Documentation

- Applicable architecture and release documentation is updated when required.
- Existing historical documentation remains historically bounded.
- New documentation matches implemented behavior.
- The complete changed document has been reviewed.

### 10.5 Git and Review

- The complete diff has been inspected.
- `git diff --check` passes.
- Staging, commit, tag, and push actions match explicit authorization.
- Final Git status is known and reported.
- Post-commit validation is complete when applicable.
- No unexplained artifacts remain.

### 10.6 Completion

- Architecture is preserved.
- Tests are completed as required.
- Documentation is accurate.
- Git state is clean or contains only the explicitly expected change.
- Scope is respected.
- Review is complete.
- The completion report distinguishes completed validation from work not run.
