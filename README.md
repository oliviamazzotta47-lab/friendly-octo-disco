# friendly-octo-disco

Friendly Octo Disco is a simple Bitcoin mining clicker game built as a vanilla JavaScript web app with Vite, plus a demo Stripe checkout backend for Unity-style store purchases.

## Features

- Click the mine button to earn Bitcoin
- Watch passive mining add Bitcoin every second
- Buy repeatable upgrades for stronger clicks and faster passive income
- Start Stripe Checkout sessions for Unity-style store purchases
- Handle Stripe webhook fulfillment with in-memory order tracking
- Track wallet balance, total mined, click power, and passive rate

## Tech stack

- Vite
- Vanilla JavaScript modules
- CSS
- Node's built-in test runner

## Project structure

- `/index.html` - app entry page
- `/src/main.js` - bootstraps the app
- `/src/ui/` - screen rendering
- `/src/game/` - game state, timing, and purchase logic
- `/src/models/` - upgrade definitions
- `/server/` - Stripe checkout session and webhook endpoints
- `/examples/unity/` - Unity C# example for opening Stripe checkout
- `/src/assets/` - static visual assets
- `/tests/` - core game logic tests

## Run locally

```bash
npm install
npm run dev
npm run server
```

## Stripe store configuration

Copy `/home/runner/work/friendly-octo-disco/friendly-octo-disco/.env.example` to `.env` and replace each placeholder with your real Stripe values:

- `VITE_STRIPE_API_BASE_URL` - frontend origin for checkout session requests
- `VITE_STRIPE_DASHBOARD_URL` - optional dashboard deep link for managing products
- `STRIPE_SECRET_KEY` - Stripe secret API key used by the backend
- `STRIPE_WEBHOOK_SECRET` - signing secret from `stripe listen` or your webhook endpoint
- `STRIPE_PRICE_ID_STARTER_PACK`
- `STRIPE_PRICE_ID_PRO_PACK`
- `STRIPE_PRICE_ID_ULTIMATE_PACK`
- `STRIPE_APP_BASE_URL` - browser URL that Stripe redirects back to after checkout
- `STRIPE_ALLOWED_ORIGIN` - origin allowed to call the backend in local development

The frontend now POSTs to `/api/checkout-sessions`, receives a Stripe Checkout URL, and redirects the browser there. The backend tracks orders in memory and updates status when Stripe sends `checkout.session.completed` or `checkout.session.expired`.

## Backend endpoints

- `POST /api/checkout-sessions` - creates a Stripe Checkout session for a Unity-style product
- `POST /api/stripe/webhook` - verifies the Stripe signature and applies fulfillment state
- `GET /api/orders/:orderId` - reads the current in-memory order status
- `GET /api/health` - confirms whether Stripe credentials are configured

## Unity integration example

See `/home/runner/work/friendly-octo-disco/friendly-octo-disco/examples/unity/StripeCheckoutLauncher.cs` for a minimal Unity client that:

1. sends `playerId` and `productId` to the backend
2. receives `checkoutUrl`
3. opens Stripe Checkout with `Application.OpenURL`

## Architecture

1. Unity or the web UI calls the backend with `playerId` and `productId`
2. the backend creates a Stripe Checkout session with `orderId` metadata
3. Stripe redirects the player back to the app after checkout
4. Stripe sends a signed webhook to `/api/stripe/webhook`
5. the backend fulfills the order once and exposes status by `orderId`

This demo keeps orders in memory for simplicity. Use a database in production so webhook retries and restarts do not lose fulfillment history. For iOS and Android digital goods, use the platform in-app purchase systems instead of Stripe.

## Validate

```bash
npm test
npm run build
```
