/** Represents a hAPI relation link. */
export type Link = {
  /** True if this is a template link (example: `https://api.foxycart.com/rels/{rel}`) */
  templated?: boolean;
  /** Short description of this link. */
  title?: string;
  /** For named links, this property will include link name. */
  name?: string;
  /** URL of the resource this link points to. */
  href: string;
};
