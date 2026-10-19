import { expect, test } from "@playwright/test";
import { loadCatalogue, readStoreJson, requestStore, StoreRequestError } from "../src/lib/store-request";

const originalFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = originalFetch; });

test("an upstream 403 produces a recoverable error without retrying", async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('{"message":"Access denied"}', { status: 403, headers: { "content-type": "application/json" } }); };
  const result = await loadCatalogue(() => requestStore("wc/store/v1/products"));
  expect(result.data).toBeNull();
  expect(result.error).toContain("request a quote");
  expect(calls).toBe(1);
});

test("non-JSON, malformed JSON and connection failures are recoverable", async () => {
  globalThis.fetch = async () => new Response("<html>Blocked</html>", { headers: { "content-type": "text/html" } });
  await expect(requestStore("wc/store/v1/products")).rejects.toMatchObject({ code: "invalid_response" });
  await expect(readStoreJson(new Response("broken"))).rejects.toBeInstanceOf(StoreRequestError);
  globalThis.fetch = async () => { throw new TypeError("Connection failed"); };
  await expect(requestStore("wc/store/v1/cart")).rejects.toMatchObject({ code: "unavailable" });
});

test("unexpected programming errors are not disguised as a store outage", async () => {
  await expect(loadCatalogue(async () => { throw new Error("Unexpected bug"); })).rejects.toThrow("Unexpected bug");
});
