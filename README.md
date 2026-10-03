# MacroMind

A React market dashboard with index prices, Treasury yields, financial headlines and portfolio simulations for SPY, TLT and GLD.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Use `npm run build` to build the app and `npm run lint` to check the source.

Market data comes from Yahoo Finance through the Vite development proxy. A static deployment needs its own proxy. Headlines use an RSS conversion service.

The portfolio lab uses monthly historical returns, a zero risk-free rate and random sampling of portfolio weights. Missing prices are filtered separately by asset, so return dates can become misaligned. Treat the simulations as an experiment.

Data requests are in `src/hooks/useMarketData.js`; calculations are in `src/utils/portfolioMath.js`.

[MIT license](LICENSE).
