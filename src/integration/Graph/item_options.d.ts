import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxItemOption } from './item_option';
import type { Graph } from '../../core';

export interface FxItemOptions extends Graph {
  curie: 'fx:item_options';
  links: CollectionGraphLinks<FxItemOptions>;
  props: CollectionGraphProps;
  child: FxItemOption;
}
