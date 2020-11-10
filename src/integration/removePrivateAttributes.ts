import { TraverseContext } from 'traverse';

/**
 * A https://www.npmjs.com/package/traverse mapper that removes all
 * private attributes from the response object.
 *
 * @param this object traversal context
 * @param v current property value
 * @example const sanitizedResponse = traverse(response).map(removePrivateAttributes);
 */

/**
 * @param this
 * @param v
 */
export function removePrivateAttributes(this: TraverseContext, v: any): void {
  if (this.key === 'fx:attributes' && Array.isArray(v)) {
    this.update(
      v.filter((attr: any) => attr.visibility === 'public'),
      true
    );
  }
}
