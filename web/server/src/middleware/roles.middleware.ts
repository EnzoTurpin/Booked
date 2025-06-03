import { Request, Response, NextFunction } from "express";

// Middleware pour vérifier le rôle administrateur
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole;

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Accès refusé: droits administrateur requis",
    });
  }

  next();
};

// Middleware pour vérifier le rôle professionnel
export const isProfessional = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = (req as any).userRole;

  if (userRole !== "professional" && userRole !== "professionnal") {
    return res.status(403).json({
      success: false,
      message: "Accès refusé: droits de professionnel requis",
    });
  }

  next();
};

// Middleware pour vérifier le rôle professionnel ou administrateur
export const isProfessionalOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = (req as any).userRole;

  if (
    userRole !== "professional" &&
    userRole !== "professionnal" &&
    userRole !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      message: "Accès refusé: droits de professionnel ou administrateur requis",
    });
  }

  next();
};
