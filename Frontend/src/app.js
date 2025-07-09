import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoomPage from './pages/roompage';
import AvailableSlots from './pages/availableslots';
import BookedSlots from './pages/bookedslot';
import Login from './pages/login';
import Signup from './pages/signup';

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/" element={<Navigate to="/signup" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/slots/available" element={<AvailableSlots />} />
        <Route path="/slots/booked" element={<BookedSlots />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
    </Router>
  );
}

export default App;
