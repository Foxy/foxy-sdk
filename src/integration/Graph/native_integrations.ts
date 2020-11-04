import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { FxNativeIntegration } from './native_integration';
import type { Graph } from '../../core';

export interface FxNativeIntegrations extends Graph {
  curie: 'fx:native_integrations';
  links: CollectionGraphLinks<FxNativeIntegrations>;
  props: CollectionGraphProps;
  child: FxNativeIntegration;
}
