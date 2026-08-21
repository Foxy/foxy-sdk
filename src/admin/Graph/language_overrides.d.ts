import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { LanguageOverride } from './language_override';

export interface LanguageOverrides extends Graph {
  curie: 'fx:language_overrides';
  links: CollectionGraphLinks<LanguageOverrides>;
  props: CollectionGraphProps;
  child: LanguageOverride;
}
