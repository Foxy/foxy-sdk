import type { CollectionLinks, CollectionProps } from '../../core/types';
import type { FxDownloadable } from './downloadable';

export interface FxDownloadables {
  curie: 'fx:downloadables';
  links: CollectionLinks<FxDownloadables>;
  props: CollectionProps;
  child: FxDownloadable;
}
