import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxItemOption } from './item_option';

export interface FxItemOptions extends APIGraph {
  curie: 'fx:item_options';
  links: APICollectionGraphLinks<FxItemOptions>;
  props: APICollectionGraphProps;
  child: FxItemOption;
}
