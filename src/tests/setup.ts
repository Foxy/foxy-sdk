import { afterEach } from "vitest";

// `new API({ storeDomain })` loads the cart on a `setTimeout(0)`. A test that
// ends before that timer fires used to send a real request, because
// `vi.restoreAllMocks()` had already put the real `fetch` back. The request
// failed after the jsdom environment was torn down, and `setState` then threw
// on `new Event("update")` from the wrong realm — an unhandled rejection that
// fails `npm test` at random.
//
// Plain assignment, not `vi.stubGlobal`, so this stub is what
// `vi.restoreAllMocks()` and `vi.unstubAllGlobals()` leave behind.
globalThis.fetch = (input) =>
  Promise.reject(new TypeError(`unmocked fetch in tests: ${String(input instanceof Request ? input.url : input)}`));

// Captured before any test can install fake timers, which would hang this.
const realSetTimeout = globalThis.setTimeout;

// Let deferred auto-loads fire and settle inside the test that started them.
afterEach(() => new Promise<void>((resolve) => realSetTimeout(resolve, 0)));
