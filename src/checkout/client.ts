import { API } from "./API";

/**
 * The shared checkout API client. Every import of `checkout/client` or `checkout/loader` gets this same instance.
 *
 * @see {@link API}
 */
export const client = new API();
