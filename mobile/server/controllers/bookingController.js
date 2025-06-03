const Booking = require("../models/Booking");
const Room = require("../models/Room");

// Get all bookings
exports.getBookings = async (req, res) => {
  try {
    let query = {};

    // Filter by user if provided in query params
    if (req.query.user) {
      query.user = req.query.user;
    }

    // Filter by room if provided
    if (req.query.room) {
      query.room = req.query.room;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.startTime = { $gte: new Date(req.query.startDate) };
      query.endTime = { $lte: new Date(req.query.endDate) };
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email")
      .populate("room", "name location");

    res
      .status(200)
      .json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single booking
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("room", "name location");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    // Check for room availability during the requested time slot
    const { room, startTime, endTime } = req.body;

    // Parse dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if room exists
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    // Check if room is available
    if (!roomExists.available) {
      return res
        .status(400)
        .json({ success: false, error: "Room is not available for booking" });
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.find({
      room,
      status: { $ne: "cancelled" },
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (overlappingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Room is already booked during this time slot",
      });
    }

    // Create booking
    const booking = await Booking.create(req.body);

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update booking
exports.updateBooking = async (req, res) => {
  try {
    // If updating time, check for availability
    if (req.body.startTime && req.body.endTime) {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, error: "Booking not found" });
      }

      const start = new Date(req.body.startTime);
      const end = new Date(req.body.endTime);
      const roomId = req.body.room || booking.room;

      // Check for overlapping bookings (excluding this booking)
      const overlappingBookings = await Booking.find({
        _id: { $ne: req.params.id },
        room: roomId,
        status: { $ne: "cancelled" },
        $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
      });

      if (overlappingBookings.length > 0) {
        return res.status(400).json({
          success: false,
          error: "Room is already booked during this time slot",
        });
      }
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Cancel booking (update status to cancelled)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, error: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
