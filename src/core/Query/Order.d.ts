import type { Graph } from '../Graph';
import type { With } from '../utils';

type OrderRecord<TPropertyKey extends PropertyKey> = {
  readonly [Key in TPropertyKey]?: 'asc' | 'desc';
};

export type Order<TGraph extends Graph> = TGraph extends With<Graph, 'props'>
  ?
      | keyof TGraph['props']
      | ReadonlyArray<keyof TGraph['props'] | OrderRecord<keyof TGraph['props']>>
      | OrderRecord<keyof TGraph['props']>
  : never;
