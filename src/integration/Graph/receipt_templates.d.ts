import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxReceiptTemplate } from './receipt_template';
import type { Graph } from '../../core';

export interface FxReceiptTemplates extends Graph {
  curie: 'fx:receipt_templates';
  links: CollectionGraphLinks<FxReceiptTemplates>;
  props: CollectionGraphProps;
  child: FxReceiptTemplate;
}
