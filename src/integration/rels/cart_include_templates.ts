import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxCartIncludeTemplate } from './cart_include_template';

export interface FxCartIncludeTemplates extends APIGraph {
  curie: 'fx:cart_include_templates';
  links: APICollectionGraphLinks<FxCartIncludeTemplates>;
  props: APICollectionGraphProps;
  child: FxCartIncludeTemplate;
}
