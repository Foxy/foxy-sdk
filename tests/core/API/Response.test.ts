import { Response as CrossFetchResponse } from 'cross-fetch';
import MemoryStorage from 'fake-storage';
import { Response } from '../../../src/core/API/Response';
import consola from 'consola';

describe('Core', () => {
  describe('API', () => {
    describe('Response', () => {
      it('errors when constructed with incorrect arguments', () => {
        const invalidInit = (null as unknown) as ConstructorParameters<typeof Response>[0];
        expect(() => new Response(invalidInit)).toThrow();
      });

      it('extends Response class from cross-fetch package', () => {
        const response = new Response({
          body: null,
          cache: new MemoryStorage(),
          console: consola.create({ level: Infinity }).withTag('@foxy.io/sdk'),
          fetch: () => Promise.resolve(new CrossFetchResponse(null)),
        });

        expect(response).toBeInstanceOf(CrossFetchResponse);
      });

      it('returns data as-is from .json() when there are no _links', async () => {
        const data = { baz: 'qux', foo: 'bar' };
        const response = new Response({
          body: JSON.stringify(data),
          cache: new MemoryStorage(),
          console: consola.create({ level: Infinity }).withTag('@foxy.io/sdk'),
          fetch: () => Promise.resolve(new CrossFetchResponse(null)),
        });

        expect(await response.json()).toEqual(data);
      });

      it('adds node helpers to _links in .json() output', async () => {
        const curies: unknown[] = [];
        const data = {
          _embedded: {
            bar: [{ _links: { baz: { href: 'https://example.com' }, curies }, qux: 0 }],
            foo: { _links: { bar: { href: 'https://example.com' }, curies }, qux: 0 },
          },
          _links: { curies, foo: { href: 'https://example.com' } },
          baz: 'qux',
        };

        const response = new Response({
          body: JSON.stringify(data),
          cache: new MemoryStorage(),
          console: consola.create({ level: Infinity }).withTag('@foxy.io/sdk'),
          fetch: () => Promise.resolve(new CrossFetchResponse(null)),
        });

        const json = await response.json();
        const methods = ['get', 'put', 'post', 'patch', 'delete'] as const;

        expect(json).toMatchObject(data);

        methods.forEach(method => expect(json).toHaveProperty(`_links.foo.${method}`));
        methods.forEach(method => expect(json).toHaveProperty(`_embedded.foo._links.bar.${method}`));
        methods.forEach(method => expect(json).toHaveProperty(`_embedded.bar.0._links.baz.${method}`));
      });
    });
  });
});
