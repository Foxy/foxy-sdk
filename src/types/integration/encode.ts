export type Rel = "encode";
export type Curie = "fx:encode";
export type Methods = "POST" | "HEAD" | "OPTIONS";
export type Links = never;
export type Props = never;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
