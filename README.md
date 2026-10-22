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

## Assistant and lead presentation

The floating **What product are you looking for?** button opens the Farmeralot assistant on every page. The round **WhatsApp icon** opens WhatsApp to **+27 83 630 3818** with a draft product enquiry. Labelled **Get in chat with us** links are also available in the footer and on the enquiry page, where product names and SKUs are included when supplied. The visitor reviews and sends the message in WhatsApp.

`ASSISTANT_MODE=demo` is the default, independently of the store's catalogue mode. The presentation is clearly labelled: replies follow a guided sequence, do not call live AI, and never send emails or save leads. No API key is required for this demo.

Presentation walkthrough:

1. Click **What product are you looking for?**, then describe the part or farm supply needed.
2. Enter a town/suburb and province, name, optional company/farm, email and phone number. Use sample details.
3. Review and edit the populated form, then click **Preview lead email**.
4. Show the customer, company, location, contact details, enquiry, summary and routing information in the resulting email preview. It is addressed to `eliseenweb@gmail.com` by default.
5. Download the labelled HTML sample to show the client, or copy the lead summary. No message is sent by either action. **Start another enquiry** clears the chat and entered details; reloading also clears them. Closing/reopening the assistant retains the current draft in memory.

The demo is enforced on the server even if API credentials are present. The live assistant endpoint rejects requests in demo mode, and the lead endpoint returns `status: "preview", sent: false`. The standalone enquiry page still supports the separate manual email-app flow described above.

Live AI/email remains deferred for the presentation. Later activation requires `ASSISTANT_MODE=live`, a server-side `OPENAI_API_KEY`, `RESEND_API_KEY`, verified `RESEND_FROM_EMAIL`, and `SALES_EMAIL_TO`. Rebuild and restart after changing modes. Never put private keys in `NEXT_PUBLIC_` variables. Before a public live launch, configure persistent abuse limits and verify the model, catalogue, sender and email delivery with the owner. Existing live AI integration cannot be verified without credentials. The email endpoint checks provider acknowledgement before reporting submission and reuses an idempotency key when retrying an unchanged lead. See [Resend send-email](https://resend.com/docs/api-reference/emails/send-email) and [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Optional sales territory routing

Regional routing is **disabled** until the client confirms the representatives and their territories. All locations, including Pretoria and Cape Town, currently route to the admin inbox. No representative names or email addresses have been invented.

After confirmation, configure server-only `SALES_REP_ROUTES_JSON` with records shaped like `{"name":"Confirmed rep name","email":"rep@example.com","areas":["Pretoria","Tshwane"]}` and set `SALES_ROUTING_ENABLED=true`. Replace the example address with a confirmed one. Each representative can have multiple city/suburb aliases. Matching ignores case and punctuation, and requires complete area names; it does not geocode addresses or guess nearby territories. Unknown, overlapping or ambiguous locations go to the admin for review. Invalid territory configuration also falls back to admin. Routing recipients come exclusively from server configuration, never from the visitor or the AI. Keep routing disabled while presenting the admin-only flow.

## Assets and motion

The hero video is `public/farmeralot-background.mp4`; its static poster is `public/farm-poster.jpg`. Replace both when changing the clip. Local catalogue images live in `public/catalogue/` and the public snapshot in `src/data/`. Keep these files with the project so a clean build works.

The first service card uses the supplied harvesting clip, `public/service-parts.mp4`, and its extracted poster, `public/service-parts-poster.webp`. The portrait video keeps its full frame with a soft poster backdrop. It plays and loops automatically with no visible playback button, pauses when covered by another sticky card or off screen, and automatically resumes when visible again. Reduced-motion visitors see a still frame.

Card 2 uses `public/service-tractor.webp`, an illustrative tractor photo generated with the built-in image generation tool; its prompt is recorded in `design/service-image-prompts.json`. Card 3 (“Your farm. Within reach.”) uses `public/service-delivery-truck.webp`, the supplied orange Farmeralot truck artwork recovered from the company's profile PDF and compressed to WebP. The complete truck and branding remain visible on desktop and mobile. The realistic category PNG illustrations live in `public/category-images/`, with prompts in `design/category-image-prompts.json`.

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
