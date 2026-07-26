import InspectionCaseDomainModel from "./InspectionCaseDomainModel.js";
import InspectionSessionDomainModel from "./InspectionSessionDomainModel.js";
import InspectionAreaDomainModel from "./InspectionAreaDomainModel.js";
import InspectionObservationDomainModel from "./InspectionObservationDomainModel.js";
import InspectionEvidenceDomainModel from "./InspectionEvidenceDomainModel.js";
import InspectionFindingDomainModel from "./InspectionFindingDomainModel.js";
import InspectionAssessmentDomainModel from "./InspectionAssessmentDomainModel.js";
import InspectionRecommendationDomainModel from "./InspectionRecommendationDomainModel.js";
import InspectionDecisionDomainModel from "./InspectionDecisionDomainModel.js";
import InspectionReportDomainModel from "./InspectionReportDomainModel.js";

const ERROR_CODES = Object.freeze({
    INPUT_INVALID: "FOUNDATION_INPUT_INVALID",
    COLLECTION_INVALID: "FOUNDATION_COLLECTION_INVALID",
    RECORD_INVALID: "FOUNDATION_RECORD_INVALID",
    DUPLICATE_ID: "FOUNDATION_DUPLICATE_ID",
    PARENT_MISSING: "PARENT_REFERENCE_MISSING",
    PARENT_AMBIGUOUS: "PARENT_REFERENCE_AMBIGUOUS",
    CARDINALITY_CONFLICT: "CARDINALITY_CONFLICT",
    VERSION_CONFLICT: "VERSION_CONFLICT",
    BROKEN_CHAIN: "BROKEN_FOUNDATION_CHAIN"
});

const MODELS = Object.freeze([
    createModel("cases", "InspectionCase", "caseId", InspectionCaseDomainModel.validateCase),
    createModel(
        "sessions",
        "InspectionSession",
        "sessionId",
        InspectionSessionDomainModel.validateSession,
        "caseId",
        "cases"
    ),
    createModel(
        "areas",
        "InspectionArea",
        "areaId",
        InspectionAreaDomainModel.validateArea,
        "sessionId",
        "sessions"
    ),
    createModel(
        "observations",
        "InspectionObservation",
        "observationId",
        InspectionObservationDomainModel.validateObservation,
        "areaId",
        "areas"
    ),
    createModel(
        "evidence",
        "InspectionEvidence",
        "evidenceId",
        InspectionEvidenceDomainModel.validateEvidence,
        "observationId",
        "observations"
    ),
    createModel(
        "findings",
        "InspectionFinding",
        "findingId",
        InspectionFindingDomainModel.validateFinding,
        "evidenceIds",
        "evidence",
        true
    ),
    createModel(
        "assessments",
        "InspectionAssessment",
        "assessmentId",
        InspectionAssessmentDomainModel.validateAssessment,
        "findingId",
        "findings"
    ),
    createModel(
        "recommendations",
        "InspectionRecommendation",
        "recommendationId",
        InspectionRecommendationDomainModel.validateRecommendation,
        "assessmentId",
        "assessments"
    ),
    createModel(
        "decisions",
        "InspectionDecision",
        "decisionId",
        InspectionDecisionDomainModel.validateDecision,
        "recommendationId",
        "recommendations"
    ),
    createModel(
        "reports",
        "InspectionReport",
        "reportId",
        InspectionReportDomainModel.validateReport,
        "decisionId",
        "decisions"
    )
]);

export default class FoundationChainValidator {

    static validate(input) {
        const errors = [];
        const collections = new Map();
        const indexes = new Map();
        const states = new Map();
        const inputSnapshot = captureInput(input);

        if (!inputSnapshot) {
            appendError(errors, {
                code: ERROR_CODES.INPUT_INVALID,
                modelOrder: -1,
                recordIndex: -1,
                fieldOrder: -1,
                modelType: "FoundationChain",
                field: null,
                message: "Foundation chain input must be a plain record object."
            });

            return createResult(errors, collections);
        }

        MODELS.forEach((model, modelOrder) => {
            const collection = captureCollection(inputSnapshot[model.collection]);

            if (!Object.hasOwn(inputSnapshot, model.collection) || !collection) {
                appendError(errors, {
                    code: ERROR_CODES.COLLECTION_INVALID,
                    modelOrder,
                    recordIndex: -1,
                    fieldOrder: -1,
                    modelType: model.modelType,
                    field: model.collection,
                    message: `Collection ${model.collection} must be present as a plain array.`
                });
                collections.set(model.collection, []);
                indexes.set(model.collection, new Map());
                return;
            }

            collections.set(model.collection, collection);
            const index = new Map();
            indexes.set(model.collection, index);

            collection.forEach((record, recordIndex) => {
                const nodeKey = createNodeKey(model.collection, recordIndex);
                const recordId = readDataProperty(record, model.idField);
                const version = readDataProperty(record, "version");
                const duplicateParentReference = model.multipleParents
                    && hasDuplicateDataArray(readDataProperty(record, model.parentField));
                let contractValid = true;

                try {
                    model.validate(record);
                } catch {
                    contractValid = false;
                    appendError(errors, {
                        code: version !== undefined && version !== "1.0"
                            ? ERROR_CODES.VERSION_CONFLICT
                            : (duplicateParentReference
                                ? ERROR_CODES.CARDINALITY_CONFLICT
                                : ERROR_CODES.RECORD_INVALID),
                        modelOrder,
                        recordIndex,
                        fieldOrder: version !== undefined && version !== "1.0" ? 0 : 1,
                        modelType: model.modelType,
                        recordId: isMeaningfulString(recordId) ? recordId : null,
                        field: version !== undefined && version !== "1.0"
                            ? "version"
                            : (duplicateParentReference
                                ? model.parentField
                                : (!isMeaningfulString(recordId) ? model.idField : null)),
                        message: version !== undefined && version !== "1.0"
                            ? `${model.modelType} has an invalid Foundation version.`
                            : (duplicateParentReference
                                ? `${model.modelType} contains duplicate parent references.`
                                : `${model.modelType} does not satisfy its released domain contract.`)
                    });
                }

                states.set(nodeKey, contractValid);

                if (isMeaningfulString(recordId)) {
                    const entries = index.get(recordId) || [];
                    entries.push({ record, recordIndex, nodeKey });
                    index.set(recordId, entries);
                }
            });

            index.forEach((entries, recordId) => {
                if (entries.length < 2) {
                    return;
                }

                entries.forEach((entry) => states.set(entry.nodeKey, false));
                appendError(errors, {
                    code: ERROR_CODES.DUPLICATE_ID,
                    modelOrder,
                    recordIndex: entries[1].recordIndex,
                    fieldOrder: 1,
                    modelType: model.modelType,
                    recordId,
                    field: model.idField,
                    referencedId: recordId,
                    message: `${model.modelType} identifier must be unique within its collection.`
                });
            });
        });

        MODELS.forEach((model, modelOrder) => {
            if (!model.parentCollection) {
                return;
            }

            const collection = collections.get(model.collection) || [];
            const parentIndex = indexes.get(model.parentCollection) || new Map();

            collection.forEach((record, recordIndex) => {
                const nodeKey = createNodeKey(model.collection, recordIndex);

                if (!states.has(nodeKey) || states.get(nodeKey) === false) {
                    return;
                }

                const recordId = readDataProperty(record, model.idField);
                const parentValue = readDataProperty(record, model.parentField);
                const references = model.multipleParents ? parentValue : [parentValue];
                let chainValid = true;

                references.forEach((referencedId, referenceIndex) => {
                    const matches = parentIndex.get(referencedId) || [];
                    const field = model.multipleParents
                        ? `${model.parentField}[${referenceIndex}]`
                        : model.parentField;

                    if (matches.length === 0) {
                        chainValid = false;
                        appendError(errors, {
                            code: ERROR_CODES.PARENT_MISSING,
                            modelOrder,
                            recordIndex,
                            fieldOrder: referenceIndex,
                            modelType: model.modelType,
                            recordId,
                            field,
                            referencedId,
                            message: `${model.modelType} parent reference does not resolve to the required Foundation type.`
                        });
                        return;
                    }

                    if (matches.length > 1) {
                        chainValid = false;
                        appendError(errors, {
                            code: ERROR_CODES.PARENT_AMBIGUOUS,
                            modelOrder,
                            recordIndex,
                            fieldOrder: referenceIndex,
                            modelType: model.modelType,
                            recordId,
                            field,
                            referencedId,
                            message: `${model.modelType} parent reference resolves to multiple Foundation records.`
                        });
                        return;
                    }

                    if (states.get(matches[0].nodeKey) === false) {
                        chainValid = false;
                        appendError(errors, {
                            code: ERROR_CODES.BROKEN_CHAIN,
                            modelOrder,
                            recordIndex,
                            fieldOrder: referenceIndex,
                            modelType: model.modelType,
                            recordId,
                            field,
                            referencedId,
                            message: `${model.modelType} parent exists but its required Foundation chain is invalid.`
                        });
                    }
                });

                if (!chainValid) {
                    states.set(nodeKey, false);
                }
            });
        });

        return createResult(errors, collections);
    }
}

function createModel(
    collection,
    modelType,
    idField,
    validate,
    parentField = null,
    parentCollection = null,
    multipleParents = false
) {
    return Object.freeze({
        collection,
        modelType,
        idField,
        validate,
        parentField,
        parentCollection,
        multipleParents
    });
}

function captureInput(value) {
    try {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return null;
        }

        const prototype = Object.getPrototypeOf(value);

        if (prototype !== Object.prototype && prototype !== null) {
            return null;
        }

        const snapshot = Object.create(null);

        for (const key of Reflect.ownKeys(value)) {
            if (typeof key !== "string") {
                return null;
            }

            const descriptor = Object.getOwnPropertyDescriptor(value, key);

            if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
                return null;
            }

            snapshot[key] = descriptor.value;
        }

        return snapshot;
    } catch {
        return null;
    }
}

function captureCollection(value) {
    try {
        if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) {
            return null;
        }

        const lengthDescriptor = Object.getOwnPropertyDescriptor(value, "length");

        if (!lengthDescriptor
            || !("value" in lengthDescriptor)
            || !Number.isSafeInteger(lengthDescriptor.value)
            || lengthDescriptor.value < 0) {
            return null;
        }

        const expectedKeys = new Set(["length"]);

        for (let index = 0; index < lengthDescriptor.value; index += 1) {
            expectedKeys.add(String(index));
        }

        const keys = Reflect.ownKeys(value);

        if (keys.length !== expectedKeys.size
            || keys.some((key) => typeof key !== "string" || !expectedKeys.has(key))) {
            return null;
        }

        const snapshot = [];

        for (let index = 0; index < lengthDescriptor.value; index += 1) {
            const descriptor = Object.getOwnPropertyDescriptor(value, String(index));

            if (!descriptor || descriptor.enumerable !== true || !("value" in descriptor)) {
                return null;
            }

            snapshot.push(descriptor.value);
        }

        return snapshot;
    } catch {
        return null;
    }
}

function readDataProperty(value, field) {
    if (!value || typeof value !== "object") {
        return undefined;
    }

    try {
        const descriptor = Object.getOwnPropertyDescriptor(value, field);
        return descriptor && "value" in descriptor ? descriptor.value : undefined;
    } catch {
        return undefined;
    }
}

function isMeaningfulString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function hasDuplicateDataArray(value) {
    if (!Array.isArray(value)) {
        return false;
    }

    try {
        const length = Object.getOwnPropertyDescriptor(value, "length")?.value;

        if (!Number.isSafeInteger(length) || length < 0) {
            return false;
        }

        const seen = new Set();

        for (let index = 0; index < length; index += 1) {
            const descriptor = Object.getOwnPropertyDescriptor(value, String(index));

            if (!descriptor || !("value" in descriptor)) {
                return false;
            }

            if (seen.has(descriptor.value)) {
                return true;
            }

            seen.add(descriptor.value);
        }
    } catch {
        return false;
    }

    return false;
}

function appendError(errors, error) {
    errors.push({
        ...error,
        recordId: error.recordId ?? null,
        field: error.field ?? null,
        referencedId: error.referencedId ?? null
    });
}

function createResult(errors, collections) {
    const ordered = errors
        .sort((left, right) => left.modelOrder - right.modelOrder
            || left.recordIndex - right.recordIndex
            || left.fieldOrder - right.fieldOrder
            || left.code.localeCompare(right.code))
        .map(({ modelOrder, recordIndex, fieldOrder, ...error }) => error);
    const collectionCounts = {};
    let recordCount = 0;

    MODELS.forEach((model) => {
        const count = collections.get(model.collection)?.length || 0;
        collectionCounts[model.collection] = count;
        recordCount += count;
    });

    return deepFreeze({
        valid: ordered.length === 0,
        errors: ordered,
        summary: {
            collectionCount: MODELS.length,
            recordCount,
            errorCount: ordered.length,
            collections: collectionCounts
        }
    });
}

function createNodeKey(collection, recordIndex) {
    return `${collection}:${recordIndex}`;
}

function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
        return value;
    }

    Object.values(value).forEach((entry) => deepFreeze(entry));
    return Object.freeze(value);
}
