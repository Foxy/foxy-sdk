import type { APICollectionGraphLinks, APICollectionGraphProps, APIGraph } from '../../core/types';
import type { FxUser } from './user';

export interface FxUsers extends APIGraph {
  curie: 'fx:users';
  links: APICollectionGraphLinks<FxUsers>;
  props: APICollectionGraphProps;
  child: FxUser;
}
