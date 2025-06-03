import "react-native-get-random-values"; // Nécessaire pour BSON
import axios from "axios";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Type générique pour les documents MongoDB
interface MongoDocument {
  _id: string;
  [key: string]: any;
}

// Créer un client axios pour l'API
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter un intercepteur pour inclure le token d'authentification dans les requêtes
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error("Erreur lors de l'ajout du token:", error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Service pour MongoDB
const mongodbService = {
  // Récupérer tous les documents d'une collection
  findAll: async <T extends MongoDocument>(
    collectionName: string
  ): Promise<T[]> => {
    try {
      const response = await apiClient.get(`/services`);
      return response.data as T[];
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des documents de ${collectionName}:`,
        error
      );
      return [];
    }
  },

  // Récupérer un document par son ID
  findById: async <T extends MongoDocument>(
    collectionName: string,
    id: string
  ): Promise<T | null> => {
    try {
      const response = await apiClient.get(`/services/${id}`);
      return response.data as T;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du document ${id} de ${collectionName}:`,
        error
      );
      return null;
    }
  },

  // Récupérer des documents avec un filtre
  find: async <T extends MongoDocument>(
    collectionName: string,
    filter: any
  ): Promise<T[]> => {
    try {
      // Si on cherche des rendez-vous par userId
      if (collectionName === "appointments" && filter.userId) {
        const response = await apiClient.get(
          `/appointments/user/${filter.userId}`
        );
        return response.data as T[];
      }

      // Si on cherche des services par catégorie (cas existant)
      if (filter.category) {
        const response = await apiClient.get(
          `/services/category/${filter.category}`
        );
        return response.data as T[];
      }

      // Cas générique
      const response = await apiClient.get(`/${collectionName}`, {
        params: filter,
      });
      return response.data as T[];
    } catch (error) {
      console.error(
        `Erreur lors de la recherche dans ${collectionName}:`,
        error
      );
      return [];
    }
  },

  // Insérer un nouveau document
  insertOne: async <T extends Omit<MongoDocument, "_id">>(
    collectionName: string,
    document: T
  ): Promise<string | null> => {
    try {
      const response = await apiClient.post(`/${collectionName}`, document);
      return response.data.insertedId;
    } catch (error) {
      console.error(
        `Erreur lors de l'insertion dans ${collectionName}:`,
        error
      );
      return null;
    }
  },

  // Mettre à jour un document
  updateOne: async (
    collectionName: string,
    id: string,
    update: object
  ): Promise<boolean> => {
    try {
      // Cas spécial pour l'annulation de rendez-vous
      if (
        collectionName === "appointments" &&
        update &&
        (update as any).status === "cancelled"
      ) {
        console.log(`Annulation du rendez-vous ${id}`);
        const response = await apiClient.put(`/appointments/${id}`, update);
        return response.status === 200;
      }

      // Cas générique
      const response = await apiClient.put(`/${collectionName}/${id}`, update);
      return (
        response.data &&
        (response.data.modifiedCount > 0 || response.status === 200)
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour dans ${collectionName}:`,
        error
      );
      return false;
    }
  },

  // Supprimer un document
  deleteOne: async (collectionName: string, id: string): Promise<boolean> => {
    try {
      const response = await apiClient.delete(`/${collectionName}/${id}`);
      return response.data.deletedCount > 0;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression dans ${collectionName}:`,
        error
      );
      return false;
    }
  },
};

export default mongodbService;
