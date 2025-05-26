import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Récupérer l'URL de l'API depuis les variables d'environnement
console.log("URL de l'API:", API_URL);

// Créer une instance axios configurée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour afficher les requêtes et réponses (débogage)
api.interceptors.request.use(
  (config) => {
    console.log(
      "Requête API:",
      config.method.toUpperCase(),
      config.url,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("Erreur de requête API:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log("Réponse API:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error(
      "Erreur de réponse API:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// Services pour les salles
export const roomService = {
  // Récupérer toutes les salles
  getAllRooms: async () => {
    try {
      const response = await api.get("/rooms");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  // Récupérer une salle par ID
  getRoomById: async (id) => {
    try {
      const response = await api.get(`/rooms/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching room ${id}:`, error);
      throw error;
    }
  },
};

// Services pour les réservations
export const bookingService = {
  // Récupérer toutes les réservations
  getAllBookings: async () => {
    try {
      const response = await api.get("/bookings");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw error;
    }
  },

  // Créer une nouvelle réservation
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/bookings", bookingData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

  // Annuler une réservation
  cancelBooking: async (id) => {
    try {
      const response = await api.put(`/bookings/${id}/cancel`);
      return response.data.data;
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw error;
    }
  },
};

// Services pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs
  getAllUsers: async () => {
    try {
      const response = await api.get("/users");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },
};

// Exporter l'instance API directement pour les appels dans AuthContext
export default api;
