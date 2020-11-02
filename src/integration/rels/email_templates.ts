import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxEmailTemplate } from './email_template';

export interface FxEmailTemplates extends APIGraph {
  curie: 'fx:email_templates';
  links: APICollectionGraphLinks<FxEmailTemplates>;
  props: APICollectionGraphProps;
  child: FxEmailTemplate;
}
