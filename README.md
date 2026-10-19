# Farmeralot storefront

A responsive Next.js storefront backed by the public Farmeralot WooCommerce Store API. Product listings, category pages, cart state, and order checkout use the existing WordPress store.

The homepage hero video is served from `public/farmeralot-background.mp4`. Replace that file to update the background clip.

## Run locally

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Set `NEXT_PUBLIC_STORE_URL` in `.env.local` to the WordPress store URL when using a different backend. Product images are loaded from that host.

## Commerce setup

- The product catalogue is read from WooCommerce Store API.
- Basket operations and checkout are proxied server-side to the WooCommerce Store API; the browser stores the returned cart token and nonce.
- Enable and configure the PayFast gateway in the existing WooCommerce admin. The checkout shows PayFast only when WooCommerce reports a PayFast payment method and returns its hosted payment URL.
- Quote requests continue to the existing Farmeralot quote form at `/request-quote/`.
- Account login and order history remain on the existing WooCommerce account page.

The WordPress store must allow the Store API cart and checkout endpoints. If a security plugin or proxy blocks those endpoints, allow `/wp-json/wc/store/v1/cart*` and `/wp-json/wc/store/v1/checkout`.

## Verification

```powershell
npm run lint
npx tsc --noEmit
npm run build
```
# farmeralot
