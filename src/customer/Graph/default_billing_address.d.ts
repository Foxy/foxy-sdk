import { CustomerAddress } from '../../backend/Rels';

export interface DefaultBillingAddress extends CustomerAddress {
  curie: 'fx:default_billing_address';
  links: CustomerAddress['links'] & { self: DefaultBillingAddress };
}
