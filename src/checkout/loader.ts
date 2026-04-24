import { API } from "./API";

// This script must be imported with ?store=my-store-domain in the URL
// to ensure the API is initialized with the correct store domain. On Foxy-hosted
// pages, this script can be imported without the query parameter.

export const api = new API({
  storeDomain:
    new URL(import.meta.url).searchParams.get("store") ?? location.hostname,
});
