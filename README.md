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

The floating “Get your quote” assistant can search the live WooCommerce catalogue and help customers describe farm products they want delivered. It avoids claiming that a part fits a machine or inventing availability, prices, or delivery dates; customers should confirm fitment with the parts team.

1. Create an API key in your OpenAI account at <https://platform.openai.com/api-keys>.
2. Add it to the root `.env.local` file as `OPENAI_API_KEY=...` (never put it in a `NEXT_PUBLIC_` variable or send it in chat).
3. Restart the Next.js development server.

The key stays in the server-side `/api/assistant` route. Without it, AI replies are unavailable. OpenAI usage is billed to the account that owns the key.

Quote-request emails are sent through Resend. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (a sender address on a domain verified in Resend), and `SALES_EMAIL_TO` (one or more comma-separated sales inboxes) in `.env.local`. Without these values, quote requests are not submitted and the form displays a setup message. Customer details and the conversation are sent to the configured sales inboxes and are not stored by this app.
Both API routes have small in-process request limits for development. Before public deployment, add persistent rate limits at the hosting/edge layer.

## Commerce setup

- The product catalogue is read from WooCommerce Store API.
- Basket operations and checkout are proxied server-side to the WooCommerce Store API; the browser stores the returned cart token and nonce.
- Enable and configure the PayFast gateway in the existing WooCommerce admin. The checkout shows PayFast only when WooCommerce reports a PayFast payment method and returns its hosted payment URL.
- The AI quote form emails the configured sales team; the separate `/request-quote` page still links to the existing Farmeralot quote form.
- Account login and order history remain on the existing WooCommerce account page.

The WordPress store must allow the Store API cart and checkout endpoints. If a security plugin or proxy blocks those endpoints, allow `/wp-json/wc/store/v1/cart*` and `/wp-json/wc/store/v1/checkout`.

## Verification

```powershell
npm run lint
npx tsc --noEmit
npm run build
```
# farmeralot
