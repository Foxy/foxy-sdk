import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxLanguageOverride } from './language_override';

export interface FxLanguageOverrides {
  curie: 'fx:language_overrides';
  links: CollectionLinks<FxLanguageOverrides>;
  props: CollectionProps;
  child: FxLanguageOverride;
}
