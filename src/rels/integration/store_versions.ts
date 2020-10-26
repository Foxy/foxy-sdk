import type { CollectionLinks, CollectionProps } from "../../core/types";
import type { FxStoreVersion } from "./store_version";

export interface FxStoreVersions {
  curie: "fx:store_versions";
  links: CollectionLinks<FxStoreVersions>;
  props: CollectionProps;
  child: FxStoreVersion;
}
