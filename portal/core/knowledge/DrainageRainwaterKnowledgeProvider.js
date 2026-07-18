/**
 * MBLS Expert Intelligence Layer
 * Drainage, Rainwater and Site Water Management Knowledge Provider
 *
 * Deterministic, pure, immutable provider for rainwater collection,
 * discharge, external drainage, site water routing, and backwater indicators.
 */

const EMPTY_CONTRACT = Object.freeze({
    domain: "drainage-rainwater",
    hypotheses: []
});

const HYPOTHESES = [
    {
        id: "blocked-rainwater-gutter",
        cause: "blocked rainwater gutter",
        classification: "maintenance hypothesis",
        keywords: ["blocked gutter", "clogged gutter", "debris in gutter", "gutter blockage", "gutter not cleaned", "leaf debris gutter"],
        supportingIndicators: [
            "visible debris or obstruction in the rainwater gutter",
            "overflow pattern may be consistent with restricted gutter flow",
            "maintenance history or observations indicate gutter cleaning is required"
        ],
        contradictingIndicators: [
            "gutter observed clean and freely discharging during relevant rainfall",
            "overflow clearly originates from a separate discharge element"
        ],
        requiredVerification: [
            "Inspect the complete gutter run and outlet entry for debris, sediment, or obstruction.",
            "Clean the gutter where appropriate and observe whether rainwater discharges normally afterward.",
            "Verify the downstream downpipe path before attributing the restriction to the gutter alone."
        ],
        potentialConsequences: [
            "recurring overflow",
            "facade wetting",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Document blocked sections and overflow traces.",
            "Arrange targeted cleaning and follow-up functional observation.",
            "Check adjacent gutter sections for repeated debris accumulation."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "defective-rainwater-gutter",
        cause: "defective rainwater gutter",
        classification: "drainage hypothesis",
        keywords: ["damaged gutter", "deformed gutter", "sagging gutter", "leaking gutter", "detached gutter", "corroded gutter", "rainwater gutter defect", "gutter ponding"],
        supportingIndicators: [
            "gutter geometry or material condition appears impaired",
            "local deformation or detachment may affect rainwater collection",
            "corrosion or damage is reported in direct gutter context"
        ],
        contradictingIndicators: [
            "gutter alignment and fixings appear intact under inspection",
            "reported corrosion is unrelated to rainwater collection components"
        ],
        requiredVerification: [
            "Inspect gutter alignment, fixings, joints, and material condition along the affected run.",
            "Verify whether observed deformation or corrosion affects water conveyance.",
            "Compare the affected section with adjacent gutter runs."
        ],
        potentialConsequences: [
            "uncontrolled water discharge",
            "recurring overflow",
            "damage to adjacent finishes"
        ],
        recommendedActions: [
            "Record damaged or deformed gutter sections with location references.",
            "Plan targeted repair scope after functional verification.",
            "Avoid broad intervention assumptions from local gutter deterioration alone."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "leaking-gutter-joint",
        cause: "leaking gutter joint",
        classification: "drainage hypothesis",
        keywords: ["leaking gutter joint", "gutter joint leak", "defective gutter joint", "leaking gutter connection", "gutter joint dripping"],
        supportingIndicators: [
            "water release is localized at a gutter joint or connection",
            "staining or dripping is reported below a gutter joint",
            "joint seal or connection condition requires verification"
        ],
        contradictingIndicators: [
            "joint is dry and intact during water-flow observation",
            "water release originates from overflow over the gutter edge rather than the joint"
        ],
        requiredVerification: [
            "Inspect the gutter joint, seal, and mechanical connection.",
            "Use controlled water-flow observation where technically appropriate.",
            "Check adjacent joints for repeated leakage indicators."
        ],
        potentialConsequences: [
            "localized facade wetting",
            "damage to adjacent finishes",
            "recurring maintenance demand"
        ],
        recommendedActions: [
            "Document the exact joint location and discharge path.",
            "Plan targeted joint repair or resealing after verification.",
            "Reobserve during or after rainfall if active leakage is uncertain."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "insufficient-gutter-drainage",
        cause: "insufficient gutter drainage",
        classification: "verification-required hypothesis",
        keywords: ["overflowing gutter", "gutter overflow", "insufficient gutter drainage", "gutter overtopping", "rainwater not draining from gutter"],
        supportingIndicators: [
            "gutter overflow or overtopping is reported",
            "rainwater appears not to leave the gutter as intended",
            "gutter discharge performance requires separation from blockage and local defects"
        ],
        contradictingIndicators: [
            "overflow explained by a visible local blockage only",
            "gutter drains freely during relevant rainfall observation"
        ],
        requiredVerification: [
            "Inspect the gutter, outlet entries, and downstream downpipes before judging drainage sufficiency.",
            "Do not treat overflow alone as enough to conclude insufficient gutter capacity.",
            "Observe discharge during or after rainfall where feasible."
        ],
        potentialConsequences: [
            "recurring overflow",
            "facade wetting",
            "operational failure during rainfall"
        ],
        recommendedActions: [
            "Document overflow locations and rainwater path.",
            "Verify whether cleaning or local repair resolves the issue before broader interventions.",
            "Request specialist drainage assessment where overflow persists after local causes are excluded."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "blocked-downpipe",
        cause: "blocked downpipe",
        classification: "maintenance hypothesis",
        keywords: ["blocked downpipe", "clogged downpipe", "downpipe blockage", "overflowing downpipe", "blocked rainwater pipe", "rainwater pipe blockage"],
        supportingIndicators: [
            "rainwater discharge appears restricted within the downpipe",
            "overflow is reported at the downpipe or upper connection",
            "blockage indicators are tied to rainwater pipework"
        ],
        contradictingIndicators: [
            "downpipe observed clear and freely discharging",
            "water issue is unrelated to rainwater pipework"
        ],
        requiredVerification: [
            "Inspect accessible downpipe sections and entries for blockage.",
            "Verify discharge at the downpipe base or connected drain.",
            "Use camera inspection where concealed sections remain suspect after surface checks."
        ],
        potentialConsequences: [
            "recurring overflow",
            "uncontrolled water discharge",
            "contamination or blockage recurrence"
        ],
        recommendedActions: [
            "Document overflow points and accessible pipe condition.",
            "Clean the downpipe and confirm downstream discharge where appropriate.",
            "Check whether gutter debris is feeding repeat blockage."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "defective-downpipe",
        cause: "defective downpipe",
        classification: "drainage hypothesis",
        keywords: ["defective downpipe", "damaged downpipe", "cracked downpipe", "rainwater pipe defect", "corroded downpipe", "detached downpipe"],
        supportingIndicators: [
            "downpipe material or fixings appear damaged",
            "cracking, corrosion, or detachment is reported in rainwater pipework",
            "defect may affect controlled rainwater conveyance"
        ],
        contradictingIndicators: [
            "downpipe is intact and securely fixed under inspection",
            "reported pipe defect relates to internal plumbing only"
        ],
        requiredVerification: [
            "Inspect downpipe material, brackets, joints, and alignment.",
            "Verify whether the observed defect affects rainwater discharge.",
            "Check concealed or inaccessible sections where symptoms continue without visible cause."
        ],
        potentialConsequences: [
            "uncontrolled water discharge",
            "facade wetting",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Record damaged sections and discharge effects.",
            "Plan targeted repair after confirming functional impact.",
            "Avoid inferring adjacent facade or foundation damage from downpipe leakage alone."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "leaking-downpipe-connection",
        cause: "leaking downpipe connection",
        classification: "drainage hypothesis",
        keywords: ["leaking downpipe connection", "defective downpipe joint", "downpipe joint leak", "leaking downpipe joint", "leaking rainwater pipe connection"],
        supportingIndicators: [
            "water release is localized at a downpipe joint or connection",
            "joint defect is reported in rainwater pipework",
            "staining or wetting appears below a downpipe connection"
        ],
        contradictingIndicators: [
            "joint remains dry during relevant flow observation",
            "water source is a separate pipe not connected to rainwater discharge"
        ],
        requiredVerification: [
            "Inspect the downpipe joint and connection detail.",
            "Use controlled water-flow testing where technically appropriate.",
            "Verify the downstream discharge destination and joint continuity."
        ],
        potentialConsequences: [
            "localized facade wetting",
            "moisture exposure at building base",
            "damage to adjacent finishes"
        ],
        recommendedActions: [
            "Document the leaking connection and water path.",
            "Plan targeted joint repair after verification.",
            "Recheck nearby connections for repeated defects."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "disconnected-downpipe",
        cause: "disconnected downpipe",
        classification: "drainage hypothesis",
        keywords: ["disconnected downpipe", "detached downpipe", "missing downpipe connection", "downpipe disconnected", "downpipe not connected"],
        supportingIndicators: [
            "downpipe connection appears absent or separated",
            "rainwater may discharge before reaching the intended destination",
            "visible disconnection is reported in the rainwater path"
        ],
        contradictingIndicators: [
            "downpipe is continuous and connected to the intended drain",
            "discharge is intentionally and safely routed away from the building"
        ],
        requiredVerification: [
            "Inspect the full downpipe path from gutter to discharge point.",
            "Verify the discharge destination and connection continuity.",
            "Check whether water is released near vulnerable building areas."
        ],
        potentialConsequences: [
            "uncontrolled water discharge",
            "moisture exposure at building base",
            "local erosion"
        ],
        recommendedActions: [
            "Document the disconnected location and discharge route.",
            "Restore or correct the connection after confirming the intended drainage path.",
            "Review adjacent downpipes for similar connection issues."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "defective-rainwater-outlet",
        cause: "defective rainwater outlet",
        classification: "drainage hypothesis",
        keywords: ["defective rainwater outlet", "damaged rainwater outlet", "defective roof outlet", "outlet defect", "rainwater outlet defect"],
        supportingIndicators: [
            "rainwater outlet condition appears defective",
            "water discharge is impaired at an outlet point",
            "outlet component damage is reported"
        ],
        contradictingIndicators: [
            "outlet is intact, clear, and freely discharging",
            "water issue is remote from any rainwater outlet"
        ],
        requiredVerification: [
            "Inspect the rainwater outlet body, grate, connection, and adjacent drainage route.",
            "Verify whether outlet damage or configuration affects discharge.",
            "Review connected pipe sections where outlet condition alone does not explain symptoms."
        ],
        potentialConsequences: [
            "operational failure during rainfall",
            "recurring overflow",
            "concealed deterioration"
        ],
        recommendedActions: [
            "Document outlet condition and discharge behavior.",
            "Plan targeted repair or cleaning after verification.",
            "Coordinate specialist drainage assessment if the outlet is concealed or inaccessible."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "blocked-roof-outlet",
        cause: "blocked roof outlet",
        classification: "maintenance hypothesis",
        keywords: ["blocked roof outlet", "clogged roof outlet", "blocked roof drain", "roof drain blockage", "roof outlet overflow", "ponding near roof outlet"],
        supportingIndicators: [
            "obstruction is reported at or near the roof outlet",
            "ponding or overflow is localized near the roof outlet",
            "roof water discharge may be restricted at the outlet entry"
        ],
        contradictingIndicators: [
            "roof outlet is clear and discharging during relevant observation",
            "roof water issue is unrelated to outlet or drainage points"
        ],
        requiredVerification: [
            "Inspect roof outlets, grates, sumps, and connected drainage paths.",
            "Clean the outlet where appropriate and observe discharge behavior afterward.",
            "Do not infer a roof-membrane defect from ponding near an outlet alone."
        ],
        potentialConsequences: [
            "recurring overflow",
            "water ingress risk",
            "operational failure during rainfall"
        ],
        recommendedActions: [
            "Document outlet blockage and local ponding pattern.",
            "Arrange targeted cleaning and functional observation.",
            "Verify emergency overflow provisions where primary drainage is restricted."
        ],
        riskRelevance: "high",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "insufficient-roof-drainage",
        cause: "insufficient roof drainage",
        classification: "verification-required hypothesis",
        keywords: ["insufficient roof drainage", "roof drainage insufficient", "roof water not draining", "poor roof drainage", "roof drainage defect"],
        supportingIndicators: [
            "wording indicates insufficient or poor roof drainage",
            "roof water does not appear to leave the roof as intended",
            "roof drainage performance requires verification against blockage and outlet condition"
        ],
        contradictingIndicators: [
            "poor drainage explained by a single blocked outlet",
            "roof drainage observed functioning during relevant rainfall"
        ],
        requiredVerification: [
            "Inspect roof outlets, drainage routes, and overflow paths.",
            "Observe drainage during or after rainfall where feasible.",
            "Review drainage drawings where available before concluding a design or capacity issue."
        ],
        potentialConsequences: [
            "recurring ponding",
            "operational failure during rainfall",
            "water ingress risk"
        ],
        recommendedActions: [
            "Document roof water routing and drainage points.",
            "Resolve visible blockages or local defects before broader drainage conclusions.",
            "Request specialist drainage assessment where poor performance persists after local verification."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "defective-emergency-drainage",
        cause: "defective emergency drainage",
        classification: "drainage hypothesis",
        keywords: ["blocked emergency outlet", "defective emergency drainage", "blocked emergency overflow", "emergency outlet defect", "emergency overflow defect"],
        supportingIndicators: [
            "emergency drainage element is described as blocked or defective",
            "secondary overflow route may be impaired",
            "emergency outlet condition requires direct inspection"
        ],
        contradictingIndicators: [
            "emergency drainage route is clear and functional",
            "reported issue relates only to primary drainage with no emergency-drainage indicator"
        ],
        requiredVerification: [
            "Inspect emergency outlets, overflows, and discharge paths.",
            "Verify whether the emergency route is clear and able to discharge.",
            "Review drainage drawings where available to identify intended emergency provisions."
        ],
        potentialConsequences: [
            "reduced backup drainage function",
            "operational failure during rainfall",
            "water ingress risk"
        ],
        recommendedActions: [
            "Document emergency drainage condition and visible restrictions.",
            "Arrange targeted clearing or repair after verification.",
            "Coordinate specialist review if emergency discharge routing is unclear."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "missing-emergency-drainage-indication",
        cause: "missing emergency drainage indication",
        classification: "verification-required indication",
        keywords: ["missing emergency overflow", "missing emergency drainage", "no visible emergency overflow", "emergency drainage absent", "emergency overflow absent"],
        supportingIndicators: [
            "available wording indicates emergency drainage is not visible or may be absent",
            "secondary overflow provision requires verification",
            "visible inspection has not established the intended emergency drainage arrangement"
        ],
        contradictingIndicators: [
            "emergency overflow is identified on drawings or during inspection",
            "no roof or rainwater context requires emergency drainage verification"
        ],
        requiredVerification: [
            "Inspect roof outlets and emergency overflows for visible provisions.",
            "Review drainage drawings where available before concluding emergency drainage is absent.",
            "Treat missing visible emergency drainage as an indication requiring verification, not as an absence conclusion."
        ],
        potentialConsequences: [
            "reduced backup drainage function",
            "operational vulnerability during primary drainage restriction",
            "increased verification demand"
        ],
        recommendedActions: [
            "Document visible roof drainage and overflow details.",
            "Request design or as-built information where emergency routes are not apparent.",
            "Escalate for specialist drainage assessment if the arrangement remains unclear."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "blocked-courtyard-drain",
        cause: "blocked courtyard drain",
        classification: "maintenance hypothesis",
        keywords: ["blocked courtyard drain", "blocked yard drain", "courtyard drain blockage", "yard drain blockage", "clogged courtyard drain"],
        supportingIndicators: [
            "courtyard or yard drain is described as blocked",
            "surface water may be retained near an external drain point",
            "debris or sediment accumulation is indicated in the external drainage path"
        ],
        contradictingIndicators: [
            "courtyard drain is clear and freely discharging",
            "standing water is unrelated to any external drain"
        ],
        requiredVerification: [
            "Inspect the courtyard drain, grate, trap, and accessible discharge path.",
            "Clean the drain where appropriate and observe whether surface water clears.",
            "Use camera inspection where concealed blockage remains plausible."
        ],
        potentialConsequences: [
            "local surface-water accumulation",
            "contamination or blockage recurrence",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Document the blocked drain and affected surface area.",
            "Arrange targeted cleaning and discharge verification.",
            "Review upstream debris sources if blockage recurs."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "blocked-external-gully",
        cause: "blocked external gully",
        classification: "maintenance hypothesis",
        keywords: ["blocked external gully", "clogged gully", "gully blockage", "blocked gully", "external gully blocked"],
        supportingIndicators: [
            "external gully is reported blocked or clogged",
            "water may back up at the gully point",
            "external drainage element requires cleaning or flow verification"
        ],
        contradictingIndicators: [
            "gully is clear and discharging during observation",
            "issue relates to indoor plumbing without external drainage context"
        ],
        requiredVerification: [
            "Inspect the gully, grate, trap, and connected discharge route.",
            "Clean the gully where appropriate and verify flow afterward.",
            "Check whether connected rainwater pipes contribute to repeated blockage."
        ],
        potentialConsequences: [
            "local surface-water accumulation",
            "contamination or blockage recurrence",
            "uncontrolled water discharge"
        ],
        recommendedActions: [
            "Record gully condition and water level indicators.",
            "Arrange targeted cleaning and functional observation.",
            "Escalate to specialist drainage review if flow remains restricted."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "defective-drainage-channel",
        cause: "defective drainage channel",
        classification: "drainage hypothesis",
        keywords: ["defective drainage channel", "damaged drainage channel", "channel drain blockage", "trench drain defect", "blocked surface drain", "channel drain defect"],
        supportingIndicators: [
            "linear drainage channel is reported damaged, blocked, or defective",
            "surface water interception may be impaired at the channel drain",
            "channel condition requires inspection along its full run"
        ],
        contradictingIndicators: [
            "channel drain is intact, clear, and freely discharging",
            "surface water issue is remote from the drainage channel"
        ],
        requiredVerification: [
            "Inspect the drainage channel, grate, falls, outlets, and connected discharge path.",
            "Clean or expose the channel where appropriate and observe flow.",
            "Verify whether defects are localized or repeated along the channel."
        ],
        potentialConsequences: [
            "local surface-water accumulation",
            "uncontrolled water discharge",
            "damage to adjacent finishes"
        ],
        recommendedActions: [
            "Document affected channel sections and discharge points.",
            "Plan targeted repair or cleaning after functional verification.",
            "Check adjacent surfaces for water bypass around the channel."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "insufficient-surface-water-drainage",
        cause: "insufficient surface-water drainage",
        classification: "verification-required hypothesis",
        keywords: ["insufficient surface-water drainage", "poor surface water drainage", "surface water not draining", "blocked surface drain", "surface drainage insufficient"],
        supportingIndicators: [
            "wording indicates surface water is not draining as intended",
            "external site drainage performance requires verification",
            "surface-water behavior may involve drains, routing, or local obstructions"
        ],
        contradictingIndicators: [
            "surface water clears through functioning drainage during observation",
            "standing water is isolated and unrelated to building or site drainage"
        ],
        requiredVerification: [
            "Verify terrain and surface-water routing around the affected area.",
            "Inspect external drains, gullies, channels, and discharge destinations.",
            "Do not infer drainage-system overload from surface-water accumulation alone."
        ],
        potentialConsequences: [
            "local surface-water accumulation",
            "moisture exposure at building base",
            "operational failure during rainfall"
        ],
        recommendedActions: [
            "Document surface-water paths and affected drainage points.",
            "Resolve visible obstructions before broader drainage conclusions.",
            "Request specialist drainage assessment if poor drainage persists after local checks."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "adverse-site-grading",
        cause: "adverse site grading",
        classification: "environmental hypothesis",
        keywords: ["ground slopes toward building", "terrain slopes toward building", "adverse grading", "negative grading", "site grading directs water", "surface falls toward building"],
        supportingIndicators: [
            "terrain or surface levels are described as directing water toward the building",
            "external grading may increase water exposure near the building",
            "surface-water route requires verification against local drainage conditions"
        ],
        contradictingIndicators: [
            "terrain directs water away from the building",
            "water accumulation is explained by an isolated blocked drain only"
        ],
        requiredVerification: [
            "Verify terrain and surface-water routing around the affected elevation.",
            "Inspect during or after rainfall where feasible to observe actual runoff paths.",
            "Do not infer inadequate construction slope from standing water alone."
        ],
        potentialConsequences: [
            "moisture exposure at building base",
            "local erosion",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Document surface falls and runoff direction with location references.",
            "Check whether drainage channels or gullies intercept the runoff.",
            "Plan targeted grading or drainage review only after routing verification."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "water-directed-toward-building",
        cause: "water directed toward building",
        classification: "drainage hypothesis",
        keywords: ["water flows toward building", "runoff directed toward facade", "runoff directed toward basement", "runoff directed toward entrance", "surface water against building", "water directed toward building"],
        supportingIndicators: [
            "runoff is described as moving toward the building",
            "surface water may contact vulnerable building edges or entrances",
            "observed water route requires verification against intended site drainage"
        ],
        contradictingIndicators: [
            "runoff is intercepted and discharged away from the building",
            "water movement is unrelated to the assessed building"
        ],
        requiredVerification: [
            "Verify surface-water routing during or after rainfall where feasible.",
            "Inspect drainage interceptors, gullies, thresholds, and discharge destinations.",
            "Confirm whether water reaches the building or is diverted before contact."
        ],
        potentialConsequences: [
            "moisture exposure at building base",
            "facade wetting",
            "water ingress risk"
        ],
        recommendedActions: [
            "Document runoff paths toward the building.",
            "Assess whether local drainage elements are blocked, absent, or bypassed.",
            "Escalate for targeted site-water routing review if runoff reaches vulnerable areas."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "local-surface-water-accumulation",
        cause: "local surface-water accumulation",
        classification: "verification-required hypothesis",
        keywords: ["surface water accumulation", "standing water around building", "ponding near building", "water accumulation at building base", "local surface water accumulation"],
        supportingIndicators: [
            "surface water is reported near the building or site drainage area",
            "ponding location may indicate restricted routing or drainage",
            "accumulation requires separation from temporary rainfall effects and local obstruction"
        ],
        contradictingIndicators: [
            "standing water is unrelated to building drainage or site-water routing",
            "surface water clears normally through verified drainage"
        ],
        requiredVerification: [
            "Inspect the local drainage path, terrain, and discharge destination.",
            "Observe the area during or after rainfall where feasible.",
            "Do not treat standing water alone as enough to conclude inadequate slope or system overload."
        ],
        potentialConsequences: [
            "local surface-water accumulation",
            "moisture exposure at building base",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Document accumulation extent, location, and nearby drainage elements.",
            "Check for blocked gullies, channels, or outlets before broader conclusions.",
            "Reassess after cleaning or rainfall observation if the cause remains uncertain."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    },
    {
        id: "defective-rainwater-discharge-at-building-base",
        cause: "defective rainwater discharge at building base",
        classification: "waterproofing-interface hypothesis",
        keywords: ["defective rainwater discharge at building base", "water accumulation at building base", "downpipe discharge at building base", "rainwater discharge at plinth", "discharge at building base"],
        supportingIndicators: [
            "rainwater discharge is reported at or near the building base",
            "discharge arrangement may expose the plinth or base area to moisture",
            "the intended discharge destination requires verification"
        ],
        contradictingIndicators: [
            "rainwater is connected to a verified discharge point away from the building base",
            "base moisture is unrelated to rainwater or external discharge"
        ],
        requiredVerification: [
            "Verify the rainwater discharge destination at the building base.",
            "Inspect downpipe connections, splash areas, and adjacent surface-water routing.",
            "Do not infer a below-grade envelope defect from water at the building base alone."
        ],
        potentialConsequences: [
            "moisture exposure at building base",
            "local erosion",
            "water ingress risk"
        ],
        recommendedActions: [
            "Document the discharge point and affected base area.",
            "Correct uncontrolled local discharge after verifying the intended drainage route.",
            "Coordinate with below-grade assessment only if independent moisture evidence exists."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "uncontrolled-discharge-near-foundation",
        cause: "uncontrolled discharge near foundation",
        classification: "waterproofing-interface hypothesis",
        keywords: ["discharge near foundation", "uncontrolled discharge near foundation", "downpipe discharge near foundation", "rainwater discharging near foundation", "water discharge at foundation"],
        supportingIndicators: [
            "rainwater discharge is described near the foundation",
            "downpipe or outlet discharge may not be connected to a controlled destination",
            "water-routing interface with below-grade elements requires verification"
        ],
        contradictingIndicators: [
            "discharge is verified as controlled and routed away from the foundation",
            "foundation-area moisture has no rainwater or drainage context"
        ],
        requiredVerification: [
            "Verify the discharge destination and distance from vulnerable building elements.",
            "Inspect surface-water routing from the discharge point during or after rainfall where feasible.",
            "Do not treat discharge near the foundation as enough to conclude a below-grade or foundation defect."
        ],
        potentialConsequences: [
            "moisture exposure at building base",
            "local erosion",
            "consequential moisture damage"
        ],
        recommendedActions: [
            "Document the discharge route and any affected foundation-adjacent area.",
            "Plan targeted reconnection or diversion after verifying the intended rainwater path.",
            "Check for repeat issues at other downpipe discharge points."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "backwater-related-drainage-risk",
        cause: "backwater-related drainage risk",
        classification: "operational hypothesis",
        keywords: ["backwater", "sewer surcharge", "drain surcharge", "wastewater backing up", "water rising from drain", "backflow from drainage"],
        supportingIndicators: [
            "backwater or surcharge indicators are reported in drainage context",
            "water may be returning through connected drains",
            "backwater arrangement and protection require verification"
        ],
        contradictingIndicators: [
            "no drainage backflow or surcharge indicator is present",
            "water source is unrelated to drainage backflow"
        ],
        requiredVerification: [
            "Verify the backwater protection arrangement and connected drainage levels.",
            "Inspect affected drains and discharge paths for surcharge indicators.",
            "Review drainage drawings or specialist information where available."
        ],
        potentialConsequences: [
            "water ingress risk",
            "contamination or blockage recurrence",
            "operational failure during rainfall"
        ],
        recommendedActions: [
            "Document backflow indicators and affected drain locations.",
            "Request specialist drainage assessment where backwater behavior is reported.",
            "Verify protection devices before recommending corrective scope."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "missing-or-defective-backwater-protection-indication",
        cause: "missing or defective backwater protection indication",
        classification: "verification-required indication",
        keywords: ["missing backwater valve", "defective backwater valve", "backwater protection absent", "backwater protection defect", "missing backwater protection"],
        supportingIndicators: [
            "wording indicates backwater protection may be missing or defective",
            "available information does not establish the protection arrangement",
            "backwater device condition requires verification"
        ],
        contradictingIndicators: [
            "backwater protection arrangement is verified and functional",
            "no backwater or connected drainage context is present"
        ],
        requiredVerification: [
            "Verify the presence, location, and condition of backwater protection devices.",
            "Review drainage drawings or maintenance records where available.",
            "Treat missing or defective protection wording as an indication requiring verification, not as an absence conclusion."
        ],
        potentialConsequences: [
            "water ingress risk",
            "operational vulnerability during surcharge events",
            "increased verification demand"
        ],
        recommendedActions: [
            "Document visible backwater devices and accessible drainage connections.",
            "Arrange specialist verification where device condition or arrangement is unclear.",
            "Define corrective actions only after the protection arrangement is verified."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "combined-drainage-system-overload-indication",
        cause: "combined drainage-system overload indication",
        classification: "verification-required indication",
        keywords: ["combined drainage overload", "combined system overload", "drainage system overload", "sewer surcharge", "surface water and wastewater surcharge"],
        supportingIndicators: [
            "wording indicates possible overload or surcharge in a combined drainage context",
            "rainwater and drainage backflow indicators may coincide",
            "system behavior requires verification before capacity conclusions"
        ],
        contradictingIndicators: [
            "surface-water accumulation is isolated from drainage-system surcharge",
            "single local blockage explains the observed behavior"
        ],
        requiredVerification: [
            "Review drainage configuration and discharge destination where available.",
            "Inspect affected drains during or after rainfall where technically appropriate.",
            "Do not infer drainage-system overload from surface-water accumulation alone."
        ],
        potentialConsequences: [
            "operational failure during rainfall",
            "water ingress risk",
            "contamination or blockage recurrence"
        ],
        recommendedActions: [
            "Document the reported overload indicators and drainage components involved.",
            "Differentiate local blockage from wider drainage-system behavior.",
            "Request specialist drainage assessment where combined-system behavior remains plausible."
        ],
        riskRelevance: "high",
        capexRelevance: "medium",
        valuationRelevance: "high"
    },
    {
        id: "age-related-drainage-deterioration",
        cause: "age-related drainage deterioration",
        classification: "age-related hypothesis",
        keywords: ["age-related drainage deterioration", "aged drainage", "old downpipe", "old gutter", "corroded gutter", "corroded downpipe", "weathered drainage"],
        supportingIndicators: [
            "drainage components are described as aged, corroded, or weathered",
            "long-term exposure may contribute to component deterioration",
            "age-related condition requires functional verification"
        ],
        contradictingIndicators: [
            "components are recently installed and defect-free",
            "age wording is unrelated to drainage, gutters, downpipes, outlets, or gullies"
        ],
        requiredVerification: [
            "Review construction year, refurbishment history, and maintenance records where available.",
            "Inspect accessible drainage components for age-related material deterioration.",
            "Do not infer functional failure from corrosion, deformation, or ageing alone."
        ],
        potentialConsequences: [
            "increased maintenance demand",
            "concealed deterioration",
            "recurring local defects"
        ],
        recommendedActions: [
            "Document age-related indicators by component and location.",
            "Prioritize targeted repair or renewal only after functional impact is verified.",
            "Monitor similar components for repeated deterioration patterns."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "workmanship-defect",
        cause: "workmanship defect",
        classification: "workmanship hypothesis",
        keywords: ["poor drainage installation", "incorrect drainage connection", "improper discharge arrangement", "workmanship defect", "installation defect", "poor gutter installation", "poor downpipe installation"],
        supportingIndicators: [
            "drainage detail quality or connection arrangement is questioned",
            "installation wording indicates possible execution deficiency",
            "defect requires comparison with intended drainage arrangement"
        ],
        contradictingIndicators: [
            "drainage details are consistent and correctly connected on inspection",
            "single maintenance blockage explains the condition without installation indicators"
        ],
        requiredVerification: [
            "Inspect representative drainage details for connection, support, and discharge arrangement.",
            "Review drainage drawings where available to compare intended and observed routing.",
            "Treat workmanship as a hypothesis pending verification."
        ],
        potentialConsequences: [
            "recurring detail defects",
            "uncontrolled water discharge",
            "increased maintenance demand"
        ],
        recommendedActions: [
            "Document installation anomalies with location references.",
            "Compare affected details with adjacent drainage components.",
            "Plan targeted correction after verifying the intended drainage route."
        ],
        riskRelevance: "medium",
        capexRelevance: "medium",
        valuationRelevance: "medium"
    },
    {
        id: "maintenance-related-drainage-defect",
        cause: "maintenance-related drainage defect",
        classification: "maintenance hypothesis",
        keywords: ["drainage not maintained", "gutter not cleaned", "drain not cleaned", "debris accumulation", "maintenance-related drainage defect", "poor drainage maintenance"],
        supportingIndicators: [
            "maintenance deficiency is described in drainage context",
            "debris accumulation may restrict rainwater or external drainage",
            "cleaning and functional observation are required before broader conclusions"
        ],
        contradictingIndicators: [
            "drainage components are maintained and clear during inspection",
            "generic maintenance wording has no drainage, gutter, outlet, gully, or downpipe context"
        ],
        requiredVerification: [
            "Inspect drainage components for debris, sediment, vegetation, and cleaning condition.",
            "Clean affected components where appropriate and observe function afterward.",
            "Verify whether recurring defects remain after maintenance issues are addressed."
        ],
        potentialConsequences: [
            "contamination or blockage recurrence",
            "increased maintenance demand",
            "operational failure during rainfall"
        ],
        recommendedActions: [
            "Document maintenance condition and debris sources.",
            "Arrange targeted cleaning and post-cleaning functional checks.",
            "Review maintenance planning if repeated blockage indicators are present."
        ],
        riskRelevance: "medium",
        capexRelevance: "low",
        valuationRelevance: "medium"
    }
];

const DRAINAGE_COMPONENT_TERMS = [
    "gutter",
    "downpipe",
    "rainwater pipe",
    "rainwater outlet",
    "roof outlet",
    "roof drain",
    "roof drainage",
    "emergency outlet",
    "emergency overflow",
    "emergency drainage",
    "courtyard drain",
    "yard drain",
    "external gully",
    "gully",
    "surface drain",
    "drainage channel",
    "channel drain",
    "trench drain",
    "surface water",
    "site drainage",
    "site grading",
    "adverse grading",
    "negative grading",
    "runoff",
    "building base",
    "foundation",
    "backwater",
    "sewer surcharge",
    "drain surcharge",
    "backflow from drainage",
    "backwater valve",
    "backwater protection"
];

const ISSUE_TERMS = [
    "blocked",
    "clogged",
    "debris",
    "overflow",
    "damaged",
    "defective",
    "cracked",
    "deformed",
    "sagging",
    "leaking",
    "detached",
    "disconnected",
    "missing",
    "corroded",
    "ponding",
    "standing water",
    "accumulation",
    "not draining",
    "insufficient",
    "poor",
    "surcharge",
    "backwater",
    "backing up",
    "water rising",
    "backflow",
    "slopes toward",
    "directed toward",
    "against building",
    "discharge near",
    "not maintained",
    "not cleaned",
    "installation defect",
    "workmanship defect"
];

const FALSE_POSITIVE_CONTEXTS = [
    "indoor plumbing",
    "sanitary drainage",
    "internal floor drain",
    "floor drain inside",
    "decorative water feature",
    "swimming pool",
    "pool drainage",
    "landscape irrigation",
    "street drainage"
];

export default class DrainageRainwaterKnowledgeProvider {

    /**
     * Return deterministic knowledge for rainwater and site-water findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable drainage-rainwater knowledge contract.
     */
    static getKnowledge(input = {}) {
        const source = normalizeInput(input);

        if (!hasSufficientInput(source)) {
            return EMPTY_CONTRACT;
        }

        const context = buildContext(source);

        if (!isRelevantContext(context)) {
            return EMPTY_CONTRACT;
        }

        const ranked = HYPOTHESES
            .map((entry, index) => ({
                entry,
                index,
                score: scoreHypothesis(entry, context)
            }))
            .filter((item) => item.score > 0)
            .sort((left, right) => {
                if (right.score !== left.score) {
                    return right.score - left.score;
                }

                return left.index - right.index;
            });

        if (ranked.length === 0) {
            return EMPTY_CONTRACT;
        }

        return {
            domain: "drainage-rainwater",
            hypotheses: ranked.map((item) => toHypothesis(item.entry))
        };
    }

}

function normalizeInput(input) {
    const source = cloneObject(input);

    return {
        finding: cloneObject(source.finding),
        building: cloneObject(source.building),
        measurements: cloneArray(source.measurements)
    };
}

function hasSufficientInput(source) {
    return Boolean(
        textOf(source.finding.category).trim().length > 0 ||
        textOf(source.finding.location).trim().length > 0 ||
        textOf(source.finding.description).trim().length > 0 ||
        textOf(source.finding.observations).trim().length > 0 ||
        textOf(source.building.constructionYear).trim().length > 0 ||
        textOf(source.building.roofType).trim().length > 0 ||
        textOf(source.building.drainageSystem).trim().length > 0 ||
        textOf(source.building.rainwaterDischargeType).trim().length > 0 ||
        textOf(source.building.siteDrainageType).trim().length > 0 ||
        textOf(source.building.backwaterProtection).trim().length > 0 ||
        textOf(source.building.terrainCondition).trim().length > 0 ||
        source.measurements.length > 0
    );
}

function buildContext(source) {
    const findingText = [
        textOf(source.finding.category),
        textOf(source.finding.location),
        textOf(source.finding.description),
        textOf(source.finding.observations)
    ].join(" ").toLowerCase();

    const buildingText = [
        textOf(source.building.constructionYear),
        textOf(source.building.roofType),
        textOf(source.building.drainageSystem),
        textOf(source.building.rainwaterDischargeType),
        textOf(source.building.siteDrainageType),
        textOf(source.building.backwaterProtection),
        textOf(source.building.terrainCondition)
    ].join(" ").toLowerCase();

    const measurementText = source.measurements
        .map((measurement) => [
            textOf(measurement.type),
            textOf(measurement.value),
            textOf(measurement.unit),
            textOf(measurement.location)
        ].join(" "))
        .join(" ")
        .toLowerCase();

    const evidenceText = [findingText, measurementText].join(" ").trim();
    const text = [findingText, buildingText, measurementText].join(" ").trim();

    return {
        source,
        text,
        evidenceText,
        findingText,
        buildingText,
        measurementText
    };
}

function isRelevantContext(context) {
    if (context.evidenceText.length === 0) {
        return false;
    }

    if (FALSE_POSITIVE_CONTEXTS.some((term) => containsWord(context.evidenceText, term))) {
        return false;
    }

    const hasComponent = DRAINAGE_COMPONENT_TERMS.some((term) => containsWord(context.evidenceText, term));
    const hasIssue = ISSUE_TERMS.some((term) => containsWord(context.evidenceText, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    if (containsAny(context.evidenceText, ["water flows toward building", "water directed toward building", "surface water against building", "runoff directed toward"])) {
        return true;
    }

    if (containsAny(context.evidenceText, ["standing water around building", "ponding near building", "water accumulation at building base"])) {
        return true;
    }

    if (containsAny(context.evidenceText, ["missing backwater valve", "defective backwater valve", "backwater protection absent", "backwater protection defect"])) {
        return true;
    }

    if (containsAny(context.evidenceText, ["poor drainage installation", "incorrect drainage connection", "improper discharge arrangement", "workmanship defect", "installation defect"])) {
        return true;
    }

    if (containsAny(context.evidenceText, ["drainage not maintained", "gutter not cleaned", "drain not cleaned", "debris accumulation", "poor drainage maintenance"])) {
        return true;
    }

    return false;
}

function scoreHypothesis(entry, context) {
    let score = 0;

    entry.keywords.forEach((keyword) => {
        if (containsWord(context.evidenceText, keyword)) {
            score += 5;
        }

        if (containsWord(context.findingText, keyword)) {
            score += 2;
        }

        if (containsWord(context.measurementText, keyword)) {
            score += 2;
        }

        if (containsWord(context.buildingText, keyword)) {
            score += 1;
        }
    });

    score += scoreDomainSpecificSignals(entry.id, context);

    return score;
}

function scoreDomainSpecificSignals(id, context) {
    const text = context.evidenceText;
    let score = 0;

    if (id === "blocked-rainwater-gutter" && containsAny(text, ["gutter", "rainwater gutter"]) && containsAny(text, ["blocked", "clogged", "debris", "not cleaned"])) {
        score += 8;
    }

    if (id === "defective-rainwater-gutter" && containsAny(text, ["gutter", "rainwater gutter"]) && containsAny(text, ["damaged", "deformed", "sagging", "leaking", "detached", "corroded", "defect"])) {
        score += 8;
    }

    if (id === "leaking-gutter-joint" && containsAny(text, ["gutter joint", "gutter connection"]) && containsAny(text, ["leak", "leaking", "dripping"])) {
        score += 10;
    }

    if (id === "insufficient-gutter-drainage" && containsAny(text, ["gutter overflow", "overflowing gutter", "gutter overtopping", "rainwater not draining from gutter"])) {
        score += 8;
    }

    if (id === "blocked-downpipe" && containsAny(text, ["downpipe", "rainwater pipe"]) && containsAny(text, ["blocked", "clogged", "blockage", "overflowing"])) {
        score += 8;
    }

    if (id === "defective-downpipe" && containsAny(text, ["downpipe", "rainwater pipe"]) && containsAny(text, ["defective", "damaged", "cracked", "corroded", "detached"])) {
        score += 8;
    }

    if (id === "leaking-downpipe-connection" && containsAny(text, ["downpipe connection", "downpipe joint", "rainwater pipe connection"]) && containsAny(text, ["leak", "leaking", "defective"])) {
        score += 10;
    }

    if (id === "disconnected-downpipe" && containsAny(text, ["downpipe"]) && containsAny(text, ["disconnected", "detached", "missing connection", "not connected"])) {
        score += 10;
    }

    if (id === "defective-rainwater-outlet" && containsAny(text, ["rainwater outlet", "roof outlet", "outlet"]) && containsAny(text, ["defective", "damaged", "defect"])) {
        score += 7;
    }

    if (id === "blocked-roof-outlet" && containsAny(text, ["roof outlet", "roof drain", "roof drainage"]) && containsAny(text, ["blocked", "clogged", "blockage", "overflow", "ponding near"])) {
        score += 10;
    }

    if (id === "insufficient-roof-drainage" && containsAny(text, ["insufficient roof drainage", "poor roof drainage", "roof water not draining", "roof drainage insufficient"])) {
        score += 10;
    }

    if (id === "defective-emergency-drainage" && containsAny(text, ["emergency outlet", "emergency overflow", "emergency drainage"]) && containsAny(text, ["blocked", "defective", "defect"])) {
        score += 10;
    }

    if (id === "missing-emergency-drainage-indication" && containsAny(text, ["missing emergency overflow", "missing emergency drainage", "no visible emergency overflow", "emergency drainage absent", "emergency overflow absent"])) {
        score += 10;
    }

    if (id === "blocked-courtyard-drain" && containsAny(text, ["courtyard drain", "yard drain"]) && containsAny(text, ["blocked", "clogged", "blockage"])) {
        score += 10;
    }

    if (id === "blocked-external-gully" && containsAny(text, ["external gully", "gully"]) && containsAny(text, ["blocked", "clogged", "blockage"])) {
        score += 10;
    }

    if (id === "defective-drainage-channel" && containsAny(text, ["drainage channel", "channel drain", "trench drain"]) && containsAny(text, ["defective", "damaged", "blocked", "blockage", "defect"])) {
        score += 10;
    }

    if (id === "insufficient-surface-water-drainage" && containsAny(text, ["surface water", "surface-water", "surface drainage"]) && containsAny(text, ["not draining", "insufficient", "poor", "blocked"])) {
        score += 8;
    }

    if (id === "adverse-site-grading" && containsAny(text, ["ground slopes toward building", "terrain slopes toward building", "adverse grading", "negative grading", "surface falls toward building"])) {
        score += 10;
    }

    if (id === "water-directed-toward-building" && containsAny(text, ["water flows toward building", "runoff directed toward", "surface water against building", "water directed toward building"])) {
        score += 10;
    }

    if (id === "local-surface-water-accumulation" && containsAny(text, ["surface water accumulation", "standing water around building", "ponding near building", "water accumulation at building base"])) {
        score += 10;
    }

    if (id === "defective-rainwater-discharge-at-building-base" && containsAny(text, ["building base", "plinth"]) && containsAny(text, ["rainwater discharge", "downpipe discharge", "water accumulation"])) {
        score += 9;
    }

    if (id === "uncontrolled-discharge-near-foundation" && containsAny(text, ["foundation"]) && containsAny(text, ["discharge near", "downpipe discharge", "rainwater discharging", "water discharge"])) {
        score += 10;
    }

    if (id === "backwater-related-drainage-risk" && containsAny(text, ["backwater", "sewer surcharge", "drain surcharge", "wastewater backing up", "water rising from drain", "backflow from drainage"])) {
        score += 10;
    }

    if (id === "missing-or-defective-backwater-protection-indication" && containsAny(text, ["missing backwater valve", "defective backwater valve", "backwater protection absent", "backwater protection defect", "missing backwater protection"])) {
        score += 10;
    }

    if (id === "combined-drainage-system-overload-indication" && containsAny(text, ["combined drainage overload", "combined system overload", "drainage system overload", "sewer surcharge"])) {
        score += 8;
    }

    if (id === "age-related-drainage-deterioration" && containsAny(text, ["age-related", "aged", "old", "corroded", "weathered"]) && containsAny(text, ["drainage", "gutter", "downpipe", "outlet", "gully", "drain"])) {
        score += 8;
    }

    if (id === "workmanship-defect" && containsAny(text, ["poor drainage installation", "incorrect drainage connection", "improper discharge arrangement", "workmanship defect", "installation defect"])) {
        score += 10;
    }

    if (id === "maintenance-related-drainage-defect" && containsAny(text, ["drainage not maintained", "gutter not cleaned", "drain not cleaned", "debris accumulation", "poor drainage maintenance"])) {
        score += 10;
    }

    return score;
}

function toHypothesis(entry) {
    return {
        id: entry.id,
        cause: entry.cause,
        classification: entry.classification,
        supportingIndicators: [...entry.supportingIndicators],
        contradictingIndicators: [...entry.contradictingIndicators],
        requiredVerification: [...entry.requiredVerification],
        potentialConsequences: [...entry.potentialConsequences],
        recommendedActions: [...entry.recommendedActions],
        riskRelevance: entry.riskRelevance,
        capexRelevance: entry.capexRelevance,
        valuationRelevance: entry.valuationRelevance
    };
}

function cloneObject(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }

    return { ...value };
}

function cloneArray(value) {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item) => cloneObject(item));
}

function textOf(value) {
    if (Array.isArray(value)) {
        return value.map((item) => textOf(item)).join(" ");
    }

    if (value && typeof value === "object") {
        return Object.values(value).map((item) => textOf(item)).join(" ");
    }

    if (value === null || value === undefined) {
        return "";
    }

    return String(value);
}

function containsAny(text, terms) {
    return terms.some((term) => containsWord(text, term));
}

function containsWord(text, term) {
    const escaped = escapeRegExp(term.toLowerCase()).replace(/\\\s+/g, "\\s+");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}