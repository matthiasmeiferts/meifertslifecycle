import assert from "assert";
import ActionBar from "../portal/ui/components/ActionBar.js";

function createMockElement(tagName) {
    return {
        tagName,
        className: "",
        type: "",
        textContent: "",
        disabled: false,
        title: "",
        dataset: {},
        attributes: {},
        children: [],
        listeners: {},
        setAttribute(name, value) {
            this.attributes[name] = value;
        },
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        addEventListener(eventName, handler) {
            this.listeners[eventName] = handler;
        },
        click() {
            if (typeof this.listeners.click === "function") {
                this.listeners.click({ type: "click" });
            }
        }
    };
}

global.document = {
    createElement: createMockElement
};

let enabledClickCount = 0;
let disabledClickCount = 0;

const bar = ActionBar.create([
    {
        id: "enabled-action",
        label: "Enabled",
        onClick: () => {
            enabledClickCount += 1;
        }
    },
    {
        id: "disabled-action",
        label: "Disabled",
        disabled: true,
        title: "Blocked by governance.",
        onClick: () => {
            disabledClickCount += 1;
        }
    },
    {
        id: "secondary-action",
        label: "Secondary",
        variant: "secondary"
    },
    {
        id: "aria-action",
        label: "Accessible",
        ariaLabel: "Accessible action"
    }
]);

assert.strictEqual(bar.className, "action-bar");
assert.strictEqual(bar.children.length, 4);

const enabledButton = bar.children[0];
assert.strictEqual(enabledButton.dataset.action, "enabled-action");
assert.strictEqual(enabledButton.className, "button");
assert.strictEqual(enabledButton.disabled, false);
enabledButton.click();
assert.strictEqual(enabledClickCount, 1);

const disabledButton = bar.children[1];
assert.strictEqual(disabledButton.dataset.action, "disabled-action");
assert.strictEqual(disabledButton.className, "button secondary");
assert.strictEqual(disabledButton.disabled, true);
assert.strictEqual(disabledButton.title, "Blocked by governance.");
assert.strictEqual(disabledButton.attributes["aria-disabled"], "true");
disabledButton.click();
assert.strictEqual(disabledClickCount, 0);

const secondaryButton = bar.children[2];
assert.strictEqual(secondaryButton.className, "button secondary");

const ariaButton = bar.children[3];
assert.strictEqual(ariaButton.attributes["aria-label"], "Accessible action");

console.log("ActionBar governance capability tests passed.");
