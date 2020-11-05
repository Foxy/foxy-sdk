import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxItem } from './item';
import type { Graph } from '../../core';

export interface FxItems extends Graph {
  curie: 'fx:items';
  links: CollectionGraphLinks<FxItems>;
  props: CollectionGraphProps;
  child: FxItem;
}
