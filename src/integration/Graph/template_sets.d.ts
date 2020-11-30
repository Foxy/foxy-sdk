import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { TemplateSet } from './template_set';

export interface TemplateSets extends Graph {
  curie: 'fx:template_sets';
  links: CollectionGraphLinks<TemplateSets>;
  props: CollectionGraphProps;
  child: TemplateSet;
}
