const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({
          success: false,
          error: "Token invalide ou manquant",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "L'utilisateur associé au token n'existe plus",
        });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Session expirée, veuillez vous reconnecter",
          expired: true,
        });
      }

      return res
        .status(401)
        .json({ success: false, error: "Non autorisé, token invalide" });
    }
  } else {
    // Si pas de token du tout, retourner une erreur immédiatement
    return res
      .status(401)
      .json({ success: false, error: "Non autorisé, pas de token" });
  }
};

// Middleware to check if user is admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, error: "Non autorisé, accès admin requis" });
  }
};
