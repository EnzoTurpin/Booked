import { Request, Response } from "express";
import { UnbanRequest, User } from "../models";

// Créer une nouvelle demande de débanissement
export const createUnbanRequest = async (req: Request, res: Response) => {
  try {
    const { message, email } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Le message est requis" });
    }

    if (!email) {
      return res.status(400).json({ message: "L'email est requis" });
    }

    // Vérifier si l'utilisateur existe et est banni
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (!user.isBanned) {
      return res.status(400).json({
        message: "Seuls les utilisateurs bannis peuvent soumettre une demande",
      });
    }

    // Vérifier si l'utilisateur a déjà une demande en attente
    const existingRequest = await UnbanRequest.findOne({
      userId: user._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "Vous avez déjà une demande de débanissement en attente",
      });
    }

    // Créer une nouvelle demande
    const newRequest = new UnbanRequest({
      userId: user._id,
      message,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Votre demande a été envoyée avec succès",
      request: newRequest,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la demande:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Récupérer toutes les demandes (admin uniquement)
export const getAllUnbanRequests = async (req: Request, res: Response) => {
  try {
    const requests = await UnbanRequest.find().populate("userId", "-password");

    // Transformation pour le frontend
    const formattedRequests = requests.map((request) => ({
      _id: request._id,
      userId: request.userId ? request.userId._id : null,
      message: request.message,
      status: request.status,
      createdAt: request.createdAt,
      user: request.userId || null,
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Approuver une demande (admin uniquement)
export const approveUnbanRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(
      "🔄 [approveUnbanRequest] Starting approval process for request:",
      id
    );

    const request = await UnbanRequest.findById(id);
    console.log(
      "📝 [approveUnbanRequest] Found request:",
      request ? "yes" : "no"
    );

    if (!request) {
      console.log("❌ [approveUnbanRequest] Request not found");
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    console.log(
      "📝 [approveUnbanRequest] Current request status:",
      request.status
    );
    if (request.status !== "pending") {
      console.log("❌ [approveUnbanRequest] Request already processed");
      return res.status(400).json({
        message: "Cette demande a déjà été traitée",
      });
    }

    // Mettre à jour le statut de la demande en préservant le message
    await UnbanRequest.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    console.log("✅ [approveUnbanRequest] Request status updated to approved");

    // Débannir l'utilisateur
    const userId = request.getUserIdString();
    console.log("🔄 [approveUnbanRequest] Looking for user with ID:", userId);

    const user = await User.findById(userId);
    console.log("📝 [approveUnbanRequest] Found user:", user ? "yes" : "no");

    if (!user) {
      console.log("❌ [approveUnbanRequest] User not found");
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log(
      "📝 [approveUnbanRequest] Current user ban status:",
      user.isBanned
    );
    user.isBanned = false;
    await user.save();
    console.log("✅ [approveUnbanRequest] User successfully unbanned");

    res.status(200).json({
      message: "La demande a été approuvée et l'utilisateur a été débanni",
    });
  } catch (error) {
    console.error("❌ [approveUnbanRequest] Detailed error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      error,
    });
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Rejeter une demande (admin uniquement)
export const rejectUnbanRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const request = await UnbanRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Cette demande a déjà été traitée",
      });
    }

    // Mettre à jour le statut de la demande
    request.status = "rejected";
    await request.save();

    res.status(200).json({
      message: "La demande a été rejetée",
    });
  } catch (error) {
    console.error("Erreur lors du rejet de la demande:", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
