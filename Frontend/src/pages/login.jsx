import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

import img1 from './interview1.jpg';
import img2 from './interview2.jpg';
import img3 from './interview10.jpg';
import img4 from './interview3.jpg';

const images = [img1, img2, img3, img4];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Sequential slideshow logic
    const lastIndex = parseInt(localStorage.getItem('loginLastImageIndex') || '0', 10);
    const nextIndex = (lastIndex + 1) % images.length;
    setCurrentImageIndex(nextIndex);
    localStorage.setItem('loginLastImageIndex', nextIndex);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    try {
      const res = await fetch('https://interview-prep-platform-07wl.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || 'Login failed');
        return;
      }

      if (!data.token || !data.user) {
        setError('Invalid server response');
        return;
      }

      //  Save both token & userId
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id ||data.user.id);
     


     navigate('/slots/available');
    } catch (err) {
      console.error(err);
      setError('Server error');
    }
  };

  return (
    <div className="login-container">
      <header className="login-header">
        Start your journey with <b>prep4Sde! ✨</b>
      </header>

      <div className="login-main">
        <div className="login-image">
          <img
            src={images[currentImageIndex]}
            alt="Slideshow"
            style={{
              width: '90%',
              height: 'auto',
              borderRadius: '10px',
              transition: 'opacity 0.5s ease-in-out'
            }}
          />
        </div>

        <div className="login-form-container">
          <h1 className="login-title">prep4Sde</h1>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p style={{ color: 'red', fontSize: '13px', marginTop: '5px' }}>
                {error}
              </p>
            )}

            <button type="submit">Login</button>
          </form>

          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            Don&apos;t have an account? <a href="/signup">Sign Up</a>
          </p>
        </div>
      </div>

      <footer className="login-footer">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
        <a href="#">About</a>
        <a href="#">Help</a>
        <a href="#">Contact</a>
        <p style={{ marginTop: '5px' }}>
          © {new Date().getFullYear()} prep4Sde
        </p>
      </footer>
    </div>
  );
};

export default Login;
