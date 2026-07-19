const windowsDoorsBilingualResources = freezeResources({
    "defective-perimeter-seal": {
        cause: { en: "defective perimeter seal", de: "mangelhafte Anschlussdichtung" },
        label: { en: "defective perimeter seal", de: "mangelhafte Anschlussdichtung" },
        classification: { en: "perimeter seal hypothesis", de: "Hypothese zur Anschlussdichtung" },
        supportingIndicators: {
            en: ["visible seal discontinuity around frame perimeter", "localized leakage or draught near frame edge", "aged or cracked perimeter sealant"],
            de: ["sichtbare Unterbrechung der Dichtung am Rahmenumfang", "lokale Feuchtigkeit oder Zugluft nahe der Rahmenkante", "gealterte oder rissige Anschlussdichtung"]
        },
        contradictingIndicators: {
            en: ["no deterioration at perimeter sealing line", "symptoms clearly limited to glazing edge only"],
            de: ["keine Verschlechterung an der umlaufenden Dichtungslinie", "Anzeichen klar nur auf den Glasrand begrenzt"]
        },
        requiredVerification: {
            en: ["Inspect full perimeter seal continuity around the opening.", "Check whether leakage or draught aligns with perimeter joints.", "Use specialist inspection if hidden perimeter details are concealed."],
            de: ["Kontinuität der Anschlussdichtung umlaufend am Öffnungselement prüfen.", "Abgleichen, ob Feuchtigkeit oder Zugluft mit den Anschlussfugen zusammenhängt.", "Bei verdeckten Anschlussdetails fachliche Vertiefungsprüfung vorsehen."]
        },
        potentialConsequences: {
            en: ["recurring local moisture ingress or air leakage", "degradation of adjacent finishes", "increased maintenance scope"],
            de: ["wiederkehrender lokaler Feuchteeintrag oder Luftundichtigkeit", "Beeinträchtigung angrenzender Oberflächen", "erweiterter Instandhaltungsumfang"]
        },
        recommendedActions: {
            en: ["Document perimeter condition with close-up photos.", "Map leakage or draught pattern around the frame.", "Schedule targeted remedial planning after verification."],
            de: ["Anschlusszustand mit Detailfotos dokumentieren.", "Feuchte- oder Zugluftmuster am Rahmen verorten.", "Gezielte Maßnahmenplanung erst nach Verifikation ansetzen."]
        }
    },
    "defective-glazing-seal": {
        cause: { en: "defective glazing seal", de: "mangelhafte Verglasungsdichtung" },
        label: { en: "defective glazing seal", de: "mangelhafte Verglasungsdichtung" },
        classification: { en: "glazing seal hypothesis", de: "Hypothese zur Verglasungsdichtung" },
        supportingIndicators: {
            en: ["glazing-edge condition indicates possible seal degradation", "moisture or haze patterns consistent with edge-seal issues", "localized deterioration at glass-to-frame interface"],
            de: ["Zustand am Glasrand weist auf mögliche Dichtungsalterung hin", "Feuchte- oder Schleiermuster passen zu Randverbundthemen", "lokale Verschlechterung am Übergang zwischen Glas und Rahmen"]
        },
        contradictingIndicators: {
            en: ["no glazing-edge anomaly observed", "symptoms confined to external perimeter joint only"],
            de: ["keine Auffälligkeit am Glasrand beobachtet", "Anzeichen nur auf die äußere Anschlussfuge begrenzt"]
        },
        requiredVerification: {
            en: ["Inspect glazing edge and spacer zone for seal degradation signs.", "Differentiate glazing-seal defects from perimeter-joint defects.", "Use specialist glazing review if seal condition is uncertain."],
            de: ["Glasrand und Abstandhalterzone auf Hinweise zur Dichtungsalterung prüfen.", "Mängel an der Verglasungsdichtung von Anschlussfugenmängeln abgrenzen.", "Bei unklarer Dichtungslage fachliche Verglasungsprüfung vorsehen."]
        },
        potentialConsequences: {
            en: ["decline in glazing performance", "recurring condensation-related complaints", "possible replacement planning at element level"],
            de: ["nachlassende Verglasungsleistung", "wiederkehrende kondensationsbezogene Beschwerden", "mögliche Maßnahmenplanung auf Bauteilebene"]
        },
        recommendedActions: {
            en: ["Record edge-seal condition and affected pane location.", "Review glazing specification and service history.", "Coordinate specialist glazing verification where needed."],
            de: ["Zustand des Randverbunds und Lage der betroffenen Scheibe erfassen.", "Verglasungsspezifikation und Nutzungshistorie prüfen.", "Bei Bedarf fachliche Verglasungsverifikation koordinieren."]
        }
    },
    "failed-installation-joint": {
        cause: { en: "failed installation joint", de: "mangelhafte Einbaufuge" },
        label: { en: "failed installation joint", de: "mangelhafte Einbaufuge" },
        classification: { en: "installation joint hypothesis", de: "Hypothese zur Einbaufuge" },
        supportingIndicators: {
            en: ["distress pattern follows installation interface zone", "joint-line leakage or air path at installation boundary", "installation connection appears discontinuous"],
            de: ["Schadensbild folgt der Zone des Einbauanschlusses", "Feuchtigkeit oder Luftweg entlang der Einbaugrenze", "Einbauanschluss erscheint unterbrochen"]
        },
        contradictingIndicators: {
            en: ["no anomaly at installation boundary", "issue appears isolated to hardware only"],
            de: ["keine Auffälligkeit an der Einbaugrenze", "Thema erscheint nur auf Beschläge begrenzt"]
        },
        requiredVerification: {
            en: ["Inspect installation joint continuity around the element.", "Verify whether symptoms align with the joint path.", "Use opening-up or specialist review where concealed joint layers cannot be seen."],
            de: ["Kontinuität der Einbaufuge umlaufend am Element prüfen.", "Prüfen, ob die Anzeichen dem Fugenverlauf folgen.", "Bei verdeckten Fugenschichten Öffnung oder fachliche Prüfung vorsehen."]
        },
        potentialConsequences: {
            en: ["recurring leakage at interface level", "ongoing finish deterioration around openings", "increased intervention complexity"],
            de: ["wiederkehrende Feuchtigkeit auf Anschlussebene", "fortlaufende Verschlechterung von Oberflächen um Öffnungen", "erhöhte Eingriffskomplexität"]
        },
        recommendedActions: {
            en: ["Map defect extent along installation joint zones.", "Document inside and outside interface condition.", "Sequence remediation after source-path verification."],
            de: ["Ausdehnung entlang der Einbaufugenbereiche kartieren.", "Zustand der Anschlusszone innen und außen dokumentieren.", "Maßnahmenabfolge nach Verifikation des Feuchte- oder Luftwegs festlegen."]
        }
    },
    "defective-flashing-or-sill-connection": {
        cause: { en: "defective flashing or sill connection", de: "mangelhafter Blech- oder Sohlbankanschluss" },
        label: { en: "defective flashing or sill connection", de: "mangelhafter Blech- oder Sohlbankanschluss" },
        classification: { en: "flashing and sill hypothesis", de: "Hypothese zu Blech- und Sohlbankanschluss" },
        supportingIndicators: {
            en: ["water traces align with sill or flashing detail", "connection geometry may allow moisture entry", "localized staining below or beside sill/flashing lines"],
            de: ["Wasserspuren passen zu Sohlbank- oder Blechdetail", "Anschlussgeometrie kann Feuchteeintrag begünstigen", "lokale Verfärbung unter oder neben Sohlbank- beziehungsweise Blechlinien"]
        },
        contradictingIndicators: {
            en: ["no signs near flashing or sill zones", "symptoms limited to glazing body without connection involvement"],
            de: ["keine Hinweise nahe Blech- oder Sohlbankbereichen", "Anzeichen auf Glaskörper ohne Anschlussbeteiligung begrenzt"]
        },
        requiredVerification: {
            en: ["Inspect sill and flashing continuity, laps, and terminations.", "Check whether observed water path originates at these details.", "Use specialist inspection where concealed flashing layers cannot be confirmed."],
            de: ["Sohlbank- und Blechkontinuität, Überdeckungen und Endpunkte prüfen.", "Prüfen, ob der beobachtete Wasserweg an diesen Details beginnt.", "Bei verdeckten Blechlagen fachliche Prüfung vorsehen."]
        },
        potentialConsequences: {
            en: ["repeated moisture ingress at opening perimeter", "local damage to internal finishes", "accelerated deterioration of connection components"],
            de: ["wiederholter Feuchteeintrag am Öffnungsrand", "lokale Schäden an Innenoberflächen", "beschleunigte Verschlechterung von Anschlussbauteilen"]
        },
        recommendedActions: {
            en: ["Document sill/flashing detail with moisture mapping.", "Correlate leakage timing with weather events.", "Prioritize targeted detail verification before interventions."],
            de: ["Sohlbank- und Blechdetail mit Feuchtekartierung dokumentieren.", "Zeitpunkt der Feuchtigkeit mit Witterungsereignissen abgleichen.", "Gezielte Detailprüfung vor Eingriffen priorisieren."]
        }
    },
    "air-leakage": {
        cause: { en: "air leakage", de: "Luftundichtigkeit" },
        label: { en: "air leakage", de: "Luftundichtigkeit" },
        classification: { en: "air-tightness hypothesis", de: "Hypothese zur Luftdichtheit" },
        supportingIndicators: {
            en: ["reported draught or air movement at opening interfaces", "air-tightness concerns linked to frame or sash closure", "occupant comfort complaints associated with leakage"],
            de: ["berichtete Zugluft oder Luftbewegung an Öffnungsanschlüssen", "Luftdichtheitsthema im Zusammenhang mit Rahmen- oder Flügelschluss", "Nutzungsbeschwerden zum Komfort im Zusammenhang mit Undichtigkeit"]
        },
        contradictingIndicators: {
            en: ["no indicator of air movement or draught", "symptoms only moisture-related without air leakage evidence"],
            de: ["kein Hinweis auf Luftbewegung oder Zugluft", "Anzeichen nur feuchtebezogen ohne Hinweis auf Luftundichtigkeit"]
        },
        requiredVerification: {
            en: ["Verify air leakage pathway with targeted inspection.", "Do not infer air leakage from condensation alone.", "Inspect gaskets, closure pressure, and joint continuity."],
            de: ["Luftweg mit gezielter Prüfung verifizieren.", "Luftundichtigkeit nicht allein aus Kondensation ableiten.", "Dichtungen, Anpressdruck und Fugenkontinuität prüfen."]
        },
        potentialConsequences: {
            en: ["reduced comfort near openings", "higher local energy demand", "possible moisture interaction under certain conditions"],
            de: ["verringerter Komfort nahe Öffnungen", "höherer lokaler Energiebedarf", "mögliche Wechselwirkung mit Feuchte unter bestimmten Bedingungen"]
        },
        recommendedActions: {
            en: ["Document leakage location and operating conditions.", "Review seal compression and closure alignment.", "Plan corrective measures only after path confirmation."],
            de: ["Lage der Undichtigkeit und Nutzungsbedingungen dokumentieren.", "Dichtungskompression und Schließausrichtung prüfen.", "Korrekturmaßnahmen erst nach Bestätigung des Luftwegs planen."]
        }
    },
    "water-penetration-through-window-connection": {
        cause: { en: "water penetration through window connection", de: "Feuchteeintrag über den Fensteranschluss" },
        label: { en: "water penetration through window connection", de: "Feuchteeintrag über den Fensteranschluss" },
        classification: { en: "weather-tightness hypothesis", de: "Hypothese zur Schlagregendichtheit" },
        supportingIndicators: {
            en: ["moisture pattern follows window connection zones", "rain-related ingress reports at opening interface", "staining and dampness at frame-reveal transition"],
            de: ["Feuchtemuster folgt den Fensteranschlusszonen", "Berichte über regengebundenen Eintrag am Öffnungsanschluss", "Verfärbung und Feuchte am Übergang zwischen Rahmen und Laibung"]
        },
        contradictingIndicators: {
            en: ["no rain-correlated ingress pattern", "symptoms are strictly interior condensation without connection ingress indicators"],
            de: ["kein mit Regen korrelierendes Eintrittsmuster", "Anzeichen sind reine Innenkondensation ohne Hinweise auf Anschlusseintrag"]
        },
        requiredVerification: {
            en: ["Correlate moisture pattern with weather exposure and connection details.", "Do not infer failed installation from water staining alone.", "Use specialist inspection where concealed layers are not visible."],
            de: ["Feuchtemuster mit Wetterexposition und Anschlussdetails abgleichen.", "Mangelhaften Einbau nicht allein aus Wasserflecken ableiten.", "Bei nicht sichtbaren verdeckten Schichten fachliche Prüfung vorsehen."]
        },
        potentialConsequences: {
            en: ["continued moisture ingress and finish damage", "recurring occupant complaints", "expanded repair scope if untreated"],
            de: ["fortgesetzter Feuchteeintrag und Oberflächenschäden", "wiederkehrende Nutzerbeschwerden", "erweiterter Reparaturumfang bei ausbleibender Bearbeitung"]
        },
        recommendedActions: {
            en: ["Document ingress points and moisture spread.", "Inspect connection detail transitions and seal interfaces.", "Prioritize targeted weather-tightness verification."],
            de: ["Eintrittspunkte und Feuchteausbreitung dokumentieren.", "Übergänge der Anschlussdetails und Dichtungsebenen prüfen.", "Gezielte Prüfung der Schlagregendichtheit priorisieren."]
        }
    },
    "thermal-bridge-at-window-installation": {
        cause: { en: "thermal bridge at window installation", de: "Wärmebrücke am Fenstereinbau" },
        label: { en: "thermal bridge at window installation", de: "Wärmebrücke am Fenstereinbau" },
        classification: { en: "thermal bridge hypothesis", de: "Hypothese zur Wärmebrücke" },
        supportingIndicators: {
            en: ["cold-zone pattern around installation interface", "surface cooling concentrated at opening details", "repeat localized condensation in thermal weak points"],
            de: ["Kältezonenmuster am Einbauanschluss", "Oberflächenabkühlung konzentriert an Öffnungsdetails", "wiederholte lokale Kondensation an thermischen Schwachstellen"]
        },
        contradictingIndicators: {
            en: ["no localized cold-edge pattern", "symptoms explained by unrelated glazing damage only"],
            de: ["kein lokales Kaltkantenmuster", "Anzeichen nur durch unabhängigen Verglasungsschaden erklärbar"]
        },
        requiredVerification: {
            en: ["Inspect installation geometry for thermal weak points.", "Do not infer thermal bridge from condensation alone.", "Use targeted thermal diagnostic review where needed."],
            de: ["Einbaugeometrie auf thermische Schwachstellen prüfen.", "Wärmebrücke nicht allein aus Kondensation ableiten.", "Bei Bedarf gezielte thermische Diagnostik vorsehen."]
        },
        potentialConsequences: {
            en: ["localized comfort issues", "higher condensation susceptibility at cold details", "repeat maintenance demand"],
            de: ["lokale Komfortthemen", "erhöhte Kondensationsneigung an kalten Details", "wiederkehrender Instandhaltungsbedarf"]
        },
        recommendedActions: {
            en: ["Map affected cold-edge zones.", "Review installation detail continuity and insulation alignment.", "Plan interventions after diagnostic confirmation."],
            de: ["Betroffene Kaltkantenbereiche kartieren.", "Kontinuität der Einbaudetails und Dämmstofflage prüfen.", "Eingriffe nach diagnostischer Bestätigung planen."]
        }
    },
    "distorted-frame-or-sash": {
        cause: { en: "distorted frame or sash", de: "verzogener Rahmen oder Flügel" },
        label: { en: "distorted frame or sash", de: "verzogener Rahmen oder Flügel" },
        classification: { en: "frame distortion hypothesis", de: "Hypothese zur Rahmenverformung" },
        supportingIndicators: {
            en: ["operation issues suggest frame or sash deformation", "misaligned sash or warped frame observed", "binding sash during operation", "visible misalignment in opening geometry", "uneven closure pressure around the sash"],
            de: ["Bedienungsprobleme deuten auf Rahmen- oder Flügelverformung hin", "fehlstehender Flügel oder verzogener Rahmen beobachtet", "klemmender Flügel bei Bedienung", "sichtbare Fehlstellung in der Öffnungsgeometrie", "ungleichmäßiger Anpressdruck am Flügel"]
        },
        contradictingIndicators: {
            en: ["frame geometry appears stable and aligned", "issue limited to isolated hardware fault"],
            de: ["Rahmengeometrie erscheint stabil und ausgerichtet", "Thema auf isolierten Beschlagfehler begrenzt"]
        },
        requiredVerification: {
            en: ["Check frame plumb, level, and sash alignment.", "Assess opening/closing behavior across full operation cycle.", "Confirm whether distortion is primary or secondary to hardware settings."],
            de: ["Lot, Waage und Flügelausrichtung des Rahmens prüfen.", "Öffnungs- und Schließverhalten über den gesamten Bedienzyklus beurteilen.", "Prüfen, ob Verformung primär ist oder aus Beschlageinstellungen folgt."]
        },
        potentialConsequences: {
            en: ["reduced sealing performance", "operability complaints", "accelerated wear of closure components"],
            de: ["verringerte Dichtungsleistung", "Beschwerden zur Bedienbarkeit", "beschleunigter Verschleiß von Schließkomponenten"]
        },
        recommendedActions: {
            en: ["Document alignment deviations and operation symptoms.", "Inspect surrounding structure for interface movement influences.", "Plan corrective adjustment after verification."],
            de: ["Ausrichtungsabweichungen und Bedienungsanzeichen dokumentieren.", "Umgebende Konstruktion auf Einflüsse aus Anschlussbewegungen prüfen.", "Korrektive Einstellung nach Verifikation planen."]
        }
    },
    "defective-hardware-or-adjustment": {
        cause: { en: "defective hardware or adjustment", de: "mangelhafter Beschlag oder mangelhafte Einstellung" },
        label: { en: "defective hardware or adjustment", de: "mangelhafter Beschlag oder mangelhafte Einstellung" },
        classification: { en: "hardware hypothesis", de: "Hypothese zum Beschlag" },
        supportingIndicators: {
            en: ["opening hardware shows malfunction or misadjustment", "closure mechanism does not seal correctly", "operational resistance or incomplete locking"],
            de: ["Beschläge zeigen Fehlfunktion oder Fehleinstellung", "Schließmechanismus dichtet nicht korrekt ab", "Bedienwiderstand oder unvollständige Verriegelung"]
        },
        contradictingIndicators: {
            en: ["hardware operates normally under inspection", "symptoms clearly linked to glazing-only defect"],
            de: ["Beschlag funktioniert bei Prüfung unauffällig", "Anzeichen klar nur mit Verglasungsthema verbunden"]
        },
        requiredVerification: {
            en: ["Inspect hinges, locks, handles, and adjustment points.", "Verify closure pressure and latch engagement consistency.", "Differentiate hardware settings from frame distortion effects."],
            de: ["Bänder, Schlösser, Griffe und Einstellpunkte prüfen.", "Anpressdruck und gleichmäßiges Einrasten der Verriegelung prüfen.", "Beschlageinstellung von Auswirkungen einer Rahmenverformung abgrenzen."]
        },
        potentialConsequences: {
            en: ["persistent operation and sealing issues", "higher wear of moving components", "possible security or weather-tightness concerns"],
            de: ["anhaltende Bedienungs- und Dichtungsthemen", "höherer Verschleiß beweglicher Komponenten", "mögliche Sicherheits- oder Schlagregendichtheitsthemen"]
        },
        recommendedActions: {
            en: ["Document failed operations and affected components.", "Perform targeted adjustment and functional recheck.", "Escalate to specialist hardware review if unresolved."],
            de: ["Fehlfunktionen und betroffene Komponenten dokumentieren.", "Gezielte Einstellung und Funktionskontrolle durchführen.", "Bei ausbleibender Klärung fachliche Beschlagprüfung veranlassen."]
        }
    },
    "failed-weather-seals": {
        cause: { en: "failed weather seals", de: "mangelhafte Anschlagdichtungen" },
        label: { en: "failed weather seals", de: "mangelhafte Anschlagdichtungen" },
        classification: { en: "weather seal hypothesis", de: "Hypothese zur Anschlagdichtung" },
        supportingIndicators: {
            en: ["gasket or weather strip deterioration visible", "seal compression appears insufficient at closure line", "weather exposure symptoms at sealing profile"],
            de: ["Verschlechterung von Dichtung oder Dichtprofil sichtbar", "Dichtungskompression an der Schließlinie erscheint unzureichend", "witterungsbezogene Anzeichen am Dichtprofil"]
        },
        contradictingIndicators: {
            en: ["weather seals appear intact and uniformly compressed", "symptoms isolated to glass body damage"],
            de: ["Anschlagdichtungen erscheinen intakt und gleichmäßig komprimiert", "Anzeichen auf Schaden am Glaskörper begrenzt"]
        },
        requiredVerification: {
            en: ["Inspect weather-seal continuity and elasticity around closure line.", "Verify contact pressure during locking cycle.", "Confirm whether leakage aligns with failed seal segments."],
            de: ["Kontinuität und Elastizität der Anschlagdichtung entlang der Schließlinie prüfen.", "Anpressdruck während des Verriegelungszyklus prüfen.", "Prüfen, ob Feuchtigkeit oder Luftweg mit betroffenen Dichtungsabschnitten übereinstimmt."]
        },
        potentialConsequences: {
            en: ["increased air and water leakage susceptibility", "comfort and durability complaints", "recurring local repair needs"],
            de: ["erhöhte Anfälligkeit für Luft- und Wassereintritt", "Komfort- und Dauerhaftigkeitsbeschwerden", "wiederkehrender lokaler Reparaturbedarf"]
        },
        recommendedActions: {
            en: ["Map failed seal segments and compression gaps.", "Review compatibility of replacement seal profiles.", "Reassess performance after targeted seal remediation."],
            de: ["Betroffene Dichtungsabschnitte und Kompressionslücken kartieren.", "Kompatibilität von Ersatzdichtprofilen prüfen.", "Leistung nach gezielter Dichtungsmaßnahme erneut beurteilen."]
        }
    },
    "glazing-damage": {
        cause: { en: "glazing damage", de: "Verglasungsschaden" },
        label: { en: "glazing damage", de: "Verglasungsschaden" },
        classification: { en: "glazing damage hypothesis", de: "Hypothese zum Verglasungsschaden" },
        supportingIndicators: {
            en: ["cracked glass or broken pane visible", "glass fracture at pane edge or corner", "visible damage to glazing surface or edge", "impact or stress-related glass distress indicators", "localized damage not inherently linked to frame failure"],
            de: ["gerissenes Glas oder gebrochene Scheibe sichtbar", "Glasriss an Scheibenrand oder Ecke", "sichtbarer Schaden an Glasfläche oder Glasrand", "Hinweise auf Stoß- oder spannungsbezogene Glasbeanspruchung", "lokaler Schaden nicht automatisch mit Rahmenversagen verbunden"]
        },
        contradictingIndicators: {
            en: ["no visible glazing damage", "symptoms are solely frame-operation related"],
            de: ["kein sichtbarer Verglasungsschaden", "Anzeichen ausschließlich auf Rahmenbedienung bezogen"]
        },
        requiredVerification: {
            en: ["Inspect extent and location of glazing damage.", "Do not infer frame failure from glazing damage alone.", "Assess safety and operational implications at the damaged pane."],
            de: ["Ausmaß und Lage des Verglasungsschadens prüfen.", "Rahmenversagen nicht allein aus Verglasungsschaden ableiten.", "Sicherheits- und Nutzungsrelevanz an der beschädigten Scheibe beurteilen."]
        },
        potentialConsequences: {
            en: ["safety and weather-tightness concerns", "progressive damage under further stress", "potential occupant complaints"],
            de: ["Sicherheits- und Schlagregendichtheitsthemen", "fortschreitender Schaden bei weiterer Beanspruchung", "mögliche Nutzerbeschwerden"]
        },
        recommendedActions: {
            en: ["Document crack/chip geometry and location.", "Secure immediate risk areas where necessary.", "Plan glazing intervention after condition verification."],
            de: ["Riss- oder Abplatzgeometrie und Lage dokumentieren.", "Unmittelbare Risikobereiche bei Bedarf sichern.", "Verglasungsmaßnahme nach Zustandsverifikation planen."]
        }
    },
    "condensation-on-glazing-or-frame": {
        cause: { en: "condensation on glazing or frame", de: "Kondensation an Verglasung oder Rahmen" },
        label: { en: "condensation on glazing or frame", de: "Kondensation an Verglasung oder Rahmen" },
        classification: { en: "condensation hypothesis", de: "Hypothese zur Kondensation" },
        supportingIndicators: {
            en: ["surface moisture pattern consistent with condensation behavior", "episodes linked to humidity and temperature differentials", "localized moisture without direct rain-ingress path"],
            de: ["Oberflächenfeuchtemuster passt zu Kondensationsverhalten", "Episoden stehen mit Feuchte- und Temperaturunterschieden in Verbindung", "lokale Feuchte ohne direkten Regen-Eintrittspfad"]
        },
        contradictingIndicators: {
            en: ["clear rain-driven ingress path at connection interfaces", "air leakage proven by direct leakage indicators independent of condensation"],
            de: ["klarer regengetriebener Eintrittspfad an Anschlussflächen", "Luftweg durch direkte, von Kondensation unabhängige Hinweise belegt"]
        },
        requiredVerification: {
            en: ["Correlate condensation timing with humidity and temperature conditions.", "Do not infer air leakage or thermal bridge from condensation alone.", "Differentiate interior condensation from external penetration mechanisms."],
            de: ["Zeitpunkt der Kondensation mit Feuchte- und Temperaturbedingungen abgleichen.", "Luftundichtigkeit oder Wärmebrücke nicht allein aus Kondensation ableiten.", "Innenkondensation von äußeren Eintrittsmechanismen abgrenzen."]
        },
        potentialConsequences: {
            en: ["recurring surface moisture and comfort complaints", "localized finish deterioration", "possible mould-prone conditions at persistent cold points"],
            de: ["wiederkehrende Oberflächenfeuchte und Komfortbeschwerden", "lokale Verschlechterung von Oberflächen", "mögliche schimmelanfällige Bedingungen an dauerhaft kalten Stellen"]
        },
        recommendedActions: {
            en: ["Document condensation distribution and recurrence timing.", "Review ventilation and usage patterns near openings.", "Use targeted diagnostics if mechanism remains unclear."],
            de: ["Verteilung und Wiederkehrzeitpunkte der Kondensation dokumentieren.", "Lüftungs- und Nutzungsmuster nahe Öffnungen prüfen.", "Bei unklarem Mechanismus gezielte Diagnostik einsetzen."]
        }
    },
    "age-related-deterioration": {
        cause: { en: "age-related deterioration", de: "altersbedingte Verschlechterung" },
        label: { en: "age-related deterioration", de: "altersbedingte Verschlechterung" },
        classification: { en: "aging hypothesis", de: "Hypothese zur Alterung" },
        supportingIndicators: {
            en: ["overall condition indicates long-term degradation", "multiple minor defects consistent with aging", "material wear without one isolated trigger"],
            de: ["Gesamtzustand weist auf langfristige Verschlechterung hin", "mehrere kleinere Mängel passen zu Alterung", "Materialverschleiß ohne einzelnen isolierten Auslöser"]
        },
        contradictingIndicators: {
            en: ["condition appears new with isolated recent damage only", "single event explains all observed symptoms"],
            de: ["Zustand erscheint neu mit nur isoliertem jüngeren Schaden", "ein einzelnes Ereignis erklärt alle beobachteten Anzeichen"]
        },
        requiredVerification: {
            en: ["Review age, maintenance, and replacement history of elements.", "Inspect whether deterioration is widespread or localized.", "Separate age-related wear from acute isolated defects."],
            de: ["Alter, Wartungs- und Austauschhistorie der Elemente prüfen.", "Prüfen, ob die Verschlechterung flächig oder lokal ist.", "Altersbedingten Verschleiß von akuten Einzelschäden trennen."]
        },
        potentialConsequences: {
            en: ["progressive decline in performance", "increasing maintenance frequency", "higher future intervention scope"],
            de: ["fortschreitender Leistungsrückgang", "zunehmende Wartungshäufigkeit", "höherer künftiger Eingriffsumfang"]
        },
        recommendedActions: {
            en: ["Document age-related wear indicators per element.", "Prioritize condition-based maintenance planning.", "Escalate targeted specialist checks for critical units."],
            de: ["Altersbezogene Verschleißhinweise je Element dokumentieren.", "Zustandsbasierte Instandhaltungsplanung priorisieren.", "Für kritische Einheiten gezielte fachliche Prüfungen veranlassen."]
        }
    },
    "insufficient-maintenance": {
        cause: { en: "insufficient maintenance", de: "unzureichende Instandhaltung" },
        label: { en: "insufficient maintenance", de: "unzureichende Instandhaltung" },
        classification: { en: "maintenance hypothesis", de: "Hypothese zur Instandhaltung" },
        supportingIndicators: {
            en: ["maintenance-sensitive components show avoidable deterioration", "operation/sealing issues consistent with missing periodic servicing", "multiple minor defects consistent with low upkeep"],
            de: ["wartungssensible Komponenten zeigen vermeidbare Verschlechterung", "Bedienungs- oder Dichtungsthemen passen zu fehlender regelmäßiger Wartung", "mehrere kleinere Mängel passen zu geringer Pflege"]
        },
        contradictingIndicators: {
            en: ["recent documented maintenance and stable condition", "acute defect pattern unrelated to maintenance intervals"],
            de: ["aktuell dokumentierte Wartung und stabiler Zustand", "akutes Mängelbild ohne Bezug zu Wartungsintervallen"]
        },
        requiredVerification: {
            en: ["Review maintenance logs and service history for affected elements.", "Inspect lubrication, adjustments, and seal-condition routines.", "Confirm whether defects persist after maintenance restoration."],
            de: ["Wartungsnachweise und Servicehistorie betroffener Elemente prüfen.", "Schmierung, Einstellungen und Routinen zum Dichtungszustand prüfen.", "Prüfen, ob Mängel nach Wiederherstellung der Wartung fortbestehen."]
        },
        potentialConsequences: {
            en: ["accelerated wear of components", "recurring operability and sealing complaints", "higher cumulative intervention costs"],
            de: ["beschleunigter Verschleiß von Komponenten", "wiederkehrende Beschwerden zu Bedienbarkeit und Dichtung", "höhere kumulative Eingriffskosten"]
        },
        recommendedActions: {
            en: ["Document missed maintenance indicators by component.", "Establish targeted maintenance recovery actions.", "Reassess condition after maintenance normalization."],
            de: ["Ausgebliebene Wartungshinweise je Komponente dokumentieren.", "Gezielte Maßnahmen zur Wiederaufnahme der Wartung festlegen.", "Zustand nach Normalisierung der Wartung erneut beurteilen."]
        }
    },
    "defective-exterior-door-seal": {
        cause: { en: "defective exterior door seal", de: "mangelhafte Außentürdichtung" },
        label: { en: "defective exterior door seal", de: "mangelhafte Außentürdichtung" },
        classification: { en: "exterior door seal hypothesis", de: "Hypothese zur Außentürdichtung" },
        supportingIndicators: {
            en: ["air or water path around exterior door seal line", "visible deterioration at threshold or door perimeter sealing", "closure mismatch with seal compression loss"],
            de: ["Luft- oder Wasserweg entlang der Dichtungslinie einer Außentür", "sichtbare Verschlechterung an Schwelle oder Türanschlussdichtung", "Schließversatz mit Verlust der Dichtungskompression"]
        },
        contradictingIndicators: {
            en: ["door seals appear continuous and effective", "issue isolated to window elements only"],
            de: ["Türdichtungen erscheinen durchgehend und wirksam", "Thema nur auf Fensterelemente begrenzt"]
        },
        requiredVerification: {
            en: ["Inspect door perimeter and threshold seal condition.", "Verify closure compression and alignment at latch side.", "Confirm whether leakage correlates with failed door seal segments."],
            de: ["Zustand von Türanschluss und Schwellendichtung prüfen.", "Schließkompression und Ausrichtung an der Schlossseite prüfen.", "Prüfen, ob Feuchtigkeit oder Zugluft mit betroffenen Türdichtungsabschnitten korreliert."]
        },
        potentialConsequences: {
            en: ["recurring draught or moisture ingress at door locations", "comfort and durability complaints", "ongoing localized repair demand"],
            de: ["wiederkehrende Zugluft oder Feuchteeintrag an Türstandorten", "Komfort- und Dauerhaftigkeitsbeschwerden", "fortlaufender lokaler Reparaturbedarf"]
        },
        recommendedActions: {
            en: ["Document seal profile deterioration at door perimeter.", "Review threshold and weather-strip condition under operation.", "Implement targeted seal remediation after verification."],
            de: ["Verschlechterung des Dichtprofils am Türumfang dokumentieren.", "Schwellen- und Dichtungszustand unter Bedienung prüfen.", "Gezielte Dichtungsmaßnahme nach Verifikation umsetzen."]
        }
    },
    "installation-workmanship-defect": {
        cause: { en: "installation workmanship defect", de: "Ausführungsmangel beim Einbau" },
        label: { en: "installation workmanship defect", de: "Ausführungsmangel beim Einbau" },
        classification: { en: "workmanship hypothesis", de: "Hypothese zur Ausführung" },
        supportingIndicators: {
            en: ["detail quality indicates potential installation error", "multiple interface anomalies consistent with poor workmanship", "assembly defects at opening transitions"],
            de: ["Detailqualität weist auf möglichen Einbaufehler hin", "mehrere Anschlussauffälligkeiten passen zu mangelhafter Ausführung", "Montageauffälligkeiten an Übergängen von Öffnungen"]
        },
        contradictingIndicators: {
            en: ["installation details appear consistent and well-executed", "single isolated symptom without workmanship pattern"],
            de: ["Einbaudetails erscheinen konsistent und sauber ausgeführt", "einzelnes isoliertes Anzeichen ohne Ausführungsmuster"]
        },
        requiredVerification: {
            en: ["Inspect installation detailing quality at representative locations.", "Treat workmanship issues as hypotheses pending targeted verification.", "Use specialist inspection where concealed installation layers cannot be checked visually."],
            de: ["Qualität der Einbaudetails an repräsentativen Stellen prüfen.", "Ausführungsthemen bis zur gezielten Verifikation als Hypothesen behandeln.", "Bei verdeckten Einbauschichten fachliche Prüfung vorsehen."]
        },
        potentialConsequences: {
            en: ["persistent recurring defects at opening interfaces", "higher repair complexity over time", "possible broader quality concerns"],
            de: ["dauerhaft wiederkehrende Mängel an Öffnungsanschlüssen", "mit der Zeit höhere Reparaturkomplexität", "mögliche breitere Qualitätsthemen"]
        },
        recommendedActions: {
            en: ["Document workmanship-related anomalies with detail references.", "Review installation records and as-built details where available.", "Prioritize focused specialist verification before remedial scope decisions."],
            de: ["Ausführungsbezogene Auffälligkeiten mit Detailbezug dokumentieren.", "Einbaudokumentation und Bestandsdetails prüfen, soweit verfügbar.", "Gezielte fachliche Verifikation vor Entscheidungen zum Maßnahmenumfang priorisieren."]
        }
    }
});

export default windowsDoorsBilingualResources;

function freezeResources(resources) {
    Object.values(resources).forEach((resource) => {
        Object.values(resource).forEach((field) => {
            Object.values(field).forEach((value) => {
                if (Array.isArray(value)) {
                    Object.freeze(value);
                }
            });
            Object.freeze(field);
        });
        Object.freeze(resource);
    });

    return Object.freeze(resources);
}