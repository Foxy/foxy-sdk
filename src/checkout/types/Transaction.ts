type CardPayment = {
  /** Payment type. */
  type: 'card';
  /** Date when the payment was processed. ISO 8601 format. */
  date: string;
  /** Payment amount in the currency of the transaction. */
  amount: number;
  /** Payment gateway used for this transaction. */
  gateway: string;
  /** 3rd-party customer identifier issued by the payment gateway, e.g. PayPal Payer ID. */
  gateway_payer_id?: string;
  /** 3rd-party payment identifier issued by the payment gateway, e.g. PayPal Payment ID. */
  gateway_payment_id?: string;
  /** Card brand. Supported values will depend on the payment gateway. */
  card_brand: string;
  /** Last 4 card digits (e.g., "1234"). */
  card_last_4: string;
  /** Full expiration year (e.g., 2030). */
  card_expiry_year: number;
  /** Expiration month from 1 (January) to 12 (December). */
  card_expiry_month: number;
};

type ACHPayment = {
  /** Payment type. */
  type: 'ach';
  /** Date when the payment was processed. ISO 8601 format. */
  date: string;
  /** Payment amount in the currency of the transaction. */
  amount: number;
  /** Payment gateway used for this transaction. */
  gateway: string;
};

type POSPayment = {
  /** Payment type. */
  type: 'pos';
  /** Date when the payment was processed. ISO 8601 format. */
  date: string;
  /** Payment amount in the currency of the transaction. */
  amount: number;
  /** Payment gateway used for this transaction. */
  gateway: string;
};

type PurchaseOrderPayment = {
  /** Payment type. */
  type: 'purchase_order';
  /** Date when the payment was processed. ISO 8601 format. */
  date: string;
  /** Payment amount in the currency of the transaction. */
  amount: number;
  /** Purchase order number used for this transaction. */
  purchase_order_number: string;
};

export type Transaction = {
  /** Unique identifier for the transaction. */
  id: string;
  /** Current status of the transaction. */
  status:
    | 'completed'
    | 'approved'
    | 'authorized'
    | 'captured'
    | 'capturing'
    | 'declined'
    | 'pending'
    | 'rejected'
    | 'voided'
    | 'refunded'
    | 'refunding'
    | 'verified'
    | 'problem'
    | 'pending_fraud_review';
  /** Array of payments associated with this transaction. */
  payments: (CardPayment | ACHPayment | POSPayment | PurchaseOrderPayment)[];
  /** Date and time when the transaction occurred. */
  transaction_date: string;
};
