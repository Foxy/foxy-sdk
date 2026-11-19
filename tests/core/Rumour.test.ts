import { Rumour } from '../../src/core/Rumour/Rumour';
import { UpdateError } from '../../src/core/Rumour/UpdateError';

type TestResource = {
  _links: { self: { href: string } };
  [key: string]: unknown;
};

describe('Core', () => {
  describe('Rumour', () => {
    it('exposes UpdateError as static property', () => {
      expect(Rumour).toHaveProperty('UpdateError', UpdateError);
    });

    it('constructs an instance of Rumour without parameters', () => {
      expect(new Rumour()).toBeInstanceOf(Rumour);
    });

    it('syncs changes in plain resources', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'bar',
      };

      const trackedUpdate: TestResource = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'baz',
      };

      const ignoredUpdate: TestResource = {
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'baz',
      };

      const rumour = new Rumour();
      rumour.track(update => (syncedData = update(syncedData as TestResource)));

      rumour.share({ data: trackedUpdate, source: trackedUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);

      rumour.share({ data: ignoredUpdate, source: ignoredUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);

      rumour.cease();
    });

    it('syncs changes in embedded resources', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'bar',
      };

      const trackedUpdate = {
        _embedded: {
          foo: {
            _links: { self: { href: 'https://foxy.test/foo' } },
            foo: 'baz',
          },
        },
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'qux',
      };

      const ignoredUpdate = {
        _embedded: {
          baz: {
            _links: { self: { href: 'https://foxy.test/baz' } },
            baz: 'qux',
          },
        },
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'qux',
      };

      const rumour = new Rumour();
      rumour.track(update => (syncedData = update(syncedData as TestResource)));

      rumour.share({ data: trackedUpdate, source: trackedUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate._embedded.foo);

      rumour.share({ data: ignoredUpdate, source: ignoredUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate._embedded.foo);

      rumour.cease();
    });

    it('syncs changes in deeply embedded resources', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'bar',
      };

      const trackedUpdate = {
        _embedded: {
          bar: {
            _embedded: {
              foo: {
                _links: { self: { href: 'https://foxy.test/foo' } },
                foo: 'baz',
              },
            },
            _links: { self: { href: 'https://foxy.test/bar' } },
            bar: 'qux',
          },
        },
        _links: { self: { href: 'https://foxy.test/baz' } },
        baz: 'qux',
      };

      const ignoredUpdate = {
        _embedded: {
          bar: {
            _embedded: {
              qux: {
                _links: { self: { href: 'https://foxy.test/qux' } },
                qux: 'baz',
              },
            },
            _links: { self: { href: 'https://foxy.test/bar' } },
            bar: 'qux',
          },
        },
        _links: { self: { href: 'https://foxy.test/baz' } },
        baz: 'bar',
      };

      const rumour = new Rumour();
      rumour.track(update => (syncedData = update(syncedData as TestResource)));

      rumour.share({ data: trackedUpdate, source: trackedUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate._embedded.bar._embedded.foo);

      rumour.share({ data: ignoredUpdate, source: ignoredUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate._embedded.bar._embedded.foo);

      rumour.cease();
    });

    it('replaces top-level resource with null if deletion is committed', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'bar',
      };

      const rumour = new Rumour();
      rumour.track(update => (syncedData = update(syncedData as TestResource)));
      rumour.share({ data: null, source: syncedData._links.self.href });

      expect(syncedData).toBeNull();

      rumour.cease();
    });

    it('throws UpdateError when processing a deletion of an embedded resource', () => {
      let syncedData: TestResource | null = {
        _embedded: {
          foo: {
            _links: { self: { href: 'https://foxy.test/foo' } },
            foo: 'baz',
          },
        },
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'qux',
      };

      const rumour = new Rumour();
      let error: Error | null = null;

      rumour.track(update => {
        try {
          syncedData = update(syncedData as TestResource);
        } catch (err) {
          error = err;
        }
      });

      rumour.share({
        data: null,
        source: 'https://foxy.test/foo',
      });

      expect(error).toBeInstanceOf(UpdateError);

      rumour.cease();
    });

    it('throws UpdateError when a related resource is impacted by the update', () => {
      let syncedData: TestResource | null = {
        _embedded: {
          foos: [
            {
              _links: { self: { href: 'https://foxy.test/foo' } },
              foo: 'baz',
            },
          ],
        },
        _links: { self: { href: 'https://foxy.test/foos' } },
        bar: 'qux',
      };

      const rumour = new Rumour();
      let error: Error | null = null;

      rumour.track(update => {
        try {
          syncedData = update(syncedData as TestResource);
        } catch (err) {
          error = err;
        }
      });

      rumour.share({
        data: null,
        related: ['https://foxy.test/foos'],
        source: 'https://foxy.test/foo',
      });

      expect(error).toBeInstanceOf(UpdateError);

      rumour.cease();
    });

    it('throws UpdateError when a _uri property changes', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        bar_uri: 'https://example.com/bar',
      };

      const rumour = new Rumour();
      let error: Error | null = null;

      rumour.track(update => {
        try {
          syncedData = update(syncedData as TestResource);
        } catch (err) {
          error = err;
        }
      });

      rumour.share({
        data: { ...syncedData, bar_uri: 'https://example.com/baz' },
        source: 'https://foxy.test/foo',
      });

      expect(error).toBeInstanceOf(UpdateError);
      rumour.cease();
    });

    it('throws UpdateError when a _id property changes', () => {
      let syncedData: TestResource | null = { _links: { self: { href: 'https://foxy.test/foo' } }, bar_id: 0 };
      const rumour = new Rumour();
      let error: Error | null = null;

      rumour.track(update => {
        try {
          syncedData = update(syncedData as TestResource);
        } catch (err) {
          error = err;
        }
      });

      rumour.share({ data: { ...syncedData, bar_id: 1 }, source: 'https://foxy.test/foo' });
      expect(error).toBeInstanceOf(UpdateError);
      rumour.cease();
    });

    it('stops sending updates to a listener after its untrack callback is invoked', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'bar',
      };

      const trackedUpdate: TestResource = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'baz',
      };

      const ignoredUpdate: TestResource = {
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'baz',
      };

      const rumour = new Rumour();
      const untrackCallback = rumour.track(update => (syncedData = update(syncedData as TestResource)));

      rumour.share({ data: trackedUpdate, source: trackedUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);

      untrackCallback();
      rumour.share({ data: ignoredUpdate, source: ignoredUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);

      rumour.cease();
    });

    it('stops sending all updates after .cease() is called', () => {
      let syncedData: TestResource | null = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'bar',
      };

      const trackedUpdate: TestResource = {
        _links: { self: { href: 'https://foxy.test/foo' } },
        foo: 'baz',
      };

      const ignoredUpdate: TestResource = {
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'baz',
      };

      const rumour = new Rumour();
      rumour.track(update => (syncedData = update(syncedData as TestResource)));

      rumour.share({ data: trackedUpdate, source: trackedUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);

      rumour.cease();
      rumour.share({ data: ignoredUpdate, source: ignoredUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);
    });

    describe('patch and merge details', () => {
      const sync = (state: unknown, share: Parameters<Rumour['share']>[0]) => {
        const rumour = new Rumour();
        let result: unknown;
        rumour.track(update => (result = update(state as TestResource)));
        rumour.share(share);
        return result;
      };

      it('patches a resource in an embedded array, keeping its own _embedded and the input intact', () => {
        const state = {
          _embedded: {
            items: [
              {
                _embedded: { bar: { _links: { self: { href: 'https://foxy.test/bar' } }, x: 1 } },
                _links: { self: { href: 'https://foxy.test/foos/0' } },
                a: 1,
              },
              { _links: { self: { href: 'https://foxy.test/foos/1' } }, a: 1 },
            ],
          },
          _links: { first: { href: 'https://foxy.test/foos' }, self: { href: 'https://foxy.test/foos?limit=2' } },
        };

        const snapshot = JSON.parse(JSON.stringify(state));
        const result = sync(state, {
          data: {
            _embedded: { bar: { _links: { self: { href: 'https://foxy.test/bar' } }, x: 2 } },
            _links: { self: { href: 'https://foxy.test/foos/0' } },
            a: 2,
          } as TestResource,
          source: 'https://foxy.test/foos/0',
        });

        expect(state).toEqual(snapshot);
        expect(result).not.toBe(state);
        expect(result).toEqual({
          ...snapshot,
          _embedded: {
            items: [
              // children of an updated node are not visited, so the embedded `bar` keeps x: 1
              { ...snapshot._embedded.items[0], a: 2 },
              snapshot._embedded.items[1],
            ],
          },
        });

        // Objects on the walked path are new copies; objects below the updated resource keep their references.
        const typed = result as typeof state;
        expect(typed._embedded).not.toBe(state._embedded);
        expect(typed._embedded.items[1]).not.toBe(state._embedded.items[1]);
        expect(typed._embedded.items[0]._embedded).toBe(state._embedded.items[0]._embedded);
        expect(typed._links).not.toBe(state._links);
      });

      it('strips _embedded at every depth from patch props', () => {
        const state = { _links: { self: { href: 'https://foxy.test/foo' } }, meta: { y: 1 } };
        const result = sync(state, {
          data: { _links: { self: { href: 'https://foxy.test/foo' } }, meta: { _embedded: 'x', y: 2 } } as TestResource,
          source: 'https://foxy.test/foo',
        });

        expect(result).toEqual({ _links: { self: { href: 'https://foxy.test/foo' } }, meta: { y: 2 } });
      });

      it('skips collections as patch sources but still patches their items', () => {
        const page = {
          _embedded: { items: [{ _links: { self: { href: 'https://foxy.test/foos/0' } }, a: 2 }] },
          _links: { first: { href: 'https://foxy.test/foos' }, self: { href: 'https://foxy.test/foos' } },
          total: 2,
        };

        const oldPage = { ...page, _embedded: { items: [] }, total: 1 };
        const oldItem = { _links: { self: { href: 'https://foxy.test/foos/0' } }, a: 1 };

        expect(sync(oldPage, { data: page, source: page._links.self.href })).toBe(oldPage);
        expect(sync(oldItem, { data: page, source: page._links.self.href })).toEqual({ ...oldItem, a: 2 });
      });

      it('uses the last occurrence when a resource appears more than once in the update', () => {
        const state = { _links: { self: { href: 'https://foxy.test/foo' } }, v: 0 };
        const result = sync(state, {
          data: {
            _embedded: {
              x: { _links: { self: { href: 'https://foxy.test/foo' } }, v: 1 },
              y: { _links: { self: { href: 'https://foxy.test/foo' } }, v: 2 },
            },
            _links: { self: { href: 'https://foxy.test/bar' } },
          } as TestResource,
          source: 'https://foxy.test/bar',
        });

        expect(result).toEqual({ ...state, v: 2 });
      });

      it('returns the same reference when nothing changes', () => {
        const state = { _links: { self: { href: 'https://foxy.test/foo' } }, v: 1 };
        expect(sync(state, { data: { ...state }, source: 'https://foxy.test/foo' })).toBe(state);
      });

      it('handles circular references in shared data and in local state', () => {
        const loop: Record<string, unknown> = { x: 1 };
        loop.self = loop;

        const state = {
          _embedded: { bar: { _links: { self: { href: 'https://foxy.test/bar' } }, v: 1 } },
          _links: { self: { href: 'https://foxy.test/foo' } },
          loop,
        };

        const result = sync(state, {
          data: { _links: { self: { href: 'https://foxy.test/bar' } }, loop, v: 2 } as TestResource,
          source: 'https://foxy.test/bar',
        }) as typeof state & { _embedded: { bar: { loop: typeof loop; v: number } } };

        expect(result._embedded.bar.v).toBe(2);
        expect(result._embedded.bar.loop.x).toBe(1);
        expect(result.loop.x).toBe(1);
      });

      it('matches related URIs without query string or hash', () => {
        const state = { _links: { self: { href: 'https://foxy.test/foos?limit=20#top' } } };
        const update = () =>
          sync(state, { data: null, related: ['https://foxy.test/foos'], source: 'https://foxy.test/foos/0' });
        expect(update).toThrow(UpdateError);
      });
    });
  });
});
