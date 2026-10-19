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

## AI parts assistant

The floating parts assistant searches the live WooCommerce catalogue and asks OpenAI to explain possible matches. It avoids claiming that a part fits a machine or inventing prices/stock; customers should confirm fitment with the parts team.

1. Create an API key in your OpenAI account at <https://platform.openai.com/api-keys>.
2. Add it to the root `.env.local` file as `OPENAI_API_KEY=...` (never put it in a `NEXT_PUBLIC_` variable or send it in chat).
3. Restart the Next.js development server.

The key stays in the server-side `/api/assistant` route. Without the key the assistant displays a setup message and does not call OpenAI. OpenAI usage is billed to the account that owns the key.
The route applies a small in-process request limit for development. Before public deployment, add a persistent rate limit at the hosting/edge layer to protect your API budget across multiple server instances.

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
