const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require('./routes/authroutes');
const userRoutes = require('./routes/userroutes');
const slotRoutes = require('./routes/slotroutes');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection (do NOT listen here)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error(' MongoDB connection failed:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/slots', slotRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Mock Interview Platform Backend Running');
});

module.exports = app;
