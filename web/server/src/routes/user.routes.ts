import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerificationCode,
  getAllUsers,
  banUser,
  unbanUser,
  adminUpdateUser,
  getProfessionals,
} from "../controllers/user.controller";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware";
import { changePassword } from "../controllers/auth.controller";
import { profileImageUpload } from "../middleware/upload.middleware";

const router = express.Router();

// Admin routes
// GET /api/users/admin - Get all users (admin only)
router.get("/admin", authenticateJWT, isAdmin, getAllUsers);

// POST /api/users/:id/ban - Ban a user (admin only)
router.post("/:id/ban", authenticateJWT, isAdmin, banUser);

// POST /api/users/:id/unban - Unban a user (admin only)
router.post("/:id/unban", authenticateJWT, isAdmin, unbanUser);

// PUT /api/users/admin/:id - Update user by admin (admin only)
router.put("/admin/:id", authenticateJWT, isAdmin, adminUpdateUser);

// Regular routes
// GET /api/users - Get all users
router.get("/", getUsers);

// Route pour récupérer tous les professionnels
router.get("/professionals", authenticateJWT, getProfessionals);

// GET /api/users/:id - Get user by ID
router.get("/:id", getUserById);

// POST /api/users - Create new user
router.post("/", createUser);

// PUT /api/users/:id - Update user (authenticated users only)
router.put("/:id", authenticateJWT, profileImageUpload, updateUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", authenticateJWT, isAdmin, deleteUser);

// POST /api/users/verify-email - Verify email
router.post("/verify-email", verifyEmail);

// POST /api/users/resend-verification - Resend verification code
router.post("/resend-verification", resendVerificationCode);

// POST /api/users/change-password - Change password (authenticated users only)
router.post("/change-password", authenticateJWT, changePassword);

export default router;
