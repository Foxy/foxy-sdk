import type { APIGraph } from '../../core/types';
import type { FxAttribute as IntegrationAPIFxAttribute } from '../../integration/rels/attribute';

export interface FxAttribute extends APIGraph {
  curie: IntegrationAPIFxAttribute['curie'];
  props: IntegrationAPIFxAttribute['props'];
}
