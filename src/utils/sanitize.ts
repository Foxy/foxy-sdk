import { TraverseContext } from "traverse";

type Mapper = (this: TraverseContext, v: any) => void;

/**
 * Runs multiple https://www.npmjs.com/package/traverse mappers
 * during the node visit.
 *
 * @param mappers list of mapper functions to run
 * @example
 * const sanitizedResponse = traverse(response).map(all(
 *   removePrivateAttributes,
 *   removeProperties("third_party_id")
 * ));
 */
export function all(...mappers: Mapper[]): Mapper {
  return function (this: TraverseContext, v: any): void {
    mappers.forEach((mapper) => mapper.call(this, v));
  };
}

/**
 * A https://www.npmjs.com/package/traverse mapper that removes all
 * private attributes from the response object.
 *
 * @param this object traversal context
 * @param v current property value
 * @example const sanitizedResponse = traverse(response).map(removePrivateAttributes);
 */
export function removePrivateAttributes(this: TraverseContext, v: any): void {
  if (this.key === "fx:attributes" && Array.isArray(v)) {
    this.update(
      v.filter((attr: any) => attr.visibility === "public"),
      true
    );
  }
}

/**
 * A https://www.npmjs.com/package/traverse mapper that removes all
 * sensitive data such as password hashes or internal identifiers from the response object.
 *
 * @param this traversal context
 * @example const sanitizedResponse = traverse(response).map(removeSensitiveData);
 */
export function removeSensitiveData(this: TraverseContext): void {
  const key = this.key;
  if (typeof key === "undefined") return;

  const propsToRemove = ["password", "third_party_id"];
  if (propsToRemove.find((v) => key.startsWith(v))) this.remove();
}

/**
 * Creates a https://www.npmjs.com/package/traverse mapper that removes all
 * relations from the response object that aren't listed in the `linksToKeep` array.
 *
 * @param linksToKeep array of relation keys to keep
 * @example const sanitizedResponse = traverse(response).map(removeAllLinksExcept("self", "next"));
 */
export function removeAllLinksExcept(...linksToKeep: string[]): () => void {
  return function (this: TraverseContext): void {
    if (
      typeof this.key !== "undefined" &&
      this.parent?.key === "_links" &&
      linksToKeep.includes(this.key) === false
    ) {
      this.remove();
    }
  };
}

/**
 * Creates a https://www.npmjs.com/package/traverse mapper that removes all
 * properties from the response object that match the keys of the `propsToRemove` array.
 *
 * @param propsToRemove array of properties to remove
 * @example const sanitizedResponse = traverse(response).map(removeProperties("password_hash", "third_party_id"));
 */
export function removeProperties(...propsToRemove: string[]): () => void {
  return function (this: TraverseContext): void {
    if (this.key && propsToRemove.includes(this.key)) this.remove();
  };
}
