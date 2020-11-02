import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCheckoutTemplate } from './checkout_template';

export interface FxCheckoutTemplates extends APIGraph {
  curie: 'fx:checkout_templates';
  links: APICollectionGraphLinks<FxCheckoutTemplates>;
  props: APICollectionGraphProps;
  child: FxCheckoutTemplate;
}
