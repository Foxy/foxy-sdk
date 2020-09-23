import { API } from "./api";
import { UserAuth } from "./auth/user";

export class UserAPI extends API<UserAuth> {
  constructor(...params: ConstructorParameters<typeof UserAuth>) {
    super(new UserAuth(...params));
  }
}
