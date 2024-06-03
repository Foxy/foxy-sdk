import type { PaymentCardEmbedConfig } from './types';

/**
 * A convenience wrapper for the payment card embed iframe. You don't have to use
 * this class to embed the payment card iframe, but it provides a more convenient
 * way to interact with the iframe and listen to its events.
 *
 * @example
 * const embed = new PaymentCardEmbed({
 *   url: 'https://embed.foxy.io/v1?template_set_id=123'
 * });
 *
 * await embed.mount(document.body);
 * console.log('Token:', await embed.tokenize());
 */
export class PaymentCardEmbed {
  private __tokenizationRequests: {
    resolve: (token: string) => void;
    reject: () => void;
    id: string;
  }[] = [];

  private __iframeMessageHandler = (evt: MessageEvent) => {
    const data = JSON.parse(evt.data);

    if (data.type === 'resize') {
      if (this.__iframe) this.__iframe.style.height = data.height;
    } else if (data.type === 'tokenization_response') {
      const request = this.__tokenizationRequests.find(r => r.id === data.id);
      data.token ? request?.resolve(data.token) : request?.reject();
      this.__tokenizationRequests = this.__tokenizationRequests.filter(r => r.id !== data.id);
    } else if (data.type === 'ready') {
      this.configure(this.__config);
      this.__mountingTask?.resolve();
    }
  };

  private __iframeLoadHandler = (evt: Event) => {
    if (this.__channel) {
      const contentWindow = (evt.currentTarget as HTMLIFrameElement).contentWindow;
      if (!contentWindow) throw new Error('Content window is not available.');
      contentWindow.postMessage('connect', '*', [this.__channel.port2]);
    }
  };

  private __mountingTask: { resolve: () => void; reject: () => void } | null = null;

  private __channel: MessageChannel | null = null;

  private __iframe: HTMLIFrameElement | null = null;

  private __config: PaymentCardEmbedConfig;

  private __url: string;

  constructor({ url, ...config }: { url: string } & PaymentCardEmbedConfig) {
    this.__config = config;
    this.__url = url;
  }

  /**
   * Updates the configuration of the payment card embed.
   * You can change style, translations, language and interactivity settings.
   * To change the URL of the payment card embed, you need to create a new instance.
   * You are not required to provide the full configuration object, only the properties you want to change.
   *
   * @param config - The new configuration.
   */
  configure(config: PaymentCardEmbedConfig): void {
    this.__config = config;
    const message = { type: 'config', ...config };
    this.__channel?.port1.postMessage(JSON.stringify(message));
  }

  /**
   * Requests the tokenization of the card data.
   *
   * @returns A promise that resolves with the tokenized card data.
   */
  tokenize(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.__channel) {
        const id = this._createId();
        this.__tokenizationRequests.push({ id, reject, resolve });
        this.__channel.port1.postMessage(JSON.stringify({ id, type: 'tokenization_request' }));
      } else {
        reject();
      }
    });
  }

  /**
   * Safely removes the embed iframe from the parent node,
   * closing the message channel and cleaning up event listeners.
   */
  unmount(): void {
    this.__channel?.port1.removeEventListener('message', this.__iframeMessageHandler);
    this.__channel?.port1.close();
    this.__channel?.port2.close();
    this.__channel = null;

    this.__iframe?.removeEventListener('load', this.__iframeLoadHandler);
    this.__iframe?.remove();
    this.__iframe = null;

    this.__mountingTask?.reject();
    this.__mountingTask = null;
  }

  /**
   * Mounts the payment card embed in the given root element. If the embed is already mounted,
   * it will be unmounted first.
   *
   * @param root - The root element to mount the embed in.
   * @returns A promise that resolves when the embed is mounted.
   */
  mount(root: Element): Promise<void> {
    this.unmount();

    this.__channel = this._createMessageChannel();
    this.__channel.port1.addEventListener('message', this.__iframeMessageHandler);
    this.__channel.port1.start();

    this.__iframe = this._createIframe(root);
    this.__iframe.addEventListener('load', this.__iframeLoadHandler);
    this.__iframe.style.transition = 'height 0.15s ease';
    this.__iframe.style.margin = '-2px';
    this.__iframe.style.height = '100px';
    this.__iframe.style.width = 'calc(100% + 4px)';
    this.__iframe.src = this.__url;

    root.append(this.__iframe);

    return new Promise<void>((resolve, reject) => {
      this.__mountingTask = { reject, resolve };
    });
  }

  /**
   * Clears the card data from the embed.
   * No-op if the embed is not mounted.
   */
  clear(): void {
    this.__channel?.port1.postMessage(JSON.stringify({ type: 'clear' }));
  }

  /* istanbul ignore next */
  protected _createMessageChannel(): MessageChannel {
    return new MessageChannel();
  }

  /* istanbul ignore next */
  protected _createIframe(root: Element): HTMLIFrameElement {
    return root.ownerDocument.createElement('iframe');
  }

  /* istanbul ignore next */
  protected _createId(): string {
    return `${Date.now()}${Math.random().toFixed(6).slice(2)}`;
  }
}
