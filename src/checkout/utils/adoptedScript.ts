/**
 * Each SDK loader here finds its script tag by `src` alone, so it will adopt a
 * matching tag that something else put in the page — a store template, a theme,
 * another integration. A tag this SDK created always carries a `data-*SdkState`
 * marker, set to `"loading"` the moment it is appended; a tag without one is
 * foreign, and nothing tells the loader whether its load already happened.
 *
 * That matters because the loaders wait by attaching `load` and `error`
 * listeners. On a foreign tag whose fetch already finished, neither event will
 * ever fire again, so the promise stays pending forever and — since every loader
 * caches it — so does every later call. Nothing rejects and nothing is logged.
 *
 * Resource Timing closes the gap: an entry appears for a URL only once its fetch
 * has completed, and it appears whether the fetch succeeded or failed. Verified
 * in Chrome across the failure modes that matter — HTTP 404, DNS failure and a
 * CSP block all produce an entry, and a request still in flight produces none.
 *
 * A missing entry therefore means "still loading, keep waiting", which is also
 * what we get when the entry buffer filled (250 entries by default) or was
 * cleared with `clearResourceTimings()`, or when the API is absent. Every one of
 * those falls back to attaching listeners, exactly as this SDK did before.
 */
export function isSettledForeignScript(
  script: HTMLScriptElement,
  stateKey: string,
): boolean {
  if (script.dataset[stateKey] !== undefined) {
    return false;
  }

  if (
    typeof performance === "undefined" ||
    typeof performance.getEntriesByType !== "function"
  ) {
    return false;
  }

  return performance
    .getEntriesByType("resource")
    .some((entry) => entry.name === script.src);
}
