import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';

import { clearProxyEnv } from '../../utils/proxyEnv';
import { getProxyAgent as getBrowserProxyAgent } from '../../../src/core/transport/getProxyAgent.browser';
import { getProxyAgent } from '../../../src/core/transport/getProxyAgent';

describe('Core', () => {
  describe('transport', () => {
    describe('getProxyAgent', () => {
      let restoreEnv: () => void;

      beforeEach(() => (restoreEnv = clearProxyEnv()));
      afterEach(() => restoreEnv());

      it('returns undefined when no proxy is configured', () => {
        expect(getProxyAgent('https://api.foxy.io/')).toBeUndefined();
        expect(getProxyAgent('http://api.foxy.io/')).toBeUndefined();
      });

      it('returns an HTTPS proxy agent for https URLs when HTTPS_PROXY is set', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        expect(getProxyAgent('https://api.foxy.io/')).toBeInstanceOf(HttpsProxyAgent);
        expect(getProxyAgent('http://api.foxy.io/')).toBeUndefined();
      });

      it('supports lowercase https_proxy', () => {
        process.env.https_proxy = 'http://proxy.test:3128';
        expect(getProxyAgent('https://api.foxy.io/')).toBeInstanceOf(HttpsProxyAgent);
      });

      it('returns an HTTP proxy agent for http URLs when HTTP_PROXY is set', () => {
        process.env.HTTP_PROXY = 'http://proxy.test:3128';
        expect(getProxyAgent('http://api.foxy.test/')).toBeInstanceOf(HttpProxyAgent);
        expect(getProxyAgent('https://api.foxy.io/')).toBeUndefined();
      });

      it('supports lowercase http_proxy', () => {
        process.env.http_proxy = 'http://proxy.test:3128';
        expect(getProxyAgent('http://api.foxy.test/')).toBeInstanceOf(HttpProxyAgent);
      });

      it('accepts a proxy URL with credentials', () => {
        process.env.HTTPS_PROXY = 'http://user:secret@proxy.test:3128';
        expect(getProxyAgent('https://api.foxy.io/')).toBeInstanceOf(HttpsProxyAgent);
      });

      it('reuses the agent for the same proxy', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        const first = getProxyAgent('https://api.foxy.io/');
        const second = getProxyAgent('https://other.foxy.io/s/customer/');

        expect(first).toBeDefined();
        expect(second).toBe(first);

        process.env.HTTPS_PROXY = 'http://other-proxy.test:3128';
        expect(getProxyAgent('https://api.foxy.io/')).not.toBe(first);
      });

      it('bypasses the proxy for hosts listed in NO_PROXY', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        process.env.NO_PROXY = 'localhost,api.foxy.io';

        expect(getProxyAgent('https://api.foxy.io/')).toBeUndefined();
        expect(getProxyAgent('https://localhost:8080/')).toBeUndefined();
        expect(getProxyAgent('https://store.foxy.io/')).toBeDefined();
      });

      it('bypasses the proxy for domain suffixes listed in NO_PROXY', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        process.env.NO_PROXY = '.foxy.io';

        expect(getProxyAgent('https://api.foxy.io/')).toBeUndefined();
        expect(getProxyAgent('https://example.com/')).toBeDefined();
      });

      it('bypasses the proxy for wildcard domain suffixes in lowercase no_proxy', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        process.env.no_proxy = '*.foxy.io';

        expect(getProxyAgent('https://api.foxy.io/')).toBeUndefined();
        expect(getProxyAgent('https://example.com/')).toBeDefined();
      });

      it('bypasses the proxy for all hosts when NO_PROXY is *', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        process.env.NO_PROXY = '*';

        expect(getProxyAgent('https://api.foxy.io/')).toBeUndefined();
        expect(getProxyAgent('https://example.com/')).toBeUndefined();
      });

      it('matches NO_PROXY entries with a port only on that port', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        process.env.NO_PROXY = 'api.foxy.io:8443';

        expect(getProxyAgent('https://api.foxy.io:8443/')).toBeUndefined();
        expect(getProxyAgent('https://api.foxy.io/')).toBeDefined();
      });

      it('never returns an agent in the browser version', () => {
        process.env.HTTPS_PROXY = 'http://proxy.test:3128';
        expect(getBrowserProxyAgent()).toBeUndefined();
      });
    });
  });
});
