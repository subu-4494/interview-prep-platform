// this is just a routes path when a api is called it just shows in which file your api was there 


//  What happens when a request comes in:
// You hit POST http://localhost:5000/api/auth/register using Postman or frontend.

// It goes to server.js, which sees:
// app.use('/api/auth', authRoutes);
// This sends the request to authRoutes.js, which maps /register to registerUser in authControllers.js.

// Your logic runs, and sends back a response to the client.


const express = require('express');
const router = express.Router();
const { signup, login,logout } = require('../controllers/authcontrollers');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
