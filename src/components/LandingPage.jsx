import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="landing-page">
      <nav className="navbar container">
        <div className="logo">
          <span className="text-accent-gradient">Macro</span>Mind
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <button className="btn-primary" onClick={onNavigate}>Open dashboard</button>
        </div>
      </nav>

      <main>
        <section className="hero container">
          <div className="hero-content">
            <div className="badge">Market dashboard prototype</div>
            <h1 className="hero-title">
              Explore markets and <br />
              <span className="text-accent-gradient">portfolio scenarios.</span>
            </h1>
            <p className="hero-subtitle">
              Follow market indicators, compare Treasury yields and try a simple portfolio simulation.
            </p>
            <div className="hero-cta">
              <button className="btn-primary btn-large" onClick={onNavigate}>Open dashboard</button>
            </div>
          </div>
          
          <div className="hero-visual animate-float">
            <div className="glass-panel mock-dashboard">
              <div className="mock-header">
                <div className="mock-dots">
                  <span></span><span></span><span></span>
                </div>
                <div className="mock-title">Illustrative dashboard preview</div>
              </div>
              <div className="mock-body">
                <div className="mock-chart">
                  <div className="bar b1"></div>
                  <div className="bar b2"></div>
                  <div className="bar b3"></div>
                  <div className="bar b4"></div>
                  <div className="bar b5"></div>
                  <div className="bar b6"></div>
                  <div className="bar b7"></div>
                </div>
                <div className="mock-stats">
                  <div className="stat">
                    <span className="label">10Y Yield</span>
                    <span className="value text-accent-gradient">4.23%</span>
                  </div>
                  <div className="stat">
                    <span className="label">Inflation (CPI)</span>
                    <span className="value">3.10%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="pricing container">
          <h2>What you can explore</h2>
          <div className="pricing-cards">
            <div className="pricing-card glass-panel">
              <h3>Market overview</h3>
              <ul>
                <li>S&amp;P 500 and VIX indicators</li>
                <li>US Treasury yield curve</li>
                <li>Financial headlines</li>
              </ul>
              <button className="btn-secondary" onClick={onNavigate}>View market data</button>
            </div>
            
            <div className="pricing-card glass-panel featured">
              <h3>Portfolio lab</h3>
              <ul>
                <li>SPY, TLT and GLD allocation scenarios</li>
                <li>Historical return and volatility estimates</li>
                <li>Simulated investment paths</li>
              </ul>
              <button className="btn-primary" onClick={onNavigate}>Open portfolio lab</button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="footer container">
        <p>MacroMind is an experimental project. Estimates and simulations are illustrative.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
