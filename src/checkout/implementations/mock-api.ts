import type { APIJson, CustomFields, GiftCard, Shipment } from '../types';

import { BaseCheckoutAPI, toMutable } from './base-api';
import { isNonNegativeInteger, isPositiveInteger, isValidEmail, validateCustomFields } from './validation';

function normalizeCode(code: string): string {
  return code.trim();
}

function nextNumericId(values: Array<{ id: number }>): number {
  return values.reduce((max, value) => Math.max(max, value.id), 0) + 1;
}

export class MockCheckoutAPI extends BaseCheckoutAPI {
  replaceJsonForTesting(nextJson: APIJson): void {
    this.replaceJson(nextJson);
  }

  updateItemQuantity = (...params: { id: number; quantity: number }[]): void => {
    this.setState('busy');

    try {
      for (const param of params) {
        if (!isPositiveInteger(param.id)) {
          this.addErrorMessage('Item id must be a positive integer.', 'item-update');
          continue;
        }

        if (!isNonNegativeInteger(param.quantity)) {
          this.addErrorMessage('Item quantity must be a non-negative integer.', 'item-update');
          continue;
        }

        const item = this.json.items.find(candidate => candidate.id === param.id);

        if (!item) {
          this.addErrorMessage(`Item ${param.id} was not found.`, 'item-update');
          continue;
        }

        const nextItem = { ...item, quantity: param.quantity };
        const canProceed = this.dispatchCancelable('item-update', {
          oldItem: toMutable(item),
          newItem: toMutable(nextItem),
        });

        if (!canProceed) {
          continue;
        }

        this.mutateJson(json => {
          json.items = json.items
            .map(candidate => (candidate.id === param.id ? { ...candidate, quantity: param.quantity } : candidate))
            .filter(candidate => candidate.quantity > 0);
        });
      }
    } finally {
      this.setState('idle');
    }
  };

  removeItem = (...params: { id: number }[]): void => {
    this.setState('busy');

    try {
      for (const param of params) {
        if (!isPositiveInteger(param.id)) {
          this.addErrorMessage('Item id must be a positive integer.', 'item-remove');
          continue;
        }

        const item = this.json.items.find(candidate => candidate.id === param.id);

        if (!item) {
          this.addErrorMessage(`Item ${param.id} was not found.`, 'item-remove');
          continue;
        }

        if (!this.dispatchCancelable('item-remove', { item: toMutable(item) })) {
          continue;
        }

        this.mutateJson(json => {
          json.items = json.items.filter(candidate => candidate.id !== param.id);
        });
      }
    } finally {
      this.setState('idle');
    }
  };

  clearCart = (reset?: boolean): void => {
    if (!this.dispatchCancelable('cart-clear')) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.items = [];

        if (reset) {
          json.customer = {
            first_name: null,
            last_name: null,
            email: null,
            type: null,
            id: null,
            token: null,
          };
          json.custom_fields = {};
          json.messages = [];
        }
      });
    } finally {
      this.setState('idle');
    }
  };

  applyCouponOrGiftCardCode = (params: { code: string }): void => {
    const code = normalizeCode(params.code);

    if (!code) {
      this.addErrorMessage('Coupon or gift card code is required.', 'coupon-or-gift-card-apply');
      return;
    }

    if (!this.dispatchCancelable('coupon-or-gift-card-apply', { code })) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        const totals = json.totals[0];
        if (!totals) return;

        const lowered = code.toLowerCase();
        const isGiftCard = lowered.startsWith('gift') || lowered.startsWith('gc-');

        if (isGiftCard) {
          const giftCard: GiftCard = {
            id: nextNumericId(totals.gift_cards),
            code,
            code_id: nextNumericId(totals.gift_cards),
            name: `Gift Card (${code})`,
            amount: 10,
            current_balance: 100,
          };
          totals.gift_cards.push(giftCard);
          totals.total_order = Math.max(0, totals.total_order - giftCard.amount);
          return;
        }

        const coupon = {
          id: nextNumericId(totals.coupons),
          code,
          code_id: nextNumericId(totals.coupons),
          name: `Coupon (${code})`,
          amount: 5,
          is_taxable: false,
          is_auto_apply: false,
        };

        totals.coupons.push(coupon);
        totals.total_order = Math.max(0, totals.total_order - coupon.amount);
      });
    } finally {
      this.setState('idle');
    }
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

    this.setState('busy');

    try {
      this.mutateJson(json => {
        const totals = json.totals[0];
        if (!totals) return;

        totals.coupons = totals.coupons.filter(candidate => candidate.id !== params.couponId);
        totals.total_order += coupon.amount;
      });
    } finally {
      this.setState('idle');
    }
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

    this.setState('busy');

    try {
      this.mutateJson(json => {
        const totals = json.totals[0];
        if (!totals) return;

        totals.gift_cards = totals.gift_cards.filter(candidate => candidate.id !== params.giftCardId);
        totals.total_order += giftCard.amount;
      });
    } finally {
      this.setState('idle');
    }
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
    if (!isValidEmail(email)) {
      this.addErrorMessage('A valid email is required.', 'email-update');
      return;
    }

    if (!this.dispatchCancelable('email-update', { email })) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.customer.email = email;
        json.customer.type = mode ?? 'guest';
        json.customer.id = mode === 'registered' ? 1 : null;
        json.customer.token = mode === 'registered' ? 'mock-customer-token' : null;
      });
    } finally {
      this.setState('idle');
    }
  }

  requestTemporaryPassword(email?: string): void {
    const emailToUse = email ?? this.json.customer.email;

    if (!emailToUse || !isValidEmail(emailToUse)) {
      this.addErrorMessage('A valid email is required for temporary password request.', 'temporary-password-request');
      return;
    }

    if (!this.dispatchCancelable('temporary-password-request', { email: emailToUse })) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.customer.email = emailToUse;
        json.messages.push({
          context: 'temporary-password-request',
          message: 'Temporary password requested.',
          level: 'info',
        });
      });
    } finally {
      this.setState('idle');
    }
  }

  signIn = (params: { email: string; password: string }): void => {
    const email = params.email.trim();
    const password = params.password.trim();

    if (!isValidEmail(email)) {
      this.addErrorMessage('A valid sign-in email is required.', 'sign-in');
      return;
    }

    if (!password) {
      this.addErrorMessage('Password is required.', 'sign-in');
      return;
    }

    if (!this.dispatchCancelable('sign-in', { email, password })) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.customer.email = email;
        json.customer.type = 'registered';
        json.customer.id = 1;
        json.customer.token = 'mock-customer-token';
      });
    } finally {
      this.setState('idle');
    }
  };

  signOut(): void {
    if (!this.dispatchCancelable('sign-out')) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.customer.first_name = null;
        json.customer.last_name = null;
        json.customer.email = null;
        json.customer.type = null;
        json.customer.id = null;
        json.customer.token = null;
      });
    } finally {
      this.setState('idle');
    }
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

    const current = this.json.shipments[index];
    if (!current) {
      this.addErrorMessage(`Shipment ${index} was not found.`, 'shipment-update');
      return;
    }

    const nextShipment: Shipment = {
      ...toMutable(current),
      first_name: params.first_name ?? current.first_name,
      last_name: params.last_name ?? current.last_name,
      company: params.company ?? current.company,
      phone: params.phone ?? current.phone,
      address1: params.address1 ?? current.address1,
      address2: params.address2 ?? current.address2,
      city: params.city ?? current.city,
      region: params.region ?? current.region,
      postal_code: params.postal_code ?? current.postal_code,
      country: params.country ?? current.country,
      shipping_service_id: params.shipping_service_id ?? current.shipping_service_id,
    };

    if (!this.dispatchCancelable('shipment-update', nextShipment)) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.shipments[index] = nextShipment;
      });
    } finally {
      this.setState('idle');
    }
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

    if (!this.dispatchCancelable('billing-address-update', nextAddress)) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.billing_address = nextAddress;
      });
    } finally {
      this.setState('idle');
    }
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

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.custom_fields = {
          ...json.custom_fields,
          ...fields,
        };
      });
    } finally {
      this.setState('idle');
    }
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

    const shipment = this.json.shipments[0];

    if (!shipment) {
      return [];
    }

    return [
      {
        country,
        region: shipment.region,
        city: shipment.city,
        address1: shipment.address1,
        address2: shipment.address2,
        postal_code: postalCode,
      },
    ];
  }

  logError(error: Error): void {
    if (this.json.debug) {
      console.error(error);
    }
  }

  checkOut = (paymentMethod: unknown): void => {
    if (!this.dispatchCancelable('checkout')) {
      return;
    }

    this.setState('busy');

    try {
      this.mutateJson(json => {
        json.messages.push({
          context: 'checkout',
          message: 'Checkout submitted.',
          level: 'info',
        });
      });
    } finally {
      this.setState('idle');
    }
  };
}
