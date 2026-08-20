import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CustomField } from './custom_field';
import type { Graph } from '../../core';

export interface CustomFields extends Graph {
  curie: 'fx:custom_fields';
  links: CollectionGraphLinks<CustomFields>;
  props: CollectionGraphProps;
  child: CustomField;
}
