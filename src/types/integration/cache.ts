export type Rel = "cache";
export type Curie = "fx:cache";
export type Methods = "POST";

export type Links = never;
export type Props = never;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
