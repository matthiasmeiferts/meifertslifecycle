import assert from "node:assert/strict";
import ReportContentDigest from "../portal/core/reporting/ReportContentDigest.js";

let groups = 0;

function group(name, callback) {
    callback();
    groups += 1;
    console.log(`PASS: ${name}`);
}

group("creates deterministic lowercase SHA-256 digests", () => {
    const report = { beta: [true, null, 3], alpha: "value" };
    const first = ReportContentDigest.create(report);
    const second = ReportContentDigest.create(structuredClone(report));

    assert.match(first, /^[0-9a-f]{64}$/);
    assert.equal(first, "903d98529979e3c8fd4c92c3dfbde86a2026df5956cb281a0cc38976eb1b349f");
    assert.equal(second, first);
    assert.equal(ReportContentDigest.create({ alpha: "value", beta: [true, null, 3] }), first);
});

group("binds nested values array order and complete future content", () => {
    const base = { section: { values: [1, 2, { state: "current" }] } };

    assert.notEqual(
        ReportContentDigest.create(base),
        ReportContentDigest.create({ section: { values: [2, 1, { state: "current" }] } })
    );
    assert.notEqual(
        ReportContentDigest.create(base),
        ReportContentDigest.create({ section: { values: [1, 2, { state: "changed" }] } })
    );
    assert.notEqual(
        ReportContentDigest.create(base),
        ReportContentDigest.create({ ...base, futureReleasedSection: { version: "2.0" } })
    );
});

group("distinguishes negative zero from positive zero", () => {
    assert.notEqual(
        ReportContentDigest.create({ value: -0 }),
        ReportContentDigest.create({ value: 0 })
    );
});

group("includes prototype-named own properties safely", () => {
    const first = JSON.parse('{"__proto__":{"state":"one"},"constructor":"safe","prototype":null}');
    const second = JSON.parse('{"__proto__":{"state":"two"},"constructor":"safe","prototype":null}');

    assert.notEqual(ReportContentDigest.create(first), ReportContentDigest.create(second));
    assert.equal(Object.prototype.state, undefined);
});

group("ignores inherited and non-enumerable properties", () => {
    const first = { value: "same" };
    const second = { value: "same" };
    Object.defineProperty(first, "hidden", { enumerable: false, value: "ignored" });
    Object.prototype.inheritedDigestProbe = "ignored";

    try {
        assert.equal(ReportContentDigest.create(first), ReportContentDigest.create(second));
    } finally {
        delete Object.prototype.inheritedDigestProbe;
    }
});

group("does not mutate or freeze supported input", () => {
    const report = { section: { values: [1, -0, null] } };
    const before = structuredClone(report);

    ReportContentDigest.create(report);

    assert.deepEqual(report, before);
    assert.equal(Object.isFrozen(report), false);
    assert.equal(Object.isFrozen(report.section), false);
    assert.equal(Object.isFrozen(report.section.values), false);
    assert.equal(Object.is(report.section.values[1], -0), true);
});

group("rejects cycles accessors sparse arrays and unsupported values deterministically", () => {
    const cyclic = {};
    cyclic.self = cyclic;
    const accessor = {};
    Object.defineProperty(accessor, "value", { enumerable: true, get: () => "unsafe" });

    [
        cyclic,
        accessor,
        { value: undefined },
        { value: NaN },
        { value: Infinity },
        { value: 1n },
        { value: Symbol("unsupported") },
        { value: () => null },
        Array(1),
        new Date("2026-07-22T00:00:00.000Z")
    ].forEach((value) => {
        assert.throws(
            () => ReportContentDigest.create(value),
            (error) => error instanceof Error
                && error.name === "Error"
                && error.message === "REPORT_CONTENT_DIGEST_UNSUPPORTED"
        );
    });
});

group("rejects root nested throwing and revoked proxies through one stable boundary", () => {
    const trapMessages = [
        "OWN_KEYS_TRAP",
        "GET_PROTOTYPE_TRAP",
        "GET_DESCRIPTOR_TRAP",
        "PROPERTY_ACCESS_TRAP"
    ];
    const proxies = [
        new Proxy({}, {}),
        new Proxy({}, { ownKeys() { throw new RangeError(trapMessages[0]); } }),
        new Proxy({}, { getPrototypeOf() { throw new RangeError(trapMessages[1]); } }),
        new Proxy({}, { getOwnPropertyDescriptor() { throw new RangeError(trapMessages[2]); } }),
        new Proxy({}, { get() { throw new RangeError(trapMessages[3]); } })
    ];
    const revoked = Proxy.revocable({}, {});
    revoked.revoke();
    proxies.push(revoked.proxy);

    const surrounding = {
        untouched: { value: "preserved" },
        nestedObject: proxies[0],
        nestedArray: [proxies[1]],
        deeplyNestedRevoked: { level: [{ value: revoked.proxy }] }
    };

    const cases = [
        ...proxies,
        { nested: proxies[0] },
        [proxies[1]],
        surrounding
    ];

    cases.forEach((value) => {
        for (let attempt = 0; attempt < 2; attempt += 1) {
            assert.throws(
                () => ReportContentDigest.create(value),
                (error) => error instanceof Error
                    && error.name === "Error"
                    && error.message === "REPORT_CONTENT_DIGEST_UNSUPPORTED"
                    && trapMessages.every((message) => !error.message.includes(message))
                    && !error.message.includes("revoked")
            );
        }
    });

    assert.deepEqual(surrounding.untouched, { value: "preserved" });
    assert.equal(Object.isFrozen(surrounding), false);
    assert.equal(Object.isFrozen(surrounding.untouched), false);
});

assert.equal(groups, 8);
console.log(`Report Content Digest tests completed: ${groups} groups passed.`);
