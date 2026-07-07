export default class LanguageManager {

    static storageKey = "mbi:interfaceLanguage";

    static defaultLanguage = "en";

    static supportedLanguages = [
        { code: "en", label: "English", status: "Active" },
        { code: "de", label: "Deutsch", status: "Active" }
    ];

    static getLanguage() {
        const stored = localStorage.getItem(this.storageKey);
        const isSupported = this.supportedLanguages.some(item => item.code === stored);

        return isSupported ? stored : this.defaultLanguage;
    }

    static setLanguage(language) {
        const isSupported = this.supportedLanguages.some(item => item.code === language);
        const selectedLanguage = isSupported ? language : this.defaultLanguage;

        localStorage.setItem(this.storageKey, selectedLanguage);

        return this.getLanguage();
    }

    static getSupportedLanguages() {
        return this.supportedLanguages;
    }

    static getProductTerms() {
        return [
            "Evidence",
            "Finding",
            "Assessment",
            "Recommendation",
            "Decision",
            "Report",
            "Building Intelligence",
            "Technical Due Diligence",
            "Technical Property Review",
            "Building Risk Score™",
            "Knowledge Coverage™",
            "CAPEX"
        ];
    }

    static getTranslatableGroups() {
        return [
            "Navigation labels",
            "Buttons and actions",
            "Empty states",
            "Notifications",
            "Form labels",
            "Detail panel labels",
            "Settings copy",
            "Report output copy"
        ];
    }

    static getTranslationBoundary() {
        return {
            productTerms: this.getProductTerms(),
            translatableGroups: this.getTranslatableGroups(),
            rule: "Core product terms remain controlled; general interface copy may be localized."
        };
    }

    static getLanguageLabel(language = this.getLanguage()) {
        const selected = this.supportedLanguages.find(item => item.code === language);

        return selected?.label || this.getLanguageLabel(this.defaultLanguage);
    }

    static getInterfaceCopy() {
        return {
            InterfaceLanguage: {
                en: "Interface Language",
                de: "Arbeitssprache"
            },
            LanguageReadiness: {
                en: "Language foundation",
                de: "Sprachgrundlage"
            },
            LanguageReadinessDescription: {
                en: "The workspace supports English and German as controlled working languages for international real estate due diligence.",
                de: "Der Workspace unterstützt Englisch und Deutsch als kontrollierte Arbeitssprachen für internationale Immobilien-Due-Diligence."
            },
            CurrentLanguage: {
                en: "Current language",
                de: "Aktuelle Sprache"
            },
            SupportedLanguages: {
                en: "Supported languages",
                de: "Unterstützte Sprachen"
            },
            ProductTerminology: {
                en: "Product terminology",
                de: "Produktterminologie"
            },
            CoreTermsRule: {
                en: "Core product terms remain controlled to protect workflow consistency.",
                de: "Zentrale Produktbegriffe bleiben kontrolliert, damit die Workflow-Logik konsistent bleibt."
            },
            TranslationBoundary: {
                en: "Translation boundary: core product terms are controlled; interface copy may be localized.",
                de: "Übersetzungsgrenze: zentrale Produktbegriffe bleiben kontrolliert; allgemeine Bedienoberfläche kann lokalisiert werden."
            },
            ReportTechnicalDueDiligenceDraft: {
                en: "Technical Due Diligence Draft",
                de: "Technical Due Diligence – Entwurf"
            },
            ReportDocumentAvailabilityReview: {
                en: "Document Availability Review",
                de: "Dokumentenverfügbarkeit – Prüfung"
            },
            ReportDraftPrepared: {
                en: "Draft Prepared",
                de: "Entwurf vorbereitet"
            },
            ReportPrintSavePdfDraft: {
                en: "Print / Save PDF draft",
                de: "PDF-Entwurf drucken / speichern"
            },
            ReportDraftPreparedForExpertReview: {
                en: "Draft prepared for expert review",
                de: "Entwurf zur fachlichen Prüfung vorbereitet"
            },
            ReportExpertReviewNotice: {
                en: "Expert Review Notice",
                de: "Prüfhinweis"
            },
            ReportDraftBoundary: {
                en: "Draft boundary",
                de: "Entwurfsgrenze"
            },
            ReportExpertReviewRequiredBeforeFinalUse: {
                en: "Expert review required before final report use.",
                de: "Fachliche Prüfung vor endgültiger Verwendung erforderlich."
            },
            ReportDraftPreparationOnly: {
                en: "Draft report preparation only.",
                de: "Nur Vorbereitung eines Berichtsentwurfs."
            },
            ReportNoFinalReportCreated: {
                en: "No final report has been created by this action.",
                de: "Durch diesen Schritt wurde kein finaler Bericht erstellt."
            },
            ReportNoAutomaticExpertOpinion: {
                en: "No automatic expert opinion or purchase recommendation.",
                de: "Keine automatische gutachterliche Stellungnahme oder Kaufempfehlung."
            },
            ReportDocumentAvailabilityOnly: {
                en: "Document availability only. Document content has not been validated.",
                de: "Nur Dokumentenverfügbarkeit. Der Dokumenteninhalt wurde nicht geprüft."
            },
            ReportReviewBeforeExternalUse: {
                en: "Review report content before external use.",
                de: "Berichtsinhalte vor externer Verwendung fachlich prüfen."
            },
            ReportExecutiveSummaryLabel: {
                en: "Executive Summary",
                de: "Zusammenfassung"
            },
            ReportScopeLabel: {
                en: "Scope",
                de: "Prüfumfang"
            },
            ReportMethodologyLabel: {
                en: "Methodology",
                de: "Methodik"
            },
            ReportWorkflowTraceabilityLabel: {
                en: "Workflow Traceability",
                de: "Workflow-Nachvollziehbarkeit"
            },
            ReportOutputStatusLabel: {
                en: "Output Status",
                de: "Ausgabestatus"
            },
            ReportDecisionBasisLabel: {
                en: "Decision basis",
                de: "Entscheidungsgrundlage"
            },
            ReportStatusLabel: {
                en: "Status",
                de: "Status"
            },
            ReportSummaryTraceSentenceOne: {
                en: "This report summarizes the technical due diligence decision path for the selected case.",
                de: "Dieser Bericht fasst den technischen Due-Diligence-Entscheidungsweg für den ausgewählten Fall zusammen."
            },
            ReportSummaryTraceSentenceTwo: {
                en: "It consolidates linked evidence, findings, assessments, recommendations and the final decision context for professional review.",
                de: "Er konsolidiert verknüpfte Nachweise, Findings, Assessments, Recommendations und den Entscheidungskontext zur fachlichen Prüfung."
            },
            ReportDefaultExecutiveSummary: {
                en: "This report summarizes the selected Building Intelligence workflow and its current decision context.",
                de: "Dieser Bericht fasst den ausgewählten Building-Intelligence-Workflow und den aktuellen Entscheidungskontext zusammen."
            },
            ReportScopeFallback: {
                en: "No scope defined.",
                de: "Kein Prüfumfang definiert."
            },
            ReportMethodologyFallback: {
                en: "Evidence-based workflow review.",
                de: "Evidenzbasierte Workflow-Prüfung."
            },
            ReportScopeDocumentAvailability: {
                en: "Report preparation based on document availability context only.",
                de: "Berichtsvorbereitung ausschließlich auf Grundlage der Dokumentenverfügbarkeit."
            },
            ReportMethodologyExpertReview: {
                en: "Evidence-first workflow chain review. Expert review required before final report use.",
                de: "Evidenzbasierte Prüfung der Workflow-Kette. Fachliche Prüfung vor finaler Berichtsnutzung erforderlich."
            },
            ReportSourceLabel: {
                en: "Source",
                de: "Quelle"
            },
            ReportBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            ReportInspectionIdLabel: {
                en: "Inspection ID",
                de: "Inspection-ID"
            },
            ReportDecisionIdsLabel: {
                en: "Decision IDs",
                de: "Decision-IDs"
            },
            ReportRecommendationIdsLabel: {
                en: "Recommendation IDs",
                de: "Recommendation-IDs"
            },
            ReportAssessmentIdsLabel: {
                en: "Assessment IDs",
                de: "Assessment-IDs"
            },
            ReportFindingIdsLabel: {
                en: "Finding IDs",
                de: "Finding-IDs"
            },
            ReportEvidenceIdsLabel: {
                en: "Evidence IDs",
                de: "Evidence-IDs"
            },
            ReportBuildingSystemLabel: {
                en: "Building System",
                de: "Gebäudesystem"
            },
            ReportRiskScoreLabel: {
                en: "Risk Score",
                de: "Risikoscore"
            },
            ReportDecisionImpactLabel: {
                en: "Decision Impact",
                de: "Entscheidungswirkung"
            },
            ReportRiskLevelLabel: {
                en: "Risk Level",
                de: "Risikostufe"
            },
            ReportExportFormatLabel: {
                en: "Export Format",
                de: "Exportformat"
            },
            ReportNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            ReportDecisionReview: {
                en: "Decision Review",
                de: "Entscheidungsprüfung"
            },
            ReportPending: {
                en: "Pending",
                de: "Offen"
            },
            ReportLegacyNotLinked: {
                en: "Legacy / not linked",
                de: "Altdaten / nicht verknüpft"
            },
            DetailContextDetails: {
                en: "Context Details",
                de: "Kontextdetails"
            },
            DetailExpertReviewRequired: {
                en: "Expert Review Required",
                de: "Fachprüfung erforderlich"
            },
            DetailNoAutomaticDecision: {
                en: "No Automatic Decision",
                de: "Keine automatische Entscheidung"
            },
            DetailDecisionSupportOnly: {
                en: "Decision Support Only",
                de: "Nur Entscheidungsunterstützung"
            },
            DetailReportPreparationOnly: {
                en: "Report Preparation Only",
                de: "Nur Berichtsentwurf"
            },
            DetailNoFinalReport: {
                en: "No Final Report",
                de: "Kein finaler Bericht"
            },
            DetailNoAutomaticOpinion: {
                en: "No Automatic Opinion",
                de: "Keine Auto-Stellungnahme"
            },
            DetailDocumentAvailabilityOnly: {
                en: "Document Availability Only",
                de: "Nur Dokumentenverfügbarkeit"
            },
            DetailStandardReview: {
                en: "Standard Review",
                de: "Standardprüfung"
            },
            ReportContextTitle: {
                en: "Report Context",
                de: "Berichtskontext"
            },
            ReportReportsLabel: {
                en: "Reports",
                de: "Berichte"
            },
            ReportSelectedReportLabel: {
                en: "Selected Report",
                de: "Ausgewählter Bericht"
            },
            ReportNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            ReportAvailableInDraft: {
                en: "Available in draft",
                de: "Im Entwurf verfügbar"
            },
            ReportNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            ReportCreateOrSelectReport: {
                en: "Create or select a report",
                de: "Bericht erstellen oder auswählen"
            },
            ReportSourceTitleLabel: {
                en: "Source Title",
                de: "Quelltitel"
            },
            ReportReportStatusLabel: {
                en: "Report Status",
                de: "Berichtsstatus"
            },
            ReportSafetyBoundariesLabel: {
                en: "Safety Boundaries",
                de: "Prüfgrenzen"
            },
            ReportCaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            ReportReportTypeLabel: {
                en: "Report Type",
                de: "Berichtstyp"
            },
            ReportExportRequestedLabel: {
                en: "Export Requested",
                de: "Export angefordert"
            },
            ReportNotRequested: {
                en: "Not requested",
                de: "Nicht angefordert"
            },
            ReportNone: {
                en: "None",
                de: "Keine"
            },
            ReportNoExecutiveSummary: {
                en: "No executive summary",
                de: "Keine Zusammenfassung"
            },
            ReportFinalOutputLabel: {
                en: "Final Output",
                de: "Finale Ausgabe"
            },
            ReportCompletionLabel: {
                en: "Completion",
                de: "Fertigstellung"
            },
            ReportFinalReportComplete: {
                en: "Final Report Complete",
                de: "Finaler Bericht vollständig"
            },
            ReportReadyForExpertReview: {
                en: "Ready for Expert Review",
                de: "Bereit zur fachlichen Prüfung"
            },
            ReportNeedsMoreData: {
                en: "Needs more report data",
                de: "Weitere Berichtsdaten erforderlich"
            },
            ReportIdentified: {
                en: "Report identified",
                de: "Bericht identifiziert"
            },
            ReportTypeDefined: {
                en: "Report type defined",
                de: "Berichtstyp definiert"
            },
            ReportDecisionLinked: {
                en: "Decision linked",
                de: "Decision verknüpft"
            },
            ReportContentPrepared: {
                en: "Content prepared",
                de: "Inhalt vorbereitet"
            },
            ReportDraftOutputPrepared: {
                en: "Draft output prepared",
                de: "Entwurfsausgabe vorbereitet"
            },
            ReportFinalizationPending: {
                en: "Finalization pending",
                de: "Finalisierung offen"
            },
            ReportRefreshAction: {
                en: "Refresh",
                de: "Aktualisieren"
            },
            ReportCloseAction: {
                en: "Close Report",
                de: "Bericht schließen"
            },
            ReportPrepareAction: {
                en: "Prepare Report",
                de: "Bericht vorbereiten"
            },
            ReportPrintSavePdfAction: {
                en: "Print / Save PDF",
                de: "PDF drucken / speichern"
            },
            ReportOpenAction: {
                en: "Open",
                de: "Öffnen"
            },
            ReportEditAction: {
                en: "Edit",
                de: "Bearbeiten"
            },
            ReportDeleteAction: {
                en: "Delete",
                de: "Löschen"
            },
            ReportIntelligenceLabel: {
                en: "Report Intelligence",
                de: "Berichtsintelligenz"
            },
            ReportIntelligenceDeveloping: {
                en: "Report intelligence developing",
                de: "Berichtsintelligenz in Entwicklung"
            },
            ReportIntelligenceChecksCompleted: {
                en: "report intelligence checks completed",
                de: "Berichtsintelligenz-Prüfungen abgeschlossen"
            },
            ReportFinalReviewReadinessLabel: {
                en: "Final Review Readiness",
                de: "Bereitschaft zur finalen Prüfung"
            },
            ReportFinalReviewReadinessDescription: {
                en: "Readiness based on identity, report type, decision link, content, draft output, expert review and finalization.",
                de: "Bereitschaft auf Basis von Identität, Berichtstyp, Decision-Verknüpfung, Inhalt, Entwurfsausgabe, fachlicher Prüfung und Finalisierung."
            },
            ReportOutputQualitySignalLabel: {
                en: "Output Quality Signal",
                de: "Qualitätssignal der Ausgabe"
            },
            ReportNextReportActionLabel: {
                en: "Next Report Action",
                de: "Nächste Berichtsaktion"
            },
            ReportPrepareDraftReportOutput: {
                en: "Prepare draft report output",
                de: "Berichtsentwurf vorbereiten"
            },
            ReportPrepareDraftReportOutputDescription: {
                en: "Report content and decision context are available. Prepare the draft output for expert review.",
                de: "Berichtsinhalte und Entscheidungskontext sind verfügbar. Bereiten Sie die Entwurfsausgabe zur fachlichen Prüfung vor."
            },
            ReportNewReportAction: {
                en: "+ New Report",
                de: "+ Neuer Bericht"
            },
            ReportNewReportTitle: {
                en: "New Report",
                de: "Neuer Bericht"
            },
            ReportCreateReportAction: {
                en: "Create Report",
                de: "Bericht erstellen"
            },
            ReportEditReportTitle: {
                en: "Edit Report",
                de: "Bericht bearbeiten"
            },
            ReportSaveReportAction: {
                en: "Save Report",
                de: "Bericht speichern"
            },
            ReportTitleFieldLabel: {
                en: "Report title",
                de: "Berichtstitel"
            },
            ReportTypeFieldLabel: {
                en: "Report type",
                de: "Berichtstyp"
            },
            ReportExecutiveSummaryFieldLabel: {
                en: "Executive summary",
                de: "Zusammenfassung"
            },
            ReportOutputPreparedSummary: {
                en: "Building Intelligence report output prepared from workflow data.",
                de: "Building-Intelligence-Berichtsausgabe aus Workflow-Daten vorbereitet."
            },
            ReportTechnicalScopeDefault: {
                en: "Technical due diligence report scope.",
                de: "Prüfumfang für den Technical-Due-Diligence-Bericht."
            },
            ReportEvidenceFirstWorkflowReview: {
                en: "Evidence-first Building Intelligence workflow review.",
                de: "Evidence-first Building-Intelligence-Workflow-Prüfung."
            },
            ReportPreparedForReviewNotification: {
                en: "Report prepared for review.",
                de: "Bericht zur Prüfung vorbereitet."
            },
            ReportValidationGateBlockedNotification: {
                en: "Workflow validation is blocked. Resolve blocking review items before preparing the report.",
                de: "Workflow-Validierung ist blockiert. Blockierende Review-Items vor Report-Vorbereitung lösen."
            },
            ReportValidationGateWarningNotification: {
                en: "Workflow validation has warnings. Review open items before relying on the report.",
                de: "Workflow-Validierung enthält Warnungen. Offene Items vor Nutzung des Reports prüfen."
            },
            ReportValidationGateExternalBlockedNotification: {
                en: "External output is blocked by unresolved validation items.",
                de: "Externe Ausgabe ist durch ungelöste Validierungs-Items blockiert."
            },
            ReportValidationGateExternalWarningNotification: {
                en: "External output has validation warnings. Review open items before use.",
                de: "Externe Ausgabe enthält Validierungswarnungen. Offene Items vor Nutzung prüfen."
            },
            ReportSelectReportFirstNotification: {
                en: "Select a report first.",
                de: "Bitte zuerst einen Bericht auswählen."
            },
            ReportPrintDialogNotification: {
                en: "Print dialog opened. Use Save as PDF in Safari.",
                de: "Druckdialog geöffnet. In Safari „Als PDF sichern“ verwenden."
            },
            ReportOpenCaseFirstNotification: {
                en: "Open a case before creating a report.",
                de: "Öffnen Sie zuerst einen Case, bevor ein Bericht erstellt wird."
            },
            ReportActiveDecisionOtherCaseNotification: {
                en: "Active decision belongs to another case.",
                de: "Die aktive Decision gehört zu einem anderen Case."
            },
            ReportSelectDecisionFirstNotification: {
                en: "Select a decision before creating a report.",
                de: "Bitte zuerst eine Decision auswählen, bevor ein Bericht erstellt wird."
            },
            ReportCreatedNotification: {
                en: "Report created.",
                de: "Bericht erstellt."
            },
            ReportInitialOutputPrepared: {
                en: "Initial report output prepared from the workspace.",
                de: "Erste Berichtsausgabe aus dem Workspace vorbereitet."
            },
            ReportDecisionBasedScopeDefault: {
                en: "Decision-based technical due diligence report.",
                de: "Decision-basierter Technical-Due-Diligence-Bericht."
            },
            ReportSelectReportBeforeEditingNotification: {
                en: "Select a report before editing.",
                de: "Bitte zuerst einen Bericht auswählen, bevor er bearbeitet wird."
            },
            ReportUpdatedNotification: {
                en: "Report updated.",
                de: "Bericht aktualisiert."
            },
            ReportDeleteConfirmPrefix: {
                en: "Delete report",
                de: "Bericht löschen"
            },
            ReportDeletedNotification: {
                en: "Report deleted.",
                de: "Bericht gelöscht."
            },
            ReportPendingFeatureFallback: {
                en: "This feature",
                de: "Diese Funktion"
            },
            ReportPendingFeatureReserved: {
                en: "is reserved for a later workspace release.",
                de: "ist für ein späteres Workspace-Release vorgesehen."
            },
            NavDashboard: {
                en: "Dashboard",
                de: "Dashboard"
            },
            NavCases: {
                en: "Cases",
                de: "Cases"
            },
            NavBuildings: {
                en: "Buildings",
                de: "Gebäude"
            },
            NavInspections: {
                en: "Inspections",
                de: "Inspections"
            },
            NavEvidence: {
                en: "Evidence",
                de: "Evidence"
            },
            NavFindings: {
                en: "Findings",
                de: "Findings"
            },
            NavAssessments: {
                en: "Assessments",
                de: "Assessments"
            },
            NavRecommendations: {
                en: "Recommendations",
                de: "Recommendations"
            },
            NavDecisions: {
                en: "Decisions",
                de: "Decisions"
            },
            NavReports: {
                en: "Reports",
                de: "Reports"
            },
            NavSettings: {
                en: "Settings",
                de: "Einstellungen"
            },
            WorkspaceDocumentTitle: {
                en: "MEIFERTS Building Intelligence | Professional Workspace",
                de: "MEIFERTS Building Intelligence | Professional Workspace"
            },
            WorkspaceFoundationRelease: {
                en: "Foundation Release 1.0",
                de: "Foundation Release 1.0"
            },
            WorkspaceProfessionalTitle: {
                en: "Professional Workspace",
                de: "Professional Workspace"
            },
            WorkspaceEngineConnected: {
                en: "Engine connected",
                de: "Engine verbunden"
            },
            WorkspaceIntelligenceSidebar: {
                en: "Intelligence Sidebar",
                de: "Intelligence Sidebar"
            },
            WorkspaceCurrentSignal: {
                en: "Current Signal",
                de: "Aktuelles Signal"
            },
            WorkspaceBuildingRiskScore: {
                en: "Building Risk Score™",
                de: "Building Risk Score™"
            },
            WorkspaceBuildingConfidence: {
                en: "Building Confidence™",
                de: "Building Confidence™"
            },
            WorkspaceKnowledgeCoverage: {
                en: "Knowledge Coverage™",
                de: "Knowledge Coverage™"
            },
            WorkspaceNoActiveCase: {
                en: "No active case",
                de: "Kein aktiver Case"
            },
            WorkspaceOpenCasePrompt: {
                en: "Create or open a case to begin the decision workflow.",
                de: "Case erstellen oder öffnen, um den Entscheidungsworkflow zu starten."
            },
            WorkspaceReadyForReview: {
                en: "Ready for review",
                de: "Bereit zur Prüfung"
            },
            WorkspaceInReview: {
                en: "In review",
                de: "In Prüfung"
            },
            WorkspacePending: {
                en: "Pending",
                de: "Offen"
            },
            WorkspaceHigh: {
                en: "High",
                de: "Hoch"
            },
            WorkspaceDeveloping: {
                en: "Developing",
                de: "In Entwicklung"
            },
            WorkflowStepBuilding: {
                en: "Building",
                de: "Gebäude"
            },
            WorkflowStepInspection: {
                en: "Inspection",
                de: "Inspection"
            },
            WorkflowStepEvidence: {
                en: "Evidence",
                de: "Evidence"
            },
            WorkflowStepFinding: {
                en: "Finding",
                de: "Finding"
            },
            WorkflowStepAssessment: {
                en: "Assessment",
                de: "Assessment"
            },
            WorkflowStepRecommendation: {
                en: "Recommendation",
                de: "Recommendation"
            },
            WorkflowStepDecision: {
                en: "Decision",
                de: "Decision"
            },
            WorkflowStepReport: {
                en: "Report",
                de: "Report"
            },
            WorkflowProgressTitle: {
                en: "Workflow Progress",
                de: "Workflow-Fortschritt"
            },
            WorkflowActiveCaseDecisionPath: {
                en: "Active case decision path",
                de: "Aktiver Case-Entscheidungsweg"
            },
            WorkflowSelectCaseProgress: {
                en: "Select a case to activate progress tracking",
                de: "Case auswählen, um die Fortschrittsverfolgung zu aktivieren"
            },
            WorkflowReady: {
                en: "Ready",
                de: "Bereit"
            },
            WorkflowEmpty: {
                en: "Empty",
                de: "Leer"
            },
            DashboardActiveCase: {
                en: "Active Case",
                de: "Aktiver Case"
            },
            DashboardControlledDemoDataset: {
                en: "Controlled Demo Dataset",
                de: "Kontrollierter Demo-Datensatz"
            },
            DashboardDemoNotLoaded: {
                en: "Not loaded",
                de: "Nicht geladen"
            },
            DashboardDemoLoadDescription: {
                en: "Load the controlled demo dataset to review the complete evidence-to-report workflow.",
                de: "Kontrollierten Demo-Datensatz laden, um den vollständigen Evidence-to-Report-Workflow zu prüfen."
            },
            DashboardLoadControlledDemoDataset: {
                en: "Load Controlled Demo Dataset",
                de: "Kontrollierten Demo-Datensatz laden"
            },
            DashboardReloadControlledDemoDataset: {
                en: "Reload Controlled Demo Dataset",
                de: "Kontrollierten Demo-Datensatz neu laden"
            },
            DashboardReviewDemoReport: {
                en: "Review Demo Report",
                de: "Demo-Bericht prüfen"
            },
            DashboardDemoComplete: {
                en: "Complete",
                de: "Vollständig"
            },
            DashboardDemoIncomplete: {
                en: "Incomplete",
                de: "Unvollständig"
            },
            DashboardWorkflowLinksValid: {
                en: "Workflow links valid",
                de: "Workflow-Verknüpfungen gültig"
            },
            DashboardWorkflowLinksIncomplete: {
                en: "Workflow links incomplete",
                de: "Workflow-Verknüpfungen unvollständig"
            },
            DashboardDemoRecordsAvailable: {
                en: "demo records are available",
                de: "Demo-Datensätze sind verfügbar"
            },
            DashboardWorkflowReadiness: {
                en: "Workflow Readiness",
                de: "Workflow-Bereitschaft"
            },
            DashboardWorkflowComplete: {
                en: "Workflow Complete",
                de: "Workflow vollständig"
            },
            DashboardWorkflowInProgress: {
                en: "Workflow In Progress",
                de: "Workflow in Bearbeitung"
            },
            DashboardWorkflowBottleneck: {
                en: "Workflow Bottleneck",
                de: "Workflow-Engpass"
            },
            DashboardWorkflowQuality: {
                en: "Workflow Quality",
                de: "Workflow-Qualität"
            },
            DashboardWorkspaceIntelligence: {
                en: "Workspace Intelligence",
                de: "Workspace Intelligence"
            },
            DashboardExpertReviewQueue: {
                en: "Expert Review Queue",
                de: "Expert Review Queue"
            },
            DashboardOpenReviewItems: {
                en: "Open review items",
                de: "Offene Review-Items"
            },
            DashboardNoOpenReviewItems: {
                en: "No open review items",
                de: "Keine offenen Review-Items"
            },
            DashboardReviewItemSingular: {
                en: "item",
                de: "Item"
            },
            DashboardReviewItemPlural: {
                en: "items",
                de: "Items"
            },
            DashboardRequireReview: {
                en: "require review",
                de: "benötigen Review"
            },
            DashboardHighestPriority: {
                en: "Highest priority",
                de: "Höchste Priorität"
            },
            DashboardNoOpenExpertReviewItems: {
                en: "No open expert review items",
                de: "Keine offenen Expert-Review-Items"
            },
            DashboardNoUnresolvedReviewBlockers: {
                en: "The current workflow does not contain unresolved review blockers.",
                de: "Der aktuelle Workflow enthält keine ungelösten Review-Blocker."
            },
            DashboardBlockedReviewItemsNotice: {
                en: "Blocked review items require attention before downstream decision or report use.",
                de: "Blockierte Review-Items müssen vor nachgelagerter Decision- oder Report-Nutzung geprüft werden."
            },
            DashboardValidationGate: {
                en: "Workflow Validation Gate",
                de: "Workflow Validation Gate"
            },
            DashboardValidationGateDescription: {
                en: "Decision, report and external use are checked against open expert review items.",
                de: "Decision-, Report- und externe Nutzung werden gegen offene Expert-Review-Items geprüft."
            },
            DashboardValidationDecisionUse: {
                en: "Decision use",
                de: "Decision-Nutzung"
            },
            DashboardValidationReportUse: {
                en: "Report use",
                de: "Report-Nutzung"
            },
            DashboardValidationExternalUse: {
                en: "External use",
                de: "Externe Nutzung"
            },
            DashboardValidationPassed: {
                en: "Passed",
                de: "Freigegeben"
            },
            DashboardValidationWarning: {
                en: "Warning",
                de: "Warnung"
            },
            DashboardValidationBlocked: {
                en: "Blocked",
                de: "Blockiert"
            },
            DashboardValidationRequiresReview: {
                en: "Workflow validation requires review.",
                de: "Workflow-Validierung erfordert Prüfung."
            },
            DashboardValidationPassedMessage: {
                en: "Workflow validation passed.",
                de: "Workflow-Validierung freigegeben."
            },
            DashboardValidationBlockingItemSingular: {
                en: "blocking review item must be resolved before workflow use.",
                de: "blockierendes Review-Item muss vor Workflow-Nutzung gelöst werden."
            },
            DashboardValidationBlockingItemPlural: {
                en: "blocking review items must be resolved before workflow use.",
                de: "blockierende Review-Items müssen vor Workflow-Nutzung gelöst werden."
            },
            DashboardValidationWarningItemSingular: {
                en: "review warning should be checked before workflow use.",
                de: "Review-Warnung sollte vor Workflow-Nutzung geprüft werden."
            },
            DashboardValidationWarningItemPlural: {
                en: "review warnings should be checked before workflow use.",
                de: "Review-Warnungen sollten vor Workflow-Nutzung geprüft werden."
            },
            DashboardWorkflowConfidence: {
                en: "Workflow Confidence",
                de: "Workflow-Vertrauen"
            },
            DashboardRiskSignalOverview: {
                en: "Risk Signal Overview",
                de: "Risikosignal-Übersicht"
            },
            DashboardNextStrategicAction: {
                en: "Next Strategic Action",
                de: "Nächste strategische Aktion"
            },
            DashboardReviewWorkspace: {
                en: "Review workspace",
                de: "Workspace prüfen"
            },
            DashboardStartWorkspace: {
                en: "Start workspace",
                de: "Workspace starten"
            },
            DashboardActiveStatus: {
                en: "Active",
                de: "Aktiv"
            },
            DashboardOpenStatus: {
                en: "Open",
                de: "Offen"
            },
            DashboardCapturedInspectionEvidence: {
                en: "Captured inspection evidence",
                de: "Erfasste Inspection Evidence"
            },
            DashboardTechnicalFindingsIdentified: {
                en: "Technical findings identified",
                de: "Technische Findings identifiziert"
            },
            DashboardRiskAssessmentsCompleted: {
                en: "Risk assessments completed",
                de: "Risk Assessments abgeschlossen"
            },
            DashboardActionsRecommended: {
                en: "Actions recommended",
                de: "Handlungen empfohlen"
            },
            DashboardGovernanceDecisionsConfirmed: {
                en: "Governance decisions confirmed",
                de: "Governance Decisions bestätigt"
            },
            DashboardFinalOutputPrepared: {
                en: "Final output prepared",
                de: "Finale Ausgabe vorbereitet"
            },
            DashboardAllStagesContainData: {
                en: "All workflow stages contain data. Review final output quality and completeness.",
                de: "Alle Workflow-Stufen enthalten Daten. Finale Ausgabequalität und Vollständigkeit prüfen."
            },
            DashboardReviewWorkflow: {
                en: "Review workflow",
                de: "Workflow prüfen"
            },
            DashboardWorkflowDataPresent: {
                en: "Workflow data is present. Review stage quality before moving forward.",
                de: "Workflow-Daten sind vorhanden. Stufenqualität vor dem nächsten Schritt prüfen."
            },
            DashboardNextAttention: {
                en: "Next attention",
                de: "Nächster Fokus"
            },
            DashboardStageMissingSuffix: {
                en: "is still missing or not yet represented in the workflow.",
                de: "fehlt noch oder ist im Workflow noch nicht abgebildet."
            },
            DashboardCompleteWorkflowCoverage: {
                en: "Complete workflow coverage",
                de: "Vollständige Workflow-Abdeckung"
            },
            DashboardCompleteWorkflowCoverageDescription: {
                en: "All workflow stages are represented. Focus on review quality, consistency and final report confidence.",
                de: "Alle Workflow-Stufen sind abgebildet. Fokus auf Prüfqualität, Konsistenz und finales Berichtvertrauen."
            },
            DashboardStrongWorkflowProgress: {
                en: "Strong workflow progress",
                de: "Starker Workflow-Fortschritt"
            },
            DashboardStrongWorkflowProgressDescription: {
                en: "Most workflow stages are represented. Remaining gaps should be closed before final decision or report output.",
                de: "Die meisten Workflow-Stufen sind abgebildet. Verbleibende Lücken sollten vor finaler Decision oder Berichtsausgabe geschlossen werden."
            },
            DashboardPartialWorkflowCoverage: {
                en: "Partial workflow coverage",
                de: "Teilweise Workflow-Abdeckung"
            },
            DashboardPartialWorkflowCoverageDescription: {
                en: "The workflow is active but still incomplete. Continue linking evidence, findings and downstream decisions.",
                de: "Der Workflow ist aktiv, aber noch unvollständig. Evidence, Findings und nachgelagerte Decisions weiter verknüpfen."
            },
            DashboardEarlyWorkflowStage: {
                en: "Early workflow stage",
                de: "Frühe Workflow-Stufe"
            },
            DashboardEarlyWorkflowStageDescription: {
                en: "Only the first workflow stages are represented. Start with evidence capture and finding creation.",
                de: "Nur die ersten Workflow-Stufen sind abgebildet. Mit Evidence-Erfassung und Finding-Erstellung starten."
            },
            DashboardLowSignalDensity: {
                en: "Low signal density",
                de: "Geringe Signaldichte"
            },
            DashboardLowSignalDensityDescription: {
                en: "Risk logic is still light. More findings and assessments are needed before strong conclusions.",
                de: "Die Risikologik ist noch dünn. Mehr Findings und Assessments sind vor belastbaren Schlussfolgerungen erforderlich."
            },
            DashboardHighSignalDensity: {
                en: "High signal density",
                de: "Hohe Signaldichte"
            },
            DashboardHighSignalDensityDescription: {
                en: "Multiple downstream risk signals are present. Review consistency before decision output.",
                de: "Mehrere nachgelagerte Risikosignale liegen vor. Konsistenz vor der Decision-Ausgabe prüfen."
            },
            DashboardModerateSignalDensity: {
                en: "Moderate signal density",
                de: "Mittlere Signaldichte"
            },
            DashboardModerateSignalDensityDescription: {
                en: "The workflow contains usable risk signals, but decision confidence depends on review quality.",
                de: "Der Workflow enthält nutzbare Risikosignale, aber das Decision-Vertrauen hängt von der Prüfqualität ab."
            },
            DashboardLowConfidence: {
                en: "Low confidence",
                de: "Geringes Vertrauen"
            },
            DashboardLowConfidenceDescription: {
                en: "The workflow is not yet sufficiently connected for reliable decision support.",
                de: "Der Workflow ist noch nicht ausreichend verknüpft für belastbare Entscheidungsunterstützung."
            },
            DashboardHighConfidence: {
                en: "High confidence",
                de: "Hohes Vertrauen"
            },
            DashboardHighConfidenceDescription: {
                en: "The workflow is strongly represented and ready for executive-level review.",
                de: "Der Workflow ist stark abgebildet und bereit für die Executive-Prüfung."
            },
            DashboardDevelopingConfidence: {
                en: "Developing confidence",
                de: "Vertrauen in Entwicklung"
            },
            DashboardDevelopingConfidenceDescription: {
                en: "The platform has enough structure for directional insight, but key gaps may remain.",
                de: "Die Plattform hat genügend Struktur für eine Richtungsaussage, zentrale Lücken können aber verbleiben."
            },
            DashboardReviewExecutiveOutput: {
                en: "Review executive output",
                de: "Executive Output prüfen"
            },
            DashboardReviewExecutiveOutputDescription: {
                en: "All workflow stages are represented. Focus on final report quality, consistency and decision confidence.",
                de: "Alle Workflow-Stufen sind abgebildet. Fokus auf finale Berichtqualität, Konsistenz und Decision-Vertrauen."
            },
            DashboardCompleteWorkflowChain: {
                en: "Complete workflow chain",
                de: "Workflow-Kette vervollständigen"
            },
            DashboardCompleteWorkflowChainDescription: {
                en: "Continue building the workflow from evidence through report.",
                de: "Workflow von Evidence bis Report weiter aufbauen."
            },
            DashboardDecisionWorkflowComplete: {
                en: "Decision workflow is fully represented.",
                de: "Decision Workflow ist vollständig abgebildet."
            },
            DashboardDecisionWorkflowDeveloping: {
                en: "Decision workflow is still developing.",
                de: "Decision Workflow ist noch in Entwicklung."
            },
            DashboardPlatformCoverageReady: {
                en: "The platform has enough cross-workspace coverage to support final review and reporting.",
                de: "Die Plattform verfügt über ausreichende Workspace-übergreifende Abdeckung für finale Prüfung und Reporting."
            },
            DashboardPlatformCoverageDeveloping: {
                en: "The platform should continue closing workflow gaps before relying on the output for final decisions.",
                de: "Die Plattform sollte Workflow-Lücken weiter schließen, bevor die Ausgabe für finale Entscheidungen genutzt wird."
            },
            DashboardDecisionWorkflow: {
                en: "Decision Workflow",
                de: "Decision Workflow"
            },
            DashboardEvidenceToReport: {
                en: "Evidence → Report",
                de: "Evidence → Report"
            },
            DashboardOf: {
                en: "of",
                de: "von"
            },
            DashboardMediumHigh: {
                en: "Medium High",
                de: "Mittel-hoch"
            },
            DashboardMedium: {
                en: "Medium",
                de: "Mittel"
            },
            DashboardLow: {
                en: "Low",
                de: "Niedrig"
            },
            CaseWorkspaceTitle: {
                en: "Case Workspace",
                de: "Case Workspace"
            },
            CaseCreateManageDescription: {
                en: "Create or manage Technical Property Review cases.",
                de: "Technical-Property-Review-Cases erstellen oder verwalten."
            },
            CaseActiveCasePrefix: {
                en: "Active case",
                de: "Aktiver Case"
            },
            CaseNewCaseAction: {
                en: "+ New Case",
                de: "+ Neuer Case"
            },
            CaseEmptyDescription: {
                en: "Create your first case to begin the Building Intelligence workflow.",
                de: "Erstellen Sie den ersten Case, um den Building-Intelligence-Workflow zu starten."
            },
            CaseActiveBadge: {
                en: "Active",
                de: "Aktiv"
            },
            CaseOverviewTitle: {
                en: "Case Overview",
                de: "Case-Übersicht"
            },
            CaseSelectedCaseLabel: {
                en: "Selected Case",
                de: "Ausgewählter Case"
            },
            CaseNoSelection: {
                en: "No selection",
                de: "Keine Auswahl"
            },
            CaseNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            CaseCreateOrOpen: {
                en: "Create or open a case",
                de: "Case erstellen oder öffnen"
            },
            CaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            CaseStatusLabel: {
                en: "Status",
                de: "Status"
            },
            CaseClientContextLabel: {
                en: "Client / Context",
                de: "Kunde / Kontext"
            },
            CaseTypeLabel: {
                en: "Type",
                de: "Typ"
            },
            CaseProgressLabel: {
                en: "Progress",
                de: "Fortschritt"
            },
            CaseBuildingLabel: {
                en: "Building",
                de: "Gebäude"
            },
            CaseInspectionLabel: {
                en: "Inspection",
                de: "Inspection"
            },
            CaseUpdatedLabel: {
                en: "Updated",
                de: "Aktualisiert"
            },
            CaseNotAvailable: {
                en: "Not available",
                de: "Nicht verfügbar"
            },
            CaseNotSpecified: {
                en: "Not specified",
                de: "Nicht angegeben"
            },
            CaseNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            CaseContinueWorkflow: {
                en: "Continue Workflow",
                de: "Workflow fortsetzen"
            },
            CaseReviewCompleteChain: {
                en: "Review complete intelligence chain",
                de: "Vollständige Intelligence-Kette prüfen"
            },
            CaseMoveThroughChain: {
                en: "Move this case through the intelligence chain",
                de: "Diesen Case durch die Intelligence-Kette führen"
            },
            CaseSelectToContinueWorkflow: {
                en: "Select a case to continue the workflow",
                de: "Case auswählen, um den Workflow fortzusetzen"
            },
            CaseAllStagesReviewLinks: {
                en: "All workflow stages are represented. Review links or rebuild the chain when required.",
                de: "Alle Workflow-Stufen sind abgebildet. Verknüpfungen prüfen oder die Kette bei Bedarf neu aufbauen."
            },
            CaseCreateReviewLinkedRecords: {
                en: "Create or review linked records from Evidence to final Report.",
                de: "Verknüpfte Datensätze von Evidence bis zum finalen Report erstellen oder prüfen."
            },
            CaseOpenFirstThenContinue: {
                en: "Open a case first, then continue with evidence, findings and decision output.",
                de: "Zuerst einen Case öffnen, dann mit Evidence, Findings und Decision Output fortfahren."
            },
            CaseReviewWorkflowChain: {
                en: "Review Workflow Chain",
                de: "Workflow-Kette prüfen"
            },
            CaseCreateWorkflowChain: {
                en: "Create Workflow Chain",
                de: "Workflow-Kette erstellen"
            },
            CaseMaintenanceLabel: {
                en: "Maintenance",
                de: "Wartung"
            },
            CaseRepairLinksAction: {
                en: "Repair Links",
                de: "Links reparieren"
            },
            CaseCleanOrphansAction: {
                en: "Clean Orphans",
                de: "Verwaiste Einträge bereinigen"
            },
            CaseWorkflowEvidenceDescription: {
                en: "Collect photos, documents and inspection inputs.",
                de: "Fotos, Dokumente und Inspection Inputs erfassen."
            },
            CaseWorkflowFindingsDescription: {
                en: "Turn evidence into technical observations.",
                de: "Evidence in technische Beobachtungen überführen."
            },
            CaseWorkflowAssessmentsDescription: {
                en: "Evaluate relevance, severity and lifecycle impact.",
                de: "Relevanz, Schweregrad und Lifecycle-Auswirkung bewerten."
            },
            CaseWorkflowRecommendationsDescription: {
                en: "Define technical and commercial next steps.",
                de: "Technische und wirtschaftliche nächste Schritte definieren."
            },
            CaseWorkflowDecisionsDescription: {
                en: "Prepare decision-ready conclusions.",
                de: "Entscheidungsreife Schlussfolgerungen vorbereiten."
            },
            CaseWorkflowReportsDescription: {
                en: "Generate structured output for review.",
                de: "Strukturierte Ausgabe zur Prüfung erzeugen."
            },
            CaseLowRiskSignal: {
                en: "Low risk signal",
                de: "Geringes Risikosignal"
            },
            CaseLowRiskSignalDescription: {
                en: "Case risk logic is still light. More evidence and findings are needed.",
                de: "Die Case-Risiko-Logik ist noch dünn. Mehr Evidence und Findings sind erforderlich."
            },
            CaseHighRiskSignal: {
                en: "High risk signal",
                de: "Hohes Risikosignal"
            },
            CaseHighRiskSignalDescription: {
                en: "Multiple downstream risk signals are present. Review before recommendation or decision.",
                de: "Mehrere nachgelagerte Risikosignale liegen vor. Vor Recommendation oder Decision prüfen."
            },
            CaseModerateRiskSignal: {
                en: "Moderate risk signal",
                de: "Mittleres Risikosignal"
            },
            CaseModerateRiskSignalDescription: {
                en: "The case contains usable risk signals, but downstream validation may still be needed.",
                de: "Der Case enthält nutzbare Risikosignale, aber nachgelagerte Validierung kann noch erforderlich sein."
            },
            CaseStrengthenPrefix: {
                en: "Strengthen",
                de: "Stärken"
            },
            CaseStageMissingDescription: {
                en: "data is missing for this case. Complete this stage before relying on final output.",
                de: "Daten fehlen für diesen Case. Diese Stufe abschließen, bevor die finale Ausgabe genutzt wird."
            },
            CaseReviewOutput: {
                en: "Review case output",
                de: "Case Output prüfen"
            },
            CaseReviewOutputDescription: {
                en: "All workflow stages are represented for this case. Review consistency and final report confidence.",
                de: "Alle Workflow-Stufen sind für diesen Case abgebildet. Konsistenz und finales Berichtvertrauen prüfen."
            },
            CaseWorkflowComplete: {
                en: "Case workflow complete",
                de: "Case Workflow vollständig"
            },
            CaseWorkflowDeveloping: {
                en: "Case workflow developing",
                de: "Case Workflow in Entwicklung"
            },
            CaseWorkflowEarly: {
                en: "Case workflow early",
                de: "Case Workflow frühe Phase"
            },
            CaseIntelligenceLabel: {
                en: "Case Intelligence",
                de: "Case Intelligence"
            },
            CaseIntelligenceDescription: {
                en: "Workflow coverage, risk signal and next action for the active case.",
                de: "Workflow-Abdeckung, Risikosignal und nächste Aktion für den aktiven Case."
            },
            CaseReadinessLabel: {
                en: "Readiness",
                de: "Bereitschaft"
            },
            CaseConfidenceLabel: {
                en: "Confidence",
                de: "Vertrauen"
            },
            CaseStagesLabel: {
                en: "Stages",
                de: "Stufen"
            },
            CaseWorkflowCoverageLabel: {
                en: "Workflow Coverage",
                de: "Workflow-Abdeckung"
            },
            CaseReadySuffix: {
                en: "ready",
                de: "bereit"
            },
            CaseStagesRepresented: {
                en: "stages represented",
                de: "Stufen abgebildet"
            },
            CaseAllStagesRepresented: {
                en: "All workflow stages are represented for this case.",
                de: "Alle Workflow-Stufen sind für diesen Case abgebildet."
            },
            CaseContinueMissingStage: {
                en: "Continue with the first missing workflow stage.",
                de: "Mit der ersten fehlenden Workflow-Stufe fortfahren."
            },
            CaseRiskSignalLabel: {
                en: "Risk Signal",
                de: "Risikosignal"
            },
            CaseNextActionLabel: {
                en: "Next Action",
                de: "Nächste Aktion"
            },
            CaseNoOrphanRecords: {
                en: "No orphan workflow records found.",
                de: "Keine verwaisten Workflow-Datensätze gefunden."
            },
            CaseDeleteOrphanPrefix: {
                en: "Delete",
                de: "Löschen"
            },
            CaseOrphanRecordsQuestion: {
                en: "orphan workflow records?",
                de: "verwaiste Workflow-Datensätze?"
            },
            CaseOrphanRecordsDeleted: {
                en: "orphan workflow records deleted.",
                de: "verwaiste Workflow-Datensätze gelöscht."
            },
            CaseOpenBeforeRepairing: {
                en: "Open a case before repairing workflow links.",
                de: "Öffnen Sie zuerst einen Case, bevor Workflow-Links repariert werden."
            },
            CaseWorkflowLinksRepaired: {
                en: "Workflow links repaired for active case.",
                de: "Workflow-Links für den aktiven Case repariert."
            },
            CaseOpenBeforeCreatingChain: {
                en: "Open a case before creating a workflow chain.",
                de: "Öffnen Sie zuerst einen Case, bevor eine Workflow-Kette erstellt wird."
            },
            CaseEvidenceTitleField: {
                en: "Evidence title",
                de: "Evidence-Titel"
            },
            CaseEvidenceDescriptionField: {
                en: "Evidence description",
                de: "Evidence-Beschreibung"
            },
            CaseEvidenceTypeField: {
                en: "Evidence type",
                de: "Evidence-Typ"
            },
            CaseFindingTitleField: {
                en: "Finding title",
                de: "Finding-Titel"
            },
            CaseFindingDescriptionField: {
                en: "Finding description",
                de: "Finding-Beschreibung"
            },
            CaseFindingSeverityField: {
                en: "Finding severity",
                de: "Finding-Schweregrad"
            },
            CaseAssessmentTitleField: {
                en: "Assessment title",
                de: "Assessment-Titel"
            },
            CaseAssessmentDescriptionField: {
                en: "Assessment description",
                de: "Assessment-Beschreibung"
            },
            CaseAssessmentSeverityField: {
                en: "Assessment severity",
                de: "Assessment-Schweregrad"
            },
            CaseRecommendationTitleField: {
                en: "Recommendation title",
                de: "Recommendation-Titel"
            },
            CaseRecommendationDescriptionField: {
                en: "Recommendation description",
                de: "Recommendation-Beschreibung"
            },
            CaseRecommendationPriorityField: {
                en: "Recommendation priority",
                de: "Recommendation-Priorität"
            },
            CaseDecisionTitleField: {
                en: "Decision title",
                de: "Decision-Titel"
            },
            CaseDecisionDescriptionField: {
                en: "Decision description",
                de: "Decision-Beschreibung"
            },
            CaseDecisionTypeField: {
                en: "Decision type",
                de: "Decision-Typ"
            },
            CaseReportDescriptionField: {
                en: "Report description",
                de: "Report-Beschreibung"
            },
            CaseTitlePrompt: {
                en: "Case title:",
                de: "Case-Titel:"
            },
            CaseClientContextPrompt: {
                en: "Client / Property context:",
                de: "Kunde / Objektkontext:"
            },
            CaseTypePrompt: {
                en: "Case type:",
                de: "Case-Typ:"
            },
            CaseStatusPrompt: {
                en: "Status:",
                de: "Status:"
            },
            CaseBuildingReferencePrompt: {
                en: "Building ID / reference:",
                de: "Gebäude-ID / Referenz:"
            },
            CaseInspectionReferencePrompt: {
                en: "Inspection ID / reference:",
                de: "Inspection-ID / Referenz:"
            },
            CaseEditTitle: {
                en: "Edit Case",
                de: "Case bearbeiten"
            },
            CaseSaveAction: {
                en: "Save Case",
                de: "Case speichern"
            },
            CaseDeleteConfirmPrefix: {
                en: "Delete case",
                de: "Case löschen"
            },
            CaseTitleFieldLabel: {
                en: "Case title",
                de: "Case-Titel"
            },
            CaseClientContextFieldLabel: {
                en: "Client / Property context",
                de: "Kunde / Objektkontext"
            },
            CaseBuildingReferenceFieldLabel: {
                en: "Building ID / reference",
                de: "Gebäude-ID / Referenz"
            },
            CaseInspectionReferenceFieldLabel: {
                en: "Inspection ID / reference",
                de: "Inspection-ID / Referenz"
            },
            EvidenceWorkspaceTitle: {
                en: "Evidence Workspace",
                de: "Evidence Workspace"
            },
            EvidenceCollectionTitle: {
                en: "Evidence Collection",
                de: "Evidence Collection"
            },
            EvidenceActivePrefix: {
                en: "Active evidence",
                de: "Aktive Evidence"
            },
            EvidenceNewAction: {
                en: "+ New Evidence",
                de: "+ Neue Evidence"
            },
            EvidenceEmptyTitle: {
                en: "No evidence available",
                de: "Keine Evidence verfügbar"
            },
            EvidenceEmptyDescription: {
                en: "Add photos, documents, inspection notes, or technical records to begin the evidence chain.",
                de: "Fotos, Dokumente, Inspection Notes oder technische Datensätze hinzufügen, um die Evidence-Kette zu starten."
            },
            EvidenceItemFallback: {
                en: "Evidence Item",
                de: "Evidence-Eintrag"
            },
            EvidenceDefaultType: {
                en: "Evidence",
                de: "Evidence"
            },
            EvidenceInspectionCaptured: {
                en: "Inspection evidence captured",
                de: "Inspection Evidence erfasst"
            },
            EvidenceIdentified: {
                en: "Evidence identified",
                de: "Evidence identifiziert"
            },
            EvidenceClassified: {
                en: "Evidence classified",
                de: "Evidence klassifiziert"
            },
            EvidenceSourceLinked: {
                en: "Source linked",
                de: "Quelle verknüpft"
            },
            EvidenceCreateConfirmFinding: {
                en: "Create or confirm finding",
                de: "Finding erstellen oder bestätigen"
            },
            EvidenceReadyForFinding: {
                en: "Evidence is reviewed and ready to support a technical finding.",
                de: "Evidence ist geprüft und bereit, ein technisches Finding zu unterstützen."
            },
            EvidenceReviewLinkedFinding: {
                en: "Review linked finding",
                de: "Verknüpftes Finding prüfen"
            },
            EvidenceReviewEvidence: {
                en: "Review evidence",
                de: "Evidence prüfen"
            },
            EvidenceCompletionLabel: {
                en: "Evidence completion",
                de: "Evidence-Vollständigkeit"
            },
            EvidenceToFindingLabel: {
                en: "Evidence → Finding",
                de: "Evidence → Finding"
            },
            EvidenceTotalMetric: {
                en: "Total Evidence",
                de: "Evidence gesamt"
            },
            EvidenceSelectedMetric: {
                en: "Selected",
                de: "Ausgewählt"
            },
            EvidenceLinkedFindingsMetric: {
                en: "Linked Findings",
                de: "Verknüpfte Findings"
            },
            EvidenceReviewStatusMetric: {
                en: "Review Status",
                de: "Review-Status"
            },
            EvidenceRefreshAction: {
                en: "Refresh",
                de: "Aktualisieren"
            },
            EvidenceCloseAction: {
                en: "Close Evidence",
                de: "Evidence schließen"
            },
            EvidenceUploadAction: {
                en: "Upload",
                de: "Upload"
            },
            EvidenceCreateFindingAction: {
                en: "Create Finding",
                de: "Finding erstellen"
            },
            EvidenceDeleteConfirmPrefix: {
                en: "Delete evidence",
                de: "Evidence löschen"
            },
            EvidenceDeletedNotification: {
                en: "Evidence deleted.",
                de: "Evidence gelöscht."
            },
            EvidenceContextTitle: {
                en: "Evidence Context",
                de: "Evidence-Kontext"
            },
            EvidenceItemsLabel: {
                en: "Evidence Items",
                de: "Evidence-Einträge"
            },
            EvidenceSelectedLabel: {
                en: "Selected Evidence",
                de: "Ausgewählte Evidence"
            },
            EvidenceNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            EvidenceStatusLabel: {
                en: "Evidence Status",
                de: "Evidence-Status"
            },
            EvidenceInReview: {
                en: "In Review",
                de: "In Prüfung"
            },
            EvidenceNotStarted: {
                en: "Not started",
                de: "Nicht gestartet"
            },
            EvidenceWorkspaceStatusLabel: {
                en: "Workspace Status",
                de: "Workspace-Status"
            },
            EvidenceNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            EvidenceCreateOrSelect: {
                en: "Create or select evidence",
                de: "Evidence erstellen oder auswählen"
            },
            EvidenceSafetyBoundariesLabel: {
                en: "Safety Boundaries",
                de: "Safety Boundaries"
            },
            EvidenceCaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            EvidenceBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            EvidenceInspectionIdLabel: {
                en: "Inspection ID",
                de: "Inspection-ID"
            },
            EvidenceSourceLabel: {
                en: "Source",
                de: "Quelle"
            },
            EvidenceManualEvidence: {
                en: "Manual Evidence",
                de: "Manuelle Evidence"
            },
            EvidenceQuestionIdLabel: {
                en: "Question ID",
                de: "Question-ID"
            },
            EvidenceQuestionLabel: {
                en: "Question",
                de: "Frage"
            },
            EvidenceRequiredEvidenceLabel: {
                en: "Required Evidence",
                de: "Erforderliche Evidence"
            },
            EvidenceScopeIdLabel: {
                en: "Scope ID",
                de: "Scope-ID"
            },
            EvidenceFindingIdsLabel: {
                en: "Finding IDs",
                de: "Finding-IDs"
            },
            EvidenceNone: {
                en: "None",
                de: "Keine"
            },
            EvidenceNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            EvidenceSelectFirstWarning: {
                en: "Select evidence first.",
                de: "Zuerst Evidence auswählen."
            },
            EvidenceNotLinkedCaseWarning: {
                en: "Selected evidence is not linked to a case.",
                de: "Ausgewählte Evidence ist nicht mit einem Case verknüpft."
            },
            EvidenceBelongsOtherCaseWarning: {
                en: "Selected evidence belongs to another case.",
                de: "Ausgewählte Evidence gehört zu einem anderen Case."
            },
            EvidenceFindingDraftCreated: {
                en: "Finding draft created. Expert review required.",
                de: "Finding Draft erstellt. Fachliche Prüfung erforderlich."
            },
            EvidenceSelectBeforeEditing: {
                en: "Select evidence before editing.",
                de: "Evidence vor dem Bearbeiten auswählen."
            },
            EvidenceEditTitle: {
                en: "Edit Evidence",
                de: "Evidence bearbeiten"
            },
            EvidenceSaveAction: {
                en: "Save Evidence",
                de: "Evidence speichern"
            },
            EvidenceTitleField: {
                en: "Evidence title",
                de: "Evidence-Titel"
            },
            EvidenceDescriptionField: {
                en: "Description",
                de: "Beschreibung"
            },
            EvidenceTypeField: {
                en: "Evidence type",
                de: "Evidence-Typ"
            },
            EvidenceFileNameField: {
                en: "File name",
                de: "Dateiname"
            },
            EvidenceFileTypeField: {
                en: "File type",
                de: "Dateityp"
            },
            EvidenceFileReferenceField: {
                en: "File reference",
                de: "Dateireferenz"
            },
            EvidenceCaptureMethodField: {
                en: "Capture method",
                de: "Erfassungsmethode"
            },
            EvidenceLocationLabelField: {
                en: "Location label",
                de: "Positionsangabe"
            },
            EvidenceInspectionAreaField: {
                en: "Inspection area",
                de: "Prüfbereich"
            },
            EvidenceMeasurementField: {
                en: "Measurement",
                de: "Messwert"
            },
            EvidenceMeasurementValueField: {
                en: "Measurement value",
                de: "Messwert"
            },
            EvidenceMeasurementUnitField: {
                en: "Measurement unit",
                de: "Messeinheit"
            },
            EvidenceReviewStatusField: {
                en: "Review status",
                de: "Review-Status"
            },
            EvidenceExpertReviewRequiredField: {
                en: "Expert review required",
                de: "Expertenprüfung erforderlich"
            },
            EvidenceYes: {
                en: "Yes",
                de: "Ja"
            },
            EvidenceNo: {
                en: "No",
                de: "Nein"
            },
            EvidenceUpdatedNotification: {
                en: "Evidence updated.",
                de: "Evidence aktualisiert."
            },
            EvidenceOpenCaseFirst: {
                en: "Open a case before creating evidence.",
                de: "Öffnen Sie zuerst einen Case, bevor Evidence erstellt wird."
            },
            EvidenceNewTitle: {
                en: "New Evidence",
                de: "Neue Evidence"
            },
            EvidenceCreateAction: {
                en: "Create Evidence",
                de: "Evidence erstellen"
            },
            EvidenceCreatedNotification: {
                en: "Evidence created.",
                de: "Evidence erstellt."
            },
            EvidencePendingFeatureSuffix: {
                en: "is reserved for a later workspace release.",
                de: "ist für ein späteres Workspace-Release reserviert."
            },
            EvidenceLowQuality: {
                en: "Low evidence quality",
                de: "Geringe Evidence-Qualität"
            },
            EvidenceLowQualityDescription: {
                en: "Evidence is still incomplete. Add content, source and classification before deriving a finding.",
                de: "Evidence ist noch unvollständig. Inhalt, Quelle und Klassifizierung ergänzen, bevor ein Finding abgeleitet wird."
            },
            EvidenceStrongQuality: {
                en: "Strong evidence quality",
                de: "Starke Evidence-Qualität"
            },
            EvidenceStrongQualityDescription: {
                en: "Evidence is well structured and connected to the downstream finding workflow.",
                de: "Evidence ist gut strukturiert und mit dem nachgelagerten Finding-Workflow verknüpft."
            },
            EvidenceDevelopingQuality: {
                en: "Developing evidence quality",
                de: "Evidence-Qualität in Entwicklung"
            },
            EvidenceDevelopingQualityDescription: {
                en: "Evidence has useful substance, but source or finding linkage may still be missing.",
                de: "Evidence enthält nutzbare Substanz, aber Quelle oder Finding-Verknüpfung können noch fehlen."
            },
            EvidenceReviewLinkedFindingAction: {
                en: "Review linked finding",
                de: "Verknüpftes Finding prüfen"
            },
            EvidenceReviewLinkedFindingDescription: {
                en: "Evidence is connected to a finding. Review whether the finding reflects the evidence accurately.",
                de: "Evidence ist mit einem Finding verknüpft. Prüfen, ob das Finding die Evidence korrekt widerspiegelt."
            },
            EvidenceCreateOrLinkFinding: {
                en: "Create or link finding",
                de: "Finding erstellen oder verknüpfen"
            },
            EvidenceCreateOrLinkFindingDescription: {
                en: "Evidence content is available. Connect it to a technical finding.",
                de: "Evidence-Inhalt ist vorhanden. Mit einem technischen Finding verknüpfen."
            },
            EvidenceCaptureContent: {
                en: "Capture evidence content",
                de: "Evidence-Inhalt erfassen"
            },
            EvidenceCaptureContentDescription: {
                en: "Add a note, document, photo or description before moving toward finding creation.",
                de: "Notiz, Dokument, Foto oder Beschreibung ergänzen, bevor ein Finding erstellt wird."
            },
            EvidenceIntelligenceComplete: {
                en: "Evidence intelligence complete",
                de: "Evidence Intelligence vollständig"
            },
            EvidenceIntelligenceDeveloping: {
                en: "Evidence intelligence developing",
                de: "Evidence Intelligence in Entwicklung"
            },
            EvidenceIntelligenceEarly: {
                en: "Evidence intelligence early",
                de: "Evidence Intelligence frühe Phase"
            },
            EvidenceIntelligenceLabel: {
                en: "Evidence Intelligence",
                de: "Evidence Intelligence"
            },
            EvidenceChecksCompleted: {
                en: "evidence intelligence checks completed",
                de: "Evidence-Intelligence-Prüfungen abgeschlossen"
            },
            EvidenceFindingReadiness: {
                en: "Finding Readiness",
                de: "Finding-Bereitschaft"
            },
            EvidenceFindingReadinessDescription: {
                en: "Readiness based on identity, classification, source, content, finding link and review state.",
                de: "Bereitschaft basierend auf Identität, Klassifizierung, Quelle, Inhalt, Finding-Verknüpfung und Review-Status."
            },
            EvidenceQualitySignalLabel: {
                en: "Evidence Quality Signal",
                de: "Evidence-Qualitätssignal"
            },
            EvidenceNextActionLabel: {
                en: "Next Evidence Action",
                de: "Nächste Evidence-Aktion"
            },
            EvidenceStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            EvidenceStatusOpen: {
                en: "Open",
                de: "Offen"
            },
            EvidenceStatusCaptured: {
                en: "Captured",
                de: "Erfasst"
            },
            EvidenceStatusLinked: {
                en: "Linked",
                de: "Verknüpft"
            },
            EvidenceStatusReviewed: {
                en: "Reviewed",
                de: "Geprüft"
            },
            EvidenceStatusBlocked: {
                en: "Blocked",
                de: "Blockiert"
            },
            FindingWorkspaceTitle: {
                en: "Finding Workspace",
                de: "Finding Workspace"
            },
            FindingTechnicalFindingsTitle: {
                en: "Technical Findings",
                de: "Technische Findings"
            },
            FindingActivePrefix: {
                en: "Active finding",
                de: "Aktives Finding"
            },
            FindingNewAction: {
                en: "+ New Finding",
                de: "+ Neues Finding"
            },
            FindingEmptyTitle: {
                en: "No findings available",
                de: "Keine Findings verfügbar"
            },
            FindingEmptyDescription: {
                en: "Create technical findings from evidence to begin the assessment chain.",
                de: "Technische Findings aus Evidence erstellen, um die Assessment-Kette zu starten."
            },
            FindingToAssessmentLabel: {
                en: "Finding → Assessment",
                de: "Finding → Assessment"
            },
            FindingSeverityDefined: {
                en: "Severity defined",
                de: "Schweregrad definiert"
            },
            FindingEvidenceLinked: {
                en: "Evidence linked",
                de: "Evidence verknüpft"
            },
            FindingAssessmentConnection: {
                en: "Assessment connection",
                de: "Assessment-Verbindung"
            },
            FindingReadyForAssessment: {
                en: "Ready for Assessment",
                de: "Bereit für Assessment"
            },
            FindingTotalMetric: {
                en: "Findings",
                de: "Findings"
            },
            FindingReviewedMetric: {
                en: "Reviewed",
                de: "Geprüft"
            },
            FindingOpenMetric: {
                en: "Open",
                de: "Offen"
            },
            FindingLinkedAssessmentsMetric: {
                en: "Linked Assessments",
                de: "Verknüpfte Assessments"
            },
            FindingRefreshAction: {
                en: "Refresh",
                de: "Aktualisieren"
            },
            FindingCloseAction: {
                en: "Close Finding",
                de: "Finding schließen"
            },
            FindingLinkEvidenceAction: {
                en: "Link Evidence",
                de: "Evidence verknüpfen"
            },
            FindingCreateAssessmentAction: {
                en: "Create Assessment",
                de: "Assessment erstellen"
            },
            FindingContextTitle: {
                en: "Finding Context",
                de: "Finding-Kontext"
            },
            FindingSelectedLabel: {
                en: "Selected Finding",
                de: "Ausgewähltes Finding"
            },
            FindingNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            FindingStatusLabel: {
                en: "Finding Status",
                de: "Finding-Status"
            },
            FindingInReview: {
                en: "In Review",
                de: "In Prüfung"
            },
            FindingNotStarted: {
                en: "Not started",
                de: "Nicht gestartet"
            },
            FindingWorkspaceStatusLabel: {
                en: "Workspace Status",
                de: "Workspace-Status"
            },
            FindingNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            FindingCreateOrSelect: {
                en: "Create or select a finding",
                de: "Finding erstellen oder auswählen"
            },
            FindingSafetyBoundariesLabel: {
                en: "Safety Boundaries",
                de: "Safety Boundaries"
            },
            FindingSourceLabel: {
                en: "Source",
                de: "Quelle"
            },
            FindingExpertReview: {
                en: "Expert Review",
                de: "Fachliche Prüfung"
            },
            FindingCaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            FindingBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            FindingInspectionIdLabel: {
                en: "Inspection ID",
                de: "Inspection-ID"
            },
            FindingEvidenceIdsLabel: {
                en: "Evidence IDs",
                de: "Evidence-IDs"
            },
            FindingCategoryLabel: {
                en: "Category",
                de: "Kategorie"
            },
            FindingGeneral: {
                en: "General",
                de: "Allgemein"
            },
            FindingBuildingSystemLabel: {
                en: "Building System",
                de: "Gebäudesystem"
            },
            FindingSeverityLabel: {
                en: "Severity",
                de: "Schweregrad"
            },
            FindingNormal: {
                en: "Normal",
                de: "Normal"
            },
            FindingDescriptionLabel: {
                en: "Description",
                de: "Beschreibung"
            },
            FindingNoDescription: {
                en: "No description",
                de: "Keine Beschreibung"
            },
            FindingAssessmentIdsLabel: {
                en: "Assessment IDs",
                de: "Assessment-IDs"
            },
            FindingNone: {
                en: "None",
                de: "Keine"
            },
            FindingNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            FindingSelectFirstWarning: {
                en: "Select a finding first.",
                de: "Zuerst ein Finding auswählen."
            },
            FindingNotLinkedCaseWarning: {
                en: "Selected finding is not linked to a case.",
                de: "Ausgewähltes Finding ist nicht mit einem Case verknüpft."
            },
            FindingBelongsOtherCaseWarning: {
                en: "Selected finding belongs to another case.",
                de: "Ausgewähltes Finding gehört zu einem anderen Case."
            },
            FindingAssessmentDraftCreated: {
                en: "Assessment draft created. Expert review required.",
                de: "Assessment Draft erstellt. Fachliche Prüfung erforderlich."
            },
            FindingSelectBeforeEditing: {
                en: "Select a finding before editing.",
                de: "Finding vor dem Bearbeiten auswählen."
            },
            FindingEditTitle: {
                en: "Edit Finding",
                de: "Finding bearbeiten"
            },
            FindingSaveAction: {
                en: "Save Finding",
                de: "Finding speichern"
            },
            FindingTitleField: {
                en: "Finding title",
                de: "Finding-Titel"
            },
            FindingUpdatedNotification: {
                en: "Finding updated.",
                de: "Finding aktualisiert."
            },
            FindingDeleteConfirmPrefix: {
                en: "Delete finding",
                de: "Finding löschen"
            },
            FindingDeletedNotification: {
                en: "Finding deleted.",
                de: "Finding gelöscht."
            },
            FindingOpenCaseFirst: {
                en: "Open a case before creating a finding.",
                de: "Öffnen Sie zuerst einen Case, bevor ein Finding erstellt wird."
            },
            FindingNewTitle: {
                en: "New Finding",
                de: "Neues Finding"
            },
            FindingCreateAction: {
                en: "Create Finding",
                de: "Finding erstellen"
            },
            FindingSelectEvidenceBeforeCreating: {
                en: "Select evidence before creating a finding.",
                de: "Evidence auswählen, bevor ein Finding erstellt wird."
            },
            FindingCreatedNotification: {
                en: "Finding created.",
                de: "Finding erstellt."
            },
            FindingPendingFeatureSuffix: {
                en: "is reserved for a later workspace release.",
                de: "ist für ein späteres Workspace-Release reserviert."
            },
            FindingLowSeveritySignal: {
                en: "Low severity signal",
                de: "Geringes Schweregrad-Signal"
            },
            FindingLowSeveritySignalDescription: {
                en: "Finding severity is still unclear. Define severity, probability or risk level before assessment.",
                de: "Der Finding-Schweregrad ist noch unklar. Schweregrad, Wahrscheinlichkeit oder Risikoniveau vor dem Assessment definieren."
            },
            FindingStrongSeveritySignal: {
                en: "Strong severity signal",
                de: "Starkes Schweregrad-Signal"
            },
            FindingStrongSeveritySignalDescription: {
                en: "Finding has severity context, evidence support and downstream assessment connection.",
                de: "Das Finding hat Schweregrad-Kontext, Evidence-Unterstützung und eine nachgelagerte Assessment-Verbindung."
            },
            FindingDevelopingSeveritySignal: {
                en: "Developing severity signal",
                de: "Schweregrad-Signal in Entwicklung"
            },
            FindingDevelopingSeveritySignalDescription: {
                en: "Finding has useful severity context but may still need evidence or assessment linkage.",
                de: "Das Finding hat nutzbaren Schweregrad-Kontext, benötigt aber möglicherweise noch Evidence- oder Assessment-Verknüpfung."
            },
            FindingReviewLinkedAssessment: {
                en: "Review linked assessment",
                de: "Verknüpftes Assessment prüfen"
            },
            FindingReviewLinkedAssessmentDescription: {
                en: "Finding is connected to an assessment. Review whether risk logic reflects the finding accurately.",
                de: "Das Finding ist mit einem Assessment verknüpft. Prüfen, ob die Risikologik das Finding korrekt widerspiegelt."
            },
            FindingCreateOrLinkAssessment: {
                en: "Create or link assessment",
                de: "Assessment erstellen oder verknüpfen"
            },
            FindingCreateOrLinkAssessmentDescription: {
                en: "Finding is sufficiently described. Connect it to a technical assessment.",
                de: "Das Finding ist ausreichend beschrieben. Mit einem technischen Assessment verknüpfen."
            },
            FindingDefineSeverity: {
                en: "Define finding severity",
                de: "Finding-Schweregrad definieren"
            },
            FindingDefineSeverityDescription: {
                en: "Add severity, description and evidence context before moving toward assessment.",
                de: "Schweregrad, Beschreibung und Evidence-Kontext ergänzen, bevor ein Assessment erstellt wird."
            },
            FindingIntelligenceComplete: {
                en: "Finding intelligence complete",
                de: "Finding Intelligence vollständig"
            },
            FindingIntelligenceDeveloping: {
                en: "Finding intelligence developing",
                de: "Finding Intelligence in Entwicklung"
            },
            FindingIntelligenceEarly: {
                en: "Finding intelligence early",
                de: "Finding Intelligence frühe Phase"
            },
            FindingIntelligenceLabel: {
                en: "Finding Intelligence",
                de: "Finding Intelligence"
            },
            FindingChecksCompleted: {
                en: "finding intelligence checks completed",
                de: "Finding-Intelligence-Prüfungen abgeschlossen"
            },
            FindingAssessmentReadiness: {
                en: "Assessment Readiness",
                de: "Assessment-Bereitschaft"
            },
            FindingAssessmentReadinessDescription: {
                en: "Readiness based on identity, classification, severity, description, evidence link, assessment link and review state.",
                de: "Bereitschaft basierend auf Identität, Klassifizierung, Schweregrad, Beschreibung, Evidence-Link, Assessment-Link und Review-Status."
            },
            FindingSeveritySignalLabel: {
                en: "Severity Signal",
                de: "Schweregrad-Signal"
            },
            FindingNextActionLabel: {
                en: "Next Finding Action",
                de: "Nächste Finding-Aktion"
            },
            FindingStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            FindingStatusOpen: {
                en: "Open",
                de: "Offen"
            },
            FindingStatusIdentified: {
                en: "Identified",
                de: "Identifiziert"
            },
            FindingStatusAssessed: {
                en: "Assessed",
                de: "Bewertet"
            },
            FindingStatusReviewed: {
                en: "Reviewed",
                de: "Geprüft"
            },
            FindingStatusBlocked: {
                en: "Blocked",
                de: "Blockiert"
            },
            AssessmentWorkspaceTitle: {
                en: "Assessment Workspace",
                de: "Assessment Workspace"
            },
            AssessmentTitlePlural: {
                en: "Assessments",
                de: "Assessments"
            },
            AssessmentActivePrefix: {
                en: "Active assessment",
                de: "Aktives Assessment"
            },
            AssessmentNewAction: {
                en: "+ New Assessment",
                de: "+ Neues Assessment"
            },
            AssessmentEmptyTitle: {
                en: "No assessments available",
                de: "Keine Assessments verfügbar"
            },
            AssessmentEmptyDescription: {
                en: "Create risk assessments from findings to begin the recommendation chain.",
                de: "Risk Assessments aus Findings erstellen, um die Recommendation-Kette zu starten."
            },
            AssessmentRiskAssessmentDefined: {
                en: "Risk assessment defined",
                de: "Risk Assessment definiert"
            },
            AssessmentWorkflowRecommendation: {
                en: "Recommendation",
                de: "Recommendation"
            },
            AssessmentToRecommendationLabel: {
                en: "Assessment → Recommendation",
                de: "Assessment → Recommendation"
            },
            AssessmentTotalMetric: {
                en: "Assessments",
                de: "Assessments"
            },
            AssessmentHighRiskMetric: {
                en: "High Risk",
                de: "Hohes Risiko"
            },
            AssessmentLinkedRecommendationsMetric: {
                en: "Linked Recommendations",
                de: "Verknüpfte Recommendations"
            },
            AssessmentCloseAction: {
                en: "Close Assessment",
                de: "Assessment schließen"
            },
            AssessmentCreateAction: {
                en: "Create Assessment",
                de: "Assessment erstellen"
            },
            AssessmentCreateRecommendationAction: {
                en: "Create Recommendation",
                de: "Recommendation erstellen"
            },
            AssessmentContextTitle: {
                en: "Assessment Context",
                de: "Assessment-Kontext"
            },
            AssessmentSelectedLabel: {
                en: "Selected Assessment",
                de: "Ausgewähltes Assessment"
            },
            AssessmentNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            AssessmentTechnicalRiskLabel: {
                en: "Technical Risk",
                de: "Technisches Risiko"
            },
            AssessmentInReview: {
                en: "In Review",
                de: "In Prüfung"
            },
            AssessmentPending: {
                en: "Pending",
                de: "Ausstehend"
            },
            AssessmentWorkspaceStatusLabel: {
                en: "Workspace Status",
                de: "Workspace-Status"
            },
            AssessmentNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            AssessmentCreateOrSelect: {
                en: "Create or select an assessment",
                de: "Assessment erstellen oder auswählen"
            },
            AssessmentSafetyBoundariesLabel: {
                en: "Safety Boundaries",
                de: "Safety Boundaries"
            },
            AssessmentCaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            AssessmentBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            AssessmentInspectionIdLabel: {
                en: "Inspection ID",
                de: "Inspection-ID"
            },
            AssessmentFindingIdsLabel: {
                en: "Finding IDs",
                de: "Finding-IDs"
            },
            AssessmentEvidenceIdsLabel: {
                en: "Evidence IDs",
                de: "Evidence-IDs"
            },
            AssessmentCategoryLabel: {
                en: "Category",
                de: "Kategorie"
            },
            AssessmentBuildingSystemLabel: {
                en: "Building System",
                de: "Gebäudesystem"
            },
            AssessmentSeverityLabel: {
                en: "Severity",
                de: "Schweregrad"
            },
            AssessmentProbabilityLabel: {
                en: "Probability",
                de: "Wahrscheinlichkeit"
            },
            AssessmentConsequenceLabel: {
                en: "Consequence",
                de: "Auswirkung"
            },
            AssessmentPriorityLabel: {
                en: "Priority",
                de: "Priorität"
            },
            AssessmentRiskScoreLabel: {
                en: "Risk Score",
                de: "Risk Score"
            },
            AssessmentNoDescription: {
                en: "No description",
                de: "Keine Beschreibung"
            },
            AssessmentRecommendationIdsLabel: {
                en: "Recommendation IDs",
                de: "Recommendation-IDs"
            },
            AssessmentNone: {
                en: "None",
                de: "Keine"
            },
            AssessmentNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            AssessmentGeneral: {
                en: "General",
                de: "Allgemein"
            },
            AssessmentUnrated: {
                en: "Unrated",
                de: "Nicht bewertet"
            },
            AssessmentRiskPrefix: {
                en: "Risk",
                de: "Risiko"
            },
            AssessmentRecommendationDraftCreated: {
                en: "Recommendation draft created. Expert review required. No automatic decision created.",
                de: "Recommendation Draft erstellt. Fachliche Prüfung erforderlich. Keine automatische Decision erstellt."
            },
            AssessmentOpenCaseFirst: {
                en: "Open a case before creating an assessment.",
                de: "Öffnen Sie zuerst einen Case, bevor ein Assessment erstellt wird."
            },
            AssessmentNewTitle: {
                en: "New Assessment",
                de: "Neues Assessment"
            },
            AssessmentTitleField: {
                en: "Assessment title",
                de: "Assessment-Titel"
            },
            AssessmentDescriptionField: {
                en: "Description",
                de: "Beschreibung"
            },
            AssessmentSelectFindingBeforeCreating: {
                en: "Select a finding before creating an assessment.",
                de: "Finding auswählen, bevor ein Assessment erstellt wird."
            },
            AssessmentCreatedNotification: {
                en: "Assessment created.",
                de: "Assessment erstellt."
            },
            AssessmentSelectBeforeEditing: {
                en: "Select an assessment before editing.",
                de: "Assessment vor dem Bearbeiten auswählen."
            },
            AssessmentEditTitle: {
                en: "Edit Assessment",
                de: "Assessment bearbeiten"
            },
            AssessmentSaveAction: {
                en: "Save Assessment",
                de: "Assessment speichern"
            },
            AssessmentUpdatedNotification: {
                en: "Assessment updated.",
                de: "Assessment aktualisiert."
            },
            AssessmentDeleteConfirmPrefix: {
                en: "Delete assessment",
                de: "Assessment löschen"
            },
            AssessmentDeletedNotification: {
                en: "Assessment deleted.",
                de: "Assessment gelöscht."
            },
            AssessmentPendingFeatureSuffix: {
                en: "is reserved for a later workspace release.",
                de: "ist für ein späteres Workspace-Release reserviert."
            },
            AssessmentLowRiskLogic: {
                en: "Low risk logic",
                de: "Geringe Risikologik"
            },
            AssessmentLowRiskLogicDescription: {
                en: "Assessment risk logic is still incomplete. Define risk level, severity, probability and impact.",
                de: "Die Assessment-Risikologik ist noch unvollständig. Risikoniveau, Schweregrad, Wahrscheinlichkeit und Auswirkung definieren."
            },
            AssessmentStrongRiskLogic: {
                en: "Strong risk logic",
                de: "Starke Risikologik"
            },
            AssessmentStrongRiskLogicDescription: {
                en: "Assessment contains complete risk logic and is connected to downstream recommendation.",
                de: "Das Assessment enthält vollständige Risikologik und ist mit einer nachgelagerten Recommendation verknüpft."
            },
            AssessmentDevelopingRiskLogic: {
                en: "Developing risk logic",
                de: "Risikologik in Entwicklung"
            },
            AssessmentDevelopingRiskLogicDescription: {
                en: "Assessment contains useful risk context but still needs complete risk parameters or recommendation linkage.",
                de: "Das Assessment enthält nutzbaren Risikokontext, benötigt aber noch vollständige Risikoparameter oder Recommendation-Verknüpfung."
            },
            AssessmentReviewLinkedRecommendation: {
                en: "Review linked recommendation",
                de: "Verknüpfte Recommendation prüfen"
            },
            AssessmentReviewLinkedRecommendationDescription: {
                en: "Assessment is connected to a recommendation. Review whether action logic reflects the risk assessment.",
                de: "Das Assessment ist mit einer Recommendation verknüpft. Prüfen, ob die Handlungslogik das Risk Assessment korrekt widerspiegelt."
            },
            AssessmentCreateOrLinkRecommendation: {
                en: "Create or link recommendation",
                de: "Recommendation erstellen oder verknüpfen"
            },
            AssessmentCreateOrLinkRecommendationDescription: {
                en: "Risk logic is complete enough to derive a recommended action.",
                de: "Die Risikologik ist ausreichend vollständig, um eine empfohlene Maßnahme abzuleiten."
            },
            AssessmentCompleteRiskLogic: {
                en: "Complete risk logic",
                de: "Risikologik vervollständigen"
            },
            AssessmentCompleteRiskLogicDescription: {
                en: "Define risk level, severity, probability and impact before creating a recommendation.",
                de: "Risikoniveau, Schweregrad, Wahrscheinlichkeit und Auswirkung definieren, bevor eine Recommendation erstellt wird."
            },
            AssessmentIntelligenceComplete: {
                en: "Assessment intelligence complete",
                de: "Assessment Intelligence vollständig"
            },
            AssessmentIntelligenceDeveloping: {
                en: "Assessment intelligence developing",
                de: "Assessment Intelligence in Entwicklung"
            },
            AssessmentIntelligenceEarly: {
                en: "Assessment intelligence early",
                de: "Assessment Intelligence frühe Phase"
            },
            AssessmentIntelligenceLabel: {
                en: "Assessment Intelligence",
                de: "Assessment Intelligence"
            },
            AssessmentChecksCompleted: {
                en: "assessment intelligence checks completed",
                de: "Assessment-Intelligence-Prüfungen abgeschlossen"
            },
            AssessmentRecommendationReadiness: {
                en: "Recommendation Readiness",
                de: "Recommendation-Bereitschaft"
            },
            AssessmentRecommendationReadinessDescription: {
                en: "Readiness based on identity, risk logic, finding link, recommendation link and review state.",
                de: "Bereitschaft basierend auf Identität, Risikologik, Finding-Link, Recommendation-Link und Review-Status."
            },
            AssessmentRiskLogicSignalLabel: {
                en: "Risk Logic Signal",
                de: "Risikologik-Signal"
            },
            AssessmentNextActionLabel: {
                en: "Next Assessment Action",
                de: "Nächste Assessment-Aktion"
            },
            AssessmentActionRecommendationDerived: {
                en: "Action recommendation derived",
                de: "Handlungsempfehlung abgeleitet"
            },
            AssessmentActiveFlowLabel: {
                en: "Active Flow",
                de: "Aktiver Workflow"
            },
            AssessmentNextActionHeading: {
                en: "Next Action",
                de: "Nächste Aktion"
            },
            AssessmentHeaderDescription: {
                en: "Evaluate findings, determine condition, estimate remaining useful life, assess technical risk, and prepare CAPEX planning.",
                de: "Findings bewerten, Zustand bestimmen, Restnutzungsdauer einschätzen, technisches Risiko beurteilen und CAPEX-Planung vorbereiten."
            },
            AssessmentAcceptedMetric: {
                en: "Accepted",
                de: "Akzeptiert"
            },
            AssessmentItemFallback: {
                en: "Assessment Item",
                de: "Assessment-Eintrag"
            },
            AssessmentEmptyStateDescriptionLong: {
                en: "Assessment records will translate findings into condition, risk, remaining useful life, and CAPEX logic.",
                de: "Assessment-Datensätze übersetzen Findings in Zustand, Risiko, Restnutzungsdauer und CAPEX-Logik."
            },
            AssessmentSourceLabel: {
                en: "Source",
                de: "Quelle"
            },
            AssessmentReviewSource: {
                en: "Assessment Review",
                de: "Assessment Review"
            },
            AssessmentSelectFirstWarning: {
                en: "Select an assessment first.",
                de: "Zuerst ein Assessment auswählen."
            },
            AssessmentNotLinkedCaseWarning: {
                en: "Selected assessment is not linked to a case.",
                de: "Ausgewähltes Assessment ist nicht mit einem Case verknüpft."
            },
            AssessmentBelongsOtherCaseWarning: {
                en: "Selected assessment belongs to another case.",
                de: "Ausgewähltes Assessment gehört zu einem anderen Case."
            },
            AssessmentResolveBlocker: {
                en: "Resolve blocker",
                de: "Blocker lösen"
            },
            AssessmentResolveBlockerDescription: {
                en: "This assessment cannot move forward until the blocker is cleared.",
                de: "Dieses Assessment kann erst fortgeführt werden, wenn der Blocker gelöst ist."
            },
            AssessmentCreateConfirmRecommendation: {
                en: "Create or confirm recommendation",
                de: "Recommendation erstellen oder bestätigen"
            },
            AssessmentReadyForRecommendation: {
                en: "Assessment is reviewed and ready to support an action recommendation.",
                de: "Das Assessment ist geprüft und bereit, eine Handlungsempfehlung zu unterstützen."
            },
            AssessmentAlreadyLinkedRecommendationDescription: {
                en: "This assessment is already connected to a recommendation. Check action logic and completeness.",
                de: "Dieses Assessment ist bereits mit einer Recommendation verknüpft. Handlungslogik und Vollständigkeit prüfen."
            },
            AssessmentCreateRecommendationShort: {
                en: "Create recommendation",
                de: "Recommendation erstellen"
            },
            AssessmentCompleteEnoughForRecommendation: {
                en: "The assessment is complete enough to derive a recommended action.",
                de: "Das Assessment ist ausreichend vollständig, um eine empfohlene Maßnahme abzuleiten."
            },
            AssessmentCompleteAssessment: {
                en: "Complete assessment",
                de: "Assessment vervollständigen"
            },
            AssessmentCompleteAssessmentDescription: {
                en: "Define risk level, severity, probability or impact before creating a recommendation.",
                de: "Risikoniveau, Schweregrad, Wahrscheinlichkeit oder Auswirkung definieren, bevor eine Recommendation erstellt wird."
            },
            AssessmentActiveWorkflowStateLabel: {
                en: "Active workflow state",
                de: "Aktiver Workflow-Status"
            },
            AssessmentNextActionAriaLabel: {
                en: "Next action",
                de: "Nächste Aktion"
            },
            AssessmentRecommendationDraftPrefix: {
                en: "Recommendation Draft",
                de: "Recommendation Draft"
            },
            AssessmentRecommendationDraftFrom: {
                en: "Recommendation Draft from",
                de: "Recommendation Draft aus"
            },
            AssessmentAvailabilityActionText: {
                en: "Record document availability status and request expert review before using this information for assessment, recommendation, decision or report purposes.",
                de: "Dokumentenverfügbarkeit erfassen und fachliche Prüfung anfordern, bevor diese Information für Assessment, Recommendation, Decision oder Report verwendet wird."
            },
            AssessmentDefaultActionText: {
                en: "Review assessment context and define expert-approved next action.",
                de: "Assessment-Kontext prüfen und fachlich freigegebene nächste Maßnahme definieren."
            },
            AssessmentRecommendationPreparedFromSelected: {
                en: "Recommendation prepared from selected assessment.",
                de: "Recommendation aus ausgewähltem Assessment vorbereitet."
            },
            AssessmentRecommendationStatusLabel: {
                en: "Recommendation status:",
                de: "Recommendation-Status:"
            },
            AssessmentDraftRecommendationCreatedLine: {
                en: "Draft recommendation created from selected assessment.",
                de: "Draft Recommendation aus ausgewähltem Assessment erstellt."
            },
            AssessmentExpertReviewBeforeDecisionLine: {
                en: "Expert review required before decision or report use.",
                de: "Fachliche Prüfung vor Verwendung für Decision oder Report erforderlich."
            },
            AssessmentNoAutomaticDecisionLine: {
                en: "No automatic decision or purchase recommendation is created by this action.",
                de: "Durch diese Aktion wird keine automatische Decision oder Kaufempfehlung erstellt."
            },
            AssessmentReviewBoundaryLabel: {
                en: "Review boundary:",
                de: "Review-Grenze:"
            },
            AssessmentAvailabilityBoundaryLine: {
                en: "Document availability only. No legal, financial, technical or governance document review has been performed.",
                de: "Nur Dokumentenverfügbarkeit. Es wurde keine rechtliche, finanzielle, technische oder Governance-Dokumentenprüfung durchgeführt."
            },
            AssessmentRecommendationDraftBoundaryLine: {
                en: "This recommendation draft may only request, record or clarify document availability. It must not validate document content.",
                de: "Dieser Recommendation Draft darf nur Dokumentenverfügbarkeit anfordern, erfassen oder klären. Er darf keine Dokumenteninhalte validieren."
            },
            AssessmentThailandPattayaContextLabel: {
                en: "Thailand / Pattaya context:",
                de: "Thailand / Pattaya-Kontext:"
            },
            AssessmentFieldReviewContextLine: {
                en: "Field review context retained for downstream decision and reporting.",
                de: "Field-Review-Kontext bleibt für nachgelagerte Decision und Reporting erhalten."
            },
            AssessmentTraceLabel: {
                en: "Assessment trace:",
                de: "Assessment-Nachverfolgung:"
            },
            AssessmentIdTraceLabel: {
                en: "Assessment ID",
                de: "Assessment-ID"
            },
            AssessmentSourceTraceLabel: {
                en: "Assessment source",
                de: "Assessment-Quelle"
            },
            AssessmentSourceFindingIdsTraceLabel: {
                en: "Source Finding IDs",
                de: "Source-Finding-IDs"
            },
            AssessmentSourceEvidenceIdsTraceLabel: {
                en: "Source Evidence IDs",
                de: "Source-Evidence-IDs"
            },
            AssessmentSourcePolicyTraceLabel: {
                en: "Source policy",
                de: "Source Policy"
            },
            AssessmentRiskScoreTraceLabel: {
                en: "Risk score",
                de: "Risk Score"
            },
            AssessmentExpertReviewRequiredTraceLabel: {
                en: "Expert review required",
                de: "Fachliche Prüfung erforderlich"
            },
            AssessmentYes: {
                en: "Yes",
                de: "Ja"
            },
            AssessmentNo: {
                en: "No",
                de: "Nein"
            },
            AssessmentOptionGeneral: {
                en: "General",
                de: "Allgemein"
            },
            AssessmentOptionEnvelope: {
                en: "Envelope",
                de: "Gebäudehülle"
            },
            AssessmentOptionRoof: {
                en: "Roof",
                de: "Dach"
            },
            AssessmentOptionStructure: {
                en: "Structure",
                de: "Tragwerk"
            },
            AssessmentOptionMEP: {
                en: "MEP",
                de: "TGA"
            },
            AssessmentOptionMoisture: {
                en: "Moisture",
                de: "Feuchte"
            },
            AssessmentOptionFireSafety: {
                en: "Fire Safety",
                de: "Brandschutz"
            },
            AssessmentOptionOther: {
                en: "Other",
                de: "Sonstiges"
            },
            AssessmentOptionLow: {
                en: "Low",
                de: "Niedrig"
            },
            AssessmentOptionMedium: {
                en: "Medium",
                de: "Mittel"
            },
            AssessmentOptionHigh: {
                en: "High",
                de: "Hoch"
            },
            AssessmentOptionCritical: {
                en: "Critical",
                de: "Kritisch"
            },
            AssessmentStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            AssessmentStatusAssessed: {
                en: "Assessed",
                de: "Bewertet"
            },
            AssessmentStatusRecommended: {
                en: "Recommended",
                de: "Empfohlen"
            },
            AssessmentStatusReviewed: {
                en: "Reviewed",
                de: "Geprüft"
            },
            AssessmentStatusBlocked: {
                en: "Blocked",
                de: "Blockiert"
            },
            RecommendationWorkspaceTitle: {
                en: "Recommendation Workspace",
                de: "Recommendation Workspace"
            },
            RecommendationTitlePlural: {
                en: "Recommendations",
                de: "Recommendations"
            },
            RecommendationActivePrefix: {
                en: "Active recommendation",
                de: "Aktive Recommendation"
            },
            RecommendationNewAction: {
                en: "+ New Recommendation",
                de: "+ Neue Recommendation"
            },
            RecommendationEmptyTitle: {
                en: "No recommendations available",
                de: "Keine Recommendations verfügbar"
            },
            RecommendationEmptyDescription: {
                en: "Recommendations will translate assessment results into prioritized technical actions and decision support.",
                de: "Recommendations übersetzen Assessment-Ergebnisse in priorisierte technische Maßnahmen und Decision Support."
            },
            RecommendationWorkflowDecision: {
                en: "Decision",
                de: "Decision"
            },
            RecommendationToDecisionLabel: {
                en: "Recommendation → Decision",
                de: "Recommendation → Decision"
            },
            RecommendationTotalMetric: {
                en: "Recommendations",
                de: "Recommendations"
            },
            RecommendationHighPriorityMetric: {
                en: "High Priority",
                de: "Hohe Priorität"
            },
            RecommendationLinkedDecisionsMetric: {
                en: "Linked Decisions",
                de: "Verknüpfte Decisions"
            },
            RecommendationCloseAction: {
                en: "Close Recommendation",
                de: "Recommendation schließen"
            },
            RecommendationCreateAction: {
                en: "Create Recommendation",
                de: "Recommendation erstellen"
            },
            RecommendationCreateDecisionAction: {
                en: "Create Decision",
                de: "Decision erstellen"
            },
            RecommendationContextTitle: {
                en: "Recommendation Context",
                de: "Recommendation-Kontext"
            },
            RecommendationSelectedLabel: {
                en: "Selected Recommendation",
                de: "Ausgewählte Recommendation"
            },
            RecommendationNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            RecommendationWorkspaceStatusLabel: {
                en: "Workspace Status",
                de: "Workspace-Status"
            },
            RecommendationNoSelection: {
                en: "No selection",
                de: "Keine Auswahl"
            },
            RecommendationDecisionRelevanceLabel: {
                en: "Decision Relevance",
                de: "Decision-Relevanz"
            },
            RecommendationInReview: {
                en: "In Review",
                de: "In Prüfung"
            },
            RecommendationPending: {
                en: "Pending",
                de: "Ausstehend"
            },
            RecommendationSafetyBoundariesLabel: {
                en: "Safety Boundaries",
                de: "Safety Boundaries"
            },
            RecommendationSourceLabel: {
                en: "Source",
                de: "Quelle"
            },
            RecommendationAssessmentReviewSource: {
                en: "Assessment Review",
                de: "Assessment Review"
            },
            RecommendationCaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            RecommendationBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            RecommendationInspectionIdLabel: {
                en: "Inspection ID",
                de: "Inspection-ID"
            },
            RecommendationAssessmentIdsLabel: {
                en: "Assessment IDs",
                de: "Assessment-IDs"
            },
            RecommendationFindingIdsLabel: {
                en: "Finding IDs",
                de: "Finding-IDs"
            },
            RecommendationEvidenceIdsLabel: {
                en: "Evidence IDs",
                de: "Evidence-IDs"
            },
            RecommendationBuildingSystemLabel: {
                en: "Building System",
                de: "Gebäudesystem"
            },
            RecommendationPriorityLabel: {
                en: "Priority",
                de: "Priorität"
            },
            RecommendationTimeframeLabel: {
                en: "Timeframe",
                de: "Zeitrahmen"
            },
            RecommendationEstimatedCostLabel: {
                en: "Estimated cost",
                de: "Geschätzte Kosten"
            },
            RecommendationCurrencyLabel: {
                en: "Currency",
                de: "Währung"
            },
            RecommendationResponsibleLabel: {
                en: "Responsible",
                de: "Verantwortlich"
            },
            RecommendationDecisionImpactLabel: {
                en: "Decision impact",
                de: "Decision Impact"
            },
            RecommendationDecisionIdsLabel: {
                en: "Decision IDs",
                de: "Decision-IDs"
            },
            RecommendationNone: {
                en: "None",
                de: "Keine"
            },
            RecommendationNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            RecommendationTitleField: {
                en: "Recommendation title",
                de: "Recommendation-Titel"
            },
            RecommendationDescriptionField: {
                en: "Description",
                de: "Beschreibung"
            },
            RecommendationActionField: {
                en: "Recommended action",
                de: "Empfohlene Maßnahme"
            },
            RecommendationOpenCaseFirst: {
                en: "Open a case before creating a recommendation.",
                de: "Öffnen Sie zuerst einen Case, bevor eine Recommendation erstellt wird."
            },
            RecommendationNewTitle: {
                en: "New Recommendation",
                de: "Neue Recommendation"
            },
            RecommendationSelectAssessmentBeforeCreating: {
                en: "Select an assessment before creating a recommendation.",
                de: "Assessment auswählen, bevor eine Recommendation erstellt wird."
            },
            RecommendationCreatedNotification: {
                en: "Recommendation created.",
                de: "Recommendation erstellt."
            },
            RecommendationSelectBeforeEditing: {
                en: "Select a recommendation before editing.",
                de: "Recommendation vor dem Bearbeiten auswählen."
            },
            RecommendationEditTitle: {
                en: "Edit Recommendation",
                de: "Recommendation bearbeiten"
            },
            RecommendationSaveAction: {
                en: "Save Recommendation",
                de: "Recommendation speichern"
            },
            RecommendationUpdatedNotification: {
                en: "Recommendation updated.",
                de: "Recommendation aktualisiert."
            },
            RecommendationDeleteConfirmPrefix: {
                en: "Delete recommendation",
                de: "Recommendation löschen"
            },
            RecommendationDeletedNotification: {
                en: "Recommendation deleted.",
                de: "Recommendation gelöscht."
            },
            RecommendationPendingFeatureSuffix: {
                en: "is reserved for a later workspace release.",
                de: "ist für ein späteres Workspace-Release reserviert."
            },
            RecommendationPriorityDefined: {
                en: "Priority defined",
                de: "Priorität definiert"
            },
            RecommendationAssessmentLinked: {
                en: "Assessment linked",
                de: "Assessment verknüpft"
            },
            RecommendationDecisionConnection: {
                en: "Decision connection",
                de: "Decision-Verbindung"
            },
            RecommendationReadyForDecision: {
                en: "Ready for Decision",
                de: "Bereit für Decision"
            },
            RecommendationLowActionLogic: {
                en: "Low action logic",
                de: "Geringe Handlungslogik"
            },
            RecommendationLowActionLogicDescription: {
                en: "Recommendation logic is still incomplete. Define action, priority and assessment context.",
                de: "Die Recommendation-Logik ist noch unvollständig. Maßnahme, Priorität und Assessment-Kontext definieren."
            },
            RecommendationStrongActionLogic: {
                en: "Strong action logic",
                de: "Starke Handlungslogik"
            },
            RecommendationStrongActionLogicDescription: {
                en: "Recommendation has clear action logic and is connected to downstream decision workflow.",
                de: "Die Recommendation hat klare Handlungslogik und ist mit dem nachgelagerten Decision Workflow verknüpft."
            },
            RecommendationDevelopingActionLogic: {
                en: "Developing action logic",
                de: "Handlungslogik in Entwicklung"
            },
            RecommendationDevelopingActionLogicDescription: {
                en: "Recommendation has usable action logic but may still need cost, assessment or decision linkage.",
                de: "Die Recommendation hat nutzbare Handlungslogik, benötigt aber möglicherweise noch Kosten-, Assessment- oder Decision-Verknüpfung."
            },
            RecommendationReviewLinkedDecision: {
                en: "Review linked decision",
                de: "Verknüpfte Decision prüfen"
            },
            RecommendationReviewLinkedDecisionDescription: {
                en: "Recommendation is connected to a decision. Review whether governance logic reflects the recommendation.",
                de: "Die Recommendation ist mit einer Decision verknüpft. Prüfen, ob die Governance-Logik die Recommendation korrekt widerspiegelt."
            },
            RecommendationCreateOrLinkDecision: {
                en: "Create or link decision",
                de: "Decision erstellen oder verknüpfen"
            },
            RecommendationCreateOrLinkDecisionDescription: {
                en: "Recommendation is complete enough to move into decision review.",
                de: "Die Recommendation ist ausreichend vollständig, um in die Decision-Prüfung überführt zu werden."
            },
            RecommendationCompleteActionLogic: {
                en: "Complete action logic",
                de: "Handlungslogik vervollständigen"
            },
            RecommendationCompleteActionLogicDescription: {
                en: "Define action, priority and assessment context before creating a decision.",
                de: "Maßnahme, Priorität und Assessment-Kontext definieren, bevor eine Decision erstellt wird."
            },
            RecommendationIntelligenceComplete: {
                en: "Recommendation intelligence complete",
                de: "Recommendation Intelligence vollständig"
            },
            RecommendationIntelligenceDeveloping: {
                en: "Recommendation intelligence developing",
                de: "Recommendation Intelligence in Entwicklung"
            },
            RecommendationIntelligenceEarly: {
                en: "Recommendation intelligence early",
                de: "Recommendation Intelligence frühe Phase"
            },
            RecommendationIntelligenceLabel: {
                en: "Recommendation Intelligence",
                de: "Recommendation Intelligence"
            },
            RecommendationChecksCompleted: {
                en: "recommendation intelligence checks completed",
                de: "Recommendation-Intelligence-Prüfungen abgeschlossen"
            },
            RecommendationDecisionReadiness: {
                en: "Decision Readiness",
                de: "Decision-Bereitschaft"
            },
            RecommendationDecisionReadinessDescription: {
                en: "Readiness based on identity, action logic, priority, cost, assessment link, decision link and review state.",
                de: "Bereitschaft basierend auf Identität, Handlungslogik, Priorität, Kosten, Assessment-Link, Decision-Link und Review-Status."
            },
            RecommendationActionLogicSignalLabel: {
                en: "Action Logic Signal",
                de: "Handlungslogik-Signal"
            },
            RecommendationNextActionLabel: {
                en: "Next Recommendation Action",
                de: "Nächste Recommendation-Aktion"
            },
            RecommendationHeaderDescription: {
                en: "Develop technical recommendations, define priorities, estimate CAPEX, and prepare expert decision support.",
                de: "Technische Recommendations entwickeln, Prioritäten definieren, CAPEX abschätzen und fachlichen Decision Support vorbereiten."
            },
            RecommendationWorkflowStepTitle: {
                en: "Recommendation",
                de: "Recommendation"
            },
            RecommendationWorkflowActionRecommended: {
                en: "Technical action recommended",
                de: "Technische Maßnahme empfohlen"
            },
            RecommendationWorkflowDecisionDerived: {
                en: "Decision prepared",
                de: "Decision vorbereitet"
            },
            RecommendationItemFallback: {
                en: "Recommendation Item",
                de: "Recommendation-Eintrag"
            },
            RecommendationImmediateMetric: {
                en: "Immediate",
                de: "Sofort"
            },
            RecommendationActiveFlowLabel: {
                en: "Active Flow",
                de: "Aktiver Workflow"
            },
            RecommendationNextActionHeading: {
                en: "Next Action",
                de: "Nächste Aktion"
            },
            RecommendationCompletionLabel: {
                en: "Completion",
                de: "Vollständigkeit"
            },
            RecommendationIdentifiedCheck: {
                en: "Recommendation identified",
                de: "Recommendation identifiziert"
            },
            RecommendationActionDefinedCheck: {
                en: "Action defined",
                de: "Maßnahme definiert"
            },
            RecommendationCostLogicCapturedCheck: {
                en: "Cost logic captured",
                de: "Kostenlogik erfasst"
            },
            RecommendationDefineRecommendedAction: {
                en: "Define recommended action",
                de: "Empfohlene Maßnahme definieren"
            },
            RecommendationDefineRecommendedActionDescription: {
                en: "Add a clear action and priority before moving toward decision.",
                de: "Klare Maßnahme und Priorität ergänzen, bevor die Recommendation in Richtung Decision geführt wird."
            },
            RecommendationAlreadyLinkedDecisionDescription: {
                en: "This recommendation is already connected to a decision. Check governance logic and completeness.",
                de: "Diese Recommendation ist bereits mit einer Decision verknüpft. Governance-Logik und Vollständigkeit prüfen."
            },
            RecommendationDecisionReadinessCardDescription: {
                en: "Readiness based on identity, action, priority, cost logic, assessment link, decision link and review state.",
                de: "Bereitschaft basierend auf Identität, Maßnahme, Priorität, Kostenlogik, Assessment-Link, Decision-Link und Review-Status."
            },
            RecommendationOptionPlanned: {
                en: "Planned",
                de: "Geplant"
            },
            RecommendationNoDescription: {
                en: "No description",
                de: "Keine Beschreibung"
            },
            RecommendationNoAutomaticDecisionGoNoGoLine: {
                en: "No automatic decision, purchase recommendation or Go/No-Go result is created by this action.",
                de: "Durch diese Aktion wird keine automatische Decision, Kaufempfehlung oder Go/No-Go-Aussage erstellt."
            },
            RecommendationDecisionDraftCreated: {
                en: "Decision draft created. Expert review required. No automatic decision created.",
                de: "Decision Draft erstellt. Fachliche Prüfung erforderlich. Keine automatische Decision erstellt."
            },
            RecommendationDecisionDraftPrefix: {
                en: "Decision Draft",
                de: "Decision Draft"
            },
            RecommendationDecisionDraftFrom: {
                en: "Decision Draft from",
                de: "Decision Draft aus"
            },
            RecommendationDecisionBoundaryLabel: {
                en: "Decision boundary:",
                de: "Decision-Grenze:"
            },
            RecommendationDecisionSupportDraftOnly: {
                en: "Decision support draft only.",
                de: "Nur Decision-Support-Draft."
            },
            RecommendationDecisionPreparedFromSelected: {
                en: "Decision draft prepared from selected recommendation.",
                de: "Decision Draft aus ausgewählter Recommendation vorbereitet."
            },
            RecommendationDecisionStatusLabel: {
                en: "Decision status:",
                de: "Decision-Status:"
            },
            RecommendationDraftDecisionCreatedLine: {
                en: "Draft decision support record created from selected recommendation.",
                de: "Draft Decision-Support-Datensatz aus ausgewählter Recommendation erstellt."
            },
            RecommendationSourceTraceLabel: {
                en: "Recommendation source",
                de: "Recommendation-Quelle"
            },
            RecommendationSourceAssessmentIdsTraceLabel: {
                en: "Source Assessment IDs",
                de: "Source-Assessment-IDs"
            },
            RecommendationSourceFindingIdsTraceLabel: {
                en: "Source Finding IDs",
                de: "Source-Finding-IDs"
            },
            RecommendationSourceEvidenceIdsTraceLabel: {
                en: "Source Evidence IDs",
                de: "Source-Evidence-IDs"
            },
            RecommendationSourcePolicyTraceLabel: {
                en: "Source policy",
                de: "Source Policy"
            },
            RecommendationDecisionImpactTraceLabel: {
                en: "Decision impact",
                de: "Decision Impact"
            },
            RecommendationNoAutomaticDecisionTraceLabel: {
                en: "No automatic decision",
                de: "Keine automatische Decision"
            },
            RecommendationYes: {
                en: "Yes",
                de: "Ja"
            },
            RecommendationNo: {
                en: "No",
                de: "Nein"
            },
            RecommendationOptionImmediate: {
                en: "Immediate",
                de: "Sofort"
            },
            RecommendationOptionShortTerm: {
                en: "Short Term",
                de: "Kurzfristig"
            },
            RecommendationOptionMediumTerm: {
                en: "Medium Term",
                de: "Mittelfristig"
            },
            RecommendationOptionLongTerm: {
                en: "Long Term",
                de: "Langfristig"
            },
            RecommendationStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            RecommendationStatusRecommended: {
                en: "Recommended",
                de: "Empfohlen"
            },
            RecommendationStatusDecided: {
                en: "Decided",
                de: "Entschieden"
            },
            RecommendationStatusReviewed: {
                en: "Reviewed",
                de: "Geprüft"
            },
            RecommendationStatusBlocked: {
                en: "Blocked",
                de: "Blockiert"
            },
            DecisionWorkspaceTitle: {
                en: "Decision Workspace",
                de: "Decision Workspace"
            },
            DecisionTitlePlural: {
                en: "Decisions",
                de: "Decisions"
            },
            DecisionHeaderDescription: {
                en: "Prepare controlled decision records from recommendations and preserve traceability into report output.",
                de: "Kontrollierte Decision-Datensätze aus Recommendations vorbereiten und die Nachvollziehbarkeit bis zum Report sichern."
            },
            DecisionNewAction: {
                en: "+ New Decision",
                de: "+ Neue Decision"
            },
            DecisionWorkflowStepTitle: {
                en: "Decision",
                de: "Decision"
            },
            DecisionWorkflowConfirmed: {
                en: "Decision prepared",
                de: "Decision vorbereitet"
            },
            DecisionWorkflowReportTitle: {
                en: "Report",
                de: "Report"
            },
            DecisionWorkflowReportPrepared: {
                en: "Report output prepared",
                de: "Report-Ausgabe vorbereitet"
            },
            DecisionToReportLabel: {
                en: "Decision → Report",
                de: "Decision → Report"
            },
            DecisionTotalMetric: {
                en: "Decisions",
                de: "Decisions"
            },
            DecisionPendingMetric: {
                en: "Pending",
                de: "Ausstehend"
            },
            DecisionApprovedMetric: {
                en: "Approved",
                de: "Freigegeben"
            },
            DecisionLinkedReportsMetric: {
                en: "Linked Reports",
                de: "Verknüpfte Reports"
            },
            DecisionStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            DecisionStatusDecided: {
                en: "Decided",
                de: "Entschieden"
            },
            DecisionStatusReported: {
                en: "Reported",
                de: "Report verknüpft"
            },
            DecisionStatusReviewed: {
                en: "Reviewed",
                de: "Geprüft"
            },
            DecisionStatusBlocked: {
                en: "Blocked",
                de: "Blockiert"
            },
            DecisionEmptyTitle: {
                en: "No decisions available",
                de: "Keine Decisions verfügbar"
            },
            DecisionEmptyDescription: {
                en: "Decisions will connect recommendations, expert reasoning, confidence, approval, and report traceability.",
                de: "Decisions verbinden Recommendations, fachliche Begründung, Confidence, Freigabe und Report-Nachverfolgung."
            },
            DecisionCloseAction: {
                en: "Close Decision",
                de: "Decision schließen"
            },
            DecisionCreateAction: {
                en: "Create Decision",
                de: "Decision erstellen"
            },
            DecisionCreateReportAction: {
                en: "Create Report",
                de: "Report erstellen"
            },
            DecisionContextTitle: {
                en: "Decision Context",
                de: "Decision-Kontext"
            },
            DecisionSelectedLabel: {
                en: "Selected Decision",
                de: "Ausgewählte Decision"
            },
            DecisionNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            DecisionWorkspaceStatusLabel: {
                en: "Workspace Status",
                de: "Workspace-Status"
            },
            DecisionNoSelection: {
                en: "No selection",
                de: "Keine Auswahl"
            },
            DecisionSourceLabel: {
                en: "Source",
                de: "Quelle"
            },
            DecisionRecommendationReviewSource: {
                en: "Recommendation Review",
                de: "Recommendation Review"
            },
            DecisionCaseIdLabel: {
                en: "Case ID",
                de: "Case-ID"
            },
            DecisionBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            DecisionInspectionIdLabel: {
                en: "Inspection ID",
                de: "Inspection-ID"
            },
            DecisionRecommendationIdsLabel: {
                en: "Recommendation IDs",
                de: "Recommendation-IDs"
            },
            DecisionAssessmentIdsLabel: {
                en: "Assessment IDs",
                de: "Assessment-IDs"
            },
            DecisionFindingIdsLabel: {
                en: "Finding IDs",
                de: "Finding-IDs"
            },
            DecisionEvidenceIdsLabel: {
                en: "Evidence IDs",
                de: "Evidence-IDs"
            },
            DecisionBuildingSystemLabel: {
                en: "Building System",
                de: "Gebäudesystem"
            },
            DecisionReportIdsLabel: {
                en: "Report IDs",
                de: "Report-IDs"
            },
            DecisionNone: {
                en: "None",
                de: "Keine"
            },
            DecisionNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            DecisionTitleField: {
                en: "Decision title",
                de: "Decision-Titel"
            },
            DecisionDescriptionField: {
                en: "Description",
                de: "Beschreibung"
            },
            DecisionTypeField: {
                en: "Decision type",
                de: "Decision-Typ"
            },
            DecisionRationaleField: {
                en: "Decision rationale",
                de: "Decision-Begründung"
            },
            DecisionRiskLevelField: {
                en: "Risk level",
                de: "Risikostufe"
            },
            DecisionConfidenceField: {
                en: "Confidence",
                de: "Confidence"
            },
            DecisionOpenCaseOrRecommendationFirst: {
                en: "Open a case or recommendation before creating a decision.",
                de: "Öffnen Sie zuerst einen Case oder eine Recommendation, bevor eine Decision erstellt wird."
            },
            DecisionSelectRecommendationBeforeCreating: {
                en: "Select a recommendation before creating a decision.",
                de: "Recommendation auswählen, bevor eine Decision erstellt wird."
            },
            DecisionSelectBeforeEditing: {
                en: "Select a decision before editing.",
                de: "Decision vor dem Bearbeiten auswählen."
            },
            DecisionSelectFirstWarning: {
                en: "Select a decision first.",
                de: "Zuerst eine Decision auswählen."
            },
            DecisionNewTitle: {
                en: "New Decision",
                de: "Neue Decision"
            },
            DecisionEditTitle: {
                en: "Edit Decision",
                de: "Decision bearbeiten"
            },
            DecisionSaveAction: {
                en: "Save Decision",
                de: "Decision speichern"
            },
            DecisionCreatedNotification: {
                en: "Decision created.",
                de: "Decision erstellt."
            },
            DecisionUpdatedNotification: {
                en: "Decision updated.",
                de: "Decision aktualisiert."
            },
            DecisionDeletedNotification: {
                en: "Decision deleted.",
                de: "Decision gelöscht."
            },
            DecisionDeleteConfirmPrefix: {
                en: "Delete decision",
                de: "Decision löschen"
            },
            DecisionPendingFeatureSuffix: {
                en: "is reserved for a later workspace release.",
                de: "ist für ein späteres Workspace-Release reserviert."
            },
            DecisionOptionMonitor: {
                en: "Monitor",
                de: "Beobachten"
            },
            DecisionStatusApproved: {
                en: "Approved",
                de: "Freigegeben"
            },
            DecisionStatusRejected: {
                en: "Rejected",
                de: "Abgelehnt"
            },
            DecisionStatusDeferred: {
                en: "Deferred",
                de: "Zurückgestellt"
            },
            DecisionReportDraftPrefix: {
                en: "Report Draft",
                de: "Report Draft"
            },
            DecisionReportDraftFrom: {
                en: "Report Draft from",
                de: "Report Draft aus"
            },
            DecisionReportPreparedFromSelected: {
                en: "Report draft prepared from selected decision.",
                de: "Report Draft aus ausgewählter Decision vorbereitet."
            },
            DecisionReportStatusLabel: {
                en: "Report status:",
                de: "Report-Status:"
            },
            DecisionDraftReportCreatedLine: {
                en: "Draft report preparation record created from selected decision.",
                de: "Draft Report-Vorbereitungsdatensatz aus ausgewählter Decision erstellt."
            },
            DecisionNoAutomaticFinalReportLine: {
                en: "No automatic final report, expert opinion, purchase recommendation or Go/No-Go result is created by this action.",
                de: "Durch diese Aktion wird kein automatischer finaler Report, kein Gutachten, keine Kaufempfehlung und keine Go/No-Go-Aussage erstellt."
            },
            DecisionSourceTraceLabel: {
                en: "Decision source",
                de: "Decision-Quelle"
            },
            DecisionSourceRecommendationIdsTraceLabel: {
                en: "Source Recommendation IDs",
                de: "Source-Recommendation-IDs"
            },
            DecisionSourceAssessmentIdsTraceLabel: {
                en: "Source Assessment IDs",
                de: "Source-Assessment-IDs"
            },
            DecisionSourceFindingIdsTraceLabel: {
                en: "Source Finding IDs",
                de: "Source-Finding-IDs"
            },
            DecisionSourceEvidenceIdsTraceLabel: {
                en: "Source Evidence IDs",
                de: "Source-Evidence-IDs"
            },
            DecisionSourcePolicyTraceLabel: {
                en: "Source policy",
                de: "Source Policy"
            },
            DecisionNoAutomaticDecisionTraceLabel: {
                en: "No automatic decision",
                de: "Keine automatische Decision"
            },
            DecisionReportPreparationDocumentAvailabilityOnly: {
                en: "Report preparation based on document availability context only.",
                de: "Report-Vorbereitung nur auf Basis des Dokumentenverfügbarkeits-Kontexts."
            },
            DecisionReportDraftCreated: {
                en: "Report draft created. Expert review required. No final report created.",
                de: "Report Draft erstellt. Fachliche Prüfung erforderlich. Kein finaler Report erstellt."
            },
            DecisionValidationGateDraftWarningNotification: {
                en: "Validation gate has unresolved blockers. Report draft may be created, but final use remains restricted.",
                de: "Validation Gate enthält ungelöste Blocker. Report Draft kann erstellt werden, finale Nutzung bleibt eingeschränkt."
            },
            DecisionYes: {
                en: "Yes",
                de: "Ja"
            },
            DecisionNo: {
                en: "No",
                de: "Nein"
            },
            DecisionRecommendationLinked: {
                en: "Recommendation linked",
                de: "Recommendation verknüpft"
            },
            DecisionReportConnection: {
                en: "Report connection",
                de: "Report-Verbindung"
            },
            DecisionReadyForReport: {
                en: "Ready for Report",
                de: "Bereit für Report"
            },
            DecisionIntelligenceComplete: {
                en: "Decision intelligence complete",
                de: "Decision Intelligence vollständig"
            },
            DecisionIntelligenceDeveloping: {
                en: "Decision intelligence developing",
                de: "Decision Intelligence in Entwicklung"
            },
            DecisionIntelligenceEarly: {
                en: "Decision intelligence early",
                de: "Decision Intelligence frühe Phase"
            },
            DecisionIntelligenceLabel: {
                en: "Decision Intelligence",
                de: "Decision Intelligence"
            },
            DecisionChecksCompleted: {
                en: "decision intelligence checks completed",
                de: "Decision-Intelligence-Prüfungen abgeschlossen"
            },
            DecisionReportReadiness: {
                en: "Report Readiness",
                de: "Report-Bereitschaft"
            },
            DecisionReportReadinessDescription: {
                en: "Readiness based on identity, decision outcome, owner, date, recommendation link, report link and review state.",
                de: "Bereitschaft basierend auf Identität, Decision Outcome, Owner, Datum, Recommendation-Link, Report-Link und Review-Status."
            },
            DecisionGovernanceSignalLabel: {
                en: "Governance Signal",
                de: "Decision-Logik-Signal"
            },
            DecisionNextActionLabel: {
                en: "Next Decision Action",
                de: "Nächste Decision-Aktion"
            },
            DecisionLowGovernanceSignal: {
                en: "Low governance signal",
                de: "Geringes Decision-Logik-Signal"
            },
            DecisionLowGovernanceSignalDescription: {
                en: "Decision logic is still incomplete. Define outcome, owner and recommendation context.",
                de: "Die Decision-Logik ist noch unvollständig. Outcome, Owner und Recommendation-Kontext definieren."
            },
            DecisionStrongGovernanceSignal: {
                en: "Strong governance signal",
                de: "Starkes Decision-Logik-Signal"
            },
            DecisionStrongGovernanceSignalDescription: {
                en: "Decision has clear governance context and is connected to final report output.",
                de: "Die Decision hat klaren Entscheidungskontext und ist mit der finalen Report-Ausgabe verknüpft."
            },
            DecisionDevelopingGovernanceSignal: {
                en: "Developing governance signal",
                de: "Decision-Logik in Entwicklung"
            },
            DecisionDevelopingGovernanceSignalDescription: {
                en: "Decision has usable governance context but may still need recommendation or report linkage.",
                de: "Die Decision hat nutzbaren Entscheidungskontext, benötigt aber möglicherweise noch Recommendation- oder Report-Verknüpfung."
            },
            DecisionReviewLinkedReport: {
                en: "Review linked report",
                de: "Verknüpften Report prüfen"
            },
            DecisionReviewLinkedReportDescription: {
                en: "Decision is connected to a report. Review whether the final output reflects the decision accurately.",
                de: "Die Decision ist mit einem Report verknüpft. Prüfen, ob die finale Ausgabe die Decision korrekt abbildet."
            },
            DecisionCreateOrLinkReport: {
                en: "Create or link report",
                de: "Report erstellen oder verknüpfen"
            },
            DecisionCreateOrLinkReportDescription: {
                en: "Decision is complete enough to move into report preparation.",
                de: "Die Decision ist ausreichend vollständig, um in die Report-Vorbereitung überführt zu werden."
            },
            DecisionConfirmDecisionLogic: {
                en: "Confirm decision logic",
                de: "Decision-Logik bestätigen"
            },
            DecisionConfirmDecisionLogicDescription: {
                en: "Add decision outcome and decision owner before moving toward report output.",
                de: "Decision Outcome und Decision Owner ergänzen, bevor die Report-Ausgabe vorbereitet wird."
            },
            DecisionActiveFlowLabel: {
                en: "Active Flow",
                de: "Aktiver Workflow"
            },
            DecisionNextActionHeading: {
                en: "Next Action",
                de: "Nächste Aktion"
            },
            DecisionCompletionLabel: {
                en: "Completion",
                de: "Vollständigkeit"
            },
            DecisionNeedsMoreData: {
                en: "Needs more decision data",
                de: "Benötigt weitere Decision-Daten"
            },
            DecisionAlreadyLinkedReportDescription: {
                en: "This decision is already connected to a report. Check final output completeness.",
                de: "Diese Decision ist bereits mit einem Report verknüpft. Finale Ausgabe und Vollständigkeit prüfen."
            },
            DecisionIdentifiedCheck: {
                en: "Decision identified",
                de: "Decision identifiziert"
            },
            DecisionOutcomeDefinedCheck: {
                en: "Decision outcome defined",
                de: "Decision Outcome definiert"
            },
            DecisionOwnerDefinedCheck: {
                en: "Decision owner defined",
                de: "Decision Owner definiert"
            },
            DecisionDateCapturedCheck: {
                en: "Decision date captured",
                de: "Decision-Datum erfasst"
            },
            DecisionOptionMedium: {
                en: "Medium",
                de: "Mittel"
            },
            InspectionWorkspaceTitle: {
                en: "Inspection Workspace",
                de: "Inspection Workspace"
            },
            InspectionTitlePlural: {
                en: "Inspections",
                de: "Inspections"
            },
            InspectionNewAction: {
                en: "+ New Inspection",
                de: "+ Neue Inspection"
            },
            InspectionRefreshAction: {
                en: "Refresh",
                de: "Aktualisieren"
            },
            InspectionCloseAction: {
                en: "Close Inspection",
                de: "Inspection schließen"
            },
            InspectionEmptyTitle: {
                en: "No inspections available",
                de: "Keine Inspections verfügbar"
            },
            InspectionEmptyDescription: {
                en: "Inspection records will connect buildings, technical observations, evidence, and follow-up findings.",
                de: "Inspection-Datensätze verbinden Gebäude, technische Beobachtungen, Evidence und nachgelagerte Findings."
            },
            InspectionContextTitle: {
                en: "Inspection Context",
                de: "Inspection-Kontext"
            },
            InspectionCurrentLabel: {
                en: "Current Inspection",
                de: "Aktuelle Inspection"
            },
            InspectionStatusLabel: {
                en: "Inspection Status",
                de: "Inspection-Status"
            },
            InspectionNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            InspectionNotSelected: {
                en: "Not selected",
                de: "Nicht ausgewählt"
            },
            InspectionNotStarted: {
                en: "Not started",
                de: "Nicht gestartet"
            },
            InspectionCreateOrSelect: {
                en: "Create or select an inspection",
                de: "Inspection erstellen oder auswählen"
            },
            InspectionBuildingIdLabel: {
                en: "Building ID",
                de: "Gebäude-ID"
            },
            InspectionNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            InspectionTechnicalPropertyReviewFallback: {
                en: "Technical Property Review",
                de: "Technical Property Review"
            },
            InspectionLocationPending: {
                en: "Location pending",
                de: "Standort offen"
            },
            InspectionInspectorPending: {
                en: "Inspector pending",
                de: "Inspector offen"
            },
            InspectionStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            InspectionStatusDraftLower: {
                en: "draft",
                de: "Entwurf"
            },
            InspectionMetricDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            InspectionMetricCompleted: {
                en: "Completed",
                de: "Abgeschlossen"
            },
            InspectionOpenCaseBeforeScope: {
                en: "Open a case before starting an inspection scope.",
                de: "Öffnen Sie zuerst einen Case, bevor ein Inspection Scope gestartet wird."
            },
            InspectionCreateOrSelectBeforeScope: {
                en: "Create or select an inspection before starting the adaptive scope.",
                de: "Inspection erstellen oder auswählen, bevor der adaptive Scope gestartet wird."
            },
            InspectionAdaptiveScopeAlreadyActive: {
                en: "Adaptive inspection scope is already active.",
                de: "Adaptiver Inspection Scope ist bereits aktiv."
            },
            InspectionAdaptiveScopeStarted: {
                en: "Adaptive inspection scope started.",
                de: "Adaptiver Inspection Scope gestartet."
            },
            InspectionScopeStartFailedLog: {
                en: "Inspection scope start failed:",
                de: "Inspection Scope Start fehlgeschlagen:"
            },
            InspectionScopeCouldNotStart: {
                en: "Inspection scope could not be started.",
                de: "Inspection Scope konnte nicht gestartet werden."
            },
            InspectionEvidenceActions: {
                en: "Evidence Actions",
                de: "Evidence-Aktionen"
            },
            InspectionEvidenceRequired: {
                en: "Evidence Required",
                de: "Evidence erforderlich"
            },
            InspectionCreateEvidence: {
                en: "Create Evidence",
                de: "Evidence erstellen"
            },
            InspectionEvidenceCreatedFromScope: {
                en: "Evidence created from inspection scope.",
                de: "Evidence aus Inspection Scope erstellt."
            },
            InspectionEvidenceRequirementGenerated: {
                en: "Evidence requirement generated from adaptive inspection scope.",
                de: "Evidence-Anforderung aus adaptivem Inspection Scope erzeugt."
            },
            InspectionScopeTitlePrefix: {
                en: "Inspection Scope",
                de: "Inspection Scope"
            },
            InspectionOpenCaseBeforeCreating: {
                en: "Open a case before creating an inspection.",
                de: "Öffnen Sie zuerst einen Case, bevor eine Inspection erstellt wird."
            },
            InspectionOpenLabel: {
                en: "Open",
                de: "Offen"
            },
            InspectionCoverageEvidenceLabel: {
                en: "Evidence",
                de: "Evidence"
            },
            InspectionIntelligenceLabel: {
                en: "Inspection Intelligence",
                de: "Inspection Intelligence"
            },
            InspectionIntelligenceComplete: {
                en: "Inspection intelligence complete",
                de: "Inspection Intelligence vollständig"
            },
            InspectionIntelligenceDeveloping: {
                en: "Inspection intelligence developing",
                de: "Inspection Intelligence in Entwicklung"
            },
            InspectionIntelligenceEarly: {
                en: "Inspection intelligence early",
                de: "Inspection Intelligence frühe Phase"
            },
            InspectionChecksCompleted: {
                en: "inspection intelligence checks completed",
                de: "Inspection-Intelligence-Prüfungen abgeschlossen"
            },
            InspectionEvidenceCoverage: {
                en: "Evidence Coverage",
                de: "Evidence-Abdeckung"
            },
            InspectionEvidenceCoverageDescription: {
                en: "Coverage across Inspection, Evidence, Finding and Assessment.",
                de: "Abdeckung über Inspection, Evidence, Finding und Assessment."
            },
            InspectionLowTechnicalSignal: {
                en: "Low technical signal",
                de: "Geringes technisches Signal"
            },
            InspectionLowTechnicalSignalDescription: {
                en: "Inspection risk logic is still light. More evidence and findings are needed.",
                de: "Die Inspection-Risikologik ist noch schwach. Weitere Evidence und Findings sind erforderlich."
            },
            InspectionHighTechnicalSignal: {
                en: "High technical signal",
                de: "Starkes technisches Signal"
            },
            InspectionHighTechnicalSignalDescription: {
                en: "Multiple technical signals are present. Review lifecycle impact before downstream assessment.",
                de: "Mehrere technische Signale liegen vor. Lifecycle-Auswirkung vor nachgelagertem Assessment prüfen."
            },
            InspectionModerateTechnicalSignal: {
                en: "Moderate technical signal",
                de: "Mittleres technisches Signal"
            },
            InspectionModerateTechnicalSignalDescription: {
                en: "The inspection contains usable technical signals, but validation may still be needed.",
                de: "Die Inspection enthält nutzbare technische Signale, benötigt aber möglicherweise noch Validierung."
            },
            InspectionTechnicalRiskSignal: {
                en: "Technical Risk Signal",
                de: "Technisches Risikosignal"
            },
            InspectionNextActionLabel: {
                en: "Next Inspection Action",
                de: "Nächste Inspection-Aktion"
            },
            InspectionStrengthenStagePrefix: {
                en: "Strengthen",
                de: "Stufe stärken"
            },
            InspectionMissingStageDescriptionSuffix: {
                en: "data is missing for this inspection. Complete this stage before relying on downstream assessment.",
                de: "Daten fehlen für diese Inspection. Diese Stufe vervollständigen, bevor nachgelagerte Assessments verwendet werden."
            },
            InspectionReviewLifecycleOutput: {
                en: "Review inspection lifecycle output",
                de: "Inspection Lifecycle Output prüfen"
            },
            InspectionReviewLifecycleOutputDescription: {
                en: "All inspection intelligence stages are represented. Review consistency and downstream confidence.",
                de: "Alle Inspection-Intelligence-Stufen sind abgebildet. Konsistenz und nachgelagertes Vertrauen prüfen."
            },
            InspectionActivePrefix: {
                en: "Active inspection",
                de: "Aktive Inspection"
            },
            InspectionObjectScopeEyebrow: {
                en: "Object Inspection Scope",
                de: "Object Inspection Scope"
            },
            InspectionAdaptiveScopeActiveTitle: {
                en: "Adaptive Scope Active.",
                de: "Adaptiver Scope aktiv."
            },
            InspectionAdaptiveScopeActiveDescription: {
                en: "The inspection scope is connected to this case and inspection. Answers now drive evidence requirements, skipped questions, risk flags and report limitations.",
                de: "Der Inspection Scope ist mit diesem Case und dieser Inspection verknüpft. Antworten steuern Evidence-Anforderungen, übersprungene Fragen sowie Risikosignale und Report-Limitierungen."
            },
            InspectionScopeActiveBadge: {
                en: "Scope Active",
                de: "Scope aktiv"
            },
            InspectionScopeControl: {
                en: "Scope Control",
                de: "Scope Control"
            },
            InspectionProfileLabel: {
                en: "Inspection Profile",
                de: "Inspection-Profil"
            },
            InspectionThailandProfileActive: {
                en: "Thailand profile active. Documents are handled as availability checks only.",
                de: "Thailand-Profil aktiv. Dokumente werden nur als Verfügbarkeitsprüfung behandelt."
            },
            InspectionModulesLabel: {
                en: "Inspection Modules",
                de: "Inspection-Module"
            },
            InspectionBuildingSystemsReview: {
                en: "Building systems review",
                de: "Gebäudesysteme prüfen"
            },
            InspectionCurrentQuestionLabel: {
                en: "Current Question",
                de: "Aktuelle Frage"
            },
            InspectionDecisionPathTitle: {
                en: "Inspection decision path",
                de: "Inspection-Entscheidungspfad"
            },
            InspectionChooseAnswerDescription: {
                en: "Choose an answer. The scope engine will update coverage, evidence requirements, risk flags and limitations.",
                de: "Antwort auswählen. Die Scope Engine aktualisiert Abdeckung, Evidence-Anforderungen, Risikosignale und Limitierungen."
            },
            InspectionInspectedLabel: {
                en: "inspected",
                de: "geprüft"
            },
            InspectionRiskFlagsLabel: {
                en: "risk flags",
                de: "Risikosignale"
            },
            InspectionRiskFlagsUpper: {
                en: "Risk Flags",
                de: "Risikosignale"
            },
            InspectionLimitationsUpper: {
                en: "Limitations",
                de: "Limitierungen"
            },
            InspectionNoLimitationsYet: {
                en: "No limitations recorded yet.",
                de: "Noch keine Limitierungen erfasst."
            },
            InspectionQuestionsLabel: {
                en: "questions",
                de: "Fragen"
            },
            InspectionQuestionLabel: {
                en: "question",
                de: "Frage"
            },
            InspectionRequireEvidenceLine: {
                en: "inspection question(s) require evidence.",
                de: "Inspection-Frage(n) benötigen Evidence."
            },
            InspectionNoRiskFlagsYet: {
                en: "No risk flags triggered yet.",
                de: "Noch keine Risikosignale ausgelöst."
            },
            InspectionEvidenceRequiredSummary: {
                en: "inspection question(s) require evidence.",
                de: "Inspection-Frage(n) benötigen Evidence."
            },
            BuildingWorkspaceTitle: {
                en: "Building Workspace",
                de: "Building Workspace"
            },
            BuildingTitlePlural: {
                en: "Buildings",
                de: "Gebäude"
            },
            BuildingActivePrefix: {
                en: "Active building",
                de: "Aktives Gebäude"
            },
            BuildingHeaderDescription: {
                en: "Create and manage building master data.",
                de: "Gebäude-Stammdaten erstellen und verwalten."
            },
            BuildingNewAction: {
                en: "+ New Building",
                de: "+ Neues Gebäude"
            },
            BuildingSearchPlaceholder: {
                en: "Search buildings...",
                de: "Gebäude suchen..."
            },
            BuildingRefreshAction: {
                en: "Refresh",
                de: "Aktualisieren"
            },
            BuildingCloseAction: {
                en: "Close Building",
                de: "Gebäude schließen"
            },
            BuildingEmptyTitle: {
                en: "No buildings available",
                de: "Keine Gebäude verfügbar"
            },
            BuildingEmptyDescription: {
                en: "Create your first building to begin building intelligence mapping.",
                de: "Erstes Gebäude erstellen, um das Building-Intelligence-Mapping zu starten."
            },
            BuildingColumnName: {
                en: "Building",
                de: "Gebäude"
            },
            BuildingColumnAddress: {
                en: "Address",
                de: "Adresse"
            },
            BuildingColumnType: {
                en: "Type",
                de: "Typ"
            },
            BuildingColumnStatus: {
                en: "Status",
                de: "Status"
            },
            BuildingColumnYear: {
                en: "Year",
                de: "Baujahr"
            },
            BuildingColumnUpdated: {
                en: "Updated",
                de: "Aktualisiert"
            },
            BuildingColumnActions: {
                en: "Actions",
                de: "Aktionen"
            },
            BuildingNoSelectionTitle: {
                en: "No Building Selected",
                de: "Kein Gebäude ausgewählt"
            },
            BuildingNoActiveBuilding: {
                en: "No active building",
                de: "Kein aktives Gebäude"
            },
            BuildingNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            BuildingCreateOrOpen: {
                en: "Create or open a building",
                de: "Gebäude erstellen oder öffnen"
            },
            BuildingOpenAction: {
                en: "Open",
                de: "Öffnen"
            },
            BuildingEditAction: {
                en: "Edit",
                de: "Bearbeiten"
            },
            BuildingDeleteAction: {
                en: "Delete",
                de: "Löschen"
            },
            BuildingNewTitle: {
                en: "New Building",
                de: "Neues Gebäude"
            },
            BuildingCreateAction: {
                en: "Create Building",
                de: "Gebäude erstellen"
            },
            BuildingEditTitle: {
                en: "Edit Building",
                de: "Gebäude bearbeiten"
            },
            BuildingSaveAction: {
                en: "Save Building",
                de: "Gebäude speichern"
            },
            BuildingNameRequired: {
                en: "Building name is required.",
                de: "Gebäudename ist erforderlich."
            },
            BuildingCreatedNotification: {
                en: "Building created.",
                de: "Gebäude erstellt."
            },
            BuildingUpdatedNotification: {
                en: "Building updated.",
                de: "Gebäude aktualisiert."
            },
            BuildingDeletedNotification: {
                en: "Building deleted.",
                de: "Gebäude gelöscht."
            },
            BuildingDeleteTitle: {
                en: "Delete Building",
                de: "Gebäude löschen"
            },
            BuildingDeleteConfirmPrefix: {
                en: "Delete building",
                de: "Gebäude löschen"
            },
            BuildingDeleteConfirmSuffix: {
                en: "This action cannot be undone.",
                de: "Diese Aktion kann nicht rückgängig gemacht werden."
            },
            BuildingCancelAction: {
                en: "Cancel",
                de: "Abbrechen"
            },
            BuildingNameField: {
                en: "Building Name",
                de: "Gebäudename"
            },
            BuildingNamePlaceholder: {
                en: "Building name",
                de: "Gebäudename"
            },
            BuildingAddressField: {
                en: "Address",
                de: "Adresse"
            },
            BuildingAddressPlaceholder: {
                en: "Street, city, country",
                de: "Straße, Stadt, Land"
            },
            BuildingTypeField: {
                en: "Building Type",
                de: "Gebäudetyp"
            },
            BuildingYearBuiltField: {
                en: "Year Built",
                de: "Baujahr"
            },
            BuildingYearBuiltPlaceholder: {
                en: "e.g. 1920",
                de: "z. B. 1920"
            },
            BuildingTypeResidential: {
                en: "Residential",
                de: "Wohnen"
            },
            BuildingTypeOffice: {
                en: "Office",
                de: "Büro"
            },
            BuildingTypeRetail: {
                en: "Retail",
                de: "Einzelhandel"
            },
            BuildingTypeMixedUse: {
                en: "Mixed Use",
                de: "Mischnutzung"
            },
            BuildingTypeIndustrial: {
                en: "Industrial",
                de: "Industrie"
            },
            BuildingTypeHotel: {
                en: "Hotel",
                de: "Hotel"
            },
            BuildingTypeOther: {
                en: "Other",
                de: "Sonstige"
            },
            BuildingStatusDraft: {
                en: "Draft",
                de: "Entwurf"
            },
            BuildingStatusActive: {
                en: "Active",
                de: "Aktiv"
            },
            BuildingStatusReview: {
                en: "Review",
                de: "Prüfung"
            },
            BuildingStatusArchived: {
                en: "Archived",
                de: "Archiviert"
            },
            BuildingIntelligenceLabel: {
                en: "Building Intelligence",
                de: "Building Intelligence"
            },
            BuildingLifecycleComplete: {
                en: "Building lifecycle complete",
                de: "Building Lifecycle vollständig"
            },
            BuildingLifecycleDeveloping: {
                en: "Building lifecycle developing",
                de: "Building Lifecycle in Entwicklung"
            },
            BuildingLifecycleEarly: {
                en: "Building lifecycle early",
                de: "Building Lifecycle frühe Phase"
            },
            BuildingLifecycleStagesRepresented: {
                en: "lifecycle stages represented",
                de: "Lifecycle-Stufen abgebildet"
            },
            BuildingLifecycleReadiness: {
                en: "Lifecycle Readiness",
                de: "Lifecycle-Bereitschaft"
            },
            BuildingLifecycleReadinessDescription: {
                en: "Coverage across Inspection, Evidence, Finding, Assessment, Recommendation, Decision and Report.",
                de: "Abdeckung über Inspection, Evidence, Finding, Assessment, Recommendation, Decision und Report."
            },
            BuildingTechnicalRiskSignalLabel: {
                en: "Technical Risk Signal",
                de: "Technisches Risikosignal"
            },
            BuildingNextActionLabel: {
                en: "Next Building Action",
                de: "Nächste Gebäude-Aktion"
            },
            BuildingLowTechnicalSignal: {
                en: "Low technical signal",
                de: "Geringes technisches Signal"
            },
            BuildingLowTechnicalSignalDescription: {
                en: "Building risk logic is still light. More inspection evidence and findings are needed.",
                de: "Die Gebäude-Risikologik ist noch schwach. Weitere Inspection Evidence und Findings sind erforderlich."
            },
            BuildingHighTechnicalSignal: {
                en: "High technical signal",
                de: "Starkes technisches Signal"
            },
            BuildingHighTechnicalSignalDescription: {
                en: "Multiple technical signals are present. Review lifecycle impact before recommendation or decision.",
                de: "Mehrere technische Signale liegen vor. Lifecycle-Auswirkung vor Recommendation oder Decision prüfen."
            },
            BuildingModerateTechnicalSignal: {
                en: "Moderate technical signal",
                de: "Mittleres technisches Signal"
            },
            BuildingModerateTechnicalSignalDescription: {
                en: "The building contains usable technical signals, but validation may still be needed.",
                de: "Das Gebäude enthält nutzbare technische Signale, benötigt aber möglicherweise noch Validierung."
            },
            BuildingStrengthenStagePrefix: {
                en: "Strengthen",
                de: "Stufe stärken"
            },
            BuildingMissingStageDescriptionSuffix: {
                en: "data is missing for this building. Complete this stage before relying on final lifecycle output.",
                de: "Daten fehlen für dieses Gebäude. Diese Stufe vervollständigen, bevor finaler Lifecycle Output verwendet wird."
            },
            BuildingReviewLifecycleOutput: {
                en: "Review building lifecycle output",
                de: "Building Lifecycle Output prüfen"
            },
            BuildingReviewLifecycleOutputDescription: {
                en: "All building intelligence stages are represented. Review consistency and final decision confidence.",
                de: "Alle Building-Intelligence-Stufen sind abgebildet. Konsistenz und finales Decision-Vertrauen prüfen."
            },
            BuildingRegisterTitle: {
                en: "Building Register",
                de: "Gebäuderegister"
            },
            BuildingTypeBuilding: {
                en: "Building",
                de: "Gebäude"
            },
            BuildingStatusActiveLower: {
                en: "Active",
                de: "Aktiv"
            },
            FinalNextStepLabel: {
                en: "Next Step",
                de: "Nächster Schritt"
            },
            FinalQuestionIdLabel: {
                en: "Question ID",
                de: "Question ID"
            },
            FinalQuestionLabel: {
                en: "Question",
                de: "Frage"
            },
            FinalScopeIdLabel: {
                en: "Scope ID",
                de: "Scope ID"
            },
            FinalNotLinked: {
                en: "Not linked",
                de: "Nicht verknüpft"
            },
            FinalCreateOrSelectRecommendation: {
                en: "Create or select a recommendation",
                de: "Recommendation erstellen oder auswählen"
            },
            FinalCreateOrSelectDecision: {
                en: "Create or select a decision",
                de: "Decision erstellen oder auswählen"
            },
            FinalReviewInspectionOutput: {
                en: "Review inspection output",
                de: "Inspection Output prüfen"
            },
            FinalEvidenceLabel: {
                en: "Evidence",
                de: "Evidence"
            },
            FinalFindingsLabel: {
                en: "Findings",
                de: "Findings"
            },
            FinalAssessmentsLabel: {
                en: "Assessments",
                de: "Assessments"
            },
            FinalRecommendationsLabel: {
                en: "Recommendations",
                de: "Recommendations"
            },
            FinalDecisionsLabel: {
                en: "Decisions",
                de: "Decisions"
            },
            FinalReportsLabel: {
                en: "Reports",
                de: "Reports"
            },
            FinalCasesLabel: {
                en: "Cases",
                de: "Cases"
            },
            FinalBuildingsLabel: {
                en: "Buildings",
                de: "Gebäude"
            },
            FinalInspectionsLabel: {
                en: "Inspections",
                de: "Inspections"
            },
            FoundationCaseSearchPlaceholder: {
                en: "Search cases...",
                de: "Cases suchen..."
            },
            FoundationCaseNoMatchingTitle: {
                en: "No matching cases found",
                de: "Keine passenden Cases gefunden"
            },
            FoundationNoActiveCase: {
                en: "No active case",
                de: "Kein aktiver Case"
            },
            FoundationEvidenceInputTitle: {
                en: "Evidence input",
                de: "Evidence Input"
            },
            FoundationEvidenceInputDescription: {
                en: "Initial evidence input.",
                de: "Erster Evidence Input."
            },
            FoundationPhotoDocument: {
                en: "Photo / Document",
                de: "Foto / Dokument"
            },
            FoundationFindingPreparedFromEvidence: {
                en: "Finding prepared from evidence.",
                de: "Finding aus Evidence vorbereitet."
            },
            FoundationInspectionScopeStartDescription: {
                en: "Start the adaptive scope to connect this question set to the active case and inspection.",
                de: "Adaptiven Scope starten, um diesen Fragenkatalog mit aktivem Case und aktiver Inspection zu verbinden."
            },
            FoundationInspectionPlanDescription: {
                en: "Plan, document, and manage technical inspections linked to buildings, cases, and evidence.",
                de: "Technische Inspections planen, dokumentieren und mit Gebäuden, Cases und Evidence verknüpfen."
            },
            FoundationInspectionScopeDescription: {
                en: "Define what must be inspected before evidence is collected. The scope engine turns answers into required evidence, risk signals and limitations.",
                de: "Festlegen, was vor der Evidence-Erfassung geprüft werden muss. Die Scope Engine übersetzt Antworten in erforderliche Evidence, Risikosignale und Limitierungen."
            },
            FoundationInspectionLightOutput: {
                en: "Inspection output is still light. More evidence and findings are needed.",
                de: "Inspection Output ist noch schwach. Weitere Evidence und Findings sind erforderlich."
            },
            FoundationInspectionReviewConsistency: {
                en: "Inspection evidence, findings and assessments are represented. Review consistency before recommendations.",
                de: "Inspection Evidence, Findings und Assessments sind abgebildet. Konsistenz vor Recommendations prüfen."
            },
            FoundationNoEvidenceRequirements: {
                en: "No evidence requirements triggered yet.",
                de: "Noch keine Evidence-Anforderungen ausgelöst."
            },
            FoundationRequiredEvidenceByAnswer: {
                en: "Required evidence by inspection answer",
                de: "Erforderliche Evidence nach Inspection-Antwort"
            },
            FoundationSelectEvidenceRequirement: {
                en: "Select an evidence requirement first.",
                de: "Zuerst eine Evidence-Anforderung auswählen."
            },
            FoundationEvidenceRequiredSuffix: {
                en: "required",
                de: "erforderlich"
            },
            FoundationNotLinkedLower: {
                en: "not linked",
                de: "nicht verknüpft"
            },
            FoundationReportEmptyDescription: {
                en: "Reports will compile evidence, findings, assessments, recommendations, and decisions into a professional output.",
                de: "Reports bündeln Evidence, Findings, Assessments, Recommendations und Decisions zu einem professionellen Output."
            },
            FoundationSettingsDataDescription: {
                en: "Control local workspace data without deleting the active case, building, or inspection context.",
                de: "Lokale Workspace-Daten steuern, ohne aktiven Case-, Gebäude- oder Inspection-Kontext zu löschen."
            },
            FoundationSettingsClearWorkflowText: {
                en: "This removes generated inspection scope, evidence, findings, assessments, recommendations, decisions, and reports. Cases, buildings, and inspections stay available.",
                de: "Entfernt generierten Inspection Scope, Evidence, Findings, Assessments, Recommendations, Decisions und Reports. Cases, Gebäude und Inspections bleiben erhalten."
            },
            FoundationSettingsDemoText: {
                en: "This creates one controlled demo chain from inspection scope to report. Existing workflow test data will be replaced, while cases, buildings, and inspections remain available.",
                de: "Erstellt eine kontrollierte Demo-Kette vom Inspection Scope bis zum Report. Bestehende Workflow-Testdaten werden ersetzt, während Cases, Gebäude und Inspections erhalten bleiben."
            },
            FoundationSettingsRebuildConfirm: {
                en: "Rebuild the controlled demo dataset? Existing workflow demo data will be replaced. Preserved cases, buildings, and inspections will remain available.",
                de: "Kontrollierten Demo-Datensatz neu aufbauen? Bestehende Workflow-Demo-Daten werden ersetzt. Erhaltene Cases, Gebäude und Inspections bleiben verfügbar."
            },
            FoundationSettingsResetConfirm: {
                en: "Reset controlled demo workflow data? Cases, buildings, and inspections will be preserved.",
                de: "Kontrollierte Demo-Workflow-Daten zurücksetzen? Cases, Gebäude und Inspections bleiben erhalten."
            },
            FoundationSettingsClearConfirmPrefix: {
                en: "Clear",
                de: "Löschen von"
            },
            FoundationSettingsClearConfirmSuffix: {
                en: "workflow records? Cases, buildings, and inspections will be preserved.",
                de: "Workflow-Datensätzen? Cases, Gebäude und Inspections bleiben erhalten."
            },
            InterfaceLanguageSaved: {
                en: "Interface language preference saved.",
                de: "Arbeitssprache gespeichert."
            }
        };
    }

    static t(key, language = this.getLanguage()) {
        const copy = this.getInterfaceCopy();
        const entry = copy[key];

        if (!entry) {
            return key;
        }

        return entry[language] || entry.en || key;
    }

    static getTerminology() {
        return {
            Evidence: { en: "Evidence", de: "Evidence / Nachweise" },
            Finding: { en: "Finding", de: "Finding / technische Feststellung" },
            Assessment: { en: "Assessment", de: "Assessment / Bewertung" },
            Recommendation: { en: "Recommendation", de: "Recommendation / Handlungsempfehlung" },
            Decision: { en: "Decision", de: "Decision / Entscheidung" },
            Report: { en: "Report", de: "Report / Bericht" },
            BuildingIntelligence: { en: "Building Intelligence", de: "Building Intelligence" },
            TechnicalDueDiligence: { en: "Technical Due Diligence", de: "Technical Due Diligence" }
        };
    }

    static getTerm(key, language = this.getLanguage()) {
        const terminology = this.getTerminology();
        const term = terminology[key];

        if (!term) {
            return key;
        }

        return term[language] || term.en || key;
    }
}
