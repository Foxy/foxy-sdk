import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxAttribute } from './attribute';

export interface FxAttributes extends APIGraph {
  curie: 'fx:attributes';
  links: APICollectionGraphLinks<FxAttributes>;
  props: APICollectionGraphProps;
  child: FxAttribute;
}
