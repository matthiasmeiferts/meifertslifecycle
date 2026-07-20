# Structural Systems Blueprint 1.0

Date: 2026-07-20
Branch: `foundation-release-1.0`
Foundation release: 1.3
Audited HEAD: `4dec9c6` (`Foundation 1.3-C.2: Add persisted governance integration test`)
Blueprint scope: future Expert Intelligence domain `structural-systems` only.

No knowledge provider, router change, engine change, tests, refactoring, commits, tags, or push were performed for this blueprint.

## 1. Executive Summary

This blueprint defines the future `structural-systems` Expert Intelligence domain without implementing it.

The domain should cover structural system symptoms and hypotheses only when the available evidence points beyond ordinary cosmetic, envelope, moisture, or material-condition defects. It must not become a general catch-all for building defects.

The current Foundation 1.x architecture is binding:

- `KnowledgeDomainRouter.resolve(...)` can return multiple candidate domains.
- `DOMAIN_PRECEDENCE` determines candidate order.
- `ExpertReasoningEngine.analyze(...)` returns the first successful public contract.
- Exactly one public `ExpertReasoningContract` is returned.
- No multi-domain aggregation is introduced in Foundation 1.x.

Recommended canonical Domain ID:

```text
structural-systems
```

Recommended future precedence position:

```text
structural-systems
concrete-corrosion
basement-waterproofing
balconies-terraces
...
moisture
crack
```

That means `structural-systems` should be inserted before `concrete-corrosion`, but only after strict routing gates are defined. The high position is acceptable only if weak signals such as `crack`, `damp`, `corrosion`, `uneven`, or `movement` cannot route to `structural-systems` on their own.

Key rule: Structural Systems may win early only for clear structural indicators such as load-bearing elements, structural deformation, settlement, foundation movement, removed structural components, structural alteration, significant deflection, instability, or documented structural damage.

## 2. Architecture Context

Reviewed architecture surfaces:

- `portal/core/reasoning/KnowledgeDomainRouter.js`
- `portal/core/ExpertReasoningEngine.js`
- `portal/core/reasoning/KnowledgeReasoningMapper.js`
- Existing knowledge providers under `portal/core/knowledge`
- Existing reasoning integration tests under `tests`
- Existing router precedence tests in `tests/knowledge-domain-router-test.js`

Relevant current router behavior:

- `KnowledgeDomainRouter.resolve(input = {})` clones `finding`, `building`, and `measurements`.
- It evaluates domain predicates independently.
- It can collect multiple domains.
- It returns candidates in `DOMAIN_PRECEDENCE` order.

Current `DOMAIN_PRECEDENCE`:

```text
concrete-corrosion
basement-waterproofing
balconies-terraces
drainage-rainwater
fire-protection-systems
vertical-transportation-systems
sanitary-systems
hvac-systems
electrical-systems
windows-doors
facade-wall-systems
roof-envelope
moisture
crack
```

Relevant current engine behavior:

- `ExpertReasoningEngine.analyze(...)` resolves router domains.
- It loops over candidates in order.
- It dispatches each candidate to one builder.
- It returns immediately when a builder returns a truthy contract.
- It does not aggregate later candidates.
- Legacy fallback remains reachable when no domain succeeds or when no domain routes.

Relevant mapper behavior:

- `KnowledgeReasoningMapper.map(...)` maps provider `hypotheses` into the stable public contract.
- It scores by matching `supportingIndicators` against normalized input text.
- It returns `null` when no hypothesis has supporting score.
- It maps hypothesis fields including `id`, `cause`, `classification`, `structuralRelevance`, `requiredVerification`, `potentialConsequences`, `recommendedActions`, `riskRelevance`, `capexRelevance`, `valuationRelevance`, and `status: "hypothesis"`.

Implication:

`structural-systems` can fit the existing provider plus mapper model if its provider is strict enough and if precedence is explicitly governed.

## 3. Canonical Domain ID

Canonical Domain ID:

```text
structural-systems
```

Rationale:

- Matches existing kebab-case Expert Intelligence Domain ID style.
- Uses plural `systems`, consistent with `hvac-systems`, `sanitary-systems`, `electrical-systems`, `fire-protection-systems`, `vertical-transportation-systems`, and `facade-wall-systems`.
- Describes the domain as the load-bearing structural system rather than a single defect type.

Expected future usage:

- Provider: `domain: "structural-systems"`
- Router: `domains.push("structural-systems")`
- Engine: `domain === "structural-systems"`
- Tests: expect `"structural-systems"`
- Optional future terminology resources: `"structural-systems"`

No alias should be introduced unless a concrete public or persisted contract requires it. No such requirement was confirmed during this blueprint.

## 4. Fachlicher Scope

`structural-systems` should cover observed indicators and hypotheses relating to the load-bearing and stability system of a building.

In scope:

- Structural system and load path.
- Load-bearing walls.
- Columns and piers.
- Beams, girders, lintels, and transfer elements.
- Slabs, decks, floor structures, and ceiling structures where structural behavior is implicated.
- Foundations, footings, raft slabs, basement retaining walls, and ground-bearing slabs when structural behavior is implicated.
- Roof structures, roof trusses, rafters, purlins, bracing, and structural roof deformation.
- Lateral stability, bracing, shear walls, diaphragms, and racking resistance.
- Settlement, differential settlement, foundation movement, and substructure movement.
- Deformation, deflection, sagging, bowing, leaning, rotation, and misalignment of structural elements.
- Building movement and recurring or active structural distress.
- Structural connection failure.
- Material loss or section loss with possible structural relevance.
- Unauthorized or undocumented interventions into load-bearing elements.
- Missing, removed, cut, or altered load-bearing members.
- Openings through slabs, beams, walls, or foundations where structural approval is unclear.
- Signs of overloading or inadequate support.
- Corrosion with structural relevance, especially in reinforcement, steel members, anchors, bearing plates, or load-bearing connectors.
- Fire or water damage affecting load-bearing components.
- Structural consequences of renovation, conversion, extensions, openings, or service penetrations.

Required conceptual separation:

| Concept | Meaning for Structural Systems |
| --- | --- |
| Observable finding | What is directly visible or documented, such as deflection, crack pattern, missing member, corrosion at a column, or removed wall. |
| Possible cause | A plausible mechanism, such as settlement, overloading, loss of section, alteration, water-related degradation, or fire-related degradation. |
| Structural hypothesis | A cautious expert-intelligence hypothesis requiring verification. It is not a confirmed engineering conclusion. |
| Confirmed structural assessment | Reserved for qualified structural review, calculations, drawings, intrusive investigation, or engineer assessment. The provider must not claim this from ordinary visual evidence. |

Allowed language style:

- `possible settlement-related movement`
- `possible excessive deflection`
- `structural assessment required`
- `specialist structural verification is required before conclusion`

Forbidden language style:

- `the structure is unsafe`
- `load capacity is insufficient`
- `collapse risk is confirmed`
- `foundation failure is proven`
- `reinforcement capacity is reduced by X percent`

## 5. Explicit Exclusions

The following must not automatically route to or be owned by `structural-systems`:

- Cosmetic cracks without structural context.
- Hairline plaster cracks.
- Render cracks without movement, displacement, load-bearing context, or structural element evidence.
- Non-load-bearing partition wall cracks.
- Pure moisture staining.
- Mold or biological growth.
- Waterproofing defects without structural deformation or load-path evidence.
- Facade surface defects such as coating failure, algae, isolated sealant defects, or render weathering.
- Concrete corrosion without evidence of structural relevance, load-bearing location, section loss, deformation, reinforcement exposure, or structural distress.
- Roof waterproofing or flashing defects without roof-structure involvement.
- Balcony waterproofing defects without slab, cantilever, anchor, support, or structural connection evidence.
- Sanitary, HVAC, electrical, fire protection, vertical transportation, drainage, or other technical system defects without structural consequences.
- Pure serviceability deviations without structural relevance.
- General age, wear, maintenance backlog, valuation concern, CAPEX concern, or documentation concern without structural indicators.

Important boundary rule:

A defect may be serious, expensive, or urgent without being a `structural-systems` defect. Structural Systems is about possible load-bearing, stability, deformation, alteration, or structural material relevance.

## 6. Domain Boundary Matrix

| Befundtyp | Primaere Domain | Moegliche sekundaere Domain | structural-systems zustaendig | Notwendige Evidenz | Begruendung |
| --- | --- | --- | --- | --- | --- |
| Horizontaler Kellerwandriss | `structural-systems` if bowing/retaining-wall pressure indicators exist; otherwise `basement-waterproofing` or `crack` | `basement-waterproofing`, `moisture`, `crack` | Bedingt | Basement retaining wall, horizontal crack, bowing, displacement, soil/water pressure context, crack width or progression | Horizontal basement wall cracks can indicate lateral pressure, but wet crack alone remains basement/moisture/crack. |
| Vertikaler Fassadenriss | `facade-wall-systems` | `crack`, possibly `structural-systems` | Bedingt | Load-bearing wall context, widening, displacement, settlement pattern, repeated movement, structural masonry evidence | Facade cracks are often envelope/facade issues; structural ownership needs load-path or movement evidence. |
| Diagonaler Riss ueber Fensteroeffnung | `structural-systems` if lintel/load-transfer or settlement indicators exist; otherwise `crack` or `windows-doors` | `crack`, `windows-doors`, `facade-wall-systems` | Bedingt | Diagonal crack at opening, lintel/opening context, displacement, recurring/widening pattern, load-bearing wall evidence | Opening cracks can be structural, but ordinary finish cracks near windows should remain crack/windows/facade. |
| Riss in nicht tragender Innenwand | `crack` | None or `moisture` if wet | Nein | Evidence that partition is non-load-bearing and no displacement/load path concern | Non-load-bearing partition cracks are not structural by default. |
| Betonabplatzung mit sichtbarer Bewehrung | `concrete-corrosion` | `structural-systems` | Bedingt | Structural element location, exposed reinforcement, section loss, spalling extent, deformation, load-bearing role | Concrete corrosion owns material deterioration unless structural role or loss of section is evidenced. |
| Korrosion an tragender Stuetze | `structural-systems` | `concrete-corrosion` | Ja | Column/support identity, corrosion, section loss or exposed reinforcement/steel, load path relevance | Corrosion at a load-bearing column has direct structural relevance. |
| Feuchtigkeit an Fundamentwand | `basement-waterproofing` or `moisture` | `structural-systems` | Bedingt | Foundation wall plus movement, cracking, rotation, settlement, erosion, material degradation | Moisture alone is not structural; structural ownership requires movement or load-bearing degradation. |
| Setzungsanzeichen | `structural-systems` | `crack`, `basement-waterproofing` | Ja | Differential levels, diagonal cracks, sticking openings, foundation movement, historical progression | Settlement is a core structural hypothesis. |
| Schief stehende Wand | `structural-systems` | `facade-wall-systems`, `crack` | Ja | Plumb measurement, visible lean, load-bearing context, displacement, progression | Leaning structural walls implicate stability and load path. |
| Durchgebogene Decke | `structural-systems` | `crack` | Ja | Deflection measurement, sagging, slab/beam/floor structure context, cracking, load/use context | Excessive deflection is a structural-system concern. |
| Beschaedigter Dachstuhl | `structural-systems` | `roof-envelope`, `moisture` | Ja | Roof truss/rafter/purlin damage, deformation, rot, fire, water exposure, missing bracing | Roof envelope defects are secondary unless structural roof members are implicated. |
| Entfernte tragende Wand | `structural-systems` | None or documentation review | Ja | Evidence of removed load-bearing wall, missing approval, transfer beam absence, altered load path | Unauthorized structural alteration is core scope. |
| Nachtraeglicher Deckendurchbruch | `structural-systems` | None or documentation review | Bedingt | Slab opening, beam/slab cut, unclear approval, reinforcement interruption, edge support concern | Small service penetrations may not route; major or undocumented openings should. |
| Korrodierter Balkonanschluss | `structural-systems` if bearing/anchor/cantilever connection affected; otherwise `balconies-terraces` or `concrete-corrosion` | `balconies-terraces`, `concrete-corrosion`, `moisture` | Bedingt | Cantilever or support connection, anchor corrosion, load-bearing role, cracking/spalling, water ingress | Balcony waterproofing defects remain balcony domain unless structural connection is implicated. |
| Verformung eines Traegers | `structural-systems` | None or `crack` | Ja | Beam/girder identity, sagging, deflection measurement, cracking, load path evidence | Beam deformation is direct structural scope. |
| Hochwasserschaden an tragenden Bauteilen | `structural-systems` if structural members affected; otherwise `moisture` | `moisture`, `basement-waterproofing`, `concrete-corrosion` | Bedingt | Flood exposure plus structural member, erosion, scour, material degradation, deformation, documentation | Water exposure alone is moisture; structural ownership needs structural member impact. |
| Brandschaden an Tragwerk | `structural-systems` | `fire-protection-systems`, `concrete-corrosion` | Ja | Fire exposure to structural members, charring, spalling, steel deformation, concrete damage, engineer review need | Fire protection systems are about systems; structural fire damage belongs here. |
| Unzureichende Aussteifung | `structural-systems` | None | Ja | Missing bracing, racking, lateral movement, altered shear walls, structural drawings or inspection evidence | Lateral stability is core structural scope. |
| Unbekannte Umbauten ohne statische Unterlagen | `structural-systems` only with structural alteration indicators | Documentation review / governance | Bedingt | Structural element affected, missing drawings/calculations/approval, openings/removals/support changes | Lack of documents alone is not enough; must relate to possible structural alteration. |

## 7. Routing Signals

Fields that may be evaluated:

- `finding.category`
- `finding.location`
- `finding.description`
- `finding.observations`
- `building.constructionType`
- `building.constructionYear`
- `building.numberOfStoreys`
- `building.basementPresent`
- `measurements[]`

The router must not rely on UI state, generated conclusions, valuation fields, CAPEX estimates, or hidden context.

### Strong Signals

Strong signals may route to `structural-systems` alone when the finding is building-related and not clearly excluded:

- `structural`
- `structural damage`
- `load-bearing`
- `load bearing`
- `load path`
- `settlement`
- `differential settlement`
- `foundation movement`
- `deflection`
- `excessive deflection`
- `instability`
- `unstable`
- `column`
- `structural column`
- `beam`
- `girder`
- `slab deflection`
- `foundation`
- `footing`
- `raft slab`
- `roof truss`
- `rafter deformation`
- `purlin deformation`
- `removed load-bearing wall`
- `missing load-bearing wall`
- `structural alteration`
- `unauthorized structural opening`
- `removed support`
- `missing support`
- `bracing missing`
- `lateral stability`

### Medium Signals

Medium signals require combination with a structural element, measurement, progression, location, or documentation indicator:

- `diagonal crack`
- `step crack`
- `deformation`
- `sagging`
- `bowing`
- `leaning`
- `misalignment`
- `significant movement`
- `active movement`
- `widening crack`
- `recurring crack`
- `structural corrosion`
- `section loss`
- `major opening`
- `large penetration`
- `cut slab`
- `cut beam`
- `altered wall`
- `unsupported opening`
- `fire damage to structure`
- `flood damage to structure`

### Weak Signals

Weak signals must not route to `structural-systems` alone:

- `crack`
- `cracked`
- `damp`
- `moisture`
- `wet`
- `corrosion`
- `rust`
- `uneven`
- `movement`
- `old`
- `damaged`
- `defect`
- `settled` without structural context

Required combinations:

- Weak crack signal plus load-bearing element plus displacement/progression may route.
- Weak corrosion signal plus column/beam/slab/reinforcement/anchor plus section loss may route.
- Moisture plus foundation plus movement/erosion/material loss may route.
- Renovation/alteration plus load-bearing wall/slab/beam/foundation plus missing approval may route.
- Measurement such as crack width, level survey, plumb deviation, or deflection strengthens routing but must be interpreted in context.

False positive prevention:

- Do not route from `crack` alone.
- Do not route from `moisture` alone.
- Do not route from `corrosion` alone.
- Do not route from `foundation` alone when the text is purely waterproofing or maintenance.
- Do not route from `wall` alone.
- Do not route from generic `movement` if it refers to doors, windows, joints, HVAC, elevators, or occupants.
- Do not route from `beam` if it clearly refers to light, laser beam, decorative beam, or non-building object.
- Do not route from `slab` if it clearly refers to finishes, tiles, or non-structural surface only.

## 8. Negative Routing Rules

Structural Systems must not route when the available text clearly indicates:

- `hairline plaster crack` without movement or structural context.
- `render crack` limited to facade finish.
- `surface crack` in paint, plaster, screed, tile, or finish layer only.
- `non-load-bearing partition` or `lightweight partition` without structural context.
- `mold`, `condensation`, `staining`, or `damp patch` without structural member impact.
- `waterproofing membrane defect` without deformation or structural damage.
- `roof flashing`, `roof membrane`, `gutter`, or `drainage` defects without structural roof member evidence.
- `balcony waterproofing` or `terrace leakage` without slab, cantilever, support, anchor, or connection evidence.
- `facade coating`, `sealant`, `cladding`, or `render` defects without load-bearing wall, anchor failure, or movement evidence.
- Technical systems defects such as electrical overheating, sanitary leakage, HVAC condensate, elevator door issues, or fire alarm defects unless structural member damage is explicitly described.
- Documentation gaps without evidence of structural alteration or affected load-bearing elements.

Negative routing rule for crack overlap:

- Existing cosmetic and generic crack cases should remain `crack` unless there is evidence of structural element involvement, movement progression, displacement, deformation, settlement, or load-path relevance.

Negative routing rule for concrete overlap:

- Existing concrete corrosion cases should remain `concrete-corrosion` unless there is structural element identity plus section loss, exposed reinforcement in a load-bearing member, deformation, or structural distress.

Negative routing rule for moisture overlap:

- Existing moisture cases should remain `moisture`, `basement-waterproofing`, `roof-envelope`, `facade-wall-systems`, `drainage-rainwater`, `sanitary-systems`, or `hvac-systems` unless water damage affects a structural member or foundation movement is indicated.

## 9. DOMAIN_PRECEDENCE Options

### Option 1: Very High Priority

Position:

```text
structural-systems
concrete-corrosion
basement-waterproofing
...
crack
```

Advantages:

- Structural distress owns the public contract when strong structural indicators are present.
- Load-bearing, settlement, deformation, alteration, and stability issues are not shadowed by concrete, basement, facade, moisture, or crack domains.
- Aligns with the professional importance of structural due-diligence concerns.
- Works with first-success if the router predicate is strict.

Risks:

- If routing is too broad, structural-systems could steal ordinary concrete corrosion, basement waterproofing, facade crack, moisture, roof, or balcony cases.
- Requires strong negative routing tests.
- Requires careful provider wording to avoid overdiagnosis.

Typical routing impacts:

- `removed load-bearing wall` wins structural.
- `beam deflection` wins structural.
- `corrosion at load-bearing column with section loss` wins structural.
- `spalling concrete with rust staining` remains concrete if no structural member/section-loss evidence triggers structural.

Possible misclassifications:

- Generic `foundation moisture` incorrectly structural.
- Generic `diagonal crack` incorrectly structural.
- Generic `corrosion` incorrectly structural.

Mitigation:

- Weak signals cannot route alone.
- Require strong signal or medium signal combinations.

### Option 2: Middle Priority

Possible position:

```text
concrete-corrosion
basement-waterproofing
balconies-terraces
structural-systems
drainage-rainwater
...
crack
```

Advantages:

- Preserves current ownership of concrete, basement, and balcony-specific defects.
- Reduces risk that structural-systems becomes a catch-all.
- Easier to adopt without disturbing established early domains.

Risks:

- Structural deformation combined with concrete corrosion may be consumed by `concrete-corrosion` before structural-systems can produce a contract.
- Basement wall deformation may be consumed by `basement-waterproofing` if basement evidence is strong.
- Balcony structural connection defects may be consumed by `balconies-terraces`.

Typical routing impacts:

- `spalling with structural deformation` may become concrete-first.
- `wet retaining wall crack with bowing` may become basement-first.
- `balcony anchor corrosion` may become balcony-first.

Possible misclassifications:

- Structural distress hidden behind material or envelope domain output.
- Public result focuses on defect mechanism rather than structural verification need.

### Option 3: Immediately Before Crack

Position:

```text
...
roof-envelope
moisture
structural-systems
crack
```

Advantages:

- Very low risk of stealing existing specific domain cases.
- Structural-systems acts as a narrow fallback before generic crack.
- Existing concrete, basement, facade, balcony, roof, and moisture behavior remains highly protected.

Risks:

- Too late for many serious structural overlaps.
- Concrete corrosion, basement, facade, roof, balcony, and moisture domains may return first even when structural evidence is central.
- Structural Systems becomes mostly a crack fallback, not a true structural-system domain.

Typical routing impacts:

- `diagonal crack with settlement` may become structural before crack.
- `concrete column corrosion with deformation` may remain concrete.
- `basement retaining wall bowing with moisture` may remain basement/moisture.

Possible misclassifications:

- Serious structural cases represented as envelope/material/moisture problems.
- Structural verification need appears only inside another domain, if at all.

## 10. Recommended Precedence Position

Recommendation:

Insert `structural-systems` before `concrete-corrosion`.

Recommended future order:

```text
structural-systems
concrete-corrosion
basement-waterproofing
balconies-terraces
drainage-rainwater
fire-protection-systems
vertical-transportation-systems
sanitary-systems
hvac-systems
electrical-systems
windows-doors
facade-wall-systems
roof-envelope
moisture
crack
```

Reasoning:

- First-success means an earlier concrete, basement, facade, moisture, or balcony contract can prevent structural-systems from ever producing the public contract.
- Structural Systems should win when a load-bearing, stability, deformation, settlement, alteration, or structural member signal is strong enough.
- The high position is safe only if the router predicate is deliberately narrow and negative routing is well tested.
- Existing specific domains remain protected because weak terms such as `crack`, `moisture`, `corrosion`, `foundation`, or `wall` cannot route to structural-systems alone.

Classification:

- P1: Precedence position must be decided before implementation.
- Recommended decision: high priority before `concrete-corrosion`, guarded by strict routing.

## 11. First-Success Governance

Under Foundation 1.x, the first successful domain owns the public contract. The following overlap outcomes should govern implementation.

| Case | Winning domain should be | Required evidence | When structural-systems must not win | Reason |
| --- | --- | --- | --- | --- |
| Riss plus Setzung | `structural-systems` | Settlement, differential movement, foundation movement, level change, diagonal/step pattern, recurring/widening evidence | Generic crack without settlement or movement evidence | Settlement is structural-system scope. |
| Riss plus Feuchtigkeit | Existing moisture/basement/facade/roof domain unless structural movement exists | Crack plus wetness alone is insufficient; structural needs movement, deformation, foundation impact, material loss, or load-bearing context | Wet crack, seepage, stain, or mold only | Moisture is often cause or consequence but not structural by itself. |
| Betonkorrosion plus Tragwerksverformung | `structural-systems` | Concrete/reinforcement distress plus deformation, load-bearing element, section loss, exposed reinforcement, or structural member identity | Rust staining/spalling without structural element or deformation evidence | Deformation and structural member impact should outrank material-only deterioration. |
| Kellerabdichtungsschaden plus Wandverformung | `structural-systems` | Retaining/foundation wall plus bowing, horizontal crack, displacement, plumb deviation, soil/water pressure context | Seepage, efflorescence, damp basement, membrane defect only | Wall deformation changes the problem from waterproofing to possible structural behavior. |
| Fassadenriss plus tragende Wand | `structural-systems` if load-bearing movement is evidenced; otherwise `facade-wall-systems` or `crack` | Load-bearing wall, displacement, widening, settlement, structural masonry, lintel/load transfer context | Render crack, sealant crack, coating crack, facade finish defect | Facade surface issues remain facade; load-bearing wall behavior can be structural. |
| Balkonkorrosion plus beschaedigter Traganschluss | `structural-systems` | Cantilever/support/anchor connection, corrosion, cracking/spalling, load-bearing connection role | Balcony waterproofing, drainage, surface spalling without support/anchor evidence | Structural connection failure is structural-system scope. |

Implementation implication:

- Structural routing must require strong structural indicators.
- Existing domains must remain primary for ordinary surface, envelope, moisture, material, and system defects.
- Public result must remain one contract.

## 12. Overlap with Existing Domains

### crack

Overlap:

- Diagonal cracks.
- Step cracks.
- Widening or recurring cracks.
- Settlement-related crack patterns.
- Load-bearing wall cracks.

Boundary:

- `crack` owns generic crack hypotheses and cosmetic/non-structural crack patterns.
- `structural-systems` owns crack patterns only when structural member, movement, settlement, deformation, or load-path evidence is present.

Regression requirement:

- Existing crack-only routing stays `crack`.
- Existing cosmetic/fine/plaster crack tests remain unchanged.

### concrete-corrosion

Overlap:

- Spalling.
- Reinforcement corrosion.
- Exposed reinforcement.
- Concrete cover distress.
- Structural concrete deterioration.

Boundary:

- `concrete-corrosion` owns material deterioration without structural behavior evidence.
- `structural-systems` owns load-bearing concrete distress with deformation, significant section loss, exposed reinforcement in a structural member, or stability concern.

Regression requirement:

- Existing concrete spalling/rust cases remain `concrete-corrosion` unless structural evidence is explicit.

### basement-waterproofing

Overlap:

- Basement retaining walls.
- Foundation walls.
- Wet cracks.
- Seepage at below-grade structural elements.
- Soil/water pressure symptoms.

Boundary:

- `basement-waterproofing` owns water ingress, membrane, drainage, seepage, and basement moisture mechanisms.
- `structural-systems` owns wall bowing, foundation movement, settlement, retaining-wall displacement, or structural cracking.

### facade-wall-systems

Overlap:

- External wall cracking.
- Masonry facade movement.
- Anchors, cladding, render detachment.
- Movement accommodation.

Boundary:

- `facade-wall-systems` owns facade assembly, cladding, render, sealant, ETICS, weathering, and anchor condition hypotheses.
- `structural-systems` owns load-bearing external wall movement, structural masonry distress, lateral stability, or structural connection failure.

### moisture

Overlap:

- Moisture as cause or consequence of structural deterioration.
- Flood exposure.
- Wet foundation or structural members.
- Moisture-related material degradation.

Boundary:

- `moisture` owns moisture pattern, condensation, staining, dampness, and non-structural water consequences.
- `structural-systems` owns water-related structural member degradation only when structural member and material impact or movement are evidenced.

### balconies-terraces

Overlap:

- Balcony slabs.
- Cantilever elements.
- Balcony anchors.
- Terrace structural support.
- Water ingress causing slab/anchor deterioration.

Boundary:

- `balconies-terraces` owns assembly-level balcony/terrace waterproofing, drainage, surface, and connection conditions.
- `structural-systems` owns support/cantilever/anchor/structural connection degradation.

### roof-envelope

Overlap:

- Roof sagging.
- Damaged trusses or rafters.
- Water damage to roof structure.
- Roof load path or bracing issues.

Boundary:

- `roof-envelope` owns roof covering, waterproofing, flashing, drainage, and envelope defects.
- `structural-systems` owns roof structure deformation, missing bracing, damaged trusses, rot/fire damage to structural roof members, or structural load concerns.

## 13. Hypothesis Classes

These are classes, not final expert knowledge entries.

| Hypothesis class | Fachlicher Zweck | Mindestindikatoren | Ausschlussindikatoren | Notwendige Zusatzpruefung | Zulaessige Formulierung | Unzulaessige Ueberdiagnose |
| --- | --- | --- | --- | --- | --- | --- |
| possible settlement-related movement | Capture possible differential movement or foundation settlement | Settlement, diagonal/step cracks, level change, sticking openings, foundation context | Cosmetic plaster crack, isolated surface crack | Level survey, crack monitoring, foundation review, structural engineer review | `possible settlement-related movement` | `foundation failure confirmed` |
| possible excessive deflection | Capture sagging or deflecting slabs/beams/floors | Deflection, sagging, beam/slab/floor structure, measurement or visible deformation | Finish unevenness, floor covering defect | Deflection measurement, load/use review, structural engineer review | `possible excessive deflection` | `load capacity is insufficient` |
| possible structural alteration | Capture undocumented load path changes | Removed wall, major opening, cut slab/beam, missing approval | Non-load-bearing partition changes | Drawings, renovation records, structural approval, inspection | `possible structural alteration requiring verification` | `illegal alteration confirmed` |
| possible loss of section | Capture structural material/section reduction | Structural member, corrosion/rot/spalling/fire damage, section loss, exposed reinforcement | Surface rust, cosmetic spalling | Material testing, intrusive investigation, engineer assessment | `possible loss of section` | `capacity reduced by a specific percentage` |
| possible connection deterioration | Capture support, anchor, bearing, or joint deterioration | Anchor/support/connection, corrosion, cracking, movement, bearing distress | Sealant/joint finish defect only | Connection inspection, opening-up, material review | `possible structural connection deterioration` | `connection failure confirmed` |
| possible overloading | Capture symptoms consistent with overload | Deflection, cracking, changed use, heavy loads, distress near load path | Minor serviceability issue without structural member | Load review, drawings, engineer assessment | `possible overloading indicators` | `overload is proven` |
| possible foundation movement | Capture foundation/substructure distress | Foundation wall, footing, settlement, rotation, differential levels, soil/water pressure | Waterproofing defect only | Foundation inspection, level survey, monitoring | `possible foundation movement` | `foundation is unstable` |
| possible lateral stability deficiency | Capture bracing/shear/racking concerns | Missing bracing, leaning, racking, removed shear wall, roof/wall instability | Door/window misalignment alone | Structural drawings, bracing inspection, engineer review | `possible lateral stability deficiency` | `building lacks stability` |
| possible fire-related structural degradation | Capture fire impact on structural members | Fire exposure, charring, spalling, steel deformation, concrete damage | Fire alarm/sprinkler issue only | Fire damage assessment, material testing, engineer review | `possible fire-related structural degradation` | `fire has made the structure unsafe` |
| possible water-related material degradation | Capture water/flood/rot/scour impact on structural elements | Structural timber/steel/concrete/foundation plus water exposure, rot, scour, deterioration | Damp stain only | Moisture investigation, intrusive inspection, material testing | `possible water-related structural material degradation` | `structural decay confirmed` |
| possible roof-structure distress | Capture truss/rafter/purlin/bracing distress | Roof truss, rafter, sagging, missing bracing, rot/fire damage | Roof membrane/flashing defect only | Roof structure inspection, survey, engineer review | `possible roof-structure distress` | `roof structure failure confirmed` |

All hypothesis outputs must keep `status: "hypothesis"` through the existing mapper boundary.

## 14. Evidence Model

Evidence should be weighted conceptually. No formula is implemented in this blueprint.

| Evidence type | Weight | Use |
| --- | --- | --- |
| Visual observation | weak to moderate | Identifies symptoms; cannot confirm structural diagnosis alone. |
| Crack pattern | weak to moderate | Stronger when pattern is diagonal, stepped, widening, recurring, or tied to structural elements. |
| Crack width | moderate | Supports seriousness when measured and contextualized; not confirmatory alone. |
| Deformation measurement | strong | Supports structural concern when tied to beam/slab/wall/roof/foundation. |
| Level survey | strong | Supports settlement or deflection hypotheses. |
| Plumb measurement | strong | Supports leaning/bowing/racking concerns. |
| Material loss | moderate to strong | Stronger on load-bearing elements or where section loss is visible/measured. |
| Corrosion exposure | weak to moderate | Stronger when affecting reinforcement, steel members, anchors, or bearing elements. |
| Documentation review | moderate | Helps identify intended load path and approved alterations. |
| Structural drawings | strong | Establishes structural role and load path. |
| Calculation records | strong | Supports verification of capacity assumptions but does not replace engineer assessment. |
| Renovation records | moderate to strong | Critical for altered walls/openings/supports. |
| Historical movement | moderate to strong | Supports active/progressive distress assessment. |
| Monitoring data | strong | Supports active movement, stability, or crack progression assessment. |
| Moisture exposure | weak to moderate | Becomes stronger when tied to structural material degradation. |
| Fire exposure | moderate to strong | Stronger when structural members show fire effects. |
| Intrusive investigation | confirmatory support | Can confirm hidden conditions, material condition, reinforcement, rot, or connection state. |
| Engineer assessment | confirmatory | Required for confirmed structural safety/capacity conclusions. |

Evidence governance:

- No single visual observation may create a confirmed structural diagnosis.
- Confirmatory evidence should still be represented as verification support, not as automatic safety certification.
- Missing documents, inaccessible components, and uncertainty must remain visible.

## 15. Expert Guardrails

Mandatory guardrails:

- Do not confirm structural safety.
- Do not confirm load-bearing capacity.
- Do not simulate a structural calculation.
- Do not invent material strength, reinforcement size, section capacity, load values, or safety factors.
- Do not confirm root cause without sufficient evidence.
- Do not assert collapse danger unless explicitly documented by severe observable facts or professional assessment.
- For serious indicators, recommend qualified structural engineer review.
- For acute danger indicators, recommend factual escalation such as urgent safety review or access restriction.
- Transparently state uncertainty.
- Make missing drawings, missing calculations, missing approvals, and missing access visible.
- Respect accessibility limits.
- Separate observation, hypothesis, and confirmation.
- Avoid Go/No-Go, purchase recommendation, legal certification, or final expert opinion.
- Do not silently redefine existing domain ownership.

Required output style:

- Use `possible`, `potential`, `indicators of`, `requires verification`, `structural assessment required`.
- Do not use `confirmed`, `proven`, `safe`, `unsafe`, `failed`, `capacity is insufficient`, or `collapse will occur` unless such wording is part of external documented evidence and still framed as evidence requiring expert review.

## 16. Severity and Risk Governance

Severity and risk may be influenced by:

- Whether the affected element is load-bearing.
- Position in the load path.
- Extent and number of affected elements.
- Deformation magnitude.
- Active or progressive movement.
- Crack width, pattern, recurrence, and progression.
- Corrosion extent and section/material loss.
- Exposed reinforcement or steel member deterioration.
- Foundation, retaining-wall, column, beam, slab, roof truss, or bracing involvement.
- Fire or flood exposure to structural elements.
- Missing structural drawings, calculations, or approvals.
- Known or suspected structural alteration.
- Building use, occupancy, and consequence of failure.
- Redundancy or lack of redundancy where known.
- Historical development and monitoring data.

Severity and risk must not be influenced by:

- General anxiety or buyer concern alone.
- CAPEX magnitude alone.
- Age alone.
- Moisture alone.
- Cosmetic appearance alone.
- Lack of documents alone without structural alteration indicators.

No scoring formula is defined or implemented here.

## 17. Recommendation Classes

Allowed recommendation classes:

| Class | When allowed | Not allowed automatically |
| --- | --- | --- |
| monitor | Minor or uncertain symptoms without acute indicators | Do not use as substitute for engineer review when serious structural signs exist. |
| document review | Missing or unclear structural drawings, calculations, approvals, renovation records | Do not imply documents will prove safety. |
| dimensional survey | Leaning, bowing, deflection, settlement, misalignment | Do not infer capacity from measurements alone. |
| crack monitoring | Recurring, widening, diagonal, step, or settlement-like crack patterns | Do not claim crack stability without monitoring data. |
| structural engineer review | Load-bearing element, deformation, settlement, alteration, section loss, serious red flag | Do not replace with generic repair planning. |
| intrusive investigation | Hidden reinforcement, connection, rot, corrosion, concealed structural member condition | Do not recommend unnecessary destructive work for cosmetic issues. |
| material testing | Fire damage, corrosion, rot, concrete/reinforcement concern, steel/timber degradation | Do not invent material values before testing. |
| temporary load restriction | Serious deflection, overloading indicators, damaged support, uncertain capacity | Do not impose as final engineering instruction without expert review; frame as urgent review consideration. |
| access restriction | Acute safety indicators, unstable members, severe deformation, missing support | Do not use for ordinary non-acute findings. |
| urgent safety review | Acute red flags or severe structural uncertainty | Do not assert collapse; escalate factually. |
| repair planning | After verification need is identified or when repair scope depends on engineer review | Do not recommend definitive structural repair design. |
| verify structural approval | Alterations, removed walls, slab openings, added loads, undocumented structural changes | Do not conclude non-compliance without documentation review. |

## 18. Structural Red Flags

### Acute Red Flags

- Suddenly developed major deformation.
- Rapidly increasing cracks or displacement.
- Visible loss of section in a load-bearing member.
- Missing or severely damaged column, beam, support, brace, or bearing element.
- Large deflection or sagging of beam, slab, floor, or roof structure.
- Strongly leaning or unstable-looking wall or structural member.
- Severe fire exposure to structural elements.
- Undermining, scour, washout, or foundation movement.
- Unsecured intervention into load-bearing components.
- Critical connection failure or bearing failure indicators.

Expected response:

- Urgent safety review.
- Consider access restriction or temporary load restriction where factual indicators justify escalation.
- Structural engineer review.

### Pruefpflichtige Red Flags

- Diagonal or step cracks with movement indicators.
- Horizontal retaining-wall cracks.
- Recurring/widening cracks.
- Corrosion at structural steel, reinforcement, anchors, or balcony connections.
- Roof truss, rafter, purlin, or bracing damage.
- Unknown structural alterations.
- Major openings in slabs, beams, or load-bearing walls.
- Flood/fire exposure affecting structural elements.

Expected response:

- Structural engineer review.
- Documentation review.
- Survey, monitoring, intrusive investigation, or material testing as appropriate.

### Dokumentationspflichtige Auffaelligkeiten

- Missing structural drawings.
- Missing renovation approvals.
- Unclear wall load-bearing status.
- Minor deflection without measurement.
- Historic cracks reported without monitoring data.
- Limited access to structural members.

Expected response:

- Document uncertainty.
- Request records or further verification.
- Avoid definitive structural conclusion.

## 19. Provider Contract

Future provider file:

```text
portal/core/knowledge/StructuralSystemsKnowledgeProvider.js
```

Expected Domain ID:

```js
domain: "structural-systems"
```

Expected input:

- `input.finding`
- `input.building`
- `input.measurements`

Expected return structure, aligned with existing providers:

```js
{
  domain: "structural-systems",
  hypotheses: [
    {
      id,
      cause,
      classification,
      structuralRelevance,
      supportingIndicators,
      contradictingIndicators,
      requiredVerification,
      potentialConsequences,
      recommendedActions,
      riskRelevance,
      capexRelevance,
      valuationRelevance
    }
  ]
}
```

Empty contract:

```js
{
  domain: "structural-systems",
  hypotheses: []
}
```

Hypothesis structure requirements:

- `id`: stable kebab-case ID.
- `cause`: cautious possible cause or mechanism.
- `classification`: hypothesis or assessment-required wording, never confirmed diagnosis.
- `structuralRelevance`: likely `medium`, `high`, or `very high`, but only when evidence supports it.
- `supportingIndicators`: concrete observable or documentary signals.
- `contradictingIndicators`: missing/negative evidence or alternative explanations.
- `requiredVerification`: must include structural review, survey, monitoring, drawings, intrusive investigation, or testing when appropriate.
- `potentialConsequences`: possible consequences, not deterministic outcomes.
- `recommendedActions`: verification-oriented actions.
- `riskRelevance`, `capexRelevance`, `valuationRelevance`: qualitative relevance only.

Severity and confidence:

- Existing public contract has `confidence` but no explicit public `severity` field in the mapper contract.
- If severity is needed, it should remain internal or be represented through existing classification/risk fields unless a separate architecture decision changes the public contract.
- No public API change should be introduced for Structural Systems in Foundation 1.x.

## 20. Mapper and Public Contract Boundary

Recommended initial implementation path:

- Use `KnowledgeReasoningMapper.map(...)` for the first Structural Systems slice.
- Keep provider hypotheses compatible with mapper expectations.
- Do not introduce a new mapper, registry, or public API.

Public contract remains:

```text
primaryHypothesis
alternativeHypotheses
supportingEvidence
missingEvidence
requiredVerification
potentialConsequences
confidence
```

Boundary rules:

- Provider may define structural hypotheses and verification requirements.
- Mapper produces the public reasoning contract.
- Engine returns one contract.
- No secondary domain aggregation.
- No public `domainTrace` or `candidateDomains` field.
- No public `severity` field unless a later architecture decision changes the contract.

If the generic mapper is insufficient later, that should be a separate technical decision. It is not required for the initial Structural Systems implementation.

## 21. Language Strategy

Current language infrastructure:

- `ExpertIntelligenceLanguage` supports `en` and `de`.
- Terminology registry currently registers `windows-doors`, `sanitary-systems`, and `electrical-systems`.
- Bilingual resources currently exist for `windows-doors`, `sanitary-systems`, and `electrical-systems`.
- Terminology adapters and reasoning coordinators currently exist for those same three domains.

Options:

1. Initially English/provider-native only.
2. Direct bilingual implementation with terminology adapter, coordinator, and resource files.
3. Staged approach: English/provider-native first, bilingual resources after domain behavior stabilizes.

Recommendation:

Use staged introduction.

Initial Structural Systems implementation should be English/provider-native through the generic mapper. Do not create terminology adapter, coordinator, or bilingual resources in the first slice unless the release scope explicitly requires German output.

Reason:

- Structural Systems has high fachliche risk and should first stabilize domain boundaries, precedence, guardrails, and tests.
- Existing non-bilingual domains already operate provider-native.
- Adding bilingual resources at the same time would increase scope and risk without changing core domain governance.

Future bilingual step:

- Add `structural-systems` terminology registry entries.
- Add `StructuralSystemsTerminologyAdapter.js` only if German/mixed-language routing requires terminology-driven routing.
- Add bilingual resources and renderer path only after provider IDs and hypothesis classes are stable.

## 22. Test Strategy

### Provider Tests

Required future file:

```text
tests/structural-systems-knowledge-provider-test.js
```

Required cases:

- Domain ID is `structural-systems`.
- Empty input returns stable empty contract.
- Strong signal routes/provider returns hypotheses: load-bearing wall, beam deflection, settlement, removed load-bearing wall, roof truss damage.
- Weak signals alone do not create hypotheses: crack, damp, corrosion, uneven, movement.
- Hypotheses remain `status: "hypothesis"` after mapping.
- Required verification is present for every hypothesis.
- No cause or classification presents a confirmed diagnosis.
- Guardrail language avoids safety/capacity confirmation.
- Deterministic output.
- Input immutability.

### Router Tests

Required future additions to `tests/knowledge-domain-router-test.js`:

- Structural-only routing.
- Structural plus crack.
- Structural plus concrete-corrosion.
- Structural plus basement-waterproofing.
- Structural plus facade-wall-systems.
- Structural plus moisture.
- Structural plus balconies-terraces.
- Structural plus roof-envelope.
- Negative cosmetic crack case remains `crack`.
- Negative moisture case remains `moisture` or existing specific domain.
- Negative concrete corrosion case remains `concrete-corrosion`.
- Negative facade surface case remains `facade-wall-systems`.
- Negative balcony waterproofing case remains `balconies-terraces`.
- Stable precedence test updated to include `structural-systems` in the recommended position.

### Integration Tests

Required future file:

```text
tests/structural-systems-reasoning-integration-test.js
```

Required cases:

- First-success: structural wins when strong structural indicators overlap with crack.
- First-success: structural wins when structural deformation overlaps with concrete corrosion.
- First-success: basement waterproofing remains owner for seepage without structural movement.
- Mapping: public contract has stable keys and no new public fields.
- Public contract: one contract only, no aggregation.
- Legacy fallback remains unchanged for non-routing inputs.
- Existing crack, concrete, moisture, facade, roof, basement, and balcony behavior remains unchanged for negative cases.

### Regression Tests

Required regression expectations:

- Existing Crack cases remain Crack unless strong structural indicators are present.
- Existing Concrete Corrosion cases remain unchanged without structural relevance evidence.
- Moisture findings are not overclassified as structural.
- Cosmetic cracks do not trigger Structural Systems.
- Facade surface defects do not trigger Structural Systems.
- Roof waterproofing defects do not trigger Structural Systems.
- Balcony waterproofing defects do not trigger Structural Systems.

Existing tests that define nearby behavior:

- `tests/crack-knowledge-provider-test.js`
- `tests/crack-reasoning-integration-test.js`
- `tests/concrete-corrosion-knowledge-provider-test.js`
- `tests/concrete-corrosion-reasoning-integration-test.js`
- `tests/basement-waterproofing-knowledge-provider-test.js`
- `tests/basement-waterproofing-reasoning-integration-test.js`
- `tests/facade-wall-systems-knowledge-provider-test.js`
- `tests/facade-wall-systems-reasoning-integration-test.js`
- `tests/moisture-knowledge-provider-test.js`
- `tests/moisture-reasoning-integration-test.js`
- `tests/balconies-terraces-knowledge-provider-test.js`
- `tests/balconies-terraces-reasoning-integration-test.js`
- `tests/roof-envelope-knowledge-provider-test.js`
- `tests/roof-envelope-reasoning-integration-test.js`
- `tests/knowledge-domain-router-test.js`
- `tests/expert-reasoning-engine-test.js`

## 23. Expected Implementation Files

Expected new files for a later implementation:

```text
portal/core/knowledge/StructuralSystemsKnowledgeProvider.js
tests/structural-systems-knowledge-provider-test.js
tests/structural-systems-reasoning-integration-test.js
```

Expected existing files requiring minimal later edits:

```text
portal/core/reasoning/KnowledgeDomainRouter.js
portal/core/ExpertReasoningEngine.js
tests/knowledge-domain-router-test.js
tests/expert-reasoning-engine-test.js
```

Possible later language files, not for the first slice unless explicitly scoped:

```text
portal/core/reasoning/adapters/StructuralSystemsTerminologyAdapter.js
portal/core/reasoning/adapters/StructuralSystemsReasoningCoordinator.js
portal/core/reasoning/resources/structuralSystemsBilingualResources.js
```

Possible existing language registry files for later bilingual work:

```text
portal/core/reasoning/ExpertIntelligenceTerminologyRegistry.js
portal/core/reasoning/ExpertIntelligenceBilingualResources.js
```

No implementation is performed in this blueprint.

## 24. Explicit Non-Scope

The following are explicitly out of scope for Structural Systems Blueprint 1.0 and the first implementation slice:

- Multi-domain aggregation.
- Engine registry refactoring.
- Dispatch table refactoring.
- CAPEX model.
- Remaining Useful Life model.
- Full structural calculation.
- Digital structural models.
- BIM integration.
- Automatic structural safety approval.
- Structural Health Monitoring platform.
- Machine-learning diagnosis.
- New public APIs.
- New public result fields.
- Legal certification.
- Go/No-Go decision.
- Purchase recommendation.
- Final professional structural opinion.
- Automatic verification of load-bearing capacity.

## 25. Open Decisions

P1 decisions before implementation:

1. Confirm precedence position.

Recommended: insert `structural-systems` before `concrete-corrosion` with strict routing gates.

2. Confirm first implementation language scope.

Recommended: English/provider-native first; bilingual resources later.

3. Confirm whether the first slice uses the generic mapper.

Recommended: yes, use `KnowledgeReasoningMapper.map(...)` first.

4. Confirm minimum structural routing threshold.

Recommended: strong signal alone or medium signal plus structural element/measurement/documentation/progression. Weak signals alone must not route.

5. Confirm whether any public severity field is out of scope.

Recommended: out of scope for Foundation 1.x; use existing classification/risk fields.

P2 decisions later:

1. Whether to add bilingual Structural Systems terminology resources.
2. Whether to add internal candidate-domain trace diagnostics outside the public contract.
3. Whether to refactor engine dispatch after additional domains are added.

## 26. Blockers

P0:

- None confirmed.

P1:

- Precedence position must be approved before implementation.
- Structural routing threshold must be approved before implementation.
- Guardrail language must be accepted before implementation.
- Test strategy must include negative cases protecting existing Crack, Concrete Corrosion, Basement Waterproofing, Facade Wall Systems, Moisture, Balconies/Terraces, and Roof Envelope behavior.

P2:

- Bilingual strategy can be staged after the English/provider-native slice.
- Engine dispatch maintainability can remain future technical debt.
- Explicit first-success governance tests may be expanded when `structural-systems` is implemented.

INFO:

- Foundation 1.x remains single-provider / first-success.
- No aggregation is planned.
- Public contract remains unchanged.
- `structural-systems` is a high-risk fachliche domain and must stay verification-oriented.

## 27. Final Recommendation

Implementation can be prepared, but should not begin until the P1 decisions are accepted.

Recommended implementation approach:

1. Use canonical Domain ID `structural-systems`.
2. Insert it before `concrete-corrosion` in `DOMAIN_PRECEDENCE` during implementation.
3. Define strict router gates: strong structural signals or medium-signal combinations only; weak signals never route alone.
4. Use a provider compatible with `KnowledgeReasoningMapper.map(...)`.
5. Keep the public contract unchanged.
6. Keep Foundation 1.x single-provider / first-success behavior.
7. Do not add bilingual infrastructure in the first slice unless explicitly scoped.
8. Write provider, router, integration, and regression tests before or together with implementation.
9. Preserve existing domain boundaries and prove this with negative tests.

Final architectural statement:

`structural-systems` should be a precise structural due-diligence domain for possible load-bearing, stability, deformation, settlement, alteration, connection, material-loss, fire, or water-related structural hypotheses. It must not replace `crack`, `concrete-corrosion`, `basement-waterproofing`, `facade-wall-systems`, `moisture`, `balconies-terraces`, or `roof-envelope` for ordinary non-structural defects.
