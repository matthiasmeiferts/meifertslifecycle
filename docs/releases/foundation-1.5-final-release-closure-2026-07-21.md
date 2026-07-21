# Foundation 1.5 Final Release Closure

## Release Identity

- Branch: `foundation-release-1.0`
- Pre-closure baseline commit:
  `5fecf799888f4c6ad029652b84ed129cb3508e22`
- Closure commit: the final hash is assigned by the commit created in this
  gate. The closure commit is the commit that first contains this record and
  to which the final annotated tag below resolves.
- Release date: 2026-07-21
- Final annotated tag:
  `foundation-1.5-final-release-1.0-2026-07-21`

## Scope

Foundation 1.5 closes the following implemented and governed work:

- Risk Relevance governance architecture;
- the Risk Relevance governance registry;
- the `BuildingRiskInternalModel` preservation-and-preparation boundary;
- the `BuildingRiskInterpretationModel` interpretation boundary;
- provider-owned Risk Relevance source-version migration;
- the Structural Systems reference-provider migration;
- provider migration Wave 1;
- provider migration Wave 2;
- provider migration Final Wave;
- repository operating governance through `AGENTS.md`; and
- accepted architecture decisions through `ARCHITECTURE_DECISIONS.md`.

The earlier Foundation 1.5 toolbar-governance sequence dated 2026-07-07 is a
separate, historically bounded subsystem sequence. Its Foundation numbering
does not expand or replace the Risk Relevance release scope closed by this
record.

## Architecture State

At the closure commit, the implemented Foundation architecture has these
verified boundaries:

- Expert Intelligence is deterministic and explainable.
- `KnowledgeDomainRouter` performs deterministic multi-domain discovery using
  explicit precedence.
- Router precedence is not severity, confidence, diagnosis, or Risk
  Relevance.
- `ExpertReasoningEngine` remains single-provider and first-success.
- Provider results are not aggregated, blended, voted, averaged, or combined
  by consensus.
- Knowledge Providers own domain-specific expert knowledge.
- `KnowledgeReasoningMapper` remains the governed provider-to-reasoning
  mapping boundary, with approved domain-specific coordinator and engine
  paths preserving the same public contract.
- `RiskRelevanceGovernanceRegistry` owns the closed Risk Relevance vocabulary,
  value states, version states, governance version, and supported source
  version.
- Risk Relevance is a qualitative, source-bound signal. It is not a Building
  Risk Score, confidence value, severity, completeness state, review priority,
  financial result, or professional decision.
- `BuildingRiskInternalModel` preserves and prepares source contracts,
  references, evidence, metadata, invalid states, and conflicts. It does not
  interpret, diagnose, score, or silently resolve conflicts.
- `BuildingRiskInterpretationModel` interprets eligible governed entries from
  the Internal Model. It does not manufacture evidence or provider knowledge
  and does not produce public, persistence, report, or authorization output.
- No Building Risk Score, CAPEX result, valuation, acquisition advice, or
  review-priority result is derived by the Foundation 1.5 Risk Relevance
  architecture.
- Public result shapes, ordering, fallback behavior, and language behavior
  remain stable unless explicitly approved architecture and contract evolution
  changes them.
- Final professional judgment, acceptance, release, and external use remain
  the responsibility of an authorized human expert.

## Provider Inventory

Total Knowledge Providers: 15.

All providers are migrated. Every provider uses the shared
`RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION` authority from
`RiskRelevanceGovernanceRegistry`. Every provider has focused provider test
coverage and reasoning integration test coverage.

The implemented provider domains are:

1. `structural-systems`
2. `concrete-corrosion`
3. `basement-waterproofing`
4. `balconies-terraces`
5. `drainage-rainwater`
6. `fire-protection-systems`
7. `vertical-transportation-systems`
8. `sanitary-systems`
9. `hvac-systems`
10. `electrical-systems`
11. `windows-doors`
12. `facade-wall-systems`
13. `roof-envelope`
14. `moisture`
15. `crack`

## Validation Evidence

The immediately preceding read-only Foundation 1.5 release-readiness audit
observed:

- focused tests: 35 passed, 0 failed;
- independent read-only probes: 24 passed, 0 failed; and
- complete repository test suite: 190 test files passed, 0 failed.

During this closure gate, the complete repository suite was independently
re-run by executing every top-level JavaScript file in `tests/` with Node.js.
The current observed result was:

- complete repository test suite: 190 passed, 0 failed, 0 skipped;
- `git diff --check`: passed before creation of this record;
- working tree: clean before creation of this record; and
- generated or temporary test artifacts: none.

The 35 focused-test result and 24 independent-probe result are retained from
the immediately preceding read-only audit. They were not separately re-run in
this closure gate. The full 190-file repository suite was re-run in this gate
and is current closure evidence.

Document and commit validation in this gate additionally verifies the final
record diff and repository state before the annotated tag is created.

## Governance

- `AGENTS.md` is the repository operating constitution.
- `ARCHITECTURE_DECISIONS.md` contains 14 Accepted architecture decision
  records.
- Historical release records remain commit-bound and must not imply approval
  of later repository states.
- Mandatory architecture boundaries remain authoritative.
- Architecture changes require explicit approval and corresponding validation.

## Known Non-Blocking Repository Debt

The following known items do not affect the validated runtime or release
architecture:

- tracked `.DS_Store`;
- tracked `assets/.DS_Store`; and
- Foundation 1.5 numbering reuse across distinct, historically bounded
  subsystem sequences.

## Release Decision

FOUNDATION 1.5 FORMALLY CLOSED

READY FOR POST-FOUNDATION PRODUCT DEVELOPMENT

## Historical Boundary

This record approves only the exact closure commit created by this gate: the
commit that first contains this document and to which annotated tag
`foundation-1.5-final-release-1.0-2026-07-21` resolves. The commit's final hash
is assigned by Git when this record is committed.

This record does not audit or approve any later commit. Future changes require
their own architecture review, validation evidence, and applicable release
records.
