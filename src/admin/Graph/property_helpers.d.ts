import type { CheckoutTypes } from './checkout_types';
import type { Countries } from './countries';
import type { CustomerPasswordHashTypes } from './customer_password_hash_types';
import type { DefaultTemplates } from './default_templates';
import type { Graph } from '../../core';
import type { HostedPaymentGatewaysHelper } from './hosted_payment_gateways_helper';
import type { LanguageStrings } from './language_strings';
import type { Languages } from './languages';
import type { LocaleCodes } from './locale_codes';
import type { PaymentGatewaysHelper } from './payment_gateways_helper';
import type { Regions } from './regions';
import type { ShippingAddressTypes } from './shipping_address_types';
import type { ShippingMethods } from './shipping_methods';
import type { StoreVersions } from './store_versions';
import type { Timezones } from './timezones';

export interface PropertyHelpers extends Graph {
  curie: 'fx:property_helpers';

  links: {
    /** This resource. */
    'self': PropertyHelpers;
    /** List of valid region values. It defaults to US states, but you can fetch other country states using `?country_code=<valid country code>`. */
    'fx:regions': Regions;
    /** List of valid timezones for the store's `timezone` setting. */
    'fx:timezones': Timezones;
    /** List of valid country values for any country setting such as the store's `store_country`. */
    'fx:countries': Countries;
    /** List of valid language values for the store's `language` setting. */
    'fx:languages': Languages;
    /** List of all supported locales. */
    'fx:locale_codes': LocaleCodes;
    /** Store versions available along with their changelog details. */
    'fx:store_versions': StoreVersions;
    /** List of valid checkout type values for the store's `checkout_type` setting. */
    'fx:checkout_types': CheckoutTypes;
    /** The shipping carriers used when configuring live shipping rates. */
    'fx:shipping_methods': ShippingMethods;
    /** List of supported payment gateways and valid entries for that resource's `type` setting. */
    'fx:payment_gateways': PaymentGatewaysHelper;
    /** List of default language strings that can be overriden. */
    'fx:language_strings': LanguageStrings;
    /** Default templates for the cart, checkout, receipt and email. */
    'fx:default_templates': DefaultTemplates;
    /** List of valid address type values for the store's `shipping_address_type` setting. */
    'fx:shipping_address_types': ShippingAddressTypes;
    /** Hosted payment gateways such as PayPal, BitPay, and Dwolla. */
    'fx:hosted_payment_gateways': HostedPaymentGatewaysHelper;
    /** List of valid customer password hash type values for the store's `customer_password_hash_type` setting. */
    'fx:customer_password_hash_types': CustomerPasswordHashTypes;
  };

  props: {
    /** Resource description. */
    message: string;
  };
}
