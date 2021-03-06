import '../core/v8n.js';

import v8n from 'v8n';

export const thisV8N = v8n().schema({
  key: v8n().optional(v8n().string()),
  parent: v8n().optional(v8n().object()),
  remove: v8n().typeOf('function'),
  update: v8n().typeOf('function'),
});
