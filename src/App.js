import React from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import ConfigPage from './pages/ConfigPage';
import ScoreboardPage from './pages/ScoreboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ConfigPage />} />
        <Route path="/display" element={<ScoreboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
