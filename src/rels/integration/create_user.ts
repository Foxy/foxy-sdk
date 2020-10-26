import type { FxUser } from "./user";

export interface FxCreateUser {
  curie: "fx:create_user";
  links: FxUser["links"];
  props: FxUser["props"];
}
