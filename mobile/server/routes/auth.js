const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerificationCode,
  checkEmailExists,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// Routes for auth
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Routes for email verification
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);
router.post("/check-email-exists", checkEmailExists);

module.exports = router;
