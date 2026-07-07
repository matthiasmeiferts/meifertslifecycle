# MEIFERTS Professional Workspace
## Foundation 2.0-A Language Setting Live Apply Fix

Date: 2026-07-07  
Branch: foundation-release-1.0

## Scope

Foundation 2.0-A fixes the visible language setting behavior in the active Professional Workspace.

The user reported that the language setting did not work during the Foundation 2.0 product polish review.

## Issue

The Settings workspace allowed selecting a language and persisted the preference through LanguageManager.

However, the active workspace shell did not fully re-render after language selection.

Observed behavior before the fix:

- language preference was saved
- SettingsPage refreshed itself
- the workspace shell was not explicitly notified
- sidebar, shell text and routed page content did not reliably update live

## Fix

The Settings language selector now dispatches a workspace-level language change event after saving the selected language.

Implemented event:

- mbi:language-changed

The active workspace entry now listens for this event and re-renders the workspace.

Updated files:

- portal/ui/pages/SettingsPage.js
- portal/workspace.js

## Browser Validation

Manual Safari validation confirmed that the language setting now reacts visibly.

Visible German interface elements included:

- Gebäude
- Einstellungen
- Aktuelles Signal
- Bereit zur Prüfung
- Hoch
- Workflow-Fortschritt

## Translation Coverage Boundary

This fix resolves the live apply behavior.

It does not complete full translation coverage across all workspace pages.

Some product and workflow terms remain English at this stage, including selected expert terminology and demo dataset text.

This remaining translation coverage should be handled in a later Foundation 2.0 polish block.

## Validation Result

Syntax checks passed.

Regression suite passed.

The workspace remains on the Foundation 1.9 Demo Release Candidate baseline with the first Foundation 2.0 product polish fix applied.
