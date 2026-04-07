export type Customer = {
  /** Customer's first name. */
  first_name: string | null;
  /** Customer's last name. */
  last_name: string | null;
  /** Customer's email address. */
  email: string | null;
  /** Customer type (guest, registered, or not identified). */
  type: "guest" | "registered" | null;
  /** Unique customer identifier. */
  id: number | null;
  /** JWT token for authenticated customers. */
  token: string | null;
};
