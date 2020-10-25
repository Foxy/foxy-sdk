export type Rel = "void";
export type Curie = "fx:void";
export type Methods = "POST" | "OPTIONS";
export type Links = never;
export type Props = never;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
