import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCustomField } from './custom_field';

export interface FxCustomFields extends APIGraph {
  curie: 'fx:custom_fields';
  links: APICollectionGraphLinks<FxCustomFields>;
  props: APICollectionGraphProps;
  child: FxCustomField;
}
