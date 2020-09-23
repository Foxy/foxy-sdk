import { API } from "./api";
import { ClientAuth } from "./auth/client";

export class ClientAPI extends API<ClientAuth> {
  constructor(...params: ConstructorParameters<typeof ClientAuth>) {
    super(new ClientAuth(...params));
  }
}
