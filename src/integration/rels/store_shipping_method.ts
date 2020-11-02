import type { APIGraph } from '../../core/types';
import type { FxShippingContainer } from './shipping_container';
import type { FxShippingContainers } from './shipping_containers';
import type { FxShippingDropType } from './shipping_drop_type';
import type { FxShippingDropTypes } from './shipping_drop_types';
import type { FxShippingMethod } from './shipping_method';
import type { FxShippingMethods } from './shipping_methods';
import type { FxShippingServices } from './shipping_services';
import type { FxStore } from './store';
import type { FxStoreShippingServices } from './store_shipping_services';

export interface FxStoreShippingMethod extends APIGraph {
  curie: 'fx:store_shipping_method';

  links: {
    /** This resource. */
    'self': FxStoreShippingMethod;
    /** Related store resource. */
    'fx:store': FxStore;
    /** Related shipping method resource. */
    'fx:shipping_method': FxShippingMethod;
    /** List of all available shipping methods. */
    'fx:shipping_methods': FxShippingMethods;
    /** List of all available shipping services. */
    'fx:shipping_services': FxShippingServices;
    /** Shipping container linked to this shipping method. */
    'fx:shipping_container': FxShippingContainer;
    /** Shipping drop type linked to this shipping method. */
    'fx:shipping_drop_type': FxShippingDropType;
    /** List of all available shipping containers for this shipping method. */
    'fx:shipping_containers': FxShippingContainers;
    /** List of all available shipping drop types for this shipping method. */
    'fx:shipping_drop_types': FxShippingDropTypes;
    /** Available shipping services for this shipping method. */
    'fx:store_shipping_services': FxStoreShippingServices;
  };

  props: {
    /** The full API URI of the shipping method defined in our property helpers. */
    shipping_method_uri: string;
    /** The full API URI of the shipping method container defined in our property helpers. Each shipping method will have it's own shipping containers. */
    shipping_container_uri: string;
    /** The full API URI of the shipping method drop type defined in our property helpers. Each shipping method will have it's own shipping drop types. */
    shipping_drop_type_uri: string;
    /** If using account specific rates, enter your shipping account id here. */
    accountid: string;
    /** If using account specific rates, enter your shipping account password here. */
    password: string;
    /** If using account specific rates, enter your shipping account meter number here, if applicable. */
    meter_number: string;
    /** If using account specific rates, enter your shipping account authentication key here, if applicable. */
    authentication_key: string;
    /** Set to true if you want this shipping method to apply to domestic shipping rate requests. <br>Note: This value is read only `true` for `CUSTOM-CODE`. */
    use_for_domestic: string;
    /** Set to true if you want this shipping method to apply to international shipping rate requests. <br>Note: This value is read only `true` for `CUSTOM-CODE`. */
    use_for_international: string;
    /** For the `CUSTOM-CODE` shipping method. JavaScript used to create and modify shipping rates. */
    custom_code: string;
    /** For the `CUSTOM-CODE` shipping method. Values are `deploying`, `deployed`, and `error`. */
    deployment_status: 'deploying' | 'deployed' | 'error';
    /** The date this resource was created. */
    date_created: string;
    /** The date this resource was last modified. */
    date_modified: string;
  };

  zooms: {
    store_shipping_services: FxStoreShippingServices;
    shipping_container: FxShippingContainer;
    shipping_drop_type: FxShippingDropType;
    shipping_method: FxShippingMethod;
  };
}
