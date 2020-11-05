import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCustomField } from './custom_field';
import type { Graph } from '../../core';

export interface FxCustomFields extends Graph {
  curie: 'fx:custom_fields';
  links: CollectionGraphLinks<FxCustomFields>;
  props: CollectionGraphProps;
  child: FxCustomField;
}
