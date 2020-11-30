import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { LanguageOverride } from './language_override';
import type { Graph } from '../../core';

export interface LanguageOverrides extends Graph {
  curie: 'fx:language_overrides';
  links: CollectionGraphLinks<LanguageOverrides>;
  props: CollectionGraphProps;
  child: LanguageOverride;
}
