import type * as FxProcessSubscriptionWebhook from "./process_subscription_webhook";
import type * as FxCustomerPortalSettings from "./customer_portal_settings";
import type * as FxHostedPaymentGateways from "./hosted_payment_gateways";
import type * as FxCartIncludeTemplates from "./cart_include_templates";
import type * as FxSubscriptionSettings from "./subscription_settings";
import type * as FxPaymentMethodSets from "./payment_method_sets";
import type * as FxCheckoutTemplates from "./checkout_templates";
import type * as FxReceiptTemplates from "./receipt_templates";
import type * as FxFraudProtections from "./fraud_protections";
import type * as FxItemCategories from "./item_categories";
import type * as FxEmailTemplates from "./email_templates";
import type * as FxCartTemplates from "./cart_templates";
import type * as FxDownloadables from "./downloadables";
import type * as FxErrorEntries from "./error_entries";
import type * as FxSubscriptions from "./subscriptions";
import type * as FxUserAccesses from "./user_accesses";
import type * as FxStoreVersion from "./store_version";
import type * as FxTemplateSets from "./template_sets";
import type * as FxTransactions from "./transactions";
import type * as FxAttributes from "./attributes";
import type * as FxCustomers from "./customers";
import type * as FxCoupons from "./coupons";
import type * as FxTaxes from "./taxes";
import type * as FxUsers from "./users";
import type * as FxCarts from "./carts";

export type Rel = "store";
export type Curie = "fx:store";
export type Methods = "GET" | "PUT" | "HEAD" | "PATCH" | "DELETE" | "OPTIONS";

export interface Links {
  /** This resource. */
  "self": Graph;
  /** List of carts in this store. */
  "fx:carts": FxCarts.Graph;
  /** List of users with access to this store. */
  "fx:users": FxUsers.Graph;
  /** List of taxes configured for this store. */
  "fx:taxes": FxTaxes.Graph;
  /** List of coupons available in this store. */
  "fx:coupons": FxCoupons.Graph;
  /** List of customers of this store. */
  "fx:customers": FxCustomers.Graph;
  /** List of custom attributes of this store. */
  "fx:attributes": FxAttributes.Graph;
  /** List of transactions performed in this store. */
  "fx:transactions": FxTransactions.Graph;
  /** List of template sets configured for this store. */
  "fx:template_sets": FxTemplateSets.Graph;
  /** Version of this store. */
  "fx:store_version": FxStoreVersion.Graph;
  /** List of user access resources for this store. */
  "fx:user_accesses": FxUserAccesses.Graph;
  /** List of subscriptions created in this store. */
  "fx:subscriptions": FxSubscriptions.Graph;
  /** List of error entries for this store. */
  "fx:error_entries": FxErrorEntries.Graph;
  /** List of downloadable products available in this store. */
  "fx:downloadables": FxDownloadables.Graph;
  /** List of cart templates available in this store. */
  "fx:cart_templates": FxCartTemplates.Graph;
  /** List of email templates for this store. */
  "fx:email_templates": FxEmailTemplates.Graph;
  /** List of item categories configured in this store. */
  "fx:item_categories": FxItemCategories.Graph;
  /** List of fraud protection measures enabled on this store. */
  "fx:fraud_protections": FxFraudProtections.Graph;
  /** List of receipt templates for this store. */
  "fx:receipt_templates": FxReceiptTemplates.Graph;
  /** List of checkout templates for this store. */
  "fx:checkout_templates": FxCheckoutTemplates.Graph;
  /** List of payment method sets configured for this store. */
  "fx:payment_method_sets": FxPaymentMethodSets.Graph;
  /** Subscription settings for this store. */
  "fx:subscription_settings": FxSubscriptionSettings.Graph;
  /** List of cart include templates available in this store. */
  "fx:cart_include_templates": FxCartIncludeTemplates.Graph;
  /** List of hosted payment gateways enabled for this store. */
  "fx:hosted_payment_gateways": FxHostedPaymentGateways.Graph;
  /** Configuration of this store's customer portal. */
  "fx:customer_portal_settings": FxCustomerPortalSettings.Graph;
  /** POST here to resend the daily subscription webhook notification for this store. */
  "fx:process_subscription_webhook": FxProcessSubscriptionWebhook.Graph;
}

export interface Props {
  /** This is the store version for this store. For more details about this version, see the {@link https://api-sandbox.foxycart.com/hal-browser/browser.html#https://api-sandbox.foxycart.com/property_helpers/store_versions store_versions} property helpers which include changelog information. */
  store_version_uri: string;
  /** The name of your store as you'd like it displayed to your customers and our system. */
  store_name: string;
  /** This is a unique FoxyCart subdomain for your cart, checkout, and receipt. If you install a custom SSL certificate, this will contain a full domain such as store.yourdomain.com. */
  store_domain: string;
  /** Set to true when you plan to use a custom SSL certificate. If set to true, your store_domain must be a full domain. */
  use_remote_domain: boolean;
  /** The URL of your online store. */
  store_url: string;
  /** By default, FoxyCart sends customers back to the page referrer after completing a purchase. Instead, you can set a specific URL here. */
  receipt_continue_url: string;
  /** This is the email address of your store. By default, this will be the from address for your store receipts. If you specify a from_email, you can also put in multiple email addresses here, separated by a comma to be used when bcc_on_receipt_email is true. */
  store_email: string;
  /** Used for when you want to specify a different from email than your store's email address or when your store_email has a list of email addresses. */
  from_email: string;
  /** Set this to true if you would like each receipt sent to your customer to also be blind carbon copied to your store's email address. */
  bcc_on_receipt_email: string;
  /** Set this to true if you have set up your DNS settings to include and spf record for FoxyCart. See the {@link http://wiki.foxycart.com/v/1.1/emails FoxyCart documentation} for more details. */
  use_email_dns: string;
  /** If you'd like to configure your own SMTP server for sending transaction receipt emails, you can do so here. The JSON supports the following fields: `username`,`password`,`host`,`port`,`security`. The security value can be blank, `ssl`, or `tls` */
  smtp_config: string;
  /** The postal code of your store. This will be used for calculating shipping costs if you sell shippable items. */
  postal_code: string;
  /** The two character code for states in the United States. Other countries may call this a province. When a two character code isn't available, use the full region name. This will be used for calculating shipping costs if you sell shippable items. */
  region: string;
  /** Two character ISO 3166-1-alpha-2 code for the country your store is located in. This will be used for calculating shipping costs if you sell shippable items. */
  country: string;
  /** The locale code for your store's locale. This will be used to format strings for your store. */
  locale_code: string;
  /** Set to true to prevent the currency symbol from being displayed (example: a points based checkout system). */
  hide_currency_symbol: boolean;
  /** Set to true to prevent the decimal characters from being displayed (example: a points based checkout system). */
  hide_decimal_characters: boolean;
  /** Set true to use the international currency symbol such as USD instead of the regional one like $. */
  use_international_currency_symbol: boolean;
  /** The default language for your store's cart, checkout, and receipt strings. */
  language: string;
  /** A url to your store's logo which may be used in your store's templates. */
  logo_url: string;
  /** The preferred configuration of your customer checkout experience, such as defaulting to guest checkout or requiring account creation with each checkout. */
  checkout_type: string;
  /** Set this to true to POST encrypted XML of your order to the webhook url of your choice. */
  use_webhook: boolean;
  /** This is the url of the webhook endpoint for processing your store's webhook. See the {@link http://wiki.foxycart.com/static/redirect/webhook FoxyCart documentation} for more details. */
  webhook_url: string;
  /** This is the key used to encrypt your webhook data. It is also used as the legacy API key and the HMAC cart encryption key. */
  webhook_key: string;
  /** Set to true to use HMAC cart validation for your store. */
  use_cart_validation: boolean;
  /** Set this to true to redirect to your server before checkout so you can use our single sign on feature and log in your users automatically to FoxyCart or if you want to validate items before checkout. */
  use_single_sign_on: boolean;
  /** This is your single sign on url to redirect your users to prior to hitting the checkout page.  See the {@link http://wiki.foxycart.com/static/redirect/sso FoxyCart documentation} for more details. */
  single_sign_on_url: string;
  /** When saving a customer to FoxyCart, this is the password hashing method that will be used. */
  customer_password_hash_type: string;
  /** Configuration settings for the customer_password_hash_type in use. See the {@link http://wiki.foxycart.com/static/redirect/customers FoxyCart documentation} for more details. */
  customer_password_hash_config: unknown;
  /** Set to true to turn on FoxyCart's multiship functionality for shipping items to multiple locations in a single order. See the {@link http://wiki.foxycart.com/static/redirect/multiship FoxyCart documentation} for more details. */
  features_multiship: boolean;
  /** Set to true to require all front-end add-to-cart interactions have a valid `expires` property. */
  products_require_expires_property: boolean;
  /** If your store sells products which collect personal or sensitive information as product attributes, you may want to consider lowering your cart session lifespan. You can leave it as 0 to keep the default which is currently 43200 seconds (12 hours). The maximum allowed time is currently 259200 seconds (72 hours). */
  app_session_time: number;
  /** Used for determining the type of the customer address used when calculating shipping costs. */
  shipping_address_type: string;
  /** Shipping rate signing ensures that the rate the customer selects is carried through and not altered in any way. If you're intending to make use of javascript snippets on your store to alter the price or label of shipping rates or add custom rates dynamically, disable this setting as it will block those rates from being applied. The default is false. */
  require_signed_shipping_rates: boolean;
  /** The timezone of your store. This will impact how dates are shown to customers and within the FoxyCart admin. */
  timezone: string;
  /** Set a master password here if you would like to be able to check out as your customers without having to know their password. */
  unified_order_entry_password: string;
  /** Instead of displaying the Foxy Transaction ID, you can display your own custom display ID on your store's receipt and receipt emails. This JSON config determines how those display ids will work. The JSON supports the following fields: `enabled`, `start`, `length`, `prefix`, `suffix`. */
  custom_display_id_config: string;
  /** This can only be set during store creation. Contact us if you need this value changed later. */
  affiliate_id: number;
  /** This settings makes your checkout page completely non-functioning. Your customers will see the maintenance notification language string instead. The default is false. */
  is_maintenance_mode: boolean;
  /** If this store is in development or if it has an active FoxyCart subscription and can therefore use a live payment gateway to process live transactions. */
  is_active: boolean;
  /** The date of the first payment for this FoxyCart store subscription. This can be considered the go live date for this store. */
  first_payment_date: string;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export type Zooms = never;

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
