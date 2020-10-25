export type Rel = "sub_token_url";
export type Curie = "fx:sub_token_url";
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
