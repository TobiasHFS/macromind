// Statistical and Optimization Utilities for Portfolio Management

// Helper: Standard Normal variate using Box-Muller transform
function randomNormal(mean = 0, stdev = 1) {
  let u = 1 - Math.random(); // Converting [0,1) to (0,1]
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

// Calculate basic historical stats for an array of monthly prices
export function calculateAssetStats(prices) {
  if (!prices || prices.length < 2) return { return: 0, volatility: 0 };
  
  const monthlyReturns = [];
  for (let i = 1; i < prices.length; i++) {
    monthlyReturns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Annualized Expected Return (Geometric mean approximation or simple arithmetic)
  const meanMonthlyReturn = monthlyReturns.reduce((sum, r) => sum + r, 0) / monthlyReturns.length;
  const annualizedReturn = meanMonthlyReturn * 12;

  // Annualized Volatility
  const variance = monthlyReturns.reduce((sum, r) => sum + Math.pow(r - meanMonthlyReturn, 2), 0) / monthlyReturns.length;
  const annualizedVolatility = Math.sqrt(variance) * Math.sqrt(12);

  return {
    meanMonthlyReturn,
    annualizedReturn,
    annualizedVolatility,
    monthlyReturns
  };
}

// Compute the covariance matrix between multiple assets
export function calculateCovarianceMatrix(assetsMonthlyReturns) {
  const n = assetsMonthlyReturns.length;
  const numPeriods = assetsMonthlyReturns[0].length;
  let matrix = Array(n).fill(0).map(() => Array(n).fill(0));

  const means = assetsMonthlyReturns.map(returns => 
    returns.reduce((sum, r) => sum + r, 0) / numPeriods
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      let cov = 0;
      for (let k = 0; k < numPeriods; k++) {
        cov += (assetsMonthlyReturns[i][k] - means[i]) * (assetsMonthlyReturns[j][k] - means[j]);
      }
      // Annualize the covariance
      matrix[i][j] = (cov / numPeriods) * 12; 
    }
  }
  return matrix;
}

// Calculate Portfolio Return and Volatility given weights
export function calculatePortfolioStats(weights, expectedReturns, covMatrix) {
  let portReturn = 0;
  for (let i = 0; i < weights.length; i++) {
    portReturn += weights[i] * expectedReturns[i];
  }

  let portVariance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      portVariance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  
  return {
    expectedReturn: portReturn,
    volatility: Math.sqrt(portVariance),
    sharpeRatio: portReturn / Math.sqrt(portVariance) // Assuming risk-free rate of 0 for simplicity
  };
}

// Find Optimal Portfolio via Random Search (Monte Carlo Optimization)
export function optimizePortfolio(assets, numSimulations = 5000) {
  const returns = assets.map(a => a.annualizedReturn);
  const covMatrix = calculateCovarianceMatrix(assets.map(a => a.monthlyReturns));
  
  let bestSharpe = -Infinity;
  let optimalWeights = [];
  let optimalStats = {};

  for (let i = 0; i < numSimulations; i++) {
    // Generate random weights that sum to 1
    let weights = assets.map(() => Math.random());
    const sum = weights.reduce((a, b) => a + b, 0);
    weights = weights.map(w => w / sum);

    const stats = calculatePortfolioStats(weights, returns, covMatrix);

    if (stats.sharpeRatio > bestSharpe) {
      bestSharpe = stats.sharpeRatio;
      optimalWeights = weights;
      optimalStats = stats;
    }
  }

  return { optimalWeights, optimalStats };
}

// Run Monte Carlo Future Projection (e.g. 10 years)
export function simulateFuturePaths(initialInvestment, expectedReturn, volatility, years = 10, numPaths = 1000) {
  const months = years * 12;
  const monthlyReturn = expectedReturn / 12;
  const monthlyVol = volatility / Math.sqrt(12);

  const paths = [];
  
  for (let i = 0; i < numPaths; i++) {
    let path = [initialInvestment];
    for (let m = 1; m <= months; m++) {
      // GBM (Geometric Brownian Motion)
      const shock = randomNormal(0, 1);
      const prevValue = path[m - 1];
      const nextValue = prevValue * Math.exp( (monthlyReturn - 0.5 * Math.pow(monthlyVol, 2)) + monthlyVol * shock );
      path.push(nextValue);
    }
    paths.push(path);
  }

  // Calculate percentiles across all paths for each month
  const percentiles = [];
  for (let m = 0; m <= months; m++) {
    const valuesAtMonth = paths.map(p => p[m]).sort((a, b) => a - b);
    percentiles.push({
      month: m,
      year: (m / 12).toFixed(1),
      p5: valuesAtMonth[Math.floor(numPaths * 0.05)],
      p50: valuesAtMonth[Math.floor(numPaths * 0.50)],
      p95: valuesAtMonth[Math.floor(numPaths * 0.95)],
    });
  }

  // Calculate Max Drawdown from the median path (p50)
  let maxDrawdown = 0;
  let peak = percentiles[0].p50;
  for (const p of percentiles) {
    if (p.p50 > peak) peak = p.p50;
    const drawdown = (peak - p.p50) / peak;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }

  return {
    cone: percentiles,
    maxDrawdown: maxDrawdown * 100, // as percentage
    var95: (initialInvestment - percentiles[months].p5) / initialInvestment * 100 // simplistic Value at Risk based on terminal wealth
  };
}
