# Productization 1.0-B1 Expert Intelligence Runtime Integration Review 1.0

## 1. Objective

Connect persisted inspection data to the governed Expert Intelligence runtime and expose an explicit execution action and persisted professional summary in the production inspection workspace. This review covers input assembly, first-success Expert Reasoning, Internal Model preparation, Interpretation Model processing, append-only execution persistence, and UI status visibility.

## 2. Baseline

- Branch: `foundation-release-1.0`
- Baseline commit: `65b69aca375feb2c7ef1432b1d5906640d19d6bf`
- Baseline tag: `foundation-1.5-final-release-1.0-2026-07-21`
- Initial upstream divergence: 0 ahead / 0 behind
- Initial working tree: clean, with no staged, unstaged, or untracked files

The mandatory Git gate passed before implementation. `AGENTS.md`, all Accepted ADRs in `ARCHITECTURE_DECISIONS.md`, and the Foundation 1.5 closure document governed the work.

## 3. Changed files

- Modified `portal/core/ExpertReasoningEngine.js` to expose an additive governed execution trace while preserving the existing `analyze()` result contract.
- Added `portal/core/ExpertIntelligenceRuntimeManager.js` for deterministic assembly, execution, persistence, state, stale detection, and summary projection.
- Modified `portal/ui/pages/InspectionPage.js` with the production trigger and persisted status summary.
- Added `tests/expert-intelligence-runtime-manager-test.js`.
- Added `tests/inspection-page-expert-intelligence-runtime-test.js`.
- Added this implementation review.

No unrelated file was changed.

## 4. Runtime data flow

The implemented flow is:

1. Load the selected persisted inspection.
2. Load its latest inspection scope, visible questions, persisted answers, inspection-bound findings and evidence, building, case reference, limitations, and metadata.
3. Create a deterministic cloned runtime input and source fingerprint.
4. Execute `ExpertReasoningEngine` using the existing first-success orchestration.
5. Wrap the successful governed result as one Expert Reasoning Contract.
6. Build one `BuildingRiskInternalModel` result.
7. Interpret that Internal Model with `BuildingRiskInterpretationModel`.
8. Persist the complete execution separately from inspection source records.
9. Read the latest execution and render a concise status and summary in `InspectionPage`.

No provider aggregation was introduced.

## 5. Input assembly contract

The runtime input contains cloned `finding`, `building`, `measurements`, and `context` fields. Finding and answer text supplies deterministic reasoning signals. Evidence contributes references and only explicit measurement values; binary content is not stored or inferred. Context binds the input to inspection, case, building, answer, finding, evidence, evidence-requirement, and limitation references.

Only visible questions with persisted answers are assembled. Inspection-bound findings and evidence are preferred; case-level records without an inspection binding remain available, while records bound to sibling inspections are excluded. Persisted scope `evidenceRequirements` are cloned into runtime context and the source snapshot as requirements, remain separate from actual evidence, and participate in fingerprint-based stale detection. A stable explicit projection and FNV-1a fingerprint support local stale-result detection. The projection includes the normalized fachlich runtime basis plus source-bound question, answer, finding, evidence, evidence-reference, requirement, and limitation metadata. It explicitly omits only `runtimeInput.context.inspectionStatus` as operational workflow metadata. The audit snapshot retains reviewable evidence, inspection status, and operational timestamps, while the fingerprint projection explicitly excludes operational `createdAt` and `updatedAt` values. Assembly does not mutate persisted source records.

## 6. Persistence contract

Execution records use the `expertIntelligenceExecutions` StorageManager collection and schema `expert-intelligence-execution-1.0`. Records contain a stable sequential ID, inspection/case/building references, execution time, source fingerprint and snapshot, runtime input, engine state, routed domains, selected provider and domain, reasoning result, Internal Model result, Interpretation Model result, limitations, errors, governance/model versions, and mandatory human-review state.

History is append-only per inspection. IDs follow `EI-<inspection-id>-<sequence>`. Read by ID, ordered list by inspection, and latest-by-inspection operations are supported. StorageManager serialization survives route changes and reloads. A persistence exception returns a visible transient failed execution containing the otherwise complete record and the storage error; it is not represented as success.

Stored and transient history entries are validated non-destructively before lookup. Null, primitive, array, incomplete, malformed-timestamp, malformed-snapshot, and unknown-status entries are excluded from valid history and latest selection. Valid neighboring records remain readable. Deterministic corruption metadata records the exclusion reason and human-review requirement without rewriting storage.

## 7. UI integration

The production inspection workspace contains an explicit **Run Expert Intelligence** action. It is disabled when no inspection is selected. The panel displays not-run, running, succeeded, no-provider-contract, and failed states.

Persisted summaries expose execution ID, separate domain/provider identity, matched/supporting/missing evidence counts, confidence, Risk Relevance value and source-version states, interpretation state and eligibility, preserved conflict and limitation counts, and human-review requirement. A stale notice appears after source data changes. Limitations and errors remain visible. Malformed stored history produces an explicit exclusion and human-review notice while the latest valid result remains renderable. The panel explicitly states that no Building Risk Score or automatic diagnosis is produced.

## 8. Error and empty-state behavior

- Missing inspection: execution is rejected before a record can be bound.
- Missing building reference: a failed execution is persisted.
- No persisted answers or findings: a `not_run` execution with a visible error is persisted.
- No successful provider contract: `no_provider_contract` is persisted without model results.
- Provider/engine failure: a failed execution and error are persisted.
- Unsupported Risk Relevance version or invalid value: the raw value/version and non-interpretable state are preserved.
- Internal Model or Interpretation Model rejection: failure is persisted with every model result produced before rejection.
- Persistence failure: a transient reviewable failure preserves the record and storage error.
- Malformed execution history: invalid records are excluded, corruption remains reviewable, and valid records continue to support safe UI state.

Failures are not converted into successful empty results.

## 9. Architecture-boundary verification

Deterministic multi-domain discovery and explicit precedence remain in `KnowledgeDomainRouter`. `ExpertReasoningEngine` still stops at the first successful provider; the additive trace reports routing and the selected provider without aggregating results. Provider-owned expertise and `KnowledgeReasoningMapper` remain unchanged.

The shared Risk Relevance registry remains authoritative. The Internal Model only preserves and prepares. The Interpretation Model only interprets accepted Internal Model data. Unsupported and invalid states are not silently normalized. The existing public `ExpertReasoningEngine.analyze()` output is unchanged. Human expert responsibility is explicitly persisted and displayed.

No score, CAPEX calculation, valuation, acquisition recommendation, diagnosis, conflict resolution, or automatic approval was added.

## 10. Test results

Focused commands:

```text
node tests/expert-intelligence-runtime-manager-test.js
node tests/inspection-page-expert-intelligence-runtime-test.js
```

Result: PASS. Coverage includes deterministic input assembly, immutability, evidence-requirement preservation and stale participation without evidence promotion, operational timestamp exclusion, fachlich relevant date preservation, public engine compatibility, first-success selection, no aggregation, nullable source-bound provider metadata, both model handoffs, source-version/evidence/missing-evidence/conflict/limitation preservation, persistence create/read/list/latest, reload, rerun, stale detection, empty states, no-domain handling, engine/model/persistence failures, invalid and unsupported Risk Relevance, malformed mixed and malformed-only histories, and behavioral UI trigger/summary/corruption rendering.

The final correction adds behavioral coverage for `draft -> completed`,
`scheduled -> in_progress`, and `completed -> reopened`; combined workflow-
status and operational-timestamp changes; stale-state neutrality; runtime-
context and source-snapshot status preservation; technical evidence and finding
status sensitivity; and unchanged fachlich sensitivity, immutability, and
determinism.

Affected existing commands included:

```text
node tests/expert-reasoning-engine-test.js
node tests/knowledge-domain-router-test.js
node tests/risk-relevance-governance-registry-test.js
node tests/building-risk-internal-model-test.js
node tests/building-risk-interpretation-model-test.js
for test_file in tests/*-reasoning-integration-test.js; do node "$test_file"; done
node tests/inspection-context-test.js
node tests/inspection-context-serialization-test.js
node tests/inspection-context-regression-safety-test.js
node tests/evidence-to-finding-multiple-evidence-persistence-test.js
node tests/inspection-pipeline-engine-test.js
node tests/inspection-pipeline-e2e-test.js
```

Result: PASS for the engine, router, registry, both models, all 15 provider
reasoning integration suites, and the directly affected inspection and
persistence tests.

## 11. Probe results

Twenty-nine independently written in-memory probes were executed. Twenty-six
passed and three failed. The passing probes covered:

1. deterministic repeatability;
2. source-input immutability;
3. fresh output objects;
4. inspection-to-engine binding;
5. provider/domain preservation;
6. no multi-provider aggregation;
7. evidence preservation;
8. missing-evidence preservation;
9. Risk Relevance value preservation;
10. source-version preservation;
11. unsupported-version preservation;
12. conflict preservation;
13. limitation preservation;
14. persistence round trip;
15. latest-result selection;
16. stale detection after changed input;
17. new history entry on rerun;
18. absence of a Building Risk Score;
19. absence of CAPEX derivation;
20. absence of valuation derivation;
21. absence of acquisition advice;
22. unchanged-source stale-state safety;
23. invalid Risk Relevance value preservation;
24. failure persistence;
25. absence of automatic diagnosis; and
26. absence of automatic final approval.

The following probes failed:

1. Scope `evidenceRequirements` were not present in the runtime input or source
   snapshot.
2. The selected provider identity was present on the execution record but was
   not preserved through the `BuildingRiskInternalModel` input/output boundary.
3. A persisted execution collection containing a malformed `null` entry caused
   `getByInspection()` to throw instead of safely ignoring or classifying the
   malformed record.

No probe file was created.

After correction, twenty-six valid independent correction probes passed with zero failures. They covered evidence-requirement round trip, immutability, fingerprint participation, changed and unchanged staleness, separation from actual evidence, provider preservation, domain/provider separation, source binding, explicit missing-provider state, no provider inference, null and primitive records, malformed timestamp and snapshot exclusion, mixed history, deterministic latest-valid selection, UI-safe lookup, no aggregation, and all prohibited score, financial, diagnosis, and approval outputs. One initial probe assertion referenced a non-contract execution-root count and was rejected; the corrected evidence-separation probe passed and is included in the valid count.

The repeat independent review executed thirty-five fresh probes. Thirty-four passed and one failed. The failure changed only `inspection.scheduledAt` and observed a source fingerprint change from `fnv1a-e75d0730` to `fnv1a-f6a6e67f`. This proves that a timestamp participates in the stale fingerprint despite the correction requirement that timestamps be excluded.

The final timestamp correction then executed twenty-three fresh independent probes, all of which passed. Individual and combined changes to `scheduledAt`, `startedAt`, `completedAt`, `createdAt`, `updatedAt`, `lastOpenedAt`, and `lastViewedAt` remained fingerprint-neutral. Answer, evidence-requirement, evidence-title, and fachlich relevant answer/finding date changes remained fingerprint-relevant. Immutability, determinism, stale behavior, malformed-history safety, provider identity, no aggregation, and prohibited-output boundaries also passed.

The final repeat independent review executed thirty-three fresh probes. Thirty-two passed and one failed. Changing an evidence record's `measurementValue`, `location`, and technical observation date changed `runtimeInput.measurements` and `runtimeInput.finding.location` but did not change `sourceFingerprint`. This demonstrates that the explicit projection omits fachlich evidence fields consumed by reasoning.

The reasoning-input fingerprint correction executed thirty-two fresh probes, all of which passed. Covered changes included evidence measurement value, unit, type, location, finding location, technical capture date, title, description, notes, reference, evidence requirements, collection membership, answers, and technical answer dates. Operational timestamp neutrality, equivalent-input determinism, immutability, evidence/requirement separation, provider identity, first-success selection, malformed-history safety, no aggregation, and prohibited-output boundaries also passed.

The inspection-status fingerprint correction executed twenty-six fresh
independent probes, all of which passed. They covered three workflow-status
transitions, status plus operational timestamps, status preservation in runtime
context and `sourceSnapshot`, fachlich input and technical evidence-status
sensitivity, immutability, repeatability, provider identity, malformed history,
first-success, no aggregation, and prohibited-output boundaries. The final
probe verified that status-only changes leave both the source fingerprint and
generic legacy fallback output unchanged. No temporary probe file remains.

## 12. Full-suite result

The complete repository suite was executed as every top-level JavaScript file in `tests/`:

```text
for test_file in tests/*.js; do node "$test_file"; done
```

Result: PASS — 192 of 192 top-level JavaScript test files passed after the two focused test files were added.

## 13. Known limitations

- Execution is synchronous and local; the running state is UI-local during the operation.
- Persistence uses the repository's existing localStorage convention and has no backend synchronization.
- A storage failure remains reviewable only for the active JavaScript session because durable storage is unavailable by definition.
- Staleness is based on the governed source snapshot; unrelated repository or UI state does not invalidate an execution.
- The summary is intentionally concise and does not replace expert review of the preserved model data.

## 14. Scope exclusions

This sprint does not implement final report assembly, export preparation, export authorization, PDF generation, a Building Risk Score, CAPEX derivation, valuation, acquisition advice, provider aggregation, automatic diagnosis, automatic conflict resolution, or automatic final-report approval.

## 15. Git hygiene

`git diff --check` passes. No temporary files, generated artifacts, secrets, credentials, absolute local paths, unresolved merge markers, accidental source-format rewrites, or unrelated changes were found. No file was staged. No commit or tag was created, and nothing was pushed.

The final working tree contains only the expected unstaged implementation and review files described in section 3.

Repeat-review Git state: branch `foundation-release-1.0`, HEAD and tag target `65b69aca375feb2c7ef1432b1d5906640d19d6bf`, upstream divergence 0 ahead / 0 behind, two modified tracked files, four untracked files, and no staged files.

## 16. Independent review findings

The independent review verified deterministic routing, unchanged precedence,
single-provider first-success orchestration, public `analyze()` compatibility,
Risk Relevance governance, append-only normal-path persistence, model
non-derivation boundaries, human-review responsibility, and the absence of
scope expansion.

The original independent review identified three blocking findings:

1. **Incomplete governed source preservation.** At the original review point,
   `InspectionScopeManager` persisted `evidenceRequirements`, but
   `assembleRuntimeInput()` placed them in neither the source snapshot nor
   runtime context. This prevented stale detection when only those requirements
   changed.
2. **Provider identity lost at the Internal Model boundary.** At the original
   review point, the execution record stored `selectedProvider`, but the input
   passed to `BuildingRiskInternalModel.build()` contained only the selected
   domain, so the Internal Model did not preserve provider identity.
3. **Malformed stored records unsafe.** At the original review point,
   `getByInspection()` dereferenced each stored entry without validation. A
   malformed `null` record threw and could prevent execution-state lookup and
   production summary rendering.

All three findings are resolved by the correction sprint:

1. Scope evidence requirements are cloned into runtime context and the source
   snapshot, remain distinct from evidence, and now affect the deterministic
   fingerprint and stale state.
2. Selected domain and nullable selected provider are preserved separately in
   the Internal Model's supported `assessmentContext`, bound to the execution
   source reference. Existing direct-contract callers remain compatible, and
   the Interpretation Model does not use provider identity for interpretation.
3. Execution-history reads now validate and safely exclude malformed entries,
   preserve valid neighboring records, return deterministic latest-valid state,
   and expose non-destructive corruption metadata to the production UI.

The new runtime-manager tests exercise substantial observable behavior. The
earlier source-string UI test was replaced during correction with behavioral
DOM-level trigger, state, summary, stale-notice, and corruption-notice
assertions.

### Repeat independent-review finding

The three original blockers are corrected, but one stale-detection blocker
remained at that review point. `sourceSnapshot.inspection` included
`scheduledAt`, `startedAt`, and `completedAt`, and `sourceFingerprint` hashed
that complete snapshot. A change to scheduling or lifecycle time alone
therefore marked a prior reasoning result stale. This violated the correction
requirement that no timestamp participate in the source fingerprint. The
focused tests did not cover timestamp-only changes at that review point.

### Timestamp-fingerprint correction

The stale fingerprint now hashes an explicit `sourceFingerprintProjection`
rather than the complete audit snapshot. The projection includes technical
inspection metadata, building context, visible question identity, answers,
findings, actual evidence references, evidence requirements, and limitations.
It explicitly excludes operational inspection, execution, persistence, and UI
timestamps. Fachlich relevant date values inside answers, findings, evidence,
requirements, or other included technical content remain unchanged and
fingerprint-relevant. Focused behavioral tests and 23 independent probes verify
that timestamp-only changes no longer create staleness while the tested answer,
finding, requirement, and evidence-title changes still do.

### Final repeat independent-review finding

Operational timestamp exclusion is correct, and the three earlier blockers
remain resolved. However, the fingerprint projection is incomplete relative to
the governed reasoning input. `runtimeInput.measurements` reads evidence
`measurementValue`, `measurementUnit`, and location fields, and the finding
location also consumes evidence location. `sourceFingerprintProjection` uses
the concise `evidenceReferences` entries, which omit those fields. A fresh probe
changed measurement from `1` to `4 mm`, location from `Wall A` to `Wall B`, and
the evidence technical observation date; the reasoning input changed while the
fingerprint remained `fnv1a-ea01a107`. Consequently, a prior execution can
remain incorrectly current after fachlich evidence used by reasoning changes.
The focused evidence regression changes only the evidence title and therefore
does not cover this failure.

### Reasoning-input fingerprint correction

The root cause was two independently maintained fachlich projections: the
normalized `runtimeInput` consumed evidence-derived measurement and location
data, while `sourceFingerprintProjection` used only concise evidence
references. The corrected projection now includes the normalized
`runtimeInput` as its authoritative reasoning basis and adds explicit
source-bound metadata required for traceable stale detection.

The immutable audit snapshot now retains reviewable technical evidence records.
The fingerprint evidence projection covers identity, type, category, title,
description, notes, value, building system, location and location label,
inspection area, component, measurement value/unit/type, captured/observed/
source/document dates, source-question relationships, required-evidence
relationships, file-reference metadata, severity, status, relationship IDs,
tags, review state, expert-review state, and confidence. Operational
`createdAt` and `updatedAt` values remain available in the audit snapshot but
are explicitly omitted from fingerprint input.

Focused behavioral tests verify the high-value invariant directly: when a
representative evidence measurement/location change alters normalized
`runtimeInput`, the fingerprint changes. They also verify that evidence audit
timestamps remain fingerprint-neutral, technical evidence dates remain
relevant, collection changes are detected, the source is immutable, and all
earlier provider, history, timestamp, and first-success boundaries remain
intact.

## 17. Final contract-review findings

The preceding final independent contract review found one remaining stale-result
contract blocker. The normalized `runtimeInput` passed to
`ExpertReasoningEngine` is included intact in `sourceFingerprintProjection`,
and the additional source-bound projection data preserves technical evidence
identity, relationships, classifications, dates, and review metadata needed
for stale detection and auditability. However,
`runtimeInput.context.inspectionStatus` is workflow/operational metadata, is not
consumed by routing or provider reasoning, and at that review point remained
inside the fingerprint basis.

Operational inspection lifecycle timestamps, evidence audit timestamps,
execution time, persistence bookkeeping, and UI-only state remain outside the
fingerprint. Technical dates carried by answers, findings, measurements, and
evidence remain fingerprint-relevant. The complete `sourceSnapshot` continues
to retain the operational audit data excluded from stale comparison. A final
narrow probe changed only the persisted inspection status from `draft` to
`completed`; `runtimeInput.context.inspectionStatus` changed and the source
fingerprint changed from `fnv1a-92c4bc2b` to `fnv1a-2de784d9`. This violates
the governing invariant that operational-only changes must remain fingerprint-
neutral.

Forty-five fresh independent final probes passed with zero failures. They
covered deterministic repeatability and immutability; answer, finding,
evidence, measurement, relationship, collection, requirement, and technical-
date changes; operational timestamp neutrality; provider/domain separation;
first-success and no aggregation; append-only and malformed-history behavior;
Risk Relevance preservation; and all prohibited score, financial, diagnostic,
and approval outputs. Initial probe predicates that matched the established
provider-owned `capexRelevance` and `valuationRelevance` metadata were corrected
to test for generated CAPEX and valuation outputs; the corrected 45-probe
matrix passed. No temporary probe file remains.

Including the final inspection-status alignment probe, the final independent
review executed 46 probes: 45 passed and one failed. The failure is a contract
failure, not a test-harness false positive, because inspection workflow status
does not affect the normalized finding, building, or measurements consumed by
the current router and providers.

The focused runtime-manager and behavioral inspection-page tests passed. The
Expert Reasoning, domain router, Risk Relevance registry, Internal Model, and
Interpretation Model suites passed. All 15 provider reasoning integration
suites and the directly affected inspection and persistence tests passed. The
complete repository suite passed 192 of 192 top-level JavaScript test files
with zero failures. Syntax validation and `git diff --check` passed.

The final worktree remains intentionally not clean and contains exactly the
two modified tracked implementation files and four untracked implementation,
test, and review files listed in section 3. No file is staged. Nothing was
committed, tagged, or pushed during this review.

At that review point, the commit gate remained blocked until inspection workflow status was classified
as fingerprint-neutral without weakening fingerprint coverage for fachlich
reasoning input, and focused regression coverage proves both that neutrality
and the existing technical-change sensitivity.

### Inspection-status fingerprint correction

The root cause was the byte-for-byte inclusion of normalized `runtimeInput` in
`sourceFingerprintProjection`. The runtime input intentionally exposes
`context.inspectionStatus` for workflow visibility, although the router,
provider mapping paths, Internal Model, and Interpretation Model do not use the
inspection workflow status as fachlich evidence.

The correction is confined to runtime-input projection at the integration
boundary. A cloned reasoning and fingerprint input removes only
`context.inspectionStatus`. The original persisted runtime input retains the
status, and `sourceSnapshot.inspection.status` retains it for audit history. No
generic context or status stripping was introduced.
Evidence status, finding status, review state, validity and support states, and
other technical classifications remain fingerprint-relevant where present in
the governed source projection.

The router, provider mapping paths, Internal Model, and Interpretation Model do
not consume inspection workflow status. A final fallback-path probe confirmed
that the generic legacy no-provider path summarizes arbitrary context fields;
the runtime integration therefore passes the same status-neutral clone to the
engine that it fingerprints. This keeps runtime output and stale comparison
aligned without changing the public `ExpertReasoningEngine` contract.

Focused behavioral regressions passed for every required workflow transition,
stale-state neutrality, status preservation, and fachlich sensitivity. The 26
fresh correction probes passed with zero failures. All affected architecture
tests, all 15 provider reasoning integration suites, and directly affected
inspection and persistence tests passed. The complete repository suite passed
192 of 192 top-level JavaScript test files with zero failures.

The final worktree still contains exactly the two modified tracked files and
four untracked files listed in section 3. Nothing is staged, and no temporary
probe or generated artifact remains.

## 18. Review decision

READY FOR PRODUCTIZATION 1.0-B1 FINAL STATUS-NEUTRALITY REVIEW

## 19. Final independent status-neutrality review

The final independent review verified that inspection workflow status is
excluded only from the cloned fachlich projection used for reasoning execution
and stale fingerprinting. The persisted `runtimeInput` retains
`context.inspectionStatus`, and `sourceSnapshot.inspection.status` retains the
same workflow value for audit history. No generic status stripping exists.

Status-only transitions from `draft` to `completed`, `scheduled` to
`in_progress`, and `completed` to `reopened` leave provider selection,
reasoning output, source fingerprint, and stale state unchanged. Combining a
status transition with an individual `scheduledAt`, `startedAt`, or
`completedAt` change remains neutral. The generic legacy fallback receives the
same status-neutral input that is fingerprinted, so its output remains aligned
with stale comparison.

Technical evidence and finding statuses remain present in the governed source
projection and remain fingerprint-relevant. Answer, measurement, evidence
location, technical evidence date, and evidence-requirement changes remain
fingerprint-relevant. All earlier evidence-requirement, provider-identity,
malformed-history, operational-timestamp, technical-evidence, source-snapshot,
first-success, and no-aggregation corrections remain effective.

Twenty-eight fresh independent probes passed with zero failures. The focused
runtime-manager and InspectionPage tests passed. Expert Reasoning, router, Risk
Relevance registry, Internal Model, and Interpretation Model tests passed. All
15 provider reasoning integration suites and the directly affected inspection
and persistence suites passed. The complete repository suite passed 192 of 192
top-level JavaScript test files with zero failures. Syntax validation and
`git diff --check` passed.

The final worktree contains exactly the two modified tracked files and four
untracked files listed in section 3. No file is staged. No temporary probe,
generated artifact, unrelated change, secret, credential, absolute local path,
or merge marker remains. Nothing was committed, tagged, or pushed during the
review.

## 20. Final decision

READY FOR PRODUCTIZATION 1.0-B1 COMMIT GATE
