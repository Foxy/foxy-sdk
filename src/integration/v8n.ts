import v8n from 'v8n';

v8n.extend({
  typeOf: (expected: string) => {
    return (value: unknown) => typeof value === expected;
  },
});

export const thisV8N = v8n().schema({
  key: v8n().optional(v8n().string()),
  parent: v8n().optional(v8n().object()),
  update: v8n().typeOf('function'),
});
