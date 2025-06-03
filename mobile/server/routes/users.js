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
const User = require("../models/User");

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

    // Accepter les deux orthographes du rôle
    if (user.role !== "professional" && user.role !== "professionnal") {
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

// Route pour mettre à jour le rôle d'un utilisateur en "professional"
router.put("/set-professional-role", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "L'email est requis",
      });
    }

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé",
      });
    }

    // Mettre à jour le rôle avec l'orthographe correcte
    user.role = "professional";
    await user.save();

    // Ajouter un log pour vérifier
    console.log(
      `Utilisateur ${user.email} mis à jour avec le rôle: ${user.role}`
    );

    res.status(200).json({
      success: true,
      message: "Rôle mis à jour avec succès",
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du rôle",
      error: error.message,
    });
  }
});

// Route pour bannir/débannir un utilisateur
router.put("/:id/ban", async (req, res) => {
  try {
    const { isBanned } = req.body;

    if (isBanned === undefined) {
      return res.status(400).json({
        success: false,
        error: "Le statut de bannissement est requis",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erreur lors du ban/déban de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour changer le rôle d'un utilisateur
router.put("/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: "Le rôle est requis",
      });
    }

    // Vérifier que le rôle est valide
    const validRoles = ["client", "professional", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error:
          "Rôle invalide. Les rôles valides sont: client, professional, admin",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Erreur lors du changement de rôle:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour activer/désactiver un utilisateur professionnel
router.put("/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;
    console.log(
      `[DEBUG] Modification du statut d'activation pour l'utilisateur ${req.params.id} à ${isActive}`
    );

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        error: "Le statut d'activation est requis",
      });
    }

    // Vérifier d'abord que l'utilisateur existe et est un professionnel
    const userCheck = await User.findById(req.params.id);
    if (!userCheck) {
      console.log(`[DEBUG] Utilisateur ${req.params.id} non trouvé`);
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    console.log(
      `[DEBUG] Utilisateur trouvé: ${userCheck.email}, valeur actuelle de isActive: ${userCheck.isActive}`
    );

    // Vérifier que l'utilisateur est un professionnel
    if (
      userCheck.role !== "professional" &&
      userCheck.role !== "professionnal"
    ) {
      console.log(
        `[DEBUG] L'utilisateur ${userCheck.email} n'est pas un professionnel (role: ${userCheck.role})`
      );
      return res.status(400).json({
        success: false,
        error:
          "Cette opération n'est valide que pour les utilisateurs professionnels",
      });
    }

    // Utiliser updateOne avec une condition pour garantir la persistance
    const result = await User.updateOne(
      { _id: req.params.id },
      { $set: { isActive: Boolean(isActive) } }
    );

    console.log(`[DEBUG] Résultat de updateOne: ${JSON.stringify(result)}`);

    // Vérifier avec une nouvelle requête que les modifications sont bien persistées
    const updatedUser = await User.findById(req.params.id);
    console.log(
      `[DEBUG] Vérification après mise à jour: isActive=${updatedUser.isActive}`
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut d'activation:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour approuver/rejeter un professionnel
router.put("/:id/approve", async (req, res) => {
  try {
    const { isApproved } = req.body;
    console.log(
      `[DEBUG] Modification du statut d'approbation pour l'utilisateur ${req.params.id} à ${isApproved}`
    );

    if (isApproved === undefined) {
      return res.status(400).json({
        success: false,
        error: "Le statut d'approbation est requis",
      });
    }

    // Vérifier d'abord que l'utilisateur existe et est un professionnel
    const userCheck = await User.findById(req.params.id);
    if (!userCheck) {
      console.log(`[DEBUG] Utilisateur ${req.params.id} non trouvé`);
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    console.log(
      `[DEBUG] Utilisateur trouvé: ${userCheck.email}, valeur actuelle de isApproved: ${userCheck.isApproved}`
    );

    // Vérifier que l'utilisateur est un professionnel
    if (
      userCheck.role !== "professional" &&
      userCheck.role !== "professionnal"
    ) {
      console.log(
        `[DEBUG] L'utilisateur ${userCheck.email} n'est pas un professionnel (role: ${userCheck.role})`
      );
      return res.status(400).json({
        success: false,
        error:
          "Cette opération n'est valide que pour les utilisateurs professionnels",
      });
    }

    // Utiliser updateOne avec une condition pour garantir la persistance
    const result = await User.updateOne(
      { _id: req.params.id },
      { $set: { isApproved: Boolean(isApproved) } }
    );

    console.log(`[DEBUG] Résultat de updateOne: ${JSON.stringify(result)}`);

    // Vérifier avec une nouvelle requête que les modifications sont bien persistées
    const updatedUser = await User.findById(req.params.id);
    console.log(
      `[DEBUG] Vérification après mise à jour: isApproved=${updatedUser.isApproved}`
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Erreur lors du changement de statut d'approbation:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour qu'un utilisateur puisse demander un déban
router.post("/:id/unban-request", async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: "Une raison pour la demande de déban est requise",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier que l'utilisateur est bien banni
    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        error: "L'utilisateur n'est pas banni",
      });
    }

    // Mettre à jour les informations de demande de déban dans l'utilisateur
    user.hasUnbanRequest = true;
    user.unbanRequestDate = new Date();

    await user.save();

    // Créer une entrée dans la table UnbanRequest
    const UnbanRequest = require("../models/unbanrequest");
    const newUnbanRequest = new UnbanRequest({
      userId: user._id,
      reason: reason,
      status: "pending",
    });

    await newUnbanRequest.save();
    console.log(
      "Nouvelle demande de déban créée dans la table UnbanRequest:",
      newUnbanRequest
    );

    res.json({
      success: true,
      message: "Demande de déban soumise avec succès",
      data: {
        _id: user._id,
        hasUnbanRequest: user.hasUnbanRequest,
        unbanRequestDate: user.unbanRequestDate,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la demande de déban:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour obtenir toutes les demandes de déban en attente
router.get("/unban-requests", async (req, res) => {
  try {
    const UnbanRequest = require("../models/unbanrequest");

    // Récupérer les demandes de déban depuis la collection unbanrequests
    const unbanRequests = await UnbanRequest.find({ status: "pending" })
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Formater les données pour qu'elles correspondent au format attendu par le frontend
    const formattedRequests = unbanRequests.map((request) => ({
      _id: request.userId._id,
      firstName: request.userId.firstName,
      lastName: request.userId.lastName,
      email: request.userId.email,
      unbanRequestReason: request.reason,
      unbanRequestDate: request.createdAt,
    }));

    res.json({
      success: true,
      data: formattedRequests,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des demandes de déban:",
      error
    );
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour approuver ou rejeter une demande de déban
router.put("/:id/unban-request", async (req, res) => {
  try {
    const { approve } = req.body;

    if (approve === undefined) {
      return res.status(400).json({
        success: false,
        error: "La décision d'approbation est requise",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier l'existence d'une demande de déban dans la collection unbanrequests
    const UnbanRequest = require("../models/unbanrequest");
    const unbanRequest = await UnbanRequest.findOne({
      userId: user._id,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (!unbanRequest) {
      return res.status(400).json({
        success: false,
        error: "L'utilisateur n'a pas de demande de déban en cours",
      });
    }

    if (approve) {
      // Débannir l'utilisateur
      user.isBanned = false;
    }

    // Dans tous les cas, réinitialiser les informations de demande de déban
    user.hasUnbanRequest = false;
    user.unbanRequestDate = null;

    await user.save();

    // Mettre à jour le statut dans la table UnbanRequest
    unbanRequest.status = approve ? "approved" : "rejected";
    unbanRequest.reviewedAt = new Date();
    await unbanRequest.save();
    console.log(
      "Demande de déban mise à jour dans la table UnbanRequest:",
      unbanRequest
    );

    res.json({
      success: true,
      message: approve
        ? "Demande de déban approuvée avec succès"
        : "Demande de déban rejetée",
      data: user,
    });
  } catch (error) {
    console.error("Erreur lors du traitement de la demande de déban:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

// Route pour qu'un utilisateur puisse demander un déban via son email
router.post("/unban-request-by-email", async (req, res) => {
  try {
    const { email, reason } = req.body;

    if (!email || !reason) {
      return res.status(400).json({
        success: false,
        error: "L'email et la raison pour la demande de déban sont requis",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Utilisateur non trouvé",
      });
    }

    // Vérifier que l'utilisateur est bien banni
    if (!user.isBanned) {
      return res.status(400).json({
        success: false,
        error: "L'utilisateur n'est pas banni",
      });
    }

    // Mettre à jour les informations de demande de déban dans l'utilisateur
    user.hasUnbanRequest = true;
    user.unbanRequestDate = new Date();

    await user.save();

    // Créer une entrée dans la table UnbanRequest
    const UnbanRequest = require("../models/unbanrequest");
    const newUnbanRequest = new UnbanRequest({
      userId: user._id,
      reason: reason,
      status: "pending",
    });

    await newUnbanRequest.save();
    console.log(
      "Nouvelle demande de déban créée dans la table UnbanRequest:",
      newUnbanRequest
    );

    res.json({
      success: true,
      message: "Demande de déban soumise avec succès",
      data: {
        _id: user._id,
        hasUnbanRequest: user.hasUnbanRequest,
        unbanRequestDate: user.unbanRequestDate,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la demande de déban par email:", error);
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
});

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
