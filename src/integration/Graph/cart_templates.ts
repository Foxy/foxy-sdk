import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCartTemplate } from './cart_template';
import type { Graph } from '../../core';

export interface FxCartTemplates extends Graph {
  curie: 'fx:cart_templates';
  links: CollectionGraphLinks<FxCartTemplates>;
  props: CollectionGraphProps;
  child: FxCartTemplate;
}
