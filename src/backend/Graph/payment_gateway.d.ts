import type { Graph } from '../../core';
import type { PaymentMethodSets } from './payment_method_sets';
import type { Store } from './store';

export interface PaymentGateway extends Graph {
  curie: 'fx:payment_gateway';

  links: {
    /** This resource. */
    'self': PaymentGateway;
    /** Store using this gateway. */
    'fx:store': Store;
    /** Payment method sets using this gateway. */
    'fx:payment_method_sets': PaymentMethodSets;
  };

  props: {
    /** Description of this payment gateway */
    description: string;
    /** Valid payment gateway type. */
    type: string;
    /** Your payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    account_id: string;
    /** Your payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    account_key: string;
    /** Your payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    third_party_key: string;
    /** Configuration settings for 3D Secure. */
    config_3d_secure:
      | ''
      | 'all_cards'
      | 'maestro_only'
      | 'all_cards_require_valid_response'
      | 'maestro_only_require_valid_response';
    /** Additional configuration details specific to each payment gateway. */
    additional_fields: string;
    /** Your test payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    test_account_id: string;
    /** Your test payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    test_account_key: string;
    /** Your test payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    test_third_party_key: string;
    /** Live card verification mode if this gateway supports it. */
    card_verification: 'disabled' | 'enabled_automatically' | 'enabled_override';
    /** Live configuration for card verification amounts. This is a serialized JSON string that contains the amounts for each card type. Example: `{"verification_amounts": {"visa": 1, "mastercard": 1, "american_express": 1, "discover": 1, "default": 1}}`. */
    card_verification_config: string;
    /** Test card verification mode if this gateway supports it. */
    test_card_verification: 'disabled' | 'enabled_automatically' | 'enabled_override';
    /** Test configuration for card verification amounts. This is a serialized JSON string that contains the amounts for each card type. Example: `{"verification_amounts": {"visa": 1, "mastercard": 1, "american_express": 1, "discover": 1, "default": 1}}`. */
    test_card_verification_config: string;
    /** The date this resource was created. */
    date_created: string | null;
    /** The date this resource was last modified. */
    date_modified: string | null;
  };
}
