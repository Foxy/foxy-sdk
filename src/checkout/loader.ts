import { client } from "./client";

client.setStoreDomain(
  new URL(import.meta.url).searchParams.get("store") ?? location.hostname,
);

export { client };
