import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomPage from './pages/roompage';
import AvailableSlots from './pages/availableslots';
import BookedSlots from './pages/bookedslot';
import Login from './pages/login';
import Signup from './pages/signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/slots/available" element={<AvailableSlots />} />
        <Route path="/slots/booked" element={<BookedSlots />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
