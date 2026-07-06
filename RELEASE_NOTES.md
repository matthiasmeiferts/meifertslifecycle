# Release Notes v1.0-rc1

This release candidate focuses on Go-live readiness for the existing repository.

## Release Goal

Publish a professional public website with a strong portal preview, while deferring deeper platform engineering to the next version.

## Included

- Public website pages
- Methodology / Research / Reports / Publications
- Contact and Request Review flow
- Legal, Privacy and 404 pages
- Professional Portal Preview
- Inspection Workspace
- Baseline SEO clean-up
- Contact standardisation

## Not Included

- Live login
- Customer accounts
- Production database
- Full report generator
- Automated LinkedIn import
- Full modular portal architecture

## Go-live Recommendation

This repository can be treated as a **Release Candidate** after final manual checks in GitHub Pages or the chosen hosting environment.

---

## Pattaya Field MVP Checkpoint
**Date:** 2026-07-06  
**Tag:** `pattaya-field-mvp-2026-07-06`  
**Commit:** `02d4e57`  
**Branch:** `foundation-release-1.0`

### Validation scope

The Pattaya Field MVP was validated as an internal field-test workflow for MEIFERTS Building Intelligence.

Validated end-to-end path:

    Inspection
    -> Evidence
    -> Finding
    -> Assessment
    -> Recommendation
    -> Decision
    -> Report
    -> Print / Save PDF Draft

### Validation result

    INSPECTION OK
    CHAIN OK
    REPORT/PDF OK

### Confirmed capabilities

- Adaptive Pattaya inspection workflow is operational.
- Inspection answers can create Evidence Drafts.
- Evidence can generate Expert Review Finding Drafts.
- Findings can generate Expert Review Assessment Drafts.
- Assessments can generate Expert Review Recommendation Drafts.
- Recommendations can generate Expert Review Decision Drafts.
- Decisions can generate Expert Review Report Drafts.
- Report Preview is visible and printable.
- PDF / print preview contains the Expert Review / Draft Boundary notice.
- Report title output is cleaned for field review use.
- Report wording clearly states draft status and expert review requirement.

### Professional boundaries

This MVP does not create a final expert report automatically.

The output is limited to:

    Draft prepared for expert review.
    No automatic final report.
    No automatic expert opinion.
    No automatic purchase recommendation.
    Document availability only where applicable.

Human expert review remains required before any external professional use.

### Intended use

This checkpoint is intended for internal field testing, demonstration, and controlled professional review preparation in the Pattaya / Thailand real estate due diligence context.

---

## Report Workspace Bilingual Release Checkpoint
**Date:** 2026-07-06  
**Branch:** `foundation-release-1.0`  
**Status:** Completed and validated

### Validation scope

The Report Workspace bilingual release checkpoint validates the controlled German-English language foundation for the professional report output workflow.

Validated areas:

    Report Preview
    -> Report Body
    -> Report Detail Panel
    -> Boundary Badges
    -> Report Actions
    -> Report Intelligence Panels
    -> Report Forms
    -> Report Notifications

### Validation result

    REPORT LANGUAGE OK
    REPORT BODY DE OK
    REPORT BODY FIX OK
    REPORT DETAIL DE OK
    REPORT ACTIONS DE OK
    REPORT FORMS DE OK

### Confirmed capabilities

- German and English are active controlled workspace languages.
- Report Preview is connected to the LanguageManager.
- Report body labels, fallback text and output status are bilingual.
- Report Detail Panel labels and boundary badges are bilingual.
- Report actions, report list buttons and intelligence panels are bilingual.
- Report forms and report notifications are bilingual.
- Print / Save PDF workflow uses localized user-facing copy.
- Delete confirmation, create/edit report dialogs and report notifications are localized.
- Remaining Report Form Text Audit returned no unresolved hard-coded report form strings.

### Professional boundaries

The bilingual report workspace does not change the professional decision boundary.

The system remains limited to:

    Draft preparation
    Expert review support
    Report preparation workflow
    Human professional validation

It does not create an automatic final report, expert opinion or purchase recommendation.

### Intended use

This checkpoint is intended as the bilingual release baseline for the MEIFERTS Building Intelligence Report Workspace within the Foundation Release branch.
