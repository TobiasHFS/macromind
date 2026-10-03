# MacroMind

A React prototype for a market dashboard and a portfolio simulation lab. It displays index data, a yield curve, financial headlines and simulations using SPY, TLT and GLD.

## Run

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

`npm run build` creates the front-end bundle. `npm run lint` checks the source.

## Current limits

Market requests go through a local Vite proxy to Yahoo Finance. The proxy exists only in the development server; deploying the static bundle alone does not provide it. Headlines use a public RSS conversion service. These external endpoints can fail, rate-limit requests or change their responses.

The portfolio calculations are exploratory. They use historical monthly returns, a zero risk-free rate and random search over portfolio weights. Missing observations are filtered separately by asset, which can misalign return dates. Simulations do not establish future returns or suitable investments. The app still contains prototype interface text and placeholder elements.

## Code

- `src/components/`: dashboard and portfolio interface
- `src/hooks/useMarketData.js`: external data requests
- `src/utils/portfolioMath.js`: calculations and simulations

MIT applies to original code. External data and news remain subject to their providers' terms.
