import type { APIGraph } from '../../core/types';
import type { FxAttribute } from './attribute';
import type { FxAttributes as IntegrationAPIFxAttributes } from '../../integration/rels/attributes';

export interface FxAttributes extends APIGraph {
  curie: IntegrationAPIFxAttributes['curie'];
  child: FxAttribute;
}
