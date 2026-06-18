import type { Graph } from '../../core';
import type { Store } from './store';

export interface DataRetentionSettings extends Graph {
  curie: 'fx:data_retention_settings';

  links: {
    /** This resource. */
    'self': DataRetentionSettings;
    /** Store whose data retention this resource configures. */
    'fx:store': Store;
  };

  props: {
    /** When true, customers inactive for `auto_anonymize_days` are automatically anonymized. */
    auto_anonymize: boolean;
    /** Days of inactivity before a customer is auto-anonymized. Minimum 90. Null when unset. */
    auto_anonymize_days: number | null;
  };
}
