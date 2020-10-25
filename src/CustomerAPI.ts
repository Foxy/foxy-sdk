import { API } from "./API";
import { Graph } from "./types/customer";

export class CustomerAPI extends API<Graph> {}

declare const api: CustomerAPI;

api
  .get({ zoom: ["subscriptions"] })
  .then((v) => v.json())
  .then((v) => v._embedded["fx:subscriptions"][0]._embedded["fx:transaction_template"]._embedded["fx:items"][0].name);
