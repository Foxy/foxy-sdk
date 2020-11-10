import { TraverseContext } from 'traverse';
import { thisV8N } from './v8n';

/**
 * A https://www.npmjs.com/package/traverse mapper that removes all
 * private attributes from the response object.
 *
 * @param this Object traversal context.
 * @param value Current property value.
 * @example const sanitizedResponse = traverse(response).map(removePrivateAttributes);
 */
export function removePrivateAttributes(this: TraverseContext, value: unknown): void {
  thisV8N.check(this);

  if (this.key !== 'fx:attributes' || !Array.isArray(value)) return;

  const newValue = value.filter((attribute: unknown) => {
    if (typeof attribute !== 'object' || attribute === null) return true;
    return (attribute as Record<string, unknown>).visibility === 'public';
  });

  this.update(newValue, true);
}
