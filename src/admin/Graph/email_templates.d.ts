import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { EmailTemplate } from './email_template';
import type { Graph } from '../../core';

export interface EmailTemplates extends Graph {
  curie: 'fx:email_templates';
  links: CollectionGraphLinks<EmailTemplates>;
  props: CollectionGraphProps;
  child: EmailTemplate;
}
