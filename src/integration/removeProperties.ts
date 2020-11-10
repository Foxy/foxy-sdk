import { TraverseContext } from 'traverse';

/**
 * Creates a https://www.npmjs.com/package/traverse mapper that removes all
 * properties from the response object that match the keys of the `propsToRemove` array.
 *
 * @param propsToRemove array of properties to remove
 * @example const sanitizedResponse = traverse(response).map(removeProperties("password_hash", "third_party_id"));
 */

/**
 * @param {...any} propsToRemove
 */
export function removeProperties(...propsToRemove: string[]): () => void {
  return function (this: TraverseContext): void {
    if (this.key && propsToRemove.includes(this.key)) this.remove();
  };
}
