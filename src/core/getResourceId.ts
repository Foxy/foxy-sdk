/**
 * Returns the last path segment, which is usually an ID.
 * If it's a non-NaN numeric ID (true for most Foxy resources) then a `number` is returned.
 * Otherwise returns a string or `null` if the path is empty.
 *
 * @param uri `self` link on a resource, e.g. `https://api.foxy.io/stores/123`
 * @returns resource ID or `null` if not found
 */
export function getResourceId(uri: string): string | number | null {
  try {
    const idAsString = new URL(uri).pathname.split('/').pop() || undefined;
    if (idAsString === undefined) return null;
    const idAsInt = parseInt(idAsString);
    return isNaN(idAsInt) ? idAsString : idAsInt;
  } catch {
    return null;
  }
}
