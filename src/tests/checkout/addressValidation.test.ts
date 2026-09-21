import { describe, expect, it } from "vitest";
import type {
  AddressValidation,
  BillingAddress,
  Shipment,
  ValidatedAddress,
} from "../../checkout";

describe("AddressValidation", () => {
  it("accepts a suggested verdict carrying a partial address", () => {
    const suggestion: ValidatedAddress = { city: "PALO ALTO", region: "CA" };
    const verdict: AddressValidation = { status: "suggested", suggestion };

    expect(verdict.suggestion?.city).toBe("PALO ALTO");
    // A provider with no opinion about a field omits it rather than blanking it.
    expect(verdict.suggestion?.address1).toBeUndefined();
  });

  it("accepts ok and failed verdicts without a suggestion", () => {
    const ok: AddressValidation = { status: "ok" };
    const failed: AddressValidation = { status: "failed" };

    expect(ok.suggestion).toBeUndefined();
    expect(failed.suggestion).toBeUndefined();
  });

  it("declares address_validation on both wire address shapes", () => {
    const shipment: Pick<Shipment, "address_validation"> = {
      address_validation: { status: "ok" },
    };
    const billing: Pick<BillingAddress, "address_validation"> = {
      address_validation: { status: "failed" },
    };

    expect(shipment.address_validation?.status).toBe("ok");
    expect(billing.address_validation?.status).toBe("failed");
  });

  it("treats the key as optional, which is what a pre-feature backend sends", () => {
    const shipment: Pick<Shipment, "address_validation"> = {};
    expect(shipment.address_validation).toBeUndefined();
  });
});
