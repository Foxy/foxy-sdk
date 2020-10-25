import type * as FxCustomerPasswordHashTypes from "./customer_password_hash_types";
import type * as FxHostedPaymentGateways from "./hosted_payment_gateways";
import type * as FxShippingAddressTypes from "./shipping_address_types";
import type * as FxDefaultTemplates from "./default_templates";
import type * as FxLanguageStrings from "./language_strings";
import type * as FxPaymentGateways from "./payment_gateways";
import type * as FxShippingMethods from "./shipping_methods";
import type * as FxCheckoutTypes from "./checkout_types";
import type * as FxStoreVersions from "./store_versions";
import type * as FxLocaleCodes from "./locale_codes";
import type * as FxLanguages from "./languages";
import type * as FxCountries from "./countries";
import type * as FxTimezones from "./timezones";
import type * as FxRegions from "./regions";

export type Rel = "property_helpers";
export type Curie = "fx:property_helpers";
export type Methods = "GET" | "HEAD" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** List of valid region values. It defaults to US states, but you can fetch other country states using `?country_code=<valid country code>`. */
  "fx:regions": FxRegions.Graph;
  /** List of valid timezones for the store's `timezone` setting. */
  "fx:timezones": FxTimezones.Graph;
  /** List of valid country values for any country setting such as the store's `store_country`. */
  "fx:countries": FxCountries.Graph;
  /** List of valid language values for the store's `language` setting. */
  "fx:languages": FxLanguages.Graph;
  /** List of all supported locales. */
  "fx:locale_codes": FxLocaleCodes.Graph;
  /** Store versions available along with their changelog details. */
  "fx:store_versions": FxStoreVersions.Graph;
  /** List of valid checkout type values for the store's `checkout_type` setting. */
  "fx:checkout_types": FxCheckoutTypes.Graph;
  /** The shipping carriers used when configuring live shipping rates. */
  "fx:shipping_methods": FxShippingMethods.Graph;
  /** List of supported payment gateways and valid entries for that resource's `type` setting. */
  "fx:payment_gateways": FxPaymentGateways.Graph;
  /** List of default language strings that can be overriden. */
  "fx:language_strings": FxLanguageStrings.Graph;
  /** Default templates for the cart, checkout, receipt and email. */
  "fx:default_templates": FxDefaultTemplates.Graph;
  /** List of valid address type values for the store's `shipping_address_type` setting. */
  "fx:shipping_address_types": FxShippingAddressTypes.Graph;
  /** Hosted payment gateways such as PayPal, BitPay, and Dwolla. */
  "fx:hosted_payment_gateways": FxHostedPaymentGateways.Graph;
  /** List of valid customer password hash type values for the store's `customer_password_hash_type` setting. */
  "fx:customer_password_hash_types": FxCustomerPasswordHashTypes.Graph;
}

export interface Props {
  /** Resource description. */
  message: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
