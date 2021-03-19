import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { CheckoutTemplate } from './checkout_template';
import type { Graph } from '../../core';

export interface CheckoutTemplates extends Graph {
  curie: 'fx:checkout_templates';
  links: CollectionGraphLinks<CheckoutTemplates>;
  props: CollectionGraphProps;
  child: CheckoutTemplate;
}
