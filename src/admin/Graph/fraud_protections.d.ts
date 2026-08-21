import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FraudProtection } from './fraud_protection';
import type { Graph } from '../../core';

export interface FraudProtections extends Graph {
  curie: 'fx:fraud_protections';
  links: CollectionGraphLinks<FraudProtections>;
  props: CollectionGraphProps;
  child: FraudProtection;
}
