import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerificationCode,
} from "../controllers/user.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { changePassword } from "../controllers/auth.controller";
import { profileImageUpload } from "../middleware/upload.middleware";

const router = express.Router();

// GET /api/users - Get all users
router.get("/", getUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById);

// POST /api/users - Create new user
router.post("/", createUser);

// PUT /api/users/:id - Update user (authenticated users only)
router.put("/:id", authenticateJWT, profileImageUpload, updateUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", deleteUser);

// POST /api/users/verify-email - Verify email
router.post("/verify-email", verifyEmail);

// POST /api/users/resend-verification - Resend verification code
router.post("/resend-verification", resendVerificationCode);

// POST /api/users/change-password - Change password (authenticated users only)
router.post("/change-password", authenticateJWT, changePassword);

export default router;
