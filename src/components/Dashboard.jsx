import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMarketData } from '../hooks/useMarketData';
import PortfolioLab from './PortfolioLab';
import './Dashboard.css';

// Custom tooltip for Recharts to match our dark theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel" style={{ padding: '0.5rem 1rem', border: '1px solid var(--accent-primary)' }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Term: {label}</p>
        <p style={{ margin: 0, color: '#fff', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
          Yield: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  
  // Bring in our REAL live data
  const { sp500, vix, yieldCurve, currentNews, newsUrl, historicalAssets } = useMarketData();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo"><span className="text-accent-gradient">Macro</span>Mind</div>
        </div>
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="icon">📊</span> Overview
          </button>
          <button 
            className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <span className="icon">🔬</span> Portfolio Lab
          </button>
          <button 
            className={`nav-item ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            <span className="icon">📰</span> Breaking News
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="btn-secondary w-full" onClick={onNavigate}>← Exit to Home</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="topbar">
          <div className="search-bar glass-panel">
            <span className="icon">🔍</span>
            <input type="text" placeholder="Search symbols, indicators (e.g., US10Y, CPI)..." />
          </div>
          <div className="user-profile">
            <div className="avatar">PRO</div>
          </div>
        </header>

        <div className="content-area">
          {activeTab === 'portfolio' ? (
            <PortfolioLab historicalAssets={historicalAssets} />
          ) : (
            <>
              <div className="page-header">
                <h2>Market Overview</h2>
                <div className="timestamp text-secondary">Live Update: {time}</div>
              </div>

          <div className="widgets-grid">
            {/* Widget 1 - Live Yield Curve */}
            <div className="widget glass-panel" style={{ gridColumn: 'span 1' }}>
              <h3 className="widget-title">Live US Treasury Yield Curve</h3>
              <div className="yield-curve-chart" style={{ height: '250px', width: '100%' }}>
                {yieldCurve.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yieldCurve} margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="term" 
                        stroke="var(--text-secondary)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis 
                        domain={['auto', 'auto']} 
                        stroke="var(--text-secondary)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="yield" 
                        stroke="var(--accent-primary)" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#fff', strokeWidth: 0 }} 
                        activeDot={{ r: 6, fill: 'var(--accent-primary)', stroke: '#fff', strokeWidth: 2 }}
                        isAnimationActive={true}
                        animationDuration={500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                    Fetching Real Data from Yahoo Finance...
                  </div>
                )}
              </div>
            </div>

            {/* Widget 2 - Real News Insight */}
            <div className="widget glass-panel ai-insight-widget">
              <div className="widget-header">
                <h3 className="widget-title">CNBC Breaking News</h3>
                <span className="live-badge pulse">LIVE</span>
              </div>
              <div className="ai-content">
                <a href={newsUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <p key={currentNews} className="typing-effect" style={{ animation: 'fadeIn 0.5s ease-in', cursor: 'pointer' }}>
                    "{currentNews}"
                  </p>
                </a>
              </div>
            </div>

            {/* Micro Widgets - Live Tickers */}
            <div className="micro-widgets">
              <div className="stat-card glass-panel">
                <div className="stat-label">S&P 500</div>
                {sp500.loading ? (
                  <div className="stat-value text-secondary" style={{ fontSize: '1.2rem' }}>Loading...</div>
                ) : (
                  <>
                    <div className={`stat-value ${sp500.isPositive ? 'text-accent-gradient' : ''}`} style={!sp500.isPositive ? { color: '#ef4444' } : {}}>
                      {sp500.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`stat-change ${sp500.isPositive ? 'positive' : 'negative'}`}>
                      {sp500.isPositive ? '+' : ''}{sp500.change}%
                    </div>
                  </>
                )}
              </div>
              
              <div className="stat-card glass-panel">
                <div className="stat-label">US Inflation (CPI YoY)</div>
                <div className="stat-value">3.10%</div>
                <div className="stat-change text-secondary">Updates Monthly</div>
              </div>

              <div className="stat-card glass-panel">
                <div className="stat-label">VIX (Volatility)</div>
                {vix.loading ? (
                  <div className="stat-value text-secondary" style={{ fontSize: '1.2rem' }}>Loading...</div>
                ) : (
                  <>
                    <div className="stat-value">
                      {vix.value.toFixed(2)}
                    </div>
                    <div className={`stat-change ${vix.isPositive ? 'positive' : 'negative'}`}>
                      {vix.isPositive ? '+' : ''}{vix.change}%
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </main>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
