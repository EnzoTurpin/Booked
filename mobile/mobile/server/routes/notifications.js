const express = require("express");
const router = express.Router();
const Notification = require("../models/notification");

// GET all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().populate("userId");
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET notifications for a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single notification by ID
router.get("/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new notification
router.post("/", async (req, res) => {
  const notification = new Notification(req.body);
  try {
    const newNotification = await notification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a notification (mark as read, etc.)
router.put("/:id", async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(updatedNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark all notifications as read for a user
router.put("/user/:userId/mark-read", async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.params.userId, isRead: false },
      { isRead: true }
    );
    res.json({
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a notification
router.delete("/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
