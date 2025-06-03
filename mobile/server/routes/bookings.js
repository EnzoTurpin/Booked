const express = require("express");
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  cancelBooking,
} = require("../controllers/bookingController");

router.route("/").get(getBookings).post(createBooking);

router.route("/:id").get(getBooking).put(updateBooking).delete(deleteBooking);

router.route("/:id/cancel").put(cancelBooking);

module.exports = router;
