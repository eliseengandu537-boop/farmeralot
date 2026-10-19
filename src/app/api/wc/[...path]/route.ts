import { NextRequest, NextResponse } from "next/server";
import { IS_PREVIEW } from "@/lib/store-config";
import { readStoreJson, requestStore, StoreRequestError } from "@/lib/store-request";

const FORWARDED_HEADERS = ["Cart-Token", "Nonce"] as const;
const RESPONSE_HEADERS = ["Cart-Token", "Nonce"] as const;

async function proxyStoreApi(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (IS_PREVIEW) return NextResponse.json({ message: "Live orders and payments are disabled in this presentation." }, { status: 409 });
  const { path } = await context.params;
  if (path.some((part) => !/^[a-z0-9-]+$/i.test(part))) {
    return NextResponse.json({ message: "Invalid WooCommerce API path." }, { status: 400 });
  }

  const route = path.join("/");
  if (!["cart", "cart/add-item", "cart/update-item", "cart/remove-item", "cart/update-customer", "cart/select-shipping-rate", "checkout"].includes(route)) {
    return NextResponse.json({ message: "Store operation not found." }, { status: 404 });
  }
  const headers = new Headers({ Accept: "application/json" });
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  if (hasBody) headers.set("Content-Type", "application/json");

  try {
    const body = hasBody ? await request.text() : undefined;
    if (body && body.length > 32_000) return NextResponse.json({ message: "Request is too large." }, { status: 413 });
    if (body) { try { JSON.parse(body); } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); } }
    const query = request.nextUrl.searchParams.toString();
    const upstream = await requestStore(`wc/store/v1/${route}${query ? `?${query}` : ""}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const response = NextResponse.json(await readStoreJson<unknown>(upstream), {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
      },
    });
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) response.headers.set(name, value);
    }
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof StoreRequestError ? error.message : "Could not connect to the Farmeralot store. Please try again shortly." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export const GET = proxyStoreApi;
export const POST = proxyStoreApi;
