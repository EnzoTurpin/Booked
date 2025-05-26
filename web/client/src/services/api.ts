import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Interfaces de données
export interface IProfessionalUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProfessional {
  _id: string;
  userId: string;
  profession: string;
  bio: string;
  services: string[];
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    _id: string;
  }[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  rating: number;
  reviewCount: number;
  user?: IProfessionalUser;
}

export interface IService {
  _id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  professionalId: string;
  category: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  professional?: IProfessional;
}

// Service API
const api = {
  // Récupérer tous les services
  getServices: async (): Promise<IService[]> => {
    try {
      const response = await axios.get(`${API_URL}/services`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error);
      return [];
    }
  },

  // Récupérer les services avec les détails des professionnels
  getServicesWithDetails: async (): Promise<IService[]> => {
    try {
      const response = await axios.get(`${API_URL}/services/details`);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des services avec détails:",
        error
      );
      return [];
    }
  },

  // Récupérer les services par catégorie
  getServicesByCategory: async (category: string): Promise<IService[]> => {
    try {
      const response = await axios.get(
        `${API_URL}/services/category/${category}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des services de catégorie ${category}:`,
        error
      );
      return [];
    }
  },

  // Récupérer les services par professionnel
  getServicesByProfessional: async (
    professionalId: string
  ): Promise<IService[]> => {
    try {
      const response = await axios.get(
        `${API_URL}/services/professional/${professionalId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des services du professionnel ${professionalId}:`,
        error
      );
      return [];
    }
  },

  // Récupérer un service par ID
  getServiceById: async (serviceId: string): Promise<IService | null> => {
    try {
      const response = await axios.get(`${API_URL}/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du service ${serviceId}:`,
        error
      );
      return null;
    }
  },
};

export default api;
