/**
 * MEIFERTS Building Intelligence
 * Inspection Context
 * Foundation 4.0-A
 *
 * Purpose:
 * Provide one serializable, isolated state container for the adaptive
 * inspection runtime. The context stores state only. Question visibility,
 * priority, navigation, evidence and risk decisions belong to dedicated
 * engines.
 */

export default class InspectionContext {

    static CONTEXT_MODE = "adaptive_inspection_context";

    static CONTEXT_VERSION = "1.0.0";

    static ENGINE_VERSION = "adaptive-inspection-engine-2.0";

    static create(source = {}, options = {}) {
        const timestamp = options.timestamp || source.metadata?.updatedAt || new Date().toISOString();
        const createdAt = options.createdAt || source.metadata?.createdAt || timestamp;

        return {
            contextMode: this.CONTEXT_MODE,
            metadata: {
                contextId: options.contextId || source.metadata?.contextId || "inspection-context",
                version: this.CONTEXT_VERSION,
                engineVersion: options.engineVersion || source.metadata?.engineVersion || this.ENGINE_VERSION,
                createdAt,
                updatedAt: timestamp
            },
            profile: this.createProfile(source.profile),
            inspection: this.createInspection(source.inspection),
            navigation: this.createNavigation(source.navigation),
            modules: this.createModules(source.modules),
            questions: this.createQuestions(source.questions),
            answers: this.createAnswers(source.answers),
            evidence: this.createEvidence(source.evidence),
            findings: this.createReviewCollection(source.findings),
            assessments: this.createReviewCollection(source.assessments),
            recommendations: this.createReviewCollection(source.recommendations),
            decisions: this.createReviewCollection(source.decisions),
            reports: this.createReviewCollection(source.reports),
            risk: this.createRisk(source.risk),
            governance: this.createGovernance(source.governance),
            workflow: this.createWorkflow(source.workflow),
            export: this.createExportState(source.export),
            statistics: this.createStatistics(source.statistics),
            safetyBoundary: this.createSafetyBoundary(source.safetyBoundary)
        };
    }

    static restore(serializedContext = "", options = {}) {
        const source = typeof serializedContext === "string"
            ? JSON.parse(serializedContext)
            : serializedContext;

        if (!source || source.contextMode !== this.CONTEXT_MODE) {
            throw new Error("Invalid inspection context payload");
        }

        if (source.metadata?.version !== this.CONTEXT_VERSION) {
            throw new Error(`Unsupported inspection context version: ${source.metadata?.version || "unknown"}`);
        }

        return this.create(source, {
            contextId: source.metadata.contextId,
            engineVersion: source.metadata.engineVersion,
            createdAt: source.metadata.createdAt,
            timestamp: options.timestamp || source.metadata.updatedAt
        });
    }

    static serialize(context = {}) {
        return JSON.stringify(this.create(context, {
            contextId: context.metadata?.contextId,
            engineVersion: context.metadata?.engineVersion,
            createdAt: context.metadata?.createdAt,
            timestamp: context.metadata?.updatedAt
        }));
    }

    static createProfile(profile = {}) {
        return this.clone({
            country: profile.country || "",
            region: profile.region || "",
            city: profile.city || "",
            buildingType: profile.buildingType || "",
            useType: profile.useType || "",
            constructionYear: profile.constructionYear ?? null,
            ageBand: profile.ageBand || "",
            climateZone: profile.climateZone || "",
            locationContext: profile.locationContext || "",
            legalContext: profile.legalContext || "",
            ownershipModel: profile.ownershipModel || "",
            inspectionPurpose: profile.inspectionPurpose || "",
            inspectionLevel: profile.inspectionLevel || ""
        });
    }

    static createInspection(inspection = {}) {
        return this.clone({
            inspectionId: inspection.inspectionId || "",
            status: inspection.status || "not_started",
            startedAt: inspection.startedAt || null,
            finishedAt: inspection.finishedAt || null,
            inspector: inspection.inspector || null,
            customer: inspection.customer || null
        });
    }

    static createNavigation(navigation = {}) {
        return {
            currentQuestionId: navigation.currentQuestionId || null,
            previousQuestionId: navigation.previousQuestionId || null,
            nextQuestionId: navigation.nextQuestionId || null,
            visitedQuestionIds: this.cloneArray(navigation.visitedQuestionIds),
            hiddenQuestionIds: this.cloneArray(navigation.hiddenQuestionIds),
            activatedQuestionIds: this.cloneArray(navigation.activatedQuestionIds),
            skippedQuestionIds: this.cloneArray(navigation.skippedQuestionIds),
            generatedFollowUpQuestionIds: this.cloneArray(navigation.generatedFollowUpQuestionIds)
        };
    }

    static createModules(modules = {}) {
        return {
            active: this.cloneArray(modules.active),
            completed: this.cloneArray(modules.completed),
            skipped: this.cloneArray(modules.skipped),
            locked: this.cloneArray(modules.locked)
        };
    }

    static createQuestions(questions = {}) {
        return {
            catalog: this.cloneArray(questions.catalog),
            visibleQuestionIds: this.cloneArray(questions.visibleQuestionIds),
            remainingQuestionIds: this.cloneArray(questions.remainingQuestionIds),
            completedQuestionIds: this.cloneArray(questions.completedQuestionIds),
            generatedFollowUps: this.cloneArray(questions.generatedFollowUps)
        };
    }

    static createAnswers(answers = {}) {
        return {
            byQuestionId: this.cloneObject(answers.byQuestionId),
            lastAnswer: this.cloneNullable(answers.lastAnswer),
            history: this.cloneArray(answers.history)
        };
    }

    static createEvidence(evidence = {}) {
        return {
            required: this.cloneArray(evidence.required),
            drafts: this.cloneArray(evidence.drafts),
            completed: this.cloneArray(evidence.completed),
            missing: this.cloneArray(evidence.missing)
        };
    }

    static createReviewCollection(collection = {}) {
        return {
            drafts: this.cloneArray(collection.drafts),
            approved: this.cloneArray(collection.approved),
            rejected: this.cloneArray(collection.rejected)
        };
    }

    static createRisk(risk = {}) {
        return {
            signals: this.cloneArray(risk.signals),
            activeRisks: this.cloneArray(risk.activeRisks),
            resolvedRisks: this.cloneArray(risk.resolvedRisks),
            overallRisk: this.cloneNullable(risk.overallRisk)
        };
    }

    static createGovernance(governance = {}) {
        return {
            expertReviewRequired: this.isExplicitTrue(governance.expertReviewRequired),
            internalReviewRequired: this.isExplicitTrue(governance.internalReviewRequired),
            approvalState: governance.approvalState || "not_requested"
        };
    }

    static createWorkflow(workflow = {}) {
        return {
            currentStage: workflow.currentStage || "inspection_setup",
            allowedTransitions: this.cloneArray(workflow.allowedTransitions),
            completedStages: this.cloneArray(workflow.completedStages)
        };
    }

    static createExportState(exportState = {}) {
        return {
            exportReady: this.isExplicitTrue(exportState.exportReady),
            authorizationGranted: this.isExplicitTrue(exportState.authorizationGranted),
            clientDocumentReady: this.isExplicitTrue(exportState.clientDocumentReady)
        };
    }

    static createStatistics(statistics = {}) {
        return {
            completionRate: Number(statistics.completionRate) || 0,
            totalQuestions: Number(statistics.totalQuestions) || 0,
            answeredQuestions: Number(statistics.answeredQuestions) || 0,
            remainingQuestions: Number(statistics.remainingQuestions) || 0,
            completedModules: Number(statistics.completedModules) || 0,
            durationMinutes: Number(statistics.durationMinutes) || 0
        };
    }

    static createSafetyBoundary(boundary = {}) {
        return {
            contextPersisted: this.isExplicitTrue(boundary.contextPersisted),
            answersPersisted: this.isExplicitTrue(boundary.answersPersisted),
            evidencePersisted: this.isExplicitTrue(boundary.evidencePersisted),
            findingsPersisted: this.isExplicitTrue(boundary.findingsPersisted),
            assessmentsPersisted: this.isExplicitTrue(boundary.assessmentsPersisted),
            recommendationsPersisted: this.isExplicitTrue(boundary.recommendationsPersisted),
            decisionsPersisted: this.isExplicitTrue(boundary.decisionsPersisted),
            reportsPersisted: this.isExplicitTrue(boundary.reportsPersisted),
            workflowPersisted: this.isExplicitTrue(boundary.workflowPersisted),
            exportExecuted: this.isExplicitTrue(boundary.exportExecuted)
        };
    }

    static isExplicitTrue(value) {
        return value === true;
    }

    static cloneArray(value) {
        return Array.isArray(value) ? this.clone(value) : [];
    }

    static cloneObject(value) {
        return value && typeof value === "object" && !Array.isArray(value)
            ? this.clone(value)
            : {};
    }

    static cloneNullable(value) {
        return value === undefined || value === null ? null : this.clone(value);
    }

    static clone(value) {
        if (Array.isArray(value)) {
            return value.map(item => this.clone(item));
        }

        if (value && typeof value === "object") {
            return Object.fromEntries(
                Object.entries(value).map(([key, item]) => [key, this.clone(item)])
            );
        }

        return value;
    }
}
