import type { CollectionLinks, CollectionProps } from "../index";
import type { FxDownloadable } from "./downloadable";

export interface FxDownloadables {
  curie: "fx:downloadables";
  links: CollectionLinks<FxDownloadables>;
  props: CollectionProps;
  child: FxDownloadable;
}
