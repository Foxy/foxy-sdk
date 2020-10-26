import type { FxPaymentMethodSets } from "./payment_method_sets";
import type { FxStore } from "./store";

export interface FxPaymentGateway {
  curie: "fx:payment_gateway";

  links: {
    /** This resource. */
    "self": FxPaymentGateway;
    /** Store using this gateway. */
    "fx:store": FxStore;
    /** Payment method sets using this gateway. */
    "fx:payment_method_sets": FxPaymentMethodSets;
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
      | ""
      | "all_cards"
      | "maestro_only"
      | "all_cards_require_valid_response"
      | "maestro_only_require_valid_response";
    /** Additional configuration details specific to each payment gateway. */
    additional_fields: string;
    /** Your test payment gateway account id. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `id_description` field. */
    test_account_id: string;
    /** Your test payment gateway account key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `key_description` field. */
    test_account_key: string;
    /** Your test payment gateway third party key. To view the specific description of this field for the given payment gateway, see {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/payment_gateways payment_gateways} property helper `third_party_key_description` field. */
    test_third_party_key: string;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
