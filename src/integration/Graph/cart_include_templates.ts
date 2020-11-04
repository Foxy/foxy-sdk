import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxCartIncludeTemplate } from './cart_include_template';
import type { Graph } from '../../core';

export interface FxCartIncludeTemplates extends Graph {
  curie: 'fx:cart_include_templates';
  links: CollectionGraphLinks<FxCartIncludeTemplates>;
  props: CollectionGraphProps;
  child: FxCartIncludeTemplate;
}
