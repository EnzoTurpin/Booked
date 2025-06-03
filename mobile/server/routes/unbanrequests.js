const express = require("express");
const router = express.Router();
const UnbanRequest = require("../models/unbanrequest");
const User = require("../models/User");

// GET all unban requests
router.get("/", async (req, res) => {
  try {
    const unbanRequests = await UnbanRequest.find().populate("userId");
    res.json(unbanRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET unban requests with a specific status
router.get("/status/:status", async (req, res) => {
  try {
    const unbanRequests = await UnbanRequest.find({
      status: req.params.status,
    }).populate("userId");
    res.json(unbanRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single unban request by ID
router.get("/:id", async (req, res) => {
  try {
    const unbanRequest = await UnbanRequest.findById(req.params.id).populate(
      "userId"
    );
    if (!unbanRequest) {
      return res.status(404).json({ message: "Unban request not found" });
    }
    res.json(unbanRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all unban requests for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const unbanRequests = await UnbanRequest.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });
    res.json(unbanRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new unban request
router.post("/", async (req, res) => {
  const unbanRequest = new UnbanRequest(req.body);
  try {
    const newUnbanRequest = await unbanRequest.save();
    res.status(201).json(newUnbanRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE an unban request (e.g., to change status)
router.put("/:id", async (req, res) => {
  try {
    const updatedUnbanRequest = await UnbanRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedUnbanRequest) {
      return res.status(404).json({ message: "Unban request not found" });
    }

    // If the request is approved, unban the user
    if (req.body.status === "approved") {
      await User.findByIdAndUpdate(updatedUnbanRequest.userId, {
        isBanned: false,
      });
    }

    res.json(updatedUnbanRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an unban request
router.delete("/:id", async (req, res) => {
  try {
    const unbanRequest = await UnbanRequest.findByIdAndDelete(req.params.id);
    if (!unbanRequest) {
      return res.status(404).json({ message: "Unban request not found" });
    }
    res.json({ message: "Unban request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
