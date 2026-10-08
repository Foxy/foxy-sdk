import type { Graph } from '../../core';

export interface ConnectGateway extends Graph {
  curie: 'fx:connect_gateway';

  props: {
    /** Payment gateway type to connect, for example `stripe_connect`. When reconnecting a hosted payment gateway, the API uses that gateway's own type and ignores this value. */
    type: string;
    /** URL to send the user to when the connection is finished. The API appends a `status` query parameter: `0` means success, `1` to `5` mean an error. Must be on an allowed admin host. */
    final_redirect: string;
    /** Gateway-specific connection options. */
    options?: {
      /** Required for `paypal_platform`. `ppcp` connects PayPal Checkout with direct card payments (supported store countries only), `express_checkout` connects PayPal Checkout only. */
      paypal_product_type?: 'ppcp' | 'express_checkout';
      /** For `paypal_platform`, the email of the PayPal account to connect. Pass the connected account's email to reconnect it with extra permissions. */
      email?: string;
    };
  };
}
