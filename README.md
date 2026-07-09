# friendly-octo-disco

Friendly Octo Disco is a simple Bitcoin mining clicker game built as a vanilla JavaScript web app with Vite.

## Features

- Click the mine button to earn Bitcoin
- Watch passive mining add Bitcoin every second
- Buy repeatable upgrades for stronger clicks and faster passive income
- Show Unity product IDs alongside Stripe checkout links for store purchases
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
- `/src/assets/` - static visual assets
- `/tests/` - core game logic tests

## Run locally

```bash
npm install
npm run dev
```

## Stripe store configuration

Copy `/home/runner/work/friendly-octo-disco/friendly-octo-disco/.env.example` to `.env` and replace each value with your real Stripe URLs:

- `VITE_STRIPE_DASHBOARD_URL` - optional dashboard deep link for managing products
- `VITE_STRIPE_PAYMENT_LINK_STARTER_PACK`
- `VITE_STRIPE_PAYMENT_LINK_PRO_PACK`
- `VITE_STRIPE_PAYMENT_LINK_ULTIMATE_PACK`

Each payment link is rendered as a “Buy with Stripe” button in the app. Missing or invalid URLs leave the button disabled.

## Validate

```bash
npm test
npm run build
```
