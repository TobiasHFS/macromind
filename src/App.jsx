import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'

  return (
    <div className="app-container">
      {currentView === 'landing' ? (
        <LandingPage onNavigate={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard onNavigate={() => setCurrentView('landing')} />
      )}
    </div>
  );
}

export default App;
