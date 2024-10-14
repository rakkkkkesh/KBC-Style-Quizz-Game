import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HostScreen from './Components/HostScreen';
import PlayerScreen from './Components/PlayerScreen';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HostScreen />} />
        <Route path="/player" element={<PlayerScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
