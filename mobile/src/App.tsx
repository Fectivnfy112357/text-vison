import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Generate from './pages/Generate';
import Templates from './pages/Templates';
import History from './pages/History';
import Login from './pages/Login';
import BottomNavigation from './components/BottomNavigation';

function App() {
  return (
    <Router>
      <div className="app min-h-screen bg-gray-50 pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Home />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
