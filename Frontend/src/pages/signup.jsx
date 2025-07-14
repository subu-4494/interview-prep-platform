import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css';

import img1 from './interview1.jpg';
import img2 from './interview2.jpg';
import img3 from './interview3.jpg';
import img4 from './interview4.jpg';
import img5 from './interview5.jpg';
import img6 from './interview6.jpg';
import img7 from './interview7.jpg';
import img8 from './interview8.jpg';
import img9 from './interview9.jpg';
import img10 from './interview10.jpg';

const images = [  img5,img6, img7, img8];

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', skills: '' });
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
   
   
    const lastIndex = parseInt(localStorage.getItem('lastImageIndex') || '0',5);
    const nextIndex = (lastIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    localStorage.setItem('lastImageIndex', nextIndex);
    
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://interview-prep-platform-07wl.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);
      localStorage.setItem('token', data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <header className="signup-header">"Sharpen your skills with prep4Sde!"</header>
      <div className="signup-main">
        <div className="signup-image">
          <img
            src={images[currentImageIndex]}
            alt="Slideshow"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '10px',
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        </div>

        <div className="signup-form-container">
          <h1 className="signup-title">prep4Sde</h1>
          <form className="signup-form" onSubmit={handleSubmit}>
            <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
            <input type="text" name="skills" placeholder="Skills (comma separated)" onChange={handleChange} required />
            {error && <p style={{ color: 'red', fontSize: '13px' }}>{error}</p>}
            <button type="submit">Sign Up</button>
          </form>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
      <footer className="signup-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
        <a href="#">About</a>
        <a href="#">Help</a>
        <a href="#">Contact</a>
        <p style={{ marginTop: '5px' }}>© {new Date().getFullYear()} prep4Sde</p>
      </footer>
    </div>
  );
};

export default Signup;
