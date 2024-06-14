import { PaymentCardEmbed } from '../../src/customer/PaymentCardEmbed';

const testMessageChannel = {
  port1: {
    addEventListener: jest.fn(),
    close: jest.fn(),
    postMessage: jest.fn(),
    removeEventListener: jest.fn(),
    start: jest.fn(),
  },
  port2: {
    close: jest.fn(),
  },
};

const testIframe = {
  addEventListener: jest.fn(),
  contentWindow: { postMessage: jest.fn() },
  remove: jest.fn(),
  removeEventListener: jest.fn(),
  src: '',
  style: {} as Record<string, string>,
};

class TestPaymentCardEmbed extends PaymentCardEmbed {
  protected _createMessageChannel(): MessageChannel {
    return (testMessageChannel as unknown) as MessageChannel;
  }

  protected _createIframe(): HTMLIFrameElement {
    return (testIframe as unknown) as HTMLIFrameElement;
  }

  protected _createId(): string {
    return 'test';
  }
}

class TestElement {
  append = jest.fn();
}

describe('Customer', () => {
  describe('PaymentCardEmbed', () => {
    beforeEach(() => jest.clearAllMocks());

    it('creates an instance of PaymentCardEmbed', () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      expect(embed).toBeInstanceOf(PaymentCardEmbed);
    });

    it('mounts the embed on .mount()', async () => {
      const embed = new TestPaymentCardEmbed({
        disabled: true,
        lang: 'es',
        url: 'https://embed.foxy.test/v1.html?demo=default',
      });

      const mockRoot = new TestElement();
      const unmountMethod = jest.spyOn(embed, 'unmount');
      const configureMethod = jest.spyOn(embed, 'configure');
      const mountPromise = embed.mount((mockRoot as unknown) as Element);

      // First, it must unmount the embed
      expect(unmountMethod).toHaveBeenCalledTimes(1);

      // Then, it must create an iframe and append it to the root element
      expect(testIframe.addEventListener).toHaveBeenCalledTimes(1);
      expect(testIframe.addEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      expect(testIframe.style.transition).toBe('height 0.15s ease');
      expect(testIframe.style.margin).toBe('-2px');
      expect(testIframe.style.height).toBe('100px');
      expect(testIframe.style.width).toBe('calc(100% + 4px)');
      expect(testIframe.src).toBe('https://embed.foxy.test/v1.html?demo=default');
      expect(mockRoot.append).toHaveBeenCalledTimes(1);

      // It must also create a message channel and start listening for messages
      expect(testMessageChannel.port1.addEventListener).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(testMessageChannel.port1.start).toHaveBeenCalledTimes(1);

      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      await new Promise(resolve => setTimeout(resolve, 0));

      // When iframe is loaded, it must send a message to the iframe to establish connection
      loadListener({ currentTarget: testIframe });
      expect(testIframe.contentWindow.postMessage).toHaveBeenCalledTimes(1);
      expect(testIframe.contentWindow.postMessage).toHaveBeenCalledWith('connect', '*', [testMessageChannel.port2]);

      // Finally, when iframe responds with "ready" event, it must resolve the mounting promise
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await expect(mountPromise).resolves.toBeUndefined();

      // And must configure the embed with the config passed to constructor
      expect(configureMethod).toHaveBeenCalledTimes(1);
      expect(configureMethod).toHaveBeenCalledWith({ disabled: true, lang: 'es' });
    });

    it('unmounts the embed on .unmount()', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);

      jest.clearAllMocks();
      embed.unmount();

      // It must close the message channel and remove event listeners
      expect(testMessageChannel.port2.close).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.close).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.removeEventListener).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));

      // It must remove the iframe and its event listeners
      expect(testIframe.removeEventListener).toHaveBeenCalledTimes(1);
      expect(testIframe.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function));
      expect(testIframe.remove).toHaveBeenCalledTimes(1);

      // If there's a mounting promise, it must reject it
      await expect(mountingPromise).rejects.toBeUndefined();
    });

    it('does not fail if .unmount() is called before .mount()', () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      expect(() => embed.unmount()).not.toThrow();
    });

    it('sends "clear" event to iframe on .clear()', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);

      // Mount the mock embed
      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      await new Promise(resolve => setTimeout(resolve, 0));
      loadListener({ currentTarget: testIframe });
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await mountingPromise;
      jest.clearAllMocks();

      // Clear the fields
      embed.clear();

      // It must send a message to the iframe via MessageChannel with "clear" event
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledWith(JSON.stringify({ type: 'clear' }));
    });

    it('does not fail if .clear() is called before .mount()', () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      expect(() => embed.clear()).not.toThrow();
    });

    it('sends "config" event to iframe on .configure()', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);

      // Mount the mock embed
      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      await new Promise(resolve => setTimeout(resolve, 0));
      loadListener({ currentTarget: testIframe });
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await mountingPromise;
      jest.clearAllMocks();

      // Clear the fields
      embed.configure({
        translations: { default: { 'cc-number': { label: 'Test' } } },
        // eslint-disable-next-line sort-keys
        disabled: true,
        lang: 'es',
      });

      // It must send a message to the iframe via MessageChannel with "config" event
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledWith(
        JSON.stringify({
          type: 'config',
          // eslint-disable-next-line sort-keys
          translations: { default: { 'cc-number': { label: 'Test' } } },
          // eslint-disable-next-line sort-keys
          disabled: true,
          lang: 'es',
        })
      );
    });

    it('does not fail if .configure() is called before .mount()', () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      expect(() => embed.configure({ disabled: true })).not.toThrow();
    });

    it('requests tokenization on .tokenize() (positive path)', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);

      // Mount the mock embed
      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      await new Promise(resolve => setTimeout(resolve, 0));
      loadListener({ currentTarget: testIframe });
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await mountingPromise;
      jest.clearAllMocks();

      // Request tokenization
      const tokenizePromise = embed.tokenize();

      // It must send a message to the iframe via MessageChannel with "tokenize_request" event
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledWith(
        JSON.stringify({ id: 'test', type: 'tokenization_request' })
      );

      // On tokenization response with a token, it must resolve the promise
      // eslint-disable-next-line sort-keys
      messageListener({ data: JSON.stringify({ id: 'test', type: 'tokenization_response', token: 'test-token' }) });
      await expect(tokenizePromise).resolves.toBe('test-token');
    });

    it('requests tokenization on .tokenize() (negative path)', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);

      // Mount the mock embed
      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      await new Promise(resolve => setTimeout(resolve, 0));
      loadListener({ currentTarget: testIframe });
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await mountingPromise;
      jest.clearAllMocks();

      // Request tokenization
      const tokenizePromise = embed.tokenize();

      // It must send a message to the iframe via MessageChannel with "tokenize_request" event
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledTimes(1);
      expect(testMessageChannel.port1.postMessage).toHaveBeenCalledWith(
        JSON.stringify({ id: 'test', type: 'tokenization_request' })
      );

      // On tokenization response without a token, it must reject the promise
      messageListener({ data: JSON.stringify({ id: 'test', type: 'tokenization_response' }) });
      await expect(tokenizePromise).rejects.toBeUndefined();
    });

    it('rejects tokenization promise if iframe is not mounted', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      await expect(embed.tokenize()).rejects.toBeUndefined();
    });

    it('sets iframe height on "resize" event', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);

      // Mount the mock embed
      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      await new Promise(resolve => setTimeout(resolve, 0));
      loadListener({ currentTarget: testIframe });
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await mountingPromise;
      jest.clearAllMocks();

      // Mock "resize" event from iframe
      // eslint-disable-next-line sort-keys
      messageListener({ data: JSON.stringify({ type: 'resize', height: '200px' }) });

      // It must set the height of the iframe
      expect(testIframe.style.height).toBe('200px');
    });

    it('calls .onsubmit on "submit" event', async () => {
      const embed = new TestPaymentCardEmbed({ url: 'https://embed.foxy.test/v1.html?demo=default' });
      const mountingPromise = embed.mount((new TestElement() as unknown) as Element);
      const loadListener = testIframe.addEventListener.mock.calls.find(([event]) => event === 'load')[1];
      const messageListener = testMessageChannel.port1.addEventListener.mock.calls.find(([e]) => e === 'message')[1];
      const onSubmit = jest.fn();

      await new Promise(resolve => setTimeout(resolve, 0));
      loadListener({ currentTarget: testIframe });
      messageListener({ data: JSON.stringify({ type: 'ready' }) });
      await mountingPromise;
      jest.clearAllMocks();
      embed.onsubmit = onSubmit;
      messageListener({ data: JSON.stringify({ type: 'submit' }) });

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });
});
