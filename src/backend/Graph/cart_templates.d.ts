import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CartTemplate } from './cart_template';
import type { Graph } from '../../core';

export interface CartTemplates extends Graph {
  curie: 'fx:cart_templates';
  links: CollectionGraphLinks<CartTemplates>;
  props: CollectionGraphProps;
  child: CartTemplate;
}
