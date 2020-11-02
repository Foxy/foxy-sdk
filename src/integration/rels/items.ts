import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxItem } from './item';

export interface FxItems extends APIGraph {
  curie: 'fx:items';
  links: APICollectionGraphLinks<FxItems>;
  props: APICollectionGraphProps;
  child: FxItem;
}
