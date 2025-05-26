import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "votre_clé_secrète_jwt"; // À mettre dans un .env en production

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Middleware d'authentification JWT
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Récupérer le token depuis l'en-tête de la requête
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Token d'authentification requis" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Format du token invalide" });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Ajouter les informations du token à la requête
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;
    (req as any).userRole = decoded.role;

    next();
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware pour vérifier le rôle administrateur
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).userRole !== "admin") {
    return res
      .status(403)
      .json({ message: "Accès refusé: droits administrateur requis" });
  }
  next();
};

// Middleware pour vérifier le rôle professionnel ou administrateur
export const isProfessionalOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const role = (req as any).userRole;
  if (role !== "professional" && role !== "admin") {
    return res.status(403).json({
      message: "Accès refusé: droits de professionnel ou administrateur requis",
    });
  }
  next();
};
