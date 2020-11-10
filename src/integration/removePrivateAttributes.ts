import { TraverseContext } from 'traverse';

/**
 * A https://www.npmjs.com/package/traverse mapper that removes all
 * private attributes from the response object.
 *
 * @param this Object traversal context.
 * @param v Current property value.
 * @example const sanitizedResponse = traverse(response).map(removePrivateAttributes);
 */
export function removePrivateAttributes(this: TraverseContext, v: any): void {
  if (this.key === 'fx:attributes' && Array.isArray(v)) {
    this.update(
      v.filter((attr: any) => attr.visibility === 'public'),
      true
    );
  }
}
