import type { Graph } from '../../core';
import type { PropertyHelpers } from './property_helpers';

export interface HostedPaymentGatewaysHelper extends Graph {
  curie: 'fx:hosted_payment_gateways';

  links: {
    /** This resource. */
    'self': HostedPaymentGatewaysHelper;
    /** Various predefined property values. */
    'fx:property_helpers': PropertyHelpers;
  };

  props: {
    /** A small, human readable explanation of this property helper. */
    message: string;
    /** JSON objects with the payment gateway names as the keys. */
    values: {
      [key: string]: {
        /** The name of this hosted payment gateway. */
        name: string;
        /** The default id you can use for testing this hosted gateway. */
        test_id: string;
        /** The default key you can use for testing this hosted gateway. */
        test_key: string;
        /** The description of the id field for this hosted gateway. */
        id_description: string;
        /** The description of the key field for this hosted gateway. */
        key_description: string;
        /** Whether or not this hosted gateway supports 3D Secure functionality. */
        supports_3d_secure: 0 | 1;
        /** Whether or not this hosted gateway supports authorize only instead of auth+capture. */
        supports_auth_only: 0 | 1;
        /** The default third party key you can use for testing this hosted gateway. */
        test_third_party_key: string;
        /** The description of the third party key field for this hosted gateway. */
        third_party_key_description: string;
        /** Marks hosted payment gateways that are no longer supported. */
        is_deprecated: boolean;
        /** Whether or not this hosted gateway supports card verification. */
        supports_card_verification: boolean;
        /** Default card verification mode if this gateway supports it. */
        card_verification: 'disabled' | 'enabled_automatically' | 'enabled_override';
        /** Default configuration for card verification amounts. This is a serialized JSON string that contains the amounts for each card type. Example: `{"verification_amounts": {"visa": 1, "mastercard": 1, "american_express": 1, "discover": 1, "default": 1}}`. */
        card_verification_config: string;
        /** If this hosted gateway requires additional information, this will contain details about the data which needs to be collected to configure this hosted gateway. */
        additional_fields: null | {
          blocks: {
            id: string;
            is_live: boolean;
            parent_id: string;
            fields: {
              id: string;
              name: string;
              type: string;
              description?: string;
              default_value: string;
              options?: { name: string; value: string }[];
            }[];
          }[];
        };
      };
    };
  };
}
