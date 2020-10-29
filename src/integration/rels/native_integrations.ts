import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxNativeIntegration } from './native_integration';

export interface FxNativeIntegrations {
  curie: 'fx:native_integrations';
  links: CollectionLinks<FxNativeIntegrations>;
  props: CollectionProps;
  child: FxNativeIntegration;
}
