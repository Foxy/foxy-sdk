import type { Graph } from '../../core';
import type { PaymentGateway } from './payment_gateway';
import type { PaymentMethodSetFraudProtections } from './payment_method_set_fraud_protections';
import type { PaymentMethodSetHostedPaymentGateways } from './payment_method_set_hosted_payment_gateways';
import type { PaymentMethodSets } from './payment_method_sets';
import type { Store } from './store';

export interface PaymentMethodSet extends Graph {
  curie: 'fx:payment_method_set';

  links: {
    /** This resource. */
    'self': PaymentMethodSet;
    /** Store this payment method set belongs to. */
    'fx:store': Store;
    /** Payment gateway for this payment method set. */
    'fx:payment_gateway': PaymentGateway;
    /** List of payment method sets for the store. */
    'fx:payment_method_sets': PaymentMethodSets;
    /** Payment method set and fraud protection relationships. */
    'fx:payment_method_set_fraud_protections': PaymentMethodSetFraudProtections;
    /** Payment method set and hosted payment gateways relationships. */
    'fx:payment_method_set_hosted_payment_gateways': PaymentMethodSetHostedPaymentGateways;
  };

  props: {
    /** The full API URI of the payment_gateway associated with this payment method set. */
    gateway_uri: string;
    /** The description of your payment method set. */
    description: string;
    /** Set this to true to enable a live payment gateway and live hosted gateways. This can only be set to true if your store is active. If this is set to false, transactions will be processed as test transactions. */
    is_live: boolean;
    /** Set this to true to enable the purchase order payment option on your store. This can only be set to true if your store is active. */
    is_purchase_order_enabled: boolean;
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };
}
