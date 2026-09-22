import { isNonNegativeInteger } from "../v8n/isNonNegativeInteger";

/**
 * Methods the host may invoke inside the sidecart iframe.
 *
 * The list is a whitelist rather than "every method on API": a message channel
 * is an untrusted input even when both ends are ours, and the host has no
 * business submitting an order or signing a shopper in from a merchant page.
 * Adding a method later is a one-line change here and needs no protocol
 * version bump.
 */
export const SIDE_CART_INVOKE_METHODS = [
  "updateItemQuantity",
  "removeItem",
  "clearCart",
  "applyCouponOrGiftCardCode",
  "removeCouponCode",
  "removeGiftCardCode",
] as const;

export type SideCartInvokeMethod = (typeof SIDE_CART_INVOKE_METHODS)[number];

export type HostToFrameMessage =
  | { type: "invoke"; id: number; method: SideCartInvokeMethod; params: unknown[] }
  | { type: "show" }
  | { type: "hide" };

export type FrameToHostMessage =
  | { type: "ready"; sessionId: string | null; itemCount: number }
  | { type: "state"; sessionId: string | null; itemCount: number; total: number }
  // `result` acknowledges that an invoke was dispatched, not that the cart
  // changed: the methods it drives report their own failures into the checkout
  // json. The cart's new shape reaches the host as the next `state`.
  | { type: "result"; id: number; error: string | null }
  // A REQUEST: the shopper (or the frame's own Escape handling) asked to
  // close. The host reacts immediately -- see `closed` below for the
  // frame's own report that its exit animation has actually finished. Do
  // not confuse the two: this one starts the close, `closed` ends it.
  | { type: "close" }
  // A COMPLETION REPORT: the frame's exit transition has finished playing,
  // so it is now safe for the host to actually hide the iframe and release
  // `inert` on the page behind it. The frame owns the animation and is the
  // only thing that knows when it is done.
  | { type: "closed" }
  | { type: "error"; message: string };

/** Posted by the frame with `'*'`: it cannot know its parent's origin. */
export const SIDE_CART_ANNOUNCEMENT = { type: "awaiting-connect" } as const;

/** Posted by the host to the frame's origin, carrying one `MessagePort`. */
export const SIDE_CART_CONNECT = { type: "connect" } as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function parseJson(raw: unknown): Record<string, unknown> | null {
  if (typeof raw !== "string") return null;
  try {
    return asRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function isAnnouncement(data: unknown): boolean {
  return asRecord(data)?.type === SIDE_CART_ANNOUNCEMENT.type;
}

export function isConnect(data: unknown): boolean {
  return asRecord(data)?.type === SIDE_CART_CONNECT.type;
}

function isSessionId(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/**
 * A cart cannot hold -1 or 2.5 items. A bare `typeof === "number"` let such a
 * count through to be persisted in the merchant-origin cache and rendered in
 * the trigger's badge, where nothing else would catch it.
 */
function isItemCount(value: unknown): value is number {
  return typeof value === "number" && isNonNegativeInteger(value);
}

export function parseFrameToHost(raw: unknown): FrameToHostMessage | null {
  const data = parseJson(raw);
  if (!data) return null;

  switch (data.type) {
    case "ready":
      return isSessionId(data.sessionId) && isItemCount(data.itemCount)
        ? { type: "ready", sessionId: data.sessionId, itemCount: data.itemCount }
        : null;
    case "state":
      return isSessionId(data.sessionId) &&
        isItemCount(data.itemCount) &&
        typeof data.total === "number"
        ? {
            type: "state",
            sessionId: data.sessionId,
            itemCount: data.itemCount,
            total: data.total,
          }
        : null;
    case "result":
      return typeof data.id === "number" &&
        (data.error === null || typeof data.error === "string")
        ? { type: "result", id: data.id, error: data.error }
        : null;
    case "close":
      return { type: "close" };
    case "closed":
      return { type: "closed" };
    case "error":
      return typeof data.message === "string"
        ? { type: "error", message: data.message }
        : null;
    default:
      return null;
  }
}

function isInvokeMethod(value: unknown): value is SideCartInvokeMethod {
  return SIDE_CART_INVOKE_METHODS.includes(value as SideCartInvokeMethod);
}

export function parseHostToFrame(raw: unknown): HostToFrameMessage | null {
  const data = parseJson(raw);
  if (!data) return null;

  switch (data.type) {
    case "invoke":
      return typeof data.id === "number" &&
        isInvokeMethod(data.method) &&
        Array.isArray(data.params)
        ? { type: "invoke", id: data.id, method: data.method, params: data.params }
        : null;
    case "show":
      return { type: "show" };
    case "hide":
      return { type: "hide" };
    default:
      return null;
  }
}
