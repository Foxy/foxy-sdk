import { TraverseContext } from 'traverse';
import { thisV8N } from './v8n';
import v8n from 'v8n';

const linksToKeepV8N = v8n().every.string();

/**
 * Creates a https://www.npmjs.com/package/traverse mapper that removes all
 * relations from the response object that aren't listed in the `linksToKeep` array.
 *
 * @param linksToKeep Array of relation keys to keep
 * @example const sanitizedResponse = traverse(response).map(removeAllLinksExcept("self", "next"));
 * @returns A `traverse` mapper function.
 */
export function removeAllLinksExcept(...linksToKeep: string[]): () => void {
  linksToKeepV8N.check(linksToKeep);

  return function (this: TraverseContext): void {
    thisV8N.check(this);

    if (typeof this.key !== 'undefined' && this.parent?.key === '_links' && linksToKeep.includes(this.key) === false) {
      this.remove();
    }
  };
}
