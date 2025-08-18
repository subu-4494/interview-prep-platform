import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './availableslots.css';

const SlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBooked, setShowBooked] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const isLoggedIn = !!token && !!userId;

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setMessage('');

      const url = showBooked
        ? 'https://interview-prep-platform-07wl.onrender.com/api/slots/booked'
        : 'https://interview-prep-platform-07wl.onrender.com/api/slots/available';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || 'Failed to fetch slots');
        setSlots([]);
        return;
      }

      setSlots(data);
    } catch (err) {
      setMessage('Server error');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [showBooked]);

  const handleBook = async (slotId) => {
    try {
      const res = await fetch(
        `https://interview-prep-platform-07wl.onrender.com/api/slots/book/${slotId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || 'Failed to book slot');
        return;
      }

      setMessage('Slot booked successfully!');
      fetchSlots();
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;

    try {
      const res = await fetch(
        `https://interview-prep-platform-07wl.onrender.com/api/slots/cancel/${slotId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || 'Failed to delete slot');
        return;
      }

      setMessage('🗑️ Slot deleted successfully!');
      fetchSlots();
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleCreateSlot = async () => {
    const startTimeInput = prompt(
      'Enter start time (YYYY-MM-DDTHH:mm, e.g., 2025-07-09T12:00)'
    );
    const duration = prompt('Enter duration in minutes (e.g., 60)');
    const skillsInput = prompt(
      'Enter skills required (comma separated, e.g., React,Node)'
    );

    if (!startTimeInput || !duration || !skillsInput) {
      setMessage('All fields are required to create a slot.');
      return;
    }

    // ✅ Convert to UTC ISO before sending
    const startTime = new Date(startTimeInput).toISOString();
    const skills = skillsInput.split(',').map((s) => s.trim());

    try {
      const res = await fetch(
        `https://interview-prep-platform-07wl.onrender.com/api/slots/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            startTime,
            duration: parseInt(duration),
            skills
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || 'Failed to create slot');
        return;
      }

      setMessage('Slot created successfully!');
      fetchSlots();
    } catch (err) {
      setMessage('Server error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  // ✅ Always display in IST
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="slots-container">
      {isLoggedIn && (
        <button onClick={handleLogout} className="btn btn-logout-corner">
          Logout
        </button>
      )}

      <div className="controls">
        <button
          onClick={() => navigate(showBooked ? '/slots' : '/slots/booked')}
          className="btn btn-toggle"
        >
          {showBooked ? 'Show Available Slots' : 'Show My Booked Slots'}
        </button>

        {!showBooked && (
          <button onClick={handleCreateSlot} className="btn btn-create">
            Create Slot
          </button>
        )}

        <button
          onClick={() => navigate('/slots/created-and-booked')}
          className="btn btn-interviews"
        >
          Your Interviews
        </button>
      </div>

      <h2>{showBooked ? 'Booked Slots' : 'Available Slots'}</h2>

      {loading && <p>Loading...</p>}
      {message && <p className="success-message">{message}</p>}

      <ul className="slots-list">
        {slots.length === 0 && !loading && <p>No slots found.</p>}

        {slots.map((slot) => (
          <li key={slot._id} className="slot-item">
            <div>
              <strong>Start:</strong> {formatDateTime(slot.startTime)} <br />
              <strong>Duration:</strong> {slot.duration} mins <br />
              <strong>Skills:</strong> {slot.skills.join(', ')} <br />
              <strong>By:</strong> {slot.createdBy?.name || 'N/A'}
            </div>

            <div className="slot-actions">
              {!showBooked && (
                <button
                  onClick={() => handleBook(slot._id)}
                  className="btn btn-book"
                >
                  Book
                </button>
              )}

              {String(slot.createdBy?._id || slot.createdBy) === String(userId) && (
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="btn btn-delete"
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SlotsPage;
