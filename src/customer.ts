import { API } from "./api";
import { CustomerAuth } from "./auth/customer";

export class CustomerAPI extends API<CustomerAuth> {
  constructor(...params: ConstructorParameters<typeof CustomerAuth>) {
    super(new CustomerAuth(...params));
  }
}
