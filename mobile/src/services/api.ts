import axios, { InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import { Platform } from "react-native";

console.log("API_URL configurée:", API_URL); // Log pour déboguer l'URL

// Définir une constante pour l'URL de base de l'API
// En développement, on utilise l'adresse IP locale pour se connecter au serveur backend
// Dans un environnement de production, on utiliserait l'URL réelle du serveur
// const API_URL = "http://10.0.2.2:5000/api"; // Utiliser 10.0.2.2 pour Android Emulator ou l'IP locale de votre machine

const api = axios.create({
  baseURL: API_URL, // Utiliser directement l'URL de l'environnement
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Augmentation du timeout à 30 secondes
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (config.baseURL && config.url) {
      console.log("Requête envoyée à:", `${config.baseURL}${config.url}`);
    }
    try {
      const token = await AsyncStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Erreur lors de la configuration de la requête:", error);
      return config;
    }
  },
  (error) => {
    console.error("Erreur lors de l'envoi de la requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => {
    console.log("Réponse reçue:", response.status);
    return response;
  },
  async (error) => {
    if (error.code === "ECONNABORTED") {
      console.error(
        "La requête a expiré. Vérifiez votre connexion internet et réessayez."
      );
    } else if (!error.response) {
      console.error("Erreur réseau. Détails:", {
        message: error.message,
        code: error.code,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        platform: Platform.OS,
        apiUrl: API_URL,
      });
    } else if (error.response?.status === 401) {
      // Nettoyage complet en cas d'erreur d'authentification
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("needsEmailVerification");
      await AsyncStorage.removeItem("pendingVerificationEmail");
      await AsyncStorage.removeItem("justRegistered");
      console.error("Session expirée. Veuillez vous reconnecter.");

      // Force un rechargement complet de l'application
      if (
        error.config.url !== "/auth/login" &&
        error.config.url !== "/auth/register"
      ) {
        // On ne réinitialise pas si on est en train de se connecter ou de s'inscrire
        setTimeout(() => {
          // Reload app logic - can be handled by navigation in real application
          console.log(
            "Forcer le rechargement de l'application après déconnexion"
          );
        }, 100);
      }
    } else if (
      error.response?.status === 403 &&
      error.response.data?.isBanned
    ) {
      console.error("Utilisateur banni");
    }

    return Promise.reject(error);
  }
);

// Interfaces
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
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    phone: string;
  };
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

export interface IAppointment {
  _id: string;
  userId: string;
  professionalId: string;
  serviceId: string;
  date: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
  service?: IService;
  professional?: IProfessional;
}

// Interfaces pour les professionnels
export interface IAvailabilitySlot {
  _id: string;
  time: string;
  available: boolean;
}

export interface IAvailability {
  _id: string;
  professionalId: string;
  date: string;
  slots: IAvailabilitySlot[];
}

export interface IProfessionalAppointment {
  _id: string;
  date: string;
  time: string;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  service?: {
    _id: string;
    name: string;
    price: number;
  };
}

// API functions
const apiService = {
  // Test de connexion à l'API
  testConnection: async () => {
    try {
      const response = await api.get("/test");
      console.log("API connectée avec succès:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur de connexion à l'API:", error);
      throw error;
    }
  },

  // Méthodes génériques
  get: async (endpoint: string) => {
    try {
      const response = await api.get(endpoint);
      return response;
    } catch (error) {
      console.error(`GET request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  post: async (endpoint: string, data: any) => {
    try {
      const response = await api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`POST request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  put: async (endpoint: string, data: any) => {
    try {
      const response = await api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error(`PUT request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  patch: async (endpoint: string, data: any) => {
    try {
      return await api.patch(endpoint, data);
    } catch (error) {
      console.error(`PATCH request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  delete: async (endpoint: string) => {
    try {
      const response = await api.delete(endpoint);
      return response;
    } catch (error) {
      console.error(`DELETE request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  // Services
  getServices: async (): Promise<IService[]> => {
    try {
      const response = await api.get("/services");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des services:", error);
      return [];
    }
  },

  getServicesWithDetails: async (): Promise<IService[]> => {
    try {
      const response = await api.get("/services/details");
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des services avec détails:",
        error
      );
      return [];
    }
  },

  getServicesByCategory: async (category: string): Promise<IService[]> => {
    try {
      const response = await api.get(`/services/category/${category}`);
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des services de catégorie ${category}:`,
        error
      );
      return [];
    }
  },

  getServicesByProfessional: async (
    professionalId: string
  ): Promise<IService[]> => {
    try {
      const response = await api.get(
        `/services/professional/${professionalId}`
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

  getServiceById: async (serviceId: string): Promise<IService | null> => {
    try {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du service ${serviceId}:`,
        error
      );
      return null;
    }
  },

  // Rendez-vous
  getUserAppointments: async (): Promise<IAppointment[]> => {
    try {
      const response = await api.get("/appointments/user");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des rendez-vous:", error);
      return [];
    }
  },

  createAppointment: async (appointmentData: {
    serviceId: string;
    professionalId: string;
    date: Date;
    notes?: string;
  }): Promise<IAppointment | null> => {
    try {
      const response = await api.post("/appointments", appointmentData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      return null;
    }
  },

  cancelAppointment: async (appointmentId: string): Promise<boolean> => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, {
        status: "cancelled",
      });
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de l'annulation du rendez-vous ${appointmentId}:`,
        error
      );
      return false;
    }
  },

  // Profil utilisateur
  updateUserProfile: async (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }): Promise<any> => {
    try {
      const response = await api.put("/users/profile", userData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<boolean> => {
    try {
      await api.put("/users/password", passwordData);
      return true;
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      throw error;
    }
  },
};

export default apiService;
