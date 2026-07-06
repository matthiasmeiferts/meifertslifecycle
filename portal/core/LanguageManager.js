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
