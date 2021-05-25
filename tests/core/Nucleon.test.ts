import { Context, machine } from '../../src/core/Nucleon';
import { assign, interpret } from 'xstate';

describe('Core', () => {
  describe('Nucleon', () => {
    it('starts with null context.data by default', () => {
      const service = interpret(machine).start();
      expect(service.state.context).toHaveProperty('data', null);
    });

    it('starts with null context.edits by default', () => {
      const service = interpret(machine).start();
      expect(service.state.context).toHaveProperty('edits', null);
    });

    it('starts with empty context.errors by default', () => {
      const service = interpret(machine).start();
      expect(service.state.context).toHaveProperty('errors', []);
      service.stop();
    });

    it('starts in idle.template.clean.valid state by default', () => {
      const service = interpret(machine).start();
      expect(service.state.matches({ idle: { template: { clean: 'valid' } } })).toBe(true);
      service.stop();
    });

    it('starts in idle.template.clean.invalid state with custom validator failing the check', () => {
      const validate = assign<Context>({ errors: ['oh noes'] });
      const service = interpret(machine.withConfig({ actions: { validate } })).start();
      expect(service.state.matches({ idle: { template: { clean: 'invalid' } } })).toBe(true);
      service.stop();
    });

    it('saves edits to context.edits while keeping context.data intact', () => {
      const service = interpret(machine).start();
      service.send({ data: { foo: 'bar' }, type: 'EDIT' });
      expect(service.state.context).toHaveProperty('edits.foo', 'bar');
      expect(service.state.context).toHaveProperty('data', null);
      service.stop();
    });

    it('resets edits on UNDO event', () => {
      const service = interpret(machine).start();
      service.send({ data: { foo: 'bar' }, type: 'EDIT' });
      service.send({ type: 'UNDO' });
      expect(service.state.context).toHaveProperty('edits', null);
      service.stop();
    });

    it('switches to idle.template.dirty.valid when edited without validator', () => {
      const service = interpret(machine).start();
      service.send({ data: { foo: 'bar' }, type: 'EDIT' });
      expect(service.state.matches({ idle: { template: { dirty: 'valid' } } })).toBe(true);
      service.stop();
    });

    it('switches to idle.template.dirty.invalid when edited with validator failing the check', () => {
      const validate = assign<Context>({ errors: ['thy wrong'] });
      const service = interpret(machine.withConfig({ actions: { validate } })).start();
      service.send({ data: { foo: 'bar' }, type: 'EDIT' });
      expect(service.state.matches({ idle: { template: { dirty: 'invalid' } } })).toBe(true);
      service.stop();
    });

    it('creates a resource from a valid template using sendPost service', async () => {
      const response = { baz: 'qux', foo: 'bar' };
      const sendPost = () => Promise.resolve(response);
      const service = interpret(machine.withConfig({ services: { sendPost } })).start();

      await new Promise<void>(resolve => {
        service.send({ data: { foo: 'bar' }, type: 'EDIT' });
        service.send({ type: 'SUBMIT' });

        expect(service.state.matches({ busy: 'creating' })).toBe(true);

        service.onTransition(({ changed, context, matches }) => {
          if (!changed || !matches({ idle: { snapshot: { clean: 'valid' } } })) return;

          expect(context).toHaveProperty('data', response);
          expect(context).toHaveProperty('edits', null);
          resolve();
        });
      });

      service.stop();
    });

    it('switches to fail state when sendPost errors', async () => {
      const sendPost = () => Promise.reject();
      const service = interpret(machine.withConfig({ services: { sendPost } })).start();

      await new Promise<void>(resolve => {
        service.send({ data: { foo: 'bar' }, type: 'EDIT' });
        service.send({ type: 'SUBMIT' });
        service.onTransition(({ matches }) => matches('fail') && resolve());
      });

      expect(service.state.matches('fail')).toBe(true);
      service.stop();
    });

    it('does not submit invalid templates', async () => {
      const validate = assign<Context>({ errors: ['thy wrong'] });
      const service = interpret(machine.withConfig({ actions: { validate } })).start();
      service.send({ data: { foo: 'bar' }, type: 'EDIT' });
      service.send({ type: 'SUBMIT' });
      expect(service.state.matches('idle')).toBe(true);
      service.stop();
    });

    it('starts in idle.snapshot.clean.valid state when provided with context.data', () => {
      const context = { data: { foo: 'bar' }, edits: null, errors: [], failure: null };
      const service = interpret(machine.withContext(context)).start();
      expect(service.state.matches({ idle: { snapshot: { clean: 'valid' } } })).toBe(true);
      service.stop();
    });

    it('starts in idle.snapshot.clean.invalid state when provided with context.data and a failing validator', () => {
      const validate = assign<Context>({ errors: ctx => ('foo' in (ctx.data ?? {}) ? ['no foos'] : []) });
      const context = { data: { foo: 'bar' }, edits: null, errors: [], failure: null };
      const config = { actions: { validate } };
      const service = interpret(machine.withContext(context).withConfig(config)).start();
      expect(service.state.matches({ idle: { snapshot: { clean: 'invalid' } } })).toBe(true);
      service.stop();
    });

    it('switches to idle.snapshot.dirty.valid when edited with context.data and without validator', () => {
      const context = { data: { foo: 'bar' }, edits: null, errors: [], failure: null };
      const service = interpret(machine.withContext(context)).start();
      service.send({ data: { foo: 'baz' }, type: 'EDIT' });
      expect(service.state.matches({ idle: { snapshot: { dirty: 'valid' } } })).toBe(true);
      service.stop();
    });

    it('switches to idle.snapshot.dirty.invalid when edited with context.data and failing validator', () => {
      const validate = assign<Context>({ errors: ctx => ('foo' in (ctx.edits ?? {}) ? ['no foos'] : []) });
      const context = { data: {}, edits: null, errors: [], failure: null };
      const config = { actions: { validate } };
      const service = interpret(machine.withContext(context).withConfig(config)).start();

      service.send({ data: { foo: 'bar' }, type: 'EDIT' });

      expect(service.state.toStrings()).toContain('idle.snapshot.dirty.invalid');
      expect(service.state.matches({ idle: { snapshot: { dirty: 'invalid' } } })).toBe(true);

      service.stop();
    });

    it('does not submit invalid edits', async () => {
      const validate = assign<Context>({ errors: ctx => ('foo' in (ctx.edits ?? {}) ? ['no foos'] : []) });
      const context = { data: {}, edits: null, errors: [], failure: null };
      const config = { actions: { validate } };
      const service = interpret(machine.withContext(context).withConfig(config)).start();

      service.send({ data: { foo: 'bar' }, type: 'EDIT' });
      service.send({ type: 'SUBMIT' });

      expect(service.state.matches('idle')).toBe(true);

      service.stop();
    });

    it('updates a resource with valid edits using sendPatch service', async () => {
      const sendPatch = () => Promise.resolve(response);
      const response = { baz: 'qux', foo: 'bar' };
      const context = { data: { baz: 'qux' }, edits: null, errors: [], failure: null };
      const config = { services: { sendPatch } };
      const service = interpret(machine.withContext(context).withConfig(config)).start();

      await new Promise<void>(resolve => {
        service.send({ data: { foo: 'bar' }, type: 'EDIT' });
        service.send({ type: 'SUBMIT' });

        expect(service.state.matches({ busy: 'updating' })).toBe(true);

        service.onTransition(({ changed, context, matches }) => {
          if (!changed || !matches({ idle: { snapshot: { clean: 'valid' } } })) return;

          expect(context).toHaveProperty('data', response);
          expect(context).toHaveProperty('edits', null);
          resolve();
        });
      });

      service.stop();
    });

    it('switches to fail state when sendPatch errors', async () => {
      const sendPatch = () => Promise.reject();
      const context = { data: { baz: 'qux' }, edits: null, errors: [], failure: null };
      const config = { services: { sendPatch } };
      const service = interpret(machine.withContext(context).withConfig(config)).start();

      await new Promise<void>(resolve => {
        service.send({ data: { foo: 'bar' }, type: 'EDIT' });
        service.send({ type: 'SUBMIT' });
        service.onTransition(({ matches }) => matches('fail') && resolve());
      });

      expect(service.state.matches('fail')).toBe(true);
      service.stop();
    });

    it('deletes a resource using sendDelete and clears context on DELETE event', async () => {
      const sendDelete = () => Promise.resolve({});
      const config = { services: { sendDelete } };
      const service = interpret(machine.withConfig(config)).start();

      await new Promise<void>(resolve => {
        service.send({ type: 'DELETE' });

        expect(service.state.matches({ busy: 'deleting' })).toBe(true);

        service.onTransition(({ changed, context, matches }) => {
          if (!changed || !matches({ idle: { template: { clean: 'valid' } } })) return;

          expect(context).toHaveProperty('data', null);
          expect(context).toHaveProperty('edits', null);
          expect(context).toHaveProperty('errors', []);

          resolve();
        });
      });

      service.stop();
    });

    it('fetches a resource using sendGet and saves to context on FETCH event', async () => {
      const response = { foo: 'bar' };
      const sendGet = () => Promise.resolve(response);
      const config = { services: { sendGet } };
      const service = interpret(machine.withConfig(config)).start();

      await new Promise<void>(resolve => {
        service.send({ type: 'FETCH' });

        expect(service.state.matches({ busy: 'fetching' })).toBe(true);

        service.onTransition(({ changed, context, matches }) => {
          if (!changed || !matches({ idle: { snapshot: { clean: 'valid' } } })) return;

          expect(context).toHaveProperty('data', response);
          expect(context).toHaveProperty('edits', null);
          expect(context).toHaveProperty('errors', []);

          resolve();
        });
      });

      service.stop();
    });
  });
});
