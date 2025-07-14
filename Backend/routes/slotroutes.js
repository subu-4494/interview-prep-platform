// routes/slotRoutes.js

const express = require('express');
const router = express.Router();
const {
  createSlot,
  bookSlot,
  getMyBookedSlots,
  cancelSlot,
  getAvailableSlots,
  getCreatedAndBookedSlots
} = require('../controllers/slotcontroller');
const protect = require('../middlewares/authmiddlewares');

router.post('/create', protect, createSlot);
router.post('/book/:slotId', protect, bookSlot);
router.get('/booked', protect, getMyBookedSlots);
router.delete('/cancel/:slotId', protect, cancelSlot);
router.get('/available', protect, getAvailableSlots);
router.get('/slots/created-and-booked', protect, getCreatedAndBookedSlots);

module.exports = router;
