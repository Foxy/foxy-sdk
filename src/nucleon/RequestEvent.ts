type NucleonRequestEventDetail = {
  resolve: (response: Response) => void;
  request: Request;
  reject: (error: Error) => void;
};

export class NucleonRequestEvent extends CustomEvent<NucleonRequestEventDetail> {
  constructor(detail: NucleonRequestEventDetail) {
    super('request', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail,
    });
  }
}
