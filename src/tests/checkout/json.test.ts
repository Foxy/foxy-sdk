import type { APIJson } from "../../checkout/types";

import { cloneApiJson, toMutable } from "../../checkout/utils/json";

// Both helpers are thin wrappers around structuredClone. The tests below pin
// the two properties the rest of the SDK relies on: the copy is deep (so a
// caller handed a "mutable" copy can never write through to the API's own
// state), and the clone is *not* a JSON round-trip (Date survives, functions
// throw).

describe("Checkout JSON helpers", () => {
  it("deep-clones API JSON so mutations do not leak back into the source", () => {
    const json = {
      session: { id: "session-id" },
      items: [{ name: "item", quantity: 1 }],
    } as unknown as APIJson;

    const clone = cloneApiJson(json);

    expect(clone).toEqual(json);
    expect(clone).not.toBe(json);
    expect(clone.items).not.toBe(json.items);
    expect(clone.items[0]).not.toBe(json.items[0]);

    clone.items[0].quantity = 99;
    clone.session.id = "other-session-id";

    expect(json.items[0].quantity).toBe(1);
    expect(json.session.id).toBe("session-id");
  });

  it("deep-clones arbitrary values with toMutable", () => {
    const value = { nested: { list: [1, 2, 3] } };
    const clone = toMutable(value);

    expect(clone).toEqual(value);
    expect(clone.nested).not.toBe(value.nested);
    expect(clone.nested.list).not.toBe(value.nested.list);

    clone.nested.list.push(4);

    expect(value.nested.list).toEqual([1, 2, 3]);
  });

  it("preserves structured types rather than JSON-serialising them", () => {
    const date = new Date("2020-01-02T03:04:05.000Z");
    const clone = toMutable({ date, map: new Map([["a", 1]]) });

    expect(clone.date).toBeInstanceOf(Date);
    expect(clone.date.toISOString()).toBe("2020-01-02T03:04:05.000Z");
    expect(clone.map).toBeInstanceOf(Map);
    expect(clone.map.get("a")).toBe(1);
  });

  it("throws on values structuredClone cannot copy", () => {
    expect(() => toMutable({ onDone: () => undefined })).toThrow();
  });
});
