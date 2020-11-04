import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxEmailTemplate } from './email_template';
import type { Graph } from '../../core';

export interface FxEmailTemplates extends Graph {
  curie: 'fx:email_templates';
  links: CollectionGraphLinks<FxEmailTemplates>;
  props: CollectionGraphProps;
  child: FxEmailTemplate;
}
