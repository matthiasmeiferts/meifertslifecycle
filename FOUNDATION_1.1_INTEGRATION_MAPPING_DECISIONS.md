# Foundation 1.1 Integration Mapping Decisions

## 1. Purpose and Authority

This document records the mapping decisions that can be supported by the
released Foundation 1.1 contracts and the existing operational repository at
commit `c81fb3c4925f93b1fee785886a3bb78a580e862e`.

It supplements, and does not replace or weaken,
`FOUNDATION_1.1_INTEGRATION_BOUNDARY_ARCHITECTURE.md`. Where this document
records an unresolved question, no implementation may invent an answer.

This is a documentation-only architecture decision. It does not implement or
approve an adapter, mapper, validator, persistence mechanism, migration,
workflow, report integration, export integration, or user interface. It does
not assign a release number.

The decision concerns the released chain:

`Case -> Session -> Area -> Observation -> Evidence -> Finding -> Assessment -> Recommendation -> Decision -> Report`

## 2. Immutable Starting Rules

1. A1-A10 are authoritative for professional domain content.
2. Managers, Workspace, Runtime, and Storage are authoritative for operational
   state only.
3. Status, review, authorization, workflow, finalization, and export remain
   outside Foundation records.
4. There is no universal mapper.
5. There is no heuristic field or identifier mapping.
6. A projection must reject ambiguity.
7. Existing manager data is not automatically a valid Foundation record.
8. A1-A10 must not be changed to make existing manager contracts easier to
   map.

Operational fields may be retained as external sidecar data. They must not be
copied into, used to extend, or used to reinterpret a Foundation record.

## 3. Decision Model

Every mapping question in this document uses exactly one decision class:

| Class | Meaning |
| --- | --- |
| `APPROVED` | Professional equivalence is supported by the released contracts and repository evidence. |
| `CONDITIONALLY APPROVED` | Mapping is permitted only when every stated precondition is independently established. |
| `REJECTED` | Mapping is professionally or structurally impermissible. |
| `UNRESOLVED` | The repository contains insufficient professional evidence for a decision. |

Technical name similarity is never sufficient for `APPROVED`.

## 4. Entity Source Decision Matrix

| Foundation entity | Candidate operational source | Decision | Preconditions or reason |
| --- | --- | --- | --- |
| `InspectionCase` | `CaseManager` record | `CONDITIONALLY APPROVED` | The record may be a source only when entity identity, stable `id`, original `createdAt`, and explicit professional values for `inspectionType` and any `propertyReference` are available. `CaseManager.type` is not automatically `inspectionType`. |
| `InspectionSession` | `InspectionManager` record | `UNRESOLVED` | The repository does not establish that one Inspection is one Foundation Session, does not provide the required `caseId`, and does not define inspection-to-session cardinality. |
| `InspectionArea` | No authoritative source identified | `UNRESOLVED` | No operational Area entity with the released identity, parent, name, and timestamp contract was found. Free location text and catalog concepts are insufficient. |
| `InspectionObservation` | No authoritative source identified | `UNRESOLVED` | Answers, question context, findings, and assessments are not established as Observation records. Text without provenance is insufficient. |
| `InspectionEvidence` | `EvidenceManager` record | `CONDITIONALLY APPROVED` | Entity identity and stable ID may be usable, but the required `observationId` and professional `reference` provenance must be explicitly supplied and proven. |
| `InspectionFinding` | `FindingManager` record | `CONDITIONALLY APPROVED` | Entity identity, ordered canonical `evidenceIds`, professional `description`, stable ID, and timestamp provenance must be proven. Operational severity, status, review, and source traces remain sidecars. |
| `InspectionAssessment` | `AssessmentManager` record | `CONDITIONALLY APPROVED` | The source is usable only after one authoritative `findingId` and one professional `assessment` value are explicitly identified. Existing relationship arrays and `description` do not establish either automatically. |
| `InspectionRecommendation` | `RecommendationManager` record | `CONDITIONALLY APPROVED` | The source is usable only after one authoritative `assessmentId` and one professional `recommendation` value are explicitly identified. `description` and `action` are competing candidates. |
| `InspectionDecision` | `DecisionManager` record | `CONDITIONALLY APPROVED` | The singular `recommendationId` is structurally useful, but professional `decision`, ID provenance, and timestamp provenance remain mandatory. Decision type, rationale, approval, and risk fields remain operational. |
| `InspectionReport` | `ReportManager` record | `CONDITIONALLY APPROVED` | Entity identity alone is insufficient. One authoritative `decisionId`, one professional `report` value, Foundation version handling, ID provenance, and timestamp provenance must be proven. Existing assembled report contracts are not automatically the Foundation report contract. |

### 4.1 Explicitly Rejected Entity Derivations

| Proposed derivation | Decision | Reason |
| --- | --- | --- |
| Area from free-form location text | `REJECTED` | It invents canonical identity and Session parentage. |
| Area from question groups or catalogs without an approved contract | `REJECTED` | Classification or presentation grouping does not prove entity identity. |
| Area reconstructed from Findings | `REJECTED` | It reverses the governed parent chain and invents missing records. |
| Observation from Finding or Assessment | `REJECTED` | Derived professional interpretation is not observed source content. |
| Every answer or question context treated as an Observation | `REJECTED` | The repository defines no universal equivalence or provenance rule. |
| Existing manager record treated directly as a Foundation record | `REJECTED` | Manager records contain different schemas and operational responsibilities. |

## 5. Canonical ID Decision Matrix

The generic manager field `id` may be used only when entity identity is
confirmed, the ID is stable and persistent, the ID is not regenerated by the
projection, its namespace is unambiguous, and provenance survives roundtrip.
Otherwise projection must reject with missing ID provenance.

| Foundation ID | Candidate source | Decision | Namespace and mapping decision |
| --- | --- | --- | --- |
| `caseId` | `CaseManager.id` | `CONDITIONALLY APPROVED` | Direct value reuse is allowed only with proven Case identity and stable persistent provenance. Otherwise separate external mapping information is required. |
| `sessionId` | `InspectionManager.id` | `UNRESOLVED` | Session entity identity is unresolved; no ID decision can precede it. |
| `areaId` | None | `UNRESOLVED` | No authoritative entity or ID source exists. |
| `observationId` | None | `UNRESOLVED` | No authoritative entity or ID source exists. |
| `evidenceId` | `EvidenceManager.id` | `CONDITIONALLY APPROVED` | Reuse requires proven Evidence identity, stability, persistence, namespace isolation, and retained provenance. |
| `findingId` | `FindingManager.id` | `CONDITIONALLY APPROVED` | Same preconditions apply; generated or context-dependent IDs are not acceptable without preserved provenance. |
| `assessmentId` | `AssessmentManager.id` | `CONDITIONALLY APPROVED` | Same preconditions apply. |
| `recommendationId` | `RecommendationManager.id` | `CONDITIONALLY APPROVED` | Same preconditions apply. |
| `decisionId` | `DecisionManager.id` | `CONDITIONALLY APPROVED` | Same preconditions apply. |
| `reportId` | `ReportManager.id` | `CONDITIONALLY APPROVED` | Same preconditions apply and must not be confused with IDs of assembled report artifacts. |

No namespace conversion is approved by this document. A separate external
mapping table is mandatory whenever the generic source ID cannot itself prove
canonical identity. Missing provenance requires rejection; it must not trigger
ID generation.

## 6. Parent and Cardinality Decision Matrix

| Foundation relation | Operational source and cardinality | Foundation cardinality | Decision | Mapping and rejection rule |
| --- | --- | --- | --- | --- |
| Session -> Case | `InspectionManager` has no canonical `caseId` | Exactly one | `UNRESOLVED` | No mapping is available. Missing or inferred Case parent must be rejected. |
| Area -> Session | No authoritative Area source | Exactly one | `UNRESOLVED` | No mapping is available. Location or collection membership must not create the parent. |
| Observation -> Area | No authoritative Observation source | Exactly one | `UNRESOLVED` | No mapping is available. Question or Finding context must not create the parent. |
| Evidence -> Observation | Evidence has Case, Building, and optional Inspection references but no `observationId` | Exactly one | `UNRESOLVED` | Existing references are not substitutes. Projection requires an explicit, provenance-bearing Observation parent. |
| Finding -> Evidence[] | `evidenceIds` and `sourceEvidenceIds`, both arrays | One or more ordered IDs | `CONDITIONALLY APPROVED` | Use only one explicitly authoritative ordered relation. If arrays disagree, contain unknown IDs, or order provenance is absent, reject. `sourceEvidenceIds` remains trace data unless explicitly approved as authority. |
| Assessment -> Finding | `findingIds` and `sourceFindingIds`, both arrays | Exactly one | `UNRESOLVED` | Silent first-item selection is rejected. Mapping requires one explicitly authoritative parent rule; zero, multiple, or disagreeing candidates require rejection. |
| Recommendation -> Assessment | `assessmentIds` and `sourceAssessmentIds`, both arrays | Exactly one | `UNRESOLVED` | Silent first-item selection is rejected. Mapping requires one explicitly authoritative parent rule. |
| Decision -> Recommendation | Singular `recommendationId`, plus `recommendationIds` and `sourceRecommendationIds` | Exactly one | `CONDITIONALLY APPROVED` | The singular field may be used only when provenance is confirmed and arrays do not contradict it. Missing, multiple, or conflicting candidates require rejection. |
| Report -> Decision | `decisionIds` and `sourceDecisionIds`, both arrays | Exactly one | `UNRESOLVED` | No singular authority exists. Silent selection is rejected; a separately confirmed parent rule is required. |

Additional Case, Building, Inspection, upstream, and `source*Ids` references
remain operational trace data. They must not be inserted into a Foundation
record. Multiple possible parents produce rejection unless one authoritative
reference is established by a separately approved mapping rule.

## 7. Professional Content Decision Matrix

| Foundation field | Candidate manager source | Decision | Required treatment |
| --- | --- | --- | --- |
| `InspectionEvidence.reference` | `EvidenceManager.fileReference` or other file metadata | `UNRESOLVED` | File location and professional Evidence reference are not proven equivalent. No conversion is permitted without explicit provenance and losslessness. |
| `InspectionFinding.description` | `FindingManager.description` | `APPROVED` | The direct string value may be projected without normalization when the record is confirmed as the same Finding. Empty or invalid content must be rejected by the Foundation boundary. |
| `InspectionAssessment.assessment` | `AssessmentManager.description` | `UNRESOLVED` | The repository does not establish that the general description is the governed assessment statement. Risk fields must not be used to construct it. |
| `InspectionRecommendation.recommendation` | `RecommendationManager.description` or `action` | `UNRESOLVED` | Two professionally plausible fields exist. Neither may be selected, concatenated, or preferred heuristically. |
| `InspectionDecision.decision` | `DecisionManager.description`, `rationale`, or `decisionType` | `UNRESOLVED` | Description, rationale, and operational decision vocabulary have different semantics. No inference or composition is approved. |
| `InspectionReport.report` | `ReportManager` summaries, sections, structured arrays, or assembled report | `UNRESOLVED` | No single lossless professional report value is identified. Summary or section serialization is rejected without a separately approved contract. |

The following automatic equalities are `REJECTED`:

- `fileReference = reference`;
- `description = assessment`;
- `description = recommendation`;
- `action = recommendation`;
- `description = decision`;
- `rationale = decision`;
- `decisionType = decision`; and
- a Summary or collection of Sections equals `report`.

These rejections prohibit automatic mapping. They do not prevent a later
professional contract from explicitly establishing one supported source.

## 8. Timestamp Provenance Matrix

| Timestamp question | Decision | Rule |
| --- | --- | --- |
| Use an existing `Manager.createdAt` | `CONDITIONALLY APPROVED` | Allowed only when it is the original creation timestamp of the same professional entity, is canonical for the Foundation timestamp contract, and provenance is testably retained. |
| Generate missing Foundation `createdAt` during projection | `REJECTED` | Projection must reject instead. |
| Replace or normalize `createdAt` during storage or rehydration | `REJECTED` | Exact value must survive lossless roundtrip. |
| Use `updatedAt` as Foundation `createdAt` | `REJECTED` | Update metadata has different semantics. |
| Include `updatedAt` in a Foundation record | `REJECTED` | It is operational sidecar data and outside all A1-A10 contracts. |
| Use an automatically regenerated manager timestamp | `REJECTED` | Regeneration destroys provenance and determinism. |
| Preserve an original timestamp through a technical envelope | `CONDITIONALLY APPROVED` | The envelope must keep technical timestamps separate and preserve the canonical record value byte-for-byte at the logical string level. |
| Missing or unprovable timestamp provenance | `CONDITIONALLY APPROVED` | Only manual or external clarification may make the record projectable; until then projection must reject. |

No Foundation `createdAt` may be created, replaced, defaulted, or normalized
during projection, storage, or rehydration.

## 9. Version Compatibility Matrix

| Version question | Decision | Rule |
| --- | --- | --- |
| Released Foundation record version is exactly `1.0` | `APPROVED` | The applicable A1-A10 model owns this value. |
| Manager version `1.0.0` equals Foundation version `1.0` | `REJECTED` | Format similarity does not prove semantic equivalence. |
| Use an operational version to populate Foundation `version` | `REJECTED` | Foundation version comes only from the released Foundation contract. |
| Ignore unrelated operational version during projection | `CONDITIONALLY APPROVED` | Allowed only when the operational field versions a different artifact and is retained outside the Foundation record where needed. |
| Explicit future version translation | `UNRESOLVED` | Requires a separately approved compatibility decision. |
| Conflicting value presented as Foundation contract version | `REJECTED` | Projection or rehydration must reject with `VERSION_CONFLICT`. |

## 10. Legacy Classification Matrix

Existing manager and storage records are legacy relative to Foundation 1.1
until classified under this matrix.

| Legacy class | Decision | Classification rule | Permitted treatment |
| --- | --- | --- | --- |
| `LEGACY_COMPATIBLE` | `APPROVED` | Every required professional field, canonical ID, direct parent, version, timestamp, and provenance is unambiguous and passes the applicable Foundation validation. | Named read-only projection may be considered. |
| `LEGACY_CONDITIONALLY_PROJECTABLE` | `CONDITIONALLY APPROVED` | The record becomes unambiguous only with confirmed external mapping information that is retained and testable. | Project only with that information; otherwise reject. |
| `LEGACY_INCOMPATIBLE` | `REJECTED` | Required content or relation is absent, invalid, non-lossless, or would need invention. | Report incompatibility; do not repair or migrate automatically. |
| `LEGACY_AMBIGUOUS` | `UNRESOLVED` | More than one professionally plausible entity, content source, identifier, or parent exists. | Require explicit manual or architecture clarification; do not select. |

Legacy handling must not perform automatic repair, automatic migration,
default insertion, parent invention, missing Area or Observation
reconstruction, or conversion of operational fields into professional
content.

## 11. Projection Rejection Matrix

These names are documentary classifications, not implemented Runtime errors
or a public API.

| Classification | Meaning | Mapping phase | Mandatory rejection? | Later manual clarification possible? | Decision |
| --- | --- | --- | --- | --- | --- |
| `ENTITY_SOURCE_UNCONFIRMED` | Candidate record is not proven to represent the Foundation entity. | Source selection | Yes | Yes | `APPROVED` |
| `ID_PROVENANCE_MISSING` | Canonical ID origin, stability, persistence, or namespace cannot be proven. | Identifier mapping | Yes | Yes | `APPROVED` |
| `PARENT_REFERENCE_MISSING` | Required direct parent reference is absent. | Relation mapping | Yes | Sometimes, with authoritative evidence | `APPROVED` |
| `PARENT_REFERENCE_AMBIGUOUS` | More than one possible direct parent exists. | Relation mapping | Yes | Yes | `APPROVED` |
| `CARDINALITY_CONFLICT` | Operational and Foundation cardinalities cannot be reconciled by an approved rule. | Relation mapping | Yes | Yes | `APPROVED` |
| `PROFESSIONAL_CONTENT_MISSING` | Required governed content is absent. | Content mapping | Yes | Only if original content is supplied with provenance | `APPROVED` |
| `PROFESSIONAL_CONTENT_AMBIGUOUS` | Multiple plausible content sources exist. | Content mapping | Yes | Yes | `APPROVED` |
| `TIMESTAMP_PROVENANCE_MISSING` | The original professional creation timestamp is not proven. | Timestamp mapping | Yes | Yes | `APPROVED` |
| `VERSION_CONFLICT` | A value conflicts with the released Foundation version contract. | Projection or rehydration | Yes | Only through a later compatibility decision | `APPROVED` |
| `LEGACY_RECORD_INCOMPATIBLE` | Legacy data cannot satisfy the Foundation contract without invention or loss. | Legacy classification | Yes | Possibly through separately approved migration evidence | `APPROVED` |
| `NON_LOSSLESS_MAPPING` | Values, order, optionality, or provenance would not survive mapping or roundtrip. | Projection or persistence | Yes | Only after the mapping contract changes | `APPROVED` |
| `BROKEN_FOUNDATION_CHAIN` | A present Foundation record references a missing, invalid, or different parent. | Chain validation | Yes for the broken link; valid earlier partial chain remains distinguishable | Yes | `APPROVED` |

Absence of a later optional chain step is not an error and must not be
classified as `BROKEN_FOUNDATION_CHAIN`.

## 12. Operational Sidecar Decision Matrix

| Data category | Decision | Treatment |
| --- | --- | --- |
| Status and workflow state | `REJECTED` | Must not enter Foundation records. |
| Review status, reviewer, and review history | `REJECTED` | Must remain in review/governance sidecars. |
| Approval and authorization | `REJECTED` | Must remain in governance layers. |
| Finalization, lock, release, and export state | `REJECTED` | Must remain downstream operational state. |
| `updatedAt`, creator, updater, storage timestamps | `REJECTED` | Technical metadata remains outside canonical records. |
| Severity, priority, probability, risk, confidence | `REJECTED` | Must not be converted into A1-A10 professional content. |
| Additional Case, Building, and Inspection references | `CONDITIONALLY APPROVED` | May remain external trace sidecars but must not extend Foundation records or substitute for canonical parents. |
| Technical persistence envelope | `CONDITIONALLY APPROVED` | Requires a separate lossless persistence contract and must remain outside record data. |

## 13. Resolution of the Twelve Readiness Questions

| Open question | Decision | Resolution |
| --- | --- | --- |
| Is an Inspection a Foundation Session? | `UNRESOLVED` | Repository evidence is insufficient. |
| Where do `caseId`, `areaId`, and `observationId` originate? | `UNRESOLVED` | `caseId` is conditionally available for Case, but Session, Area, Observation, and Evidence parent provenance is not established. |
| What represents Area and Observation operationally? | `UNRESOLVED` | No authoritative entities were identified. |
| Are generic manager IDs canonical IDs? | `CONDITIONALLY APPROVED` | Only with entity identity, stable persistence, namespace isolation, and retained provenance. |
| How is a singular parent selected from arrays? | `REJECTED` | Silent selection is forbidden; an explicit authoritative parent rule is required. |
| Is `fileReference` the Foundation Evidence `reference`? | `UNRESOLVED` | Semantic equivalence is not established. |
| Which fields map `assessment`, `recommendation`, `decision`, and `report`? | `UNRESOLVED` | No unique professional source is established for any of them. |
| Which creation timestamp is authoritative? | `CONDITIONALLY APPROVED` | Only the proven original creation timestamp of the same entity may be retained. Missing provenance requires rejection. |
| How do primary relation arrays and `source*Ids` differ? | `UNRESOLVED` | `source*Ids` remain operational trace data unless separately approved as authority. |
| How are incompatible legacy records handled? | `APPROVED` | Classify and reject without repair, migration, defaults, or invented parents/content. |
| What happens for partial, broken, ambiguous, or non-lossless chains? | `APPROVED` | Preserve distinct states and apply the rejection classifications in this document; later absence is not a broken chain. |
| How is the report version conflict handled? | `APPROVED` | Operational `1.0.0` is not Foundation `1.0`; do not convert it. Use only the released Foundation contract version or reject a conflicting Foundation claim. |

## 14. Implementation Gate

This table evaluates architectural eligibility only. Any implementation still
requires a separately approved task defining public contracts, inputs,
outputs, diagnostics, immutability, and tests.

| Candidate | Preconditions met? | Remaining blockers | Permitted scope | Prohibited scope | Implement now? | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| Read-only Foundation Chain Validator | Yes for already valid A1-A10 records | Public status vocabulary, supported collection input, duplicate and ordering contract still require task approval | Validate released records and explicit parent references; distinguish valid partial chains | Workspace mapping, persistence, repair, migration, workflow, status mutation | **YES**, after an explicit implementation contract | `CONDITIONALLY APPROVED` |
| Workspace-to-Foundation Projection | No | Session identity; Area and Observation sources; Evidence reference; several parent and content mappings; ID and timestamp provenance | None until the named entity mapping is approved | Heuristics, defaults, universal mapping, silent parent selection | **NO** | `UNRESOLVED` |
| Foundation Persistence Representation | Partly | Envelope, namespace, duplicate handling, stored ordering, technical metadata separation, and exact representation are unspecified | Requirements analysis only | Storage implementation or claiming roundtrip guarantees | **NO** | `UNRESOLVED` |
| Foundation Rehydration | Partly | Depends on the persistence representation and envelope contract | Requirements analysis only; released model validation remains mandatory | Direct trust of stored shapes, defaults, normalization | **NO** | `UNRESOLVED` |
| Legacy Migration | No | Source mappings, parent rules, content mappings, IDs, timestamps, and migration governance are unresolved | Read-only classification only | Automatic migration, repair, overwrite, invented records | **NO** | `REJECTED` |
| Report Assembly Integration | No | Foundation Report content and parent mapping are unresolved; assembled-report contract is distinct | None until an explicit Report mapping is approved | Treating ReportManager or assembled report as Foundation Report by similarity | **NO** | `UNRESOLVED` |

The first technically admissible candidate is therefore a read-only validator
that consumes already-created Foundation records. It must not project legacy
or workspace data and must not own workflow, persistence, or repair.

## 15. Readiness Reassessment

| Dimension | Readiness | Basis |
| --- | ---: | --- |
| Entity Readiness | 55% | Case and Evidence-to-Report managers are conditional candidates; Session, Area, and Observation remain unresolved. |
| ID Readiness | 58% | Preconditions are explicit, but no operational ID currently proves all required provenance and namespace conditions. |
| Parent Readiness | 43% | Finding and Decision have conditional paths; the early chain and several singular-versus-array relations remain blocked. |
| Content Readiness | 35% | Finding description is approved; Evidence, Assessment, Recommendation, Decision, and Report content remain unresolved. |
| Timestamp Readiness | 75% | The preservation and rejection rules are clear; existing record provenance is not generally proven. |
| Persistence Readiness | 45% | Lossless invariants are established, but envelope, namespace, duplicate, and representation contracts remain open. |
| Legacy Readiness | 70% | Classification and rejection behavior are clear; actual projection and migration mappings are not. |
| **Overall Readiness** | **54%** | Decisions prevent unsafe inference, but unresolved source, parent, and content semantics still block workspace projection and persistence integration. |

The lower overall score compared with a general architecture-readiness view is
intentional: this assessment measures readiness for concrete mapping and
roundtrip implementation, not merely clarity of architectural boundaries.

## 16. Remaining Unresolved Decisions

The following are implementation blockers:

1. Session-to-Inspection entity identity and cardinality.
2. An authoritative Area entity and source contract.
3. An authoritative Observation entity and source contract.
4. Evidence-to-Observation parent provenance.
5. Evidence `reference` professional semantics.
6. Assessment singular Finding parent and professional content source.
7. Recommendation singular Assessment parent and professional content source.
8. Decision professional content source.
9. Report singular Decision parent and professional content source.
10. Authority rules between primary relationship arrays and `source*Ids`.
11. Persistence envelope, namespace, duplicate, and ordering contracts.
12. Provenance evidence for generic IDs and manager-generated timestamps.

These unresolved points do not weaken this decision. They are explicit gates
that prevent uncertainty from becoming implementation behavior.

## 17. Non-Goals

This document contains no:

- production code;
- tests;
- adapter or mapper;
- validator implementation;
- migration;
- persistence implementation;
- workflow or State Machine;
- progress engine;
- report assembly or export integration;
- UI integration;
- change to A1-A10;
- new Foundation field; or
- new release designation.

## 18. Change Conditions

A later decision may change an `UNRESOLVED` or `CONDITIONALLY APPROVED` entry
only with explicit professional evidence, a named supported source contract,
deterministic rejection behavior, and tests proving provenance and
losslessness. A technical naming similarity, convenient existing field, or
current UI behavior is insufficient.

Any later implementation must preserve the authority, dependency, sidecar,
legacy, partial-chain, and roundtrip boundaries established by
`FOUNDATION_1.1_INTEGRATION_BOUNDARY_ARCHITECTURE.md`.
