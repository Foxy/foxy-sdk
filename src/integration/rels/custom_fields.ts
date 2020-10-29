import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxCustomField } from './custom_field';

export interface FxCustomFields {
  curie: 'fx:custom_fields';
  links: CollectionLinks<FxCustomFields>;
  props: CollectionProps;
  child: FxCustomField;
}
