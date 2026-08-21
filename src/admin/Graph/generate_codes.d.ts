import type { Graph } from '../../core';

export interface GenerateCodes extends Graph {
  curie: 'fx:generate_codes';

  props: {
    /** Optional length of the coupon code. Defaults to 6 characters. */
    length: number;
    /** Optional number of coupon code variations you would like. Defaults to 10. */
    number_of_codes: number;
    /** Optional number of coupon code variations you would like to generate. For example, if you would like all the coupon code variations to have a "summer_special" prefix, set that here. */
    prefix: string;
    /** Optional initial balance (gift cards only). Defaults to 0. */
    current_balance?: number;
  };
}
