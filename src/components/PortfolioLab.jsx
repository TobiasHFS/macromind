import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { optimizePortfolio, simulateFuturePaths } from '../utils/portfolioMath';
import './PortfolioLab.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Year: {payload[0].payload.year}</p>
        <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>95th Pctl: ${Math.round(payload[0].value).toLocaleString()}</p>
        <p style={{ margin: 0, color: '#f59e0b', fontWeight: 'bold' }}>Median: ${Math.round(payload[1].value).toLocaleString()}</p>
        <p style={{ margin: 0, color: '#ef4444', fontWeight: 'bold' }}>5th Pctl: ${Math.round(payload[2].value).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const PortfolioLab = ({ historicalAssets }) => {
  
  // Perform Optimization and Simulation only once when historicalAssets change
  const { optimization, simulation } = useMemo(() => {
    if (!historicalAssets) return { optimization: null, simulation: null };

    // Optimize
    const { optimalWeights, optimalStats } = optimizePortfolio(historicalAssets, 5000);
    
    // Simulate (Initial investment $100,000 over 20 years)
    const sim = simulateFuturePaths(100000, optimalStats.expectedReturn, optimalStats.volatility, 20, 1000);

    return { 
      optimization: { weights: optimalWeights, stats: optimalStats }, 
      simulation: sim 
    };
  }, [historicalAssets]);


  if (!historicalAssets || !optimization) {
    return (
      <div className="portfolio-lab-loading">
        <div className="loading-spinner"></div>
        <p>Crunching 10 years of historical data and running Monte Carlo simulations...</p>
      </div>
    );
  }

  const { weights, stats } = optimization;

  return (
    <div className="portfolio-lab">
      <div className="page-header">
        <h2>Portfolio Lab</h2>
        <div className="badge">Exploratory simulation</div>
      </div>
      
      <p className="lab-description text-secondary">
        Compare sample allocations across stocks (SPY), long-term bonds (TLT) and gold (GLD), using historical monthly returns. The tool samples portfolio weights and simulates possible paths over 20 years. These estimates depend on simplified assumptions and are not investment forecasts.
      </p>

      <div className="lab-grid">
        {/* Left Column: Optimal Weights & Stats */}
        <div className="lab-col-left">
          <div className="widget glass-panel">
            <h3 className="widget-title">Selected sample allocation</h3>
            <div className="weights-list">
              {historicalAssets.map((asset, index) => (
                <div className="weight-item" key={asset.symbol}>
                  <span className="asset-symbol">{asset.symbol}</span>
                  <div className="weight-bar-container">
                    <div className="weight-bar" style={{ width: `${weights[index] * 100}%` }}></div>
                  </div>
                  <span className="weight-pct">{(weights[index] * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="widget glass-panel">
            <h3 className="widget-title">Security & Risk Metrics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Expected Annual Return</div>
                <div className="stat-value text-accent-gradient">{(stats.expectedReturn * 100).toFixed(2)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Annualized Volatility</div>
                <div className="stat-value">{(stats.volatility * 100).toFixed(2)}%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Sharpe Ratio</div>
                <div className="stat-value">{stats.sharpeRatio.toFixed(2)}</div>
              </div>
              <div className="stat-card alert-card">
                <div className="stat-label">Max Drawdown (Stress Test)</div>
                <div className="stat-value negative">-{simulation.maxDrawdown.toFixed(2)}%</div>
                <p className="stat-sub">Worst drop in median 20y path</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monte Carlo Cone */}
        <div className="lab-col-right">
          <div className="widget glass-panel cone-widget">
            <div className="widget-header">
              <h3 className="widget-title">20-Year Monte Carlo Projection</h3>
              <span className="badge">1,000 Paths</span>
            </div>
            <p className="text-secondary" style={{marginBottom: '1rem', fontSize: '0.875rem'}}>
              Projecting a $100,000 initial investment based on optimal portfolio volatility.
            </p>
            <div className="cone-chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulation.cone} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-secondary)" tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="var(--text-secondary)" 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="p95" stackId="1" stroke="none" fill="rgba(16, 185, 129, 0.2)" />
                  <Area type="monotone" dataKey="p50" stackId="2" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="p5" stackId="3" stroke="#ef4444" fill="rgba(239, 68, 68, 0.1)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="cone-legend">
              <span className="legend-item"><span className="dot" style={{background: '#10b981'}}></span> Top 5%</span>
              <span className="legend-item"><span className="dot" style={{background: '#f59e0b'}}></span> Median Outcome</span>
              <span className="legend-item"><span className="dot" style={{background: '#ef4444'}}></span> Bottom 5% (Stress)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioLab;
