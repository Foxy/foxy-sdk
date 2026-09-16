export type Message = {
  /**
   * Context or category for this message. Null when the message is not tied to
   * one — the "receipt not found" error is the case that reaches the client.
   */
  context: string | null;
  /** The message text. */
  message: string;
  /** Severity level of the message. */
  level: "error" | "warning" | "info";
};
