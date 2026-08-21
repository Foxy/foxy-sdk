import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';
import type { StoreVersions } from './store_versions';

export interface StoreVersion extends Graph {
  curie: 'fx:store_version';

  links: {
    /** This resource. */
    'self': StoreVersion;
    /** List of all available store versions. */
    'fx:store_versions': StoreVersions;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** Human readable store version string. */
    version: string;
    /** The full URL of the blog post describing the new release. */
    changelog_blog_url: string;
    /** The full URL of the changelog. */
    changelog_url: string;
    /** Full content of the changelog as HTML */
    changelog_content: string;
    /** A JSON object for various cart types supported by this version. Examples include colorbox with links to the JavaScript library, FoxyCart JavaScript files, and FoxyCart CSS files. */
    cart_types: {
      [key: string]: {
        /** Links to FoxyCart CSS files. */
        css: string[];
        /** Links to FoxyCart JS files. */
        javascript: string[];
        /** JS library needed for FoxyCart JS files to work. If none is needed, this will be an empty array. */
        javascript_library:
          | []
          | {
              /** Name of the JS library. */
              name: string;
              /** Version of the JS library. */
              version: string;
              /** URL of the JS library hosted on a CDN. */
              url: string;
            };
      };
    };
    /** The date this version was publicly released. */
    version_date: string;
    /** If this version is currently visible in the FoxyCart admin. At times, FoxyCart may launch a private beta of the latest version. */
    is_visible: boolean;
    /** If this version is currently considered a beta release. */
    is_beta: boolean;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
