import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const YourInterviewsPage = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          'https://interview-prep-platform-07wl.onrender.com/api/slots/slots/created-and-booked',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.msg || 'Failed to fetch');
          return;
        }

        setSlots(data);
      } catch (err) {
        setMessage('Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [token]);

  const handleJoin = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  const canJoin = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    return now >= start;
  };

  //Format time in IST (Asia/Kolkata)
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Your Interviews (Created & Booked)</h2>

      {loading && <p>Loading...</p>}
      {message && <p style={{ color: 'red' }}>{message}</p>}

      {slots.length === 0 && !loading && <p>No interviews found.</p>}

      <ul>
        {slots.map((slot) => (
          <li
            key={slot._id}
            style={{
              marginBottom: '15px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          >
            <div>
              <strong>Start:</strong> {formatDateTime(slot.startTime)}
              <br />
              <strong>Duration:</strong> {slot.duration} mins
              <br />
              <strong>Skills:</strong> {slot.skills.join(', ')}
              <br />
              <strong>Booked By:</strong> {slot.bookedBy?.name || 'N/A'}
            </div>

            {canJoin(slot.startTime) ? (
              <button
                onClick={() => handleJoin(slot.roomId)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Join Interview
              </button>
            ) : (
              <p style={{ color: 'gray', marginTop: '10px' }}>
                Interview not started yet.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YourInterviewsPage;
