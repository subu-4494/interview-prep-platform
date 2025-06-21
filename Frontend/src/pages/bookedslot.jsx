import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BookedSlots = () => {
  const [slots, setSlots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/slots/booked', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.msg || "Failed to fetch slots");
        }

        setSlots(data);
      } catch (err) {
        console.error("Error fetching booked slots:", err.message);
        setSlots([]); // Prevent crashing on .map
      }
    };

    fetchSlots();
  }, []);

  const handleJoin = (slotId) => {
    navigate(`/room/${slotId}`);
  };

  return (
    <div>
      <h2>Your Booked Slots</h2>
      {slots.length === 0 ? (
        <p>No slots booked yet.</p>
      ) : (
        <ul>
          {slots.map((slot) => (
            <li key={slot._id} style={{ marginBottom: '20px' }}>
              <strong>Start:</strong> {new Date(slot.startTime).toLocaleString()} <br />
              <strong>With:</strong> {slot.createdBy?.name || 'Peer'} <br />
              <strong>Skills:</strong> {slot.skills.join(', ')} <br />
              <button onClick={() => handleJoin(slot._id)}>Join Call</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BookedSlots;
