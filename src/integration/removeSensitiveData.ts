import { TraverseContext } from 'traverse';

/**
 * A https://www.npmjs.com/package/traverse mapper that removes all
 * sensitive data such as password hashes or internal identifiers from the response object.
 *
 * @param this traversal context
 * @example const sanitizedResponse = traverse(response).map(removeSensitiveData);
 */

/**
 * @param this
 */
export function removeSensitiveData(this: TraverseContext): void {
  const key = this.key;
  if (typeof key === 'undefined') return;

  const propsToRemove = ['password', 'third_party_id'];
  if (propsToRemove.find(v => key.startsWith(v))) this.remove();
}
