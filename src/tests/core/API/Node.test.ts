import type { Graph } from '../../../core/Graph';
import { MemoryStorage } from '../../../core/storage.js';
import { Node } from '../../../core/API/Node.js';
import type { Query } from '../../../core/Query';
import { ResolutionError } from '../../../core/API/ResolutionError.js';
import { Response as SDKResponse } from '../../../core/API/Response.js';
import { createLogger } from '../../../core/logger.js';

describe('Core', () => {
  describe('API', () => {
    describe('Node', () => {
      it('errors when constructed with incorrect arguments', () => {
        const invalidInit = (null as unknown) as ConstructorParameters<typeof Node>[0];
        expect(() => new Node(invalidInit)).toThrow(TypeError);
      });

      it('has a static link to ResolutionError', () => {
        expect(Node).toHaveProperty('ResolutionError', ResolutionError);
      });

      it('has a static link to Response', () => {
        expect(Node).toHaveProperty('Response', SDKResponse);
      });

      const console = createLogger({ level: -1, tag: 'test' });
      const cache = new MemoryStorage();
      const path = [new URL('https://example.com/')] as [URL, ...string[]];

      beforeEach(() => cache.clear());

      type TestGETInit<TGraph extends Graph> = {
        label: string;
        query?: Query<TGraph>;
        target: string;
      };

      function testGET<TGraph extends Graph>({ label, query, target }: TestGETInit<TGraph>) {
        it(label, async () => {
          const body = { foo: 'bar' };
          const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
          const node = new Node<TGraph>({ cache, console, fetch, path });
          const response = query ? await node.get(query) : await node.get();

          const [request] = fetch.mock.calls[0] as [Request];
          expect(request.url).toBe(target);
          expect(response).toBeInstanceOf(SDKResponse);
          expect(await response.json()).toMatchObject(body);
        });
      }

      testGET({
        label: 'GETs resolved URL without args',
        target: 'https://example.com/',
      });

      testGET<{ zooms: { foo: { zooms: { bar: never } } } }>({
        label: 'GETs resolved URL with simple zoom',
        query: { zoom: 'foo' },
        target: 'https://example.com/?zoom=foo',
      });

      testGET<{ zooms: { foo: { zooms: { bar: never } } } }>({
        label: 'GETs resolved URL with array zoom',
        query: { zoom: { foo: 'bar' } },
        target: 'https://example.com/?zoom=foo%3Abar',
      });

      testGET<{ zooms: { foo: never; bar: never } }>({
        label: 'GETs resolved URL with array zoom',
        query: { zoom: ['foo', 'bar'] },
        target: 'https://example.com/?zoom=foo%2Cbar',
      });

      testGET<{ zooms: { foo: never; bar: { zooms: { baz: never } } } }>({
        label: 'GETs resolved URL with complex array zoom',
        query: { zoom: ['foo', { bar: 'baz' }] },
        target: 'https://example.com/?zoom=foo%2Cbar%3Abaz',
      });

      testGET<{ child: { props: { foo: string } } }>({
        label: 'GETs resolved URL with simple order',
        query: { order: 'foo' },
        target: 'https://example.com/?order=foo',
      });

      testGET<{ child: { props: { foo: string } } }>({
        label: 'GETs resolved URL with record order',
        query: { order: { foo: 'desc' } },
        target: 'https://example.com/?order=foo+desc',
      });

      testGET<{ child: { props: { foo: string; bar: number } } }>({
        label: 'GETs resolved URL with array order',
        query: { order: ['foo', 'bar'] },
        target: 'https://example.com/?order=foo%2Cbar',
      });

      testGET<{ child: never }>({
        label: 'GETs resolved URL with limit',
        query: { limit: 10 },
        target: 'https://example.com/?limit=10',
      });

      testGET<{ props: { foo: string; bar: string } }>({
        label: 'GETs resolved URL with fields',
        query: { fields: ['foo', 'bar'] },
        target: 'https://example.com/?fields=foo%2Cbar',
      });

      testGET<{ child: never }>({
        label: 'GETs resolved URL with offset',
        query: { offset: 10 },
        target: 'https://example.com/?offset=10',
      });

      testGET<{ child: never }>({
        label: 'GETs resolved URL with filters',
        query: { filters: ['foo=bar', 'baz=qux+one@example.com'] },
        target: 'https://example.com/?foo=bar&baz=qux%2Bone%40example.com',
      });

      it('errors when .get() is called with incorrect query', async () => {
        const incorrectQuery = {
          fields: null,
          filters: {},
          limit: 'o_0',
          offset: 'huh',
          order: undefined,
          zoom: 0,
        };

        const fetch = vi.fn();
        const node = new Node({ cache, console, fetch, path });
        const promise = node.get((incorrectQuery as unknown) as Parameters<typeof node.get>[0]);

        await expect(promise).rejects.toThrow(TypeError);
      });

      (['put', 'post', 'patch'] as const).forEach(method => {
        it(`can ${method.toUpperCase()} to resolved URL`, async () => {
          const data = { foo: 'bar' };
          const body = JSON.stringify(data);
          const fetch = vi.fn().mockResolvedValue(new Response(body));
          const response = await new Node({ cache, console, fetch, path })[method](data);

          const [request] = fetch.mock.calls[0] as [Request];
          expect(request.url).toBe(path[0].toString());
          expect(request.method).toBe(method.toUpperCase());
          expect(await request.text()).toBe(body);
          expect(response).toBeInstanceOf(SDKResponse);
          expect(await response.json()).toMatchObject(data);
        });
      });

      it('can send DELETE to resolved URL', async () => {
        const fetch = vi.fn().mockResolvedValue(new Response(null));
        const response = await new Node({ cache, console, fetch, path }).delete();

        const [request] = fetch.mock.calls[0] as [Request];
        expect(request.url).toBe(path[0].toString());
        expect(request.method).toBe('DELETE');
        expect(response).toBeInstanceOf(SDKResponse);
      });

      it('resolves simple paths', async () => {
        const path = [new URL('https://example.com/')] as [URL, ...string[]];
        const fetch = vi.fn().mockResolvedValue(new Response(null));
        await new Node({ cache, console, fetch, path }).get();

        const [request] = fetch.mock.calls[0] as [Request];
        expect(request.url).toBe(path[0].toString());
      });

      it('resolves complex paths', async () => {
        const path = [new URL('https://example.com/'), 'foo'] as [URL, ...string[]];
        const bookmarkHref = path[0].toString();
        const fooHref = 'https://foo.example.com/and/some/path/';

        const fetch = vi.fn().mockImplementation(async (info: string | Request) => {
          const fooBody = { _links: { foo: { href: fooHref } } };
          if (info === bookmarkHref) return new Response(JSON.stringify(fooBody));
          return new Response(null);
        });

        await new Node({ cache, console, fetch, path }).get();

        // `_resolve` passes a bare string to fetch while `get` passes a Request.
        // That asymmetry is real behaviour, so the two calls are asserted differently.
        expect(fetch).toHaveBeenNthCalledWith(1, bookmarkHref);

        const [request] = fetch.mock.calls[1] as [Request];
        expect(request.url).toBe(fooHref);
      });

      it('resolves complex paths from cache', async () => {
        const path = [new URL('https://example.com/'), 'foo'] as [URL, ...string[]];
        const bookmarkHref = path[0].toString();
        const fooHref = 'https://foo.example.com/and/some/path/';

        const fetch = vi.fn().mockImplementation(async (info: string | Request) => {
          const fooBody = { _links: { foo: { href: fooHref } } };
          if (info === bookmarkHref) return new Response(JSON.stringify(fooBody));
          return new Response(null);
        });

        cache.setItem(`${bookmarkHref} > foo`, fooHref);
        await new Node({ cache, console, fetch, path }).get();

        const [request] = fetch.mock.calls[0] as [Request];
        expect(request.url).toBe(fooHref);
      });

      it("throws ResolutionError if link doesn't exist", async () => {
        const path = [new URL('https://example.com/'), 'nope'] as [URL, ...string[]];
        const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
        const promise = new Node({ cache, console, fetch, path }).get();

        await expect(promise).rejects.toThrow(ResolutionError);
      });

      it('throws ResolutionError on non-2xx status', async () => {
        const path = [new URL('https://example.com/'), 'foo'] as [URL, ...string[]];
        const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 500 }));
        const promise = new Node({ cache, console, fetch, path }).get();

        await expect(promise).rejects.toThrow(ResolutionError);
      });

      it('is followable', () => {
        const fetch = vi.fn();
        const node = new Node<{ links: { foo: never } }>({ cache, console, fetch, path });
        const nextNode = node.follow('foo');

        expect(nextNode).toBeInstanceOf(Node);
        expect(nextNode).toHaveProperty('_console', console);
        expect(nextNode).toHaveProperty('_fetch', fetch);
        expect(nextNode).toHaveProperty('_path', [...path, 'foo']);
      });

      it('errors when .follow() is called with a non-string curie', () => {
        const fetch = vi.fn();
        const node = new Node<{ links: { foo: never } }>({ cache, console, fetch, path });

        expect(() => node.follow((123 as unknown) as 'foo')).toThrow(TypeError);
      });

      it('copies status, statusText and headers onto the returned response', async () => {
        const fetch = vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ foo: 'bar' }), {
            headers: { 'Content-Type': 'application/json', 'x-custom': 'yes' },
            status: 404,
            statusText: 'Not Found',
          })
        );

        const node = new Node({
          cache: new MemoryStorage(),
          console: createLogger({ level: -1, tag: 'test' }),
          fetch,
          path: [new URL('https://example.com/resource')],
        });

        const response = await node.get();

        expect(response.status).toBe(404);
        expect(response.statusText).toBe('Not Found');
        expect(response.headers.get('x-custom')).toBe('yes');
        expect(await response.json()).toMatchObject({ foo: 'bar' });
      });

      it('returns a null-body response for statuses that forbid a body', async () => {
        const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

        const node = new Node({
          cache: new MemoryStorage(),
          console: createLogger({ level: -1, tag: 'test' }),
          fetch,
          path: [new URL('https://example.com/resource')],
        });

        const response = await node.delete();

        expect(response.status).toBe(204);
        expect(response.body).toBeNull();
      });
    });
  });
});
