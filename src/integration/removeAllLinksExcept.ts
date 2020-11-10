import { TraverseContext } from 'traverse';

/**
 * Creates a https://www.npmjs.com/package/traverse mapper that removes all
 * relations from the response object that aren't listed in the `linksToKeep` array.
 *
 * @param linksToKeep Array of relation keys to keep
 * @example const sanitizedResponse = traverse(response).map(removeAllLinksExcept("self", "next"));
 * @returns A `traverse` mapper function.
 */
export function removeAllLinksExcept(...linksToKeep: string[]): () => void {
  return function (this: TraverseContext): void {
    if (typeof this.key !== 'undefined' && this.parent?.key === '_links' && linksToKeep.includes(this.key) === false) {
      this.remove();
    }
  };
}
