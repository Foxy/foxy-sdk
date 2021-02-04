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
      rumour.track(update => (syncedData = update(syncedData)));

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
      rumour.track(update => (syncedData = update(syncedData)));

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
      rumour.track(update => (syncedData = update(syncedData)));

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
      rumour.track(update => (syncedData = update(syncedData)));
      rumour.share({ data: null, source: syncedData._links.self.href });

      expect(syncedData).toBeNull();

      rumour.cease();
    });

    it('deletes embedded resource if deletion is committed', () => {
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
      rumour.track(update => (syncedData = update(syncedData)));
      rumour.share({ data: null, source: 'https://foxy.test/foo' });

      expect(syncedData).toEqual({
        _embedded: {},
        _links: { self: { href: 'https://foxy.test/bar' } },
        bar: 'qux',
      });

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
          syncedData = update(syncedData);
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
      const untrackCallback = rumour.track(update => (syncedData = update(syncedData)));

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
      rumour.track(update => (syncedData = update(syncedData)));

      rumour.share({ data: trackedUpdate, source: trackedUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);

      rumour.cease();
      rumour.share({ data: ignoredUpdate, source: ignoredUpdate._links.self.href });
      expect(syncedData).toEqual(trackedUpdate);
    });
  });
});
