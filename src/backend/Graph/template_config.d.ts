import type { Graph } from '../../core';
import type { Store } from './store';
import type { TemplateSets } from './template_sets';

export interface TemplateConfig extends Graph {
  curie: 'fx:template_config';

  links: {
    /** This resource. */
    'self': TemplateConfig;
    /** Related store resource. */
    'fx:store': Store;
    /** List of template sets using this template config. */
    'fx:template_sets': TemplateSets;
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
