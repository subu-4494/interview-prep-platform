import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomPage from './pages/roompage';
import BookedSlots from './pages/bookedslot';
import Login from './pages/login';
import Signup from './pages/signup';
// import other pages...

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/booked" element={<BookedSlots />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/signup" element={<Signup />} />
        {/* other routes */}
      </Routes>
    </Router>
  );
}

export default App;
