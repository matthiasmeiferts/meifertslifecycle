import assert from "node:assert/strict";

import KnowledgeDomainRouter from "../portal/core/reasoning/KnowledgeDomainRouter.js";

function runTest(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
    } catch (error) {
        console.error(`✗ ${name}`);
        throw error;
    }
}

runTest(
    "facade-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "external wall render",
                description: "coating deterioration on facade"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems"]);
    }
);

runTest(
    "balconies-terraces-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "balcony workmanship defect"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces"]);
    }
);

runTest(
    "balcony threshold leakage overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony door threshold",
                description: "leaking balcony door threshold with rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "terrace waterproofing plus roof-envelope and moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "terrace",
                location: "roof terrace",
                description: "terrace waterproofing leakage with rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "roof-envelope", "moisture"]);
    }
);

runTest(
    "balcony concrete spalling overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony edge",
                description: "balcony edge spalling with exposed reinforcement and rust"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "balconies-terraces"]);
    }
);

runTest(
    "balcony wall connection plus facade overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony wall connection",
                description: "balcony wall connection moisture and staining at facade junction"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "basement terrace overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "sunken terrace",
                description: "basement terrace leakage with dampness"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "balconies-terraces", "moisture"]);
    }
);

runTest(
    "balcony thermal-bridge routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony connection",
                description: "thermal bridge at balcony connection"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces"]);
    }
);

runTest(
    "no false routing for internal tiles",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "tile",
                location: "internal floor",
                description: "interior floor tiles cracked"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for generic railing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "railing",
                location: "handrail",
                description: "generic railing corrosion"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for roof-only drainage",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof drain",
                description: "roof drainage outlet blockage"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for generic frost damage",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "external surface",
                description: "generic frost damage"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "no false routing for generic standing water",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "courtyard",
                description: "generic standing water"
            }
        });

        assert.equal(domains.includes("balconies-terraces"), false);
    }
);

runTest(
    "rendered facade plus crack",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "rendered external wall",
                description: "cracked render on facade"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems", "crack"]);
    }
);

runTest(
    "facade moisture plus roof-envelope plus moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "facade sealant joint",
                description: "damp facade with failed sealant joint and rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "ETICS window connection overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "ETICS window connection",
                description: "ETICS moisture near window flashing with ingress"
            },
            building: {
                insulationSystem: "ETICS"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "facade-wall-systems", "roof-envelope", "moisture"]);
    }
);

runTest(
    "basement plinth overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement plinth external wall",
                description: "facade moisture and seepage at plinth"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "facade-wall-systems", "moisture"]);
    }
);

runTest(
    "concrete facade spalling overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "reinforced concrete facade",
                description: "spalling facade finish with exposed reinforcement and rust"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "facade-wall-systems"]);
    }
);

runTest(
    "algae facade without automatic moisture domain",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "facade",
                location: "north facade",
                description: "algae on facade surface"
            }
        });

        assert.deepStrictEqual(domains, ["facade-wall-systems"]);
    }
);

runTest(
    "no false routing for internal plaster",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "internal wall",
                location: "living room",
                description: "internal wall plaster cracking"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "no false routing for internal wall crack",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "internal wall",
                description: "generic wall crack in bedroom"
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "no false routing for roof cladding",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof cladding",
                description: "roof cladding weathering"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "no false routing for generic algae",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "surface",
                location: "garden element",
                description: "algae growth visible"
            }
        });

        assert.equal(domains.includes("facade-wall-systems"), false);
    }
);

runTest(
    "concrete-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "concrete",
                location: "concrete beam",
                description: "durability concern in reinforced concrete"
            },
            building: {
                constructionType: "reinforced concrete"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion"]);
    }
);

runTest(
    "crack-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "window opening",
                description: "diagonal crack from corner"
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
    }
);

runTest(
    "moisture-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "surface dampness"
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "windows-doors-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "window",
                location: "window frame",
                description: "defective perimeter seal at frame edge"
            },
            building: {
                windowType: "casement"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "windows-doors German terminology routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "Fenster",
                location: "Fensterrahmen",
                description: "undichte Dichtung mit Zugluft am Rahmen"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "windows-doors German ASCII terminology routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "Aussentuer",
                location: "Schwelle",
                description: "beschaedigte Tuerdichtung mit Zugluft"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "windows-doors mixed-language routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "window",
                location: "Rahmen",
                description: "undichte seal with draught"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "hvac-systems heating routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "HVAC",
                location: "radiator",
                description: "radiator remains cold and heating pressure low"
            }
        });

        assert.deepStrictEqual(domains, ["hvac-systems"]);
    }
);

runTest(
    "hvac-systems ventilation routing with existing moisture overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "ventilation",
                location: "ventilation unit",
                description: "mechanical ventilation weak airflow and clogged ventilation filter"
            }
        });

        assert.deepStrictEqual(domains, ["hvac-systems", "moisture"]);
    }
);

runTest(
    "hvac-systems cooling and condensate routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "cooling",
                location: "indoor unit",
                description: "air-conditioning unit leaking water with blocked condensate drain"
            }
        });

        assert.deepStrictEqual(domains, ["hvac-systems", "moisture"]);
    }
);

runTest(
    "electrical-systems distribution board overheating routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "distribution board",
                description: "distribution board has overheating marks and scorching near circuit breaker"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems panel missing cover routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "electrical panel",
                description: "electrical panel missing cover with open enclosure"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems exposed conductor routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "junction box",
                description: "junction box has exposed conductor and bare wire visible"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems damaged socket routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "socket outlet",
                description: "damaged socket with loose socket component"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems damaged switch routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "switch",
                description: "damaged switch with loose switch component"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems temporary wiring routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical installation",
                location: "service corridor",
                description: "temporary wiring and poorly supported cable at electrical installation"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems unclear circuit labeling routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "consumer unit",
                description: "unclear circuit labeling and missing labeling at circuit breaker"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "electrical-systems corrosion and moisture overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "electrical panel",
                description: "corrosion at electrical panel with moisture nearby and staining"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems", "moisture"]);
    }
);

runTest(
    "electrical-systems grounding and bonding routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "plant room",
                description: "defective grounding conductor and loose bonding conductor"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
    }
);

runTest(
    "fire-protection-systems portable equipment routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "extinguisher cabinet",
                description: "Damaged fire extinguisher and obstructed extinguisher cabinet with missing extinguisher sign"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems"]);
    }
);

runTest(
    "fire-protection-systems sprinkler leakage with moisture overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "corridor sprinkler head",
                description: "Painted sprinkler head with displaced sprinkler head and leaking sprinkler pipe"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems", "moisture"]);
    }
);

runTest(
    "fire-protection-systems detection and alarm routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "fire alarm panel",
                description: "Damaged smoke detector and manual call point missing cover near fire alarm panel"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems"]);
    }
);

runTest(
    "fire-protection-systems fire door routing precedes windows-doors overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "stairwell fire door frame",
                description: "Damaged fire door with damaged closer, damaged fire door seal, and door frame hardware issue"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems", "windows-doors"]);
    }
);

runTest(
    "fire-protection-systems escape route routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "escape route",
                description: "Blocked escape route with missing exit sign and damaged emergency lighting"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems"]);
    }
);

runTest(
    "fire-protection-systems compartmentation routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "fire compartment wall",
                description: "Unsealed penetration and missing penetration seal at fire compartment wall"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems"]);
    }
);

runTest(
    "fire-protection-systems fire damper routing does not require HVAC aggregation",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "duct riser",
                description: "Damaged fire damper with obstructed access and loose fire damper component"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems"]);
    }
);

runTest(
    "metadata-only fire protection routing is ignored",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            building: {
                fireProtectionSystemType: "sprinkler and fire alarm system",
                fireAlarmSystemType: "addressable"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "fire insurance and fire brigade text does not route to fire-protection-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "document",
                location: "tenant file",
                description: "Fire insurance and fire brigade contact information without visible fire protection component defect"
            }
        });

        assert.equal(domains.includes("fire-protection-systems"), false);
    }
);

runTest(
    "fire certification text does not route to fire-protection-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "document",
                location: "maintenance record",
                description: "Functional certification, maintenance validity, and code compliance text without observed condition"
            }
        });

        assert.equal(domains.includes("fire-protection-systems"), false);
    }
);

runTest(
    "harmless fire protection component mention without issue does not route",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "corridor",
                description: "Fire extinguisher and sprinkler head visible in corridor"
            }
        });

        assert.equal(domains.includes("fire-protection-systems"), false);
    }
);

runTest(
    "fireplace text does not route to fire-protection-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "interior",
                location: "living room",
                description: "Domestic stove and fireplace product catalogue without defect"
            }
        });

        assert.equal(domains.includes("fire-protection-systems"), false);
    }
);

runTest(
    "vertical-transportation-systems elevator routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "elevator landing door",
                description: "Damaged elevator landing door with damaged door sill and uneven alignment"
            }
        });

        assert.deepStrictEqual(domains, ["vertical-transportation-systems"]);
    }
);

runTest(
    "vertical-transportation-systems escalator routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "escalator",
                description: "Escalator step damaged with escalator comb plate damaged and damaged escalator handrail"
            }
        });

        assert.deepStrictEqual(domains, ["vertical-transportation-systems"]);
    }
);

runTest(
    "vertical-transportation-systems platform lift routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "platform lift",
                description: "Platform lift damaged with wheelchair lift missing cover and loose component"
            }
        });

        assert.deepStrictEqual(domains, ["vertical-transportation-systems"]);
    }
);

runTest(
    "vertical-transportation elevator door overlap precedes windows-doors",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "elevator landing door frame",
                description: "Damaged elevator landing door with damaged door sill and door frame hardware issue"
            }
        });

        assert.deepStrictEqual(domains, ["vertical-transportation-systems", "windows-doors"]);
    }
);

runTest(
    "vertical-transportation call button does not route to electrical-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "landing call button",
                description: "Landing call button damaged and floor indicator damaged at elevator landing"
            }
        });

        assert.deepStrictEqual(domains, ["vertical-transportation-systems"]);
    }
);

runTest(
    "vertical-transportation hydraulic leakage does not route to sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "lift machinery",
                description: "Hydraulic oil leakage and staining at lift pit near lift machinery"
            }
        });

        assert.deepStrictEqual(domains, ["vertical-transportation-systems", "moisture"]);
        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "vertical-transportation fire lift wording with explicit fire evidence preserves fire precedence",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "fire protection",
                location: "fire door at lift lobby",
                description: "Damaged fire door at lift lobby beside elevator landing door"
            }
        });

        assert.deepStrictEqual(domains, ["fire-protection-systems", "vertical-transportation-systems"]);
    }
);

runTest(
    "fire-service lift wording alone does not route without observable condition",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "vertical transportation",
                location: "lift lobby",
                description: "Fire-service lift and smoke-control lift noted in building description"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "ordinary door does not route to vertical-transportation-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "internal landing door",
                description: "Damaged internal landing door with loose hinge"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "ordinary electrical switch remains electrical only",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "switch",
                description: "damaged switch with loose switch component"
            }
        });

        assert.deepStrictEqual(domains, ["electrical-systems"]);
        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "ordinary sanitary leakage remains sanitary",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "wash basin trap",
                description: "visible leakage at wash basin trap with dripping from sanitary fitting"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems", "moisture"]);
        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "general floor reference does not route to vertical-transportation-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "building",
                location: "third floor",
                description: "Floor level and landing area described without elevator lift escalator or moving walkway condition"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "non-building lifting equipment does not route to vertical-transportation-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "site equipment",
                location: "yard",
                description: "Construction crane, forklift, vehicle lift, car jack, and warehouse lifting equipment noted"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "vertical transportation advertisements and product descriptions do not route",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "marketing",
                location: "brochure",
                description: "Lift advertisement and manufacturer brochure with model name only"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "vertical transportation records without observed condition do not route",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "document",
                location: "maintenance file",
                description: "Maintenance schedule and inspection record for elevator without observed condition"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "ordinary stair handrail does not route to vertical-transportation-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "stairs",
                location: "stairwell",
                description: "Ordinary stair handrail damaged without stair lift or escalator evidence"
            }
        });

        assert.equal(domains.includes("vertical-transportation-systems"), false);
    }
);

runTest(
    "metadata-only vertical transportation routing is ignored",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            building: {
                verticalTransportationSystemType: "passenger elevator",
                elevatorType: "traction"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "metadata-only electrical routing is ignored",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            building: {
                electricalSystemType: "low-voltage electrical installation",
                distributionBoardType: "consumer unit"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "electricity bill does not route to electrical-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "document",
                location: "tenant file",
                description: "electricity bill and electricity consumption record reviewed"
            }
        });

        assert.equal(domains.includes("electrical-systems"), false);
    }
);

runTest(
    "electric vehicle does not route to electrical-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "parking",
                location: "car park",
                description: "electric vehicle parking bay noted without building electrical defect"
            }
        });

        assert.equal(domains.includes("electrical-systems"), false);
    }
);

runTest(
    "computer network cable does not route to electrical-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "IT",
                location: "office",
                description: "computer cable and network cable visible at workstation"
            }
        });

        assert.equal(domains.includes("electrical-systems"), false);
    }
);

runTest(
    "harmless electrical component mention without issue does not route",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "electrical",
                location: "distribution board",
                description: "distribution board accessible in service room"
            }
        });

        assert.equal(domains.includes("electrical-systems"), false);
    }
);

runTest(
    "unrelated text does not route to electrical-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "interior",
                location: "living room",
                description: "paint finish discoloration at internal wall"
            }
        });

        assert.equal(domains.includes("electrical-systems"), false);
    }
);

runTest(
    "metadata-only HVAC routing is ignored",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            building: {
                heatingSystemType: "radiator heating",
                ventilationSystemType: "mechanical ventilation",
                coolingSystemType: "split air-conditioning"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "unrelated text does not route to hvac-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "inspection",
                location: "living room",
                description: "room feels warm during hot weather"
            }
        });

        assert.equal(domains.includes("hvac-systems"), false);
    }
);

runTest(
    "window leakage plus roof-envelope plus moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "window sill and reveal",
                description: "water penetration at window connection with flashing issue",
                observations: ["rain-related ingress"]
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "basement window leakage overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement window",
                description: "water penetration at window connection and flashing",
                observations: ["seepage at reveal"]
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "windows-doors", "roof-envelope", "moisture"]);
    }
);

runTest(
    "window condensation plus moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "window glazing",
                description: "condensation on glazing",
                observations: ["surface moisture"]
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "moisture"]);
    }
);

runTest(
    "crack adjacent to window opening without connection relevance",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "wall near window opening",
                description: "diagonal crack in plaster adjacent to opening",
                observations: ["widening line"]
            }
        });

        assert.deepStrictEqual(domains, ["crack"]);
    }
);

runTest(
    "crack adjacent to window opening with connection relevance",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "crack",
                location: "window frame joint",
                description: "crack and leakage at window installation joint",
                observations: ["seal discontinuity"]
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors", "moisture", "crack"]);
    }
);

runTest(
    "exterior door seal defect",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "exterior door threshold",
                description: "defective exterior door seal",
                observations: ["draught at gasket"]
            }
        });

        assert.deepStrictEqual(domains, ["windows-doors"]);
    }
);

runTest(
    "basement-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "inspection",
                location: "basement wall",
                description: "below-grade tanking detail review"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing"]);
    }
);

runTest(
    "basement plus moisture routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement wall",
                description: "dampness and seepage"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture"]);
    }
);

runTest(
    "basement plus crack plus moisture routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "basement wall crack",
                description: "wet crack and seepage at retaining wall"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "moisture", "crack"]);
    }
);

runTest(
    "basement plus concrete-corrosion routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement wall",
                description: "spalling and rust staining"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing"]);
    }
);

runTest(
    "roof-envelope category also routes moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof penetration",
                description: "failed flashing detail"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
    }
);

runTest(
    "no false routing for roof-only findings",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof penetration",
                description: "water ingress near flashing"
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
        assert.equal(domains.includes("basement-waterproofing"), false);
    }
);

runTest(
    "no false routing for generic indoor moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "interior wall",
                description: "condensation near cold corner"
            },
            building: {
                constructionType: "apartment"
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "no false routing for cabinet door",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "kitchen cabinet door",
                description: "cabinet door hinge loose"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "no false routing for lift door",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "door",
                location: "lift door",
                description: "lift door panel misalignment"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "no false routing for roof-only flashing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof-envelope",
                location: "roof flashing",
                description: "defective roof flashing with rain ingress"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
        assert.equal(domains.includes("windows-doors"), false);
    }
);

runTest(
    "overlapping crack and concrete routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "concrete slab",
                description: "spalling with crack and rust staining"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "crack"]);
    }
);

runTest(
    "overlapping moisture and roof-envelope routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "water ingress near flashing"
            }
        });

        assert.deepStrictEqual(domains, ["roof-envelope", "moisture"]);
    }
);

runTest(
    "sanitary-systems visible leakage routing with moisture overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "wash basin trap",
                description: "visible leakage at wash basin trap with dripping from sanitary fitting"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems", "moisture"]);
    }
);

runTest(
    "sanitary-systems water supply pipe corrosion routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "water supply pipe",
                description: "corrosion and staining at water supply pipe fitting"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems", "moisture"]);
    }
);

runTest(
    "sanitary-systems damaged fixture routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary fixture",
                location: "toilet",
                description: "damaged toilet and loose fixture at connection"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems blocked drain routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "blocked drain with slow drainage at floor drain"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems", "moisture"]);
    }
);

runTest(
    "sanitary-systems unpleasant odour routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "unpleasant odour at floor drain and trap odour near shower"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems missing seal routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "toilet connection",
                description: "missing seal and damaged seal at toilet connection"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems backflow indication routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "floor drain",
                description: "backflow indication at floor drain with reverse flow"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems pipe support routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "drain pipe",
                description: "unsupported pipe with poor support and damaged pipe insulation"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems German leakage routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "Sanitärinstallation",
                location: "Waschtisch Siphon",
                description: "sichtbar undicht und tropfend am Anschluss"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems mixed-language seal routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "WC Anschluss",
                description: "fehlende Dichtung and damaged seal"
            }
        });

        assert.deepStrictEqual(domains, ["sanitary-systems"]);
    }
);

runTest(
    "sanitary-systems generic German component terms without issue do not route",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "Sanitärinstallation",
                location: "Bad",
                description: "Waschtisch, WC und Dusche sichtbar vorhanden ohne Zustandsangabe"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "metadata-only sanitary routing is ignored",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            building: {
                sanitarySystemType: "domestic sanitary installation",
                plumbingSystemType: "mixed pipework"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "drinking water discussion without defect does not route to sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "document",
                location: "meeting note",
                description: "drinking water discussion without defect or observed sanitary component condition"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "water bill does not route to sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "document",
                location: "tenant file",
                description: "water bill and utility bill for water consumption"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "plumbing advertisement does not route to sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "marketing",
                location: "brochure",
                description: "plumbing company advertisement with contractor address information"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "product specification does not route to sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "specification",
                location: "submittal",
                description: "product specification for sink and valve without visible defect"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "harmless sanitary component mention without issue does not route",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "sanitary",
                location: "wash basin",
                description: "wash basin and sink located in bathroom"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "unrelated text does not route to sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "interior",
                location: "living room",
                description: "paint finish discoloration at internal wall"
            }
        });

        assert.equal(domains.includes("sanitary-systems"), false);
    }
);

runTest(
    "existing plumbing moisture routing is not stolen by sanitary-systems",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "moisture",
                location: "Kitchen wall beside sink",
                description: "Localized moisture around pipe chase",
                observations: ["fixture area", "drip pattern"]
            },
            building: {
                constructionType: "apartment",
                basementPresent: false
            }
        });

        assert.deepStrictEqual(domains, ["moisture"]);
    }
);

runTest(
    "stable domain precedence",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement external wall window frame crack wash basin trap electrical panel elevator landing door",
                description: "water ingress with rust staining and spalling facade finish at window joint, flashing, visible leakage at wash basin trap, electrical panel missing cover, damaged fire door, and damaged elevator landing door"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing", "fire-protection-systems", "vertical-transportation-systems", "sanitary-systems", "electrical-systems", "windows-doors", "facade-wall-systems", "roof-envelope", "moisture", "crack"]);
    }
);

runTest(
    "fire-protection-systems output is deterministic and input immutable",
    () => {
        const input = {
            finding: {
                category: "fire protection",
                location: "corridor",
                description: "Damaged fire door, missing exit sign, and unsealed penetration at fire compartment wall",
                observations: ["painted sprinkler head near door"]
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "damaged fire door and missing exit sign",
                    location: "corridor"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), KnowledgeDomainRouter.resolve(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "vertical-transportation-systems output is deterministic and input immutable",
    () => {
        const input = {
            finding: {
                category: "vertical transportation",
                location: "lift landing",
                description: "Damaged elevator landing door, hydraulic oil leakage, and damaged call button",
                observations: ["staining at lift pit"]
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "damaged landing door and damaged call button",
                    location: "lift landing"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), KnowledgeDomainRouter.resolve(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "sanitary-systems output is deterministic and input immutable",
    () => {
        const input = {
            finding: {
                category: "sanitary",
                location: "wash basin trap",
                description: "visible leakage, missing seal, and water staining at wash basin trap",
                observations: ["slow drainage at sink"]
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "moisture around sanitary fitting",
                    location: "wash basin"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), KnowledgeDomainRouter.resolve(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "electrical-systems output is deterministic and input immutable",
    () => {
        const input = {
            finding: {
                category: "electrical",
                location: "distribution board",
                description: "distribution board has overheating marks and missing cover",
                observations: ["unclear circuit labeling"]
            },
            measurements: [
                {
                    type: "visual observation",
                    value: "scorching near circuit breaker",
                    location: "consumer unit"
                }
            ]
        };
        const original = structuredClone(input);

        assert.deepStrictEqual(KnowledgeDomainRouter.resolve(input), KnowledgeDomainRouter.resolve(structuredClone(input)));
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "drainage-rainwater-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "rainwater gutter",
                description: "blocked gutter with debris in gutter"
            }
        });

        assert.deepStrictEqual(domains, ["drainage-rainwater"]);
    }
);

runTest(
    "gutter plus facade and moisture overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "facade gutter",
                description: "leaking gutter wetting facade with moisture staining"
            }
        });

        assert.deepStrictEqual(domains, ["drainage-rainwater", "facade-wall-systems", "moisture"]);
    }
);

runTest(
    "roof outlet plus roof-envelope overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "roof",
                location: "roof outlet",
                description: "blocked roof outlet with ponding near roof outlet"
            }
        });

        assert.deepStrictEqual(domains, ["drainage-rainwater", "roof-envelope"]);
    }
);

runTest(
    "downpipe at basement overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "basement wall",
                description: "defective downpipe discharging rainwater against basement wall"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "drainage-rainwater"]);
    }
);

runTest(
    "balcony outlet overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "balcony",
                location: "balcony outlet",
                description: "blocked balcony outlet with overflow"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "drainage-rainwater"]);
    }
);

runTest(
    "terrace leakage overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "terrace",
                location: "roof terrace outlet",
                description: "terrace drainage leakage into occupied space with moisture staining"
            }
        });

        assert.deepStrictEqual(domains, ["balconies-terraces", "drainage-rainwater", "roof-envelope", "moisture"]);
    }
);

runTest(
    "entrance exposure plus windows-doors",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "site drainage",
                location: "entrance door threshold",
                description: "runoff directed toward entrance and water directed toward building"
            }
        });

        assert.deepStrictEqual(domains, ["drainage-rainwater", "windows-doors"]);
    }
);

runTest(
    "standing water without automatic moisture",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "site drainage",
                location: "external paved area",
                description: "standing water around building"
            }
        });

        assert.deepStrictEqual(domains, ["drainage-rainwater"]);
    }
);

runTest(
    "backwater-only routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "external drain",
                description: "backwater from external building drain"
            }
        });

        assert.deepStrictEqual(domains, ["drainage-rainwater"]);
    }
);

runTest(
    "backwater plus basement overlap",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "basement drain",
                description: "backwater from building drain affecting basement below-grade area"
            },
            building: {
                basementType: "full basement"
            }
        });

        assert.deepStrictEqual(domains, ["basement-waterproofing", "drainage-rainwater"]);
    }
);

runTest(
    "gutter corrosion without concrete-corrosion",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "gutter",
                description: "corroded gutter at rainwater gutter"
            }
        });

        assert.ok(domains.includes("drainage-rainwater"));
        assert.equal(domains.includes("concrete-corrosion"), false);
    }
);

runTest(
    "cracked downpipe without crack-domain routing",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "drainage",
                location: "downpipe",
                description: "cracked rainwater downpipe"
            }
        });

        assert.ok(domains.includes("drainage-rainwater"));
        assert.equal(domains.includes("crack"), false);
    }
);

runTest(
    "drainage false-positive guards",
    () => {
        const cases = [
            ["generic rain", { finding: { category: "inspection", description: "rainfall occurred yesterday" } }],
            ["weather description", { finding: { category: "inspection", description: "stormy weather and wind" } }],
            ["indoor plumbing leak", { finding: { category: "plumbing", description: "indoor plumbing leakage below sink" } }],
            ["sanitary pipe leak", { finding: { category: "plumbing", description: "sanitary pipe leakage in bathroom" } }],
            ["shower drain", { finding: { category: "bathroom", description: "shower drain blockage" } }],
            ["internal floor drain", { finding: { category: "interior", description: "internal floor drain in laundry" } }],
            ["swimming-pool drainage", { finding: { category: "pool", description: "swimming-pool drainage maintenance" } }],
            ["irrigation", { finding: { category: "landscape", description: "landscape irrigation pipe defect" } }],
            ["street drainage", { finding: { category: "street", description: "street drainage blocked outside unrelated road" } }],
            ["generic pipe corrosion", { finding: { category: "pipe", description: "generic pipe corrosion" } }],
            ["generic standing water", { finding: { category: "surface", description: "generic standing water in a bucket" } }],
            ["generic slope", { finding: { category: "site", description: "sloped surface noted" } }],
            ["generic roof leakage", { finding: { category: "roof", description: "generic roof leakage at ceiling" } }],
            ["generic basement moisture", { finding: { category: "basement", description: "basement moisture on internal wall" } }],
            ["generic facade moisture", { finding: { category: "facade", description: "facade moisture without drainage context" } }],
            ["marketing wording", { finding: { category: "marketing", description: "Rain Water Gutter Terrace Courtyard address" } }],
            ["metadata only", { building: { drainageSystem: "rainwater drainage", backwaterProtection: "present" } }]
        ];

        cases.forEach(([label, input]) => {
            assert.equal(KnowledgeDomainRouter.resolve(input).includes("drainage-rainwater"), false, label);
        });
    }
);

runTest(
    "stable drainage precedence",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement balcony outlet facade entrance door threshold crack",
                description: "blocked roof outlet with runoff directed toward entrance, wet facade staining, crack, rust staining, and spalling"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing", "balconies-terraces", "drainage-rainwater", "windows-doors", "facade-wall-systems", "roof-envelope", "moisture", "crack"]);
    }
);

runTest(
    "unknown input",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "inspection"
            }
        });

        assert.deepStrictEqual(domains, []);
    }
);

runTest(
    "deterministic output",
    () => {
        const input = {
            finding: {
                category: "corrosion",
                location: "concrete beam",
                description: "exposed reinforcement and rust staining"
            },
            building: {
                constructionType: "reinforced concrete"
            }
        };

        const result1 = KnowledgeDomainRouter.resolve(input);
        const result2 = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(result1, result2);
    }
);

runTest(
    "immutable input",
    () => {
        const input = {
            finding: {
                category: "moisture",
                location: "roof penetration",
                description: "water ingress"
            },
            building: {
                constructionType: "apartment"
            },
            measurements: [
                {
                    type: "note",
                    value: "staining"
                }
            ]
        };

        const original = structuredClone(input);

        KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "windows-doors terminology completion coverage and guard order",
    () => {
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({ finding: { category: "window", location: "frame", description: "defective perimeter seal and draught" } }), ["windows-doors"]);
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({ finding: { category: "Fenster", location: "Rahmen", description: "undichte Dichtung mit Zugluft am Rahmen" } }), ["windows-doors"]);
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({ finding: { category: "Außentür", location: "Schwelle", description: "undichte Außentürdichtung mit Zugluft" } }), ["windows-doors"]);
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({ finding: { category: "Aussentuer", location: "Schwelle", description: "undichte Aussentuerdichtung mit Zugluft" } }), ["windows-doors"]);
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({ finding: { category: "window", location: "Rahmen", description: "undichte seal with draught" } }), ["windows-doors"]);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { description: "undichte Dichtung mit Zugluft" } }).includes("windows-doors"), false);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { description: "Fensterrahmen ohne Zustandsangabe" } }).includes("windows-doors"), false);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { category: "Tür", description: "Tür beschädigt" } }).includes("windows-doors"), false);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { category: "door", location: "cabinet door", description: "damaged hinge" } }).includes("windows-doors"), false);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { category: "door", location: "lift door", description: "damaged elevator door panel" } }).includes("windows-doors"), false);
        assert.deepStrictEqual(KnowledgeDomainRouter.resolve({ finding: { category: "vertical transportation", location: "elevator door", description: "damaged elevator door panel" } }), ["vertical-transportation-systems"]);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { category: "fire protection", location: "fire door", description: "damaged fire door leaf" } }).includes("windows-doors"), false);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { category: "fire protection", location: "smoke-control door", description: "smoke-control door inspection note" } }).includes("windows-doors"), false);
        assert.equal(KnowledgeDomainRouter.resolve({ finding: { category: "document", description: "fen ster rah men und dicht fragment" } }).includes("windows-doors"), false);
    }
);

runTest(
    "windows-doors terminology routing is deterministic and immutable",
    () => {
        const input = {
            finding: {
                category: "Fenster",
                location: "Rahmen",
                description: "undichte Dichtung mit Zugluft am Rahmen"
            }
        };
        const original = structuredClone(input);
        const first = KnowledgeDomainRouter.resolve(input);
        const second = KnowledgeDomainRouter.resolve(input);

        assert.deepStrictEqual(first, second);
        assert.deepStrictEqual(input, original);
    }
);

runTest(
    "domain precedence remains unchanged for overlapping windows moisture crack concrete input",
    () => {
        const domains = KnowledgeDomainRouter.resolve({
            finding: {
                category: "corrosion",
                location: "reinforced concrete basement window frame crack",
                description: "water ingress with rust staining and spalling at window joint and flashing"
            },
            building: {
                basementType: "full basement",
                constructionType: "reinforced concrete",
                windowType: "fixed"
            }
        });

        assert.deepStrictEqual(domains, ["concrete-corrosion", "basement-waterproofing", "windows-doors", "roof-envelope", "moisture", "crack"]);
    }
);

console.log("KnowledgeDomainRouter tests completed successfully.");
