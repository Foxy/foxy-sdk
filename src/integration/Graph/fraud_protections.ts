import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxFraudProtection } from './fraud_protection';
import type { Graph } from '../../core';

export interface FxFraudProtections extends Graph {
  curie: 'fx:fraud_protections';
  links: CollectionGraphLinks<FxFraudProtections>;
  props: CollectionGraphProps;
  child: FxFraudProtection;
}
