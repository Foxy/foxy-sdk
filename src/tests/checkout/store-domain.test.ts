import { createApiJson } from "./fixtures/apiJson";

import { API } from "../../checkout/API";

function flushTasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

describe("store domain activation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stays inactive without storeDomain until a store domain is set", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    expect(() => new API({ initialJson: createApiJson() })).not.toThrow();

    const api = new API({ initialJson: createApiJson() });

    await expect(
      api.getAddressSuggestions({ postalCode: "12345", country: "US" }),
    ).rejects.toThrow(
      "This API instance is inactive until storeDomain is set.",
    );

    api.setStoreDomain("store.test");

    await expect(
      api.getAddressSuggestions({ postalCode: "12345", country: "US" }),
    ).resolves.toEqual([]);

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://store.test/helpers?action=get_address_suggestions&country=US&postal_code=12345",
    );
  });

  it("loads cart JSON when storeDomain is set after inactive initialization", async () => {
    const json = createApiJson();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(json), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const api = new API({});

    expect(api.state).toBe("idle");
    expect(api.json).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();

    api.setStoreDomain("store.test");
    await vi.waitFor(() => {
      expect(api.json).toEqual(json);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://store.test/cart?output=json",
    );
  });

  it("sends no request in the task that sets the domain", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const api = new API({});

    api.setStoreDomain("store.test");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends exactly one GET /cart when the domain is set right after construction", async () => {
    // A response that takes longer than one task, like a real network. With
    // an instant mock, json is already set when the constructor's timer
    // fires, and the double request does not show.
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(new Response(JSON.stringify(createApiJson()), { status: 200 })), 5),
        ),
    );
    const api = new API({});

    api.setStoreDomain("store.test");
    await vi.waitFor(() => expect(api.json).not.toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
