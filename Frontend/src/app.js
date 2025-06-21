import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomPage from './pages/roompage';
// import other pages...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/room/:roomId" element={<RoomPage />} />
        {/* other routes */}
      </Routes>
    </Router>
  );
}

export default App;
