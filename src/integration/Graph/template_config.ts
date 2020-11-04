import type { FxStore } from './store';
import type { FxTemplateSets } from './template_sets';
import type { Graph } from '../../core';

export interface FxTemplateConfig extends Graph {
  curie: 'fx:template_config';

  links: {
    /** This resource. */
    'self': FxTemplateConfig;
    /** Related store resource. */
    'fx:store': FxStore;
    /** List of template sets using this template config. */
    'fx:template_sets': FxTemplateSets;
  };

  props: {
    /** The description of your template config. */
    description: string;
    /** This is the template configuration settings for your store. */
    json: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}