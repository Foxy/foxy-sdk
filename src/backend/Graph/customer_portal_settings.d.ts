import type { Graph } from '../../core';
import type { Store } from './store';

export interface CustomerPortalSettings extends Graph {
  curie: 'fx:customer_portal_settings';

  links: {
    /** This resource. */
    'self': CustomerPortalSettings;
    /** Store the customer portal of which this resource configures. */
    'fx:store': Store;
  };

  props: {
    /** An array of domains. No trailing slashes, must be https unless it's localhost. Can accept a port. Allow up to 10 entries. */
    allowedOrigins: string[];
    /** Object which contains "allowFrequencyModification" and "allowNextDateModification" fields. Subscription modification data. */
    subscriptions: {
      /** An array that contains objects with jsonataQuery and values. Max length 10 (items). */
      allowFrequencyModification: {
        /** A string that should be a valid {@link https://jsonata.org/ JSONata} query. Max length 200 chars. */
        jsonataQuery: string;
        /** These strings should match the sub_frequency regex sanitization. Max array length 20, max length per string 4 characters. */
        values: string[];
      }[];

      /** We can forbid modify subscription next date. False disables modification, true lifts all constraints, array of objects defines custom rules. */
      allowNextDateModification:
        | boolean
        | {
            /** Beginning of the time period this rule applies to as frequency. Example: `2w` – apply to dates at least 2 weeks from now. */
            min?: string;
            /** End of the time period this rules applies to as frequency. Example: `1y` – apply to dates at most 1 year from now. */
            max?: string;
            /** Subscription selector that should be a valid {@link https://jsonata.org/ JSONata} query. Max length 200 chars. */
            jsonataQuery: string;
            /** List of dates (YYYY-MM-DD) or ranges (YYYY-MM-DD..YYYY-MM-DD) that customers can't pick as next payment date. */
            disallowedDates?: string[];
            /** A pattern defining the days that will be available for customers to pick as the next payment date. */
            allowedDays?:
              | {
                  /** Constraint type. If `day`, then this rule contains days of week only. */
                  type: 'day';
                  /** Days of week, 1-7, where 1 is Monday and 7 is Sunday. */
                  days: number[];
                }
              | {
                  /** Constraint type. If `month`, then this rule contains days of month only. */
                  type: 'month';
                  /** Days of month, 1-31. */
                  days: number[];
                };
          }[];
    };
    /** If this field is true we get legacy API key or sso key from store and save it in settings. For false value we drop it. */
    sso: boolean;
    /** SSO secret for SSO URLs.  */
    ssoSecret?: string;
    /** Life span of session in minutes. Maximum 40320 (4 weeks). */
    sessionLifespanInMinutes: number;
    /** Self-registration settings. Self-registration is disabled if this field is undefined. */
    signUp?: {
      /** If this field is true, then self-registration is enabled. */
      enabled: boolean;
      /** Client verification settings. */
      verification: {
        /** Verification type. Currently only hCaptcha is supported. */
        type: 'hcaptcha';
        /** hCaptcha site key. If empty, Foxy will use its own hCaptcha site key. */
        siteKey: string;
        /** hCaptcha secret key. If empty, Foxy will use its own hCaptcha secret key. */
        secretKey: string;
      };
    };
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
    /** Shared secret key. */
    jwtSharedSecret: string;
    /** Private key for JWT signing, read-only. */
    jwtPrivateKey?: string;
  };
}
