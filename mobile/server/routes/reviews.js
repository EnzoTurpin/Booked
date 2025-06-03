const express = require("express");
const router = express.Router();
const Review = require("../models/review");

// GET all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "firstName lastName profilePicture")
      .populate("professionalId");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET reviews for a specific professional
router.get("/professional/:professionalId", async (req, res) => {
  try {
    const reviews = await Review.find({
      professionalId: req.params.professionalId,
    })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a single review by ID
router.get("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("userId", "firstName lastName profilePicture")
      .populate("professionalId");
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE a new review
router.post("/", async (req, res) => {
  const review = new Review(req.body);
  try {
    const newReview = await review.save();

    // Update professional's average rating
    const professionalId = newReview.professionalId;
    const reviews = await Review.find({ professionalId });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      // Update professional's rating (requires Professional model)
      const Professional = require("../models/professional");
      await Professional.findByIdAndUpdate(professionalId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      });
    }

    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a review
router.put("/:id", async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Update professional's average rating
    const professionalId = updatedReview.professionalId;
    const reviews = await Review.find({ professionalId });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      // Update professional's rating
      const Professional = require("../models/professional");
      await Professional.findByIdAndUpdate(professionalId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      });
    }

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a review
router.delete("/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const professionalId = review.professionalId;

    // Delete the review
    await Review.findByIdAndDelete(req.params.id);

    // Update professional's average rating
    const reviews = await Review.find({ professionalId });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;

      // Update professional's rating
      const Professional = require("../models/professional");
      await Professional.findByIdAndUpdate(professionalId, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      });
    } else {
      // No reviews left, reset rating to 0
      const Professional = require("../models/professional");
      await Professional.findByIdAndUpdate(professionalId, { rating: 0 });
    }

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
