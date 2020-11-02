import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxTemplateSet } from './template_set';

export interface FxTemplateSets extends APIGraph {
  curie: 'fx:template_sets';
  links: APICollectionGraphLinks<FxTemplateSets>;
  props: APICollectionGraphProps;
  child: FxTemplateSet;
}
