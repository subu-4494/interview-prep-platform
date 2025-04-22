// controllers/slotController.js

const Slot = require('../models/slot');

const createSlot = async (req, res) => {
  const { date, duration, skills } = req.body;

  if (!date || !duration || !skills || skills.length === 0) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const newSlot = await Slot.create({
      createdBy: req.user._id,
      date,
      duration,
      skills,
    });
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const bookSlot = async (req, res) => {
    const { slotId } = req.params;
  
    try {
      const slot = await Slot.findById(slotId);
  
      if (!slot) return res.status(404).json({ msg: "Slot not found" });
  
      if (slot.isBooked) {
        return res.status(400).json({ msg: "Slot already booked" });
      }
  
      if (String(slot.createdBy) === String(req.user._id)) {
        return res.status(400).json({ msg: "You can't book your own slot" });
      }
  
      slot.isBooked = true;
      slot.bookedBy = req.user._id;
  
      await slot.save();
      res.status(200).json({ msg: "Slot booked successfully", slot });
    } catch (err) {
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  };

  
  const getMyBookedSlots = async (req, res) => {
    try {
      const slots = await Slot.find({ bookedBy: req.user._id }).populate('createdBy', 'name email');
      res.status(200).json(slots);
    } catch (err) {
      res.status(500).json({ msg: "Server error", error: err.message });
    }
};


const cancelSlot = async (req, res) => {
    const { slotId } = req.params;
  
    try {
      const slot = await Slot.findById(slotId);
  
      if (!slot) return res.status(404).json({ msg: "Slot not found" });
  
      if (String(slot.createdBy) !== String(req.user._id)) {
        return res.status(403).json({ msg: "Not authorized to cancel this slot" });
      }
  
      await slot.deleteOne();
      res.status(200).json({ msg: "Slot cancelled successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Server error", error: err.message });
    }
};

const getAvailableSlots = async (req, res) => {
    try {
      const skillsQuery = req.query.skills?.split(',') || [];
  
      let filter = { isBooked: false };
  
      if (skillsQuery.length > 0) {
        filter.skills = { $in: skillsQuery };
      }
  
      const slots = await Slot.find(filter).populate('createdBy', 'name email');
  
      res.status(200).json(slots);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to fetch available slots' });
    }
  };

module.exports = {createSlot,bookSlot,getMyBookedSlots,cancelSlot,getAvailableSlots};
  