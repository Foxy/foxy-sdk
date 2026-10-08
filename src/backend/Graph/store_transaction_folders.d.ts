import type { CollectionGraphLinks, CollectionGraphProps } from '../../core/defaults';
import type { Graph } from '../../core';
import type { StoreTransactionFolder } from './store_transaction_folder';

export interface StoreTransactionFolders extends Graph {
  curie: 'fx:transaction_folders';
  links: CollectionGraphLinks<StoreTransactionFolders>;
  props: CollectionGraphProps;
  child: StoreTransactionFolder;
}
