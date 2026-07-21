import BuildingManager from "./BuildingManager.js";
import CaseManager from "./CaseManager.js";
import EvidenceManager from "./EvidenceManager.js";
import ExpertReasoningEngine from "./ExpertReasoningEngine.js";
import FindingManager from "./FindingManager.js";
import InspectionManager from "./InspectionManager.js";
import InspectionQuestionEngine from "./InspectionQuestionEngine.js";
import InspectionScopeManager from "./InspectionScopeManager.js";
import BuildingRiskInternalModel from "./risk/BuildingRiskInternalModel.js";
import BuildingRiskInterpretationModel from "./risk/BuildingRiskInterpretationModel.js";
import { getRiskRelevanceGovernanceDefinition } from "./risk/RiskRelevanceGovernanceRegistry.js";
import StorageManager from "./storage/StorageManager.js";

const EXECUTION_SCHEMA_VERSION = "expert-intelligence-execution-1.0";
const EXECUTION_STATUSES = new Set([
    "not_run",
    "running",
    "succeeded",
    "no_provider_contract",
    "failed"
]);

export default class ExpertIntelligenceRuntimeManager {

    static collection = "expertIntelligenceExecutions";

    static transientExecutions = new Map();

    static get EXECUTION_SCHEMA_VERSION() {
        return EXECUTION_SCHEMA_VERSION;
    }

    static createExecution(data = {}) {
        if (!data.inspectionId) {
            throw new Error("ExpertIntelligenceRuntimeManager: inspectionId is required");
        }

        const record = cloneValue(data);

        if (!record.id) {
            record.id = this.createExecutionId(record.inspectionId);
        }

        try {
            return StorageManager.save(this.collection, record);
        } catch (error) {
            const persistenceFailure = {
                ...record,
                engineStatus: "failed",
                limitations: uniqueLimitations([
                    ...cloneArray(record.limitations),
                    `Execution persistence failed: ${error.message}`
                ]),
                errorState: {
                    name: error.name || "Error",
                    message: `Execution persistence failed: ${error.message}`
                },
                humanReviewRequired: true
            };
            this.transientExecutions.set(persistenceFailure.id, persistenceFailure);
            return cloneValue(persistenceFailure);
        }
    }

    static load(executionId) {
        if (!executionId) {
            return null;
        }

        const history = this.inspectExecutionHistory();
        return history.valid.find((entry) => entry.id === executionId)
            || null;
    }

    static getByInspection(inspectionId) {
        if (!inspectionId) {
            return [];
        }

        return this.inspectExecutionHistory().valid
            .filter((entry) => entry.inspectionId === inspectionId)
            .sort((left, right) => {
                const sequenceDifference = Number(left.sequence || 0) - Number(right.sequence || 0);

                if (sequenceDifference !== 0) {
                    return sequenceDifference;
                }

                return String(left.id).localeCompare(String(right.id));
            });
    }

    static getLatest(inspectionId) {
        const entries = this.getByInspection(inspectionId);
        return entries.length ? entries[entries.length - 1] : null;
    }

    static getCorruptionState() {
        const corrupted = this.inspectExecutionHistory().corrupted;

        return {
            detected: corrupted.length > 0,
            count: corrupted.length,
            records: corrupted
        };
    }

    static inspectExecutionHistory() {
        let storedEntries = [];
        const corrupted = [];

        try {
            const loaded = StorageManager.loadAll(this.collection);

            if (Array.isArray(loaded)) {
                storedEntries = loaded;
            } else {
                corrupted.push(createCorruptionRecord("stored-collection", "Execution storage is not an array."));
            }
        } catch (error) {
            corrupted.push(createCorruptionRecord("stored-collection", error.message || "Execution storage could not be read."));
        }

        const candidates = [
            ...storedEntries.map((entry, index) => ({ entry, source: "stored", index })),
            ...[...this.transientExecutions.values()].map((entry, index) => ({ entry, source: "transient", index }))
        ];
        const valid = [];

        candidates.forEach(({ entry, source, index }) => {
            const validation = validateExecutionRecord(entry);

            if (validation.valid) {
                valid.push(cloneValue(entry));
                return;
            }

            corrupted.push(createCorruptionRecord(`${source}-${index}`, validation.reason, entry));
        });

        return {
            valid,
            corrupted
        };
    }

    static createExecutionId(inspectionId) {
        const history = this.inspectExecutionHistory();
        const sequence = this.getByInspection(inspectionId).reduce((highest, entry) => {
            return Math.max(highest, Number(entry.sequence || 0));
        }, 0) + 1;
        const safeInspectionId = String(inspectionId).replace(/[^a-z0-9_-]+/gi, "-");
        const occupiedIds = new Set([
            ...history.valid.map((entry) => entry.id),
            ...history.corrupted.map((entry) => entry.recordId).filter(Boolean)
        ]);
        let candidateSequence = sequence;
        let candidate = `EI-${safeInspectionId}-${String(candidateSequence).padStart(4, "0")}`;

        while (occupiedIds.has(candidate)) {
            candidateSequence += 1;
            candidate = `EI-${safeInspectionId}-${String(candidateSequence).padStart(4, "0")}`;
        }

        return candidate;
    }

    static assembleRuntimeInput(inspectionId) {
        const inspection = InspectionManager.load(inspectionId);

        if (!inspection) {
            throw new Error("Selected inspection is not available in persistence.");
        }

        const scope = this.getScope(inspection);
        const caseRecord = this.getCaseRecord(inspection, scope);
        const caseId = inspection.caseId || scope?.caseId || caseRecord?.id || null;
        const buildingId = inspection.buildingId || scope?.buildingId || caseRecord?.buildingId || null;
        const building = buildingId ? BuildingManager.load(buildingId) : null;
        const questions = cloneArray(scope?.questions);
        const answers = cloneObject(scope?.answers);
        const visibleQuestions = questions.filter((question) => {
            return InspectionQuestionEngine.shouldAsk(question, answers);
        });
        const answerEntries = visibleQuestions
            .filter((question) => Object.hasOwn(answers, question.id))
            .map((question) => this.createAnswerEntry(question, answers[question.id]));
        const findings = this.getFindings(inspection.id, caseId);
        const evidence = this.getEvidence(inspection.id, caseId);
        const limitations = cloneArray(scope?.limitations);
        const evidenceRequirements = cloneArray(scope?.evidenceRequirements);
        const persistedEvidenceReferences = evidence.map((entry) => ({
            id: entry.id,
            title: entry.title || "",
            type: entry.type || entry.evidenceType || "",
            fileReference: entry.fileReference || "",
            sourceQuestionId: entry.sourceQuestionId || ""
        }));
        const persistedEvidenceIds = new Set(persistedEvidenceReferences.map((entry) => entry.id));
        const answerEvidenceReferences = uniqueStrings(
            answerEntries.flatMap((entry) => entry.evidenceIds)
        )
            .filter((id) => !persistedEvidenceIds.has(id))
            .map((id) => ({
                id,
                title: "",
                type: "",
                fileReference: "",
                sourceQuestionId: ""
            }));
        const evidenceReferences = [
            ...persistedEvidenceReferences,
            ...answerEvidenceReferences
        ];
        const evidenceRecords = evidence.map((entry) => createEvidenceSourceRecord(entry));
        const findingText = findings.map((entry) => [
            entry.title,
            entry.category,
            entry.buildingSystem,
            entry.location,
            entry.description
        ].filter(Boolean).join(" · "));
        const answerText = answerEntries.map((entry) => [
            entry.module,
            entry.category,
            entry.question,
            entry.value,
            entry.note
        ].filter(Boolean).join(" · "));
        const measurements = [
            ...evidence
                .filter((entry) => entry.measurementValue !== null && entry.measurementValue !== undefined && entry.measurementValue !== "")
                .map((entry) => ({
                evidenceId: entry.id,
                type: entry.type || entry.evidenceType || "measurement",
                value: entry.measurementValue,
                unit: entry.measurementUnit || "",
                location: entry.locationLabel || entry.location || entry.inspectionArea || ""
                })),
            ...answerEntries.flatMap((entry) => createAnswerMeasurements(entry))
        ];
        const runtimeInput = {
            finding: {
                category: uniqueStrings([
                    ...findings.map((entry) => entry.category || entry.buildingSystem),
                    ...answerEntries.map((entry) => entry.category || entry.module)
                ]).join(" · "),
                location: uniqueStrings([
                    inspection.location,
                    ...findings.map((entry) => entry.location),
                    ...evidence.map((entry) => entry.locationLabel || entry.location)
                ]).join(" · "),
                description: [...findingText, ...answerText].filter(Boolean).join("\n"),
                observations: [...findingText, ...answerText]
            },
            building: {
                id: building?.id || buildingId,
                name: building?.name || "",
                address: building?.address || "",
                constructionType: building?.constructionType || building?.type || "",
                constructionYear: building?.constructionYear || building?.yearBuilt || "",
                numberOfStoreys: building?.numberOfStoreys || "",
                basementPresent: building?.basementPresent === true
            },
            measurements,
            context: {
                inspectionId: inspection.id,
                caseId,
                buildingId,
                inspectionType: inspection.inspectionType || "",
                inspectionStatus: inspection.status || "",
                answerReferences: answerEntries.map((entry) => entry.answerId).filter(Boolean),
                findingReferences: findings.map((entry) => entry.id),
                evidenceReferences: evidenceReferences.map((entry) => entry.id),
                evidenceRequirements: cloneValue(evidenceRequirements),
                limitations: limitations.map((entry) => cloneValue(entry))
            }
        };
        const sourceSnapshot = {
            inspection: pickFields(inspection, [
                "id", "buildingId", "caseId", "inspectionType", "title", "location",
                "inspector", "status", "scheduledAt", "startedAt", "completedAt",
                "createdAt", "updatedAt", "lastOpenedAt", "lastViewedAt"
            ]),
            caseId,
            building: building ? pickFields(building, [
                "id", "name", "address", "type", "constructionType", "yearBuilt",
                "constructionYear", "numberOfStoreys", "basementPresent", "status",
                "createdAt", "updatedAt"
            ]) : null,
            scope: scope ? pickFields(scope, [
                "id", "caseId", "buildingId", "inspectionId", "title", "scopeType",
                "status", "modules", "coverage", "riskFlags", "profile", "country",
                "region", "createdAt", "updatedAt"
            ]) : null,
            visibleQuestions: visibleQuestions.map((question) => pickFields(question, [
                "id", "module", "category", "component", "question", "answerType"
            ])),
            answers: answerEntries,
            findings: findings.map((entry) => pickFields(entry, [
                "id", "caseId", "buildingId", "inspectionId", "title", "description",
                "category", "buildingSystem", "location", "evidenceIds", "status",
                "reviewStatus", "expertReviewRequired", "severity", "priority",
                "classification", "condition", "riskFlags", "createdAt", "updatedAt"
            ])),
            evidenceReferences,
            evidence: evidenceRecords,
            evidenceRequirements: cloneValue(evidenceRequirements),
            limitations: limitations.map((entry) => cloneValue(entry))
        };
        const sourceFingerprintProjection = createSourceFingerprintProjection({
            runtimeInput,
            sourceSnapshot
        });

        return {
            inspection: cloneValue(inspection),
            caseId,
            buildingId,
            runtimeInput,
            sourceSnapshot,
            sourceFingerprintProjection,
            sourceFingerprint: fingerprint(sourceFingerprintProjection),
            answerCount: answerEntries.length,
            findingCount: findings.length,
            evidenceCount: evidence.length,
            evidenceRequirementCount: evidenceRequirements.length,
            limitations
        };
    }

    static executeForInspection(inspectionId, options = {}) {
        const executedAt = options.executedAt || new Date().toISOString();
        let assembled;

        try {
            assembled = this.assembleRuntimeInput(inspectionId);
        } catch (error) {
            if (!InspectionManager.load(inspectionId)) {
                throw error;
            }

            return this.persistFailure({
                inspectionId,
                executedAt,
                error,
                engineStatus: "failed"
            });
        }

        const baseRecord = this.createBaseRecord(assembled, executedAt);

        if (!assembled.buildingId) {
            return this.persistFailure({
                ...baseRecord,
                error: new Error("Selected inspection has no building reference."),
                engineStatus: "failed"
            });
        }

        if (assembled.answerCount === 0 && assembled.findingCount === 0) {
            return this.persistFailure({
                ...baseRecord,
                error: new Error("No persisted inspection answers or findings are available."),
                engineStatus: "not_run"
            });
        }

        let trace = null;
        let reasoningContract = null;
        let internalResult = null;
        let interpretationResult = null;

        try {
            const engine = options.engine || ExpertReasoningEngine;
            const internalModel = options.internalModel || BuildingRiskInternalModel;
            const interpretationModel = options.interpretationModel || BuildingRiskInterpretationModel;
            trace = engine.analyzeWithTrace(
                createFingerprintRuntimeInput(assembled.runtimeInput),
                options.engineOptions || {}
            );

            if (trace.status !== "success" || !trace.selectedDomain) {
                return this.createExecution({
                    ...baseRecord,
                    engineStatus: "no_provider_contract",
                    routedDomains: cloneArray(trace.routedDomains),
                    selectedDomain: null,
                    selectedProvider: null,
                    reasoningResult: cloneValue(trace.reasoningResult),
                    internalModelResult: null,
                    interpretationModelResult: null,
                    limitations: uniqueLimitations([
                        ...assembled.limitations,
                        "No routed Knowledge Provider produced a supported reasoning contract."
                    ]),
                    errorState: null
                });
            }

            reasoningContract = {
                contractVersion: "expert-reasoning-contract-1.0",
                sourceReference: baseRecord.id,
                domain: trace.selectedDomain,
                ...cloneValue(trace.reasoningResult)
            };
            internalResult = internalModel.build({
                assessmentContext: {
                    sourceReference: baseRecord.id,
                    inspectionId: assembled.inspection.id,
                    selectedDomain: trace.selectedDomain,
                    selectedProvider: trace.selectedProvider ?? null
                },
                contracts: [reasoningContract]
            });

            if (internalResult.assessmentState === "INVALID") {
                throw new Error("BuildingRiskInternalModel rejected the reasoning contract.");
            }

            interpretationResult = interpretationModel.interpret(internalResult);

            if (interpretationResult.inputValidation?.accepted !== true) {
                throw new Error("BuildingRiskInterpretationModel rejected the Internal Model result.");
            }

            return this.createExecution({
                ...baseRecord,
                engineStatus: "succeeded",
                routedDomains: cloneArray(trace.routedDomains),
                selectedDomain: trace.selectedDomain,
                selectedProvider: trace.selectedProvider,
                reasoningResult: cloneValue(trace.reasoningResult),
                internalModelResult: cloneValue(internalResult),
                interpretationModelResult: cloneValue(interpretationResult),
                limitations: uniqueLimitations([
                    ...assembled.limitations,
                    ...cloneArray(interpretationResult.limitations),
                    ...cloneArray(interpretationResult.domainInterpretations)
                        .flatMap((entry) => cloneArray(entry.limitations))
                ]),
                errorState: null
            });
        } catch (error) {
            return this.persistFailure({
                ...baseRecord,
                routedDomains: cloneArray(trace?.routedDomains),
                selectedDomain: trace?.selectedDomain || null,
                selectedProvider: trace?.selectedProvider || null,
                reasoningResult: cloneValue(trace?.reasoningResult),
                internalModelResult: cloneValue(internalResult),
                interpretationModelResult: cloneValue(interpretationResult),
                error,
                engineStatus: "failed"
            });
        }
    }

    static createBaseRecord(assembled, executedAt) {
        const governance = getRiskRelevanceGovernanceDefinition();
        const id = this.createExecutionId(assembled.inspection.id);
        const sequence = Number(id.match(/-(\d+)$/)?.[1]);

        return {
            id,
            executionSchemaVersion: EXECUTION_SCHEMA_VERSION,
            sequence,
            inspectionId: assembled.inspection.id,
            caseId: assembled.caseId,
            buildingId: assembled.buildingId,
            executedAt,
            sourceFingerprint: assembled.sourceFingerprint,
            sourceFingerprintProjection: cloneValue(assembled.sourceFingerprintProjection),
            sourceSnapshot: cloneValue(assembled.sourceSnapshot),
            runtimeInput: cloneValue(assembled.runtimeInput),
            engineStatus: "running",
            selectedDomain: null,
            selectedProvider: null,
            routedDomains: [],
            reasoningResult: null,
            internalModelResult: null,
            interpretationModelResult: null,
            limitations: uniqueLimitations(assembled.limitations),
            errorState: null,
            governanceVersions: {
                riskRelevanceGovernanceVersion: governance.governanceVersion,
                riskRelevanceSupportedSourceVersion: governance.supportedSourceVersion,
                internalModelVersion: BuildingRiskInternalModel.MODEL_VERSION,
                interpretationModelVersion: BuildingRiskInterpretationModel.MODEL_VERSION
            },
            humanReviewRequired: true
        };
    }

    static persistFailure(data = {}) {
        const error = data.error instanceof Error ? data.error : new Error(String(data.error || "Execution failed."));
        const record = {
            ...data,
            error: undefined,
            engineStatus: data.engineStatus || "failed",
            selectedDomain: data.selectedDomain || null,
            selectedProvider: data.selectedProvider || null,
            routedDomains: cloneArray(data.routedDomains),
            reasoningResult: data.reasoningResult || null,
            internalModelResult: data.internalModelResult || null,
            interpretationModelResult: data.interpretationModelResult || null,
            limitations: uniqueLimitations([
                ...cloneArray(data.limitations),
                error.message
            ]),
            errorState: {
                name: error.name || "Error",
                message: error.message || "Execution failed."
            },
            humanReviewRequired: true
        };

        return this.createExecution(record);
    }

    static getExecutionState(inspectionId) {
        const corruption = this.getCorruptionState();

        if (!inspectionId) {
            return {
                status: "not_run",
                latest: null,
                stale: false,
                corruption
            };
        }

        const latest = this.getLatest(inspectionId);

        if (!latest) {
            return {
                status: "not_run",
                latest: null,
                stale: false,
                corruption
            };
        }

        let stale = false;

        try {
            stale = this.assembleRuntimeInput(inspectionId).sourceFingerprint !== latest.sourceFingerprint;
        } catch {
            stale = true;
        }

        return {
            status: latest.engineStatus,
            latest,
            stale,
            corruption
        };
    }

    static createSummary(record = null) {
        if (!record || typeof record !== "object" || Array.isArray(record)) {
            return null;
        }

        const reasoning = record.reasoningResult || {};
        const internalAssessment = record.internalModelResult?.domainAssessments?.[0] || {};
        const relevanceEntry = internalAssessment.riskRelevanceEntries?.[0] || null;
        const domainInterpretation = record.interpretationModelResult?.domainInterpretations?.[0] || {};
        const relevanceInterpretation = domainInterpretation.riskRelevanceInterpretations?.[0] || null;

        return {
            executionId: record.id,
            status: record.engineStatus,
            selectedDomain: record.selectedDomain,
            selectedProvider: record.selectedProvider,
            matchedIndicatorCount: cloneArray(reasoning.supportingEvidence).length,
            evidenceCount: cloneArray(reasoning.supportingEvidence).length,
            missingEvidenceCount: cloneArray(reasoning.missingEvidence).length,
            confidence: Object.hasOwn(reasoning, "confidence") ? reasoning.confidence : null,
            riskRelevanceValue: relevanceEntry?.canonicalValue ?? relevanceEntry?.rawValue ?? null,
            riskRelevanceValueState: relevanceEntry?.valueState || "NOT_PRESENT",
            riskRelevanceVersion: relevanceEntry?.rawVersion ?? null,
            riskRelevanceVersionState: relevanceEntry?.versionState || "UNKNOWN_VERSION",
            interpretationState: relevanceInterpretation?.interpretationState || record.interpretationModelResult?.interpretationState || "NOT_INTERPRETED",
            interpretationEligible: relevanceInterpretation?.interpretationState === "INTERPRETED",
            limitationCount: cloneArray(record.limitations).length,
            conflictCount: cloneArray(record.internalModelResult?.conflicts).length,
            humanReviewRequired: record.humanReviewRequired !== false,
            errorMessage: record.errorState?.message || ""
        };
    }

    static getScope(inspection) {
        const byInspection = InspectionScopeManager.getByInspection(inspection.id);

        if (byInspection.length) {
            return byInspection[byInspection.length - 1];
        }

        return null;
    }

    static getCaseRecord(inspection, scope) {
        if (inspection.caseId) {
            return CaseManager.getAll().find((entry) => entry.id === inspection.caseId) || null;
        }

        if (scope?.caseId) {
            return CaseManager.getAll().find((entry) => entry.id === scope.caseId) || null;
        }

        return CaseManager.getAll().find((entry) => entry.inspectionId === inspection.id) || null;
    }

    static getFindings(inspectionId, caseId) {
        const records = FindingManager.getAll();
        return records.filter((entry) => {
            return entry.inspectionId === inspectionId
                || (caseId && entry.caseId === caseId && !entry.inspectionId);
        });
    }

    static getEvidence(inspectionId, caseId) {
        const records = EvidenceManager.getAll();
        return records.filter((entry) => {
            return entry.inspectionId === inspectionId
                || (caseId && entry.caseId === caseId && !entry.inspectionId);
        });
    }

    static createAnswerEntry(question, answer) {
        const answerRecord = answer && typeof answer === "object"
            ? answer
            : { value: answer };

        return {
            questionId: question.id,
            answerId: answerRecord.id || null,
            module: question.module || "",
            category: question.category || "",
            component: question.component || "",
            question: question.question || question.label || question.id,
            value: answerRecord.value ?? answerRecord.answer ?? "",
            note: answerRecord.note || "",
            measurement: cloneValue(answerRecord.measurement),
            evidenceIds: cloneArray(answerRecord.evidenceIds)
        };
    }

}

function cloneArray(value) {
    return Array.isArray(value) ? value.map((entry) => cloneValue(entry)) : [];
}

function cloneObject(value) {
    return value && typeof value === "object" && !Array.isArray(value)
        ? cloneValue(value)
        : {};
}

function cloneValue(value) {
    if (value === undefined) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value));
}

function pickFields(value = {}, fields = []) {
    return fields.reduce((result, field) => {
        if (Object.hasOwn(value, field)) {
            result[field] = cloneValue(value[field]);
        }

        return result;
    }, {});
}

function uniqueStrings(values = []) {
    return [...new Set(values.map((entry) => String(entry || "").trim()).filter(Boolean))];
}

function createAnswerMeasurements(answer = {}) {
    const measurement = answer.measurement;

    if (measurement === null || measurement === undefined || measurement === "") {
        return [];
    }

    if (typeof measurement !== "object" || Array.isArray(measurement)) {
        return [{
            answerId: answer.answerId,
            questionId: answer.questionId,
            type: "measurement",
            value: cloneValue(measurement),
            unit: "",
            location: ""
        }];
    }

    const value = measurement.value ?? measurement.measurementValue;

    if (value === null || value === undefined || value === "") {
        return [];
    }

    return [{
        answerId: answer.answerId,
        questionId: answer.questionId,
        type: measurement.type || "measurement",
        value: cloneValue(value),
        unit: measurement.unit || measurement.measurementUnit || "",
        location: measurement.location || ""
    }];
}

function uniqueLimitations(values = []) {
    const byValue = new Map();

    values.forEach((entry) => {
        const cloned = cloneValue(entry);
        const key = stableStringify(cloned);

        if (!byValue.has(key)) {
            byValue.set(key, cloned);
        }
    });

    return [...byValue.values()];
}

function fingerprint(value) {
    const input = stableStringify(value);
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return `fnv1a-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function createSourceFingerprintProjection({ runtimeInput = {}, sourceSnapshot = {} } = {}) {
    return {
        runtimeInput: createFingerprintRuntimeInput(runtimeInput),
        visibleQuestions: cloneArray(sourceSnapshot.visibleQuestions),
        answers: cloneArray(sourceSnapshot.answers),
        findings: cloneArray(sourceSnapshot.findings).map((entry) => {
            return omitFields(entry, ["createdAt", "updatedAt"]);
        }),
        evidenceReferences: cloneArray(sourceSnapshot.evidenceReferences),
        evidence: cloneArray(sourceSnapshot.evidence).map((entry) => {
            return omitFields(entry, ["createdAt", "updatedAt"]);
        }),
        evidenceRequirements: cloneArray(sourceSnapshot.evidenceRequirements),
        limitations: cloneArray(sourceSnapshot.limitations)
    };
}

function createFingerprintRuntimeInput(runtimeInput = {}) {
    const fingerprintInput = cloneObject(runtimeInput);

    if (fingerprintInput.context && typeof fingerprintInput.context === "object") {
        delete fingerprintInput.context.inspectionStatus;
    }

    return fingerprintInput;
}

function createEvidenceSourceRecord(evidence = {}) {
    return pickFields(evidence, [
        "id", "caseId", "buildingId", "inspectionId", "type", "category",
        "title", "description", "notes", "value", "buildingSystem", "location",
        "locationLabel", "inspectionArea", "componentId", "measurementValue",
        "measurementUnit", "measurementType", "observedAt", "observationDate",
        "sourceDate", "documentDate", "capturedAt", "source", "sourceType",
        "sourceQuestionId", "sourceQuestion", "sourceModule", "sourceCategory",
        "sourceRequiredEvidence", "sourceRequiredEvidenceRaw", "sourcePolicy",
        "scopeId", "fileName", "fileType", "fileSize", "mimeType",
        "fileReference", "fileSource", "captureMethod", "severity", "status",
        "findingIds", "assessmentIds", "tags", "reviewStatus",
        "expertReviewRequired", "confidence", "createdBy", "createdAt", "updatedAt"
    ]);
}

function omitFields(value = {}, fields = []) {
    const omitted = new Set(fields);

    return Object.keys(value).reduce((result, key) => {
        if (!omitted.has(key)) {
            result[key] = cloneValue(value[key]);
        }

        return result;
    }, {});
}

function stableStringify(value) {
    if (value === undefined) {
        return "undefined";
    }

    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
    }

    if (value && typeof value === "object") {
        return `{${Object.keys(value).sort().map((key) => {
            return `${JSON.stringify(key)}:${stableStringify(value[key])}`;
        }).join(",")}}`;
    }

    return JSON.stringify(value);
}

function validateExecutionRecord(record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
        return {
            valid: false,
            reason: "Execution entry is not an object."
        };
    }

    if (typeof record.id !== "string" || !record.id.trim()) {
        return {
            valid: false,
            reason: "Execution entry has no valid execution ID."
        };
    }

    if (typeof record.inspectionId !== "string" || !record.inspectionId.trim()) {
        return {
            valid: false,
            reason: "Execution entry has no valid inspection ID."
        };
    }

    if (!Number.isInteger(record.sequence) || record.sequence < 1) {
        return {
            valid: false,
            reason: "Execution entry has no valid sequence."
        };
    }

    if (typeof record.executedAt !== "string" || Number.isNaN(Date.parse(record.executedAt))) {
        return {
            valid: false,
            reason: "Execution entry has a malformed execution timestamp."
        };
    }

    if (!EXECUTION_STATUSES.has(record.engineStatus)) {
        return {
            valid: false,
            reason: "Execution entry has an unknown engine status."
        };
    }

    if (!record.sourceSnapshot || typeof record.sourceSnapshot !== "object" || Array.isArray(record.sourceSnapshot)) {
        return {
            valid: false,
            reason: "Execution entry has a malformed source snapshot."
        };
    }

    if (typeof record.sourceFingerprint !== "string" || !record.sourceFingerprint) {
        return {
            valid: false,
            reason: "Execution entry has no valid source fingerprint."
        };
    }

    return { valid: true };
}

function createCorruptionRecord(reference, reason, record = null) {
    const recordId = record && typeof record === "object" && !Array.isArray(record)
        && typeof record.id === "string"
        ? record.id
        : null;

    return {
        corruptionReference: `expert-intelligence-corruption:${reference}`,
        recordId,
        state: "CORRUPT_EXECUTION_RECORD_EXCLUDED",
        reason,
        humanReviewRequired: true
    };
}
