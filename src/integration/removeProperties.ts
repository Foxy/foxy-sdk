import { TraverseContext } from 'traverse';
import { thisV8N } from './v8n';
import v8n from 'v8n';

const propsToRemoveV8N = v8n().every.string();

/**
 * Creates a https://www.npmjs.com/package/traverse mapper that removes all
 * properties from the response object that match the keys of the `propsToRemove` array.
 *
 * @param propsToRemove Array of properties to remove.
 * @example const sanitizedResponse = traverse(response).map(removeProperties("password_hash", "third_party_id"));
 * @returns A `traverse` mapper function.
 */
export function removeProperties(...propsToRemove: string[]): () => void {
  propsToRemoveV8N.check(propsToRemove);
  return function (this: TraverseContext): void {
    thisV8N.check(this);
    if (this.key && propsToRemove.includes(this.key)) this.remove();
  };
}
