import type * as FxEmailTemplate from "./email_template";

export type Rel = "admin_email_template";
export type Curie = "fx:admin_email_template";
export type Methods = FxEmailTemplate.Methods;
export type Links = FxEmailTemplate.Graph;
export type Props = FxEmailTemplate.Props;
export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
