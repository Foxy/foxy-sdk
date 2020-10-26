import type { CollectionLinks, CollectionProps } from "../index";
import type { FxStoreVersion } from "./store_version";

export interface FxStoreVersions {
  curie: "fx:store_versions";
  links: CollectionLinks<FxStoreVersions>;
  props: CollectionProps;
  child: FxStoreVersion;
}
