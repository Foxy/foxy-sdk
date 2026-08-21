import type { Graph } from '../../core';
import type { Store } from './store';

export interface ErrorEntry extends Graph {
  curie: 'fx:error_entry';

  links: {
    /** This resource. */
    'self': ErrorEntry;
    /** Store this error entry was created in. */
    'fx:store': Store;
  };

  props: {
    /** The Foxy page where the error took place. */
    url: string;
    /** The error message explaining what happened. */
    error_message: string;
    /** The user agent string collected at the time of the error. */
    user_agent: string;
    /** The browser referrer value at the time of the error. */
    referrer: string;
    /** The IP Address of the user collected at the time of the error. */
    ip_address: string;
    /** The country of the user based on the IP Address at the time of the error. */
    ip_country: string;
    /** All the POST data sent to the url at the time of the error. Note: secure card holder data such as the card number, csc, or password will not be included in this data. */
    post_values: string;
    /** All the GET data sent to the url at the time of the error. Note: secure card holder data such as the card number, csc, or password will not be included in this data. */
    get_values: string;
    /** Set this to false to hide this error entry from the Foxy administrative interface. This may be a helpful way to manage and acknowledge errors for your store. */
    hide_error: boolean;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
