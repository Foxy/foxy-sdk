import { URL } from 'url';
import v8n from 'v8n';

v8n.extend({
  curieChain: () => {
    return (value: unknown) =>
      Array.isArray(value) && value[0] instanceof URL && value.slice(1).every(i => typeof i === 'string');
  },
  typeOf: (expected: string) => {
    return (value: unknown) => typeof value === expected;
  },
});

export { v8n };

export const storageV8N = v8n().schema({
  clear: v8n().typeOf('function'),
  getItem: v8n().typeOf('function'),
  key: v8n().typeOf('function'),
  length: v8n().number(),
  removeItem: v8n().typeOf('function'),
  setItem: v8n().typeOf('function'),
});
