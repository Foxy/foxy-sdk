import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCheckoutTemplate } from './checkout_template';
import type { Graph } from '../../core';

export interface FxCheckoutTemplates extends Graph {
  curie: 'fx:checkout_templates';
  links: CollectionGraphLinks<FxCheckoutTemplates>;
  props: CollectionGraphProps;
  child: FxCheckoutTemplate;
}
