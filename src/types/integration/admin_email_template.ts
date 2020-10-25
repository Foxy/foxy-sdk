import type * as FxEmailTemplate from "./email_template";

type Curie = "fx:admin_email_template";
type Links = FxEmailTemplate.Graph;
type Props = FxEmailTemplate.Graph["props"];

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
