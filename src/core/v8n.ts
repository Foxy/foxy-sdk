import v8n from 'v8n';

v8n.extend({
  typeOf: (expected: string) => {
    return (value: unknown) => typeof value === expected;
  },
});
