declare module 'proxy-from-env' {
  /**
   * Returns the proxy URL for the given URL based on the `*_PROXY` and `NO_PROXY`
   * environment variables, or an empty string if the request shouldn't be proxied.
   */
  export function getProxyForUrl(url: string): string;
}
