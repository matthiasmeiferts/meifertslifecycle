# Expert Intelligence Domain Coverage Master Audit

Foundation 1.1-B audit date: 2026-07-19

## 1. Executive Summary

This audit establishes the authoritative domain coverage master plan for the MEIFERTS Expert Intelligence platform. It separates core architecture readiness from domain coverage, bilingual readiness, and test coverage.

Status summary:

- Core architecture status: APPROVED
- Domain coverage status: INCOMPLETE
- Bilingual readiness status: NOT IMPLEMENTED
- Test coverage status: PARTIAL

The current Expert Intelligence core architecture is sound: providers are deterministic, routed through stable domain identifiers, dispatched by `ExpertReasoningEngine`, and mapped through `KnowledgeReasoningMapper` where applicable. The platform currently has 14 knowledge providers.

Domain coverage is not yet complete against a professional Technical Due Diligence domain structure. Existing providers cover important envelope, MEP, fire/life-safety, vertical transportation, moisture, crack, corrosion, and waterproofing domains, but several mandatory professional domains remain missing or only partially represented.

Bilingual readiness is a separate, mandatory Foundation dimension. Current internal identifiers are stable English IDs, but German input recognition, selectable German/English output rendering, and bilingual Expert Intelligence tests are not implemented across the domain set.

## 2. Current Architecture Status

The core architecture remains approved for continued domain expansion.

Verified architecture facts:

- `ExpertReasoningEngine.analyze(input)` accepts the current public reasoning input and dispatches routed domains.
- `KnowledgeDomainRouter.resolve(input)` returns stable internal domain identifiers in explicit precedence order.
- `KnowledgeReasoningMapper.map({ knowledge, input })` remains the shared mapping boundary for most provider-backed domains.
- Providers expose `static getKnowledge(input = {})`.
- The engine returns the first non-null mapped provider result and does not aggregate multiple providers.
- Current domain identifiers are stable English-based internal identifiers.
- Current provider output is English hard-coded.
- Current Expert Intelligence routing/provider terminology is English-first.

The architecture is not failed by missing bilingual support. Bilingual readiness is classified separately.

## 3. Current Provider Inventory

| Filename | Exported class | Provider domain identifier | Router identifier | Engine dispatch | Provider test | Integration test | Current English terminology | Current German terminology | Current output language | Overlap ownership |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `portal/core/knowledge/BalconiesTerracesKnowledgeProvider.js` | `BalconiesTerracesKnowledgeProvider` | `balconies-terraces` | `balconies-terraces` | Yes | `tests/balconies-terraces-knowledge-provider-test.js` | `tests/balconies-terraces-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns balcony/terrace surfacing, waterproofing, outlets, edge/upstand conditions |
| `portal/core/knowledge/BasementWaterproofingKnowledgeProvider.js` | `BasementWaterproofingKnowledgeProvider` | `basement-waterproofing` | `basement-waterproofing` | Yes | `tests/basement-waterproofing-knowledge-provider-test.js` | `tests/basement-waterproofing-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns below-grade waterproofing, wall-floor junctions, retaining wall moisture context |
| `portal/core/knowledge/ConcreteCorrosionKnowledgeProvider.js` | `ConcreteCorrosionKnowledgeProvider` | `concrete-corrosion` | `concrete-corrosion` | Yes | `tests/concrete-corrosion-knowledge-provider-test.js` | `tests/concrete-corrosion-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns reinforced concrete spalling, rust staining, exposed reinforcement, cover/chloride/carbonation indicators |
| `portal/core/knowledge/CrackKnowledgeProvider.js` | `CrackKnowledgeProvider` | `cracks` | `crack` | Yes | `tests/crack-knowledge-provider-test.js` | `tests/crack-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns crack morphology, settlement/movement hypotheses, and crack-specific structural suspicion |
| `portal/core/knowledge/DrainageRainwaterKnowledgeProvider.js` | `DrainageRainwaterKnowledgeProvider` | `drainage-rainwater` | `drainage-rainwater` | Yes | `tests/drainage-rainwater-knowledge-provider-test.js` | `tests/drainage-rainwater-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns rainwater discharge, gutters, downpipes, outlets, gullies, grading, backwater indicators |
| `portal/core/knowledge/ElectricalSystemsKnowledgeProvider.js` | `ElectricalSystemsKnowledgeProvider` | `electrical-systems` | `electrical-systems` | Yes | `tests/electrical-systems-knowledge-provider-test.js` | `tests/electrical-systems-reasoning-integration-test.js` | Yes | Incidental/non-controlled only | English hard-coded | Owns visible electrical distribution, sockets, switches, cables, grounding/bonding indicators |
| `portal/core/knowledge/FacadeWallSystemsKnowledgeProvider.js` | `FacadeWallSystemsKnowledgeProvider` | `facade-wall-systems` | `facade-wall-systems` | Yes | `tests/facade-wall-systems-knowledge-provider-test.js` | `tests/facade-wall-systems-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns facade/render/cladding/joint visible condition except structural crack dominance and concrete corrosion dominance |
| `portal/core/knowledge/FireProtectionSystemsKnowledgeProvider.js` | `FireProtectionSystemsKnowledgeProvider` | `fire-protection-systems` | `fire-protection-systems` | Yes | `tests/fire-protection-systems-knowledge-provider-test.js` | `tests/fire-protection-systems-reasoning-integration-test.js` | Yes | Incidental/non-controlled only | English hard-coded | Owns fire doors, sprinklers, fire detection, suppression, escape route, compartmentation, dampers as fire-safety components |
| `portal/core/knowledge/HvacSystemsKnowledgeProvider.js` | `HvacSystemsKnowledgeProvider` | `hvac-systems` | `hvac-systems` | Yes | `tests/hvac-systems-knowledge-provider-test.js` | `tests/hvac-systems-reasoning-integration-test.js` | Yes | Incidental/non-controlled only | English hard-coded | Owns heating, cooling, ventilation, air-conditioning, radiator, duct, filter, condensate, plant visible condition |
| `portal/core/knowledge/MoistureKnowledgeProvider.js` | `MoistureKnowledgeProvider` | `moisture` | `moisture` | Yes | `tests/moisture-knowledge-provider-test.js` | `tests/moisture-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns moisture pattern hypotheses where a component-specific provider does not take precedence |
| `portal/core/knowledge/RoofEnvelopeKnowledgeProvider.js` | `RoofEnvelopeKnowledgeProvider` | `roof-envelope` | `roof-envelope` | Yes | `tests/roof-envelope-knowledge-provider-test.js` | `tests/roof-envelope-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns roof coverings, flat roof, penetrations, flashing, ponding, roof membrane, roof-envelope leakage context |
| `portal/core/knowledge/SanitarySystemsKnowledgeProvider.js` | `SanitarySystemsKnowledgeProvider` | `sanitary-systems` | `sanitary-systems` | Yes | `tests/sanitary-systems-knowledge-provider-test.js` | `tests/sanitary-systems-reasoning-integration-test.js` | Yes | Incidental/non-controlled only | English hard-coded | Owns sanitary fixtures, potable water, wastewater, traps, valves, internal sanitary leakage |
| `portal/core/knowledge/VerticalTransportationSystemsKnowledgeProvider.js` | `VerticalTransportationSystemsKnowledgeProvider` | `vertical-transportation-systems` | `vertical-transportation-systems` | Yes | `tests/vertical-transportation-systems-knowledge-provider-test.js` | `tests/vertical-transportation-systems-reasoning-integration-test.js` | Yes | Incidental/non-controlled only | English hard-coded | Owns lifts, elevators, escalators, moving walkways, lift doors, lift controls, pits, shafts, machinery |
| `portal/core/knowledge/WindowsDoorsKnowledgeProvider.js` | `WindowsDoorsKnowledgeProvider` | `windows-doors` | `windows-doors` | Yes | `tests/windows-doors-knowledge-provider-test.js` | `tests/windows-doors-reasoning-integration-test.js` | Yes | No controlled set | English hard-coded | Owns windows, external doors, glazing, frames, seals, thresholds except fire/lift-specific doors |

Inventory notes:

- The provider inventory contains 14 actual provider files.
- `CrackKnowledgeProvider` returns provider domain `cracks`, while router and engine use `crack`. This is existing technical debt, not an immediate blocker.
- The question catalog contains 680 records and 601 unique component values. It is German-led and includes many technical categories not yet represented by Expert Intelligence providers.

## 4. Domain Master Matrix

Status values: COMPLETE, PARTIAL, MISSING, FUTURE, OUT OF SCOPE.

Bilingual values: COMPLETE, PARTIAL, NOT IMPLEMENTED, LANGUAGE-NEUTRAL INTERNAL ONLY.

| Domain ID | English domain name | German domain name | Technical group | Foundation mandatory | Current status | Current provider | Router support | Engine support | Provider tests | Integration tests | English input recognition | German input recognition | English output readiness | German output readiness | Bilingual test coverage | Overlap domains | Recommended ownership | Priority | Estimated complexity | Recommended release | Recommendation | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `site-external-works` | Site and external works | Außenbereich und Grundstück | A | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | drainage-rainwater, electrical-systems, windows-doors | Standalone domain with subdomains | CRITICAL | High | 1.1-C | Add provider | Question catalog has `site_external`, `external_facilities`, `external_surfaces`, access/enclosure, vegetation, boundaries, external stairs, driveways, waste/bicycle storage. |
| `site-drainage` | Site drainage and surface water | Grundstücksentwässerung | A | Yes | PARTIAL | `DrainageRainwaterKnowledgeProvider` | Partial | Partial | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | drainage-rainwater, basement-waterproofing, roof-envelope | Keep in `drainage-rainwater` unless external works grows large | HIGH | Medium | 1.1-C | Extend current drainage ownership | Catalog has `site_drainage`, `site_gradient`, yard drains, infiltration trench, rainwater connection. |
| `retaining-boundary-external-structures` | Retaining, boundary, fence, external stair and ramp structures | Stützbauwerke, Grenzen, Einfriedung, Außentreppen und Rampen | A/B | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | site-external-works, crack, basement-waterproofing | Subdomain of `site-external-works`; structural escalation to structural systems | HIGH | Medium | 1.1-C | Include in site/external works | Avoid tiny providers for fence/gate/stairs unless evidence volume requires split. |
| `structural-systems` | Structural systems | Tragwerk | B | Yes | PARTIAL | None | Partial through crack/concrete | Partial | Partial | Partial | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | crack, concrete-corrosion, basement-waterproofing | Standalone umbrella provider | CRITICAL | High | 1.1-C | Add provider | Foundations, load-bearing walls, columns, beams, slabs, steel, timber, masonry, connections are not coherently owned. |
| `concrete-corrosion` | Concrete corrosion | Betonkorrosion | B | Yes | COMPLETE | `ConcreteCorrosionKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | structural-systems, facade-wall-systems, balconies-terraces, crack | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Keep precedence before crack where reinforcement corrosion evidence exists. |
| `crack` | Cracks and movement indicators | Risse und Bewegungsindikatoren | B | Yes | COMPLETE | `CrackKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | structural-systems, facade-wall-systems, roof-envelope, concrete-corrosion | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Provider domain ID `cracks` should eventually align with router ID `crack` only through a controlled compatibility plan. |
| `basement-waterproofing` | Basement waterproofing | Kellerabdichtung | B/C | Yes | COMPLETE | `BasementWaterproofingKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | moisture, drainage-rainwater, structural-systems | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Below-grade leakage should remain separate from generic moisture. |
| `roof-envelope` | Roofing systems and roof envelope | Dach und Dachhülle | C | Yes | COMPLETE | `RoofEnvelopeKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | drainage-rainwater, moisture, photovoltaic-renewables | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Roof drainage interfaces require explicit overlap with drainage/rainwater. |
| `facade-wall-systems` | Facade and external wall systems | Fassade und Außenwände | C | Yes | COMPLETE | `FacadeWallSystemsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | crack, concrete-corrosion, moisture, thermal-performance | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Covers render, cladding, coating, facade joints; structural crack escalation remains separate. |
| `windows-doors` | Windows and external doors | Fenster und Außentüren | C | Yes | COMPLETE | `WindowsDoorsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | facade-wall-systems, fire-protection-systems, vertical-transportation-systems, moisture | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Fire doors and lift doors belong to specialist systems where specialist context exists. |
| `balconies-terraces` | Balconies and terraces | Balkone und Terrassen | C | Yes | COMPLETE | `BalconiesTerracesKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | drainage-rainwater, roof-envelope, concrete-corrosion, moisture | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Owns balcony/terrace waterproofing, surface, outlet, upstand and edge conditions. |
| `thermal-performance` | Thermal insulation, airtightness and thermal bridges | Wärmeschutz, Luftdichtheit und Wärmebrücken | C/H | Yes | PARTIAL | None | Partial through moisture/envelope | Partial fallback only | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | moisture, facade-wall-systems, roof-envelope, windows-doors, energy | Standalone or subdomain depending scope | HIGH | High | 1.1-C | Add provider or umbrella energy domain | Catalog has `thermal_bridges`, `airtightness`, `u_values_component_quality`, thermography and surface temperature. |
| `interior-construction` | Interior construction and finishes | Innenausbau und Oberflächen | D | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | moisture, crack, sanitary-systems | Standalone domain | CRITICAL | High | 1.1-C | Add provider | Internal walls, partitions, ceilings, suspended ceilings, floors, screeds, finishes, stairs, balustrades, joinery are mostly absent. |
| `wet-rooms-sanitary-rooms` | Wet rooms and sanitary rooms | Nassräume und Sanitärräume | D/E | Yes | PARTIAL | `SanitarySystemsKnowledgeProvider` | Partial | Partial | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | sanitary-systems, moisture, interior-construction | Subdomain split between sanitary and interior | HIGH | Medium | 1.1-C | Clarify ownership | Wet room finishes and room fabric are not fully covered by sanitary systems alone. |
| `hvac-systems` | HVAC systems | Heizung, Lüftung, Klima | E | Yes | COMPLETE | `HvacSystemsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | moisture, sanitary-systems, gas-installations, parking-structures-special-systems | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Current scope covers visible HVAC system conditions, not full energy/gas/automation scope. |
| `sanitary-systems` | Sanitary, potable water and wastewater systems | Sanitär, Trinkwasser und Abwasser | E | Yes | COMPLETE | `SanitarySystemsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | moisture, drainage-rainwater, wet-rooms-sanitary-rooms | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Internal sanitary leakage precedes generic moisture. |
| `drainage-rainwater` | Drainage and rainwater systems | Entwässerung und Regenwasser | E/A/C | Yes | COMPLETE | `DrainageRainwaterKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | roof-envelope, balconies-terraces, basement-waterproofing, site-external-works | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Owns drainage components; site-works may own non-component external surface condition. |
| `electrical-systems` | Electrical systems and power distribution | Elektroinstallation und Stromverteilung | E | Yes | COMPLETE | `ElectricalSystemsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | lighting-emergency-power, renewable-energy-systems, vertical-transportation-systems, fire-protection-systems | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Current scope covers visible electrical defects but not all specialist electrical subdomains. |
| `lighting-emergency-lighting` | Lighting and emergency lighting | Beleuchtung und Sicherheitsbeleuchtung | E/F | Yes | PARTIAL | None | Partial through electrical/fire | Partial fallback only | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | electrical-systems, fire-protection-systems, site-external-works | Subdomain; emergency lighting may sit under fire protection | HIGH | Medium | 1.1-D | Add subdomain or extend fire/electrical | Catalog contains `lighting`, external lighting, and emergency lighting. |
| `emergency-power-ups-generators` | Emergency power, UPS and generators | Notstrom, USV und Generatoren | E | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | electrical-systems, fire-protection-systems | Subdomain of electrical unless scale requires standalone | HIGH | Medium | 1.1-D | Add to electrical specialist scope | Not currently represented by a provider. |
| `lightning-protection-earthing` | Lightning protection, earthing and bonding | Blitzschutz, Erdung und Potentialausgleich | E | Yes | PARTIAL | `ElectricalSystemsKnowledgeProvider` | Partial | Partial | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | electrical-systems, roof-envelope | Subdomain of electrical | HIGH | Medium | 1.1-D | Extend electrical or split if needed | Catalog has lightning protection and equipotential bonding; current electrical tests include grounding/bonding but not full lightning scope. |
| `gas-installations` | Gas installations | Gasanlagen | E | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | hvac-systems, fire-protection-systems, sanitary-systems | Standalone specialist domain or HVAC subdomain | HIGH | High | 1.1-D | Add provider | Gas boiler issues overlap HVAC, but gas pipe/installation safety needs explicit ownership. |
| `building-automation-bms-metering` | Building automation, BMS, metering and monitoring | Gebäudeautomation, GLT, Messung und Monitoring | E | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | hvac-systems, electrical-systems, energy | Standalone cross-MEP domain | MEDIUM | High | 1.1-D | Add later in MEP wave | Current catalog has controls/thermostats and metering, but no Expert Intelligence domain. |
| `renewable-energy-systems` | Renewable energy systems, PV, battery storage, solar thermal and heat pumps | Erneuerbare Energien, PV, Speicher, Solarthermie und Wärmepumpen | E | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | electrical-systems, roof-envelope, fire-protection-systems, hvac-systems | Standalone domain with subdomain ownership | HIGH | High | 1.1-D | Add provider | Catalog has PV, storage, wallbox, PV roof penetrations, PV/battery fire safety, heat pumps. |
| `fire-protection-systems` | Fire protection systems | Brandschutzsysteme | F | Yes | COMPLETE | `FireProtectionSystemsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | windows-doors, hvac-systems, electrical-systems, sanitary-systems | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Owns fire/smoke doors, sprinklers, detection, escape routes, dampers, compartmentation. |
| `vertical-transportation-systems` | Vertical transportation systems | Aufzugs- und Förderanlagen | F | Yes | COMPLETE | `VerticalTransportationSystemsKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | windows-doors, electrical-systems, sanitary-systems, accessibility-systems | Existing standalone domain | HIGH | Medium | Existing | Keep separate | Owns lift doors/controls/hydraulic leakage where lift context exists. |
| `security-telecom-data-systems` | Security, telecommunications and data systems | Sicherheit, Telekommunikation und Datentechnik | F | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | electrical-systems, site-external-works | Standalone specialist domain | HIGH | High | 1.1-D | Add provider | Catalog has burglary protection and information/communication; CCTV/access control/intercom/data are not covered. |
| `accessibility-systems` | Accessibility systems | Barrierefreiheit und Zugänglichkeitssysteme | F/D | Yes | PARTIAL | `VerticalTransportationSystemsKnowledgeProvider` | Partial | Partial | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | vertical-transportation-systems, interior-construction, site-external-works | Cross-domain evidence type plus vertical subdomain | MEDIUM | Medium | 1.1-D | Clarify as cross-domain | Platform/wheelchair/stair lifts are covered; paths, ramps, thresholds, door widths are not. |
| `parking-structures-special-systems` | Parking structures, car park ventilation and loading areas | Parkbauten, Garagenlüftung und Ladebereiche | G | Conditional | FUTURE | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | site-external-works, hvac-systems, fire-protection-systems, structural-systems | Future/special-use domain | MEDIUM | High | Future | Keep future unless product scope requires | Catalog includes parking/garage components; large car parks may need separate treatment. |
| `commercial-kitchens-grease-coldrooms` | Commercial kitchens, grease separators and cold rooms | Gewerbeküchen, Fettabscheider und Kühlräume | G | Conditional | FUTURE | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | sanitary-systems, hvac-systems, fire-protection-systems, electrical-systems | Future/special-use domain | LOW | High | Future | Future scope | Not a mandatory baseline for general building TDD unless asset type requires it. |
| `pools-spas-water-treatment` | Pools, spas and water treatment | Pools, Spa und Wasseraufbereitung | G | Conditional | FUTURE | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | sanitary-systems, electrical-systems, moisture | Future/special-use domain | LOW | High | Future | Future scope | Relevant for hospitality/residential amenities. |
| `laboratory-medical-industrial-systems` | Laboratory, medical and industrial systems | Labor-, Medizin- und Industrieanlagen | G | Conditional | FUTURE | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | hvac-systems, electrical-systems, sanitary-systems, fire-protection-systems | Future/special-use domain | LOW | Very high | Future | Future scope | Requires specialist assumptions beyond current baseline TDD platform. |
| `moisture` | Moisture and water ingress patterns | Feuchte und Wassereintritt | H/C/D | Yes | COMPLETE | `MoistureKnowledgeProvider` | Yes | Yes | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | roof-envelope, basement-waterproofing, sanitary-systems, drainage-rainwater, balconies-terraces | Existing cross-domain evidence domain | HIGH | Medium | Existing | Keep as cross-domain fallback | Moisture should not override component-specific evidence domains. |
| `hazardous-materials` | Hazardous materials, asbestos, lead and PCB indicators | Schadstoffe, Asbest, Blei und PCB | H | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | interior-construction, roof-envelope, facade-wall-systems, environmental-material-risks | Standalone domain | CRITICAL | High | 1.1-C | Add provider | Catalog has `Altlasten / Schadstoffe`, asbestos indicators, contaminated land references. |
| `mould-biological-growth` | Mould and biological growth | Schimmel und biologischer Bewuchs | H | Yes | PARTIAL | `MoistureKnowledgeProvider` | Partial | Partial | Yes | Yes | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | moisture, hvac-systems, thermal-performance, interior-construction | Subdomain of moisture unless expanded | HIGH | Medium | 1.1-C | Extend moisture or add subdomain | Current moisture covers some mould logic, but catalogue distinguishes mould/ventilation/indoor climate. |
| `timber-decay-pest-damage` | Timber decay and pest damage | Holzschäden und Schädlingsbefall | H/B/D | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | structural-systems, roof-envelope, interior-construction | Standalone or structural subdomain | HIGH | Medium | 1.1-D | Add provider/subdomain | Timber structure and pest damage are not currently represented. |
| `contamination-radon-indoor-environment` | Contamination, radon and indoor environmental observations | Kontamination, Radon und Innenraumumwelt | H | Yes | MISSING | None | No | No | No | No | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | hazardous-materials, moisture, hvac-systems | Environmental/material risk domain or subdomain | MEDIUM | High | 1.1-D | Add after hazardous materials | Catalog has indoor climate, odour, contaminated land, pollutants; radon is not currently evident in provider logic. |
| `condominium-governance-documents` | Condominium governance and legal/document records | WEG-Verwaltung, Recht und Unterlagen | Out of technical scope | No | OUT OF SCOPE | None | No | No | No | No | LANGUAGE-NEUTRAL INTERNAL ONLY | LANGUAGE-NEUTRAL INTERNAL ONLY | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | report/governance workflows | Keep outside Expert Intelligence technical domains | LOW | Medium | N/A | Out of scope for technical provider layer | Catalog includes WEG/land register/budget/insurance topics; these belong to governance/report workflows, not physical defect reasoning. |

## 5. Missing Mandatory Domains

Mandatory domains currently classified as `MISSING` in the master matrix:

- `site-external-works`
- `retaining-boundary-external-structures`
- `interior-construction`
- `emergency-power-ups-generators`
- `gas-installations`
- `building-automation-bms-metering`
- `renewable-energy-systems`
- `security-telecom-data-systems`
- `hazardous-materials`
- `timber-decay-pest-damage`
- `contamination-radon-indoor-environment`

The question catalog confirms these are not speculative gaps. It contains German-led sections and components for exterior works, boundaries, vegetation, interior walls/ceilings/floors, roof structure, renewable energy, PV/battery/fire safety, burglary protection, information/communication, pollutants, asbestos, indoor climate, timber structure, pest-related risk and contamination indicators.

Additional high-priority partial mandatory domains are listed in Section 6.

## 6. Partial Domains

Partial domains are domains where some evidence is handled by current providers, but the professional domain is broader than the implemented provider scope.

- `site-drainage`: partly covered by `DrainageRainwaterKnowledgeProvider`, but general site works and external surface condition are not covered.
- `structural-systems`: crack and concrete corrosion exist, but general foundations, load-bearing walls, columns, beams, slabs, steel, timber, masonry, and connections do not have a coherent provider.
- `thermal-performance`: moisture/envelope providers touch thermal bridge symptoms, but no thermal/energy provider owns insulation, airtightness, U-values, or thermography.
- `wet-rooms-sanitary-rooms`: sanitary components are covered, but wet-room finishes, room fabric, sealants, and interior construction ownership are incomplete.
- `lighting-emergency-lighting`: electrical/fire providers may overlap, but lighting and emergency lighting are not explicitly modeled.
- `lightning-protection-earthing`: electrical covers some grounding/bonding, but lightning protection is not fully represented.
- `accessibility-systems`: lift/platform systems are partly covered through vertical transportation, but ramps, thresholds, path accessibility, clear widths, and usability are not.
- `mould-biological-growth`: moisture covers some mould-related patterns, but the catalog treats mould, ventilation, indoor climate, and biological growth as a richer domain.

## 7. Domain Ownership Rules

1. Roof leakage versus moisture: `roof-envelope` owns roof component leakage when roof covering, membrane, flashing, penetration, skylight, roof terrace, roof window, or roof drainage interface evidence exists. `moisture` owns generic interior dampness where no component-specific source is identified.
2. Roof drains versus drainage: `drainage-rainwater` owns gutters, downpipes, roof outlets, scuppers, emergency overflows, drainage channels, and discharge components. `roof-envelope` owns roof membrane/covering consequences and roof construction interfaces.
3. Facade cracks versus structural cracks: `facade-wall-systems` owns render/cladding/coating/joint surface conditions. `crack` owns crack morphology and movement/settlement indicators. `structural-systems` should own future load-path or structural member distress.
4. Balcony drainage versus general drainage: `balconies-terraces` owns balcony/terrace outlets when tied to balcony waterproofing, surface, upstand, or occupied-space leakage. `drainage-rainwater` owns general rainwater discharge and drainage components.
5. Basement leakage versus moisture: `basement-waterproofing` owns below-grade waterproofing, wall-floor junctions, hydrostatic pressure, earth-facing wall, perimeter drainage, and basement-specific leakage. `moisture` is fallback for non-specific moisture symptoms.
6. Sanitary leakage versus moisture: `sanitary-systems` owns leakage tied to fixtures, traps, valves, pipes, potable water, wastewater, or sanitary connections. `moisture` owns generic moisture without sanitary component evidence.
7. Sprinkler leakage versus sanitary: `fire-protection-systems` owns sprinkler heads, sprinkler pipe, suppression equipment, and fire protection enclosures. `sanitary-systems` owns domestic water and wastewater components.
8. Fire doors versus doors: `fire-protection-systems` owns fire/smoke doors, closers, seals, wedging, and compartmentation context. `windows-doors` owns ordinary external windows and doors.
9. Fire dampers versus HVAC: `fire-protection-systems` owns fire/smoke damper fire safety context. `hvac-systems` owns ventilation duct/filter/fan/airflow and non-fire damper conditions.
10. Smoke detectors versus electrical: `fire-protection-systems` owns smoke/heat detectors, alarm panels, manual call points, and detection/alarm components. `electrical-systems` owns general electrical wiring and distribution.
11. Lift doors versus doors: `vertical-transportation-systems` owns lift/elevator landing and car doors. `windows-doors` owns ordinary building doors.
12. Lift controls versus electrical: `vertical-transportation-systems` owns lift call buttons, indicators, communication panels, control panels, and machinery controls where lift context exists. `electrical-systems` owns general switches, sockets, distribution, and electrical panels.
13. Lift hydraulic leakage versus sanitary: `vertical-transportation-systems` owns hydraulic oil or lift pit/shaft/machinery leakage. `sanitary-systems` owns water/wastewater leakage.
14. Thermal bridges versus moisture: `thermal-performance` should own thermal bridge, U-value, insulation, airtightness, thermography, and surface temperature interpretation. `moisture` owns observed moisture/mould symptoms.
15. External drainage versus site works: `drainage-rainwater` owns drainage components and water conveyance. `site-external-works` owns external surfaces, grading, paths, driveways, retaining/boundary elements, and landscaping impacts.
16. Parking ventilation versus HVAC: `hvac-systems` owns mechanical ventilation components. `parking-structures-special-systems` should own car-park-specific ventilation context, smoke extraction, and parking-use risks when that future domain is implemented.
17. Photovoltaic electrical defects versus electrical systems: `renewable-energy-systems` should own PV modules, inverters, roof penetrations, battery storage, wallboxes, and renewable-system fire/access context. `electrical-systems` owns general electrical distribution defects.
18. Battery systems versus electrical systems: `renewable-energy-systems` owns battery storage location, fire load separation, emergency shutdown, and PV/battery system context. `electrical-systems` owns non-renewable electrical infrastructure.
19. Gas boiler issues versus HVAC or gas installations: `hvac-systems` owns heat generation operation/visible heating plant condition. `gas-installations` should own gas piping, gas appliance installation indicators, combustion air/flue/gas safety context, and gas-specific visible defects.

## 8. Overlap Matrix

| Overlap scenario | Primary owner | Secondary owner | Rule |
| --- | --- | --- | --- |
| Roof leakage with interior dampness | `roof-envelope` | `moisture` | Roof component evidence takes precedence. |
| Blocked roof outlet or downpipe | `drainage-rainwater` | `roof-envelope` | Drainage component owns blockage/discharge; roof owns membrane/interface condition. |
| Facade render crack | `facade-wall-systems` | `crack` | Facade surface condition stays with facade unless crack morphology/movement dominates. |
| Structural diagonal/widening crack | `crack` | `structural-systems` future | Crack owns current implementation; future structural provider should own load-path distress. |
| Balcony outlet blockage | `balconies-terraces` | `drainage-rainwater` | Balcony context owns if tied to terrace/balcony surface/waterproofing. |
| Basement wall dampness | `basement-waterproofing` | `moisture` | Below-grade context takes precedence. |
| Wash basin trap leakage | `sanitary-systems` | `moisture` | Sanitary component evidence takes precedence. |
| Sprinkler pipe leakage | `fire-protection-systems` | `sanitary-systems` | Fire suppression component evidence takes precedence. |
| Fire door damage | `fire-protection-systems` | `windows-doors` | Fire/smoke rating context takes precedence. |
| Fire damper damage | `fire-protection-systems` | `hvac-systems` | Fire/smoke control context takes precedence. |
| Smoke detector damage | `fire-protection-systems` | `electrical-systems` | Detection/alarm component context takes precedence. |
| Lift landing door damage | `vertical-transportation-systems` | `windows-doors` | Lift/elevator context takes precedence. |
| Lift call button/control damage | `vertical-transportation-systems` | `electrical-systems` | Lift control context takes precedence. |
| Lift pit hydraulic leakage | `vertical-transportation-systems` | `sanitary-systems`, `moisture` | Lift machinery/pit context takes precedence. |
| Thermal bridge with mould | `thermal-performance` future | `moisture` | Until thermal provider exists, moisture owns symptom; future thermal provider should own cause pattern. |
| External grading directing water to building | `drainage-rainwater` | `site-external-works` future | Drainage owns water-flow evidence; site works owns paving/grading condition. |
| Car park ventilation damage | `parking-structures-special-systems` future | `hvac-systems` | Parking-specific life-safety/garage context should own when implemented. |
| PV roof penetration leakage | `renewable-energy-systems` future | `roof-envelope` | Renewable system owns PV component; roof owns envelope interface if no PV-specific provider exists. |
| Battery storage fire-load issue | `renewable-energy-systems` future | `electrical-systems`, `fire-protection-systems` | Renewable/battery context should own when implemented. |
| Gas boiler visible issue | `gas-installations` future | `hvac-systems` | HVAC owns heat generation until gas provider exists; gas provider should own gas-specific risks. |

## 9. Bilingual Readiness Matrix

Required bilingual architecture:

- internal logic: language-neutral;
- internal identifiers: stable English IDs;
- input recognition: German and English;
- output rendering: German or English by explicit selection.

| Domain group | Internal identifiers | German input coverage | English input coverage | German output readiness | English output readiness | Explicit language-selection readiness | Bilingual tests | Translation debt | Routing risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Current 14 providers | LANGUAGE-NEUTRAL INTERNAL ONLY | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | PARTIAL | NOT IMPLEMENTED | NOT IMPLEMENTED | HIGH | HIGH |
| Missing mandatory domains | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | HIGH | HIGH |
| Future special-use domains | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | NOT IMPLEMENTED | HIGH | MEDIUM |
| Out-of-scope governance/document domains | LANGUAGE-NEUTRAL INTERNAL ONLY | LANGUAGE-NEUTRAL INTERNAL ONLY | LANGUAGE-NEUTRAL INTERNAL ONLY | NOT IMPLEMENTED | NOT IMPLEMENTED | N/A | N/A | LOW | LOW |

Bilingual readiness findings:

- The product has a `LanguageManager` with `en` and `de`, but Expert Intelligence does not consume an explicit language selection.
- Current providers hard-code English user-facing hypothesis, verification, implication, consequence, and recommendation text.
- Current router/provider vocabulary is English-first.
- German question catalog content exists, but it is not connected to Expert Intelligence vocabulary or output rendering.
- Every future provider must ship with German and English vocabulary and output resources.
- Mixed-language input will require explicit routing tests to prevent ambiguity and precedence drift.

## 10. Required Implementation Waves

Wave 0: Bilingual Architecture Foundation

Wave 0 must establish only the shared architecture required to prevent new bilingual debt before additional mandatory providers are implemented.

Scope:

1. Add the backward-compatible German/English language parameter at the reasoning boundary.
2. Establish shared bilingual resource architecture.
3. Preserve stable language-neutral domain and hypothesis identifiers.
4. Define the output-rendering boundary between provider reasoning logic and user-facing text.
5. Define fallback behaviour, including backward-compatible English fallback when no language is selected.
6. Establish mandatory bilingual router, provider, integration, fallback, mixed-language and semantic-parity test conventions.
7. Implement one reference implementation path sufficient to validate the architecture.

Wave 0 must not complete all terminology and must not translate all existing providers. It creates the architecture, fallback behaviour and test standard so new work does not add further bilingual debt.

Every new mandatory provider implemented after Wave 0 must support German and English input terminology and selectable German/English output from its first release.

The target principle remains:

- one domain;
- one provider;
- one reasoning model;
- German and English terminology;
- selectable German or English output;
- stable shared internal identifiers.

Wave 1: Critical structural, exterior and environmental gaps

1. `structural-systems`
2. `timber-decay-pest-damage`
3. `interior-construction`
4. `site-external-works` including retaining/boundary/external structures
5. `hazardous-materials`
6. `contamination-radon-indoor-environment`
7. `thermal-performance`
8. `mould-biological-growth` extension or subdomain

Wave 2: Remaining MEP and life-safety gaps

1. `renewable-energy-systems`
2. `gas-installations`
3. `lighting-emergency-lighting`
4. `emergency-power-ups-generators`
5. `lightning-protection-earthing` extension or subdomain
6. `security-telecom-data-systems`
7. `building-automation-bms-metering`

Wave 3: Specialist and conditional systems

1. `accessibility-systems` cross-domain ownership cleanup
2. `parking-structures-special-systems`
3. `commercial-kitchens-grease-coldrooms`
4. `pools-spas-water-treatment`
5. `laboratory-medical-industrial-systems`

Conditional domains do not block general Foundation completion unless they are included in the declared target asset scope. They remain separate from the mandatory baseline until a product release scope activates them.

Parallel migration track: Existing provider bilingual retrofit

The existing 14 providers must be retrofitted incrementally in parallel after Wave 0 without blocking the first new Wave 1 provider from using the new bilingual architecture. This track must be completed before bilingual readiness can be classified as complete.

1. Map existing English terminology into shared vocabulary resources.
2. Add German terminology, compounds, umlauts, ASCII variants, abbreviations and professional synonyms.
3. Move user-facing provider output text to bilingual resources keyed by stable hypothesis IDs.
4. Preserve current provider contracts and public domain identifiers.
5. Add bilingual router, provider and output parity tests for each existing provider.

Wave 4: Bilingual Completion and Release Verification

Wave 4 verifies the bilingual architecture rather than redesigning it.

1. All mandatory domains recognize controlled German and English terminology.
2. All mandatory domains render selectable German or English user-facing output.
3. All existing 14 providers have completed the bilingual retrofit.
4. All new providers comply with the bilingual standard from their first release.
5. No user-facing Expert Intelligence text remains hard-coded outside the approved bilingual resource layer.
6. German and English outputs use identical internal domain and hypothesis identifiers.
7. Router, provider, integration, fallback, mixed-language and semantic-parity tests pass.
8. Explicit language selection works end to end.
9. English fallback remains backward compatible.
10. Bilingual readiness may be classified COMPLETE only after this verification passes.

## 11. Foundation Completion Criteria

### A. Core Architecture Complete

Complete when:

- provider contract remains stable;
- router precedence remains deterministic;
- engine dispatch is complete for each current domain;
- mapper boundary remains stable;
- no multi-provider aggregation is introduced accidentally;
- public reasoning result remains backward compatible.

Current status: APPROVED.

### B. Foundation Domain Coverage Complete

Complete when:

- all mandatory professional TDD domains have a provider or an explicitly documented owner inside an existing provider;
- all partial domains have documented ownership and tests;
- missing mandatory domains are implemented or explicitly reclassified as conditional/future/out of scope;
- overlap rules are encoded in router tests;
- domain inventory and this master matrix are updated.

Current status: INCOMPLETE.

### C. Bilingual Readiness Complete

Complete when:

- all mandatory domains recognize German and English input terminology;
- all user-facing Expert Intelligence outputs are available in German and English;
- explicit language selection is supported by Expert Intelligence;
- automatic detection, if added, is optional fallback only;
- internal domain and hypothesis identifiers remain language-neutral and stable English IDs;
- bilingual regression tests pass for routing, providers, output rendering, determinism, and semantic parity.

Current status: INCOMPLETE.

### D. Product Release Ready

Ready when:

- core architecture is approved;
- foundation domain coverage is complete;
- bilingual readiness is complete;
- test coverage is complete;
- release audit shows no blocker or material defects.

Current status: NOT READY.

## 12. Risks

- Domain fragmentation risk: creating tiny providers for individual components would increase routing complexity and overlap drift.
- Coverage ambiguity risk: structural systems, site works, thermal performance, and interior construction currently span multiple existing symptom providers without clear ownership.
- Bilingual routing risk: German compounds and mixed-language findings may fail routing or route to incomplete domains without controlled vocabulary ownership.
- Output translation risk: translating hard-coded provider strings in place could mix reasoning logic and rendering concerns.
- Public API risk: adding language selection must be optional and backward compatible.
- Test drift risk: older provider tests vary in depth compared with recent domains.
- Domain identifier drift risk: `cracks` versus `crack` remains a known inconsistency.

## 13. Known Technical Debt

- `CrackKnowledgeProvider` provider domain is `cracks`; router and engine domain identifier is `crack`.
- Current provider output strings are English hard-coded.
- German question catalog terminology is not connected to Expert Intelligence routing or provider vocabulary.
- Existing English terminology is embedded directly in providers/router instead of controlled vocabulary resources.
- Missing domains from the question catalog include exterior works, interior construction, structural systems, hazardous materials, renewables, gas, security/telecom/data, emergency power, and thermal performance.
- No bilingual Expert Intelligence test standard is implemented yet.
- Current architecture has no explicit Expert Intelligence fallback rule for selected language, detected language, or no language.
- Current provider reasoning logic and user-facing rendering are not yet fully separated.
- Future provider implementations must keep reasoning language-neutral and render all user-facing text through the approved bilingual resource layer.

## 14. Recommended Next Implementation Block

Recommended next block: Foundation 1.1-C Critical Domain Coverage Block.

Scope:

1. Implement `structural-systems` as a broad professional structural provider that cooperates with `crack` and `concrete-corrosion`.
2. Implement `interior-construction` for internal walls, ceilings, floors, finishes, stairs, handrails, wet-room fabric, and joinery/fixed elements.
3. Implement `site-external-works` for external surfaces, paths, driveways, external stairs/ramps, boundaries, retaining structures, landscaping impacts, waste/recycling areas, and site infrastructure conditions.
4. Implement `hazardous-materials` for asbestos, lead, PCB, pollutant and contaminated material indicators using conservative non-diagnostic wording.
5. Decide whether `thermal-performance` is a standalone provider or part of a broader energy/thermal domain before implementing renewables.
6. Extend the shared bilingual vocabulary resources only for the domains implemented in Foundation 1.1-C. Do not introduce terminology for future domains. Maintain identical internal domain identifiers and hypothesis identifiers for German and English. Cover all newly introduced terminology with bilingual routing tests.

Each new provider must include provider tests, reasoning integration tests, router tests, overlap tests, deterministic tests, immutability tests, forbidden wording tests, and bilingual test placeholders or implemented bilingual tests depending on the release gate.

## Audit Metrics

Mandatory domain count used for this audit: 33.

- Complete mandatory domains: 14
- Partial mandatory domains: 8
- Missing mandatory domains: 11
- Weighted domain coverage: 54.55% using `(complete + 0.5 * partial) / mandatory`
- Strict complete-domain coverage: 42.42% using `complete / mandatory`
- Bilingual readiness: 0% using `mandatory domains with German+English input and selectable German+English output / mandatory`

The 33 mandatory domains include current providers and mandatory professional domains from the audit checklist. Conditional special-use systems are not counted in the mandatory baseline unless a property type or product release scope activates them.