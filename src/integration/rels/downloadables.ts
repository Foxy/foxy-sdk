import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxDownloadable } from './downloadable';

export interface FxDownloadables extends APIGraph {
  curie: 'fx:downloadables';
  links: APICollectionGraphLinks<FxDownloadables>;
  props: APICollectionGraphProps;
  child: FxDownloadable;
}
