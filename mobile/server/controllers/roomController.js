const Room = require("../models/Room");

// Get all rooms
exports.getRooms = async (req, res) => {
  try {
    let query = {};

    // Filter by capacity if provided in query params
    if (req.query.capacity) {
      query.capacity = { $gte: parseInt(req.query.capacity) };
    }

    // Filter by availability if provided
    if (req.query.available === "true") {
      query.available = true;
    }

    // Filter by equipment if provided
    if (req.query.equipment) {
      query.equipments = { $in: [req.query.equipment] };
    }

    const rooms = await Room.find(query);
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single room
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new room
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update room
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
