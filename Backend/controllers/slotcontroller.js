const Slot = require('../models/slot');
const { v4: uuidv4 } = require('uuid'); // 👈 to generate roomId

const createSlot = async (req, res) => {
  const { startTime, duration, skills } = req.body;

  if (!startTime || !duration || !skills || skills.length === 0) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    const conflict = await Slot.findOne({
      $or: [
        { createdBy: req.user._id },
        { bookedBy: req.user._id }
      ],
      startTime: { $lt: end },
      endTime: { $gt: start }
    });

    if (conflict) {
      return res.status(400).json({ msg: "Slot conflict detected. You already have a slot at this time." });
    }

    const newSlot = await Slot.create({
      createdBy: req.user._id,
      startTime: start,
      endTime: end,
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

    const conflict = await Slot.findOne({
      $or: [
        { createdBy: req.user._id },
        { bookedBy: req.user._id }
      ],
      startTime: { $lt: slot.endTime },
      endTime: { $gt: slot.startTime }
    });

    if (conflict) {
      return res.status(400).json({ msg: "Booking conflict: You already have a slot at this time." });
    }

    slot.isBooked = true;
    slot.bookedBy = req.user._id;
    slot.roomId = uuidv4(); // 👈 generate a unique roomId

    await slot.save();
    res.status(200).json({ msg: "Slot booked successfully", slot });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

const getMyBookedSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ bookedBy: req.user._id })
      .populate('createdBy', 'name email');

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
    const fromDate = req.query.from ? new Date(req.query.from) : null;
    const toDate = req.query.to ? new Date(req.query.to) : null;

    let filter = { isBooked: false };

    if (skillsQuery.length > 0) {
      filter.skills = { $in: skillsQuery };
    }

    if (fromDate && toDate) {
      filter.startTime = { $gte: fromDate, $lte: toDate };
    } else if (fromDate) {
      filter.startTime = { $gte: fromDate };
    } else if (toDate) {
      filter.startTime = { $lte: toDate };
    }

    const slots = await Slot.find(filter).populate('createdBy', 'name email');

    res.status(200).json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch available slots' });
  }
};


 const getCreatedAndBookedSlots = async (req, res) => {
  try {
    const userId = req.user.id;

    const slots = await Slot.find({
      createdBy: userId,
      bookedBy: { $ne: null }
    }).populate('bookedBy', 'name email');

    res.json(slots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};


module.exports = {
  createSlot,
  bookSlot,
  getMyBookedSlots,
  cancelSlot,
  getAvailableSlots,
  getCreatedAndBookedSlots
};
