import { API } from "./API";

/**
 * The shared checkout API client. Every import of `checkout` or `checkout/loader` gets this same instance.
 *
 * @see {@link API}
 */
// PURE lets bundlers drop the instance, and the API class, when only helpers are imported.
export const client = /*#__PURE__*/ new API();
