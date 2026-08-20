// Repointed from '../../backend/Rels': the Backend client is not part of the v2 SDK.
import { CustomerAddress } from './customer_address';

export interface DefaultShippingAddress extends CustomerAddress {
  curie: 'fx:default_shipping_address';
  links: CustomerAddress['links'] & { self: DefaultShippingAddress };
}
