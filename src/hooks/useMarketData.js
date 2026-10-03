import { useState, useEffect } from 'react';
import { calculateAssetStats } from '../utils/portfolioMath';

const TICKERS = {
  sp500: '^GSPC',
  vix: '^VIX',
  yield1M: '^IRX',
  yield5Y: '^FVX',
  yield10Y: '^TNX',
  yield30Y: '^TYX'
};

const PORTFOLIO_ASSETS = ['SPY', 'TLT', 'GLD'];

const NEWS_RSS_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10000664')}`;

export function useMarketData() {
  const [sp500, setSp500] = useState({ value: 0, change: 0, isPositive: true, loading: true });
  const [vix, setVix] = useState({ value: 0, change: 0, isPositive: true, loading: true });
  const [yieldCurve, setYieldCurve] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [newsIndex, setNewsIndex] = useState(0);
  
  // New state for portfolio assets
  const [historicalAssets, setHistoricalAssets] = useState(null);

  const fetchTickerData = async (symbol) => {
    try {
      const res = await fetch(`/api/finance/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`);
      const data = await res.json();
      const meta = data.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      const prevClose = meta.chartPreviousClose;
      const change = ((price - prevClose) / prevClose) * 100;
      
      return {
        value: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        isPositive: change >= 0,
        loading: false
      };
    } catch (e) {
      console.error(`Error fetching ${symbol}:`, e);
      return null;
    }
  };

  const fetchHistoricalData = async (symbol) => {
    try {
      // Fetch 10 years of monthly data
      const res = await fetch(`/api/finance/v8/finance/chart/${symbol}?interval=1mo&range=10y`);
      const data = await res.json();
      const result = data.chart.result[0];
      const closePrices = result.indicators.adjclose[0].adjclose || result.indicators.quote[0].close;
      
      // Filter out nulls
      const cleanPrices = closePrices.filter(p => p !== null);
      
      const stats = calculateAssetStats(cleanPrices);
      return {
        symbol,
        ...stats
      };
    } catch (e) {
      console.error(`Error fetching historical for ${symbol}:`, e);
      return null;
    }
  };

  const fetchAllMarketData = async () => {
    const [gspc, vixData, irx, fvx, tnx, tyx] = await Promise.all([
      fetchTickerData(TICKERS.sp500),
      fetchTickerData(TICKERS.vix),
      fetchTickerData(TICKERS.yield1M),
      fetchTickerData(TICKERS.yield5Y),
      fetchTickerData(TICKERS.yield10Y),
      fetchTickerData(TICKERS.yield30Y)
    ]);

    if (gspc) setSp500(gspc);
    if (vixData) setVix(vixData);

    if (irx && fvx && tnx && tyx) {
      setYieldCurve([
        { term: '13W', yield: parseFloat((irx.value / 10).toFixed(2)) },
        { term: '5Y', yield: parseFloat((fvx.value / 10).toFixed(2)) },
        { term: '10Y', yield: parseFloat((tnx.value / 10).toFixed(2)) },
        { term: '30Y', yield: parseFloat((tyx.value / 10).toFixed(2)) }
      ]);
    }
  };

  const loadPortfolioData = async () => {
    const assets = await Promise.all(PORTFOLIO_ASSETS.map(fetchHistoricalData));
    if (assets.every(a => a !== null)) {
      setHistoricalAssets(assets);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(NEWS_RSS_URL);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setNewsFeed(data.items);
      }
    } catch (e) {
      console.error('Error fetching news:', e);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAllMarketData();
    fetchNews();
    loadPortfolioData();

    // Poll every 30 seconds for live market data
    const marketInterval = setInterval(fetchAllMarketData, 30000);
    
    // Poll every 5 minutes for news
    const newsInterval = setInterval(fetchNews, 300000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(newsInterval);
    };
  }, []);

  useEffect(() => {
    if (newsFeed.length === 0) return;
    
    // Rotate news headline every 15 seconds
    const rotateInterval = setInterval(() => {
      setNewsIndex(prev => (prev + 1) % newsFeed.length);
    }, 15000);

    return () => clearInterval(rotateInterval);
  }, [newsFeed]);

  const currentNews = newsFeed.length > 0 ? newsFeed[newsIndex].title : "Loading real-time financial news...";

  return { sp500, vix, yieldCurve, currentNews, newsUrl: newsFeed[newsIndex]?.link, historicalAssets };
}
