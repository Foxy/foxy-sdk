export type Message = {
  /** Context or category for this message. */
  context: string;
  /** The message text. */
  message: string;
  /** Severity level of the message. */
  level: "error" | "warning" | "info";
};
