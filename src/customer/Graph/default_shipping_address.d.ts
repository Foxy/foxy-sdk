import { CustomerAddress } from '../../backend/Rels';

export interface DefaultShippingAddress extends CustomerAddress {
  curie: 'fx:default_shipping_address';
  links: CustomerAddress['links'] & { self: DefaultShippingAddress };
}
