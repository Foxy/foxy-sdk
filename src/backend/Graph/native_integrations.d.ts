import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { NativeIntegration } from './native_integration';

export interface NativeIntegrations extends Graph {
  curie: 'fx:native_integrations';
  links: CollectionGraphLinks<NativeIntegrations>;
  props: CollectionGraphProps;
  child: NativeIntegration;
}
