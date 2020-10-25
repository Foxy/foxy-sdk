import type * as FxDefaultShippingAddress from "./default_shipping_address";
import type * as FxDefaultBillingAddress from "./default_billing_address";
import type * as FxDefaultPaymentMethod from "./default_payment_method";
import type * as FxCustomerAddresses from "./customer_addresses";
import type * as FxSubscriptions from "./subscriptions";
import type * as FxTransactions from "./transactions";
import type * as FxAttributes from "./attributes";
import type * as FxStore from "./store";

type Curie = "fx:customer";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Store this customer is registered in. */
  "fx:store": FxStore.Graph;
  /** Attributes for this customer. */
  "fx:attributes": FxAttributes.Graph;
  /** List of customer's transactions. */
  "fx:transactions": FxTransactions.Graph;
  /** List of customer's subscriptions. */
  "fx:subscriptions": FxSubscriptions.Graph;
  /** List of customer's addresses. */
  "fx:customer_addresses": FxCustomerAddresses.Graph;
  /** Customer's default payment method. */
  "fx:default_payment_method": FxDefaultPaymentMethod.Graph;
  /** Customer's default billing address. */
  "fx:default_billing_address": FxDefaultBillingAddress.Graph;
  /** Customer's default shipping address. */
  "fx:default_shipping_address": FxDefaultShippingAddress.Graph;
}

interface Props {
  /** The FoxyCart customer id, useful for Single Sign On integrations. */
  id: number;
  /** The date of the last time this customer authenticated with the FoxyCart checkout. */
  last_login_date: string;
  /** The customer's given name. */
  first_name: string;
  /** The customer's surname. */
  last_name: string;
  /** The customer's email address. This is used as the login to the FoxyCart checkout for this customer. */
  email: string;
  /** A tax identification number for this customer. */
  tax_id: string;
  /** Your customer's clear text password. This value is never stored, not displayed for this resource, and is not available in our system. You can, however, pass it via clear text when creating or modifying a customer. When creating a customer, if you leave this blank, a random value will be generated for you which you can modify later as needed. */
  password: string;
  /** The salt for this customer's login password. If your integration syncs passwords, you will need to keep this value in sync as well. */
  password_salt: string;
  /** The hash of this customer's login password. If your integration syncs passwords, you will need to keep this value in sync as well. */
  password_hash: string;
  /** This will be a copy of your store's current password_hash_type at the time of creation or modificaiton. This way, if you change your store's settings, your customer will still be able to login. It will be updated automatically to match that of the store the next time the customer logs in. */
  password_hash_type: string;
  /** This will be a copy of your store's current password_hash_config at the time of creation or modification. This way, if you change your store's settings, your customer will still be able to login. It will be updated automatically to match that of the store the next time the customer logs in. */
  password_hash_config: string;
  /** If your customer forgot their password and requested a forgotten password, it will be set here. */
  forgot_password: string;
  /** The exact time the forgot password was set. */
  forgot_password_timestamp: string;
  /** If this customer checks out as a guest, this will be set to true. Once it is set, it can not be changed. */
  is_anonymous: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

type Zooms = {
  default_shipping_address?: FxDefaultShippingAddress.Graph;
  default_billing_address?: FxDefaultBillingAddress.Graph;
  default_payment_method?: FxDefaultPaymentMethod.Graph;
  customer_addresses?: FxCustomerAddresses.Graph;
  attributes: FxAttributes.Graph;
};

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
  zooms: Zooms;
}
