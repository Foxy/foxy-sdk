import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxTemplateSet } from './template_set';
import type { Graph } from '../../core';

export interface FxTemplateSets extends Graph {
  curie: 'fx:template_sets';
  links: CollectionGraphLinks<FxTemplateSets>;
  props: CollectionGraphProps;
  child: FxTemplateSet;
}
