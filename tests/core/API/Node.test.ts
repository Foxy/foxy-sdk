/* eslint-disable jest/valid-title */

import { Request as CrossFetchRequest, Response as CrossFetchResponse } from 'cross-fetch';

import { Graph } from '../../../src/core/Graph';
import MemoryStorage from 'fake-storage';
import { Node } from '../../../src/core/API/Node';
import { Query } from '../../../src/core/Query';
import { ResolutionError } from '../../../src/core/API/ResolutionError';
import { Response } from '../../../src/core/API/Response';
import consola from 'consola';

describe('Core', () => {
  describe('API', () => {
    describe('Node', () => {
      it('errors when constructed with incorrect arguments', () => {
        const invalidInit = (null as unknown) as ConstructorParameters<typeof Node>[0];
        expect(() => new Node(invalidInit)).toThrow();
      });

      it('has a static link to ResolutionError', () => {
        expect(Node).toHaveProperty('ResolutionError', ResolutionError);
      });

      it('has a static link to Response', () => {
        expect(Node).toHaveProperty('Response', Response);
      });

      const console = consola.create({ level: Infinity }).withTag('@foxy.io/sdk');
      const cache = new MemoryStorage();
      const path = [new URL('https://example.com/')] as [URL, ...string[]];

      beforeEach(() => cache.clear());

      type TestGETInit<TGraph extends Graph> = {
        label: string;
        query?: Query<TGraph>;
        target: string;
      };

      // eslint-disable-next-line jsdoc/require-jsdoc
      function testGET<TGraph extends Graph>({ label, query, target }: TestGETInit<TGraph>) {
        it(label, async () => {
          const body = { foo: 'bar' };
          const fetch = jest.fn().mockResolvedValue(new CrossFetchResponse(JSON.stringify(body)));
          const node = new Node<TGraph>({ cache, console, fetch, path });
          const response = query ? await node.get(query) : await node.get();

          expect(fetch).toHaveBeenCalledWith(new CrossFetchRequest(target));
          expect(response).toBeInstanceOf(Response);
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
        query: { filters: ['foo=bar', 'baz=qux'] },
        target: 'https://example.com/?foo=bar&baz=qux',
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

        const fetch = jest.fn();
        const node = new Node({ cache, console, fetch, path });
        const promise = node.get((incorrectQuery as unknown) as Parameters<typeof node.get>[0]);

        // eslint-disable-next-line jest/valid-expect
        expect(promise).rejects.toThrow();
      });

      (['put', 'post', 'patch'] as const).forEach(method => {
        it(`can ${method.toUpperCase()} to resolved URL`, async () => {
          const data = { foo: 'bar' };
          const body = JSON.stringify(data);
          const fetch = jest.fn().mockResolvedValue(new CrossFetchResponse(body));
          const response = await new Node({ cache, console, fetch, path })[method](data);

          expect(fetch).toHaveBeenCalledWith(new CrossFetchRequest(path[0].toString(), { body, method }));
          expect(response).toBeInstanceOf(Response);
          expect(await response.json()).toMatchObject(data);
        });
      });

      it('can send DELETE to resolved URL', async () => {
        const fetch = jest.fn().mockResolvedValue(new CrossFetchResponse(null));
        const response = await new Node({ cache, console, fetch, path }).delete();

        expect(fetch).toHaveBeenCalledWith(new CrossFetchRequest(path[0].toString(), { method: 'DELETE' }));
        expect(response).toBeInstanceOf(Response);
      });

      it('resolves simple paths', async () => {
        const path = [new URL('https://example.com/')] as [URL, ...string[]];
        const fetch = jest.fn().mockResolvedValue(new CrossFetchResponse(null));
        await new Node({ cache, console, fetch, path }).get();

        expect(fetch).toHaveBeenCalledWith(new CrossFetchRequest(path[0].toString()));
      });

      it('resolves complex paths', async () => {
        const path = [new URL('https://example.com/'), 'foo'] as [URL, ...string[]];
        const bookmarkHref = path[0].toString();
        const fooHref = 'https://foo.example.com/and/some/path/';

        const fetch = jest.fn().mockImplementation(async (info: string | Request) => {
          const fooBody = { _links: { foo: { href: fooHref } } };
          if (info === bookmarkHref) return new CrossFetchResponse(JSON.stringify(fooBody));
          return new CrossFetchResponse(null);
        });

        await new Node({ cache, console, fetch, path }).get();

        expect(fetch).toHaveBeenNthCalledWith(1, bookmarkHref);
        expect(fetch).toHaveBeenNthCalledWith(2, new CrossFetchRequest(fooHref));
      });

      it('resolves complex paths from cache', async () => {
        const path = [new URL('https://example.com/'), 'foo'] as [URL, ...string[]];
        const bookmarkHref = path[0].toString();
        const fooHref = 'https://foo.example.com/and/some/path/';

        const fetch = jest.fn().mockImplementation(async (info: string | Request) => {
          const fooBody = { _links: { foo: { href: fooHref } } };
          if (info === bookmarkHref) return new CrossFetchResponse(JSON.stringify(fooBody));
          return new CrossFetchResponse(null);
        });

        cache.setItem(`${bookmarkHref} > foo`, fooHref);
        await new Node({ cache, console, fetch, path }).get();

        expect(fetch).toHaveBeenCalledWith(new CrossFetchRequest(fooHref));
      });

      it('throws ResolutionError on non-2xx status', async () => {
        const path = [new URL('https://example.com/'), 'foo'] as [URL, ...string[]];
        const fetch = jest.fn().mockResolvedValue(new CrossFetchResponse(null, { status: 500 }));
        const promise = new Node({ cache, console, fetch, path }).get();

        // eslint-disable-next-line jest/valid-expect
        expect(promise).rejects.toThrow(ResolutionError);
      });

      it('is followable', () => {
        const fetch = jest.fn();
        const node = new Node<{ links: { foo: never } }>({ cache, console, fetch, path });
        const nextNode = node.follow('foo');

        expect(nextNode).toBeInstanceOf(Node);
        expect(nextNode).toHaveProperty('_console', console);
        expect(nextNode).toHaveProperty('_fetch', fetch);
        expect(nextNode).toHaveProperty('_path', [...path, 'foo']);
      });

      it('errors when .follow() is called with a non-string curie', () => {
        const fetch = jest.fn();
        const node = new Node<{ links: { foo: never } }>({ cache, console, fetch, path });

        expect(() => node.follow((123 as unknown) as 'foo')).toThrow();
      });
    });
  });
});
