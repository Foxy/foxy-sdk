import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxCartTemplate } from './cart_template';

export interface FxCartTemplates {
  curie: 'fx:cart_templates';
  links: CollectionLinks<FxCartTemplates>;
  props: CollectionProps;
  child: FxCartTemplate;
}
