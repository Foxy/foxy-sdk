import type * as Core from '../../core';
import type * as Integration from '../../integration';

export interface FxDefaultPaymentMethod extends Core.Graph {
  curie: Integration.Rels.FxDefaultPaymentMethod['curie'];
  props: Integration.Rels.FxDefaultPaymentMethod['props'];
}
