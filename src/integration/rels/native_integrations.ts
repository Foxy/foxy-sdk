import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxNativeIntegration } from './native_integration';

export interface FxNativeIntegrations extends APIGraph {
  curie: 'fx:native_integrations';
  links: APICollectionGraphLinks<FxNativeIntegrations>;
  props: APICollectionGraphProps;
  child: FxNativeIntegration;
}
