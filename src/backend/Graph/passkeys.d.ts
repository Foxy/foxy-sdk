import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { Passkey } from './passkey';

export interface Passkeys extends Graph {
  curie: 'fx:passkeys';
  links: CollectionGraphLinks<Passkeys>;
  props: CollectionGraphProps;
  child: Passkey;
}
