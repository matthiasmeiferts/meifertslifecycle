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
