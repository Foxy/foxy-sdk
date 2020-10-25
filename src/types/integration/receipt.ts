export type Rel = "receipt";
export type Curie = "fx:receipt";
export type Methods = "GET" | "OPTIONS";
export type Links = never;
export type Props = never;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
