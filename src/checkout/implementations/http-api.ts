import type { APIJson, CustomFields } from '../types';

import { BaseCheckoutAPI, toMutable } from './base-api';
import {
  isNonNegativeInteger,
  isPositiveInteger,
  isValidEmail,
  validateBillingAddressParams,
  validateCustomFields,
  validateShipmentParams,
} from './validation';

type FetchLike = typeof fetch;

export type HttpCheckoutAPIOptions = {
  baseUrl?: string;
  fetch?: FetchLike;
  initialState?: 'idle' | 'busy';
  onError?: (error: Error) => void;
};

type Stringifiable = string | number | boolean | null | undefined;

function toFormData(input: Record<string, unknown>): URLSearchParams {
  const form = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'object') {
      form.set(key, JSON.stringify(value));
      continue;
    }

    form.set(key, String(value));
  }

  return form;
}

function toQueryString(input: Record<string, Stringifiable>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) {
      continue;
    }

    search.set(key, String(value));
  }

  return search.toString();
}

export class HttpCheckoutAPI extends BaseCheckoutAPI {
  readonly #baseUrl: string;
  readonly #fetch: FetchLike;
  readonly #onError?: (error: Error) => void;

  constructor(initialJson: APIJson, options: HttpCheckoutAPIOptions = {}) {
    super(initialJson, options.initialState ?? 'idle');
    this.#baseUrl = options.baseUrl ?? '';
    this.#fetch = options.fetch ?? fetch;
    this.#onError = options.onError;
  }

  updateItemQuantity = (...params: { id: number; quantity: number }[]): void => {
    const payload: Record<string, Stringifiable> = {};

    for (const [index, param] of params.entries()) {
      if (!isPositiveInteger(param.id) || !isNonNegativeInteger(param.quantity)) {
        this.addErrorMessage('Each item update requires a positive id and non-negative quantity.', 'item-update');
        return;
      }

      const item = this.json.items.find(candidate => candidate.id === param.id);
      if (!item) {
        this.addErrorMessage(`Item ${param.id} was not found.`, 'item-update');
        return;
      }

      if (
        !this.dispatchCancelable('item-update', {
          oldItem: toMutable(item),
          newItem: toMutable({ ...item, quantity: param.quantity }),
        })
      ) {
        return;
      }

      const prefix = index + 1;
      payload[`${prefix}:id`] = param.id;
      payload[`${prefix}:quantity`] = param.quantity;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/cart', payload);
      await this.replaceJson(nextJson);
    });
  };

  removeItem = (...params: { id: number }[]): void => {
    const payload: Record<string, Stringifiable> = {};

    for (const [index, param] of params.entries()) {
      if (!isPositiveInteger(param.id)) {
        this.addErrorMessage('Each remove call requires a positive item id.', 'item-remove');
        return;
      }

      const item = this.json.items.find(candidate => candidate.id === param.id);
      if (!item) {
        this.addErrorMessage(`Item ${param.id} was not found.`, 'item-remove');
        return;
      }

      if (!this.dispatchCancelable('item-remove', { item: toMutable(item) })) {
        return;
      }

      const prefix = index + 1;
      payload[`${prefix}:id`] = param.id;
      payload[`${prefix}:quantity`] = 0;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/cart', payload);
      await this.replaceJson(nextJson);
    });
  };

  clearCart = (reset?: boolean): void => {
    if (!this.dispatchCancelable('cart-clear')) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/cart', { empty: reset ? 'reset' : 'true' });
      await this.replaceJson(nextJson);
    });
  };

  applyCouponOrGiftCardCode = (params: { code: string }): void => {
    const code = params.code.trim();

    if (!code) {
      this.addErrorMessage('Coupon or gift card code is required.', 'coupon-or-gift-card-apply');
      return;
    }

    if (!this.dispatchCancelable('coupon-or-gift-card-apply', { code })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/cart', {
        coupon: code,
        gift_card: code,
      });
      await this.replaceJson(nextJson);
    });
  };

  removeCouponCode = (params: { couponId: number }): void => {
    if (!isPositiveInteger(params.couponId)) {
      this.addErrorMessage('Coupon id must be a positive integer.', 'coupon-remove');
      return;
    }

    const coupon = this.json.totals[0]?.coupons.find(candidate => candidate.id === params.couponId);
    if (!coupon) {
      this.addErrorMessage(`Coupon ${params.couponId} was not found.`, 'coupon-remove');
      return;
    }

    if (!this.dispatchCancelable('coupon-remove', { coupon })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/cart', {
        action: 'remove_coupon',
        coupon_id: params.couponId,
      });
      await this.replaceJson(nextJson);
    });
  };

  removeGiftCardCode = (params: { giftCardId: number }): void => {
    if (!isPositiveInteger(params.giftCardId)) {
      this.addErrorMessage('Gift card id must be a positive integer.', 'gift-card-remove');
      return;
    }

    const giftCard = this.json.totals[0]?.gift_cards.find(candidate => candidate.id === params.giftCardId);
    if (!giftCard) {
      this.addErrorMessage(`Gift card ${params.giftCardId} was not found.`, 'gift-card-remove');
      return;
    }

    if (!this.dispatchCancelable('gift-card-remove', { giftCard })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/cart', {
        action: 'remove_gift_card',
        gift_card_id: params.giftCardId,
      });
      await this.replaceJson(nextJson);
    });
  };

  addMessage(params: APIJson['messages'][number]): number {
    if (!this.dispatchCancelable('messages-add', { message: params })) {
      return -1;
    }

    this.mutateJson(json => {
      json.messages.push(params);
    });

    return this.json.messages.length - 1;
  }

  removeMessage(index: number): void {
    if (!isNonNegativeInteger(index)) {
      this.addErrorMessage('Message index must be a non-negative integer.', 'messages-remove');
      return;
    }

    const message = this.json.messages[index];
    if (!message) {
      this.addErrorMessage(`Message index ${index} is out of bounds.`, 'messages-remove');
      return;
    }

    if (!this.dispatchCancelable('messages-remove', { message })) {
      return;
    }

    this.mutateJson(json => {
      json.messages.splice(index, 1);
    });
  }

  clearMessages(): void {
    if (!this.dispatchCancelable('messages-clear')) {
      return;
    }

    this.mutateJson(json => {
      json.messages = [];
    });
  }

  setEmail(email: string, mode?: 'guest' | 'registered'): void {
    const normalizedEmail = email.trim();

    if (!isValidEmail(normalizedEmail)) {
      this.addErrorMessage('A valid email is required.', 'email-update');
      return;
    }

    if (!this.dispatchCancelable('email-update', { email: normalizedEmail })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', {
        customer_email: normalizedEmail,
        customer_type: mode,
      });
      await this.replaceJson(nextJson);
    });
  }

  requestTemporaryPassword(email?: string): void {
    const emailToUse = (email ?? this.json.customer.email ?? '').trim();

    if (!isValidEmail(emailToUse)) {
      this.addErrorMessage('A valid email is required for temporary password request.', 'temporary-password-request');
      return;
    }

    if (!this.dispatchCancelable('temporary-password-request', { email: emailToUse })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', {
        action: 'request_temporary_password',
        customer_email: emailToUse,
      });
      await this.replaceJson(nextJson);
    });
  }

  signIn = (params: { email: string; password: string }): void => {
    const email = params.email.trim();
    const password = params.password;

    if (!isValidEmail(email)) {
      this.addErrorMessage('A valid sign-in email is required.', 'sign-in');
      return;
    }

    if (!password.trim()) {
      this.addErrorMessage('Password is required.', 'sign-in');
      return;
    }

    if (!this.dispatchCancelable('sign-in', { email, password })) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', {
        customer_email: email,
        customer_password: password,
      });
      await this.replaceJson(nextJson);
    });
  };

  signOut(): void {
    if (!this.dispatchCancelable('sign-out')) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', {
        customer_email: '',
      });
      await this.replaceJson(nextJson);
    });
  }

  updateShipment = (
    params: Partial<{
      index: number;
      first_name: string;
      last_name: string;
      company: string;
      phone: string;
      address1: string;
      address2: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
      shipping_service_id: number | null;
    }>
  ): void => {
    const index = params.index ?? 0;

    if (!isNonNegativeInteger(index)) {
      this.addErrorMessage('Shipment index must be a non-negative integer.', 'shipment-update');
      return;
    }

    const shipment = this.json.shipments[index];
    if (!shipment) {
      this.addErrorMessage(`Shipment ${index} was not found.`, 'shipment-update');
      return;
    }

    const nextShipment = {
      ...toMutable(shipment),
      first_name: params.first_name ?? shipment.first_name,
      last_name: params.last_name ?? shipment.last_name,
      company: params.company ?? shipment.company,
      phone: params.phone ?? shipment.phone,
      address1: params.address1 ?? shipment.address1,
      address2: params.address2 ?? shipment.address2,
      city: params.city ?? shipment.city,
      region: params.region ?? shipment.region,
      postal_code: params.postal_code ?? shipment.postal_code,
      country: params.country ?? shipment.country,
      shipping_service_id: params.shipping_service_id ?? shipment.shipping_service_id,
    };

    const shipmentErrors = validateShipmentParams(
      params as Record<string, string | null | undefined>,
      this.json.display,
      {
        countryOptions: shipment.country_options,
        regionOptions: shipment.region_options,
      }
    );
    for (const err of shipmentErrors) {
      this.addErrorMessage(err.message, err.context);
    }
    if (shipmentErrors.length > 0) return;

    if (!this.dispatchCancelable('shipment-update', nextShipment)) {
      return;
    }

    const payload: Record<string, Stringifiable> = {};

    const map: Array<[keyof typeof params, string]> = [
      ['first_name', `shipto_${index}_first_name`],
      ['last_name', `shipto_${index}_last_name`],
      ['company', `shipto_${index}_company`],
      ['phone', `shipto_${index}_phone`],
      ['address1', `shipto_${index}_address1`],
      ['address2', `shipto_${index}_address2`],
      ['city', `shipto_${index}_city`],
      ['region', `shipto_${index}_region`],
      ['postal_code', `shipto_${index}_postal_code`],
      ['country', `shipto_${index}_country`],
    ];

    for (const [source, target] of map) {
      const value = params[source];
      if (value !== undefined) {
        payload[target] = value;
      }
    }

    if (params.shipping_service_id !== undefined) {
      payload[index === 0 ? 'shipping_service_id' : `shipto_${index}_service_id`] = params.shipping_service_id;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', payload);
      await this.replaceJson(nextJson);
    });
  };

  updateBillingAddress = (
    params: Partial<{
      first_name: string;
      last_name: string;
      company: string;
      phone: string;
      address1: string;
      address2: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
    }>
  ): void => {
    const nextAddress = {
      ...this.json.billing_address,
      ...params,
    };

    const billingErrors = validateBillingAddressParams(
      params as Record<string, string | null | undefined>,
      this.json.display,
      {
        countryOptions: this.json.billing_address.country_options ?? this.json.shipments[0]?.country_options,
        regionOptions: this.json.billing_address.region_options ?? this.json.shipments[0]?.region_options,
      }
    );
    for (const err of billingErrors) {
      this.addErrorMessage(err.message, err.context);
    }
    if (billingErrors.length > 0) return;

    if (!this.dispatchCancelable('billing-address-update', nextAddress)) {
      return;
    }

    const payload = {
      billing_first_name: params.first_name,
      billing_last_name: params.last_name,
      billing_company: params.company,
      billing_phone: params.phone,
      billing_address1: params.address1,
      billing_address2: params.address2,
      billing_city: params.city,
      billing_region: params.region,
      billing_postal_code: params.postal_code,
      billing_country: params.country,
    };

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', payload);
      await this.replaceJson(nextJson);
    });
  };

  setCustomFields = (fields: CustomFields): void => {
    const errors = validateCustomFields(fields);
    if (errors.length > 0) {
      for (const error of errors) {
        this.addErrorMessage(error, 'custom-fields-update');
      }
      return;
    }

    if (!this.dispatchCancelable('custom-fields-update', fields)) {
      return;
    }

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', fields);
      await this.replaceJson(nextJson);
    });
  };

  async getAddressSuggestions(params: {
    postalCode: string;
    country: string;
  }): Promise<
    Array<{
      country: string;
      region: string;
      city: string;
      address1: string;
      address2: string;
      postal_code: string;
    }>
  > {
    const postalCode = params.postalCode.trim();
    const country = params.country.trim().toUpperCase();

    if (!postalCode || !country) {
      return [];
    }

    const response = await this.#fetch(
      this.resolveUrl('/helpers', {
        action: 'get_address_suggestions',
        country,
        postal_code: postalCode,
      })
    );

    if (!response.ok) {
      throw this.createRequestError(response.status, 'Failed to load address suggestions.');
    }

    const json = (await response.json()) as unknown;

    if (!Array.isArray(json)) {
      return [];
    }

    return json as Array<{
      country: string;
      region: string;
      city: string;
      address1: string;
      address2: string;
      postal_code: string;
    }>;
  }

  logError(error: Error): void {
    if (this.json.debug) {
      console.error(error);
    }

    void this.#fetch(this.resolveUrl('/helpers', { action: 'log_error' }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: toFormData({ error: error.message }),
    }).catch(() => {
      this.#onError?.(error);
    });
  }

  async validateApplePayMerchant(params: { validationURL: string }): Promise<unknown> {
    const validationURL = params.validationURL.trim();

    if (!validationURL) {
      throw new Error('Apple Pay validation URL is required.');
    }

    const response = await this.#fetch(this.resolveUrl('/checkout', { action: 'validate_merchant' }), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: toFormData({ validationURL }),
    });

    if (!response.ok) {
      throw this.createRequestError(response.status, 'Failed to validate Apple Pay merchant.');
    }

    return (await response.json()) as unknown;
  }

  checkOut = (paymentMethod: unknown): void => {
    if (!this.dispatchCancelable('checkout')) {
      return;
    }

    const payload =
      paymentMethod && typeof paymentMethod === 'object'
        ? ({ ...paymentMethod, action: 'submit' } as Record<string, unknown>)
        : { action: 'submit', payment_method: paymentMethod };

    void this.runMutation(async () => {
      const nextJson = await this.postJson('/checkout', payload);
      await this.replaceJson(nextJson);
    });
  };

  private async runMutation(action: () => Promise<void>): Promise<void> {
    this.setState('busy');

    try {
      await action();
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error(String(error));
      this.addErrorMessage(normalized.message, 'network');
      this.#onError?.(normalized);
    } finally {
      this.setState('idle');
    }
  }

  private resolveUrl(path: string, query?: Record<string, Stringifiable>): string {
    const base = this.#baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const suffix = query ? `?${toQueryString(query)}` : '';

    return `${base}${normalizedPath}${suffix}`;
  }

  private async postJson(path: string, body: Record<string, unknown>): Promise<APIJson> {
    const response = await this.#fetch(this.resolveUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: toFormData({ ...body, output: 'json' }),
    });

    if (!response.ok) {
      throw this.createRequestError(response.status, `Request failed for ${path}.`);
    }

    return (await response.json()) as APIJson;
  }

  private createRequestError(status: number, message: string): Error {
    return new Error(`${message} HTTP status ${status}.`);
  }
}
