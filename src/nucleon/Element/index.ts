import { Interpreter, interpret } from 'xstate';
import { LitElement, PropertyDeclarations } from 'lit-element';
import {
  NucleonElementContext,
  NucleonElementError,
  NucleonElementEvent,
  NucleonElementSchema,
  NucleonElementStateValue,
  NucleonElementV8N,
  Resource,
} from './machine/types';
import { TFunction, i18n } from 'i18next';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { createBaseMachine } from './machine';
import { get } from 'lodash-es';

type NucleonElementParameters<T extends Resource = any> = {
  resourceI18N?: NucleonElementV8N<T>;
  breakpoints?: Record<string, number>;
  i18n?: {
    instance: i18n;
    whenReady: Promise<TFunction>;
  };
};

export abstract class NucleonElement<TResource extends Resource = any> extends ScopedElementsMixin(LitElement) {
  static get resourceV8N(): NucleonElementV8N {
    return {};
  }

  static get properties(): PropertyDeclarations {
    return {
      group: { noAccessor: true, reflect: true, type: String },
      href: { noAccessor: true, reflect: true, type: String },
      lang: { noAccessor: true, reflect: true, type: String },
      ns: { noAccessor: true, reflect: true, type: String },
      parent: { noAccessor: true, reflect: true, type: String },
    };
  }

  private readonly __deferredEvents: NucleonElementEvent[] = [];

  private readonly __service: Interpreter<NucleonElementContext, NucleonElementSchema, NucleonElementEvent>;

  constructor(init?: NucleonElementParameters) {
    super();

    const resourceV8N = (this.constructor as typeof NucleonElement).resourceV8N as NucleonElementV8N<TResource>;
    const machine = createBaseMachine({ ...init, element: this, resourceV8N });

    this.__service = interpret(machine);
  }

  get errors(): NucleonElementError[] {
    return this._getContext('errors');
  }

  get ns(): string {
    return this._getContext('i18n.ns') ?? '';
  }

  set ns(data: string) {
    this._send({ data, type: 'SET_I18N_NS' });
  }

  get lang(): string {
    return this._getContext('i18n.lang') ?? '';
  }

  set lang(data: string) {
    this._send({ data, type: 'SET_I18N_LANG' });
  }

  get href(): string {
    return this._getContext('href') ?? '';
  }

  set href(data: string) {
    this._send({ data, type: 'SET_HREF' });
  }

  get group(): string {
    return this._getContext('group');
  }

  set group(data: string) {
    this._send({ data, type: 'SET_GROUP' });
  }

  get parent(): string {
    return this._getContext('parent') ?? '';
  }

  set parent(data: string) {
    this._send({ data, type: 'SET_PARENT' });
  }

  get resource(): TResource | null {
    return this._getContext('resource') ?? null;
  }

  set resource(data: TResource | null) {
    this._send({ data, type: 'SET_RESOURCE' });
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.__service.onTransition(({ changed }) => changed && this.requestUpdate());
    this.__service.onChange(() => this.requestUpdate());
    this.__service.start();

    this.__deferredEvents.forEach(evt => this.__service.send(evt));
    this.__deferredEvents.length = 0;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__service.stop();
  }

  protected get _t(): TFunction {
    return this._getContext('i18n.t');
  }

  protected _getErrorMessages(): Record<string, string> {
    return this.errors
      .filter(err => err.type === 'input')
      .reduce((map, err) => ({ ...map, [err.target as string]: this._t(err.code as string) }), {});
  }

  protected _setProperty(data: Partial<TResource>): void {
    this._send({ data, type: 'SET_PROPERTY' });
  }

  protected _restore(): void {
    this._send({ type: 'RESTORE' });
  }

  protected _reload(): void {
    this._send({ type: 'RELOAD' });
  }

  protected _submit(): void {
    this._send({ type: 'SUBMIT' });
  }

  protected _delete(): void {
    this._send({ type: 'DELETE' });
  }

  protected _getContext<TValue>(path: string): TValue {
    const isInitialized = this.__service.initialized;
    const defaultValue = get(this.__service.machine.context, path);
    const value = isInitialized ? get(this.__service.state.context, path) : defaultValue;

    return value;
  }

  protected _send(evt: NucleonElementEvent): void {
    const isInitialized = this.__service.initialized;
    isInitialized ? this.__service.send(evt) : this.__deferredEvents.push(evt);
  }

  protected _is(state: NucleonElementStateValue): boolean {
    return this.__service.state.matches(state);
  }
}
