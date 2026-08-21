import type { Graph } from '../../core';
import type { Store } from './store';

export interface StoreTransactionFolder extends Graph {
  curie: 'fx:folder';

  links: {
    /** This resource. */
    'self': StoreTransactionFolder;
    /** Related store resource. */
    'fx:store': Store;
  };

  props: {
    /** Name of the folder. Required. */
    name: string;
    /** When set to `1`, new transactions will be automatically assigned to this folder. Only one folder can be default at a time. If you update one folder to be the default one we will mark others as non default. Optional. Default: `0`.*/
    is_default: 0 | 1;
    /** Optional display order for this folder. Our admin dashboard will sort folders by this value (ascending). Default: `0`. */
    sort_order: number;
    /** Optional display color for this folder. API will accept any value, however our admin dashboard will recognize only the following: `red`, `red_pale`, `green`, `green_pale`, `blue`, `blue_pale`, `orange`, `orange_pale`, `violet`, `violet_pale`. Default: `null`. */
    color: string | null;
    /** The date and time this folder was created in ISO 8601 format. */
    date_created: string;
    /** The date and time this folder was last modified in ISO 8601 format. */
    date_modified: string;
  };
}
