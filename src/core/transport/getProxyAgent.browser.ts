/**
 * Browser version of `getProxyAgent.ts`. Browsers handle proxies themselves,
 * so requests are never routed through an agent here.
 *
 * @returns Always `undefined`.
 */
export function getProxyAgent(): undefined {
  return undefined;
}
