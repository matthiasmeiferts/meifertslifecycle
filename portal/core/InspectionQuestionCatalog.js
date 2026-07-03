/**
 * MEIFERTS Building Intelligence
 * Inspection Question Catalog
 * Foundation Framework 3.9-D
 *
 * Starter catalog for adaptive object inspection.
 * Structure: Modules -> Categories -> Criteria.
 */

export default class InspectionQuestionCatalog {

    static modules = [
        {
            id: "SCOPE",
            label: "Inspection Scope",
            riskCategory: "Documentation"
        },
        {
            id: "ROOF",
            label: "Roof & Waterproofing",
            riskCategory: "Water Ingress"
        },
        {
            id: "FACADE",
            label: "Facade & External Walls",
            riskCategory: "Water Ingress"
        },
        {
            id: "BASEMENT",
            label: "Basement & Moisture",
            riskCategory: "Water Ingress"
        },
        {
            id: "ELECTRICAL",
            label: "Electrical Installation",
            riskCategory: "MEP Systems"
        },
        {
            id: "FIRE",
            label: "Fire & Life Safety",
            riskCategory: "Fire & Life Safety"
        },
        {
            id: "DOCUMENTS",
            label: "Technical Documentation",
            riskCategory: "Documentation"
        },
        {
            id: "CAPEX",
            label: "CAPEX & Deferred Maintenance",
            riskCategory: "CAPEX Exposure"
        }
    ];

    static questions = [
        {
            id: "SCOPE-ACCESS-001",
            module: "SCOPE",
            category: "Access",
            component: "Inspection Area",
            question: "Is the inspection area accessible?",
            answerType: "yes_no_not_accessible",
            required: true,
            defaultSeverity: "Medium",
            rules: [
                {
                    when: { answer: "yes" },
                    askNext: ["SCOPE-AREA-001"]
                },
                {
                    when: { answer: "not_accessible" },
                    createLimitation: true,
                    limitationReason: "Inspection area was not accessible.",
                    reportImpact: "Add to scope limitations and exclude detailed condition assessment."
                }
            ]
        },
        {
            id: "SCOPE-AREA-001",
            module: "SCOPE",
            category: "Scope",
            component: "Inspection Area",
            question: "Is the area part of the agreed inspection scope?",
            answerType: "yes_no_unknown",
            required: true,
            dependsOn: {
                questionId: "SCOPE-ACCESS-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    askNext: ["DOCUMENTS-MAINTENANCE-001"]
                },
                {
                    when: { answer: "no" },
                    createLimitation: true,
                    limitationReason: "Area is outside the agreed inspection scope.",
                    reportImpact: "Exclude from technical assessment unless scope is extended."
                },
                {
                    when: { answer: "unknown" },
                    createLimitation: true,
                    limitationReason: "Inspection scope for this area is not confirmed."
                }
            ]
        },

        {
            id: "ROOF-ACCESS-001",
            module: "ROOF",
            category: "Access",
            component: "Roof",
            question: "Is the roof accessible for visual inspection?",
            answerType: "yes_no_not_accessible",
            required: true,
            rules: [
                {
                    when: { answer: "yes" },
                    askNext: ["ROOF-WATERPROOFING-001", "ROOF-DRAINAGE-001"]
                },
                {
                    when: { answer: "not_accessible" },
                    createLimitation: true,
                    limitationReason: "Roof was not accessible during inspection.",
                    reportImpact: "Roof condition cannot be confirmed from visual inspection."
                }
            ]
        },
        {
            id: "ROOF-WATERPROOFING-001",
            module: "ROOF",
            category: "Waterproofing",
            component: "Roof membrane",
            question: "Are roof waterproofing defects visible?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            defaultSeverity: "High",
            dependsOn: {
                questionId: "ROOF-ACCESS-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo", "measurement"],
                    askNext: ["ROOF-WATERPROOFING-AGE-001"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Visible roof waterproofing defects may indicate water ingress risk."
                },
                {
                    when: { answer: "no" },
                    skip: ["ROOF-WATERPROOFING-AGE-001"]
                },
                {
                    when: { answer: "unknown" },
                    createLimitation: true,
                    limitationReason: "Roof waterproofing condition could not be confirmed."
                }
            ]
        },
        {
            id: "ROOF-WATERPROOFING-AGE-001",
            module: "ROOF",
            category: "Waterproofing",
            component: "Roof membrane",
            question: "Is the roof waterproofing likely near end of service life?",
            answerType: "yes_no_unknown",
            defaultSeverity: "High",
            dependsOn: {
                questionId: "ROOF-WATERPROOFING-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo", "document"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Roof waterproofing appears near end of service life.",
                    askNext: ["CAPEX-NEAR-TERM-001"]
                }
            ]
        },
        {
            id: "ROOF-DRAINAGE-001",
            module: "ROOF",
            category: "Drainage",
            component: "Roof drainage",
            question: "Are drainage defects, ponding or blocked outlets visible?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            dependsOn: {
                questionId: "ROOF-ACCESS-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo"],
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Roof drainage defects may increase water ingress risk."
                }
            ]
        },

        {
            id: "FACADE-CRACKS-001",
            module: "FACADE",
            category: "External Walls",
            component: "Facade",
            question: "Are visible cracks present on the facade or external walls?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            defaultSeverity: "Medium",
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo", "measurement"],
                    askNext: ["FACADE-CRACK-WIDTH-001", "FACADE-CRACK-PATTERN-001"],
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Visible facade cracking requires technical review."
                },
                {
                    when: { answer: "no" },
                    skip: ["FACADE-CRACK-WIDTH-001", "FACADE-CRACK-PATTERN-001"]
                },
                {
                    when: { answer: "unknown" },
                    createLimitation: true,
                    limitationReason: "Facade cracking could not be assessed."
                }
            ]
        },
        {
            id: "FACADE-CRACK-WIDTH-001",
            module: "FACADE",
            category: "External Walls",
            component: "Cracks",
            question: "Is the estimated crack width greater than 0.3 mm?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo", "measurement"],
            dependsOn: {
                questionId: "FACADE-CRACKS-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Crack width may indicate relevant movement or deterioration."
                }
            ]
        },
        {
            id: "FACADE-CRACK-PATTERN-001",
            module: "FACADE",
            category: "External Walls",
            component: "Crack pattern",
            question: "Does the crack pattern suggest movement, settlement or moisture-related distress?",
            answerType: "yes_no_unknown",
            dependsOn: {
                questionId: "FACADE-CRACKS-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Crack pattern may indicate structural or moisture-related distress."
                }
            ]
        },
        {
            id: "FACADE-SEALANTS-001",
            module: "FACADE",
            category: "Joints & Sealants",
            component: "Facade joints",
            question: "Are facade joints, sealants or balcony connections deteriorated?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo"],
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Deteriorated joints may increase water ingress risk.",
                    askNext: ["CAPEX-NEAR-TERM-001"]
                }
            ]
        },

        {
            id: "BASEMENT-MOISTURE-001",
            module: "BASEMENT",
            category: "Moisture",
            component: "Basement walls and floor",
            question: "Are moisture marks, dampness or efflorescence visible?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo", "measurement"],
                    askNext: ["BASEMENT-MOISTURE-MEASUREMENT-001"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Visible basement moisture may indicate waterproofing or drainage defects."
                },
                {
                    when: { answer: "no" },
                    skip: ["BASEMENT-MOISTURE-MEASUREMENT-001"]
                }
            ]
        },
        {
            id: "BASEMENT-MOISTURE-MEASUREMENT-001",
            module: "BASEMENT",
            category: "Moisture",
            component: "Moisture measurement",
            question: "Is a moisture measurement required or recommended?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["measurement"],
            dependsOn: {
                questionId: "BASEMENT-MOISTURE-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["measurement", "photo"],
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Moisture finding requires measurement evidence."
                }
            ]
        },
        {
            id: "BASEMENT-ODOUR-001",
            module: "BASEMENT",
            category: "Moisture",
            component: "Indoor climate",
            question: "Is there a musty odour or suspected mould risk?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["note"],
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo", "measurement", "note"],
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Musty odour may indicate hidden moisture or mould risk."
                }
            ]
        },

        {
            id: "ELECTRICAL-BOARD-001",
            module: "ELECTRICAL",
            category: "Electrical",
            component: "Distribution board",
            question: "Is the electrical distribution board accessible and visually inspectable?",
            answerType: "yes_no_not_accessible",
            rules: [
                {
                    when: { answer: "yes" },
                    askNext: ["ELECTRICAL-MODIFICATIONS-001", "ELECTRICAL-DOCUMENTATION-001"]
                },
                {
                    when: { answer: "not_accessible" },
                    createLimitation: true,
                    limitationReason: "Electrical distribution board was not accessible."
                }
            ]
        },
        {
            id: "ELECTRICAL-MODIFICATIONS-001",
            module: "ELECTRICAL",
            category: "Electrical",
            component: "Visible wiring",
            question: "Are visible undocumented modifications or unsafe-looking installations present?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            dependsOn: {
                questionId: "ELECTRICAL-BOARD-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Undocumented or unsafe-looking electrical modifications require specialist review."
                }
            ]
        },
        {
            id: "ELECTRICAL-DOCUMENTATION-001",
            module: "ELECTRICAL",
            category: "Electrical",
            component: "Documentation",
            question: "Are electrical test certificates or maintenance records available?",
            answerType: "yes_no_unknown",
            dependsOn: {
                questionId: "ELECTRICAL-BOARD-001",
                answers: ["yes"]
            },
            rules: [
                {
                    when: { answer: "no" },
                    requireEvidence: ["document"],
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Missing electrical documentation creates compliance and due diligence uncertainty."
                }
            ]
        },

        {
            id: "FIRE-EQUIPMENT-001",
            module: "FIRE",
            category: "Fire Safety",
            component: "Fire equipment",
            question: "Are fire safety devices visibly present and service tags current?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            rules: [
                {
                    when: { answer: "no" },
                    requireEvidence: ["photo"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Missing or expired fire safety servicing may create life safety and compliance risk."
                },
                {
                    when: { answer: "unknown" },
                    createLimitation: true,
                    limitationReason: "Fire safety servicing status could not be confirmed."
                }
            ]
        },
        {
            id: "FIRE-ESCAPE-001",
            module: "FIRE",
            category: "Fire Safety",
            component: "Escape routes",
            question: "Are escape routes visibly clear and unobstructed?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["photo"],
            rules: [
                {
                    when: { answer: "no" },
                    requireEvidence: ["photo"],
                    createRiskFlag: true,
                    severity: "Critical",
                    riskReason: "Obstructed escape routes may create immediate life safety risk."
                }
            ]
        },

        {
            id: "DOCUMENTS-MAINTENANCE-001",
            module: "DOCUMENTS",
            category: "Maintenance",
            component: "Maintenance records",
            question: "Are maintenance records available for key building systems?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["document"],
            rules: [
                {
                    when: { answer: "no" },
                    createRiskFlag: true,
                    severity: "Medium",
                    riskReason: "Missing maintenance records reduce confidence in lifecycle and CAPEX assessment."
                },
                {
                    when: { answer: "unknown" },
                    createLimitation: true,
                    limitationReason: "Maintenance documentation could not be verified."
                }
            ]
        },
        {
            id: "DOCUMENTS-CERTIFICATES-001",
            module: "DOCUMENTS",
            category: "Compliance",
            component: "Certificates",
            question: "Are statutory certificates or required inspection documents complete?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["document"],
            rules: [
                {
                    when: { answer: "no" },
                    requireEvidence: ["document"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Missing statutory certificates may create compliance exposure."
                }
            ]
        },

        {
            id: "CAPEX-NEAR-TERM-001",
            module: "CAPEX",
            category: "Capital Exposure",
            component: "Near-term CAPEX",
            question: "Is near-term CAPEX likely within 0-24 months?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["note"],
            rules: [
                {
                    when: { answer: "yes" },
                    requireEvidence: ["photo", "document", "note"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Near-term CAPEX exposure may affect acquisition terms or reserve planning."
                }
            ]
        },
        {
            id: "CAPEX-RESERVE-001",
            module: "CAPEX",
            category: "Capital Exposure",
            component: "Reserve fund",
            question: "Does the reserve fund or sinking fund appear sufficient for known technical liabilities?",
            answerType: "yes_no_unknown",
            evidenceRequired: ["document"],
            rules: [
                {
                    when: { answer: "no" },
                    requireEvidence: ["document", "note"],
                    createRiskFlag: true,
                    severity: "High",
                    riskReason: "Insufficient reserve funding may materially affect investment decision."
                },
                {
                    when: { answer: "unknown" },
                    createLimitation: true,
                    limitationReason: "Reserve fund adequacy could not be assessed."
                }
            ]
        }
    ];

    static getModules() {
        return this.modules;
    }

    static getAll() {
        return this.questions;
    }

    static getByModule(moduleId) {
        return this.questions.filter(question => question.module === moduleId);
    }

    static getByRiskCategory(riskCategory) {
        const moduleIds = this.modules
            .filter(module => module.riskCategory === riskCategory)
            .map(module => module.id);

        return this.questions.filter(question => moduleIds.includes(question.module));
    }

    static getById(id) {
        return this.questions.find(question => question.id === id) || null;
    }

    static getStarterScopeQuestions() {
        return this.questions;
    }

    static createStarterScopeData(data = {}) {
        return {
            title: data.title || "Adaptive Inspection Scope",
            scopeType: data.scopeType || "Visual Technical Due Diligence",
            modules: this.modules,
            questions: this.getStarterScopeQuestions(),
            answers: {}
        };
    }

}
