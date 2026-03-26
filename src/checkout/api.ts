import type { APIEventMap, APIJson, CustomFields } from './types';
import {
  StandardACHGateway,
  StandardCardGateway,
  StandardRedirectGateway,
  StripeConnectGateway,
  StripeV2Gateway,
} from './types/payment-option';
import type { Listener } from './types/listener';

/**
 * This is going to be under SDK.Checkout.API in the @foxy.io/sdk package.
 * Pages using loader.js will have an initialized instance under window.Foxy.api.
 *
 * Fires non-cancelable `update` event whenever `API.json` is updated from the server.
 */
export abstract class API extends EventTarget {
  addEventListener<K extends keyof APIEventMap>(type: K, listener: Listener<K, API>): void;

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    return super.addEventListener(type, listener);
  }

  removeEventListener<K extends keyof APIEventMap>(type: K, listener: Listener<K, API>): void;

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    return super.removeEventListener(type, listener);
  }

  /** The current state of the API client. Requests that modify `API.json` will trigger a state change. */
  abstract readonly state: 'idle' | 'busy';

  /** The complete data state for cart, checkout and receipt. Contains all information about the current session, customer, items, totals, and settings. */
  abstract readonly json: APIJson;

  /**
   * Sets item quantity for each one of the items. This method will update `API.items` accordingly
   * and temporarily switch the client state to "busy" and back to "idle" when done.
   * Sends `POST /cart?1:id=123&1:quantity=0&2:id=456&2:quantity=0&...`.
   * Fires a cancelable `item-update` event before updating the item quantity.
   */
  abstract updateItemQuantity: (...params: { id: number; quantity: number }[]) => void;

  /**
   * Sets item quantity to 0 for each one of the items, effectively removing them from the cart.
   * This method will update `API.items` accordingly and temporarily switch the client state to "busy" and back to "idle" when done.
   * Sends `POST /cart?1:id=123&1:quantity=0&2:id=456&2:quantity=0&...`.
   * Fires a cancelable `item-remove` event before removing the item.
   */
  abstract removeItem: (...params: { id: number }[]) => void;

  /**
   * Removes all products from the cart, optionally resetting the cart session.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Sends `POST /cart?empty=true` or `POST /cart?empty=reset`.
   * Fires a cancelable `cart-clear` event before clearing the cart.
   */
  abstract clearCart: (reset?: boolean) => void;

  /**
   * Applies a coupon or gift card code to the cart and updates `API.totals[index].coupons` and/or `API.totals[index].gift_cards`.
   * If code doesn't exist, adds a message to `API.messages`. This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Sends `POST /cart?coupon=ABC&gift_card=XYZ`.
   * Fires a cancelable `coupon-or-gift-card-apply` event before applying the code.
   */
  abstract applyCouponOrGiftCardCode: (params: { code: string }) => void;

  /**
   * Removes the specified coupon code from the cart and updates `API.totals[index].coupons`.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Sends `POST /cart?action=remove_coupon&coupon_id=123`.
   * Fires a cancelable `coupon-remove` event before removing the coupon.
   */
  abstract removeCouponCode: (params: { couponId: number }) => void;

  /**
   * Removes the specified gift card code from the cart and updates `API.totals[index].gift_cards`.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Sends `POST /cart?action=remove_gift_card&gift_card_id=123`.
   * Fires a cancelable `gift-card-remove` event before removing the gift card.
   */
  abstract removeGiftCardCode: (params: { giftCardId: number }) => void;

  /**
   * Adds a message to `API.messages` and returns its index.
   * No server interaction. Fires a cancelable `messages-add` event before adding the message.
   */
  abstract addMessage(params: APIJson['messages'][number]): number;

  /**
   * Removes a message from `API.messages` by its index.
   * No server interaction. Fires a cancelable `messages-remove` event before removing the message.
   */
  abstract removeMessage(index: number): void;

  /**
   * Clears all messages from `API.messages`.
   * No server interaction. Fires a cancelable `messages-clear` event before clearing the messages.
   */
  abstract clearMessages(): void;

  /**
   * Associates an email address with the cart and updates the `API.customer.type` property accordingly.
   * When using this method while being signed in, this method will sign out the user first.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?customer_email=ABC`.
   * Fires a cancelable `email-update` event before setting the email.
   */
  abstract setEmail(email: string, mode?: 'guest' | 'registered'): void;

  /**
   * Sends a temporary password to the email address associated with the cart.
   * If an email parameter is provided, it will also set the email on the cart. This method will
   * temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?action=request_temporary_password?customer_email=ABC`.
   * Fires a cancelable `temporary-password-request` event before requesting the password.
   */
  abstract requestTemporaryPassword(email?: string): void;

  /**
   * Signs in a user with the given email and password. On success, it will update the `API.customer` object with user data.
   * On failure, it will update the `API.messages` object with an error.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?customer_email=ABC&customer_password=DEF`.
   * Fires a cancelable `sign-in` event before signing in.
   */
  abstract signIn: (params: { email: string; password: string }) => void;

  /**
   * Signs out the current user, clearing user data from the `API.customer` object.
   * Billing and shipping details will be preserved.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?customer_email=`.
   * Fires a cancelable `sign-out` event before signing out.
   */
  abstract signOut(): void;

  /**
   * Stores shipping details for the shipment at the given index (0-based). If no index is provided,
   * it will update the first shipment. When using live rates, this will also load shipping options
   * into `API.shipments[index].shipping_service_options`. This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?shipto_{index}_first_name=ABC&shipto_{index}_last_name=DEF&...`.
   * Fires a cancelable `shipment-update` event before setting the details.
   */
  abstract updateShipment: (
    params: Partial<{
      /** The shipment index to update (0-based). Defaults to 0 if not provided. */
      index: number;
      /** Recipient's first name. */
      first_name: string;
      /** Recipient's last name. */
      last_name: string;
      /** Company name for shipping. */
      company: string;
      /** Contact phone number. */
      phone: string;
      /** Primary address line. */
      address1: string;
      /** Secondary address line. */
      address2: string;
      /** City name. */
      city: string;
      /** State or region. */
      region: string;
      /** Postal code or ZIP code. */
      postal_code: string;
      /** Country code. */
      country: string;
      /** Selected shipping service ID. */
      shipping_service_id: number | null;
    }>
  ) => void;

  /**
   * Stores billing details on the cart. This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?billing_first_name=ABC&billing_last_name=DEF&...`.
   * Fires a cancelable `billing-address-update` event before setting the details.
   */
  abstract updateBillingAddress: (
    params: Partial<{
      /** Billing recipient's first name. */
      first_name: string;
      /** Billing recipient's last name. */
      last_name: string;
      /** Company name for billing. */
      company: string;
      /** Contact phone number. */
      phone: string;
      /** Primary address line. */
      address1: string;
      /** Secondary address line. */
      address2: string;
      /** City name. */
      city: string;
      /** State or region. */
      region: string;
      /** Postal code or ZIP code. */
      postal_code: string;
      /** Country code. */
      country: string;
    }>
  ) => void;

  /**
   * Updates custom fields on the cart. Custom fields are fields with names starting with `h:`.
   * This method will temporarily switch the client state to "busy" and back to "idle" when done.
   * Calls `POST /checkout?h:custom_field_1=ABC&h:custom_field_2=DEF&...`.
   * Fires a cancelable `custom-fields-update` event before setting the fields.
   */
  abstract setCustomFields: (fields: CustomFields) => void;

  /**
   * Fetches address suggestions based on postal code and country.
   * Calls `GET /helpers?action=get_address_suggestions&country=AB&postal_code=CDEFGH`.
   * This is a helper method – `API.json` is not updated and no events are fired.
   */
  abstract getAddressSuggestions(params: {
    /** Postal code to search for. */ postalCode: string;
    /** Country code. */ country: string;
  }): Promise<
    Array<{
      /** Country code. */
      country: string;
      /** State or region. */
      region: string;
      /** City name. */
      city: string;
      /** Primary address line. */
      address1: string;
      /** Secondary address line. */
      address2: string;
      /** Postal code or ZIP code. */
      postal_code: string;
    }>
  >;

  /**
   * Logs an error to the console if `API.debug` is true and sends it to the server.
   * Calls `POST /helpers?action=log_error&error=ABC`.
   * This is a helper method – `API.json` is not updated and no events are fired.
   */
  abstract logError(error: Error): void;

  /**
   * Submits the order with the given payment method details.
   * Calls `POST /checkout?action=submit` with payment method details in the body.
   * Fires a cancelable `checkout` event before submitting the order.
   *
   * - ACH Gateways: `POST /checkout?action=submit&gateway=accept_blue_ach&ach_token=XYZ`
   * - Embedded Card Gateways: `POST /checkout?action=submit&gateway=authorize&card_token=XYZ`
   * - Redirect-Based Gateways: `POST /checkout?action=submit&gateway=adyen`
   * - Stripe Connect and Stripe Connect Charge: `POST /checkout?action=submit&gateway=stripe_connect&payment_method_id=XYZ`
   * - Stripe v2 Payment Element: `POST /checkout?action=submit&gateway=stripe_v2&...`
   *
   * Note: the stripe_v2 payload is intentionally extensible and will be narrowed
   * once the backend contract is finalized.
   */
  abstract checkOut: (
    paymentOption:
      | { gateway: StandardACHGateway; ach_token: string }
      | { gateway: StandardCardGateway; card_token: string }
      | { gateway: StandardRedirectGateway }
      | { gateway: StripeConnectGateway; payment_method_id: string }
      | ({ gateway: StripeV2Gateway } & Record<string, unknown>)
  ) => void;
}
