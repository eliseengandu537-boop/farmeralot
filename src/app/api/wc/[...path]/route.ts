import { NextRequest, NextResponse } from "next/server";

const WORDPRESS_STORE_API = "https://farmeralot.co.za/wp-json/wc/store/v1";
const FORWARDED_HEADERS = ["Cart-Token", "Nonce"] as const;
const RESPONSE_HEADERS = ["Cart-Token", "Nonce"] as const;

async function proxyStoreApi(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.some((part) => !/^[a-z0-9-]+$/i.test(part))) {
    return NextResponse.json({ message: "Invalid WooCommerce API path." }, { status: 400 });
  }

  const upstreamUrl = new URL(`${WORDPRESS_STORE_API}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.set(key, value));
  const headers = new Headers({ Accept: "application/json" });
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  if (hasBody) headers.set("Content-Type", "application/json");

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
    const response = new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
    for (const name of RESPONSE_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) response.headers.set(name, value);
    }
    return response;
  } catch (error) {
    console.error("WooCommerce Store API request failed.", error);
    return NextResponse.json(
      { message: "Could not connect to the Farmeralot store. Please try again shortly." },
      { status: 502 },
    );
  }
}

export const GET = proxyStoreApi;
export const POST = proxyStoreApi;
