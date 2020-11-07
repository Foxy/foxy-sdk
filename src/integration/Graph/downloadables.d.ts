import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxDownloadable } from './downloadable';
import type { Graph } from '../../core';

export interface FxDownloadables extends Graph {
  curie: 'fx:downloadables';
  links: CollectionGraphLinks<FxDownloadables>;
  props: CollectionGraphProps;
  child: FxDownloadable;
}
