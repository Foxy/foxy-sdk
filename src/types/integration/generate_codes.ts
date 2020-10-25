export type Rel = "generate_codes";
export type Curie = "fx:generate_codes";
export type Methods = "POST" | "HEAD" | "OPTIONS";

export type Links = never;

export interface Props {
  /** Optional length of the coupon code. Defaults to 6 characters. */
  length: number;
  /** Optional number of coupon code variations you would like. Defaults to 10. */
  number_of_codes: number;
  /** Optional number of coupon code variations you would like to generate. For example, if you would like all the coupon code variations to have a "summer_special" prefix, set that here. */
  prefix: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
