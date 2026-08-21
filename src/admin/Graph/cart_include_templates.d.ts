import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CartIncludeTemplate } from './cart_include_template';
import type { Graph } from '../../core';

export interface CartIncludeTemplates extends Graph {
  curie: 'fx:cart_include_templates';
  links: CollectionGraphLinks<CartIncludeTemplates>;
  props: CollectionGraphProps;
  child: CartIncludeTemplate;
}
