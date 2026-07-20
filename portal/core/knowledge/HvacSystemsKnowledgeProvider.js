/**
 * MBLS Expert Intelligence Layer
 * HVAC Systems Knowledge Provider
 *
 * Deterministic, pure, immutable provider for heating, ventilation, cooling,
 * controls, distribution, condensate management, maintenance, and installation
 * hypotheses. The provider does not diagnose or confirm causes.
 */

import { RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION } from "../risk/RiskRelevanceGovernanceRegistry.js";

const EMPTY_CONTRACT = Object.freeze({
    domain: "hvac-systems",
    hypotheses: []
});

const HYPOTHESES = [
    h("heating-system-operational-malfunction", "heating system operational malfunction", "heating hypothesis", ["heating not working", "heating failure", "no heat", "heating system not operating", "heating does not start", "heating malfunction"], ["heating operation is reported as unavailable or unreliable", "space-heating service appears interrupted", "heating operation requires functional verification"], ["heating operates normally during functional testing", "reported comfort issue is unrelated to the heating system"], ["Functional test of heating operation.", "Visual inspection of heat generator, controls, and distribution components.", "Review displayed fault or alarm information where available."], ["temporary or recurring loss of heating", "reduced thermal comfort", "increased operational disruption"], ["Document operating state and affected zones.", "Verify heat generation and distribution before defining repair scope.", "Request specialist HVAC assessment where the operating fault persists."], "high", "medium", "high"),
    h("heat-generator-performance-irregularity", "heat generator performance irregularity", "heating hypothesis", ["heat generator fault", "boiler fault", "heating unit fault", "heat pump fault", "district heating transfer station fault", "burner fault indication"], ["heat generator or transfer unit fault wording is reported", "displayed fault information may relate to heat generation", "heat generation performance requires verification"], ["heat generator operates normally under test", "distribution defect explains the reported symptoms without generator indicators"], ["Inspect heat generator and controls visually.", "Review displayed fault or alarm information.", "Functional test of heat generation under normal operating demand."], ["temporary or recurring loss of heating", "increased maintenance demand", "future CAPEX requirement"], ["Record fault display and operating condition.", "Review maintenance records where available.", "Arrange qualified HVAC review before replacement decisions."], "high", "medium", "high"),
    h("heat-generator-control-malfunction", "heat generator control malfunction", "control hypothesis", ["heating control not responding", "heat generator control fault", "boiler control fault", "heat pump control fault", "heating alarm", "heating error code"], ["control or alarm wording is reported at the heat generator", "heat generation may be affected by control response", "fault display requires interpretation"], ["controls respond normally during functional testing", "local emitter or valve issue explains the symptom"], ["Review displayed fault or alarm information.", "Functional test of heating controls.", "Verify control settings and command response."], ["recurring system shutdown", "reduced thermal comfort", "increased operational disruption"], ["Document control status and displayed messages.", "Verify control response before component replacement planning.", "Escalate to qualified HVAC controls assessment where needed."], "medium", "medium", "medium"),
    h("intermittent-heat-generation", "intermittent heat generation", "operational hypothesis", ["heating intermittently operating", "heating switches off", "heating system switches off", "switches off intermittently", "heating intermittent", "heating unit switches off"], ["heat generation is reported as intermittent", "heating operation may stop during demand", "operating sequence requires observation"], ["system operates continuously during representative demand", "symptom is limited to one local emitter"], ["Observe heating operation over representative demand periods.", "Review fault history or alarm display where available.", "Functional test of heat generator and control sequence."], ["recurring loss of heating", "tenant complaints", "increased maintenance demand"], ["Document timing and conditions of interruptions.", "Check control settings and safety lockout indications.", "Request specialist assessment if intermittent shutdown recurs."], "medium", "medium", "medium"),
    h("heating-system-pressure-related-indication", "heating system pressure-related indication", "verification-required indication", ["heating pressure low", "heating pressure drops", "system pressure fluctuates", "pressure loss in heating system", "heating system requires frequent refilling", "heating pressure warning"], ["heating pressure warning or pressure fluctuation is reported", "frequent refilling may indicate pressure instability", "pressure behavior requires observation before cause attribution"], ["pressure indication remains stable during observation", "wording relates to drinking-water pressure rather than heating pressure"], ["Inspect system pressure indication.", "Observe pressure development over time.", "Review refilling history and accessible heating components."], ["increased maintenance demand", "recurring system shutdown", "reduced heating distribution"], ["Record pressure indication and operating state.", "Do not infer leakage solely from low pressure.", "Arrange qualified HVAC assessment if pressure changes persist."], "medium", "medium", "medium"),
    h("circulation-impairment", "circulation impairment", "heat-distribution hypothesis", ["no circulation", "poor circulation", "circulation pump noise", "circulation pump fault", "supply warm return cold", "flow pipe warm return pipe cold", "heating loop circulation issue"], ["heating distribution or pump indicators suggest reduced circulation", "supply and return observations may indicate restricted heat transport", "circulation requires functional verification"], ["circulation pump and distribution flow operate normally", "symptom is explained by a local closed valve only"], ["Inspect circulation pump operation.", "Inspect supply and return temperature behavior qualitatively.", "Inspect heating distribution for restricted flow indicators."], ["reduced heating distribution", "uneven room temperatures", "increased operational disruption"], ["Document affected circuits and observed pipe temperature pattern.", "Verify pump operation before component conclusions.", "Request specialist hydraulic assessment where distribution remains uneven."], "medium", "medium", "medium"),
    h("air-trapped-in-heating-system-indication", "air trapped in heating system indication", "verification-required indication", ["air in radiator", "gurgling radiator", "bubbling heating system", "radiator gurgling", "heating pipe noise"], ["gurgling or bubbling is reported in heating components", "air accumulation may be one possible contributor", "venting condition requires assessment"], ["noise persists after venting assessment", "sound source is mechanical vibration rather than air-related"], ["Radiator venting assessment.", "Inspect system pressure indication before and after venting where relevant.", "Check whether noise or cold zones persist after basic verification."], ["uneven room temperatures", "increased maintenance demand", "reduced thermal comfort"], ["Document noisy or affected emitters.", "Treat trapped air as an indication pending verification.", "Escalate if symptoms recur after appropriate venting checks."], "low", "low", "low"),
    h("hydraulic-imbalance-indication", "hydraulic imbalance indication", "verification-required indication", ["hydraulic imbalance", "uneven heating", "heating distribution uneven", "some rooms cold", "uneven radiator temperature", "several rooms heat unevenly"], ["several rooms or emitters heat unevenly", "distribution pattern may be consistent with imbalance", "hydraulic distribution requires specialist verification"], ["unevenness is explained by local closed valves only", "all rooms heat evenly under representative operation"], ["Inspect heating distribution and affected zones.", "Check radiator valves and thermostatic controls.", "Hydraulic distribution assessment by a qualified HVAC specialist where necessary."], ["uneven room temperatures", "reduced thermal comfort", "tenant complaints"], ["Map affected rooms and emitters.", "Verify local control settings before balancing conclusions.", "Plan balancing review only after distribution evidence is confirmed."], "medium", "medium", "medium"),
    h("defective-or-restricted-heating-valve", "defective or restricted heating valve", "heat-distribution hypothesis", ["radiator valve stuck", "stuck radiator valve", "heating valve restricted", "thermostatic valve stuck", "valve not opening"], ["local valve movement or response is reported as restricted", "affected emitter may not receive heat due to valve condition", "valve function requires inspection"], ["valve operates freely and responds normally", "distribution fault affects multiple emitters independent of local valves"], ["Inspect radiator valves and thermostatic controls.", "Functional test of valve response where accessible.", "Check whether the affected emitter heats after control adjustment."], ["local loss of heating", "reduced thermal comfort", "increased maintenance demand"], ["Document affected valve and emitter.", "Verify valve operation before replacement planning.", "Compare with adjacent emitters and controls."], "medium", "low", "medium"),
    h("heating-control-or-thermostat-malfunction", "heating control or thermostat malfunction", "control hypothesis", ["thermostat not responding", "thermostat defective", "heating control not responding", "underfloor heating zone not responding", "actuator not responding", "heating control fault"], ["thermostat, actuator, or control response is reported abnormal", "heating command may not reach the affected zone", "control function requires testing"], ["thermostat and actuator respond normally", "heat distribution issue occurs despite correct control output"], ["Functional test of thermostat and control response.", "Inspect control settings and accessible actuators.", "Review fault or alarm information where available."], ["uneven room temperatures", "reduced thermal comfort", "increased operational disruption"], ["Document control settings and response.", "Verify local controls before wider system conclusions.", "Request HVAC controls assessment where response remains irregular."], "medium", "medium", "medium"),
    h("heat-distribution-imbalance", "heat distribution imbalance", "heat-distribution hypothesis", ["heat distribution imbalance", "heating distribution uneven", "some rooms cold", "room not heating", "uneven heating", "uneven room heating"], ["heat delivery differs between rooms or circuits", "distribution imbalance may affect thermal comfort", "room-by-room heating behavior requires verification"], ["temperature distribution is even during representative operation", "single local emitter defect explains the observation"], ["Inspect heating distribution and affected rooms.", "Check local valves, thermostats, and circulation indicators.", "Review maintenance records and distribution setup where available."], ["uneven room temperatures", "reduced thermal comfort", "tenant complaints"], ["Map affected rooms and operating conditions.", "Verify local control and valve conditions first.", "Use specialist distribution assessment if imbalance persists."], "medium", "medium", "medium"),
    h("local-heating-emitter-malfunction", "local heating emitter malfunction", "heat-distribution hypothesis", ["radiator cold", "radiator remains cold", "radiator partially cold", "upper radiator cold", "lower radiator cold", "room not heating"], ["one radiator or local emitter is reported cold", "local heat output appears reduced", "emitter operation requires verification before system conclusions"], ["all emitters heat normally", "heat generator outage affects the whole building"], ["Inspect affected radiator or emitter.", "Check local valve and thermostatic control operation.", "Assess whether air, circulation, or valve restriction may contribute."], ["local loss of heating", "reduced thermal comfort", "tenant complaints"], ["Document affected emitter and room.", "Verify local controls before heat-generator conclusions.", "Plan targeted maintenance after cause verification."], "medium", "low", "medium"),
    h("underfloor-heating-circuit-irregularity", "underfloor heating circuit irregularity", "heat-distribution hypothesis", ["underfloor heating not working", "one heating circuit cold", "underfloor heating zone not responding", "heating manifold irregularity", "underfloor heating control fault", "floor remains cold", "uneven floor heating"], ["underfloor heating circuit or zone is reported cold or unresponsive", "manifold or actuator irregularity may affect heat distribution", "floor-heating function requires targeted verification"], ["underfloor circuit responds normally during testing", "cold floor wording has no HVAC or heating context"], ["Inspect heating manifold and accessible circuits.", "Functional test of underfloor-heating actuators.", "Verify controls and circulation before circuit conclusions."], ["reduced thermal comfort", "uneven room temperatures", "reduced usability of affected rooms"], ["Document affected zone and manifold observations.", "Check actuator and thermostat response.", "Request specialist underfloor-heating assessment where needed."], "medium", "medium", "medium"),
    h("age-related-heating-system-deterioration", "age-related heating-system deterioration", "age-related hypothesis", ["age-related heating-system deterioration", "old heating system defect", "old boiler fault", "old heat pump fault", "aged heating system deterioration"], ["age wording is linked to heating defects or deterioration", "older heating components may show condition decline", "age-related relevance requires condition verification"], ["old system operates normally with no defect indicator", "age metadata is present without observed deterioration"], ["Review system age and maintenance history where available.", "Inspect accessible heating components for deterioration.", "Functional test of heating operation before renewal conclusions."], ["increased maintenance demand", "future CAPEX requirement", "accelerated component deterioration"], ["Document age-related condition indicators.", "Do not infer replacement requirement from age alone.", "Plan condition-based follow-up after verification."], "medium", "medium", "medium"),
    h("heating-system-maintenance-deficiency-indication", "heating-system maintenance deficiency indication", "maintenance hypothesis", ["heating not serviced", "heating maintenance overdue", "missing heating maintenance indication", "heating not maintained"], ["heating maintenance deficiency is indicated", "service history may be incomplete or overdue", "maintenance status requires document review"], ["maintenance records show current servicing", "metadata alone states maintenance status without a defect"], ["Review maintenance records where available.", "Inspect heat generator and distribution components for service condition.", "Functional test after maintenance-related checks."], ["increased maintenance demand", "recurring system shutdown", "future CAPEX requirement"], ["Document available service information.", "Treat missing documentation as an indication requiring verification.", "Schedule maintenance review where service condition is unclear."], "medium", "low", "medium"),

    h("ventilation-airflow-restriction", "ventilation airflow restriction", "ventilation hypothesis", ["ventilation airflow low", "weak airflow", "no airflow", "airflow restricted", "air outlet blocked", "supply-air outlet blocked", "extract-air outlet blocked"], ["airflow is reported weak, absent, or restricted", "outlet blockage may affect ventilation effectiveness", "airflow requires assessment at supply or extract points"], ["airflow is normal at tested outlets", "symptom is unrelated to mechanical ventilation"], ["Airflow assessment at supply and extract points.", "Inspect accessible outlets, grilles, filters, and ducts.", "Functional test of ventilation unit under normal operation."], ["reduced ventilation effectiveness", "degraded indoor-air comfort", "tenant complaints"], ["Document affected outlets and operating mode.", "Inspect filters and accessible ducts before fan conclusions.", "Request specialist ventilation assessment if restriction persists."], "medium", "medium", "medium"),
    h("ventilation-filter-contamination", "ventilation filter contamination", "maintenance hypothesis", ["dirty ventilation filter", "contaminated filter", "clogged ventilation filter", "filter overdue", "filter not replaced"], ["filter contamination or overdue replacement is reported", "filter condition may restrict airflow", "filter maintenance requires direct inspection"], ["filter is clean and correctly installed", "airflow issue persists with clean filters"], ["Inspect ventilation filters.", "Review maintenance records where available.", "Observe ventilation operation after filter condition is addressed."], ["reduced ventilation effectiveness", "increased maintenance demand", "degraded indoor-air comfort"], ["Document filter condition and location.", "Replace or clean filters where appropriate after verification.", "Reassess airflow after filter maintenance."], "medium", "low", "medium"),
    h("ventilation-fan-malfunction", "ventilation fan malfunction", "ventilation hypothesis", ["fan not running", "ventilation fan malfunction", "ventilation fan fault", "rattling ventilation unit", "fan noise", "ventilation unit not operating"], ["fan operation is reported abnormal", "fan noise or non-operation may affect ventilation", "fan function requires testing"], ["fan runs normally without abnormal noise", "airflow issue is explained by filter or outlet obstruction"], ["Functional test of ventilation unit.", "Inspect fan operation and accessible fan housing.", "Review fault display or alarm information where available."], ["reduced ventilation effectiveness", "excessive operating noise", "increased operational disruption"], ["Document fan operating state and noise conditions.", "Verify filter and duct condition before fan conclusions.", "Request specialist ventilation assessment where malfunction persists."], "medium", "medium", "medium"),
    h("ventilation-control-malfunction", "ventilation control malfunction", "control hypothesis", ["ventilation control fault", "ventilation alarm", "ventilation error code", "ventilation control not responding"], ["ventilation control, alarm, or error wording is reported", "control response may affect ventilation operation", "control status requires verification"], ["controls respond normally during functional testing", "ventilation issue is explained by blocked filters only"], ["Inspect ventilation control settings.", "Review fault or alarm information.", "Functional test of control response."], ["reduced ventilation effectiveness", "recurring system shutdown", "tenant complaints"], ["Document control settings and displayed messages.", "Verify operating mode before component conclusions.", "Escalate to specialist controls assessment if required."], "medium", "medium", "medium"),
    h("air-distribution-imbalance", "air-distribution imbalance", "ventilation hypothesis", ["irregular airflow", "uneven airflow", "air-distribution imbalance", "some rooms weak airflow"], ["airflow distribution differs between rooms or outlets", "air balance may affect ventilation effectiveness", "distribution requires airflow assessment"], ["airflow is balanced at representative outlets", "local user setting explains the observation"], ["Airflow assessment at supply and extract points.", "Inspect outlets and accessible ducts.", "Review control settings and operating mode."], ["degraded indoor-air comfort", "tenant complaints", "reduced ventilation effectiveness"], ["Map affected outlets and rooms.", "Verify filters and outlet obstructions first.", "Request specialist ventilation assessment if imbalance persists."], "medium", "medium", "medium"),
    h("obstructed-or-contaminated-air-duct-indication", "obstructed or contaminated air duct indication", "verification-required indication", ["duct contamination", "dust accumulation in duct", "obstructed air duct", "air duct blocked", "debris in duct"], ["accessible duct contamination or obstruction is indicated", "duct condition may restrict airflow", "concealed duct condition requires verification"], ["accessible ducts are clean and unobstructed", "airflow issue is localized at outlet or filter only"], ["Inspect accessible ducts and outlets.", "Airflow assessment at affected points.", "Specialist ventilation assessment where concealed duct condition is uncertain."], ["reduced ventilation effectiveness", "degraded indoor-air comfort", "increased maintenance demand"], ["Document accessible duct condition.", "Clean or inspect affected sections where appropriate.", "Verify airflow after maintenance action."], "medium", "medium", "medium"),
    h("excessive-ventilation-noise", "excessive ventilation noise", "operational hypothesis", ["ventilation noisy", "fan noise", "rattling ventilation unit", "vibration from ventilation", "whistling air outlet"], ["ventilation noise or vibration is reported", "noise may indicate airflow, mounting, or fan irregularity", "noise source requires verification"], ["noise is absent during normal operation", "sound source is unrelated to ventilation equipment"], ["Observe ventilation during normal operating conditions.", "Inspect fan operation, outlets, supports, and accessible ducts.", "Check control setting and operating mode."], ["excessive operating noise", "tenant complaints", "increased maintenance demand"], ["Document noise location and operating condition.", "Do not infer bearing failure from noise alone.", "Request specialist assessment if noise persists."], "low", "low", "medium"),
    h("insufficient-ventilation-operation-indication", "insufficient ventilation operation indication", "verification-required indication", ["ventilation not working", "ventilation unit not operating", "stale air despite ventilation", "insufficient ventilation operation", "ventilation operation insufficient"], ["ventilation operation is reported insufficient or unavailable", "stale air is reported with mechanical ventilation context", "operation requires functional verification"], ["ventilation operates normally under test", "stale air wording has no mechanical ventilation defect context"], ["Functional test of ventilation unit.", "Inspect control settings and operating mode.", "Airflow assessment at supply and extract points."], ["reduced ventilation effectiveness", "degraded indoor-air comfort", "tenant complaints"], ["Document operating state and affected rooms.", "Verify filters, controls, and fan operation before capacity conclusions.", "Review maintenance records where available."], "medium", "medium", "medium"),
    h("ventilation-condensate-management-defect", "ventilation condensate-management defect", "condensate hypothesis", ["condensate in ventilation unit", "water below ventilation unit", "ventilation condensate leak", "ventilation drain blocked", "ventilation condensate drainage defect"], ["condensate or water is reported at ventilation equipment", "ventilation condensate collection or discharge may be impaired", "condensate path requires inspection"], ["water source is unrelated to ventilation equipment", "condensate drain and tray are clear during inspection"], ["Inspect condensate collection and discharge.", "Inspect ventilation unit during normal operating conditions.", "Verify drain path and accessible connections."], ["condensate leakage", "local moisture exposure", "damage to adjacent finishes"], ["Document water location relative to the ventilation unit.", "Verify condensate discharge before broader moisture conclusions.", "Plan targeted cleaning or repair after verification."], "medium", "medium", "medium"),
    h("age-related-ventilation-system-deterioration", "age-related ventilation-system deterioration", "age-related hypothesis", ["age-related ventilation-system deterioration", "old ventilation system defect", "old ventilation unit noisy", "aged ventilation unit deterioration"], ["age wording is linked to ventilation defect or deterioration", "older ventilation components may show condition decline", "age-related relevance requires condition verification"], ["old ventilation system operates normally", "system age metadata is present without observed defect"], ["Review system age and maintenance history where available.", "Inspect accessible ventilation unit, fans, filters, and ducts.", "Functional test of ventilation operation."], ["increased maintenance demand", "reduced ventilation effectiveness", "future CAPEX requirement"], ["Document age-related condition indicators.", "Do not infer replacement requirement from age alone.", "Plan condition-based follow-up after verification."], "medium", "medium", "medium"),
    h("ventilation-maintenance-deficiency-indication", "ventilation maintenance deficiency indication", "maintenance hypothesis", ["ventilation not serviced", "ventilation not maintained", "missing ventilation maintenance indication", "filter not replaced", "ventilation filter overdue"], ["ventilation maintenance deficiency is indicated", "filter or service history may be incomplete", "maintenance condition requires verification"], ["records show current ventilation maintenance", "maintenance metadata alone has no observed defect"], ["Review maintenance records.", "Inspect filters, fan, and accessible ventilation components.", "Functional test after maintenance condition is checked."], ["increased maintenance demand", "reduced ventilation effectiveness", "tenant complaints"], ["Document service information and filter condition.", "Treat missing documentation as an indication requiring verification.", "Schedule maintenance review where needed."], "medium", "low", "medium"),

    h("cooling-system-operational-malfunction", "cooling-system operational malfunction", "cooling hypothesis", ["air conditioning not working", "cooling system not operating", "cooling intermittent", "cooling unit switches off", "cooling system alarm", "cooling error code"], ["cooling operation is reported unavailable or intermittent", "alarm or error information may relate to cooling operation", "cooling system requires functional verification"], ["cooling operates normally under suitable operating conditions", "comfort complaint is unrelated to the cooling system"], ["Functional test under suitable operating conditions.", "Review fault displays or alarms.", "Inspect indoor and outdoor units where accessible."], ["reduced cooling performance", "recurring system shutdown", "tenant complaints"], ["Document operating state and affected rooms.", "Verify controls, filters, and airflow before component conclusions.", "Request specialist cooling-system assessment where needed."], "medium", "medium", "medium"),
    h("insufficient-cooling-performance-indication", "insufficient cooling performance indication", "verification-required indication", ["air conditioner not cooling", "cooling insufficient", "room not cooling", "cooling performance reduced", "reduced cooling performance"], ["cooling output is reported reduced", "affected room may not reach expected comfort", "cooling performance requires verification under suitable conditions"], ["cooling performance is normal during representative operation", "issue is explained by user setting or non-HVAC heat gains"], ["Functional test under suitable operating conditions.", "Inspect filters, airflow, and unit operation.", "Specialist cooling-system assessment where performance remains reduced."], ["reduced cooling performance", "reduced usability of affected rooms", "tenant complaints"], ["Document operating mode and affected zones.", "Do not infer refrigerant loss from reduced cooling alone.", "Check maintenance and airflow before refrigerant-circuit assessment."], "medium", "medium", "medium"),
    h("cooling-airflow-restriction", "cooling airflow restriction", "cooling hypothesis", ["weak cooling airflow", "blocked cooling filter", "dirty air-conditioning filter", "cooling airflow restricted", "cooling airflow low"], ["cooling airflow is weak or restricted", "filter condition may affect cooling airflow", "airflow requires inspection"], ["airflow is normal at the indoor unit", "cooling issue is unrelated to airflow path"], ["Inspect filters and airflow.", "Inspect indoor unit air path.", "Functional test of fan operation."], ["reduced cooling performance", "increased maintenance demand", "tenant complaints"], ["Document airflow condition and filter state.", "Clean or replace filters where appropriate after inspection.", "Reassess cooling operation after airflow restrictions are addressed."], "medium", "low", "medium"),
    h("cooling-control-malfunction", "cooling control malfunction", "control hypothesis", ["cooling control fault", "cooling control not responding", "air-conditioning control fault", "cooling thermostat not responding", "cooling error code"], ["cooling control or error wording is reported", "control response may affect cooling operation", "control status requires verification"], ["controls respond normally during functional testing", "cooling issue is explained by filter or airflow restriction"], ["Inspect control settings.", "Functional test of cooling control response.", "Review fault or alarm information where available."], ["recurring system shutdown", "reduced cooling performance", "tenant complaints"], ["Document control settings and displayed messages.", "Verify control response before component conclusions.", "Escalate to specialist cooling controls assessment if needed."], "medium", "medium", "medium"),
    h("hvac-condensate-drainage-defect", "HVAC condensate drainage defect", "condensate hypothesis", ["blocked condensate drain", "damaged condensate hose", "condensate tray standing water", "condensate drain blocked", "condensate drainage defect"], ["condensate drainage path is reported blocked or damaged", "standing water in condensate collection may indicate discharge restriction", "condensate path requires inspection"], ["condensate tray and drain are clear", "water source is unrelated to HVAC equipment"], ["Inspect condensate tray and condensate discharge.", "Inspect visible hose and drain connections.", "Functional observation during normal cooling or ventilation operation."], ["condensate leakage", "local moisture exposure", "damage to adjacent finishes"], ["Document condensate path and water location.", "Clear or repair drainage path after verification.", "Do not diagnose general building drainage from HVAC condensate observations alone."], "medium", "medium", "medium"),
    h("condensate-overflow-or-leakage", "condensate overflow or leakage", "condensate hypothesis", ["air-conditioning unit leaking water", "condensate dripping", "condensate overflowing", "water below indoor unit", "condensate leakage"], ["water or condensate is reported below HVAC equipment", "condensate overflow or leakage may be present", "water source requires verification"], ["water source is unrelated to HVAC equipment", "condensate collection and discharge operate normally"], ["Inspect condensate tray and discharge.", "Inspect indoor unit and visible connections.", "Observe operation under suitable conditions where appropriate."], ["condensate leakage", "local moisture exposure", "damage to adjacent finishes"], ["Document water location and affected finishes.", "Verify condensate path before concluding blockage.", "Plan targeted condensate repair or cleaning after verification."], "medium", "medium", "medium"),
    h("evaporator-icing-indication", "evaporator icing indication", "verification-required indication", ["evaporator icing", "indoor unit icing", "ice on cooling coil", "ice on evaporator"], ["visible icing is reported at cooling components", "icing may affect cooling operation", "technical cause requires specialist verification"], ["no icing is visible during operation", "ice wording is unrelated to HVAC cooling equipment"], ["Inspect visible icing under suitable operating conditions.", "Inspect filters and airflow.", "Specialist cooling-system assessment where icing recurs."], ["reduced cooling performance", "recurring system shutdown", "accelerated component deterioration"], ["Document icing location and operating mode.", "Do not infer refrigerant defect from icing alone.", "Verify airflow and maintenance condition before refrigerant-circuit assessment."], "medium", "medium", "medium"),
    h("excessive-cooling-system-noise", "excessive cooling-system noise", "cooling hypothesis", ["air-conditioning unit noisy", "compressor noise indication", "fan noise", "vibration from cooling unit", "cooling unit noise"], ["cooling equipment noise or vibration is reported", "noise source may relate to fan, compressor, support, or airflow", "noise requires direct observation"], ["noise is absent during representative operation", "sound source is unrelated to cooling equipment"], ["Observe cooling unit during normal operation.", "Inspect fan operation, supports, and accessible components.", "Review operating mode and fault display."], ["excessive operating noise", "tenant complaints", "increased maintenance demand"], ["Document noise location and operating condition.", "Do not infer compressor failure from noise alone.", "Request specialist assessment where noise persists."], "low", "medium", "medium"),
    h("age-related-cooling-system-deterioration", "age-related cooling-system deterioration", "age-related hypothesis", ["age-related cooling-system deterioration", "old air-conditioning system defect", "old cooling system noisy", "aged cooling unit deterioration"], ["age wording is linked to cooling defect or deterioration", "older cooling components may show condition decline", "age-related relevance requires condition verification"], ["old cooling system operates normally", "system age metadata is present without observed defect"], ["Review system age and maintenance history where available.", "Inspect indoor and outdoor units where accessible.", "Functional test under suitable operating conditions."], ["increased maintenance demand", "future CAPEX requirement", "reduced cooling performance"], ["Document age-related condition indicators.", "Do not infer replacement requirement from age alone.", "Plan condition-based follow-up after verification."], "medium", "medium", "medium"),
    h("cooling-system-maintenance-deficiency-indication", "cooling-system maintenance deficiency indication", "maintenance hypothesis", ["air conditioning not serviced", "cooling not serviced", "cooling not maintained", "dirty air-conditioning filter", "blocked cooling filter"], ["cooling maintenance deficiency or filter contamination is indicated", "maintenance condition may affect operation", "service history requires verification"], ["records show current cooling-system maintenance", "maintenance metadata alone has no observed defect"], ["Review maintenance records.", "Inspect filters, indoor unit, and outdoor unit where accessible.", "Functional test after maintenance condition is checked."], ["increased maintenance demand", "reduced cooling performance", "recurring system shutdown"], ["Document service information and filter condition.", "Treat missing documentation as an indication requiring verification.", "Schedule cooling maintenance review where needed."], "medium", "low", "medium"),

    h("hvac-installation-defect-indication", "HVAC installation defect indication", "installation hypothesis", ["poor HVAC installation", "HVAC installation defect", "incorrect HVAC installation", "unsupported duct", "unsupported pipe", "defective bracket"], ["installation or support condition is reported irregular", "installation quality may affect HVAC operation or durability", "installation detail requires inspection"], ["installation appears secure and consistent", "issue is explained by maintenance condition only"], ["Inspect accessible supports and fixings.", "Inspect installation details and component alignment.", "Review technical documentation where available."], ["increased maintenance demand", "accelerated component deterioration", "consequential damage to nearby components"], ["Document installation irregularities with location references.", "Verify functional relevance before repair scope decisions.", "Request specialist HVAC assessment where installation condition is unclear."], "medium", "medium", "medium"),
    h("hvac-connection-defect-indication", "HVAC connection defect indication", "installation hypothesis", ["incorrect HVAC connection", "HVAC connection defect", "loose HVAC connection", "incorrect heating connection", "incorrect ventilation connection", "incorrect cooling connection"], ["HVAC connection condition is reported irregular", "connection defect may affect operation or leakage control", "connection details require verification"], ["connections are secure and correctly arranged", "reported issue is unrelated to HVAC connections"], ["Inspect accessible connections.", "Review technical documentation where available.", "Functional test affected system after connection review."], ["increased maintenance demand", "operational disruption", "consequential damage to nearby components"], ["Document affected connections.", "Verify intended arrangement before corrective work.", "Request specialist HVAC assessment where connection details are concealed."], "medium", "medium", "medium"),
    h("defective-insulation-on-hvac-distribution-components", "defective insulation on HVAC distribution components", "material-deterioration hypothesis", ["deteriorated insulation", "damaged insulation", "defective insulation", "damaged HVAC insulation", "heating pipe insulation damaged", "duct insulation damaged"], ["insulation damage is reported on HVAC distribution components", "distribution component insulation may be deteriorated", "insulation condition requires inspection"], ["insulation is intact and correctly fitted", "insulation wording is unrelated to HVAC components"], ["Inspect accessible insulation on HVAC distribution components.", "Check adjacent surfaces for local exposure or condensation indicators.", "Review whether insulation condition affects nearby components."], ["local moisture exposure", "accelerated component deterioration", "increased operational cost indication"], ["Document damaged insulation and component location.", "Plan targeted insulation repair after verification.", "Do not infer exact energy loss from insulation condition alone."], "low", "low", "medium"),
    h("damaged-or-deteriorated-hvac-component", "damaged or deteriorated HVAC component", "material-deterioration hypothesis", ["damaged HVAC component", "deteriorated HVAC component", "corrosion on HVAC component", "corroded HVAC component", "loose HVAC component"], ["HVAC component damage, corrosion, or deterioration is reported", "component condition may require maintenance", "functional relevance requires verification"], ["component is intact and functioning normally", "corrosion wording is unrelated to HVAC components"], ["Inspect damaged or deteriorated component.", "Functional test affected HVAC system where appropriate.", "Review maintenance history where available."], ["accelerated component deterioration", "increased maintenance demand", "future CAPEX requirement"], ["Document component condition and location.", "Do not infer functional failure from corrosion or age alone.", "Plan repair or monitoring based on verified condition."], "medium", "medium", "medium"),
    h("unsupported-or-poorly-secured-hvac-component", "unsupported or poorly secured HVAC component", "installation hypothesis", ["unsupported HVAC component", "unsupported duct", "unsupported pipe", "defective bracket", "loose HVAC component", "poorly secured HVAC component"], ["HVAC component support or fixing appears inadequate", "loose or unsupported components may affect durability or noise", "support condition requires inspection"], ["supports and fixings are secure", "reported vibration comes from another non-HVAC source"], ["Inspect supports and fixings.", "Observe component movement during operation where appropriate.", "Review installation details where available."], ["excessive operating noise", "accelerated component deterioration", "consequential damage to nearby components"], ["Document loose or unsupported locations.", "Verify support condition before corrective scope decisions.", "Plan targeted fixing repair after verification."], "medium", "low", "medium"),
    h("hvac-system-interaction-irregularity", "HVAC system interaction irregularity", "verification-required hypothesis", ["HVAC system interaction", "heating and ventilation irregular", "cooling and ventilation irregular", "heating cooling control conflict", "related HVAC observations"], ["multiple HVAC subsystems show related irregular observations", "system interaction may affect comfort or operation", "interaction requires coordinated verification"], ["observations are isolated to one subsystem", "subsystems operate independently without interaction symptoms"], ["Review technical documentation and control strategy.", "Functional test related HVAC systems under representative operation.", "Specialist HVAC assessment where system interaction remains unclear."], ["reduced thermal comfort", "degraded indoor-air comfort", "increased operational disruption"], ["Document interacting observations and operating modes.", "Verify each subsystem before interaction conclusions.", "Coordinate specialist assessment where symptoms overlap."], "medium", "medium", "medium")
];

const HVAC_COMPONENT_TERMS = [
    "hvac", "heating", "heat generator", "boiler", "heat pump", "district heating", "burner", "radiator", "underfloor heating", "heating circuit", "heating manifold", "thermostat", "heating control", "circulation pump", "ventilation", "ventilation unit", "fan", "air duct", "duct", "air outlet", "supply-air", "extract-air", "cooling", "air conditioning", "air-conditioning", "air conditioner", "indoor unit", "outdoor unit", "evaporator", "cooling coil", "condensate", "chiller", "hvac component", "hvac insulation"
];

const HVAC_ISSUE_TERMS = [
    "not working", "failure", "fault", "not operating", "intermittent", "switches off", "does not start", "alarm", "error code", "malfunction", "cold", "uneven", "no circulation", "poor circulation", "noise", "noisy", "vibration", "gurgling", "bubbling", "stuck", "not responding", "pressure low", "pressure drops", "requires frequent refilling", "restricted", "blocked", "dirty", "contaminated", "clogged", "overdue", "not serviced", "not maintained", "leak", "leaking", "dripping", "overflowing", "icing", "damaged", "deteriorated", "corrosion", "loose", "unsupported", "defect", "defective", "poor installation", "incorrect connection", "workmanship defect", "reduced", "insufficient"
];

const FALSE_POSITIVE_CONTEXTS = [
    "hot weather", "cold weather", "summer temperature", "winter temperature", "climate description", "drinking-water pressure", "drinking water pressure", "domestic hot-water circulation", "domestic hot water circulation", "sanitary ventilation pipe", "roof ventilation", "facade ventilation", "natural window ventilation", "open windows", "closed windows", "decorative fan", "computer fan", "vehicle air conditioning", "refrigerator cooling", "refrigeration appliance", "brand name", "model name", "marketing", "address"
];

export default class HvacSystemsKnowledgeProvider {

    /**
     * Return deterministic knowledge for HVAC findings.
     *
     * @param {Object} [input={}] - Knowledge input payload.
     * @returns {Object} Stable HVAC systems knowledge contract.
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
            domain: "hvac-systems",
            hypotheses: ranked.map((item) => toHypothesis(item.entry))
        };
    }

}

function h(id, cause, classification, keywords, supportingIndicators, contradictingIndicators, requiredVerification, potentialConsequences, recommendedActions, riskRelevance, capexRelevance, valuationRelevance) {
    return {
        id,
        cause,
        classification,
        keywords,
        supportingIndicators,
        contradictingIndicators,
        requiredVerification,
        potentialConsequences,
        recommendedActions,
        riskRelevance,
        capexRelevance,
        valuationRelevance
    };
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
        textOf(source.building.heatingSystemType).trim().length > 0 ||
        textOf(source.building.heatGeneratorType).trim().length > 0 ||
        textOf(source.building.heatDistributionType).trim().length > 0 ||
        textOf(source.building.ventilationSystemType).trim().length > 0 ||
        textOf(source.building.coolingSystemType).trim().length > 0 ||
        textOf(source.building.controlSystemType).trim().length > 0 ||
        textOf(source.building.energySource).trim().length > 0 ||
        textOf(source.building.systemAge).trim().length > 0 ||
        textOf(source.building.maintenanceStatus).trim().length > 0 ||
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
        textOf(source.building.heatingSystemType),
        textOf(source.building.heatGeneratorType),
        textOf(source.building.heatDistributionType),
        textOf(source.building.ventilationSystemType),
        textOf(source.building.coolingSystemType),
        textOf(source.building.controlSystemType),
        textOf(source.building.energySource),
        textOf(source.building.systemAge),
        textOf(source.building.maintenanceStatus)
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

    return {
        text: [findingText, buildingText, measurementText].join(" ").trim(),
        evidenceText,
        findingText,
        buildingText,
        measurementText
    };
}

function isRelevantContext(context) {
    const evidence = context.evidenceText;

    if (evidence.length === 0) {
        return false;
    }

    if (FALSE_POSITIVE_CONTEXTS.some((term) => containsWord(evidence, term))) {
        return false;
    }

    if (/\b(room|space)\s+(warm|cold)\b/.test(evidence) && !/hvac|heating|radiator|underfloor|cooling|air conditioning|air-conditioning|thermostat|ventilation/.test(evidence)) {
        return false;
    }

    if (/\b(stale air|humidity|condensation|mould|mold|noise|vibration|corrosion|pressure|pump|filter|water leak|pipe leak|leakage)\b/.test(evidence) && !HVAC_COMPONENT_TERMS.some((term) => containsWord(evidence, term))) {
        return false;
    }

    if (/kitchen extractor fan/.test(evidence) && !/building ventilation|mechanical ventilation|hvac/.test(evidence)) {
        return false;
    }

    if (/bathroom fan/.test(evidence) && !/not working|not operating|fan noise|fault|malfunction|blocked|weak airflow/.test(evidence)) {
        return false;
    }

    if (/parking-garage ventilation/.test(evidence) && !/not working|not operating|fan|airflow|fault|alarm|error code|blocked|mechanical/.test(evidence)) {
        return false;
    }

    const hasComponent = HVAC_COMPONENT_TERMS.some((term) => containsWord(evidence, term));
    const hasIssue = HVAC_ISSUE_TERMS.some((term) => containsWord(evidence, term));

    if (hasComponent && hasIssue) {
        return true;
    }

    return containsAny(evidence, [
        "no heat",
        "some rooms cold",
        "room not heating",
        "floor remains cold",
        "weak airflow",
        "no airflow",
        "stale air despite ventilation",
        "water below indoor unit",
        "water below ventilation unit",
        "condensate dripping",
        "condensate overflowing",
        "ice on cooling coil"
    ]);
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

    score += scoreDomainSignals(entry.id, context.evidenceText);

    return score;
}

function scoreDomainSignals(id, text) {
    let score = 0;

    if (id === "local-heating-emitter-malfunction" && containsAny(text, ["radiator cold", "radiator remains cold", "radiator partially cold", "upper radiator cold", "lower radiator cold"])) score += 10;
    if (id === "circulation-impairment" && containsAny(text, ["supply warm return cold", "flow pipe warm return pipe cold", "no circulation", "poor circulation", "circulation pump fault"])) score += 10;
    if (id === "intermittent-heat-generation" && containsAny(text, ["heating switches off", "heating system switches off", "switches off intermittently", "heating unit switches off"])) score += 10;
    if (id === "air-trapped-in-heating-system-indication" && containsAny(text, ["gurgling radiator", "air in radiator", "bubbling heating system"])) score += 10;
    if (id === "hydraulic-imbalance-indication" && containsAny(text, ["partially cold", "uneven heating", "some rooms cold", "several rooms heat unevenly"])) score += 8;
    if (id === "heating-system-pressure-related-indication" && containsAny(text, ["heating pressure low", "heating pressure drops", "frequent refilling", "pressure loss in heating system"])) score += 10;
    if (id === "underfloor-heating-circuit-irregularity" && containsAny(text, ["underfloor heating", "heating circuit cold", "floor remains cold", "heating manifold", "actuator not responding"])) score += 10;
    if (id === "ventilation-filter-contamination" && containsAny(text, ["dirty ventilation filter", "contaminated filter", "clogged ventilation filter", "filter overdue"])) score += 10;
    if (id === "ventilation-airflow-restriction" && containsAny(text, ["weak airflow", "no airflow", "airflow restricted", "air outlet blocked"])) score += 9;
    if (id === "ventilation-fan-malfunction" && containsAny(text, ["fan not running", "fan noise", "rattling ventilation unit", "ventilation unit not operating"])) score += 8;
    if (id === "hvac-condensate-drainage-defect" && containsAny(text, ["blocked condensate drain", "damaged condensate hose", "condensate tray", "ventilation drain blocked"])) score += 10;
    if (id === "condensate-overflow-or-leakage" && containsAny(text, ["condensate dripping", "condensate overflowing", "air-conditioning unit leaking water", "water below indoor unit"])) score += 10;
    if (id === "insufficient-cooling-performance-indication" && containsAny(text, ["air conditioner not cooling", "cooling insufficient", "room not cooling", "cooling performance reduced"])) score += 10;
    if (id === "cooling-airflow-restriction" && containsAny(text, ["weak cooling airflow", "blocked cooling filter", "dirty air-conditioning filter"])) score += 10;
    if (id === "evaporator-icing-indication" && containsAny(text, ["evaporator icing", "indoor unit icing", "ice on cooling coil"])) score += 10;
    if (id === "hvac-installation-defect-indication" && containsAny(text, ["poor hvac installation", "unsupported duct", "unsupported pipe", "defective bracket"])) score += 10;
    if (id === "damaged-or-deteriorated-hvac-component" && containsAny(text, ["corrosion on hvac component", "damaged hvac component", "deteriorated hvac component"])) score += 10;

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
        riskRelevanceVersion: RISK_RELEVANCE_SUPPORTED_SOURCE_VERSION,
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
