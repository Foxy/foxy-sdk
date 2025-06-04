import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';

export interface Countries extends Graph {
  curie: 'fx:countries';

  links: {
    /** This resource. */
    'self': Countries;
    /** Various pre-defined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the country codes as the keys. */
    values: {
      [key: string]: {
        /** The default name for this country. */
        default: string;
        /** The official 2 character country code. */
        cc2: string;
        /** The official 3 character country code. */
        cc3: string;
        /** Array of alternative names for this country. */
        alternate_values: string[];
        /** This value determines which countries will show up first in our find-as-you-type system. */
        boost: number;
        /** Whether this country has known regions on file in our system. If `?include_regions=true` is passed in, this property will be omitted. */
        has_regions?: boolean;
        /** Known regions for this country if Foxy is aware of them. If `?include_regions=true` is not passed in, this property will be omitted. */
        regions?: {
          /** The default name for this region. */
          n: string;
          /** The official region code. */
          c: string;
          /** Array of alternative names for this region. */
          alt: string[];
          /** This value determines which regions will show up first in our find-as-you-type system. */
          boost: number;
          /** If this region is currently recognized. */
          active: boolean;
        }[];
        /** Whether this country requires regions for shipping or not. */
        regions_required: boolean;
        /** What type of region this is such as state, province, etc. */
        regions_type: string;
        /** If this country is currently internationally recognized. */
        active: boolean;
      };
    };
  };
}
