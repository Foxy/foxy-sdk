import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxLanguageOverride } from './language_override';

export interface FxLanguageOverrides extends APIGraph {
  curie: 'fx:language_overrides';
  links: APICollectionGraphLinks<FxLanguageOverrides>;
  props: APICollectionGraphProps;
  child: FxLanguageOverride;
}
