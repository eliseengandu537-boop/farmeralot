# Farmeralot storefront

A responsive Next.js storefront with smooth desktop scrolling, a cinematic video hero, accessible navigation, and a parts enquiry flow.

## Present to the client

```powershell
npm install
npm run preview
```

Open `http://localhost:3000`. If the development server is already running, use its existing browser tab. The local `.env.local` also selects preview mode.

For a production preview without the development overlay:

```powershell
npm run build:preview
npm run start:preview -- --port 3001
```

Then open `http://localhost:3001`.

The presentation has 56 saved, real catalogue products and 49 local images recovered from successful public catalogue responses in this project's cache. It does not need the live store for product data or images. Some categories have no saved products and some products have no cached image; these show an enquiry option or image fallback. This snapshot is not the complete live inventory.

Suggested walkthrough:

1. Home: hero video, text reveals, smooth scrolling and stacked service sections.
2. Shop: search `ALT7927`, browse Bearings, or page through the full saved catalogue.
3. Open a product, add it to the quote basket, and change its quantity.
4. Continue to the enquiry form and fill in your contact details.
5. Prepare the email to `eliseenweb@gmail.com`. Review it, then open your email app or copy the enquiry text.

Preparing an email does **not** send it. The visitor must send it from their email app. No customer contact details are stored by this form. Only basket product IDs and quantities are saved in this browser.

The preview banner stays visible. The saved products have no checkout prices, so the UI uses “Price on request.” Preview mode cannot create orders, charge payments, or access account history. The proxy also rejects direct order requests. Account and policy pages link to the official live site for the current information.

## Live store connection

The live WooCommerce Store API currently returns an Imunify360 HTTP 403 access denial to this storefront's server. Live checkout is not restored by preview mode. The store administrator or hosting provider needs to permit the storefront server through the existing firewall before live integration can be verified.

After that is resolved, set these values in `.env.local`, then rebuild and restart using `npm run build` and `npm start`:

```dotenv
NEXT_PUBLIC_STORE_URL=https://farmeralot.co.za
NEXT_PUBLIC_STOREFRONT_MODE=live
```

The `preview`, `build:preview`, and `start:preview` commands deliberately force preview mode. Use the ordinary commands for a live build. Public environment variables are fixed at build time, so changing modes requires rebuilding production assets.

Live catalogue requests have timeouts and recoverable error screens. Basket and checkout requests pass through `/api/wc/*`; the browser keeps WooCommerce's cart token and nonce. PayFast appears only when the live store reports a compatible payment method. Account login and order history stay on the existing store. Verify the live catalogue, basket and payment configuration before accepting customer orders.

## AI assistant deferred

The AI assistant is hidden in presentation mode and whenever no server-side `OPENAI_API_KEY` exists. The floating quote button opens the working enquiry page. AI and automatic email delivery have been left for later as requested.

Existing assistant/email API routes remain in the project, but are not part of the presentation flow. Automatic delivery would require Resend settings (`RESEND_API_KEY`, a verified `RESEND_FROM_EMAIL`, and `SALES_EMAIL_TO`). Do not put private keys in `NEXT_PUBLIC_` variables. Before making those endpoints public, replace their development-only in-process rate limits with persistent limits.

## Assets and motion

The hero video is `public/farmeralot-background.mp4`; its static poster is `public/farm-poster.jpg`. Replace both when changing the clip. Local catalogue images live in `public/catalogue/` and the public snapshot in `src/data/`. Keep these files with the project so a clean build works.

The first service card uses the supplied harvesting clip, `public/service-parts.mp4`, and its extracted poster, `public/service-parts-poster.webp`. The portrait video keeps its full frame with a soft poster backdrop. It loads when visible, pauses when covered by another sticky card or off screen, and respects reduced motion unless the visitor explicitly presses play.

Cards 2 and 3 use `public/service-tractor.webp` and `public/service-farm-truck.webp`. These illustrative vehicle photos were generated with the built-in image generation tool; their prompts are recorded in `design/service-image-prompts.json`. They are not photographs of a Farmeralot fleet. The realistic category PNG illustrations live in `public/category-images/`, with prompts in `design/category-image-prompts.json`.

`scripts/prepare-preview.mjs` is a one-time recovery utility for successful public catalogue/image cache entries. It does not fetch the blocked site or export cart tokens or customer data. Do not rerun it without a populated cache; the bundled snapshot is ready to use.

Lenis smooths desktop wheel input. Touch and reduced-motion visitors keep native scrolling. Text remains readable without JavaScript; the hero video pauses when hidden, off screen, or reduced motion is enabled, and has a visible pause control.

## Verification

```powershell
npm run lint
npx tsc --noEmit
npm run build:preview
npm run test:e2e
```

Browser tests expect preview mode on port 3000, reuse the running server or start one, and use installed Microsoft Edge on Windows. On other platforms install Chromium with `npx playwright install chromium`. They cover routes, catalogue search, pagination, basket persistence, the email preparation flow, mobile layouts, motion preferences, and rendering without JavaScript. Request-helper tests cover 403, invalid responses, and connection failures without contacting the live store. Tests do not send emails or place orders.
