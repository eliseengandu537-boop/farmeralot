import { STORE_URL } from "@/lib/store-config";

export class StoreRequestError extends Error {
  constructor(public readonly code: "blocked" | "unavailable" | "invalid_response", public readonly status = 503) {
    super("The store connection is temporarily unavailable. Please try again or request a quote.");
    this.name = "StoreRequestError";
  }
}

export async function requestStore(path: string, options: RequestInit & { next?: { revalidate: number } } = {}) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  let response: Response;
  try {
    response = await fetch(`${STORE_URL}/wp-json/${path}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new StoreRequestError("unavailable");
  }
  if (response.status === 403) throw new StoreRequestError("blocked", 403);
  if (!response.headers.get("content-type")?.includes("application/json")) {
    throw new StoreRequestError("invalid_response");
  }
  return response;
}

export async function readStoreJson<T>(response: Response): Promise<T> {
  try { return await response.json() as T; }
  catch { throw new StoreRequestError("invalid_response"); }
}

export async function loadCatalogue<T>(load: () => Promise<T>): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try { return { data: await load(), error: null }; }
  catch (error) {
    if (!(error instanceof StoreRequestError)) throw error;
    return { data: null, error: error.message };
  }
}
