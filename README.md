# friendly-octo-disco

Friendly Octo Disco is a simple Bitcoin mining clicker game built as a vanilla JavaScript web app with Vite.

## Features

- Click the mine button to earn Bitcoin
- Watch passive mining add Bitcoin every second
- Buy repeatable upgrades for stronger clicks and faster passive income
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

## Validate

```bash
npm test
npm run build
```
