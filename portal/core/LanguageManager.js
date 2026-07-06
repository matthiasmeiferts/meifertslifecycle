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
