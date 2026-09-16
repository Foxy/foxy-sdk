export type Session = {
  /**
   * Unique identifier for the session. Null when the backend has no session to
   * report: the checkout JSON turns an empty session id into null on the wire.
   */
  id: string | null;
};
