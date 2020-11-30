import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { ReceiptTemplate } from './receipt_template';
import type { Graph } from '../../core';

export interface ReceiptTemplates extends Graph {
  curie: 'fx:receipt_templates';
  links: CollectionGraphLinks<ReceiptTemplates>;
  props: CollectionGraphProps;
  child: ReceiptTemplate;
}
