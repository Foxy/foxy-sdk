import type { FxCustomerPasswordHashTypes } from './customer_password_hash_types';
import type { FxHostedPaymentGateways } from './hosted_payment_gateways';
import type { FxShippingAddressTypes } from './shipping_address_types';
import type { FxDefaultTemplates } from './default_templates';
import type { FxLanguageStrings } from './language_strings';
import type { FxPaymentGateways } from './payment_gateways';
import type { FxShippingMethods } from './shipping_methods';
import type { FxCheckoutTypes } from './checkout_types';
import type { FxStoreVersions } from './store_versions';
import type { FxLocaleCodes } from './locale_codes';
import type { FxLanguages } from './languages';
import type { FxCountries } from './countries';
import type { FxTimezones } from './timezones';
import type { FxRegions } from './regions';

export interface FxPropertyHelpers {
  curie: 'fx:property_helpers';

  links: {
    /** This resource. */
    'self': FxPropertyHelpers;
    /** List of valid region values. It defaults to US states, but you can fetch other country states using `?country_code=<valid country code>`. */
    'fx:regions': FxRegions;
    /** List of valid timezones for the store's `timezone` setting. */
    'fx:timezones': FxTimezones;
    /** List of valid country values for any country setting such as the store's `store_country`. */
    'fx:countries': FxCountries;
    /** List of valid language values for the store's `language` setting. */
    'fx:languages': FxLanguages;
    /** List of all supported locales. */
    'fx:locale_codes': FxLocaleCodes;
    /** Store versions available along with their changelog details. */
    'fx:store_versions': FxStoreVersions;
    /** List of valid checkout type values for the store's `checkout_type` setting. */
    'fx:checkout_types': FxCheckoutTypes;
    /** The shipping carriers used when configuring live shipping rates. */
    'fx:shipping_methods': FxShippingMethods;
    /** List of supported payment gateways and valid entries for that resource's `type` setting. */
    'fx:payment_gateways': FxPaymentGateways;
    /** List of default language strings that can be overriden. */
    'fx:language_strings': FxLanguageStrings;
    /** Default templates for the cart, checkout, receipt and email. */
    'fx:default_templates': FxDefaultTemplates;
    /** List of valid address type values for the store's `shipping_address_type` setting. */
    'fx:shipping_address_types': FxShippingAddressTypes;
    /** Hosted payment gateways such as PayPal, BitPay, and Dwolla. */
    'fx:hosted_payment_gateways': FxHostedPaymentGateways;
    /** List of valid customer password hash type values for the store's `customer_password_hash_type` setting. */
    'fx:customer_password_hash_types': FxCustomerPasswordHashTypes;
  };

  props: {
    /** Resource description. */
    message: string;
  };
}
