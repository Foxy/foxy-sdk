import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxFraudProtection } from './fraud_protection';

export interface FxFraudProtections extends APIGraph {
  curie: 'fx:fraud_protections';
  links: APICollectionGraphLinks<FxFraudProtections>;
  props: APICollectionGraphProps;
  child: FxFraudProtection;
}
