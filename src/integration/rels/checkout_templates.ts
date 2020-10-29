import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxCheckoutTemplate } from './checkout_template';

export interface FxCheckoutTemplates {
  curie: 'fx:checkout_templates';
  links: CollectionLinks<FxCheckoutTemplates>;
  props: CollectionProps;
  child: FxCheckoutTemplate;
}
