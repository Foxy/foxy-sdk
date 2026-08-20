import { MemoryStorage } from '../../../core/storage.js';
import { Response } from '../../../core/API/Response.js';
import { createLogger } from '../../../core/logger.js';

describe('Core', () => {
  describe('API', () => {
    describe('Response', () => {
      it('errors when constructed with incorrect arguments', () => {
        const invalidInit = (null as unknown) as ConstructorParameters<typeof Response>[0];
        expect(() => new Response(invalidInit)).toThrow(TypeError);
      });

      it('extends the global Response class', () => {
        const response = new Response({
          body: null,
          cache: new MemoryStorage(),
          console: createLogger({ level: -1, tag: 'test' }),
          fetch: () => Promise.resolve(new globalThis.Response(null)),
        });

        expect(response).toBeInstanceOf(globalThis.Response);
      });

      it('returns data as-is from .json() when there are no _links', async () => {
        const data = { baz: 'qux', foo: 'bar' };
        const response = new Response({
          body: JSON.stringify(data),
          cache: new MemoryStorage(),
          console: createLogger({ level: -1, tag: 'test' }),
          fetch: () => Promise.resolve(new globalThis.Response(null)),
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
          console: createLogger({ level: -1, tag: 'test' }),
          fetch: () => Promise.resolve(new globalThis.Response(null)),
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
