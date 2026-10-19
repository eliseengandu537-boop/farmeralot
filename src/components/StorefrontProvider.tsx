"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IS_PREVIEW } from "@/lib/store-config";
import { isCartData, type CartData } from "@/lib/cart";

type StorefrontContextValue = {
  cart: CartData | null;
  cartError: string;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (key: string, quantity: number) => Promise<void>;
  removeCartItem: (key: string) => Promise<void>;
  submitCheckout: (
    billingAddress: Record<string, string>,
    paymentMethod: string,
  ) => Promise<unknown>;
  clearCartError: () => void;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);
const TOKEN_KEY = "farmeralot-cart-token";
const NONCE_KEY = "farmeralot-cart-nonce";

export function StorefrontProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cart, setCart] = useState<CartData | null>(null);
  const [cartError, setCartError] = useState("");
  const [cartLoading, setCartLoading] = useState(true);

  const request = useCallback(
    async (path: string, body?: Record<string, unknown>) => {
      if (IS_PREVIEW) return (await import("@/lib/preview-cart")).previewCartRequest(path, body);
      const headers = new Headers({ Accept: "application/json" });
      if (body) headers.set("Content-Type", "application/json");
      let token: string | null = null;
      let nonce: string | null = null;
      try { token = window.localStorage.getItem(TOKEN_KEY); nonce = window.localStorage.getItem(NONCE_KEY); }
      catch { throw new Error("Allow browser storage for this site to use the basket."); }
      if (token) headers.set("Cart-Token", token);
      if (nonce) headers.set("Nonce", nonce);

      const response = await fetch(`/api/wc/${path}`, {
        method: body ? "POST" : "GET",
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(16_000),
      });

      const nextToken = response.headers.get("Cart-Token");
      const nextNonce = response.headers.get("Nonce");
      if (nextToken) window.localStorage.setItem(TOKEN_KEY, nextToken);
      if (nextNonce) window.localStorage.setItem(NONCE_KEY, nextNonce);

      let result: unknown;
      try { result = await response.json(); }
      catch { throw new Error("The store sent an unreadable response. Please refresh your basket."); }
      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "message" in result &&
          typeof result.message === "string"
            ? result.message
            : "Your cart could not be updated. Please try again.";
        throw new Error(message);
      }
      if (path.startsWith("cart") && !isCartData(result)) throw new Error("We couldn’t confirm your basket. Please try again.");
      return result;
    },
    [],
  );

  const refreshCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const result = await request("cart");
      setCart(result as CartData);
      setCartError("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load your cart.";
      setCartError(message);
    } finally {
      setCartLoading(false);
    }
  }, [request]);

  useEffect(() => {
    let current = true;

    request("cart")
      .then((result) => {
        if (current) {
          setCart(result as CartData);
          setCartError("");
        }
      })
      .catch((error: unknown) => {
        if (current) {
          setCartError(
            error instanceof Error ? error.message : "Could not load your cart.",
          );
        }
      }).finally(() => { if (current) setCartLoading(false); });

    return () => {
      current = false;
    };
  }, [request]);

  const mutateCart = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      try {
        const result = await request(path, body);
        setCart(result as CartData);
        setCartError("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not update your cart.";
        setCartError(message);
        throw error;
      }
    },
    [request],
  );

  const value = useMemo<StorefrontContextValue>(
    () => ({
      cart,
      cartError,
      cartLoading,
      refreshCart,
      addToCart: (productId, quantity = 1) =>
        mutateCart("cart/add-item", { id: productId, quantity }),
      updateCartItem: (key, quantity) =>
        mutateCart("cart/update-item", { key, quantity }),
      removeCartItem: (key) => mutateCart("cart/remove-item", { key }),
      submitCheckout: (billingAddress, paymentMethod) =>
        request("checkout", {
          billing_address: billingAddress,
          shipping_address: billingAddress,
          payment_method: paymentMethod,
        }),
      clearCartError: () => setCartError(""),
    }),
    [cart, cartError, cartLoading, mutateCart, refreshCart, request],
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error("useStorefront must be used inside StorefrontProvider.");
  }
  return context;
}
