# MEIFERTS Building Intelligence
# Foundation 1.1 Planning

Date: 2026-07-07  
Base Branch: foundation-release-1.0  
Baseline: Foundation Release 1.0

## Strategic Direction

Foundation 1.1 should not expand the public website.

The next development step should strengthen the Professional Workspace as a usable evidence-first decision environment.

The priority is to move from controlled demo workflow toward practical pilot usability.

## Recommended Foundation 1.1 Scope

### Primary Objective

Build the first controlled Evidence Upload Workflow and harden the Report Output path.

The goal is to make the following chain more practical:

Case → Building → Inspection → Evidence → Finding → Assessment → Recommendation → Decision → Report

## Workstream 1: Evidence Upload Workflow

### Purpose

Allow the workspace to handle real inspection evidence more credibly.

### Target Capabilities

- Add evidence records with structured metadata
- Attach or simulate file references
- Support photo, document, note and measurement evidence types
- Link evidence to active case, building and inspection
- Preserve evidence confidence and expert review status
- Display evidence traceability in downstream workflow stages

### Expected User Flow

1. User opens an active case
2. User opens Evidence Workspace
3. User adds evidence
4. User assigns evidence type
5. User links evidence to building system or inspection requirement
6. Evidence becomes available for findings
7. Findings can be created from selected evidence
8. Report output references evidence traceability

### Out of Scope for Foundation 1.1

- Real cloud file storage
- User authentication
- Multi-user permissions
- Production document management
- External database integration

## Workstream 2: Report Output Hardening

### Purpose

Make the report workspace more credible as a controlled professional output.

### Target Capabilities

- Strengthen report readiness logic
- Improve draft report structure
- Ensure every report section stays linked to evidence, findings, assessments, recommendations and decisions
- Add stronger expert review language
- Avoid automatic final report claims
- Prepare future PDF export structure

### Expected Report Sections

- Executive Summary
- Property / Building Context
- Evidence Basis
- Findings Summary
- Assessment Summary
- Technical Risk Summary
- CAPEX / Lifecycle Notes
- Recommendation Logic
- Decision Support
- Limitations
- Expert Review Status

## Workstream 3: Traceability Layer

### Purpose

Make the system visibly evidence-first.

### Target Capabilities

- Show source links between workflow stages
- Preserve caseId, buildingId and inspectionId
- Surface missing evidence warnings
- Mark findings without sufficient evidence
- Mark recommendations that require expert review
- Keep final report statements traceable to underlying records

## Workstream 4: Public Website Holding Position

### Purpose

Avoid unnecessary public website expansion during Foundation 1.1.

### Rule

The public website remains in audited Foundation Release 1.0 alignment.

Only small corrections are allowed if they protect accuracy, legal clarity or release consistency.

## Proposed Foundation 1.1 Milestones

### 1.1-A Evidence Upload Model

Define evidence data fields and local storage behavior.

### 1.1-B Evidence Form and UI

Add or improve evidence creation and editing workflow.

### 1.1-C Evidence-to-Finding Bridge

Allow selected evidence to generate or support a finding.

### 1.1-D Traceability Review

Display source linkage across Evidence, Findings, Assessments, Recommendations, Decisions and Reports.

### 1.1-E Report Output Hardening

Improve report readiness, report sections and expert review safeguards.

### 1.1-F Browser Audit and Release Notes

Run syntax checks, core tests, browser audit and create release notes.

## Success Criteria

Foundation 1.1 is successful when:

- Realistic evidence records can be created in the workspace
- Evidence can be linked to case, building and inspection context
- Findings can reference evidence
- Reports clearly show evidence basis and expert review status
- No automatic purchase recommendation or final expert opinion is created
- Workspace tests remain green
- Public website remains consistent with actual system state

## Release Principle

Foundation 1.1 should deepen the professional workflow, not inflate public claims.

The system must remain evidence-first, expert-led and decision-support oriented.
