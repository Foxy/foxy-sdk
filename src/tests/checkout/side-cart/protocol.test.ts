import { describe, expect, it } from "vitest";
import {
  isAnnouncement,
  isConnect,
  parseFrameToHost,
  parseHostToFrame,
} from "../../../checkout/side-cart/protocol";

describe("checkout/side-cart/protocol", () => {
  it("recognizes the frame's announcement and the host's connect", () => {
    expect(isAnnouncement({ type: "awaiting-connect" })).toBe(true);
    expect(isAnnouncement({ type: "connect" })).toBe(false);
    expect(isConnect({ type: "connect" })).toBe(true);
    expect(isConnect("connect")).toBe(false);
  });

  it("parses every frame-to-host message", () => {
    expect(parseFrameToHost('{"type":"ready","sessionId":"s1","itemCount":2}')).toEqual({
      type: "ready",
      sessionId: "s1",
      itemCount: 2,
    });
    expect(parseFrameToHost('{"type":"result","id":7,"error":null}')).toEqual({
      type: "result",
      id: 7,
      error: null,
    });
    expect(parseFrameToHost('{"type":"close"}')).toEqual({ type: "close" });
  });

  it("parses an invoke and rejects a method that is not delegatable", () => {
    expect(
      parseHostToFrame('{"type":"invoke","id":1,"method":"removeItem","params":[{"id":9}]}'),
    ).toEqual({ type: "invoke", id: 1, method: "removeItem", params: [{ id: 9 }] });

    // `checkOut` is deliberately not on the list: the sidecart moves the
    // shopper to the checkout page, it does not submit an order for the host.
    expect(parseHostToFrame('{"type":"invoke","id":1,"method":"checkOut","params":[]}')).toBeNull();
  });

  it("rejects anything that is not a JSON string of a known shape", () => {
    expect(parseFrameToHost({ type: "ready" })).toBeNull();
    expect(parseFrameToHost("not json")).toBeNull();
    expect(parseFrameToHost('{"type":"nope"}')).toBeNull();
    expect(parseHostToFrame('{"type":"invoke","id":"1","method":"clearCart","params":[]}')).toBeNull();
  });
});
