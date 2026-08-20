// Repointed from '../../backend/Rels': the Backend client is not part of the v2 SDK.
import { CustomerAddress } from './customer_address';

export interface DefaultBillingAddress extends CustomerAddress {
  curie: 'fx:default_billing_address';
  links: CustomerAddress['links'] & { self: DefaultBillingAddress };
}
