import type * as FxStore from "./store";

type Curie = "fx:subscription_settings";

interface Links {
  /** This resource. */
  "self": Graph;
  /** Related store resource. */
  "fx:store": FxStore.Graph;
}

interface Props {
  /** If your customer's subscription payment fails and is configured to keep track of past due amounts, this option will automatically charge the past due amount in the next scheduled subscription. The default value is true. */
  automatically_charge_past_due_amount: boolean;
  /** If you would like to keep track of past due amounts but not automatically charge them, this setting is helpful to reset them once a successful transaction for that subscription is processed. The default value is false. */
  clear_past_due_amounts_on_success: boolean;
  /** This setting determines how you'd like to handle past due amounts when we try to process a subscription and that subscritpion fails. You can either increment the past due for each failure, only keep track of the most recent failure or ignore the amounts completely. The default value is increment. */
  past_due_amount_handling: "increment" | "replace" | "ignore";
  /** If a past due payment is paid directly by the customer, reset the next transaction date for the subscription to be one frequency out from the day that transaction is processed. */
  reset_nextdate_on_makeup_payment: boolean;
  /** A comma separated list of numbers. Each number represents the number of days after the initial failure that a reattempt should be made. For example, a setting of `1, 3, 5, 15, 30` would direct FoxyCart to attempt to collect the past-due amount on the 1st, 3rd, 5th, and 15th days after the initial transaction. */
  reattempt_schedule: string;
  /** Used in conjunction with the "bypass strings" below, this setting determines whether Foxy should reattempt the subscription charge if the transaction's previous error string does or doesn't contain specific text. */
  reattempt_bypass_logic: "skip_if_exists" | "reattempt_if_exists";
  /** A comma separated list of strings containing text strings that should prevent or allow (based on the above setting) a rebilling attempt. For example, setting the logic to "skip if the string is present" with a value for the "strings" field of `Code: 8, Code: 37` would instruct FoxyCart to not initiate the rebilling process if the last error contained either `Code: 8` or `Code: 37`, but to attempt the rebilling in all other cases. */
  reattempt_bypass_strings: string;
  /** Enter a comma separated list of numbers. Each number represents the number of days until the payment card expires that an email notification should be sent to the customer. This only happens for customers with active subscriptions. For example, if you put in 20,15,5, 20 days before the end of the month, customers with payment cards that will expire that month will receive an email. Same with 15 days and 5 days before the end of the month. */
  expiring_soon_payment_reminder_schedule: string;
  /** A comma separated list of numbers. Each number represents the number of days after the initial failure that an email notification to the customer should be sent. This only happens for active subscriptions which still have a past due amount. If a reattempt is successful, no additional reminder email will be sent. */
  reminder_email_schedule: string;
  /** A single number representing the number of days after the initial failure that a subscription should be set to cancel (assuming a successful payment hasn't been made in the meantime). For example, if a subscription is set to process on the 1st of the month and this value is 35, on the 5th of the next month (which is 35 days later, assuming the first month had 30 days), the subscription will be cancelled. (The end date will be set to that day, and it will be set to inactive.) */
  cancellation_schedule: number;
  /** When subscriptions run automatically to bill your customers, turning this setting off will prevent the normal receipt emails from being sent for their automated payment. The default value is true. */
  send_email_receipts_for_automated_billing: boolean;
  /** The date this resource was created. */
  date_created: string;
  /** The date this resource was last modified. */
  date_modified: string;
}

export interface Graph {
  curie: Curie;
  links: Links;
  props: Props;
}
