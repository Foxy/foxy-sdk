import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCartTemplate } from './cart_template';

export interface FxCartTemplates extends APIGraph {
  curie: 'fx:cart_templates';
  links: APICollectionGraphLinks<FxCartTemplates>;
  props: APICollectionGraphProps;
  child: FxCartTemplate;
}
