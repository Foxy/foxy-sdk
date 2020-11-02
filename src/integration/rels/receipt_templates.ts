import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxReceiptTemplate } from './receipt_template';

export interface FxReceiptTemplates extends APIGraph {
  curie: 'fx:receipt_templates';
  links: APICollectionGraphLinks<FxReceiptTemplates>;
  props: APICollectionGraphProps;
  child: FxReceiptTemplate;
}
