import { Request, Response } from "express";
import Service from "../models/Service";
import Professional from "../models/Professional";
import User from "../models/User";

// Obtenir tous les services
export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ active: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Obtenir un service par ID
export const getServiceById = async (req: Request, res: Response) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Obtenir les services avec les détails du professionnel
export const getServicesWithProfessionalDetails = async (
  req: Request,
  res: Response
) => {
  try {
    // Récupérer tous les services actifs
    const services = await Service.find({ active: true });

    // Préparer un tableau pour les résultats
    const servicesWithDetails = [];

    // Pour chaque service, récupérer les détails du professionnel
    for (const service of services) {
      // Récupérer le professionnel lié au service
      const professional = await Professional.findById(service.professionalId);

      if (professional) {
        // Récupérer les informations de l'utilisateur lié au professionnel
        const user = await User.findById(professional.userId).select(
          "-password"
        );

        if (user) {
          // Ajouter le service avec les détails du professionnel et de l'utilisateur
          servicesWithDetails.push({
            ...service.toObject(),
            professional: {
              ...professional.toObject(),
              user: user.toObject(),
            },
          });
        }
      }
    }

    res.status(200).json(servicesWithDetails);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des services avec détails:",
      error
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Obtenir les services par catégorie
export const getServicesByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const services = await Service.find({ category, active: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Obtenir les services par professionnel
export const getServicesByProfessional = async (
  req: Request,
  res: Response
) => {
  try {
    const { professionalId } = req.params;
    const services = await Service.find({ professionalId, active: true });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Créer un nouveau service
export const createService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration, price, professionalId, category } =
      req.body;

    // Vérifier si le professionnel existe
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: "Professionnel non trouvé" });
    }

    const newService = new Service({
      name,
      description,
      duration,
      price,
      professionalId,
      category,
      active: true,
    });

    const savedService = await newService.save();

    // Ajouter le service à la liste des services du professionnel
    await Professional.findByIdAndUpdate(professionalId, {
      $push: { services: savedService._id },
    });

    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Mettre à jour un service
export const updateService = async (req: Request, res: Response) => {
  try {
    const { name, description, duration, price, category, active } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, duration, price, category, active },
      { new: true }
    );

    if (!updatedService) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

// Supprimer un service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const serviceId = req.params.id;

    // Récupérer le service pour obtenir le professionalId
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service non trouvé" });
    }

    // Supprimer la référence au service dans le document du professionnel
    await Professional.findByIdAndUpdate(service.professionalId, {
      $pull: { services: serviceId },
    });

    // Supprimer le service
    await Service.findByIdAndDelete(serviceId);

    res.status(200).json({ message: "Service supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
