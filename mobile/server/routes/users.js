const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/user");

router.route("/").get(getUsers).post(createUser);

router.route("/profile").put(protect, updateProfile);

// Récupérer l'ID professionnel de l'utilisateur connecté
router.get("/professional", protect, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est un professionnel
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    if (user.role !== "professional") {
      return res.status(403).json({
        success: false,
        error: "L'utilisateur n'est pas un professionnel",
      });
    }

    // Pour notre système simplifié, nous utilisons directement l'ID de l'utilisateur
    // comme ID du professionnel (plus besoin d'une table professionnels séparée)

    res.json({
      success: true,
      professionalId: user._id,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'ID professionnel:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// GET all professional users
router.get("/", async (req, res) => {
  try {
    let query = {};

    // Si le paramètre role est spécifié dans la requête
    if (req.query.role) {
      query.role = req.query.role;
    }

    const users = await User.find(query).select(
      "_id firstName lastName email role phone"
    );

    // Assurer une réponse cohérente
    res.json(users); // Renvoyer directement le tableau
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des utilisateurs",
    });
  }
});

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
