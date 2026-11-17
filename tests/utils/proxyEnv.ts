const PROXY_ENV_KEYS = [
  'HTTPS_PROXY',
  'https_proxy',
  'HTTP_PROXY',
  'http_proxy',
  'ALL_PROXY',
  'all_proxy',
  'NO_PROXY',
  'no_proxy',
];

/**
 * Removes proxy-related environment variables so that tests behave the same
 * on machines that have a proxy configured.
 *
 * @returns Function that restores the original values.
 */
export function clearProxyEnv(): () => void {
  const saved: Record<string, string | undefined> = {};

  PROXY_ENV_KEYS.forEach(key => {
    saved[key] = process.env[key];
    delete process.env[key];
  });

  return () => {
    PROXY_ENV_KEYS.forEach(key => {
      if (saved[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = saved[key];
      }
    });
  };
}
