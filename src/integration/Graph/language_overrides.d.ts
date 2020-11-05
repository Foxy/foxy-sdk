import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxLanguageOverride } from './language_override';
import type { Graph } from '../../core';

export interface FxLanguageOverrides extends Graph {
  curie: 'fx:language_overrides';
  links: CollectionGraphLinks<FxLanguageOverrides>;
  props: CollectionGraphProps;
  child: FxLanguageOverride;
}
