import type { Agent } from 'http';
import createHttpProxyAgent from 'http-proxy-agent';
import createHttpsProxyAgent from 'https-proxy-agent';
import { getProxyForUrl } from 'proxy-from-env';

const agents = new Map<string, Agent>();

/**
 * Returns an HTTP agent that sends a request for the given URL through the proxy
 * configured in the environment, or `undefined` when the request should go direct.
 * Proxies come from `HTTPS_PROXY`/`https_proxy` (https URLs), `HTTP_PROXY`/`http_proxy`
 * (http URLs) and `ALL_PROXY`/`all_proxy` (either), and `NO_PROXY`/`no_proxy` lists hosts
 * (`example.com`), domain suffixes (`.example.com`, `*.example.com`) or `*` to bypass the proxy.
 * Environment variables are read on every call. Agents are reused per proxy.
 *
 * This is the Node.js implementation. Browser builds use `getProxyAgent.browser.ts` instead.
 *
 * @param url Request URL.
 * @returns Proxy agent or `undefined`.
 */
export function getProxyAgent(url: string): Agent | undefined {
  const proxy = getProxyForUrl(url);
  if (!proxy) return undefined;

  const secure = url.slice(0, 6).toLowerCase() === 'https:';
  const key = `${secure ? 'https' : 'http'} ${proxy}`;
  let agent = agents.get(key);

  if (!agent) {
    agent = secure ? createHttpsProxyAgent(proxy) : createHttpProxyAgent(proxy);
    agents.set(key, agent);
  }

  return agent;
}
