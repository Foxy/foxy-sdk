// Repointed from '../../backend/Rels': the Backend client is not part of the v2 SDK.
// The customer-scoped CustomerAddress is deliberately narrower than the admin one it
// replaced — it has no 'fx:store' link and no ignore_address_restrictions prop, both
// of which are admin-hAPI-only. Consumers reading links['fx:store'] off this type
// under v1 will not find it here.
import { CustomerAddress } from './customer_address';

export interface DefaultShippingAddress extends CustomerAddress {
  curie: 'fx:default_shipping_address';
  links: CustomerAddress['links'] & { self: DefaultShippingAddress };
}
