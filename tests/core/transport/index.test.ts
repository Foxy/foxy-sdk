jest.mock('cross-fetch', () => ({
  Headers: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Headers,
  Request: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Request,
  Response: (jest.requireActual('cross-fetch') as typeof import('cross-fetch')).Response,
  default: jest.fn(),
  fetch: jest.fn(),
}));

import { Request, Response, fetch } from 'cross-fetch';
import { sendWithCustomFetch } from '../../../src/core/transport/index';

const fetchMock = (fetch as unknown) as jest.Mock;

describe('Core', () => {
  describe('transport', () => {
    beforeEach(() => fetchMock.mockReset());

    describe('sendWithCustomFetch', () => {
      it('sends the request as a URL and plain options', async () => {
        const customFetch = jest.fn(() => Promise.resolve(new Response('{}')));
        const controller = { signal: 'test-signal' } as unknown;
        const request = new Request('https://api.foxy.io/stores/0', {
          body: '{"name":"test"}',
          headers: { 'Content-Type': 'application/json', 'X-Test': '1' },
          method: 'patch',
        });

        await sendWithCustomFetch(customFetch, request, { signal: controller } as RequestInit);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(customFetch).toHaveBeenCalledTimes(1);

        const [url, init] = (customFetch.mock.calls[0] as unknown) as [string, RequestInit];
        expect(url).toBe('https://api.foxy.io/stores/0');
        expect(init.method).toBe('PATCH');
        expect(init.signal).toBe(controller);
        expect(init.headers).toEqual({ 'content-type': 'application/json', 'x-test': '1' });
        expect(Buffer.from(init.body as ArrayBuffer).toString()).toBe('{"name":"test"}');
      });

      it('sends no body for GET requests and empty bodies', async () => {
        const customFetch = jest.fn(() => Promise.resolve(new Response('{}')));

        await sendWithCustomFetch(customFetch, new Request('https://api.foxy.io/'));
        await sendWithCustomFetch(customFetch, new Request('https://api.foxy.io/', { method: 'DELETE' }));

        const calls = (customFetch.mock.calls as unknown) as [string, RequestInit][];
        expect(calls[0][1].body).toBeUndefined();
        expect(calls[1][1].body).toBeUndefined();
      });

      it('returns responses of the SDK Response class as is', async () => {
        const response = new Response('{}');
        const customFetch = jest.fn(() => Promise.resolve(response));
        expect(await sendWithCustomFetch(customFetch, new Request('https://api.foxy.io/'))).toBe(response);
      });

      it('copies other responses into the SDK Response class', async () => {
        const foreignResponse = {
          arrayBuffer: () => Promise.resolve(Buffer.from('{"ok":true}')),
          headers: new Map([['content-type', 'application/hal+json']]),
          status: 201,
          statusText: 'Created',
          url: 'https://api.foxy.io/',
        };

        const customFetch = jest.fn(() => Promise.resolve((foreignResponse as unknown) as Response));
        const response = await sendWithCustomFetch(customFetch, new Request('https://api.foxy.io/'));

        expect(response).toBeInstanceOf(Response);
        expect(response.status).toBe(201);
        expect(response.statusText).toBe('Created');
        expect(response.headers.get('content-type')).toBe('application/hal+json');
        expect(await response.json()).toEqual({ ok: true });
      });

      it('copies responses without a body for null-body statuses', async () => {
        const arrayBuffer = jest.fn();
        const foreignResponse = { arrayBuffer, headers: new Map(), status: 204, statusText: 'No Content', url: '' };
        const customFetch = jest.fn(() => Promise.resolve((foreignResponse as unknown) as Response));
        const response = await sendWithCustomFetch(customFetch, new Request('https://api.foxy.io/'));

        expect(response.status).toBe(204);
        expect(arrayBuffer).not.toHaveBeenCalled();
        expect(await response.text()).toBe('');
      });
    });
  });
});
