import type { Graph } from '../../core';

export interface CustomerPortalSettings extends Graph {
  curie: 'fx:customer_portal_settings';

  links: {
    /** This resource. */
    self: CustomerPortalSettings;
  };

  props: {
    /** An array of domains. No trailing slashes, must be https unless it's localhost. Can accept a port. Allow up to 10 entries. */
    allowed_origins: string[];
    /** Object which contains "allowFrequencyModification" and "allowNextDateModification" fields. Subscription modification data. */
    subscriptions: {
      /** An array that contains objects with jsonataQuery and values. Max length 10 (items). */
      allow_frequency_modification: {
        /** A string that should be a valid {@link https://jsonata.org/ JSONata} query. Max length 200 chars. */
        jsonata_query: string;
        /** These strings should match the sub_frequency regex sanitization. Max array length 20, max length per string 4 characters. */
        values: string[];
      }[];

      /** We can forbid modify subscription next date. False disables modification, true lifts all constraints, array of objects defines custom rules. */
      allow_next_date_modification:
        | boolean
        | {
            /** Beginning of the time period this rule applies to as frequency. Example: `2w` – apply to dates at least 2 weeks from now. */
            min?: string;
            /** End of the time period this rules applies to as frequency. Example: `1y` – apply to dates at most 1 year from now. */
            max?: string;
            /** Subscription selector that should be a valid {@link https://jsonata.org/ JSONata} query. Max length 200 chars. */
            jsonata_query: string;
            /** List of dates (YYYY-MM-DD) or ranges (YYYY-MM-DD..YYYY-MM-DD) that customers can't pick as next payment date. */
            disallowed_dates?: string[];
            /** A pattern defining the days that will be available for customers to pick as the next payment date. */
            allowed_days?:
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
    /** Life span of session in minutes. Maximum 40320 (4 weeks). */
    session_lifespan_in_minutes: number;
    /** Determines if a terms of service checkbox is shown on the portal. This value comes from a template config linked to the default template set. */
    tos_checkbox_settings: {
      /** Initial state of the checkbox element. */
      initial_state: 'unchecked' | 'checked';
      /** Hides the checkbox if true. */
      is_hidden: boolean;
      /** Hides the checkbox if "none". Makes accepting ToS mandatory if "required", and optional otherwise. */
      usage: 'none' | 'optional' | 'required';
      /** Public URL of your terms of service agreement. */
      url: string;
    };
    /** List of display preferences that comes from `cart_display_config` in the active `fx:template_config`. */
    cart_display_config: {
      show_product_weight: boolean;
      show_product_category: boolean;
      show_product_code: boolean;
      show_product_options: boolean;
      show_sub_frequency: boolean;
      show_sub_startdate: boolean;
      show_sub_nextdate: boolean;
      show_sub_enddate: boolean;
      hidden_product_options: string[];
    };
    /** Self-registration settings. Self-registration is disabled if this field is undefined. */
    sign_up?: {
      /** Client verification settings. */
      verification: {
        /** hCaptcha site key. If empty, Foxy will use its own hCaptcha site key. */
        site_key: string;
        /** Verification type. Currently only hCaptcha is supported. */
        type: 'hcaptcha';
      };
      /** If this field is true, then self-registration is enabled. */
      enabled: boolean;
    };
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
