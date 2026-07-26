# Foundation 1.1 Integration Boundary Architecture

## 1. Purpose and Authority

This document defines the architecture boundary between the released
Foundation 1.1 Inspection Domain Records and the existing mutable workspace,
manager, runtime, governance, and persistence architecture.

It records an architecture decision only. It does not implement an adapter,
validator, persistence mechanism, migration, workflow, report integration, or
user interface. It does not assign a new Foundation or Productization release
number.

The decision applies to the released Foundation 1.1 chain:

`Case -> Session -> Area -> Observation -> Evidence -> Finding -> Assessment -> Recommendation -> Decision -> Report`

The existing A1-A10 public contracts remain unchanged.

## 2. Architectural Layers

### 2.1 Foundation Domain Records

The A1-A10 domain models are the canonical professional contract layer for
governed Inspection domain content. Their validated records are the
authoritative representation of that content.

The Foundation Domain Records MUST remain:

- immutable;
- deterministic;
- persistence-free;
- workflow-free;
- review-free;
- authorization-free;
- runtime-free; and
- independent of workspace managers and storage.

The Foundation models MUST NOT import workspace, runtime, manager, workflow,
review, authorization, reporting, export, or storage components.

### 2.2 Operational Architecture

Workspace, manager, runtime, governance, and storage components remain
authoritative for operational process information, including:

- workflow and editing status;
- review state and reviewer activity;
- approval and authorization state;
- progress and workspace state;
- locks, release state, and publication state;
- technical persistence metadata; and
- UI selection and navigation state.

Operational information MUST NOT be added to A1-A10 records. Operational
records are not a second authoritative representation of Foundation domain
content.

## 3. Source-of-Truth Rule

A valid Foundation record is authoritative for the professional domain fields
defined by its released contract. Operational records are authoritative only
for their separately governed process and technical state.

Existing workspace and manager records do not automatically become Foundation
records. Similar field names, related subject matter, or current UI use do not
establish contract equivalence.

Where both representations exist, the integration boundary MUST preserve this
separation:

| Concern | Authority |
| --- | --- |
| Released Foundation domain content | Valid A1-A10 Foundation record |
| Workflow, editing, and progress state | Existing operational layer |
| Review and professional governance state | Existing review and governance layers |
| Authorization, locking, release, and publication | Existing governance layers |
| Storage envelopes and technical persistence metadata | Persistence layer |
| UI selection, navigation, and presentation state | Workspace layer |

There MUST NOT be an undecided duplicate source of truth for professional
domain content.

## 4. Dependency Direction

The permitted dependency direction is:

```text
Workspace / Runtime / Persistence
                |
                v
Explicit Integration Boundary
                |
                v
Foundation Domain Records
```

The reverse direction is forbidden. Foundation Domain Records MUST NOT depend
on workspace, runtime, persistence, managers, review, or governance.

An operational consumer MAY invoke a released Foundation model through an
explicit integration component. It MUST NOT duplicate Foundation validation or
silently reinterpret a Foundation field.

## 5. Explicit Adapter Boundaries

Later integration must distinguish at least these operations:

1. **Workspace Record to Foundation Projection** — an explicit, read-only
   projection from a supported operational contract into the creation input of
   one named Foundation model.
2. **Foundation Record to Persistence Representation** — a lossless technical
   representation of one already validated Foundation record.
3. **Persistence Representation to Foundation Rehydration** — reconstruction
   through the applicable Foundation model's released validation boundary.

These operations MUST NOT be collapsed into a universal implicit mapper.
Automatic field derivation, heuristic conversion, position-based mapping, and
name-similarity mapping are forbidden.

Each later adapter requires its own explicit input contract, output contract,
failure model, dependency audit, and focused tests.

## 6. Identifier Rule

The canonical Foundation identifiers are:

- `caseId`;
- `sessionId`;
- `areaId`;
- `observationId`;
- `evidenceId`;
- `findingId`;
- `assessmentId`;
- `recommendationId`;
- `decisionId`; and
- `reportId`.

Generic operational fields such as `id` MUST NOT be treated as equivalent
without an explicit mapping contract. Every identifier mapping must be:

- explicit;
- deterministic;
- testable;
- owned outside A1-A10; and
- reported as unsupported when its required source value is unavailable.

No identifier may be inferred from collection order, field position, object
position, naming similarity, timestamps, titles, or content.

## 7. Parent and Graph Integrity

Each released Foundation model validates only its own record. It does not load,
resolve, or prove the existence of its parent.

A later, separate integration component may validate this reverse parent
chain:

```text
Report -> Decision -> Recommendation -> Assessment
       -> Finding -> Evidence -> Observation
       -> Area -> Session -> Case
```

Graph validation MUST NOT be inserted into A1-A10. It MUST NOT be added
silently to an existing manager, `InspectionPipelineEngine`, or
`PipelineIntegrityValidator` because those components implement different
contracts today.

## 8. Operational Sidecar Data

The following information remains external sidecar or governance data:

- `status` and `state`;
- review state, reviewer identity, and review history;
- approval and approver data;
- authorization data;
- lock state;
- release and publication state; and
- workflow history.

Sidecar data MAY refer to a Foundation record through an explicitly mapped
canonical identifier. It MUST NOT mutate, extend, normalize, or replace the
Foundation record.

## 9. Persistence and Roundtrip

Any later Foundation persistence boundary must provide a lossless roundtrip:

- identical field values;
- identical canonical field order;
- no added defaults;
- no removed fields;
- no normalization;
- no automatic identifier generation;
- no automatic timestamp generation or replacement;
- rehydration through the applicable released Domain Model; and
- a detached, recursively frozen rehydrated result.

A stored object is not valid merely because it resembles a Foundation record.
Rehydration must cross the applicable Foundation validation boundary.

Technical envelope fields and operational timestamps must remain outside the
Foundation record. The future persistence contract must define how record data
is separated from its technical envelope before implementation is approved.

## 10. Legacy Data

Existing manager and storage data is legacy relative to the new Foundation
contract unless and until a specific compatibility mapping is approved.

The following are initially permitted:

- read-only analysis;
- explicit legacy classification;
- controlled, named projection;
- documented mapping failures; and
- a separately approved later migration.

The following are forbidden:

- automatic migration;
- heuristic field matching;
- silent overwriting;
- treating an operational record as a valid Foundation record without
  validation; and
- claiming losslessness without roundtrip tests.

## 11. Partial Chains and Failure Classes

Partial Inspection chains are valid. The absence of a later step is not an
error. For example, a valid Case, Session, and Area may exist before an
Observation, and a valid Decision may exist before a Report.

A later integration boundary must distinguish at least:

1. valid complete chain;
2. valid partial chain;
3. later step not yet present;
4. broken parent reference;
5. invalid Foundation record;
6. incompatible legacy record; and
7. non-lossless mapping or roundtrip.

These states MUST NOT be collapsed into one generic invalid or missing state.
The precise public status vocabulary remains open until the applicable
integration contract is approved.

## 12. Foundation Contract Matrix

The table records only fields implemented by A1-A10. It does not authorize a
mapping.

| Model | Canonical ID | Direct parent | Professional content | Excluded operational responsibility | Possible existing manager | Observable contract difference |
| --- | --- | --- | --- | --- | --- | --- |
| `InspectionCaseDomainModel` | `caseId` | None | `title`, `inspectionType`, optional `propertyReference`, `createdAt` | Status, progress, persistence, UI selection | `CaseManager` | Manager uses generic `id`, operational references, status, progress, generated timestamps, storage, and mutable current-case state. Equivalence is open. |
| `InspectionSessionDomainModel` | `sessionId` | `caseId` | `createdAt` | Session workflow, runtime, persistence | `InspectionManager` is a possible contextual source only | Inspection Manager uses generic `id`, requires `buildingId`, has lifecycle status and generated timestamps. Whether an inspection is a Foundation session is open. |
| `InspectionAreaDomainModel` | `areaId` | `sessionId` | `name`, `createdAt` | Catalog mapping, workspace state, persistence | No equivalent manager identified | Existing inspection-area and catalog concepts are not an approved mapping. |
| `InspectionObservationDomainModel` | `observationId` | `areaId` | `text`, `createdAt` | Classification, finding generation, workflow | No equivalent manager identified | Existing answers, findings, and question context are not Observation records. Mapping source is open. |
| `InspectionEvidenceDomainModel` | `evidenceId` | `observationId` | `reference`, `createdAt` | Type, severity, review, storage, file workflow | `EvidenceManager` | Manager uses generic `id`, `caseId`, optional inspection relations, status, severity, metadata, CRUD, generated timestamps, and storage. It has no canonical `observationId` contract. |
| `InspectionFindingDomainModel` | `findingId` | `evidenceIds` (one or more) | `description`, `createdAt` | Severity, priority, review, transition state | `FindingManager` | Manager uses generic `id`, broad relationship arrays, status, severity, priority, CRUD, and persistence. Foundation permits only the governed evidence relation and content fields. |
| `InspectionAssessmentDomainModel` | `assessmentId` | `findingId` | `assessment`, `createdAt` | Risk score, severity, probability, review, workflow | `AssessmentManager` | Manager supports multiple relations, risk calculation, status transitions, generated fields, CRUD, and storage. Direct-parent and content mapping are open. |
| `InspectionRecommendationDomainModel` | `recommendationId` | `assessmentId` | `recommendation`, `createdAt` | Priority, timeframe, review, decision impact, workflow | `RecommendationManager` | Manager has status, priority, timeframe, multiple relationships, generation helpers, CRUD, and storage. No mapping is approved. |
| `InspectionDecisionDomainModel` | `decisionId` | `recommendationId` | `decision`, `createdAt` | Decision type ranking, approval, risk, review, authorization | `DecisionManager` | Manager has generic `id`, multiple upstream arrays, status, approval operations, risk and decision-type vocabularies, CRUD, and persistence. These remain operational or legacy data. |
| `InspectionReportDomainModel` | `reportId` | `decisionId` | `report`, `createdAt` | Assembly, sections, review, finalization, authorization, export | `ReportManager` | Manager has generic `id`, many source arrays, generated summaries, statuses, approvals, CRUD, and storage. Assembly reports are a separate governed contract. |

## 13. Existing Architecture Responsibilities

No change listed in this table is approved by this document.

| Component | Existing responsibility | Possible later integration role | Change currently approved? |
| --- | --- | --- | --- |
| `CaseManager` | Mutable case CRUD, current-case state, storage, events | Explicit Case projection source after mapping approval | No |
| `InspectionManager` | Mutable inspection CRUD and current-inspection state | Possible Session context source; equivalence remains open | No |
| Evidence-to-Report Managers | Mutable CRUD, relationships, status transitions, selection, storage | Individually named projection sources or operational sidecars | No |
| `CaseWorkflowProgressManager` | Read-only progress projection over existing manager collections and review gates | Later consumer of an approved Foundation integration read model | No |
| `InspectionPipelineEngine` | Question-to-report deterministic pipeline using existing generated contracts | Remains separate until explicit compatibility is defined | No |
| `PipelineIntegrityValidator` | Integrity checks for the existing pipeline result contract | Reference for validation patterns, not the A1-A10 validator | No |
| `ReviewQueueManager` | Collects review-relevant operational records | Sidecar review lookup by explicitly mapped Foundation ID | No |
| `ReviewResolutionManager` | Mutates operational review state and audit fields | Remains an operational governance service | No |
| `WorkflowValidationGateManager` | Evaluates review blockers for decision, report, and external use | Downstream consumer only after a governed mapping exists | No |
| `WorkspaceActionGovernanceManager` | Evaluates open, edit, delete, and downstream action state | Governs workspace actions without changing Foundation records | No |
| `ReportAssemblyEngine` | Assembles the existing immutable report contract and governed projection | Possible downstream consumer after Report mapping approval | No |
| `ReportOutputGovernanceManager` | Separates draft, final, and external output readiness | Operational report-governance sidecar | No |
| `ReportFinalizationLockManager` | Evaluates report locking and permitted report actions | Operational lock sidecar | No |
| `ReportFinalizationGate` | Pure eligibility decision for assembled reports | Remains downstream of report assembly | No |
| `ReportFinalizer` | Binds an eligible gate decision to report content | Remains downstream of the assembled-report contract | No |
| `StorageManager` | Mutable collection persistence in browser storage | Technical substrate only after an explicit Foundation envelope contract | No |
| `ExportWorkflowPreviewController` | Coordinates preview-only export preparation and authorization views | No Foundation integration role is approved | No |

The empty `portal/core/workflow/WorkflowManager.js` file does not establish a
canonical workflow or authorize a new orchestrator.

## 14. Non-Goals

This decision does not implement or approve:

- a Workflow Orchestrator;
- a new State Machine;
- a Transition Engine;
- a new Progress Engine;
- a Persistence Adapter;
- data migration;
- a Foundation Aggregate;
- a Graph Validator;
- Report Assembly integration;
- Export integration;
- UI integration;
- modification of A1-A10; or
- direct use of legacy manager data as Foundation records.

## 15. Open Architecture Questions

Before implementation, the applicable readiness work must resolve:

- the exact supported workspace input contract for each projection;
- whether each mapping is total or intentionally partial;
- the status and diagnostic vocabulary for mapping failures;
- the technical persistence envelope and namespace;
- duplicate identifier and duplicate record handling;
- ordering rules for collections and partial chains;
- legacy classification criteria;
- whether an adapter may project one record at a time or requires an explicit
  caller-supplied relation context;
- how optional `propertyReference` is preserved; and
- how Finding's ordered `evidenceIds` relation is checked without introducing
  aggregation or manager ownership.

No answer is implied by this document where the repository does not yet define
one.

## 16. Recommended Implementation Sequence

The provisional architecture sequence is:

1. Integration Contract Readiness;
2. explicit ID and contract-mapping specification;
3. read-only Foundation Chain Validator;
4. Foundation Persistence Roundtrip Boundary;
5. controlled Workspace projection; and
6. only then workflow, progress, or reporting integration.

This is an architecture dependency order, not an already named release
roadmap. It does not assign a Foundation, Productization, Runtime, Workspace,
Persistence, or Reporting milestone number.

## 17. Change Conditions

Implementation may begin only after an explicitly approved task defines the
specific boundary, public API, supported inputs, outputs, diagnostics,
immutability contract, and tests for that step.

Any proposal to change A1-A10, treat manager data as automatically equivalent,
introduce reverse dependencies, combine adapter responsibilities, or bypass
review, authorization, report, finalization, or export governance requires a
new explicit architecture decision.
